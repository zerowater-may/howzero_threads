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
  /**
   * 2기 결제 마감 ISO datetime — 개강(7/25) 전날 자정.
   * 가짜 타이머가 아니라 "개강하면 못 들어온다"는 실제 마감. 지나면 카운트다운 자동 숨김.
   */
  cohort1Deadline: process.env.NEXT_PUBLIC_COHORT1_DEADLINE || "2026-07-24T23:59:59+09:00",
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
  // ── 가격 (2기 확정 · 2026-07-20) ──
  // 단일 가격 구조. 화면 헤드라인은 부가세 포함 220만원으로 노출하고,
  // 공급가 200만원(부가세 별도)을 보조 표기한다. 결제선생 청구액 = priceFirst.
  // 얼리버드/정가 이중 구조는 폐지 — 가짜 앵커 대신 1기 198만 → 2기 220만 실제 이력만 쓴다.
  priceFirst: 2_200_000,           // 실제 결제액 = 공급가 200만 + VAT 20만 (부가세 포함)
  priceFirstSupply: 2_000_000,     // 화면 표기용 공급가 — "200만원 (부가세 별도)"
  priceCohort1: 1_980_000,         // 1기 실제 결제액 — 인상 폭을 정직하게 밝히는 용도
  /** 카드 할부 안내용 — 6개월 무이자 시 월 납입액 (priceFirst / 6, 만원 단위 반올림) */
  priceMonthly6: 367_000,
  capacityMax: 20,                 // 2기 정원 — 덱 p10-10 기준 (1기 25명 → 2기 20명, 케어 가능한 최대)
  cohort1Count: 25,                // 1기 실제 신청 인원 — 덱 p10-10b 근거
  freeLectureDate: "2026-07-20 (월) 19:00",
  startDate: "7월 25일 토요일",   // 화면 표기용 — 기계적인 ISO 날짜 대신 읽히는 형태
  endDate: "8월 15일 토요일",     // 토요일 오프라인 4회: 7/25 · 8/1 · 8/8 · 8/15
  weeks: 4,                        // 덱 p10-09 기준 — "토요일 오프라인 네 번"
  offlineCount: 4,
  zoomCount: 4,                    // 수요일 줌 보강 — 오프라인 각 주차 뒤 평일 저녁
  location: "서울 강남",
  detailAddress: "참여 확정자에게 안내",
  scheduleTime: "추후 안내",       // 운영 입력 필요
} as const

/**
 * 화면 표기용 가격 문자열 — 금액 하드코딩 금지용 단일 출처.
 * 과거 "230만원/250만원/42만원"이 16곳에 흩어져 버튼 라벨(230만)과
 * 결제 모달 금액(2,530,000원)이 서로 달라 보이는 사고가 있었다.
 * 금액은 course만 고치면 아래가 전부 따라온다.
 */
const wan = (n: number) => `${(n / 10000).toLocaleString()}만원`

export const priceText = {
  /**
   * 화면 헤드라인 — 강의 비용 200만원(부가세 별도).
   * 사장님 지시(2026-07-20): 큰 숫자는 200만원으로 보여주고,
   * 부가세 포함 220만원은 바로 옆에 함께 밝힌다.
   */
  headline: wan(course.priceFirstSupply),
  /** 부가세 포함 실제 결제액 — 결제창에 찍히는 금액. 버튼 라벨은 이걸 쓴다(모달 금액과 어긋나면 안 됨) */
  total: wan(course.priceFirst),
  /** 공급가 (부가세 별도) */
  supply: wan(course.priceFirstSupply),
  vat: wan(course.priceFirst - course.priceFirstSupply),
  /** 1기 실제 결제액 — 인상 폭을 밝히는 정직한 앵커 */
  cohort1: wan(course.priceCohort1),
  /** 6개월 무이자 할부 시 월 납입액 — 만원 단위 반올림 (36.7만원처럼 소수점 노출 방지) */
  monthly6: `${Math.round(course.priceMonthly6 / 10000).toLocaleString()}만원`,
  /**
   * 결제 버튼 기본 라벨 — 모달·결제창에 찍히는 금액(부가세 포함)을 그대로 쓴다.
   * 헤드라인은 200만원이지만 버튼에 200만원을 쓰면 결제창에서 220만원이 떠 놀란다.
   */
  payLabel: `지금 결제하기 — ${wan(course.priceFirst)} (부가세 포함)`,
} as const
