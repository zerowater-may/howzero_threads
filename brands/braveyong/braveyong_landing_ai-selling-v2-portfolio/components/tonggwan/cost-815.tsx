import { Section } from "@/components/section"

const ROWS: [string, string][] = [
  ["사업자 5개", "약 100,000원 / 년"],
  ["사업자 10개", "약 200,000원 / 년"],
  ["사업자 20개", "약 400,000원 / 년"],
  ["사업자 30개", "약 600,000원 / 년"],
]

export function Cost815() {
  return (
    <Section
      id="cost"
      label="COST"
      title={<>막히면, 그날부터 매출이 멈춥니다</>}
      lead="통관이 막히는 손실은 말할 것도 없고 — 유료 범용 인증서로 가면 매년 이 돈이 나갑니다."
    >
      <div className="mx-auto max-w-xl overflow-hidden border-2 border-foreground">
        {ROWS.map(([k, v], i) => (
          <div
            key={k}
            className={`flex items-center justify-between px-5 py-4 text-sm sm:text-base ${i % 2 ? "bg-foreground/[0.03]" : ""}`}
          >
            <span className="font-bold">{k}</span>
            <span className="font-mono tabular-nums text-foreground/80">{v}</span>
          </div>
        ))}
        <div className="flex items-center justify-between bg-brand px-5 py-4 text-brand-foreground">
          <span className="font-bold">오늘 배우는 방법이면</span>
          <span className="font-mono text-lg font-bold tabular-nums">0원</span>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-xl text-center text-xs text-foreground/55">
        범용 인증서 약 2만원/년/사업자 기준. 사업자가 많을수록 격차가 커집니다.
      </p>
    </Section>
  )
}
