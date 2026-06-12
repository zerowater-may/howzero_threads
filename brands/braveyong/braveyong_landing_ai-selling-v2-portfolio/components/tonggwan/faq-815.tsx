import { Section } from "@/components/section"

const FAQ: [string, string][] = [
  [
    "통관고유부호가 정확히 뭔가요?",
    "세관이 전자상거래 사업자에게 주는 등록번호입니다. 8월부터 수입신고에 필수로 적어야 합니다 — 없으면 구매대행 수입신고가 안 됩니다.",
  ],
  [
    "통관 한 번도 안 해본 왕초보인데 따라갈 수 있나요?",
    "용어 나올 때마다 한 줄씩 풀어서 갑니다. 이 페이지가 그 예고편입니다. 막히면 라이브에서 바로 질문하세요.",
  ],
  [
    "법인사업자도 개인계좌로 되나요?",
    "법인은 인격이 분리돼 다릅니다. 이 동선은 개인사업자 기준이며, 법인은 별도 확인이 필요합니다.",
  ],
  [
    "기존에 등록했는데 또 해야 하나요?",
    "네. 기존 구매대행업자도 신규 시스템에서 재등록 대상입니다.",
  ],
  [
    "통장을 진짜 하나도 안 만들어도 되나요?",
    "개인사업자라면 가능한 경로가 있습니다. 6/21에 순서대로 보여드립니다. (은행별 확인 필수)",
  ],
  [
    "당일 라이브에 못 들어가면요?",
    "결제 후 카톡 오픈채팅방에서 일정과 참여 방법을 안내드립니다.",
  ],
]

export function Faq815() {
  return (
    <Section id="faq" label="FAQ" title={<>결제 전에 보는 질문들.</>}>
      <div className="mx-auto max-w-2xl divide-y divide-foreground/10 border-y border-foreground/10">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold">
              {q}
              <span className="font-mono shrink-0 text-foreground/40 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
