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
   * 현재 기수 결제 마감 ISO datetime — 개강(8/22) 전날 자정.
   * 가짜 타이머가 아니라 "개강하면 못 들어온다"는 실제 마감. 지나면 카운트다운 자동 숨김.
   *
   * 상수명만 cohort1Deadline → payDeadline 으로 바꿨다. 현재 기수 마감을 담은 값이
   * cohort1이라는 이름을 달고 있으면 다음 기수 전환 때 잘못 건드린다.
   *
   * env 키는 NEXT_PUBLIC_COHORT1_DEADLINE 그대로 둔다. 2026-08-05 확인 시점에
   * Vercel production 에는 이 키가 등록돼 있지 않아 아래 기본값이 쓰인다. 그래도 키를
   * 바꾸지 않는 이유는, 누군가 나중에 대시보드에서 이 이름으로 넣었을 때 코드가 못 읽으면
   * 마감 시각이 조용히 어긋나기 때문이다. env 에 값을 넣을 거면 기수 전환 때 같이 갱신할 것.
   */
  payDeadline: process.env.NEXT_PUBLIC_COHORT1_DEADLINE || "2026-08-21T23:59:59+09:00",
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
  /**
   * 결제 전 필수 신청서 (구글폼) — 2026-08-13 사장님 지시로 부활.
   * 결제 모달 1단계에서 이 링크를 열게 하고, 작성 확인 후에만 결제 단계로 넘어간다.
   * 응답은 구글 시트에 쌓인다 — 사이트는 응답을 저장하지 않는다.
   *
   * 기본값에 3기 폼을 박아두는 이유: Vercel env 에 등록된 값이 1기 폼(79일 전)이라
   * env 만 믿으면 3기 신청자가 옛 폼을 쓰게 된다. 기수 전환 때 이 값과 env 를 **같이** 갱신할 것.
   */
  googleFormUrl: process.env.NEXT_PUBLIC_GOOGLE_FORM_URL || "https://forms.gle/bxWc3xg2Wr6BENmZA",
  /** 결제 전 분위기 보러 오는 단톡방 (공개) */
  kakaoOpenChatUrl: process.env.NEXT_PUBLIC_KAKAO_OPENCHAT_URL || "https://open.kakao.com/o/gcjQ8Hpi",
  /** 결제 전 1:1로 상황 남기는 곳 (용팀장 직통) */
  kakao1to1Url: process.env.NEXT_PUBLIC_KAKAO_1TO1_URL || "https://open.kakao.com/o/srD2ziBe",
} as const

/** 강의·상품 고정값 (운영자가 변경할 때만 여기 수정) */
export const course = {
  name: "4주 오프라인 AI 셀링 실전반",
  cohort: "3기",
  /**
   * ── 가격 (2026-08-13 사장님 지시로 변경) ──
   * **priceFirst 는 부가세를 포함한 최종 결제액이다.** 결제선생 청구액도 이 값 그대로.
   *
   * 예전엔 공급가(priceFirstSupply)를 크게 걸고 부가세를 더한 금액을 따로 밝히는 구조라
   * 화면 숫자와 결제창 숫자가 달랐다. 이제 화면에 나오는 금액 = 결제창 금액 = priceFirst 하나뿐이고,
   * 공급가/부가세 분리 표기는 전부 걷어냈다(230만을 1.1로 나누면 209만 909원이라 화면에 쓸 수 없다).
   * 세금계산서용 공급가액은 발행 시점에 계산한다 — 랜딩에서 쪼개 보여줄 이유가 없다.
   *
   * 얼리버드/정가 이중 구조는 폐지 — 가짜 앵커 대신 priceHistory의 실제 이력만 쓴다.
   */
  priceFirst: 2_300_000,           // 부가세 포함 최종 결제액 (= 결제창에 찍히는 금액)
  /** 카드 할부 안내용 — 6개월 무이자 시 월 납입액 (priceFirst / 6, 천원 단위 반올림) */
  priceMonthly6: 383_000,
  capacityMax: 20,                 // 정원 — 덱 p10-10 기준 (1기 25명 → 2기부터 20명, 케어 가능한 최대)
  cohort1Count: 25,                // 1기 실제 신청 인원 — 덱 p10-10b 근거
  startDate: "8월 22일 토요일",   // 화면 표기용 — 기계적인 ISO 날짜 대신 읽히는 형태
  endDate: "9월 12일 토요일",     // 토요일 오프라인 4회: 8/22 · 8/29 · 9/5 · 9/12
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
 * 기수별 가격 이력 — 가격 사다리(price.tsx)의 단일 출처.
 *
 * 지나간 기수를 취소선+회색으로 긁고 현재 기수만 살려서, "매 기수 오른다"를
 * 글이 아니라 눈으로 보여준다.
 *
 * **전부 부가세 포함 실제 결제액 기준이다** (2026-08-13 기준 변경).
 * 예전엔 공급가 기준(180/200/230)이었는데, 3기가 "부가세 포함 230만"으로 바뀌면서
 * 공급가로 두면 사다리 현재 행이 209만이 되어 같은 페이지 헤드라인 230만과 정면충돌한다.
 * 사다리의 현재 행은 화면에 걸린 가격과 반드시 같은 숫자여야 한다.
 *
 * 과거 기수 숫자는 실제 결제액이고 코드 이력으로 검증된다 —
 * 1기 198만은 옛 config.priceCohort1, 2기 220만은 옛 products.ts 청구 금액.
 *
 * 다음 기수 전환: 맨 뒤에 한 줄 추가하고 이전 줄 closed를 true로 바꾸면 끝난다.
 */
export const priceHistory = [
  { cohort: "1기", total: 1_980_000, closed: true },
  { cohort: "2기", total: 2_200_000, closed: true },
  { cohort: "3기", total: course.priceFirst, closed: false },
] as const

/**
 * 다음 기수 표기 — "4기까지 대기", "4기부터는 10만원씩" 처럼 다음 기수를 가리키는 자리용.
 * course.cohort 에서 파생시켜 기수 전환 때 같이 따라오게 한다.
 * (예전엔 scarcity.tsx 에 "3기까지 대기"가 문자열로 박혀 있어서 3기가 모집 중인데도
 *  "3기까지 대기"라고 떠 있었다.)
 */
export const nextCohort = `${Number(course.cohort.replace(/\D/g, "")) + 1}기`

/**
 * 화면 표기용 가격 문자열 — 금액 하드코딩 금지용 단일 출처.
 * 과거 금액 문자열이 16곳에 흩어져 버튼 라벨과 결제 모달 금액이 서로 달라 보이는 사고가 있었다.
 * 금액은 course.priceFirst 만 고치면 아래가 전부 따라온다.
 * (주석에 실제 숫자를 적지 않는 이유 — 기수마다 낡아서 코드와 정반대가 된 전례가 반복됐다.)
 */
const wan = (n: number) => `${(n / 10000).toLocaleString()}만원`

export const priceText = {
  /**
   * 부가세 포함 최종 결제액 — 결제창에 찍히는 금액. 화면의 총액 자리는 전부 이걸 쓴다.
   *
   * 2026-08-13: headline·supply·vat 를 삭제했다. 공급가를 크게 걸고 부가세를 따로 더해 보여주던
   * 구조가 사라졌기 때문이다. "부가세 별도" 라는 말이 페이지에 남아 있으면 안 된다 —
   * 이제 화면의 모든 금액이 부가세 포함이다.
   */
  total: wan(course.priceFirst),
  /** 6개월 무이자 할부 시 월 납입액 — 만원 단위 반올림 (36.7만원처럼 소수점 노출 방지) */
  monthly6: `${Math.round(course.priceMonthly6 / 10000).toLocaleString()}만원`,
  /**
   * 큰 숫자 자리에 쓰는 할부 표기 (2026-08-11 사장님 지시 — 할부 기준으로 전환).
   * 총액을 크게 걸면 그 숫자 하나로 판단이 끝나서, 실제로 대부분이 쓰는 결제 방식인
   * 카드 6개월 무이자가 안 보인다. 헤드라인은 월 납입액, 총액은 바로 옆에서 같이 밝힌다.
   * 만원 단위로 뭉개지 않고 원 단위로 쓰는 이유 — 반올림 없이 정확한 금액을 보여준다.
   * 앞에 "월"을 붙여서 쓴다.
   */
  monthly6Exact: `${course.priceMonthly6.toLocaleString()}원`,
  /**
   * 부가세 포함 총액 — 원 단위. 할부 헤드라인 옆 보조 표기용.
   * 취소선을 긋지 않는다. 이건 실제 청구액이라 긁으면 있지도 않은 할인을 만든다.
   * (가짜 정가 앵커 금지 — priceHistory의 실제 인상 이력이 이 페이지의 유일한 앵커다.)
   */
  totalExact: `${course.priceFirst.toLocaleString()}원`,
  /**
   * 결제 버튼 기본 라벨 — 모달·결제창에 찍히는 금액(부가세 포함)을 그대로 쓴다.
   * 버튼에 결제창과 다른 금액을 쓰면 결제 직전에 숫자가 달라 보여 이탈한다.
   */
  payLabel: `지금 결제하기 — ${wan(course.priceFirst)} (부가세 포함)`,
  /** 좁은 가로 폭(스티키 바 등)용 짧은 라벨 — 금액이 옆에 이미 있을 때 */
  payLabelShort: "지금 바로 결제하기",
} as const
