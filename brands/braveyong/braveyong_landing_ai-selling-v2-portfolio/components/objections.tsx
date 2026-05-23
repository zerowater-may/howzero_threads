import { Section } from "./section"

/** 12 반론 차단 — 4종 (보장 없이 사실로만) */
const objections = [
  {
    q: "이미 늦은 거 아닌가요?",
    a: "대량등록 경쟁이 과열될수록, 다르게 만든 상품의 가치는 오히려 커집니다. AI 셀링 도구도 지금이 가장 접근하기 좋습니다.",
  },
  {
    q: "시간이 없는데 6주 가능할까요?",
    a: "그래서 매주 1~2개씩, 6주에 총 10개로 쪼갰습니다. 직장·육아를 병행하는 기준으로 설계했습니다.",
  },
  {
    q: "AI를 잘 몰라요.",
    a: "툴 사용법이 목적이 아니라, 반복하는 구조가 목적입니다. 현장에서 같이 따라 만듭니다.",
  },
  {
    q: "오프라인 못 가는 주가 있으면요?",
    a: "줌 보강 5회와 매주 과제로 보완합니다. 다만 대부분 참석 가능한 분을 신청서에서 확인합니다.",
  },
]

export function Objections() {
  return (
    <Section
      label="망설이고 있다면"
      title={<>자주 하는 망설임, 사실대로 답합니다.</>}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {objections.map((o) => (
          <div key={o.q} className="border-2 border-foreground bg-background p-6">
            <h3 className="mb-2 text-base font-bold tracking-tight">“{o.q}”</h3>
            <p className="text-sm leading-relaxed text-foreground/70">{o.a}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
