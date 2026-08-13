import { Section } from "./section"
import { PaymentDialog } from "./payment-dialog"
import { course, priceText } from "@/lib/config"

/**
 * 05-B 1년 뒤 두 사람 — 무료특강 덱 P1(p1-05, p1-05c)을 랜딩으로 옮긴 섹션.
 *
 * 핵심은 "지금 두 사람 중 어느 쪽인가"가 아니라 "격차가 왜 계속 벌어지는가"다.
 * 근거는 덱 p8-08b: "질문은 한 번 쓰고 버리지만, 지침은 쌓여서 계속 일을 합니다."
 * AI 직원 쪽은 기준이 누적되고 맨손은 매일 0에서 다시 시작한다 —
 * 이 비대칭이 시간이 갈수록 벌어지는 이유이고, 근거 없는 배수·통계는 쓰지 않는다.
 */
const before = {
  label: "1년 뒤에도 똑같은 나",
  time: "밤 11시",
  items: [
    "아이 재우고 나와서 노트북을 켠다",
    "상품 하나 등록하는 데 2시간",
    "상품명 고치고 번역기 돌리다 새벽",
    "내일 또 출근",
  ],
}

const after = {
  label: "저녁 30분이면 끝나는 나",
  time: "저녁 9시",
  items: [
    "휴대폰으로 낮에 해둔 일만 확인",
    "소싱 리스트·상세페이지·CS 초안 완료",
    "검수 30분이면 오늘 업무 끝",
    "아이 옆에서 같이 잠",
  ],
}

export function OneYearGap() {
  return (
    <Section
      id="gap"
      tone="dark"
      label="1년 뒤"
      title={<>같은 1년인데, 두 사람이 갈립니다.</>}
      lead="지금부터 1년 뒤의 사장님을 두 명으로 보여드릴게요. 둘 다 사장님입니다. 지금 어떤 선택을 하느냐에 따라 갈립니다."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {/* 왼쪽 — 그대로인 쪽 */}
        <div className="border-2 border-background/25 bg-background/[0.03] p-6 sm:p-7">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-background/45">
            {before.time}
          </div>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-background/80 sm:text-2xl">
            {before.label}
          </h3>
          <ul className="mt-5 space-y-2.5">
            {before.items.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm leading-relaxed text-background/60 sm:text-base">
                <span className="mt-[9px] h-1 w-1 flex-none rounded-full bg-background/30" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* 오른쪽 — 넘긴 쪽 */}
        <div className="border-2 border-brand bg-brand/[0.08] p-6 shadow-[0_6px_0_var(--brand)] sm:p-7">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-brand">
            {after.time}
          </div>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-background sm:text-2xl">
            {after.label}
          </h3>
          <ul className="mt-5 space-y-2.5">
            {after.items.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm leading-relaxed text-background/85 sm:text-base">
                <span className="mt-[9px] h-1 w-1 flex-none rounded-full bg-brand" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 격차가 왜 계속 벌어지는가 — 이 섹션의 진짜 메시지 */}
      <div className="mt-8 border-2 border-background/25 bg-background/[0.04] p-6 sm:p-8">
        <h3 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          그리고 이 격차는 <span className="text-brand">1년에서 멈추지 않습니다.</span>
        </h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="border-l-2 border-brand pl-4">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
              AI 직원을 만든 쪽
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-background/85 sm:text-base">
              일을 시킬 때마다 기준이 쌓입니다. 오늘 가르친 게 내일도 남아 있고, 모레는 거기에 하나 더 얹혀요.
              1년이면 내 머릿속 기준이 통째로 옮겨져 있습니다.
            </p>
          </div>
          <div className="border-l-2 border-background/25 pl-4">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-background/45">
              맨손으로 하는 쪽
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-background/65 sm:text-base">
              어제 두 시간 걸려 상품 하나를 올렸어도, 오늘 새 상품엔 또 두 시간이 듭니다.
              어제 한 일이 오늘을 도와주지 않아요. 매일 0에서 다시 시작합니다.
            </p>
          </div>
        </div>
        <p className="font-memo mt-6 border-t border-background/15 pt-5 text-base leading-relaxed text-background sm:text-lg">
          한쪽은 계속 쌓이고 한쪽은 계속 제자리라, 2년 3년 가면 따라잡기가 아예 어려워집니다.<br />
          <span className="font-bold">그래서 시작하는 시점이 중요합니다.</span>
        </p>

        <div className="mt-6 flex flex-col items-start gap-2">
          <PaymentDialog
            amount={course.priceFirst}
            label={priceText.payLabel}
            dark
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-7 py-4 text-base font-bold tracking-tight text-brand-foreground transition-all hover:opacity-90 sm:w-auto sm:px-9"
          />
          <span className="text-xs text-background/55">
            {course.cohort} {course.startDate} 개강 · 정원 {course.capacityMax}명 · 수강료 {priceText.total}(부가세 포함)
          </span>
        </div>
      </div>
    </Section>
  )
}
