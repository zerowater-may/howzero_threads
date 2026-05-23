import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Section } from "./section"
import { ArrowNote } from "./handwriting"
import { config, course } from "@/lib/config"

/**
 * 14 가격 — 페이지 노출 제거 정책.
 * 본강의 금액(1기 특별가·정가)은 페이지에 숫자로 노출하지 않고,
 * 신청서 검토 후 참여 확정자에게 개별 안내한다.
 */
export function Price() {
  return (
    <Section id="price" label="가격" title={<>가격은 신청서 검토 후 개별 안내드립니다.</>}>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative border-2 border-[var(--warm-border)] bg-background p-7 shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
          <span className="font-mono absolute -top-3 left-6 inline-block bg-[var(--warm-border)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-background">
            1기 실행자 특별가
          </span>
          <div className="text-sm font-bold text-foreground/70">
            6주 오프라인 AI 셀링 실전반 · {course.cohort}
          </div>

          {/* 가격 숫자 노출 대신 안내 */}
          <div className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            신청서 검토 후<br />
            <span className="text-foreground/55">개별 안내</span>
          </div>
          <p className="mt-3 text-sm text-foreground/65">
            1기 실행자에게만 적용되는 특별가가 있습니다. 2기 이후 정가는 상향됩니다.
            정확한 금액·결제 방식은 참여 확정자에게만 안내드립니다.
          </p>

          <div className="mt-3">
            <ArrowNote>아무나 받지 않습니다</ArrowNote>
          </div>

          <div className="font-mono mt-5 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wider">
            <span className="rounded-full border border-foreground/30 px-2.5 py-1">카드 결제</span>
            <span className="rounded-full border border-foreground/30 px-2.5 py-1">계좌이체</span>
            <span className="rounded-full border border-[var(--warm-border)] bg-[var(--warm)] px-2.5 py-1 text-[var(--warm-border)]">
              분할 가능 여부 별도 안내
            </span>
          </div>

          <hr className="my-5 border-foreground/10" />
          <p className="text-sm leading-relaxed text-foreground/70">
            결제 링크와 입금 안내는{" "}
            <span className="font-bold text-foreground">신청서 검토 후 참여 확정자에게만</span>{" "}
            발송됩니다.
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
            <p className="whitespace-pre-line text-foreground/75">
              {`첫 기수는 실행 사례와 후기를 함께 만들 분들을 위해
가격 장벽을 낮췄습니다.

`}
              <span className="font-bold text-foreground">대신 아무나 받지 않습니다.</span>
              <br />
              6주 동안 오프라인 참석, 줌 보강, 과제 실행이 가능한 분만
              신청서 검토 후 참여 안내를 드립니다.
            </p>
          </div>
          <div className="border-l-4 border-foreground bg-background p-5 text-sm leading-relaxed">
            <p className="whitespace-pre-line text-foreground/75">
              {`이 과정은 듣기만 하는 온라인 강의가 아닙니다.
6주 동안 현장에서 각자 상품과 스토어를 가져와 고치고,
중간 줌 보강으로 과제를 점검하는 `}
              <span className="font-bold text-foreground">오프라인 실전반</span>입니다.
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}
