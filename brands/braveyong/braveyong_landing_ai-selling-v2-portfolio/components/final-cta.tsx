import { Signature } from "./handwriting"
import { course, priceText } from "@/lib/config"
import { PaymentDialog } from "./payment-dialog"
import { CountdownTimer } from "./countdown-timer"

/**
 * 18 최종 CTA (다크) — 결제 단일 CTA + 개강 전 마감 + 흰 펜글씨 서명.
 * 결제 버튼 바로 아래 있던 "신청서부터 작성하기"(구글폼)는 제거.
 * 마지막 화면에서 결제 대신 폼으로 새는 경로였다.
 */
export function FinalCTA() {
  return (
    <section className="bg-foreground px-4 py-24 text-background sm:px-6 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        {/* 인터뷰 기반 한국인 정서 카피 — 자산형 vs 현금흐름형 */}
        <p className="font-memo mb-4 text-sm leading-relaxed text-background/65 sm:text-base">
          월급도, 모아둔 자산도 있는데<br />
          매월 들어오는 돈은 또 따로 필요하더라고요.
        </p>

        <h2 className="text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl md:text-5xl">
          {course.cohort} 개강 전까지만<br className="sm:hidden" /> 받습니다
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 sm:text-lg">
          혼자 다 하는 방식, 정말로 한번 바꿔보고 싶으시면{" "}<br className="hidden sm:block" />
          그때 하신 그 결심, 지금 바로 잡으세요.
        </p>

        {/* 가격 — 큰 숫자는 월 납입액(카드 6개월 무이자), 총액은 위·아래에 그대로 밝힌다.
            총액에 취소선은 긋지 않는다 — 실제 청구액이라 긁으면 없는 할인을 만든다. */}
        <div className="mx-auto mt-8 inline-flex flex-col items-center gap-1">
          <span className="text-sm font-bold tabular-nums text-background/50">
            {priceText.totalExact} 부가세 포함
          </span>
          <span className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-background/70 sm:text-2xl">월</span>
            <span className="text-4xl font-bold tabular-nums sm:text-5xl">{priceText.monthly6Exact}</span>
          </span>
          <span className="font-mono mt-1 text-[11px] uppercase tracking-[0.14em] text-background/55">
            카드 6개월 무이자 기준 · 일시불 {priceText.total} (부가세 포함) · 정원 {course.capacityMax}명
          </span>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm font-bold text-background sm:text-base">
            {course.startDate} 개강 · 개강하면 {course.cohort}는 닫힙니다
          </p>
          <CountdownTimer className="text-background" label="개강 전 결제 마감까지" />
        </div>

        <div className="mt-8 flex justify-center">
          <div data-track="final_pay" className="contents">
            <PaymentDialog
              amount={course.priceFirst}
              label={priceText.payLabel}
              dark
              className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-8 py-5 text-base font-bold uppercase tracking-[0.08em] text-brand-foreground transition-all hover:opacity-90 sm:text-lg"
            />
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-background/55 sm:text-sm">
          이름과 연락처만 넣으면 결제창이 바로 열립니다.<br />
          결제하시면 용팀장이 카톡으로 1주차 일정·장소를 직접 챙겨 드릴게요.
        </p>

        <div className="mt-10 text-background">
          <Signature small={<span className="text-background/55">현업 셀러 · 부동산 투자자 · 직장인 · 육아 아빠</span>}>
            — 용감한 용팀장 드림
          </Signature>
        </div>
      </div>
    </section>
  )
}
