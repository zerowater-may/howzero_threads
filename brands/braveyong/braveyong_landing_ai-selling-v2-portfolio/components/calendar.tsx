import { Section } from "./section"
import { Gift, Calendar as CalendarIcon, Video, Target } from "lucide-react"

/**
 * 09-B 1기 강의일정 캘린더 — Operation 다음, WhyYong 직전.
 * vertical timeline 6 카드 (origin-story 패턴) + 월 구분 헤더 + 산출물 1줄.
 * 데이터: course.startDate 2026-06-13(토) 기준 매주 토요일 오프라인, 줌은 2~6주차 직전 수요일.
 */
const free = { date: "6.10 (수)", label: "유튜브 무료 전환강의" }

const weeks: {
  n: number
  month: number
  off: string
  title: string
  output: string
  zoom: string | null
}[] = [
  { n: 1, month: 6, off: "6.13 (토)", title: "대량등록 탈출 진단",          output: "내 스토어 진단표",      zoom: null },
  { n: 2, month: 6, off: "6.20 (토)", title: "상품 선정 · 키워드 · 카테고리", output: "후보 상품 + 키워드 맵", zoom: "6.17 (수)" },
  { n: 3, month: 6, off: "6.27 (토)", title: "AI 상세페이지 설계",          output: "상세페이지 스토리보드", zoom: "6.24 (수)" },
  { n: 4, month: 7, off: "7.4 (토)",  title: "등록 · 대표이미지 · 전환 체크", output: "등록 가능한 상품 세트", zoom: "7.1 (수)" },
  { n: 5, month: 7, off: "7.11 (토)", title: "AI 반복 작업 루틴",           output: "개인 AI 셀링 템플릿",   zoom: "7.8 (수)" },
  { n: 6, month: 7, off: "7.18 (토)", title: "효자상품 10개 점검 · 다음 30일 운영", output: "효자상품 10개 + 30일 실행 계획", zoom: "7.15 (수)" },
]

export function Calendar() {
  return (
    <Section
      tone="warm"
      id="calendar"
      label="Calendar"
      title={<>1기, 같이 가는 6주 일정.</>}
      lead="오프라인 6회 + 줌 보강 5회. 매주 토요일 오프라인으로 같이 작업하고, 사이 주중에 줌으로 보강합니다."
    >
      {/* 무료 전환강의 highlight — 손글씨 라벨 + 큰 날짜 + 정성 카피 */}
      <div className="mb-10 grid gap-4 border-2 border-foreground bg-background p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-7">
        <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full border-2 border-foreground bg-[var(--warm)] shadow-[0_3px_0_var(--foreground)]">
          <Gift className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/55">
            본강의 전 · 누구나
          </div>
          <div className="mt-1 text-xl font-bold leading-tight tracking-tight sm:text-2xl">
            <span className="tabular-nums">{free.date}</span>{" "}
            <span className="text-foreground/40">·</span>{" "}
            {free.label}
          </div>
          <p className="font-memo mt-2 text-sm leading-relaxed text-foreground/70 sm:text-base">
            유튜브 라이브로 가볍게 먼저 만나봐요. 6주 강의 결제 전에, 분위기·방향·내가 맞는지 직접 보세요.
          </p>
        </div>
        <span className="font-mono justify-self-start rounded-full border-2 border-foreground bg-foreground px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-background sm:justify-self-end">
          무료
        </span>
      </div>

      {/* 6주 vertical timeline — 월 구분 + 산출물 + stagger reveal */}
      <ol className="relative border-l-2 border-foreground/20 pl-5 sm:pl-7">
        {weeks.map((w, i) => {
          const showMonthHeader = i === 0 || w.month !== weeks[i - 1].month
          return (
            <li
              key={w.n}
              data-reveal
              style={{ transitionDelay: `${i * 80}ms` }}
              className="relative mb-4 last:mb-0"
            >
              {/* 월 구분 헤더 — W1, W4 위에 한 번씩 */}
              {showMonthHeader && (
                <div className="font-mono absolute -left-[34px] -top-7 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/55 sm:-left-[42px]">
                  {`2026.0${w.month}`}
                </div>
              )}

              {/* 도트 — 좌측 라인 위에. 1·6주차 강조, 중간은 일반 */}
              <span
                aria-hidden
                className={`absolute -left-[27px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-foreground text-[10px] font-bold sm:-left-[35px] ${
                  w.n === 1 || w.n === 6 ? "bg-foreground text-background" : "bg-background"
                }`}
              >
                {w.n}
              </span>

              <div className="group border-2 border-foreground bg-background p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_0_var(--foreground)] sm:p-6">
                <div className="font-mono mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
                  <span>WEEK {String(w.n).padStart(2, "0")}</span>
                  {w.n === 1 && <span className="text-foreground">▶ 시작</span>}
                  {w.n === 6 && <span className="text-foreground">▣ 마무리</span>}
                </div>

                {/* 오프라인 행 */}
                <div className="flex items-start gap-3">
                  <CalendarIcon className="mt-1 h-4 w-4 flex-none text-foreground" aria-hidden />
                  <div className="flex-1">
                    <div className="text-base font-bold leading-snug tracking-tight sm:text-lg">
                      <span className="tabular-nums">{w.off}</span>{" "}
                      <span className="text-foreground/40">·</span> 오프라인 {w.n}주차
                    </div>
                    <div className="mt-1 text-sm text-foreground/75 sm:text-base">{w.title}</div>
                  </div>
                </div>

                {/* 산출물 행 — 매주 손에 남는 것 */}
                <div className="mt-3 flex items-start gap-3 border-t border-foreground/10 pt-3 text-sm">
                  <Target className="mt-0.5 h-4 w-4 flex-none text-foreground/60" aria-hidden />
                  <div className="text-foreground/70">
                    <span className="font-mono mr-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/55">
                      산출물
                    </span>
                    <span className="font-bold text-foreground">{w.output}</span>
                  </div>
                </div>

                {/* 줌 보강 행 (2~6주차) */}
                {w.zoom && (
                  <div className="mt-2 flex items-start gap-3 text-sm text-foreground/70">
                    <Video className="mt-0.5 h-4 w-4 flex-none text-foreground/60" aria-hidden />
                    <div>
                      <span className="font-mono mr-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/55">
                        줌 보강
                      </span>
                      <span className="tabular-nums font-bold text-foreground">{w.zoom}</span>
                    </div>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {/* 디스클레이머 */}
      <p className="font-memo mt-8 text-sm leading-relaxed text-foreground/70 sm:text-base">
        ※ 위 일정은 예정이에요. 실제 날짜·시간은 1기 확정 후 참여자분께 따로 안내드립니다.
      </p>
    </Section>
  )
}
