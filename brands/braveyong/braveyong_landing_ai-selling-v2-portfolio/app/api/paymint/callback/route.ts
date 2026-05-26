import { NextResponse } from "next/server"
import { getPaymintConfig } from "@/lib/paymint/config"
import type { PaymentCallbackData } from "@/lib/paymint/types"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const callbackData = (await request.json()) as PaymentCallbackData
    const config = getPaymintConfig()

    if (!config.dryRun && callbackData.apikey !== config.apiKey) {
      return NextResponse.json({ code: "9999", msg: "인증 정보가 올바르지 않습니다." }, { status: 401 })
    }

    console.info("[paymint.callback]", {
      billId: callbackData.bill_id,
      state: callbackData.appr_state,
      price: callbackData.appr_price,
      approvedAt: callbackData.appr_dt,
    })

    return NextResponse.json({
      code: "0000",
      msg: "성공하였습니다.",
    })
  } catch (error) {
    console.error("[paymint.callback.error]", error)
    return NextResponse.json({ code: "9999", msg: "처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
