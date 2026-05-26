import { Section } from "./section"
import { Gift, Calendar as CalendarIcon, Video, Target } from "lucide-react"

/**
 * 09-B 1기 강의일정 캘린더 — Operation 다음, WhyYong 직전.
 * 월간 grid (6월·7월) + 5주 timeline 카드 (origin-story 패턴).
 * 데이터: course.startDate 2026-06-13(토) 기준 매주 토요일 오프라인 5회, 줌은 2~5주차 직전 수요일 4회.
 * grid 각 셀 hover 시 그 날 일정 detail tooltip 표시.
 */
const free = { date: "6.10 (수)", label: "유튜브 무료 라이브 강의" }

type FreeEvent = { type: "free"; label: string }
type OffEvent = { type: "off"; n: number; title: string }
type ZoomEvent = { type: "zoom"; week: number }
type DayEvent = FreeEvent | OffEvent | ZoomEvent

const months: {
  label: string
  daysInMonth: number
  startWeekday: number // 0=Mon ~ 6=Sun
  events: Record<number, DayEvent>
}[] = [
  {
    label: "2026.06",
    daysInMonth: 30,
    startWeekday: 0, // 2026-06-01 = Mon
    events: {
      10: { type: "free", label: "유튜브 무료 라이브 강의" },
      13: { type: "off", n: 1, title: "대량등록 탈출 진단" },
      17: { type: "zoom", week: 2 },
      20: { type: "off", n: 2, title: "상품 선정 · 키워드 · 카테고리" },
      24: { type: "zoom", week: 3 },
      27: { type: "off", n: 3, title: "AI 상세페이지 설계" },
    },
  },
  {
    label: "2026.07",
    daysInMonth: 31,
    startWeekday: 2, // 2026-07-01 = Wed
    events: {
      1: { type: "zoom", week: 4 },
      4: { type: "off", n: 4, title: "등록 · 대표이미지 · 전환 체크" },
      8: { type: "zoom", week: 5 },
      11: { type: "off", n: 5, title: "AI 반복 루틴 + 효자상품 10개 점검 · 다음 30일" },
    },
  },
]

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
  { n: 5, month: 7, off: "7.11 (토)", title: "AI 반복 루틴 + 효자상품 10개 점검 · 다음 30일", output: "효자상품 10개 + 30일 실행 계획", zoom: "7.8 (수)" },
]

const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"]

/** Tooltip 한 줄 정보 생성 */
function eventTip(ev: DayEvent, monthLabel: string, day: number): { head: string; body: string; tone: "warm" | "dark" | "outline" } {
  const m = parseInt(monthLabel.split(".")[1], 10) // "2026.06" → 6
  const dateStr = `${m}.${day}`
  if (ev.type === "free") {
    return {
      head: `${dateStr} (수) · 무료강의`,
      body: `${ev.label} · 본강의 결제 전, 누구나 참여`,
      tone: "warm",
    }
  }
  if (ev.type === "off") {
    return {
      head: `${dateStr} (토) · 오프라인 ${ev.n}주차`,
      body: ev.title,
      tone: "dark",
    }
  }
  return {
    head: `${dateStr} (수) · 줌 보강`,
    body: `WEEK ${ev.week} 직전 보강 · 매주 과제 점검`,
    tone: "outline",
  }
}

/** Hover tooltip — CSS-only group-hover, absolute, 셀 위쪽에 떠올림 */
function Tooltip({ tip }: { tip: { head: string; body: string } }) {
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 group-hover:block">
      <div className="font-sans whitespace-nowrap rounded-md border-2 border-foreground bg-foreground px-3 py-2 text-left text-background shadow-[0_4px_0_rgba(0,0,0,0.25)]">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-background/75">
          {tip.head}
        </div>
        <div className="mt-1 text-xs font-bold leading-snug text-background">
          {tip.body}
        </div>
      </div>
      {/* arrow */}
      <div className="mx-auto -mt-px h-2 w-2 rotate-45 bg-foreground" />
    </div>
  )
}

/** 한 달 mini 캘린더 grid */
function MonthGrid({ m, idx }: { m: (typeof months)[number]; idx: number }) {
  const totalCells = m.startWeekday + m.daysInMonth
  const rows = Math.ceil(totalCells / 7)
  const cells: ({ day: number | null; event?: DayEvent })[] = []
  for (let i = 0; i < rows * 7; i++) {
    if (i < m.startWeekday || i >= m.startWeekday + m.daysInMonth) {
      cells.push({ day: null })
    } else {
      const day = i - m.startWeekday + 1
      cells.push({ day, event: m.events[day] })
    }
  }

  return (
    <div
      data-reveal
      style={{ transitionDelay: `${idx * 100}ms` }}
      className="border-2 border-foreground bg-background p-4 sm:p-5"
    >
      <div className="font-mono mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
        <span>{m.label}</span>
        <span className="text-foreground/40">
          {idx === 0 ? "강의 시작" : "강의 마무리"}
        </span>
      </div>

      {/* 요일 헤더 */}
      <div className="font-mono mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-foreground/55">
        {weekdayLabels.map((d, i) => (
          <div key={d} className={`py-1 ${i >= 5 ? "text-foreground/35" : ""}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 일자 그리드 — 셀 max 48px 캡으로 데스크탑에서 박스 무한 확대 방지 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (c.day === null) {
            return <div key={i} className="aspect-square max-h-12" aria-hidden />
          }
          const weekday = i % 7
          const isWeekend = weekday >= 5
          const ev = c.event

          // 빈 셀 (일반 평일)
          if (!ev) {
            return (
              <div
                key={i}
                className={`flex aspect-square max-h-12 items-center justify-center rounded text-xs tabular-nums ${
                  isWeekend ? "text-foreground/35" : "text-foreground/60"
                }`}
              >
                {c.day}
              </div>
            )
          }

          const tip = eventTip(ev, m.label, c.day)
          const baseCell = "group relative flex aspect-square max-h-12 items-center justify-center rounded text-xs font-bold tabular-nums transition-transform hover:scale-110 hover:z-10"

          if (ev.type === "free") {
            return (
              <div
                key={i}
                className={`${baseCell} border-2 border-foreground bg-[var(--warm)] text-foreground`}
                tabIndex={0}
                title={`${c.day}일 ${ev.label}`}
                aria-label={`${c.day}일 ${ev.label}`}
              >
                {c.day}
                <span className="absolute -top-1 -right-1 text-[10px]" aria-hidden>🎁</span>
                <Tooltip tip={tip} />
              </div>
            )
          }

          if (ev.type === "off") {
            return (
              <div
                key={i}
                className={`${baseCell} bg-foreground text-background shadow-[0_2px_0_rgba(0,0,0,0.25)]`}
                tabIndex={0}
                title={`${c.day}일 오프라인 ${ev.n}주차 — ${ev.title}`}
                aria-label={`${c.day}일 오프라인 ${ev.n}주차 ${ev.title}`}
              >
                {c.day}
                <span className="font-mono absolute -bottom-1 -right-1 rounded-full bg-background px-1 text-[8px] font-bold leading-tight text-foreground ring-1 ring-foreground">
                  {ev.n}
                </span>
                <Tooltip tip={tip} />
              </div>
            )
          }

          // zoom
          return (
            <div
              key={i}
              className={`${baseCell} border-2 border-foreground bg-background text-foreground`}
              tabIndex={0}
              title={`${c.day}일 줌 보강 (WEEK ${ev.week} 직전)`}
              aria-label={`${c.day}일 줌 보강 WEEK ${ev.week} 직전`}
            >
              {c.day}
              <Tooltip tip={tip} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Calendar() {
  return (
    <Section
      tone="warm"
      id="calendar"
      label="Calendar"
      title={<>1기, 같이 가는 5주 일정.</>}
      lead="오프라인 5회 + 줌 보강 4회. 매주 토요일 오프라인으로 같이 작업하고, 사이 주중에 줌으로 보강합니다."
    >
      {/* 유튜브 무료 라이브 highlight */}
      <div className="mb-8 grid gap-4 border-2 border-foreground bg-background p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-7">
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
            유튜브 라이브로 가볍게 먼저 만나봐요. 5주 강의 결제 전에, 분위기·방향·내가 맞는지 직접 보세요.
          </p>
        </div>
        <span className="font-mono justify-self-start rounded-full border-2 border-foreground bg-foreground px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-background sm:justify-self-end">
          무료
        </span>
      </div>

      {/* 월간 grid 보기 — 6월 + 7월. mx-auto + max-w로 셀 비대 방지 */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        {months.map((m, i) => (
          <MonthGrid key={m.label} m={m} idx={i} />
        ))}
      </div>

      {/* 범례 */}
      <div className="mb-12 flex flex-wrap items-center gap-x-5 gap-y-2 border-l-4 border-foreground bg-background px-5 py-3 text-xs text-foreground/75 sm:text-sm">
        <span className="font-mono mr-1 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
          범례
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded border-2 border-foreground bg-[var(--warm)] text-[10px] font-bold">10</span>
          무료강의
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-foreground text-[10px] font-bold text-background">●</span>
          오프라인 (토)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded border-2 border-foreground bg-background text-[10px] font-bold">●</span>
          줌 보강 (수)
        </span>
        <span className="ml-auto hidden text-[10px] uppercase tracking-[0.12em] text-foreground/50 sm:inline">
          💡 셀에 마우스 올리면 상세
        </span>
      </div>

      {/* 5주 vertical timeline — 상세 보기 (블록 구분 명확화) */}
      <div className="mb-6 flex items-center gap-3">
        <div className="font-mono inline-flex items-center gap-2 rounded-full border border-foreground/30 bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/70">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
          상세 보기
        </div>
        <span className="h-px flex-1 bg-foreground/15" aria-hidden />
      </div>
      <ol className="relative border-l-2 border-foreground/20 pl-5 sm:pl-7">
        {weeks.map((w, i) => {
          const showMonthHeader = i === 0 || w.month !== weeks[i - 1].month
          return (
            <li
              key={w.n}
              data-reveal
              style={{ transitionDelay: `${i * 80}ms` }}
              className={`relative mb-4 last:mb-0 ${showMonthHeader ? "pt-7" : ""}`}
            >
              {showMonthHeader && (
                <div className="font-mono absolute -left-[34px] top-0 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/55 sm:-left-[42px]">
                  {`2026.0${w.month}`}
                </div>
              )}

              <span
                aria-hidden
                className={`absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-foreground text-[10px] font-bold sm:-left-[35px] ${
                  showMonthHeader ? "top-8" : "top-1"
                } ${
                  w.n === 1 || w.n === 5 ? "bg-foreground text-background" : "bg-background"
                }`}
              >
                {w.n}
              </span>

              <div className="group border-2 border-foreground bg-background p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_0_var(--foreground)] sm:p-6">
                <div className="font-mono mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
                  <span>WEEK {String(w.n).padStart(2, "0")}</span>
                  {w.n === 1 && <span className="text-foreground">▶ 시작</span>}
                  {w.n === 5 && <span className="text-foreground">▣ 마무리</span>}
                </div>

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

                <div className="mt-3 flex items-start gap-3 border-t border-foreground/10 pt-3 text-sm">
                  <Target className="mt-0.5 h-4 w-4 flex-none text-foreground/60" aria-hidden />
                  <div className="text-foreground/70">
                    <span className="font-mono mr-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/55">
                      산출물
                    </span>
                    <span className="font-bold text-foreground">{w.output}</span>
                  </div>
                </div>

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

      <p className="font-memo mt-8 text-sm leading-relaxed text-foreground/70 sm:text-base">
        ※ 위 일정은 예정이에요. 실제 날짜·시간은 1기 확정 후 참여자분께 따로 안내드립니다.
      </p>
    </Section>
  )
}
