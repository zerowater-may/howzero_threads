/**
 * 운영 입력 통합 설정.
 * 환경변수가 비거나 placeholder면 페이지가 깨지지 않고 "운영 입력 필요" 상태가 자연 노출.
 */
const rawGoogleFormUrl = process.env.NEXT_PUBLIC_GOOGLE_FORM_URL || ""
const isGoogleFormUrlMissing =
  !rawGoogleFormUrl ||
  rawGoogleFormUrl === "#" ||
  rawGoogleFormUrl.includes("XXXX") ||
  rawGoogleFormUrl.includes("forms.gle/XXXX")

export const config = {
  // 폼 URL 미설정 시 페이지 top 튀는 것 방지 — 신청 섹션(#apply)으로 부드러운 스크롤
  googleFormUrl: isGoogleFormUrlMissing ? "#apply" : rawGoogleFormUrl,
  /** 얼리버드가 마감 ISO datetime (7/10까지) — 카운트다운 종료 후 자동 숨김 */
  cohort1Deadline: process.env.NEXT_PUBLIC_COHORT1_DEADLINE || "2026-07-10T23:59:59+09:00",
  youtubeFreeUrl: process.env.NEXT_PUBLIC_YOUTUBE_FREE_URL || "#",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "braveyong@example.com",
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://braveyong.example.com",
  /** 결제 전 분위기 보러 오는 단톡방 (공개) */
  kakaoOpenChatUrl: process.env.NEXT_PUBLIC_KAKAO_OPENCHAT_URL || "https://open.kakao.com/o/gcjQ8Hpi",
  /** 결제 전 1:1로 상황 남기는 곳 (용팀장 직통) */
  kakao1to1Url: process.env.NEXT_PUBLIC_KAKAO_1TO1_URL || "https://open.kakao.com/o/srD2ziBe",
  /**
   * 결제 페이지 URL (Toss Payments Link / Stripe Payment Link / Kakao Pay 등).
   * 운영자가 실제 결제 link 만들면 NEXT_PUBLIC_PAYMENT_URL에 주입.
   * 미설정 시 kakao1to1로 fallback → 1:1 카톡으로 결제 안내 받는 경로.
   * 가드: 사용자가 "신청서 작성 → 결제 link 자동 발송" 흐름 원함. 신청 후 응답 메시지에 이 URL 노출.
   */
  paymentUrl: process.env.NEXT_PUBLIC_PAYMENT_URL || process.env.NEXT_PUBLIC_KAKAO_1TO1_URL || "https://open.kakao.com/o/srD2ziBe",
  /** 신청서 URL이 비었는가 → CTA에 안내문 노출 */
  isFormUrlMissing: isGoogleFormUrlMissing,
} as const

/** 강의·상품 고정값 (운영자가 변경할 때만 여기 수정) */
export const course = {
  name: "4주 오프라인 AI 셀링 실전반",
  cohort: "2기",
  // ── 가격 ──
  // 화면 표기는 공급가(부가세 별도)로 230만/250만을 보여주고,
  // 실제 결제선생 청구는 부가세 포함 금액(priceFirst/priceRegular)으로 나간다.
  priceFirst: 2_530_000,           // 얼리버드(7/10까지) 결제액 = 공급가 230만 + VAT (부가세 포함)
  priceRegular: 2_750_000,         // 정가(7/10 이후) 결제액 = 공급가 250만 + VAT (부가세 포함)
  priceFirstSupply: 2_300_000,     // 화면 표기용 공급가 — "230만원 (부가세 별도)"
  priceRegularSupply: 2_500_000,   // 화면 표기용 공급가 — "250만원 (부가세 별도)"
  capacityMin: 10,                 // 페이지 노출 X (내부 운영 기준)
  capacityMax: 15,                 // 페이지 노출 X
  freeLectureDate: "2026-07-20 (월) 19:00",
  startDate: "2026-07-25 (토)",
  endDate: "2026-08-15 (토)",
  weeks: 4,
  offlineCount: 4,
  zoomCount: 3,
  location: "서울 강남",
  detailAddress: "참여 확정자에게 안내",
  scheduleTime: "추후 안내",       // 운영 입력 필요
} as const
