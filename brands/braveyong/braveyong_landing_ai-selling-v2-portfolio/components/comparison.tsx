import { Section } from "./section"
import { Check } from "lucide-react"

/**
 * 13 비교표 — 흔한 온라인 강의 vs 5주 오프라인 실전반.
 * 인터뷰 톤: '녹화 한 묶음이 아니라 같이 만드는 과정'을 줄 단위로 풀어둔다.
 */
const rows = [
  ["진행 방식", "녹화 보다가 막히면 거기서 끝", "현장에서 같이 풀어드려요"],
  ["남는 것", "강의 노트 한 묶음", "내가 직접 만든 효자상품 10개"],
  ["피드백", "댓글로만, 보통 일괄 답변", "내 상품·내 스토어 보고 1:1로"],
  ["중간 점검", "없어요. 못 따라가도 아무도 몰라요", "줌 보강 4회 + 매주 과제 같이"],
  ["SEO 검증", "공식 한 줄로 끝", "키워드별 순위 직접 모니터링"],
  ["졸업 후", "끝. 그 다음은 알아서", "매월 오프라인 스터디 (선택)"],
  ["선별", "누구나 결제만 하면 OK", "신청서 보고 한 분씩 직접"],
]

export function Comparison() {
  return (
    <Section
      tone="dark"
      label="무엇이 다른가"
      title={<>듣는 강의가 아니라, 만드는 실전반입니다.</>}
      lead="같은 5주여도, 끝나고 내 손에 뭐가 남는지가 달라요."
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
                5주 오프라인 실전반
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
