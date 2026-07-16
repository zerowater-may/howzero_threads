import { Signature } from "./handwriting"
import { config, course } from "@/lib/config"
import { PaymentDialog } from "./payment-dialog"
import { CountdownTimer } from "./countdown-timer"

/** 18 최종 CTA (다크) — 결제 단일 CTA + 타임어택 + 흰 펜글씨 서명 */
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
          정원 마감 전까지만<br className="sm:hidden" /> 얼리버드가
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 sm:text-lg">
          혼자 다 하는 방식, 정말로 한번 바꿔보고 싶으시면{" "}<br className="hidden sm:block" />
          그때 하신 그 결심, 지금 바로 잡으세요.
        </p>

        {/* 가격 앵커링 + 얼리버드 마감 urgency */}
        <div className="mx-auto mt-8 inline-flex flex-col items-center gap-1">
          <span className="text-sm text-background/50">
            <s>정가 250만원</s>
          </span>
          <span className="text-4xl font-bold tabular-nums sm:text-5xl">
            지금 230만원
          </span>
          <span className="font-mono mt-1 text-[11px] uppercase tracking-[0.14em] text-background/55">
            부가세 별도
          </span>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm font-bold text-background sm:text-base">
            얼리버드 마감 임박 · 마감 후 정가 250만원
          </p>
          <CountdownTimer className="text-background" />
        </div>

        <div className="mt-8 flex justify-center">
          <div data-track="final_pay" className="contents">
            <PaymentDialog
              amount={course.priceFirst}
              label="얼리버드가 — 지금 결제 230만원"
              dark
              className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-8 py-5 text-base font-bold uppercase tracking-[0.08em] text-brand-foreground transition-all hover:opacity-90 sm:text-lg"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <a
            href={config.googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="신청서 작성하기 — 약 1분, 새 창에서 열림"
            data-track="final_apply_form"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-background bg-transparent px-6 py-3.5 text-sm font-bold text-background transition-all hover:bg-background hover:text-foreground"
          >
            신청서부터 작성하기 (약 1분)
          </a>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-background/55 sm:text-sm">
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
