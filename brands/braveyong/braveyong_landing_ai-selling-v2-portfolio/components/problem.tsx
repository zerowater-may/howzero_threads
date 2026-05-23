import { Section } from "./section"
import { Marker } from "./handwriting"

/** 05 문제 제기 (다크) — 대량등록 한계 4 + 형광펜 1곳 */
const items = [
  { n: "01", h: "많이 올렸는데 노출이 없다", p: "상품 수는 늘었는데 검색에서 안 잡힙니다. 올린 만큼 팔리지 않습니다." },
  { n: "02", h: "매출은 있는데 안 남는다", p: "매출은 조금 있지만 순수익, CS, 시간을 빼고 나면 남는 게 없습니다." },
  { n: "03", h: "정책·한도가 불안하다", p: "정책 변화, 등록 한도, 프로그램 의존 방식이 언제 막힐지 늘 불안합니다." },
  { n: "04", h: "방향이 틀렸다", p: "해법은 ‘더 많이’가 아닙니다. 팔릴 가능성이 높은 상품을 다르게 만드는 겁니다." },
]

export function Problem() {
  return (
    <Section
      tone="dark"
      label="문제 제기"
      title={
        <>
          더 많이가 아니라, <span className="block sm:inline">다르게 만들어야 합니다.</span>
        </>
      }
      lead="대량등록으로 버티던 방식의 한계는 상품 수가 아니라 구조에 있습니다."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((it) => (
          <div key={it.n} className="border-2 border-background/30 p-5 transition-colors hover:border-background">
            <div className="font-mono mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-background/55">
              {it.n}
            </div>
            <h3 className="text-lg font-bold tracking-tight">{it.h}</h3>
            <p className="mt-2 text-sm leading-relaxed text-background/70">{it.p}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 border-l-4 border-background bg-background/5 p-6">
        <p className="text-lg font-bold leading-snug sm:text-xl">
          대량등록으로 버티던 셀러에게 필요한 건<br />
          더 많은 상품이 아니라,{" "}
          <span className="text-foreground">
            <Marker>팔리는 구조</Marker>
          </span>
          입니다.
        </p>
      </div>
    </Section>
  )
}
