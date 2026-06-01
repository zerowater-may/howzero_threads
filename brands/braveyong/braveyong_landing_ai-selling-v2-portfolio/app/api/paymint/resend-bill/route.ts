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

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "청구서 재발송 중 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}
