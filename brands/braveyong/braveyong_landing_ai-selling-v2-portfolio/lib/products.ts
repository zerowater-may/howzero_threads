import { course as courseConfig } from "@/lib/config"

/** 상품 카탈로그 — productKey 단일 출처. send-bill·랜딩·완료 페이지가 공유한다. */
export type ProductKey = "course" | "tonggwan-815"

export type Product = {
  key: ProductKey
  name: string
  amount: number // 부가세 포함 결제 금액(원)
}

export const products: Record<ProductKey, Product> = {
  course: {
    key: "course",
    name: "용감한용팀장 AI셀링 실전반 오프라인 1기",
    amount: courseConfig.priceFirst, // 1,980,000 — config 단일 출처
  },
  "tonggwan-815": {
    key: "tonggwan-815",
    name: "용감한용팀장 8.15 통관대응 라이브 특강",
    amount: 209_000,
  },
}

/** 알 수 없는 key는 기존 강의로 안전 fallback (course 결제 무손상). */
export function resolveProduct(key: string | undefined | null): Product {
  if (key && key in products) return products[key as ProductKey]
  return products.course
}

/** 8.15 통관 특강 운영 상수 — 운영입력(추후 env로 교체). */
export const tonggwan815 = {
  productKey: "tonggwan-815" as const,
  price: products["tonggwan-815"].amount, // 209,000
  supplyPrice: 190_000,
  vat: 19_000,
  liveLabel: "2026년 6월 21일 (일) 저녁 8시",
  liveDurationLabel: "약 90분 + Q&A",
  payDeadlineISO: process.env.NEXT_PUBLIC_TONGGWAN_PAY_DEADLINE || "2026-06-20T23:59:59+09:00",
  deadlineLabel: "결제 마감까지",
  /** 결제 완료자에게만 노출. 미설정이면 complete 페이지가 "안내 준비 중" 표기. */
  openchatUrl: process.env.NEXT_PUBLIC_TONGGWAN_OPENCHAT_URL || "",
} as const
