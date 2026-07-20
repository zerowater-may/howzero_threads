import Image from "next/image"
import Link from "next/link"
import { config, course } from "@/lib/config"

/**
 * 01 Hero — 포트폴리오 1컬럼 중앙.
 * ○ 얼굴(grayscale 원형) → 이름 → 임팩트 카피 → 커리큘럼으로 내려보내는 CTA → 보조 링크
 *
 * 2026-07-20: 한때 여기에 가격(220만원)·카운트다운·결제 버튼을 올렸다가 뺐다.
 * 첫 화면부터 금액이 꽂히니 거부감이 먼저 생긴다는 판단.
 * 첫 화면의 일은 "뭘 하는 수업인지" 궁금하게 만드는 것까지고,
 * 가격과 결제는 커리큘럼·후기를 본 뒤(스티키 바·가격 섹션)에서 만난다.
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

          {/* 첫 화면엔 가격을 두지 않는다.
              가격·결제 버튼을 히어로에 올렸더니 첫 화면부터 금액이 꽂혀 거부감이 생겼다.
              무엇을 하는 수업인지 먼저 보게 하고, 결제는 아래에서 만나게 한다. */}
          <div className="hz-fade-up hz-delay-3 flex flex-col items-center gap-3">
            <a
              href="#curriculum"
              data-track="hero_see_curriculum"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground bg-foreground px-7 py-3.5 text-sm font-bold tracking-tight text-background transition-all hover:opacity-90 sm:px-8 sm:text-base"
            >
              4주 동안 뭘 하는지 먼저 보기
            </a>
            <p className="text-xs leading-relaxed text-foreground/55 sm:text-sm">
              {course.cohort} 모집 중 · {course.startDate} 개강 · 정원 {course.capacityMax}명
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
