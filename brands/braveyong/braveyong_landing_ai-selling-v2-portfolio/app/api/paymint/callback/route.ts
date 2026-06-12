import { NextResponse } from "next/server"
import { getPaymintConfig } from "@/lib/paymint/config"
import { readBill } from "@/lib/paymint/client"
import { sendSms } from "@/lib/sens"
import { tonggwan815 } from "@/lib/products"
import type { PaymentCallbackData } from "@/lib/paymint/types"

export const runtime = "nodejs"

/** readBill 응답에서 필드명을 모르는 채로 방어적으로 값을 찾는다 (V1/V2 스키마 차이 흡수). */
function pickField(sources: Array<Record<string, unknown> | undefined>, keys: string[]): string {
  for (const source of sources) {
    if (!source) continue
    for (const key of keys) {
      const value = source[key]
      if (typeof value === "string" && value.trim()) return value.trim()
      if (typeof value === "number") return String(value)
    }
  }
  return ""
}

/**
 * 결제완료(C) 콜백 → 815 통관 특강 결제 건이면 결제자에게 오픈채팅 입장 문자(LMS) 자동 발송.
 * - 815 판별: readBill 상품명에 '통관'이 있거나, 결제 금액이 특강가와 일치
 * - 실패해도 결제선생 응답(0000)은 항상 정상 반환 — 문자는 부가 기능, 결제 흐름을 막지 않는다
 * - 결제선생이 콜백을 재시도하면 문자가 중복 발송될 수 있다(저장소 없는 구조의 트레이드오프, 빈도 낮음)
 */
async function sendTonggwanEntrySms(callbackData: PaymentCallbackData): Promise<void> {
  if (callbackData.appr_state !== "C") return
  if (!tonggwan815.openchatUrl) {
    console.info("[paymint.callback.sms] skip — NEXT_PUBLIC_TONGGWAN_OPENCHAT_URL 미설정")
    return
  }

  const result = await readBill({ billId: callbackData.bill_id })
  const outer = (result ?? {}) as Record<string, unknown>
  const inner = (outer.data ?? {}) as Record<string, unknown>
  const deep = (inner.data ?? {}) as Record<string, unknown>
  const sources = [deep, inner, outer]

  const productName = pickField(sources, ["productName", "product_nm", "productNm"])
  const billPrice = pickField(sources, ["price", "appr_price", "apprPrice"]) || callbackData.appr_price || ""
  const isTonggwan = productName.includes("통관") || String(billPrice) === String(tonggwan815.price)
  if (!isTonggwan) {
    console.info("[paymint.callback.sms] skip — 815 특강 결제 아님", { billId: callbackData.bill_id, productName, billPrice })
    return
  }

  const phone = pickField(sources, ["phone", "member_phone", "memberPhone", "phoneNumber", "hp", "tel"])
  if (!phone) {
    console.error("[paymint.callback.sms] 전화번호 추출 실패 — 수동 발송 필요", {
      billId: callbackData.bill_id,
      availableKeys: { outer: Object.keys(outer), inner: Object.keys(inner), deep: Object.keys(deep) },
    })
    return
  }

  const smsResult = await sendSms({
    to: phone,
    type: "LMS",
    title: "8.15 통관특강 입장 안내",
    content: [
      "[용감한 용팀장] 8.15 통관특강 결제가 확인됐습니다. 감사합니다.",
      "",
      "카톡 오픈채팅방 입장:",
      tonggwan815.openchatUrl,
      "",
      "6/21(일) 저녁 8시 라이브 안내를 방에서 드립니다.",
    ].join("\n"),
  })

  if (smsResult.ok) {
    console.info("[paymint.callback.sms] 발송 완료", { billId: callbackData.bill_id })
  } else {
    console.error("[paymint.callback.sms] 발송 실패 — 수동 발송 필요", {
      billId: callbackData.bill_id,
      error: smsResult.error,
    })
  }
}

export async function POST(request: Request) {
  try {
    const callbackData = (await request.json()) as PaymentCallbackData
    const config = getPaymintConfig()
    const callbackApiKey = callbackData.apikey || callbackData.apiKey

    if (!config.dryRun && callbackApiKey !== config.apiKey) {
      return NextResponse.json({ code: "9999", msg: "인증 정보가 올바르지 않습니다." }, { status: 401 })
    }

    console.info("[paymint.callback]", {
      billId: callbackData.bill_id,
      state: callbackData.appr_state,
      price: callbackData.appr_price,
      approvedAt: callbackData.appr_dt,
    })

    // 입장 문자 자동 발송 — 어떤 실패도 결제선생 응답을 막지 않는다
    try {
      await sendTonggwanEntrySms(callbackData)
    } catch (error) {
      console.error("[paymint.callback.sms.error]", error)
    }

    return NextResponse.json({
      code: "0000",
      msg: "성공하였습니다.",
    })
  } catch (error) {
    console.error("[paymint.callback.error]", error)
    return NextResponse.json({ code: "9999", msg: "처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
