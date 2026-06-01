import { NextResponse } from "next/server"
import { z } from "zod"
import { course } from "@/lib/config"
import { sendBill } from "@/lib/paymint/client"
import { sanitizePhone } from "@/lib/paymint/hash"

export const runtime = "nodejs"

const SendBillSchema = z.object({
  memberName: z.string().trim().min(2, "이름을 입력해주세요.").max(30, "이름은 30자 이하로 입력해주세요."),
  phoneNumber: z.string().trim().min(10, "연락처를 입력해주세요.").max(20, "연락처가 너무 깁니다."),
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

    const productName = `용감한용팀장 AI셀링 실전반 오프라인 ${course.cohort}`
    const result = await sendBill({
      memberName: body.memberName,
      phoneNumber,
      amount: course.priceFirst,
      productName,
      message: `${productName} 결제 청구서입니다. 신청서·결제정보는 동일한 이름·연락처로 작성해 주세요.`,
      sendType: "URL",
    })
    const data = result.data || {}
    const billId = readString(data.billId) || readString(result.billId) || readString(result.bill_id)
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
        amount: course.priceFirst,
      },
      error: result.code === "0000" ? undefined : message,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || "입력값을 확인해주세요." }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "청구서 발송 중 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}
