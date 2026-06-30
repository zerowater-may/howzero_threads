import { ChevronRight, Lock } from "lucide-react"
import { Section } from "./section"
import { course } from "@/lib/config"

/**
 * 08 4주 커리큘럼 — 좌→우 4블럭 대분류 (소싱→가공→판매→광고). 마지막 주차(시스템화) 제외.
 * 다른 강사 전략 노출 방지 위해 상세 topics/outputs/scene은 blur+잠금.
 * 2기 신청 후 공개.
 */
const blocks: { n: number; label: string; sub: string }[] = [
  { n: 1, label: "소싱",   sub: "현재 상태 진단 + 후보 상품 발굴" },
  { n: 2, label: "가공",   sub: "상품명 · 카테고리 · AI 상세" },
  { n: 3, label: "판매",   sub: "등록 + 대표이미지 + 전환 체크" },
  { n: 4, label: "광고",   sub: "검색·쇼핑 광고 운영 기초" },
]

/** 잠긴 상세 — blur로 미리보기만 (실제 keyword는 의도적으로 약하게) */
const lockedTeasers = [
  "키워드 의도 분석 · 카테고리 매핑 프레임",
  "상품명 SEO 5단 검증법 · 대표이미지 A/B 패턴",
  "상세페이지 스토리보드 · 구매 이유 → 불안 제거 순서",
  "쇼핑 광고 입찰 기준 · CPC 관리 루틴",
]

export function Curriculum() {
  return (
    <Section
      id="curriculum"
      label="4주 커리큘럼"
      title={<>오프라인 {course.offlineCount}회 + 줌 보강 {course.zoomCount}회</>}
      lead="대분류만 공개합니다. 상세 커리큘럼·실습 자료는 2기 신청 후 따로 안내드려요."
    >
      {/* 좌→우 4블럭 horizontal flow — 모바일은 vertical */}
      <div className="grid gap-3 md:grid-cols-4">
        {blocks.map((b, i) => (
          <div
            key={b.n}
            className="group relative border-2 border-foreground bg-background p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_0_var(--foreground)] sm:p-6"
          >
            <div className="font-mono mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
              <span>WEEK {String(b.n).padStart(2, "0")}</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{b.label}</h3>
            <p className="mt-2 text-xs leading-relaxed text-foreground/65 sm:text-sm">{b.sub}</p>

            {/* 화살표 — 데스크탑만 (블럭 사이 3개) */}
            {i < blocks.length - 1 && (
              <ChevronRight
                className="absolute -right-[16px] top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 rounded-full bg-background p-0.5 text-foreground/40 ring-2 ring-background md:block"
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>

      {/* 상세 보기 — blur 잠금 카드. 호기심 살리는 동시에 전략 보호 */}
      <div className="relative mt-8 overflow-hidden border-2 border-foreground bg-background">
        {/* 미리보기 (blur) */}
        <div
          aria-hidden
          className="pointer-events-none select-none divide-y divide-foreground/10 px-6 py-5 blur-[3px] opacity-55"
        >
          {blocks.map((b, i) => (
            <div key={b.n} className="flex items-start gap-4 py-3">
              <div className="font-mono flex h-10 w-10 flex-none flex-col items-center justify-center bg-foreground text-background">
                <span className="text-base font-bold leading-none">{b.n}</span>
                <span className="text-[8px] opacity-70">WEEK</span>
              </div>
              <div className="flex-1">
                <div className="text-base font-bold tracking-tight">{b.label}</div>
                <div className="mt-1 text-sm text-foreground/70">{lockedTeasers[i]}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 오버레이 — 잠금 메시지 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/55 backdrop-blur-[2px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-foreground bg-foreground text-background shadow-[0_4px_0_rgba(0,0,0,0.25)]">
            <Lock className="h-6 w-6" aria-hidden />
          </div>
          <div className="text-center">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/55">
              상세 커리큘럼
            </div>
            <div className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
              2기 신청 후 공개합니다.
            </div>
            <p className="font-memo mt-2 max-w-md text-center text-sm leading-relaxed text-foreground/70 sm:text-base">
              실습 자료·체크리스트·프레임은 결제 확정자에게만 보내드려요.
            </p>
          </div>
        </div>
      </div>

      {/* 안내 한 줄 — 진심 감성 */}
      <p className="font-memo mt-6 text-sm leading-relaxed text-foreground/70 sm:text-base">
        ※ 제 2기 수강생분들에게 진심이고 싶어서요. 손에 잡히는 자료·체크리스트는 결제하신 분들께만 직접 보내드립니다.
      </p>
    </Section>
  )
}
