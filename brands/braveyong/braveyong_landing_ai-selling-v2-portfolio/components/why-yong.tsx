import { Section } from "./section"
import { Signature } from "./handwriting"
import { Check } from "lucide-react"

/** 10 왜 용팀장인가 — 인용 + 펜글씨 서명 + 인터뷰 scene 4개 */
const directions = [
  "회사 다니던 직장인 · 지금도 현업 셀러",
  "아이 학교 보내고 공유오피스로 출근",
  "1만 개 따라 올린 것 중에서 검색에 잡힌 몇 개를, 데이터 보면서 직접 가공",
  "상품명을 하루에 하나씩 만들면서, 순위 변화로 직접 검증",
  <>오후 4시 이후 CS는 일부러 보지 않습니다 — <span className="font-bold">가족 시간을 지키는 시스템</span></>,
  <>강의보다 <span className="font-bold">실행과 졸업 후 스터디</span>를 더 중요하게 생각합니다</>,
]

export function WhyYong() {
  return (
    <Section
      label="왜 용팀장인가"
      title={
        <>
          유명한 사람이 파는 강의가 아니라,<br className="hidden sm:block" />
          현업셀러가 직접 막혀본 작업법입니다.
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border-l-4 border-foreground bg-background p-6">
          <p className="text-lg font-bold leading-snug sm:text-xl">
            저도 회사 다니면서, 애 재우고 새벽에 상품 올렸습니다.<br />
            그래서 <span className="text-foreground">시간이 부족한 셀러가 왜 무작정 많이 올리면 안 되는지</span> 압니다.
          </p>
          <p className="font-memo mt-4 text-sm leading-relaxed text-foreground/70 sm:text-base">
            쉽게 돈 버는 건 아닙니다.<br />
            그런데 되는 방향은 맞습니다.
          </p>
          <div className="mt-6 text-right">
            <Signature small="현업 셀러 · 부동산 투자자 · 회사 다니던 직장인 · 육아 아빠">— 용감한 용팀장 드림</Signature>
          </div>
        </div>

        <div className="border-2 border-foreground bg-background p-6">
          <ul className="space-y-3">
            {directions.map((d, i) => (
              <li key={i} className="flex items-start gap-3 text-sm sm:text-base">
                <Check className="mt-0.5 h-4 w-4 flex-none" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-6 text-xs text-foreground/55">
        ※ 이 과정은 수익을 단정하거나 매출을 보장하지 않습니다. AI가 대신 팔아준다고 말하지 않습니다.
      </p>
    </Section>
  )
}
