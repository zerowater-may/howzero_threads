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
            6주 오프라인 AI 셀링 실전반 · {course.cohort}
          </div>

          {/* 가격 숫자 부활 */}
          <div className="mt-2 text-5xl font-bold tracking-tight tabular-nums">
            {(course.priceFirst / 10000).toLocaleString()}
            <span className="ml-1 text-lg font-bold text-foreground/65">만원</span>
          </div>
          <div className="mt-2 text-sm text-foreground/55">
            2기 이후 정가{" "}
            <s className="tabular-nums">{(course.priceRegular / 10000).toLocaleString()}만원</s>
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
            결제 링크와 입금 안내는{" "}
            <span className="font-bold text-foreground">신청서 검토 후 참여 확정자에게만</span>{" "}
            발송됩니다.
          </p>

          {/* CTA 직전 감정 정당화 — 결제 결심을 도와주는 한 줄 */}
          <p className="font-memo mt-4 rounded border-l-2 border-foreground bg-background/60 px-3 py-2 text-sm leading-relaxed text-foreground">
            받는 건 6주가 아니라,<br />
            <span className="font-bold">내가 직접 만든 효자상품 10개</span>
            와, 졸업 후에도 같이 가는 사람들입니다.
          </p>

          <Link
            href={config.googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="1기 실행자로 지원하기 — 신청서 새 창에서 열림"
            className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-foreground bg-foreground px-6 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-background transition-all hover:bg-background hover:text-foreground"
          >
            1기 실행자로 지원하기
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="border-l-4 border-foreground bg-background p-5 text-sm leading-relaxed">
            <p className="text-foreground/75">
              1기는 첫 기수예요. 실행 사례·후기를 같이 만들 분들이라, 그만큼 가격을 낮췄습니다.<br />
              <br />
              <span className="font-bold text-foreground">대신 아무나 받지는 않습니다.</span>
              <br />
              6주 동안 오프라인에 오시고, 줌 보강 듣고, 매주 과제 같이 해주실 분만 신청서 검토 후 안내드립니다.
            </p>
          </div>
          <div className="border-l-4 border-foreground bg-background p-5 text-sm leading-relaxed">
            <p className="text-base font-bold leading-snug text-foreground sm:text-lg">
              이건 <span className="marker">녹화강의가 아닙니다.</span>
            </p>
            <p className="mt-3 whitespace-pre-line text-foreground/75">
              {`6주 동안 각자의 상품을 같이 보고,
용팀장 기준으로 효자상품 10개를 직접 완성하는 `}
              <span className="font-bold text-foreground">오프라인 실전반</span>입니다.
              <br />
              지식 PDF·녹화 한 묶음이 아니라, 같이 만드는 과정에 대한 비용입니다.
            </p>
          </div>
          <div className="border-l-4 border-[var(--warm-border)] bg-[var(--warm)] p-5 text-sm leading-relaxed">
            <p className="font-memo text-foreground">
              <span className="font-bold">쉽게 돈 버는 건 아닙니다.</span>
              <br />
              그런데 되는 방향은 맞습니다.
              <span className="font-mono ml-2 text-[10px] uppercase tracking-[0.12em] text-foreground/55">
                — 용팀장 인터뷰 中
              </span>
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}
