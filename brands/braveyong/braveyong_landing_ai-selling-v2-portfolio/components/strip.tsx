import { course } from "@/lib/config"

/**
 * 02 STRIP — 가격·일정·인원·장소 한 줄 띠 (다크).
 * Hero 미니멀 보완: 결제 판단에 필요한 사실값을 첫 스크롤에 노출.
 */
export function Strip() {
  const items = [
    { k: "6주", v: `오프라인 ${course.offlineCount} + 줌 ${course.zoomCount}` },
    { k: `${course.capacityMin}~${course.capacityMax}명`, v: "소수정예" },
    { k: course.location, v: "오프라인" },
    { k: course.startDate, v: "본강의 시작" },
    {
      k: `${(course.priceFirst / 10000).toLocaleString()}만원`,
      v: `1기 특별가 · 정가 ${(course.priceRegular / 10000).toLocaleString()}만원`,
    },
  ]

  return (
    <section className="border-y border-foreground bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-5">
        {items.map((it) => (
          <div
            key={it.k}
            className="border-r border-background/15 px-4 py-5 sm:py-6 last:border-r-0 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(5n)]:border-r-0"
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
