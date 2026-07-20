import { NextResponse } from "next/server"
import { z } from "zod"
import { readBill } from "@/lib/paymint/client"

export const runtime = "nodejs"

const ReadBillSchema = z.object({
  billId: z.string().trim().min(1, "billId가 필요합니다.").max(30, "billId가 너무 깁니다."),
})

export async function POST(request: Request) {
  try {
    const body = ReadBillSchema.parse(await request.json())
    const result = await readBill({ billId: body.billId })

    // V1(legacy) read 응답은 code 없이 bill 객체를 그대로 반환한다 — appr_state 존재 = 조회 성공
    const raw = result as Record<string, unknown>
    const isLegacyBill = "appr_state" in raw || "bill_id" in raw
    const success = result.code === "0000" || Boolean(result.dryRun) || isLegacyBill

    // 콜백 인증키 유출 방지 — 결제선생이 echo하는 apikey는 클라이언트에 내리지 않는다
    delete raw.apikey
    delete raw.apiKey

    return NextResponse.json({
      success,
      data: result,
      error: success ? undefined : result.message || result.msg,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || "입력값을 확인해주세요." }, { status: 400 })
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 })
    }
    // 내부 오류 메시지를 사용자에게 노출하지 않는다 — 원인은 로그로만
    console.error("[paymint.read-bill] error:", error)
    return NextResponse.json(
      { success: false, error: "결제 상태를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    )
  }
}
