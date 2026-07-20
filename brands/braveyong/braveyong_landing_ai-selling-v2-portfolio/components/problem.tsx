import { Section } from "./section"
import { Marker } from "./handwriting"

/** 05 문제 제기 (다크) — 대량등록 한계 4 + 형광펜 1곳 */
const items = [
  { n: "01", h: "많이 올렸는데 노출이 없다", p: "상품 수는 늘었는데 검색에서 안 잡힙니다. 올린 만큼 팔리지 않아요." },
  { n: "02", h: "매출은 있는데 안 남는다", p: "매출은 찍히는데 원가 빼고, 광고비 빼고, CS 붙잡고 있던 시간까지 따지면 남는 게 없어요." },
  { n: "03", h: "프로그램은 손만 대신한다", p: "반자동 프로그램은 빨리 올려주기만 해요. 수천 명이 같은 DB로 같은 상품을 올리니, 남는 무기는 가격뿐입니다." },
  { n: "04", h: "방향이 틀렸다", p: "답은 ‘더 많이’가 아니에요. 팔릴 만한 상품 몇 개를 처음부터 다르게 만드는 거예요." },
]

export function Problem() {
  return (
    <Section
      id="problem"
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
          손을 대신하는 복사기가 아니라,{" "}
          <span className="text-foreground">
            <Marker>머리를 대신하는 직원</Marker>
          </span>
          입니다.
        </p>
      </div>

      {/* 인터뷰 기반: 자녀·노후 vs 부업 시간 trade-off — 한국인 정서 */}
      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr]">
        <div className="border-2 border-background/30 p-6">
          <div className="font-mono mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-background/55">
            진짜 비용
          </div>
          <h3 className="mb-3 text-lg font-bold leading-snug tracking-tight sm:text-xl">
            1만 개를 올리는 데 들어간 시간,<br />
            누가 돌려주나요?
          </h3>
          <p className="text-sm leading-relaxed text-background/75">
            아이가 큰 만큼 학원비도 늘고, 노후는 가까워집니다.
            그런데 매일 밤 의미 없는 상품 등록에 새벽을 쓰면,
            <span className="font-bold text-background"> 돈도 시간도 둘 다 잃습니다.</span>
          </p>
        </div>
        <div className="border-2 border-background/30 p-6">
          <div className="font-mono mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-background/55">
            그래서 바꿨습니다
          </div>
          <h3 className="mb-3 text-lg font-bold leading-snug tracking-tight sm:text-xl">
            상품 1만 개가 아니라,<br />
            <span className="text-background">잘 만든 10개.</span>
          </h3>
          <p className="text-sm leading-relaxed text-background/75">
            매일 밤 새 상품을 찍어내지 않아도, 한 번 공들여 만든 효자상품은
            <span className="font-bold text-background"> 자는 동안에도 검색됩니다.</span>
            <br />
            그제서야 가족과 노후가 다시 보이기 시작합니다.
          </p>
        </div>
      </div>
    </Section>
  )
}
