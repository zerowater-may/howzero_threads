import { Section } from "./section"

/**
 * 12 반론 차단 — 6종 (인터뷰 언어 패턴 적용).
 * 보장 없이 사실로만. SEO 공식·하루 1시간 누구나 회의는 인터뷰 그대로.
 */
const objections = [
  {
    q: "이미 늦은 거 아닌가요?",
    a: "늦은 게 아닙니다. 다들 똑같이 1만 개를 올리는 시장이 됐으니까, 다르게 만든 10개가 오히려 더 잘 보이는 시장이 된 거예요. AI 도구도 지금이 가장 쓰기 쉽습니다.",
  },
  {
    q: "시간이 없는데 6주 가능할까요?",
    a: "그래서 매주 1~2개씩, 6주에 총 10개로 쪼갰습니다. 저도 직장·육아 병행했고, 그 기준으로 설계했습니다.",
  },
  {
    q: "AI를 잘 몰라요.",
    a: "툴 사용법이 목적이 아니라, 반복하는 구조가 목적입니다. AI는 대신 벌어주는 도구가 아니라 판단을 더 빠르게 반복하게 만드는 시스템입니다.",
  },
  {
    q: "오프라인 못 가는 주가 있으면요?",
    a: "줌 보강 5회와 매주 과제로 보완합니다. 다만 대부분 참석 가능한 분을 신청서에서 확인합니다.",
  },
  {
    q: "SEO는 공식만 알면 끝나는 거 아닌가요?",
    a: "한 줄 공식이면 모두가 1페이지에 올렸을 겁니다. 상품명·키워드·카테고리·순위 모니터링을 직접 검증하는 작업입니다. 6주 동안 같이 보면서 감이 아니라 숫자로 잡아 드립니다.",
  },
  {
    q: "‘하루 1시간이면 누구나’ 같은 강의 아닌가요?",
    a: "아닙니다. 그런 말은 처음부터 하지 않습니다. 쉽게 돈 버는 강의가 아니라, 시행착오 시간을 줄여 드리는 강의입니다.",
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
