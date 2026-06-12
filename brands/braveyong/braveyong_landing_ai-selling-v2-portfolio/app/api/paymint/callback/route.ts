import { NextResponse } from "next/server"
import { getPaymintConfig } from "@/lib/paymint/config"
import { readBill } from "@/lib/paymint/client"
import { decodeBillId } from "@/lib/paymint/hash"
import { sendEntrySmsOnce } from "@/lib/bill-registry"
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
 * 결제 콜백 → 통관 특강(T 마커) 결제 건이면 입장 문자 1회 발송.
 * - 통관 전용: billId의 T 마커가 유일한 판별 기준 — course 결제(C 마커)·구형식은 절대 발송 안 함
 * - 콜백의 state 글자는 신뢰하지 않는다(실결제에서 승인 전 'F' 콜백만 오는 사례 확인) —
 *   readBill로 현재 수납 상태를 직접 조회해 'C'일 때만 발송
 * - 중복 차단: sendEntrySmsOnce의 Blob 락 — 콜백 재시도·크론과 겹쳐도 1건만 나간다
 * - 실패해도 결제선생 응답(0000)은 항상 정상 반환 — 문자는 부가 기능, 결제 흐름을 막지 않는다
 */
async function sendTonggwanEntrySms(callbackData: PaymentCallbackData): Promise<void> {
  const decoded = decodeBillId(callbackData.bill_id)
  if (!decoded?.isTonggwan) {
    console.info("[paymint.callback.sms] skip — 통관 특강 청구서 아님", { billId: callbackData.bill_id })
    return
  }
  if (!tonggwan815.openchatUrl) {
    console.info("[paymint.callback.sms] skip — NEXT_PUBLIC_TONGGWAN_OPENCHAT_URL 미설정")
    return
  }

  // 현재 수납 상태를 직접 조회 — 콜백 state 글자 불신
  const result = await readBill({ billId: callbackData.bill_id })
  const outer = (result ?? {}) as Record<string, unknown>
  const inner = (outer.data ?? {}) as Record<string, unknown>
  const deep = (inner.data ?? {}) as Record<string, unknown>
  const state = pickField([deep, inner, outer], ["appr_state", "apprState"])

  if (state !== "C") {
    console.info("[paymint.callback.sms] skip — 아직 수납 미완료, 크론이 재확인", {
      billId: callbackData.bill_id,
      state,
    })
    return
  }

  const outcome = await sendEntrySmsOnce(callbackData.bill_id, decoded.phone, "callback")
  console.info("[paymint.callback.sms]", { billId: callbackData.bill_id, outcome })
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
