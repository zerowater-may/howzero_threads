import { put, list, get } from "@vercel/blob"
import type { ApplicationAnswers } from "@/lib/application-form"

/**
 * 결제 전 신청서 응답 저장소 (Vercel Blob). bill-registry 와 같은 패턴이다.
 *
 * 키를 billId 가 아니라 **전화번호**로 잡는 이유:
 * ① 청구서 발행 전에 저장할 수 있다 — 발행이 실패해도 신청서는 남는다
 *    (신청은 했는데 결제까지 안 간 사람 = 운영이 후속 연락할 가치가 있는 데이터).
 * ② billId 에 전화번호가 인코딩돼 있어서(hash.ts decodeBillId) 결제건 ↔ 응답 매칭이
 *    전화번호만으로 성립한다. 굳이 billId 를 키로 둘 이유가 없다.
 * ③ 같은 사람이 두 번 신청하면 최신 응답으로 덮인다 — 명단이 중복으로 불어나지 않는다.
 *
 * Blob 장애가 결제 흐름을 막으면 안 되므로 throw 대신 결과를 반환한다.
 */

const PREFIX = "applications/"

export type StoredApplication = {
  phone: string
  memberName: string
  answers: ApplicationAnswers
  submittedAt: string
}

export async function saveApplication(
  phone: string,
  memberName: string,
  answers: ApplicationAnswers,
): Promise<boolean> {
  const phoneKey = phone.replace(/[^0-9]/g, "")
  const payload: StoredApplication = {
    phone: phoneKey,
    memberName,
    answers,
    submittedAt: new Date().toISOString(),
  }

  try {
    await put(`${PREFIX}${phoneKey}.json`, JSON.stringify(payload), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    })
    return true
  } catch (error) {
    // 저장 실패로 결제를 막지는 않는다. 대신 응답 전문을 로그에 남겨 수동 복구가 가능하게 한다.
    console.error("[application-registry] 저장 실패 — 로그로 복구할 것", {
      error: String(error),
      payload,
    })
    return false
  }
}

/**
 * 관리자 조회용 — 저장된 신청서를 최신순으로 읽어 반환한다.
 *
 * private blob 은 downloadUrl 을 그냥 fetch 하면 인증이 없어 못 읽는다.
 * (실제로 첫 배포에서 저장은 됐는데 조회가 0건으로 나왔다.)
 * SDK 의 get(pathname, { access: "private" }) 을 써야 토큰 인증이 붙는다.
 * useCache:false — 방금 저장한 신청서가 CDN 캐시 때문에 안 보이면 안 된다.
 */
export async function listApplications(limit = 200): Promise<StoredApplication[]> {
  const { blobs } = await list({ prefix: PREFIX, limit })
  const sorted = [...blobs].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

  const out: StoredApplication[] = []
  for (const blob of sorted) {
    try {
      const found = await get(blob.pathname, { access: "private", useCache: false })
      if (!found) continue
      out.push(JSON.parse(await new Response(found.stream).text()) as StoredApplication)
    } catch (error) {
      console.error("[application-registry] 조회 실패", { pathname: blob.pathname, error: String(error) })
    }
  }
  return out
}
