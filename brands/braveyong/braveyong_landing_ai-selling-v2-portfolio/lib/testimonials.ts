/**
 * 후기 데이터.
 *
 * - `highlights`: 운영자가 캡처 보고 직접 입력한 텍스트 카드 (8장 권장).
 *   1기 모집 단계에선 placeholder 메시지로 표시되며,
 *   `body`가 비면 "1기 모집 중" 안내가 자동 노출된다.
 *
 * - `captures`: public/assets/testimonials/t-XX.png 목록.
 *   54장 모두 실제 카페·DM·블로그 캡처. 클릭하면 lightbox로 원본 확대.
 */

export type Testimonial = {
  initial: string         // 이니셜 (예: "JH")
  body: string            // 인용 본문 (비면 placeholder 노출)
  source: string          // "네이버 카페" / "DM" / "블로그" / "카톡"
  date?: string           // "26.04" 같은 짧은 날짜 (선택)
}

export const highlights: Testimonial[] = [
  // === 운영 입력 필요 — 1기 모집 중에는 placeholder가 자동 노출 ===
  { initial: "", body: "", source: "" },
  { initial: "", body: "", source: "" },
  { initial: "", body: "", source: "" },
  { initial: "", body: "", source: "" },
  { initial: "", body: "", source: "" },
  { initial: "", body: "", source: "" },
  { initial: "", body: "", source: "" },
  { initial: "", body: "", source: "" },
]

/** 54장 캡처 — public/assets/testimonials/t-01.png ~ t-54.png */
export const captures: string[] = Array.from({ length: 54 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0")
  return `/assets/testimonials/t-${n}.png`
})
