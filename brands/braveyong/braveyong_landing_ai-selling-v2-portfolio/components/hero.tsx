import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, ExternalLink } from "lucide-react"
import { config, course } from "@/lib/config"

/**
 * 01 Hero — 포트폴리오 1컬럼 중앙 (시안 A).
 * ○ 얼굴(grayscale 원형) → 이름 UPPERCASE → 서브라인 → 한 단락 → [APPLY] [FREE LECTURE]
 * 손글씨 액센트 1줄(Gowun Dodum)로 진정성 보강.
 * CTA 압은 다음 섹션 02 STRIP이 받음.
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
              alt="용감한 용팀장 — 현업 셀러 · 직장인 · 육아아빠"
              width={256}
              height={256}
              className="h-full w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
              priority
            />
          </div>

          {/* 이름 UPPERCASE + 서브라인 */}
          <div className="hz-fade-up hz-delay-1 space-y-2">
            <h1 className="text-3xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              용감한 용팀장
            </h1>
            <p className="text-sm uppercase tracking-[0.18em] text-foreground/60 sm:text-base">
              현업 셀러 · 직장인 · 육아 아빠
            </p>
          </div>

          {/* 큰 임팩트 카피 — 1만 개 vs 진짜 팔리는 10개 대비 */}
          <div className="hz-fade-up hz-delay-2 mx-auto max-w-2xl space-y-3 px-2 sm:px-0">
            <p className="text-base leading-relaxed text-foreground/60 sm:text-lg">
              <s className="decoration-foreground/40">1만 개를 무작정 올리는 셀러</s>에서
            </p>
            <p className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
              진짜 팔리는<br className="sm:hidden" />
              <span className="marker"> 효자상품 10개 </span>를<br />
              만드는 셀러로.
            </p>
            <p className="text-sm leading-relaxed text-foreground/65 sm:text-base">
              6주 동안 매주 만나서, 줌 보강도 하면서 같이 만들어 갈게요.
            </p>
          </div>

          {/* 손글씨 한 줄 — Gowun Dodum, 진정성 */}
          <p className="hz-fade-up hz-delay-3 font-memo text-base text-foreground/70 sm:text-lg">
            저도 회사 다니면서, 애 재우고 상품 올렸습니다.
          </p>

          {/* CTA — pill 버튼, hover 반전 */}
          <div className="hz-fade-up hz-delay-4 flex flex-col items-center gap-3 border-t border-foreground/10 pt-6 sm:flex-row sm:justify-center sm:gap-4 sm:pt-8">
            <Link
              href={config.googleFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="6주 오프라인 실전반 지원하기 — 신청서 새 창에서 열림"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-background transition-all duration-300 hover:bg-background hover:text-foreground sm:text-base"
            >
              실전반 지원하기
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href={config.youtubeFreeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="6월 10일 유튜브 무료강의 — 새 창에서 열림"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-foreground px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-foreground transition-all duration-300 hover:bg-foreground hover:text-background sm:text-base"
            >
              6/10 무료강의
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* 보조 안내 — Pretendard 작게, 사람 말투 */}
          <p className="hz-fade-up hz-delay-5 text-xs leading-relaxed text-foreground/55 sm:text-sm">
            {course.cohort} {course.capacityMin}~{course.capacityMax}명만 받아요.
            <span className="mx-2 text-foreground/25">·</span>
            신청서 보고 한 분씩 따로 연락드립니다.
          </p>
        </div>
      </div>
    </section>
  )
}
