import type { ReactNode } from "react"
import { course } from "@/lib/config"

/**
 * 02 STRIP — 핵심 사실 띠 (다크). 인원 노출 X.
 * 결제 판단에 필요한 사실값(기간·장소·시작일·가격 앵커링)을 첫 스크롤에 노출.
 */
export function Strip() {
  const priceFirstWan = (course.priceFirst / 10000).toLocaleString()
  const priceRegularWan = (course.priceRegular / 10000).toLocaleString()
  const items: { k: ReactNode; v: string }[] = [
    { k: `${course.weeks}주`, v: `오프라인 ${course.offlineCount}회 + 줌 ${course.zoomCount}회` },
    { k: course.location, v: "오프라인" },
    { k: course.startDate, v: "본강의 시작" },
    {
      k: (
        <span className="inline-flex items-baseline gap-2 tabular-nums">
          <span>{priceFirstWan}만원</span>
          <s className="text-sm font-bold text-background/45 sm:text-base">{priceRegularWan}만원</s>
        </span>
      ),
      v: "1기 특별가 · 정가 대비",
    },
  ]

  return (
    <section className="border-y border-foreground bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={i}
            className="border-r border-background/15 px-4 py-5 sm:py-6 last:border-r-0 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(4n)]:border-r-0"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-background/75 sm:text-xs">
              {it.v}
            </div>
            <div className="mt-1.5 text-base font-bold tracking-tight sm:text-lg">{it.k}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
