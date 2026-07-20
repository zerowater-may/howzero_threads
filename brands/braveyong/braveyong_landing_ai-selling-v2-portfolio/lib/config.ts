/**
 * 운영 입력 통합 설정.
 * 환경변수가 비거나 placeholder면 페이지가 깨지지 않고 "운영 입력 필요" 상태가 자연 노출.
 *
 * 2026-07-20: 신청서(구글폼) 흐름 폐기. 결제가 유일한 신청 경로다.
 * 결제 버튼 옆에 폼을 두면 결제 의도가 폼으로 흡수돼 전부 걷어냈고,
 * 그와 함께 googleFormUrl · isFormUrlMissing · paymentUrl(미사용) 및
 * ApplyFormFrame · CopyFormUrlButton 컴포넌트도 삭제했다.
 * 폼을 되살릴 일이 생기면 이 주석이 아니라 사장님 지시를 근거로 판단할 것.
 */
export const config = {
  /**
   * 2기 결제 마감 ISO datetime — 개강(7/25) 전날 자정.
   * 가짜 타이머가 아니라 "개강하면 못 들어온다"는 실제 마감. 지나면 카운트다운 자동 숨김.
   */
  cohort1Deadline: process.env.NEXT_PUBLIC_COHORT1_DEADLINE || "2026-07-24T23:59:59+09:00",
  youtubeFreeUrl: process.env.NEXT_PUBLIC_YOUTUBE_FREE_URL || "#",
  /**
   * 문의 이메일. 미설정이면 빈 문자열 — 푸터에서 아예 감춘다.
   * 예전 기본값이 braveyong@example.com이라 운영 env가 비어 있는 동안
   * 220만원짜리 판매 페이지 푸터에 가짜 주소가 그대로 노출되고 있었다.
   * 실제 주소가 생기면 NEXT_PUBLIC_CONTACT_EMAIL에 넣으면 다시 표시된다.
   */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "",
  /**
   * 사이트 절대 URL — og:image·canonical·sitemap·robots가 전부 이걸 쓴다.
   * 폴백이 example.com이면 env가 한 번 비는 순간 카톡 공유 미리보기와
   * 검색 색인이 통째로 존재하지 않는 도메인을 가리킨다. 실제 도메인으로 둔다.
   */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.gigclass.kr",
  /** 결제 전 분위기 보러 오는 단톡방 (공개) */
  kakaoOpenChatUrl: process.env.NEXT_PUBLIC_KAKAO_OPENCHAT_URL || "https://open.kakao.com/o/gcjQ8Hpi",
  /** 결제 전 1:1로 상황 남기는 곳 (용팀장 직통) */
  kakao1to1Url: process.env.NEXT_PUBLIC_KAKAO_1TO1_URL || "https://open.kakao.com/o/srD2ziBe",
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
  /** 캘린더 섹션이 이미 '선릉역 or 강남역 주변'을 공개하고 있다 — 같은 페이지에서 따로 놀지 않게 맞춘다 */
  detailAddress: "선릉역 또는 강남역 주변",
  /**
   * 요일은 확정(토요일), 시각은 미정.
   * 예전엔 '추후 안내'만 떠서 개강 나흘 전인데도 페이지가 덜 만들어진 것처럼 보였다.
   * 아는 사실(토요일)은 밝히고 모르는 것(시각)만 안내로 남긴다.
   * 시각이 확정되면 여기만 "토요일 오후 2시"처럼 고치면 된다.
   */
  scheduleTime: "토요일",
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
  /** 좁은 가로 폭(스티키 바 등)용 짧은 라벨 — 금액이 옆에 이미 있을 때 */
  payLabelShort: "지금 바로 결제하기",
} as const
