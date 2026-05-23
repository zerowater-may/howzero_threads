import { Section } from "./section"
import { Signature } from "./handwriting"
import { Check } from "lucide-react"

/** 10 왜 용팀장인가 — 인용 + 펜글씨 서명 + 핵심 방향 */
const directions = [
  "직장인이자 육아아빠",
  "지금도 직접 상품을 올리는 현업셀러",
  "대량등록의 한계와 막힘을 직접 겪어본 사람",
  <>강의 쇼핑보다 <span className="font-bold">실행 구조</span>를 강조하는 사람</>,
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
            저도 직장 다니고, 애 재우고 나서 상품 올렸습니다.<br />
            그래서 <span className="text-foreground">시간이 부족한 셀러가 왜 무작정 많이 올리면 안 되는지</span> 압니다.
          </p>
          <div className="mt-6 text-right">
            <Signature small="현업 셀러 · 직장인 · 육아 아빠">— 용감한 용팀장 드림</Signature>
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
