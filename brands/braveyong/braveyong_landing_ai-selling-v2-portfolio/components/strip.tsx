import { course } from "@/lib/config"

/**
 * 02 STRIP — 핵심 사실 띠 (다크). 인원·가격 노출 X.
 * 결제 판단에 필요한 사실값(기간·장소·시작일)만 첫 스크롤에 노출.
 * 가격 anchor는 price 섹션에 한 번만 노출 (반복 피로 방지).
 */
export function Strip() {
  const items = [
    { k: `${course.weeks}주`, v: `오프라인 ${course.offlineCount}회 + 줌 ${course.zoomCount}회` },
    { k: course.location, v: "오프라인" },
    { k: course.startDate, v: "본강의 시작" },
  ]

  return (
    <section className="border-y border-foreground bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px sm:grid-cols-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="border-b border-background/15 px-4 py-5 sm:border-b-0 sm:border-r sm:py-6 sm:last:border-r-0"
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
