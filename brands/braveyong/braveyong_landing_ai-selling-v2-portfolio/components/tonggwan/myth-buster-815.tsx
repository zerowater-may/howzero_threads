import { Section } from "@/components/section"

/**
 * 문제/질문 — 통장·인증서·20영업일 3대 난제를 '답 없이' 질문으로만 세운다.
 * How(개인계좌 연결·순서)는 특강 내용이라 페이지에서 한 글자도 풀지 않는다 — 잠금 원칙.
 * 전환 공식: 생생한 문제 → 답 못 할 날카로운 질문 → "길이 있다. 6/21에 공개".
 */
type Knot = {
  problem: string
  question: string
}

const KNOTS: Knot[] = [
  {
    problem: "통장은 한 달에 하나, 사업자는 10개.",
    question: "이 산수, 어떻게 푸시겠어요?",
  },
  {
    problem: "통장이 없으면 인증서도 없고, 인증서가 없으면 구매대행도 못 합니다.",
    question: "이 고리, 어디서 끊으시겠어요?",
  },
  {
    problem: "급해서 창구로 달려가면 — “20영업일 뒤에 오세요.”",
    question: "이 줄에 안 서는 방법이 따로 있습니다.",
  },
]

export function MythBuster815() {
  return (
    <Section
      id="myth"
      tone="dark"
      label="풀리지 않는 세 가지"
      title={<>당신을 멈추게 한 건 8월이 아니라, 풀리지 않는 이 세 가지입니다.</>}
      lead="구매대행 사장님들 단톡방이 멈춘 이유가 이 셋입니다. 하나씩 보세요 — 지금 당신도 여기 막혀 있을 겁니다."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {KNOTS.map((k, i) => (
          <div key={i} className="flex flex-col border border-background/15 bg-background/[0.04] p-5">
            <span className="font-mono text-sm font-bold text-background/40">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="mt-2 text-base font-bold leading-snug text-background">{k.problem}</p>
            <div className="my-4 h-px bg-background/12" />
            <p className="text-sm font-bold leading-relaxed text-background/80">
              <span className="mr-1.5 inline-flex rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-foreground">
                Q
              </span>
              {k.question}
            </p>
          </div>
        ))}
      </div>

      {/* 답은 잠그고, 길이 있다는 것만 — 6/21로 */}
      <p className="mx-auto mt-7 max-w-2xl border-l-2 border-brand bg-background/[0.06] px-4 py-3 text-sm leading-relaxed text-background/85 sm:text-base">
        셋 다 빠져나가는 길이 있습니다. 단, <span className="font-bold text-background">순서를 알아야 합니다.</span>{" "}
        그 순서가 6/21입니다.
      </p>
    </Section>
  )
}
