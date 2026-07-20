import { Section } from "./section"
import { ArrowRight } from "lucide-react"
import { course, priceText } from "@/lib/config"
import { CountdownTimer } from "@/components/countdown-timer"
import { PaymentDialog } from "@/components/payment-dialog"

/**
 * 마감 타임라인 — 가짜 잔여석이 아니라 개강일·정원이라는 진짜 마감.
 * 얼리버드/정가 이중 가격은 폐지됐으므로(2026-07-20) "가격이 오른다"가 아니라
 * "개강하면 못 들어온다"로 긴급성의 근거를 바꿨다.
 */
const timeline = [
  {
    time: "지금",
    title: `${course.cohort} 모집 중`,
    body: `정원 ${course.capacityMax}명. 결제 순서대로 자리가 확정됩니다.`,
    done: true,
  },
  {
    time: course.startDate,
    title: "개강",
    body: "1주차부터 AI 직원 세팅을 같이 합니다. 중간 합류는 받지 않아요.",
    done: false,
  },
  {
    time: "개강 후",
    title: "3기까지 대기",
    body: "다음 기수 일정은 2기 끝나고 정합니다. 기다리는 동안 상품은 그대로예요.",
    done: false,
  },
]

export function Scarcity() {
  return (
    <Section
      tone="warm"
      label="개강 전 마감"
      title={<>{course.startDate} 개강하면 닫힙니다.</>}
      lead={`압박하려고 만든 가짜 마감이 아니에요. 정원 ${course.capacityMax}명이고, 1주차에 AI 직원 세팅부터 같이 하기 때문에 중간에 합류하실 수가 없습니다.`}
    >
      {/* 큰 카운트다운 — 눈에 가장 먼저 들어오게.
          '개강 전 결제 마감까지' 문구는 CountdownTimer 밖에 별도 div로 두면
          마감(7/24 자정) 후 카운트다운만 사라지고 이 문구가 덩그러니 남는다.
          label로 넘겨 카운트다운과 함께 사라지게 한다. */}
      <div className="flex flex-col items-center border-2 border-brand bg-background px-5 py-7 text-center sm:py-8">
        <CountdownTimer
          className="scale-[1.35] text-foreground sm:scale-[1.7]"
          label="개강 전 결제 마감까지"
        />
        <p className="mt-6 text-base font-bold leading-snug tracking-tight sm:text-lg">
          수강료 <span className="text-brand">{priceText.headline}</span>
          <span className="ml-1.5 text-sm font-normal text-foreground/60">
            부가세 별도 · 포함 {priceText.total}
          </span>
        </p>
        <PaymentDialog
          amount={course.priceFirst}
          label={priceText.payLabel}
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
