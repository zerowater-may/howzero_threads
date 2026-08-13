import { NextResponse } from "next/server"
import { z } from "zod"
import { resolveProduct } from "@/lib/products"
import { sendBill } from "@/lib/paymint/client"
import { decodeBillId, sanitizePhone } from "@/lib/paymint/hash"
import { registerPendingBill } from "@/lib/bill-registry"
import { validateApplication, type ApplicationAnswers } from "@/lib/application-form"
import { saveApplication } from "@/lib/application-registry"

export const runtime = "nodejs"

const SendBillSchema = z.object({
  memberName: z.string().trim().min(2, "이름을 입력해주세요.").max(30, "이름은 30자 이하로 입력해주세요."),
  phoneNumber: z.string().trim().min(10, "연락처를 입력해주세요.").max(20, "연락처가 너무 깁니다."),
  productKey: z.string().trim().optional(), // 미지정 시 기존 강의(course)로 fallback
  /** 결제 전 신청서 응답 — course 상품에서만 필수 (815 특강은 신청서를 받지 않는다) */
  application: z.record(z.union([z.string(), z.array(z.string())])).optional(),
})

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

export async function POST(request: Request) {
  try {
    const body = SendBillSchema.parse(await request.json())
    const phoneNumber = sanitizePhone(body.phoneNumber)

    if (!/^01[0-9]{8,9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: "휴대폰 번호를 01012345678 형식으로 입력해주세요." },
        { status: 400 },
      )
    }

    const product = resolveProduct(body.productKey)

    /**
     * 신청서 관문 (2026-08-13) — course 결제는 신청서를 통과해야만 청구서가 발행된다.
     * 클라이언트 폼은 우회할 수 있으므로 여기가 진짜 관문이다.
     * 검증은 발행 **전에** 한다 — 실패한 신청으로 청구서가 나가면 안 된다.
     */
    if (product.key === "course") {
      const invalid = validateApplication(body.application)
      if (invalid) {
        return NextResponse.json({ success: false, error: invalid }, { status: 400 })
      }
      // 저장은 발행 전에. 청구서 발행이 실패해도 신청서는 남아야 후속 연락이 된다.
      // 저장 실패는 결제를 막지 않는다(응답 전문은 registry가 로그로 남긴다).
      await saveApplication(phoneNumber, body.memberName, body.application as ApplicationAnswers)
    }

    const result = await sendBill({
      memberName: body.memberName,
      phoneNumber,
      amount: product.amount,
      productName: product.name,
      message: `${product.name} 결제 청구서입니다. 신청서·결제정보는 동일한 이름·연락처로 작성해 주세요.`,
      sendType: "URL",
    })
    const data = result.data || {}
    const billId = readString(data.billId) || readString(result.billId) || readString(result.bill_id)

    // 통관 특강 청구서만 리컨사일 레지스트리에 등록 (course는 등록 안 함 — 문자 대상 아님)
    // await 필수 — 서버리스는 응답 후 미완 Promise를 죽인다 (fire-and-forget 유실 확인됨)
    if (billId && result.code === "0000" && !result.dryRun && decodeBillId(billId)?.isTonggwan) {
      await registerPendingBill(billId, phoneNumber)
    }
    const shortUrl = readString(data.shortUrl) || readString(result.shortUrl) || readString(result.shortURL)
    const deliveryType = readString(data.deliveryType) || readString(result.deliveryType) || (shortUrl ? "URL" : "TALK")
    const fallbackReason = readString(data.fallbackReason) || readString(result.fallbackReason)
    const message = result.message || result.msg

    return NextResponse.json({
      success: result.code === "0000",
      data: {
        billId,
        shortUrl,
        code: result.code,
        message,
        deliveryType,
        fallbackReason,
        dryRun: Boolean(result.dryRun),
        amount: product.amount,
        productKey: product.key,
      },
      error: result.code === "0000" ? undefined : message,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || "입력값을 확인해주세요." }, { status: 400 })
    }

    // JSON 파싱 실패(깨진 요청 body) → 클라이언트 잘못이므로 400
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: "요청 형식이 올바르지 않습니다. 새로고침 후 다시 시도해 주세요." }, { status: 400 })
    }

    // 결제선생 API·네트워크 등 서버 측 오류.
    // 원본 error.message에는 내부 URL·스택 위치가 섞여 나올 수 있어 사용자에겐 고정 문구만 준다.
    // 진짜 원인은 서버 로그에만 남긴다.
    console.error("[paymint.send-bill] error:", error)
    return NextResponse.json(
      { success: false, error: "결제 청구서 발송 중 문제가 생겼습니다. 잠시 후 다시 시도하거나 1:1 카톡으로 문의해 주세요." },
      { status: 500 },
    )
  }
}
