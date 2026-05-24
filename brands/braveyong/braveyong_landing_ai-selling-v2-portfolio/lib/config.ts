/**
 * 운영 입력 통합 설정.
 * 환경변수가 비면 placeholder로 폴백 — 페이지가 깨지지 않고 "운영 입력 필요" 상태가 자연 노출.
 */
export const config = {
  // 폼 URL 미설정 시 페이지 top 튀는 것 방지 — 신청 섹션(#apply)으로 부드러운 스크롤
  googleFormUrl: process.env.NEXT_PUBLIC_GOOGLE_FORM_URL || "#apply",
  youtubeFreeUrl: process.env.NEXT_PUBLIC_YOUTUBE_FREE_URL || "#",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "braveyong@example.com",
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://braveyong.example.com",
  /** 결제 전 분위기 보러 오는 단톡방 (공개) */
  kakaoOpenChatUrl: process.env.NEXT_PUBLIC_KAKAO_OPENCHAT_URL || "https://open.kakao.com/o/gcjQ8Hpi",
  /** 결제 전 1:1로 상황 남기는 곳 (용팀장 직통) */
  kakao1to1Url: process.env.NEXT_PUBLIC_KAKAO_1TO1_URL || "https://open.kakao.com/o/srD2ziBe",
  /** 신청서 URL이 비었는가 → CTA에 안내문 노출 */
  isFormUrlMissing: !process.env.NEXT_PUBLIC_GOOGLE_FORM_URL,
} as const

/** 강의·상품 고정값 (운영자가 변경할 때만 여기 수정) */
export const course = {
  name: "6주 오프라인 AI 셀링 실전반",
  cohort: "1기",
  priceFirst: 1_800_000,           // 1기 실행자 특별가
  priceRegular: 2_500_000,         // 2기 이후 정가
  capacityMin: 10,
  capacityMax: 15,
  freeLectureDate: "2026-06-10 (수)",
  startDate: "2026-06-13 (토)",
  offlineCount: 6,
  zoomCount: 5,
  location: "서울 강남",
  detailAddress: "참여 확정자에게 안내",
  scheduleTime: "추후 안내",       // 운영 입력 필요
} as const
