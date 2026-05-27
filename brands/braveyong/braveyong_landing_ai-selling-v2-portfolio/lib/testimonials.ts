/**
 * 후기 데이터.
 *
 * - `highlights`: 실제 캡처에서 발췌한 8장 짧은 인용. 1기 후기가 모이면 운영자가 교체.
 *   (현재 텍스트는 braveyong/용감한용팀장/ 폴더의 카페 후기 캡처에서 발췌)
 *
 * - `captures`: public/assets/testimonials/t-XX.png 50장 (사진 4장은 photos/로 분리).
 *   클릭하면 lightbox로 원본 확대.
 */

export type Testimonial = {
  initial: string         // 닉네임 또는 이니셜
  body: string            // 인용 본문 (짧게)
  source: string          // "네이버 카페" / "DM" / "블로그" / "카톡"
  date?: string           // "26.04" 같은 짧은 날짜 (선택)
}

export const highlights: Testimonial[] = [
  {
    initial: "용팀 스터디 수강생",
    body: "혼자 끙끙 앓던 고민이 '아 나만 이런 게 아니었구나' 했어요. 다시 시작할 용기와 분명한 방향을 얻었습니다.",
    source: "네이버 카페",
  },
  {
    initial: "Brandon94",
    body: "단순한 라이브가 아니라 노하우까지 풀어 주신 것 같아 정말 진정성이 느껴졌습니다.",
    source: "네이버 카페",
  },
  {
    initial: "이지수",
    body: "솔직히 처음엔 반신반의였지만, 막상 들으니 깊이 알지 못했던 부분이 너무 와 닿았어요. ‘구매대행 다시 시작해 봐야겠다’는 생각이 들었습니다.",
    source: "네이버 카페",
  },
  {
    initial: "자우보",
    body: "1일간의 이슈를 공유하고 발표하면서, 처음 시작할 때와 너무 다른 마음이라 정말 좋았네요.",
    source: "네이버 카페",
  },
  {
    initial: "마운씨",
    body: "역시 사람은 배워야 한다는 말이 맞다는 생각이 드는 강의였습니다. 매주 어떻게 해야 할지 도움이 됐어요.",
    source: "네이버 카페",
  },
  {
    initial: "윤정심다",
    body: "정말 처음이라면 광고도 배우고 싶어 만드는 분들에게 다 좋아져요. 친근한 성격과 처음 시작하는 사람에게 도움됐어요.",
    source: "네이버 카페",
  },
  {
    initial: "두여",
    body: "구매대행 입문자·초보자에게 큰 도움이 되었습니다. 체계가 잡혀 있지 않아 효율 떨어지던 부분을 함께 채워 주셨어요.",
    source: "네이버 카페",
  },
  {
    initial: "준자e",
    body: "스스로 변경의 시간 강의에서 다양한 정보와 방법을 알려주셔서 잘 받았습니다. 적용해 보겠습니다.",
    source: "네이버 카페",
  },
]

/** 50장 캡처 — public/assets/testimonials/t-01.png ~ t-50.png (사진 4장은 photos/로 분리) */
export const captures: string[] = Array.from({ length: 50 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0")
  return `/assets/testimonials/t-${n}.png`
})

/** 현장 사진 — 사기꾼 의심 차단·졸업 스터디 섹션에 분산 배치 */
/** PNG → JPG 변환 (사진 압축 효율, 모바일 성능 최적화) — 디자인은 동일, 픽셀만 압축. */
export const photos = {
  groupHands: "/assets/photos/group-hands.jpg",    // V사인 손모음 — 일체감·진정성
  groupMeetup: "/assets/photos/group-meetup.jpg",  // 강남역 단체사진
  studyDesk: "/assets/photos/study-desk.jpg",      // 노트북 둘러앉은 스터디
  classroom: "/assets/photos/classroom.jpg",       // 강의실
} as const
