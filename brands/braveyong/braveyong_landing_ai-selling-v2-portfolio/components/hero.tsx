import Image from "next/image"
import Link from "next/link"
import { config, course } from "@/lib/config"
import { PaymentDialog } from "@/components/payment-dialog"
import { CountdownTimer } from "@/components/countdown-timer"

/**
 * 01 Hero — 포트폴리오 1컬럼 중앙 (시안 A) + 타임어택 오퍼.
 * ○ 얼굴(grayscale 원형) → 이름 UPPERCASE → 서브라인 → 한 단락
 * → [1기 마감 임박 배지 + 카운트다운 + 가격 앵커 + 결제 CTA]
 * Clarity 실측: 평균 스크롤 28%, 거의 안 내림 → 오퍼(가격+카운트다운+결제버튼)를 첫 화면에 전부 노출.
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

          {/* 큰 임팩트 카피 — 1만 개 vs 진짜 팔리는 10개 대비 */}
          <div className="hz-fade-up hz-delay-2 mx-auto max-w-2xl space-y-3 px-2 sm:px-0">
            <p className="text-base leading-relaxed text-foreground/60 sm:text-lg">
              상품은 올리는데 검색도 매출도 안 잡히는 셀러에서
            </p>
            <p className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
              진짜 팔리는<br className="sm:hidden" />
              <span className="marker"> 효자상품 10개 </span>를<br />
              만드는 셀러로.
            </p>
            <p className="text-sm leading-relaxed text-foreground/65 sm:text-base">
              5주 동안 내 상황에 맞는 시작점부터 잡고, 매주 2개씩 같이 고쳐갑니다.
            </p>
          </div>

          {/* ─── 타임어택 오퍼 박스 — Clarity상 안 내리는 사람 위해 첫 화면에 전부 ─── */}
          <div className="hz-fade-up hz-delay-3 mx-auto max-w-xl rounded-2xl border-2 border-brand bg-brand/[0.06] p-5 text-center sm:p-7">
            {/* 배지 — 선착순 1기 마감 임박 */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-brand-foreground sm:text-sm">
              지금 1기 모집 중 — 곧 마감됩니다
            </span>

            {/* 카운트다운 — config.cohort1Deadline 타깃, 마감 후 자동 숨김 */}
            <div className="mt-4 flex justify-center text-foreground">
              <CountdownTimer />
            </div>

            {/* 가격 앵커 — 250만 취소선 → 1기 특별가 198만 강조 */}
            <div className="mt-4 space-y-1">
              <p className="text-sm text-foreground/55 sm:text-base">
                마감되면 정가{" "}
                <span className="font-bold text-foreground/55 line-through decoration-2">
                  {(course.priceRegular / 10000).toLocaleString()}만원
                </span>
              </p>
              <p className="text-base text-foreground/70 sm:text-lg">
                1기 마감 전까지만 특별가
              </p>
              <p className="text-4xl font-bold tracking-tight text-brand sm:text-5xl">
                {(course.priceFirst / 10000).toLocaleString()}만원
                <span className="ml-1.5 align-middle text-xs font-normal text-foreground/45 sm:text-sm">
                  (부가세 포함)
                </span>
              </p>
            </div>

            {/* 결제 CTA — 크게(py-4↑), bg-brand로 대비 강하게 */}
            <div className="mt-5">
              <PaymentDialog
                amount={course.priceFirst}
                label="1기 특별가 — 지금 결제 198만원"
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-brand bg-brand px-8 py-4 text-base font-bold tracking-tight text-brand-foreground transition-all duration-300 hover:opacity-90 sm:px-10 sm:py-5 sm:text-lg"
              />
            </div>

            {/* 보조 CTA — 결제가 부담되면 신청서부터. outline 스타일로 결제 버튼이 더 도드라지게 */}
            <div className="mt-3">
              <a
                href={config.googleFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="신청서 작성하기 — 약 1분, 새 창에서 열림"
                data-track="hero_apply_form"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground bg-transparent px-6 py-3.5 text-sm font-bold text-foreground transition-all hover:bg-foreground hover:text-background"
              >
                신청서부터 작성하기 (약 1분)
              </a>
            </div>

            {/* 손글씨 한 줄 — Gowun Dodum, 진정성 */}
            <p className="mt-4 font-memo text-sm text-foreground/70 sm:text-base">
              저도 회사 다니면서, 애 재우고 새벽에 상품 올렸습니다. 지금 결제하면 1주차부터 같이 시작해요.
            </p>
          </div>

          {/* 보조 — 결제 전 궁금하면 단톡방. 작게. */}
          <p className="hz-fade-up hz-delay-4 text-xs leading-relaxed text-foreground/55 sm:text-sm">
            {course.cohort} 모집 중 · 결제 전에 궁금한 게 있으면{" "}
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
