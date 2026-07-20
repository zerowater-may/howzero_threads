import { NextResponse } from "next/server"
import { z } from "zod"
import { destroyBill } from "@/lib/paymint/client"

export const runtime = "nodejs"

const DestroyBillSchema = z.object({
  billId: z.string().trim().min(1, "billId가 필요합니다.").max(30, "billId가 너무 깁니다."),
  amount: z.number().int().positive("금액이 필요합니다."),
})

export async function POST(request: Request) {
  try {
    const body = DestroyBillSchema.parse(await request.json())
    const result = await destroyBill({ billId: body.billId, amount: body.amount })

    return NextResponse.json({
      success: result.code === "0000",
      data: result,
      error: result.code === "0000" ? undefined : result.message || result.msg,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || "입력값을 확인해주세요." }, { status: 400 })
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 })
    }
    // 내부 오류 메시지를 노출하지 않는다 (destroy는 운영/스크립트 전용이지만 일관성 유지)
    console.error("[paymint.destroy-bill] error:", error)
    return NextResponse.json(
      { success: false, error: "청구서 파기 중 문제가 생겼습니다." },
      { status: 500 },
    )
  }
}
