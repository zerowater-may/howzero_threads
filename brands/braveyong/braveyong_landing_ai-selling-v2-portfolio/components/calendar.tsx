import { Section } from "./section"
import { Gift, Calendar as CalendarIcon, Video } from "lucide-react"

/**
 * 09-B 1기 강의일정 캘린더 — Operation 다음, WhyYong 직전.
 * vertical timeline 6 카드 (origin-story 패턴), stagger reveal.
 * 데이터: course.startDate 2026-06-13(토) 기준 매주 토요일 오프라인, 줌은 2~6주차 직전 수요일.
 */
const free = { date: "6.10 (수)", label: "유튜브 무료 전환강의" }

const weeks: { n: number; off: string; title: string; zoom: string | null }[] = [
  { n: 1, off: "6.13 (토)", title: "대량등록 탈출 진단", zoom: null },
  { n: 2, off: "6.20 (토)", title: "상품 선정 · 키워드 · 카테고리", zoom: "6.17 (수)" },
  { n: 3, off: "6.27 (토)", title: "AI 상세페이지 설계", zoom: "6.24 (수)" },
  { n: 4, off: "7.4 (토)", title: "등록 · 대표이미지 · 전환 체크", zoom: "7.1 (수)" },
  { n: 5, off: "7.11 (토)", title: "AI 반복 작업 루틴", zoom: "7.8 (수)" },
  { n: 6, off: "7.18 (토)", title: "효자상품 10개 점검 · 다음 30일 운영", zoom: "7.15 (수)" },
]

export function Calendar() {
  return (
    <Section
      tone="warm"
      id="calendar"
      label="Calendar"
      title={<>1기 강의일정.</>}
      lead="오프라인 6회 + 줌 보강 5회. 매주 토요일 오프라인으로 같이 작업하고, 사이 주중에 줌으로 보강합니다."
    >
      {/* 무료 전환강의 highlight */}
      <div className="mb-8 flex flex-wrap items-center gap-3 border-2 border-foreground bg-background p-5">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-2 border-foreground bg-[var(--warm)]">
          <Gift className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
            본강의 전 · 누구나
          </div>
          <div className="mt-0.5 text-base font-bold tracking-tight sm:text-lg">
            <span className="tabular-nums">{free.date}</span> · {free.label}
          </div>
        </div>
        <div className="font-memo text-sm leading-relaxed text-foreground/70 sm:text-base">
          유튜브 라이브로 진행해요. 가볍게 먼저 만나보세요.
        </div>
      </div>

      {/* 6주 vertical timeline */}
      <ol className="relative border-l-2 border-foreground/20 pl-5 sm:pl-7">
        {weeks.map((w, i) => (
          <li
            key={w.n}
            data-reveal
            style={{ transitionDelay: `${i * 80}ms` }}
            className="relative mb-4 last:mb-0"
          >
            {/* 도트 — 좌측 라인 위에 */}
            <span
              aria-hidden
              className="absolute -left-[27px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-foreground bg-background text-[10px] font-bold sm:-left-[35px]"
            >
              {w.n}
            </span>

            <div className="group border-2 border-foreground bg-background p-5 transition-transform duration-300 hover:-translate-y-0.5 sm:p-6">
              <div className="font-mono mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
                <span>WEEK {String(w.n).padStart(2, "0")}</span>
              </div>

              {/* 오프라인 행 */}
              <div className="flex items-start gap-3">
                <CalendarIcon className="mt-1 h-4 w-4 flex-none text-foreground" aria-hidden />
                <div className="flex-1">
                  <div className="text-base font-bold leading-snug tracking-tight sm:text-lg">
                    <span className="tabular-nums">{w.off}</span>{" "}
                    <span className="text-foreground/55">·</span> 오프라인 {w.n}주차
                  </div>
                  <div className="mt-1 text-sm text-foreground/75 sm:text-base">{w.title}</div>
                </div>
              </div>

              {/* 줌 보강 행 (2~6주차) */}
              {w.zoom && (
                <div className="mt-3 flex items-start gap-3 border-t border-foreground/10 pt-3 text-sm text-foreground/70">
                  <Video className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
                  <div>
                    <span className="tabular-nums font-bold text-foreground">{w.zoom}</span>{" "}
                    <span className="text-foreground/55">·</span> 줌 보강
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* 디스클레이머 */}
      <p className="font-memo mt-6 text-sm leading-relaxed text-foreground/70 sm:text-base">
        ※ 위 일정은 예정이에요. 실제 날짜·시간은 1기 확정 후 참여자분께 따로 안내드립니다.
      </p>
    </Section>
  )
}
