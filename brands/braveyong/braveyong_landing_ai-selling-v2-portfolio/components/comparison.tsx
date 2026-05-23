import { Section } from "./section"
import { Check } from "lucide-react"

/** 13 비교표 — 일반 온라인 강의 vs 6주 오프라인 실전반 */
const rows = [
  ["진행", "영상 시청", "현장 작업 + 피드백"],
  ["결과물", "지식", "효자상품 10개 (직접 완성)"],
  ["피드백", "없음 / 일괄", "상품·스토어 1:1"],
  ["중간 점검", "없음", "줌 보강 5회 + 매주 과제"],
  ["졸업 후", "종료", "매월 오프라인 스터디 (선택)"],
  ["인원", "무제한", "10~15명 소수정예"],
]

export function Comparison() {
  return (
    <Section
      tone="dark"
      label="무엇이 다른가"
      title={<>듣는 강의가 아니라, 만드는 실전반입니다.</>}
    >
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[480px] border-2 border-background/30 bg-foreground text-background">
          <thead>
            <tr className="border-b-2 border-background/30">
              <th className="font-mono w-1/4 px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-background/55">
                항목
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-background/70">일반 온라인 강의</th>
              <th className="border-l-2 border-background/30 bg-background text-foreground px-4 py-3 text-left text-sm font-bold">
                6주 오프라인 실전반
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, a, b], i) => (
              <tr key={k} className={i < rows.length - 1 ? "border-b border-background/15" : ""}>
                <td className="px-4 py-3 text-sm font-bold">{k}</td>
                <td className="px-4 py-3 text-sm text-background/55">{a}</td>
                <td className="border-l-2 border-background/30 bg-background text-foreground px-4 py-3 text-sm font-bold">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    {b}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
