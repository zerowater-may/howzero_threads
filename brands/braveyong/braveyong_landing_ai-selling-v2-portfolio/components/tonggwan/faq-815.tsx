import { Section } from "@/components/section"

const FAQ: [string, string][] = [
  ["법인사업자도 개인계좌로 되나요?", "법인은 인격이 분리돼 다릅니다. 이 동선은 개인사업자 기준이며, 법인은 별도 확인이 필요합니다."],
  ["은행에서 거절당하면요?", "은행·지점마다 정책이 달라 생길 수 있는 일입니다. 다른 은행/비대면을 시도하고, 그래도 막히면 금융인증서·세관 직접 제출로 우회합니다. 특강에서 다 다룹니다."],
  ["인증서 없이 등록도 되나요?", "인증서 구비가 어려우면 통관지 세관에 서류를 직접 제출하는 오프라인 경로가 있습니다."],
  ["기존에 등록했는데 또 해야 하나요?", "네. 기존 구매대행업자도 신규 시스템에서 재등록 대상입니다."],
  ["통장을 진짜 하나도 안 만들어도 되나요?", "개인계좌 연결을 허용하는 은행이라면 추가 통장 없이 진행 가능합니다. (은행별 확인 필수)"],
  ["당일 라이브에 못 들어가면요?", "결제 후 카톡 오픈채팅방에서 일정과 참여 방법을 안내드립니다."],
]

export function Faq815() {
  return (
    <Section id="faq" label="FAQ" title={<>자주 묻는 질문</>}>
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
