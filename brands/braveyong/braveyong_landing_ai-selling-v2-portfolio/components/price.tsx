import { Section } from "./section"
import { ArrowNote } from "./handwriting"
import { CountdownTimer } from "./countdown-timer"
import { PaymentDialog } from "@/components/payment-dialog"
import { config, course } from "@/lib/config"

/**
 * 14 가격 — 1기 마감 전까지 타임어택 오퍼.
 * 정가 250만원 strike + 1기 특별가 198만원 강조 + 카운트다운 + 즉시 결제.
 * 신청서/구글폼 흐름 제거 — 결제 단일 CTA.
 */
export function Price() {
  return (
    <Section id="price" label="가격" title={<>가격은 공개합니다.</>}>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative border-2 border-[var(--warm-border)] bg-background p-7 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
          <span className="font-mono absolute -top-3 left-6 inline-block bg-brand px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-foreground">
            1기 마감 임박 · 1기 특별가
          </span>
          <div className="text-sm font-bold text-foreground/70">
            5주 오프라인 AI 셀링 실전반 · {course.cohort}
          </div>

          {/* 타임어택 카운트다운 — 1기 마감 (마감 후 자동 숨김) */}
          <div className="mt-3">
            <CountdownTimer className="text-brand" />
          </div>

          {/* 가격 앵커링 — 정가 250만 strike + 1기 특별가 198만 큰 숫자 */}
          <div className="mt-3 flex items-baseline gap-3">
            <s className="text-2xl font-bold text-foreground/40 tabular-nums">
              {(course.priceRegular / 10000).toLocaleString()}만원
            </s>
            <span className="font-mono rounded-full bg-[var(--warm)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--warm-border)]">
              마감되면 정가
            </span>
          </div>
          <div className="mt-1 text-5xl font-bold tracking-tight tabular-nums">
            {(course.priceFirst / 10000).toLocaleString()}
            <span className="ml-1 text-lg font-bold text-foreground/65">만원</span>
            <span className="ml-2 text-sm font-bold text-foreground/55">(부가세 포함)</span>
          </div>
          <div className="font-mono mt-1 text-xs font-bold uppercase tracking-[0.12em] text-brand">
            1기 마감 전까지만 · {(((course.priceRegular - course.priceFirst) / course.priceRegular) * 100).toFixed(0)}% off
          </div>

          <div className="mt-3">
            <ArrowNote>1기 얼리버드 특별가예요</ArrowNote>
          </div>

          {/* 타임어택 큰 결제 버튼 — 위쪽·강조 (Clarity: 거의 안 내림) */}
          <PaymentDialog
            amount={course.priceFirst}
            label={`1기 특별가 — 지금 결제 ${(course.priceFirst / 10000).toLocaleString()}만원`}
            className="group mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-brand bg-brand px-6 py-4 text-base font-bold tracking-tight text-brand-foreground transition-all hover:opacity-90 sm:py-5 sm:text-lg"
          />

          <div className="font-mono mt-4 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wider">
            <span className="rounded-full border border-foreground/30 px-2.5 py-1">카드 결제</span>
            <span className="rounded-full border border-foreground/30 px-2.5 py-1">계좌이체</span>
            <span className="rounded-full border border-[var(--warm-border)] bg-[var(--warm)] px-2.5 py-1 font-bold text-[var(--warm-border)]">
              💳 카드 무이자 할부 가능
            </span>
          </div>

          {/* 할부 부담 완화 한 줄 — 사람 말투 */}
          <p className="font-memo mt-3 text-sm leading-relaxed text-foreground/75 sm:text-base">
            한 번에 부담되시면, <span className="font-bold text-foreground">카드 3·6개월 무이자 할부</span>로 나눠 결제하실 수 있습니다.<br />
            6개월 무이자면 <span className="font-bold text-foreground">월 33만원</span>대부터예요.
          </p>

          <hr className="my-5 border-foreground/10" />

          {/* 타임어택 — 진짜 이유 (가짜 긴급 X) */}
          <div className="border-l-2 border-brand bg-brand/[0.06] px-4 py-3">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
              왜 1기 마감 전까지?
            </div>
            <p className="mt-1 text-sm leading-relaxed text-foreground/85 sm:text-base">
              지금 1기 모집 중 — 곧 마감됩니다. <span className="font-bold text-foreground">실행 사례를 같이 만들 1기 분들 가격</span>이라,{" "}
              <span className="font-bold text-foreground">선착순 마감 전까지만</span> 198만원입니다.{" "}
              정원이 차거나 마감일이 지나면 2기 정가 <span className="font-bold text-foreground">250만원</span>으로 돌아가요.
            </p>
          </div>

          {/* CTA 직전 감정 정당화 — 결제 결심을 도와주는 한 줄 */}
          <p className="font-memo mt-4 rounded border-l-2 border-foreground bg-background/60 px-3 py-2 text-sm leading-relaxed text-foreground">
            받는 건 5주가 아니라,<br />
            <span className="font-bold">내가 직접 만든 효자상품 10개</span>
            와, 졸업 후에도 같이 가는 사람들입니다.
          </p>

          {/* 결제 전 궁금하면 — 보조 채널(1:1 카톡)만 */}
          <p className="mt-4 text-sm leading-relaxed text-foreground/65">
            결제 전에 궁금한 게 있으면,{" "}
            <a
              href={config.kakao1to1Url}
              target="_blank"
              rel="noopener noreferrer"
              data-track="price_ask_1to1"
              className="font-bold text-foreground underline underline-offset-4 hover:text-brand"
            >
              1:1 카톡으로 용팀장에게 직접
            </a>{" "}
            물어보셔도 돼요.
          </p>
        </div>

        <div className="space-y-3">
          <div className="border-l-4 border-foreground bg-background p-5 text-sm leading-relaxed">
            <p className="text-foreground/75">
              1기는 첫 기수예요. 실행 사례·후기를 같이 만들 분들이라, 그만큼 가격을 낮췄습니다.<br />
              <br />
              <span className="font-bold text-foreground">대신 5주 진심으로 함께할 분만 오세요.</span>
              <br />
              오프라인에 직접 오시고, 줌 보강 들으시고, 매주 과제 같이 해주실 분. 결제하시면 용팀장이 카톡으로 1주차 일정·장소를 바로 챙겨 드릴게요.
            </p>
          </div>
          <div className="border-l-4 border-foreground bg-background p-5 text-sm leading-relaxed">
            <p className="text-base font-bold leading-snug text-foreground sm:text-lg">
              <span className="marker">녹화강의가 아니에요.</span>
            </p>
            <p className="mt-3 text-foreground/75">
              5주 동안 각자의 상품을 같이 보고, 효자상품 10개를 손으로 직접 완성하는{" "}
              <span className="font-bold text-foreground">오프라인 실전반</span>이에요.<br />
              PDF·녹화 한 묶음에 매기는 값이 아니라, 같이 만드는 5주 자체에 대한 값입니다.
            </p>
          </div>
          <div className="border-l-4 border-[var(--warm-border)] bg-[var(--warm)] p-5 text-sm leading-relaxed">
            <p className="font-memo text-foreground">
              <span className="font-bold">쉽게 돈 버는 건 아닙니다.</span>
              <br />
              그런데 되는 방향은 맞습니다.
              <span className="font-mono ml-2 text-[10px] uppercase tracking-[0.12em] text-foreground/55">
                — 용팀장 인터뷰 중에서
              </span>
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}
