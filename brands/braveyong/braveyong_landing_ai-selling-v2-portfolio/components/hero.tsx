import Image from "next/image"
import Link from "next/link"
import { config, course } from "@/lib/config"

/**
 * 01 Hero — 포트폴리오 1컬럼 중앙 (시안 A) + 타임어택 오퍼.
 * ○ 얼굴(grayscale 원형) → 이름 UPPERCASE → 서브라인 → 한 단락
 * → [얼리버드 마감 임박 배지 + 카운트다운 + 가격 앵커 + 결제 CTA]
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
              5주 동안 AI 직원을 같이 세팅하고, 그 직원과 효자상품 10개를 만듭니다.
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
