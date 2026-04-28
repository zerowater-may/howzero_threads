export interface DistrictPrice {
  district: string;        // "서초구"
  priceLastYear: number;   // 2025 평균가, 단위: 만원 (67980 = 6억 7980만원)
  priceThisYear: number;   // 2026 평균가
  changePct: number;       // (thisYear - lastYear) / lastYear * 100, 소수점 1자리
}

export interface SeoulPriceDataset {
  generatedAt: string;     // ISO8601, fetcher가 찍음
  title?: string;
  subtitle?: string;
  periodLabel: string;     // "25.1.1 ~ 4.18 vs 26.1.1 ~ 4.18"
  sizeLabel: string;       // "24평대 / 전용 55㎡ ~ 60㎡"
  source: string;          // "국토부 실거래가"
  districtLabel?: string;
  beforeLabel?: string;
  afterLabel?: string;
  changeLabel?: string;
  districts: DistrictPrice[]; // 25개 (서울 자치구)
}

export const SEOUL_DISTRICTS_ORDER = [
  "서초구","강남구","용산구","송파구","성동구","마포구","동작구","강동구",
  "광진구","중구","영등포구","종로구","동대문구","서대문구","양천구","강서구",
  "성북구","은평구","관악구","구로구","강북구","금천구","노원구","중랑구","도봉구",
] as const;

/** Format 만원 amount for display. Input must be a non-negative integer. */
export function formatWon(manwon: number): { eok: number; man: number; display: string } {
  const eok = Math.floor(manwon / 10000);
  const man = manwon % 10000;
  const display = man === 0 ? `${eok}억` : `${eok}억 ${man.toLocaleString("ko-KR")}만원`;
  return { eok, man, display };
}
