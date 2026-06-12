import { Section } from "@/components/section"
import { CountdownTimer } from "@/components/countdown-timer"
import { ArrowNote } from "@/components/handwriting"
import { tonggwan815 } from "@/lib/products"

/**
 * 마감 — 희소성 + 미룰수록 손해를 하나로 병합한 섹션 (구 scarcity-815 + delay-cost-815).
 * 좌(오늘=잃는 것 없음, 옅음) → 우(8월=매출 정지, bg-brand 짙음) 게이지 타임라인으로
 * "언제 움직이느냐 → 뭘 잃느냐"를 dark 톤에서 한눈에 보여준다.
 */
type Stop = {
  when: string
  desc: string
  /** 0(안전) ~ 4(최대 손해) */
  level: 0 | 1 | 2 | 3 | 4
  /** 손글씨 화살표 메모 — 7월 칸 위 "여기부터 도박" */
  note?: string
}

const STOPS: Stop[] = [
  { when: "오늘", desc: "잃는 것 없음", level: 0 },
  { when: "6/20", desc: "결제 마감 — 신청 자체가 닫힘", level: 1 },
  { when: "6/21", desc: "라이브 단 1회 — Q&A 기회 끝", level: 2 },
  {
    when: "7월",
    desc: "발급·처리 구간 — 은행 한 번만 꼬여도 빠듯",
    level: 3,
    note: "여기부터 도박",
  },
  { when: "8월", desc: "통관 정지 = 매출 정지", level: 4 },
]

/** level별 농도 — 좌(옅은 background/20) → 우(bg-brand 짙게). delay-cost 게이지의 dark 톤 버전. */
const BAR = ["bg-background/20", "bg-background/35", "bg-brand/50", "bg-brand/75", "bg-brand"]
const DOT = ["bg-background/25", "bg-background/45", "bg-brand/50", "bg-brand/75", "bg-brand"]

export function Scarcity815() {
  return (
    <Section
      id="deadline"
      tone="dark"
      label="DEADLINE"
      title={<>8월에서 거꾸로 세면, 오늘이 제일 싼 날입니다.</>}
      lead="라이브 단 1회 — 같은 자리는 다시 없습니다. 6/20 결제 마감이 지나면 신청 자체가 닫힙니다."
    >
      {/* 상단 — 결제 마감 카운트다운 */}
      <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-2 border border-background/15 bg-background/[0.05] p-5 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/55">
          결제 마감
        </span>
        <CountdownTimer
          className="text-background"
          deadline={tonggwan815.payDeadlineISO}
          label="결제 마감까지"
        />
      </div>

      {/* 좌(안전) → 우(위험) 안내 */}
      <div className="mb-5 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-background/45">
        <span>← 오늘 (잃는 것 없음)</span>
        <span>8월 (매출 정지) →</span>
      </div>

      {/* 손해 게이지 타임라인 — 데스크톱 가로 5칸 / 모바일 세로 스택 */}
      <ol className="grid gap-5 sm:grid-cols-5 sm:gap-3 sm:pt-10">
        {STOPS.map((s) => (
          <li key={s.when} className="relative flex flex-col">
            {/* 손글씨 메모 — 모바일은 칸 안 위쪽, 데스크톱은 칸 위로 띄움 */}
            {s.note && (
              <div className="mb-1 sm:absolute sm:-top-10 sm:left-0 sm:mb-0">
                <ArrowNote>{s.note}</ArrowNote>
              </div>
            )}
            {/* 게이지 막대 (좌→우 짙어짐) */}
            <div className={`h-1.5 w-full rounded-full ${BAR[s.level]}`} />
            {/* 노드 + 날짜 */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[s.level]}`} />
              <span className="text-lg font-bold tracking-tight text-background">{s.when}</span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-background/70">{s.desc}</p>
          </li>
        ))}
      </ol>

      {/* 하단 멘트 */}
      <div className="mx-auto mt-12 max-w-2xl border-t border-background/15 pt-6">
        <p className="text-sm leading-relaxed text-background/85 sm:text-base">
          7월에 혼자 시작하면 은행 한 번만 꼬여도 데드라인을 넘깁니다. 오늘 할 일은 둘 중 하나 —{" "}
          <span className="font-bold text-background">
            결제하거나, 최소한 6/20 알람이라도 맞추세요.
          </span>{" "}
          아무것도 안 하는 게 제일 비쌉니다.
        </p>
      </div>
    </Section>
  )
}
