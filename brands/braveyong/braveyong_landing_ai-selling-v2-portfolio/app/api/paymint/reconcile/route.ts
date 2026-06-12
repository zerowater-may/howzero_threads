import { NextResponse } from "next/server"
import { readBill } from "@/lib/paymint/client"
import { decodeBillId } from "@/lib/paymint/hash"
import { listPendingBills, removePendingBill, sendEntrySmsOnce } from "@/lib/bill-registry"

export const runtime = "nodejs"
export const maxDuration = 60

const STALE_DAYS = 7

function pickState(result: unknown): string {
  const outer = (result ?? {}) as Record<string, unknown>
  const inner = (outer.data ?? {}) as Record<string, unknown>
  const deep = (inner.data ?? {}) as Record<string, unknown>
  for (const src of [deep, inner, outer]) {
    const v = src["appr_state"] ?? src["apprState"]
    if (typeof v === "string" && v) return v
  }
  return ""
}

/**
 * 수납 리컨사일 — 15분 크론(howzero 서버)이 호출하는 안전망.
 * pending 청구서들을 결제선생에 재조회해, 수납 완료(C)인데 입장문자가 안 나간 건을
 * sendEntrySmsOnce(중복 차단 락)로 발송한다. 콜백이 유실·선행(F)돼도 여기서 잡힌다.
 * 통관 전용: pending 레지스트리에는 통관(T 마커) 청구서만 등록되고, 여기서도 재검증한다.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const key = url.searchParams.get("key") || request.headers.get("x-reconcile-key") || ""
  const secret = process.env.RECONCILE_SECRET || ""
  if (!secret || key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pending = await listPendingBills(50)
  const summary = { checked: 0, sent: 0, alreadySent: 0, failed: 0, waiting: 0, expired: 0, skipped: 0 }

  for (const bill of pending) {
    summary.checked++

    const decoded = decodeBillId(bill.billId)
    if (!decoded?.isTonggwan) {
      // 통관 청구서가 아닌 게 레지스트리에 있을 수 없지만, 있어도 절대 발송하지 않는다
      summary.skipped++
      await removePendingBill(bill.billId)
      continue
    }

    const ageDays = (Date.now() - bill.uploadedAt.getTime()) / 86_400_000
    if (ageDays > STALE_DAYS) {
      summary.expired++
      await removePendingBill(bill.billId)
      continue
    }

    try {
      const state = pickState(await readBill({ billId: bill.billId }))
      if (state !== "C") {
        summary.waiting++
        continue
      }
      const outcome = await sendEntrySmsOnce(bill.billId, decoded.phone, "reconcile")
      if (outcome === "sent") summary.sent++
      else if (outcome === "already-sent") {
        summary.alreadySent++
        await removePendingBill(bill.billId)
      } else summary.failed++
    } catch (error) {
      summary.failed++
      console.error("[paymint.reconcile] 조회 실패", { billId: bill.billId, error: String(error) })
    }
  }

  console.info("[paymint.reconcile]", summary)
  return NextResponse.json({ ok: true, ...summary })
}
