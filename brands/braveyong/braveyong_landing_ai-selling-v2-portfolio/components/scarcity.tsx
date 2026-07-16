import { Section } from "./section"
import { Clock, ArrowRight } from "lucide-react"
import { course } from "@/lib/config"
import { CountdownTimer } from "@/components/countdown-timer"
import { PaymentDialog } from "@/components/payment-dialog"

/** 얼리버드(7/10) 마감-상대 타임어택 — 거짓 잔여석 아님, 마감일·정원 기준 진짜 마감. */
const priceFirst = (course.priceFirstSupply / 10000).toLocaleString() // 230 (부가세 별도)
const priceRegular = (course.priceRegularSupply / 10000).toLocaleString() // 250 (부가세 별도)

const timeline = [
  {
    time: "지금",
    title: "2기 모집 중",
    body: "여기까지 오신 분만 얼리버드가가 열립니다.",
    done: true,
  },
  {
    time: "마감 임박",
    title: `얼리버드가 ${priceFirst}만원 마감`,
    body: "마감 전까지만. 지나면 이 가격은 닫힙니다.",
    done: false,
  },
  {
    time: "마감 후",
    title: `정가 ${priceRegular}만원`,
    body: `지금 안 하면 다음엔 ${priceRegular}만원. ${(course.priceRegularSupply - course.priceFirstSupply) / 10000}만원 차이가 그냥 시간으로 생깁니다.`,
    done: false,
  },
]

export function Scarcity() {
  return (
    <Section
      tone="warm"
      label="얼리버드 마감 임박"
      title={<>지금 시작하면, 얼리버드가.</>}
      lead={`압박하려고 만든 가짜 마감이 아니에요. 여기까지 오신 분께만 여는 얼리버드가라, 개강하거나 정원이 차면 진짜로 닫힙니다.`}
    >
      {/* 큰 카운트다운 — 눈에 가장 먼저 들어오게 */}
      <div className="flex flex-col items-center border-2 border-brand bg-background px-5 py-7 text-center sm:py-8">
        <div className="font-mono inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
          <Clock className="h-3.5 w-3.5" />
          얼리버드 마감까지 남은 시간
        </div>
        <CountdownTimer className="mt-3 scale-[1.6] text-foreground sm:scale-[2]" />
        <p className="mt-6 text-base font-bold leading-snug tracking-tight sm:text-lg">
          지금 <span className="text-brand">{priceFirst}만원</span>, 마감 후에는{" "}
          <span className="text-foreground/45 line-through">{priceRegular}만원</span>
        </p>
        <PaymentDialog
          amount={course.priceFirst}
          label={`지금 얼리버드가 ${priceFirst}만원 결제`}
          className="mt-5 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-6 py-4 text-base font-bold text-brand-foreground transition-all hover:opacity-90"
        />
        <p className="mt-3 text-xs text-foreground/55">
          이름·휴대폰만 넣으면 결제창이 바로 열려요. 카드 무이자 할부 가능.
        </p>
      </div>

      {/* 마감-상대 타임라인 — 모집 중 → 마감 임박 → 마감 후 정가 */}
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {timeline.map((step, i) => (
          <div
            key={step.time}
            className={`relative border-2 p-5 ${
              i === 1
                ? "border-brand bg-background"
                : "border-[var(--warm-border)] bg-background"
            }`}
          >
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/50">
              {step.time}
            </div>
            <h3 className="mt-2 flex items-center gap-1.5 text-base font-bold tracking-tight">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{step.body}</p>
            {i < timeline.length - 1 && (
              <ArrowRight className="absolute -right-2.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-[var(--warm-border)] md:block" />
            )}
          </div>
        ))}
      </div>

      {/* 인터뷰 톤 — 강의 쇼핑 굴레에서 빠져나오자는 정직한 한 줄 */}
      <p className="font-memo mt-8 text-base leading-relaxed text-foreground/80 sm:text-lg">
        매번 다른 강의를 또 결제하고, 또 혼자 막히는 자리에 돌아오지 마세요.<br />
        이번 한 번 제대로, 같이 끝까지 갑니다.
      </p>
    </Section>
  )
}
