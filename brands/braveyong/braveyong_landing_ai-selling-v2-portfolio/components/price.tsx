import { Section } from "./section"
import { ArrowNote } from "./handwriting"
import { CountdownTimer } from "./countdown-timer"
import { PaymentDialog } from "@/components/payment-dialog"
import { config, course, priceText } from "@/lib/config"

/**
 * 14 가격 — 2기 단일가 구조 (2026-07-20 확정).
 * 얼리버드/정가 이중 표기 폐지. 부가세 포함 220만원 하나만 크게 보여주고,
 * 앵커는 가짜 정가 대신 1기 실제 결제액(198만)을 쓴다.
 * 카운트다운 = 개강(7/25) 전날 마감이라는 실제 마감.
 */
const priceWan = (course.priceFirst / 10000).toLocaleString()          // 220
const supplyWan = (course.priceFirstSupply / 10000).toLocaleString()   // 200
const cohort1Wan = (course.priceCohort1 / 10000).toLocaleString()      // 198

export function Price() {
  return (
    <Section id="price" label="가격" title={<>가격은 공개합니다.</>}>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative border-2 border-[var(--warm-border)] bg-background p-7 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
          <span className="font-mono absolute -top-3 left-6 inline-block bg-brand px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-foreground">
            {course.cohort} 정원 {course.capacityMax}명
          </span>
          <div className="text-sm font-bold text-foreground/70">
            {course.name} · {course.cohort}
          </div>

          {/* 개강 전 결제 마감 카운트다운 (마감 후 자동 숨김) */}
          <div className="mt-3">
            <CountdownTimer className="text-brand" label="개강 전 결제 마감까지" />
          </div>

          {/* 가격 — 강의 비용 200만원을 크게, 부가세 포함 220만원은 바로 아래 밝힌다 */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-6xl font-bold tracking-tight tabular-nums">{supplyWan}</span>
            <span className="text-xl font-bold text-foreground/70">만원</span>
            <span className="ml-1 text-sm font-bold text-foreground/60">부가세 별도</span>
          </div>
          <div className="mt-1.5 text-sm font-bold text-foreground/75">
            부가세 포함하면 <span className="text-foreground">{priceWan}만원</span>,
            <span className="ml-1 font-normal text-foreground/60">결제창에 찍히는 금액도 이 금액입니다.</span>
          </div>

          <div className="mt-3">
            <ArrowNote>세금계산서 발행됩니다</ArrowNote>
          </div>

          {/* 즉시 결제 — 페이지 안에서 바로 결제까지 끝난다 */}
          <PaymentDialog
            amount={course.priceFirst}
            label={`지금 ${course.cohort} 결제하기 — ${priceWan}만원 (부가세 포함)`}
            className="group mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-brand bg-brand px-6 py-4 text-base font-bold tracking-tight text-brand-foreground transition-all hover:opacity-90 sm:py-5 sm:text-lg"
          />
          <p className="mt-2.5 text-center text-xs leading-relaxed text-foreground/60">
            신청서 안 씁니다. 이름·연락처만 넣으면 결제창이 바로 열려요.
          </p>

          <div className="font-mono mt-4 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wider">
            <span className="rounded-full border border-foreground/30 px-2.5 py-1">카드 결제</span>
            <span className="rounded-full border border-foreground/30 px-2.5 py-1">계좌이체</span>
            <span className="rounded-full border border-[var(--warm-border)] bg-[var(--warm)] px-2.5 py-1 font-bold text-[var(--warm-border)]">
              카드 무이자 할부 가능
            </span>
          </div>

          <p className="font-memo mt-3 text-sm leading-relaxed text-foreground/75 sm:text-base">
            한 번에 부담되시면 <span className="font-bold text-foreground">카드 3·6개월 무이자 할부</span>로 나눠 결제하셔도 됩니다.
            6개월로 나누면 <span className="font-bold text-foreground">월 {priceText.monthly6}</span>대예요.
          </p>

          <hr className="my-5 border-foreground/10" />

          {/* 앵커 — 가짜 정가 대신 1기 실제 금액을 밝힌다 */}
          <div className="border-l-2 border-brand bg-brand/[0.06] px-4 py-3">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
              1기보다 올랐습니다
            </div>
            <p className="mt-1 text-sm leading-relaxed text-foreground/85 sm:text-base">
              숨기지 않을게요. 1기는 {cohort1Wan}만원이었고, {course.cohort}는 {priceWan}만원입니다.
              1기 때 없던 <span className="font-bold text-foreground">줌 보강과 유선 케어</span>가 붙었고,
              대신 정원을 {course.cohort1Count}명에서 <span className="font-bold text-foreground">{course.capacityMax}명으로 줄였어요.</span>{" "}
              한 사람당 제가 쓸 시간을 늘리려고 그렇게 했습니다.
            </p>
          </div>

          <p className="font-memo mt-4 rounded border-l-2 border-foreground bg-background/60 px-3 py-2 text-sm leading-relaxed text-foreground">
            받는 건 4주가 아니라,<br />
            <span className="font-bold">내가 직접 만든 효자상품 10개</span>
            와, 졸업 후에도 같이 가는 사람들입니다.
          </p>

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
              1기를 마친 후기가 쌓였고, 그걸 보고 {course.cohort}를 다시 짰습니다. 보강도 케어도 1기에서 부족했던 걸 채운 거예요.<br />
              <br />
              <span className="font-bold text-foreground">대신 4주 진심으로 함께할 분만 오세요.</span>
              <br />
              오프라인에 직접 오시고, 줌 보강 들으시고, 매주 과제 같이 해주실 분. 결제하시면 용팀장이 카톡으로 1주차 일정·장소를 바로 챙겨 드릴게요.
            </p>
          </div>
          <div className="border-l-4 border-foreground bg-background p-5 text-sm leading-relaxed">
            <p className="text-base font-bold leading-snug text-foreground sm:text-lg">
              <span className="marker">녹화강의가 아니에요.</span>
            </p>
            <p className="mt-3 text-foreground/75">
              4주 동안 각자의 상품을 같이 보고, 효자상품 10개를 손으로 직접 완성하는{" "}
              <span className="font-bold text-foreground">오프라인 실전반</span>이에요.<br />
              PDF·녹화 한 묶음에 매기는 값이 아니라, 같이 만드는 4주 자체에 대한 값입니다.
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
