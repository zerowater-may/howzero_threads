import { put, del, list } from "@vercel/blob"
import { sendSms } from "@/lib/sens"
import { tonggwan815 } from "@/lib/products"

/**
 * 통관 특강 청구서 레지스트리 + 입장문자 1회 발송 보장 (Vercel Blob).
 * - bills/pending/<billId>.json : 발송된 통관 청구서 (course는 등록하지 않는다)
 * - bills/done/<billId>.json    : 입장문자 발송 락 — put(allowOverwrite:false)이
 *   원자적 락 역할을 해 콜백·리컨사일 크론이 동시에 와도 문자는 1건만 나간다.
 * Blob 장애가 결제 흐름을 막으면 안 되므로 모든 함수는 throw 대신 결과를 반환한다.
 */

const PENDING_PREFIX = "bills/pending/"
const DONE_PREFIX = "bills/done/"

export async function registerPendingBill(billId: string, phone: string): Promise<boolean> {
  try {
    await put(
      `${PENDING_PREFIX}${billId}.json`,
      JSON.stringify({ billId, phone, createdAt: new Date().toISOString() }),
      { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" },
    )
    return true
  } catch (error) {
    console.error("[bill-registry] pending 등록 실패", { billId, error: String(error) })
    return false
  }
}

export async function removePendingBill(billId: string): Promise<void> {
  try {
    await del(`${PENDING_PREFIX}${billId}.json`)
  } catch (error) {
    console.error("[bill-registry] pending 삭제 실패", { billId, error: String(error) })
  }
}

export type PendingBill = { billId: string; uploadedAt: Date }

export async function listPendingBills(limit = 100): Promise<PendingBill[]> {
  try {
    const { blobs } = await list({ prefix: PENDING_PREFIX, limit })
    return blobs.map((b) => ({
      billId: b.pathname.slice(PENDING_PREFIX.length).replace(/\.json$/, ""),
      uploadedAt: new Date(b.uploadedAt),
    }))
  } catch (error) {
    console.error("[bill-registry] pending 목록 실패", { error: String(error) })
    return []
  }
}

/**
 * 입장문자 1회 발송 보장. 흐름: done 락 선점(put, 이미 있으면 실패=이미 발송) →
 * SMS 발송 → 실패 시 락 해제(크론 재시도 가능). 성공 시 pending 제거.
 */
export async function sendEntrySmsOnce(
  billId: string,
  phone: string,
  via: string,
): Promise<"sent" | "already-sent" | "failed"> {
  const lockPath = `${DONE_PREFIX}${billId}.json`

  try {
    await put(lockPath, JSON.stringify({ billId, phone, via, lockedAt: new Date().toISOString() }), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false, // 이미 존재하면 throw — 중복 발송 차단 락
      contentType: "application/json",
    })
  } catch {
    return "already-sent"
  }

  const result = await sendSms({
    to: phone,
    type: "LMS",
    title: "8월 통관특강 입장 안내",
    content: [
      "[용감한 용팀장] 8월 통관특강 결제가 확인됐습니다. 감사합니다.",
      "",
      "카톡 오픈채팅방 입장:",
      tonggwan815.openchatUrl,
      "",
      "6/21(일) 저녁 8시 라이브 안내를 방에서 드립니다.",
    ].join("\n"),
  })

  if (!result.ok) {
    console.error("[bill-registry] SMS 실패 — 락 해제, 크론 재시도 대상", { billId, via, error: result.error })
    try {
      await del(lockPath)
    } catch {
      // 락 해제 실패 시 수동 발송 필요 — 로그로만 남긴다
    }
    return "failed"
  }

  console.info("[bill-registry] 입장문자 발송 완료", { billId, via })
  await removePendingBill(billId)
  return "sent"
}
