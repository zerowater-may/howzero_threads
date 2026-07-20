import { NextResponse } from "next/server"
import { z } from "zod"
import { resendBill } from "@/lib/paymint/client"

export const runtime = "nodejs"

const ResendBillSchema = z.object({
  billId: z.string().trim().min(1, "billId가 필요합니다.").max(30, "billId가 너무 깁니다."),
})

export async function POST(request: Request) {
  try {
    const body = ResendBillSchema.parse(await request.json())
    const result = await resendBill({ billId: body.billId })
    const message = result.message || result.msg

    return NextResponse.json({
      success: result.code === "0000",
      data: result,
      error: result.code === "0000" ? undefined : message,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || "입력값을 확인해주세요." }, { status: 400 })
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 })
    }
    // 내부 오류 메시지(URL·스택)를 사용자에게 노출하지 않는다 — 원인은 로그로만
    console.error("[paymint.resend-bill] error:", error)
    return NextResponse.json(
      { success: false, error: "청구서를 다시 보내는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    )
  }
}
