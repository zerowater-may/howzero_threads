import { Section } from "./section"
// calendar timeline 제거로 unused imports 정리 — 필요 시 부활

/**
 * 09-B 1기 강의일정 캘린더 — Operation 다음, WhyYong 직전.
 * 월간 grid (6월·7월) + 5주 timeline 카드 (origin-story 패턴).
 * 데이터: course.startDate 2026-06-13(토) 기준 매주 토요일 오프라인 5회, 줌은 2~5주차 직전 수요일 4회.
 * grid 각 셀 hover 시 그 날 일정 detail tooltip 표시.
 */
type OffEvent = { type: "off"; n: number; title: string }
type ZoomEvent = { type: "zoom"; week: number }
type DayEvent = OffEvent | ZoomEvent

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
      13: { type: "off", n: 1, title: "소싱" },
      17: { type: "zoom", week: 2 },
      20: { type: "off", n: 2, title: "가공" },
      24: { type: "zoom", week: 3 },
      27: { type: "off", n: 3, title: "판매" },
    },
  },
  {
    label: "2026.07",
    daysInMonth: 31,
    startWeekday: 2, // 2026-07-01 = Wed
    events: {
      1: { type: "zoom", week: 4 },
      4: { type: "off", n: 4, title: "광고" },
      8: { type: "zoom", week: 5 },
      11: { type: "off", n: 5, title: "시스템화" },
    },
  },
]

const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"]

/** Tooltip 한 줄 정보 생성 */
function eventTip(ev: DayEvent, monthLabel: string, day: number): { head: string; body: string; tone: "dark" | "outline" } {
  const m = parseInt(monthLabel.split(".")[1], 10) // "2026.06" → 6
  const dateStr = `${m}.${day}`
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

      {/* 일정 요약 — 날짜만 한 줄 (상세 강의 내용은 위 grid hover + 커리큘럼 섹션 잠금카드에 위임) */}
      <div className="grid gap-2 border-2 border-foreground bg-background p-5 text-sm sm:grid-cols-3 sm:text-base">
        <div>
          <span className="font-mono mr-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/55">오프라인 (토)</span>
          <span className="font-bold tabular-nums">6.13 · 6.20 · 6.27 · 7.4 · 7.11</span>
        </div>
        <div>
          <span className="font-mono mr-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/55">줌 보강 (수)</span>
          <span className="font-bold tabular-nums">6.17 · 6.24 · 7.1 · 7.8</span>
        </div>
        <div className="sm:text-right">
          <span className="font-mono mr-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/55">장소</span>
          <span className="font-bold">선릉역 or 강남역 주변</span>
        </div>
      </div>

      <p className="font-memo mt-6 text-sm leading-relaxed text-foreground/70 sm:text-base">
        ※ 위 일정은 예정이에요. 정확한 시간·장소(선릉역 or 강남역 주변)는 1기 확정 후 참여자분께 따로 안내드립니다. 주차별 상세는 1기 신청 후 공개합니다.
      </p>
    </Section>
  )
}
