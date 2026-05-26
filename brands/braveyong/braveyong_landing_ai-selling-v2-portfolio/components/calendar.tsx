import { Section } from "./section"
import { Gift, Calendar as CalendarIcon, Video, Target } from "lucide-react"

/**
 * 09-B 1기 강의일정 캘린더 — Operation 다음, WhyYong 직전.
 * 월간 grid 보기(6월·7월) + 5주 timeline 카드 (origin-story 패턴).
 * 데이터: course.startDate 2026-06-13(토) 기준 매주 토요일 오프라인 5회, 줌은 2~5주차 직전 수요일 4회.
 */
const free = { date: "6.10 (수)", label: "유튜브 무료 전환강의" }

type EventType = "free" | "off" | "zoom"

const months: {
  label: string
  daysInMonth: number
  startWeekday: number // 0=Mon ~ 6=Sun
  events: Record<number, { type: EventType; n?: number }>
}[] = [
  {
    label: "2026.06",
    daysInMonth: 30,
    startWeekday: 0, // 2026-06-01 = Mon
    events: {
      10: { type: "free" },
      13: { type: "off", n: 1 },
      17: { type: "zoom" },
      20: { type: "off", n: 2 },
      24: { type: "zoom" },
      27: { type: "off", n: 3 },
    },
  },
  {
    label: "2026.07",
    daysInMonth: 31,
    startWeekday: 2, // 2026-07-01 = Wed
    events: {
      1: { type: "zoom" },
      4: { type: "off", n: 4 },
      8: { type: "zoom" },
      11: { type: "off", n: 5 },
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

/** 한 달 mini 캘린더 grid */
function MonthGrid({ m, idx }: { m: (typeof months)[number]; idx: number }) {
  // 시작 padding + 일자 cells
  const totalCells = m.startWeekday + m.daysInMonth
  const rows = Math.ceil(totalCells / 7)
  const cells: ({ day: number | null } & { event?: { type: EventType; n?: number } })[] = []
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

      {/* 일자 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (c.day === null) {
            return <div key={i} className="aspect-square" aria-hidden />
          }
          const weekday = i % 7 // 0=월 ~ 6=일
          const isWeekend = weekday >= 5
          const ev = c.event
          if (!ev) {
            return (
              <div
                key={i}
                className={`flex aspect-square items-center justify-center rounded text-xs tabular-nums ${
                  isWeekend ? "text-foreground/40" : "text-foreground/65"
                }`}
              >
                {c.day}
              </div>
            )
          }
          if (ev.type === "free") {
            return (
              <div
                key={i}
                className="relative flex aspect-square items-center justify-center rounded border-2 border-foreground bg-[var(--warm)] text-xs font-bold tabular-nums text-foreground"
                title="무료 전환강의"
                aria-label={`${c.day}일 무료 전환강의`}
              >
                {c.day}
                <span className="absolute -top-1 -right-1 text-[10px]" aria-hidden>🎁</span>
              </div>
            )
          }
          if (ev.type === "off") {
            return (
              <div
                key={i}
                className="relative flex aspect-square items-center justify-center rounded bg-foreground text-xs font-bold tabular-nums text-background shadow-[0_2px_0_rgba(0,0,0,0.25)]"
                title={`오프라인 ${ev.n}주차`}
                aria-label={`${c.day}일 오프라인 ${ev.n}주차`}
              >
                {c.day}
                {ev.n && (
                  <span className="font-mono absolute -bottom-1 -right-1 rounded-full bg-background px-1 text-[8px] font-bold leading-tight text-foreground ring-1 ring-foreground">
                    {ev.n}
                  </span>
                )}
              </div>
            )
          }
          // zoom
          return (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded border-2 border-foreground bg-background text-xs font-bold tabular-nums text-foreground"
              title="줌 보강"
              aria-label={`${c.day}일 줌 보강`}
            >
              {c.day}
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
      {/* 무료 전환강의 highlight */}
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

      {/* 월간 grid 보기 — 6월 + 7월 */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        {months.map((m, i) => (
          <MonthGrid key={m.label} m={m} idx={i} />
        ))}
      </div>

      {/* 범례 */}
      <div className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-l-4 border-foreground bg-background px-5 py-3 text-xs text-foreground/75 sm:text-sm">
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
      </div>

      {/* 5주 vertical timeline — 상세 보기 */}
      <div className="font-mono mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/55">
        상세 보기
      </div>
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
              {showMonthHeader && (
                <div className="font-mono absolute -left-[34px] -top-7 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/55 sm:-left-[42px]">
                  {`2026.0${w.month}`}
                </div>
              )}

              <span
                aria-hidden
                className={`absolute -left-[27px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-foreground text-[10px] font-bold sm:-left-[35px] ${
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
