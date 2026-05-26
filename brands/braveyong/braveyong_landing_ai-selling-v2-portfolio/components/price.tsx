import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Section } from "./section"
import { ArrowNote } from "./handwriting"
import { config, course } from "@/lib/config"

/**
 * 14 가격 — 가격 공개 + 할부 가능 명시.
 * 1기 실행자 특별가와 정가, 카드 할부 가능 메시지로 결제 부담 완화.
 */
export function Price() {
  return (
    <Section id="price" label="가격" title={<>가격은 공개합니다.</>}>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative border-2 border-[var(--warm-border)] bg-background p-7 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
          <span className="font-mono absolute -top-3 left-6 inline-block bg-[var(--warm-border)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-background">
            1기 실행자 특별가
          </span>
          <div className="text-sm font-bold text-foreground/70">
            5주 오프라인 AI 셀링 실전반 · {course.cohort}
          </div>

          {/* 가격 앵커링 — 정가 strike 위쪽 + 1기 특별가 큰 숫자 */}
          <div className="mt-2 flex items-baseline gap-3">
            <s className="text-2xl font-bold text-foreground/40 tabular-nums">
              {(course.priceRegular / 10000).toLocaleString()}만원
            </s>
            <span className="font-mono rounded-full bg-[var(--warm)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--warm-border)]">
              2기 이후 정가
            </span>
          </div>
          <div className="mt-1 text-5xl font-bold tracking-tight tabular-nums">
            {(course.priceFirst / 10000).toLocaleString()}
            <span className="ml-1 text-lg font-bold text-foreground/65">만원</span>
          </div>
          <div className="font-mono mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--warm-border)]">
            1기 실행자 한정 · {(((course.priceRegular - course.priceFirst) / course.priceRegular) * 100).toFixed(0)}% off
          </div>

          <div className="mt-3">
            <ArrowNote>1기에만 적용되는 가격이에요</ArrowNote>
          </div>

          <div className="font-mono mt-5 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wider">
            <span className="rounded-full border border-foreground/30 px-2.5 py-1">카드 결제</span>
            <span className="rounded-full border border-foreground/30 px-2.5 py-1">계좌이체</span>
            <span className="rounded-full border border-[var(--warm-border)] bg-[var(--warm)] px-2.5 py-1 font-bold text-[var(--warm-border)]">
              💳 카드 무이자 할부 가능
            </span>
          </div>

          {/* 할부 부담 완화 한 줄 — 사람 말투 */}
          <p className="font-memo mt-3 text-sm leading-relaxed text-foreground/75 sm:text-base">
            한 번에 부담되시면, <span className="font-bold text-foreground">카드 3·6개월 무이자 할부</span>로 나눠 결제하실 수 있습니다.<br />
            월 30만원대부터 시작이에요.
          </p>

          <hr className="my-5 border-foreground/10" />
          <p className="text-sm leading-relaxed text-foreground/70">
            <span className="font-bold text-foreground">신청서 작성하시면 결제 링크가 즉시 발송됩니다.</span>{" "}
            결제만 따로 받는 페이지는 없어요 — 신청서가 결제의 유일한 시작입니다.
          </p>

          {/* 1기 한정 — 진심·집중 톤 (테스터 느낌 X) */}
          <div className="mt-4 border-2 border-brand bg-brand/5 px-4 py-3">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-brand">
              왜 1기만 이 가격?
            </div>
            <p className="mt-1 text-sm leading-relaxed text-foreground/85 sm:text-base">
              <span className="font-bold text-foreground">1기는 용팀장이 한 분 한 분 직접 챙기는 첫 기수</span>예요. 가장 가까이서 같이 가는 5주입니다.{" "}
              시중 AI 셀링·이커머스 강의는 보통 <span className="font-bold text-foreground">400~600만원대</span>인데,
              1기는 <span className="font-bold text-brand">절반 이하</span>로 시작해요. 2기부터는 정가 250만원입니다.
            </p>
          </div>

          {/* CTA 직전 감정 정당화 — 결제 결심을 도와주는 한 줄 */}
          <p className="font-memo mt-4 rounded border-l-2 border-foreground bg-background/60 px-3 py-2 text-sm leading-relaxed text-foreground">
            받는 건 5주가 아니라,<br />
            <span className="font-bold">내가 직접 만든 효자상품 10개</span>
            와, 졸업 후에도 같이 가는 사람들입니다.
          </p>

          <Link
            href={config.googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="신청서 작성하기 — 약 1분, 새 창에서 열림"
            className="group mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-brand bg-brand px-6 py-4 text-base font-bold tracking-tight text-brand-foreground shadow-[0_5px_0_oklch(0.22_0.1_18)] transition-all hover:translate-y-0.5 hover:shadow-[0_2px_0_oklch(0.22_0.1_18)] sm:py-5 sm:text-lg"
          >
            신청서 작성하기 (약 1분)
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-6 sm:w-6" />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="border-l-4 border-foreground bg-background p-5 text-sm leading-relaxed">
            <p className="text-foreground/75">
              1기는 첫 기수예요. 실행 사례·후기를 같이 만들 분들이라, 그만큼 가격을 낮췄습니다.<br />
              <br />
              <span className="font-bold text-foreground">대신 아무나 받지는 않습니다.</span>
              <br />
              5주 동안 오프라인에 직접 오시고, 줌 보강 들으시고, 매주 과제 같이 해주실 분, 신청서 보고 따로 연락드릴게요.
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
