import { Section } from "./section"
import { Marker } from "./handwriting"

/** 06 AI 셀링 정의 — 판매 운영 구조 + 형광펜 1곳 + 반복 루프 5단계 */
const loop = [
  { k: "① 상품 선정", v: "프레임" },
  { k: "② SEO · 상품명", v: "생성·검수" },
  { k: "③ 상세페이지", v: "스토리보드" },
  { k: "④ 등록 전 체크", v: "체크리스트" },
  { k: "↺ 다음 상품 반복", v: "루틴화" },
]

export function AIDefinition() {
  return (
    <Section
      label="AI 셀링이란"
      title={<>AI 셀링은 툴 쓰는 법이 아니에요. 매일 돌리는 판매 운영 구조입니다.</>}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border-l-4 border-foreground bg-background p-6">
          <p className="text-lg font-bold leading-snug sm:text-xl">
            AI가 대신 팔아주는 거 아닙니다.<br />
            제가 매일 하던 상품 선정·SEO·상품명·상세페이지·등록 전 체크를<br />
            AI로 더 빠르게 돌리는 — 그 <Marker>반복 구조</Marker>를 같이 만드는 거예요.
          </p>
          <p className="mt-4 font-memo text-base leading-relaxed text-foreground/70 sm:text-lg">
            강의 한 번 <Marker>듣고 끝나는 셀러</Marker>가 아니라,<br />
            매주 직접 <Marker>손에 잡는 셀러</Marker>로.<br />
            물고기 한 마리가 아니라, 잡는 법을 6주 동안 같이 익혀 갑니다.
          </p>
        </div>

        <div className="border-2 border-foreground bg-background">
          <div className="font-mono border-b-2 border-foreground px-4 py-2 text-[10px] uppercase tracking-[0.15em]">
            AI 셀링 반복 루프
          </div>
          <ul className="divide-y divide-foreground/10">
            {loop.map((it) => (
              <li key={it.k} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">{it.k}</span>
                <span className="font-mono rounded-full border border-foreground/30 px-2.5 py-1 text-[10px] uppercase tracking-wider">
                  {it.v}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
