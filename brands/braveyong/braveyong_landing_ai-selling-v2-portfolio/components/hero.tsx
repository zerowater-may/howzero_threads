import Image from "next/image"
import Link from "next/link"
import { config, course, priceText } from "@/lib/config"
import { PaymentDialog } from "./payment-dialog"
import { CountdownTimer } from "./countdown-timer"

/**
 * 01 Hero — 포트폴리오 1컬럼 중앙 + 오퍼 박스.
 * ○ 얼굴(grayscale 원형) → 이름 → 임팩트 카피 → [가격·마감·결제 CTA] → 보조 링크
 *
 * 2026-07-20: 이 주석은 원래 "오퍼를 첫 화면에 전부 노출"이라고 써 있었지만
 * 실제 코드엔 가격도 카운트다운도 결제 버튼도 없었고, 첫 화면 유일한 액션이
 * 카톡 단톡방 링크(=이탈)였다. Clarity 실측 평균 스크롤 28%면 대부분이
 * 이 화면에서 끝나므로, 오퍼를 실제로 넣었다.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center px-4 pt-24 pb-20 sm:px-6 sm:pt-28 sm:pb-24"
    >
      <div className="w-full max-w-2xl">
        <div className="space-y-6 text-center sm:space-y-8">
          {/* ○ 얼굴 — grayscale 원형, hover 시 컬러로 살짝 풀림 */}
          <div className="hz-fade-up mx-auto h-40 w-40 overflow-hidden rounded-full border-2 border-foreground transition-colors duration-500 sm:h-48 sm:w-48 md:h-56 md:w-56">
            <Image
              src="/assets/face.jpg"
              alt="용감한 용팀장 — 현업 셀러 · 부동산 투자자 · 직장인 · 육아아빠"
              width={256}
              height={256}
              sizes="(min-width:768px) 224px, (min-width:640px) 192px, 160px"
              className="h-full w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
              priority
              fetchPriority="high"
            />
          </div>

          {/* 이름 UPPERCASE + 서브라인 */}
          <div className="hz-fade-up hz-delay-1 space-y-2">
            <h1 className="text-3xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              용감한 용팀장
            </h1>
            <p className="text-sm uppercase tracking-[0.18em] text-foreground/60 sm:text-base">
              현업 셀러 · 부동산 투자자 · 직장인 · 육아 아빠
            </p>
          </div>

          {/* 큰 임팩트 카피 — 혼자 다 하는 셀러 vs AI 직원한테 시키는 셀러 */}
          <div className="hz-fade-up hz-delay-2 mx-auto max-w-2xl space-y-3 px-2 sm:px-0">
            <p className="text-base leading-relaxed text-foreground/60 sm:text-lg">
              밤새 혼자 올리고, 혼자 고치고, 혼자 답장하는 셀러에서
            </p>
            <p className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
              물건 찾기부터 고객 응대까지<br />
              <span className="marker">나만의 AI 직원</span>한테{" "}
              <br className="sm:hidden" />
              시키는 셀러로.
            </p>
            <p className="text-sm leading-relaxed text-foreground/65 sm:text-base">
              {course.weeks}주 동안 AI 직원을 같이 세팅하고, 소싱부터 CS까지 다섯 칸을 넘깁니다.
            </p>
          </div>

          {/* 오퍼 — 가격·마감·결제 버튼을 첫 화면에. 평균 스크롤 28%라 여기서 끝나는 사람이 가장 많다. */}
          <div className="hz-fade-up hz-delay-3 mx-auto max-w-md border-2 border-brand bg-background p-5 sm:p-6">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-brand">
              {course.cohort} 모집 중 · 정원 {course.capacityMax}명
            </div>
            <div className="mt-2 flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
                {priceText.total}
              </span>
              <span className="text-sm font-bold text-foreground/65">부가세 포함</span>
            </div>
            <div className="mt-2">
              <CountdownTimer className="text-foreground" label="개강 전 결제 마감까지" />
            </div>
            <PaymentDialog
              amount={course.priceFirst}
              label={priceText.payLabel}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-6 py-4 text-base font-bold tracking-tight text-brand-foreground transition-all hover:opacity-90 sm:text-lg"
            />
            <p className="mt-2.5 text-xs leading-relaxed text-foreground/60">
              {course.startDate} 개강 · 이름과 연락처만 넣으면 결제창이 바로 열려요
            </p>
          </div>

          {/* 보조 — 결제 전 궁금하면 단톡방. 작게. */}
          <p className="hz-fade-up hz-delay-4 text-xs leading-relaxed text-foreground/55 sm:text-sm">
            결제 전에 궁금한 게 있으면{" "}
            <Link
              href={config.kakaoOpenChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-track="hero_kakao_openchat"
              className="font-bold text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground"
            >
              단톡방
            </Link>
            에서 먼저 물어보셔도 됩니다.
          </p>
        </div>
      </div>
    </section>
  )
}
