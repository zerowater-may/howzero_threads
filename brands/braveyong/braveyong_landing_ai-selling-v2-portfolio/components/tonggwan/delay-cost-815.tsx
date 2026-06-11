import { Section } from "@/components/section"
import { PaymentDialog } from "@/components/payment-dialog"
import { tonggwan815 } from "@/lib/products"

/**
 * 미룰수록 손해 — 좌(오늘=손해 0) → 우(8.15=통관 정지) 가로 타임라인.
 * 날짜가 지날수록 색이 짙어지며(안전→위험) "언제 신청하느냐 → 뭘 잃느냐"를 한눈에 보여준다.
 * 상세페이지 설득 5단계 중 ⑤ 행동촉구(긴급) 강화 섹션.
 */
type Stop = {
  when: string
  tag: string
  lose: string
  detail: string
  /** 0(안전) ~ 4(최대 손해) */
  level: 0 | 1 | 2 | 3 | 4
}

const STOPS: Stop[] = [
  {
    when: "오늘",
    tag: "지금 신청",
    lose: "잃는 것 없음",
    detail: "6/21 라이브 다 듣고, 8.15까지 여유 있게 부호 등록까지 끝냅니다.",
    level: 0,
  },
  {
    when: "6/20",
    tag: "결제 마감",
    lose: "신청 자체가 닫힘",
    detail: "이 날이 지나면 이번 특강은 신청할 수 없습니다.",
    level: 1,
  },
  {
    when: "6/21",
    tag: "라이브 당일",
    lose: "실시간 Q&A 끝",
    detail: "막히는 지점을 바로 못 풀고, 혼자 공지만 보며 헤매기 시작합니다.",
    level: 2,
  },
  {
    when: "7월 말",
    tag: "8.15까지 2주",
    lose: "여유 시간 소진",
    detail: "은행에서 막히면 우회로(금융인증서·세관 제출) 돌릴 시간이 빠듯해집니다.",
    level: 3,
  },
  {
    when: "8.15",
    tag: "통관 데드라인",
    lose: "통관 정지 = 매출 정지",
    detail: "부호 없으면 통관 플랫폼에서 막힙니다. 가장 큰 손해.",
    level: 4,
  },
]

/** level별 강조 — 왼쪽(안전, 옅음) → 오른쪽(위험, brand 짙음) */
const DOT = ["bg-foreground/25", "bg-foreground/45", "bg-brand/45", "bg-brand/70", "bg-brand"]
const BAR = ["bg-foreground/15", "bg-foreground/30", "bg-brand/40", "bg-brand/65", "bg-brand"]
const PILL = [
  "border-foreground/20 text-foreground/55",
  "border-foreground/30 text-foreground/70",
  "border-brand/40 text-brand",
  "border-brand/60 text-brand",
  "border-brand bg-brand text-brand-foreground",
]

export function DelayCost815() {
  return (
    <Section
      id="delay-cost"
      tone="warm"
      label="COST OF WAITING"
      title={<>하루 미룰수록, 손해는 커집니다</>}
      lead="신청이 늦어질수록 — 받을 수 있는 일정도, 막혔을 때 빠져나갈 시간도 줄어듭니다. 왼쪽에서 오른쪽으로 갈수록(=날짜가 지날수록) 잃는 게 커져요."
    >
      {/* 좌(안전) → 우(위험) 안내 */}
      <div className="mb-5 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/45">
        <span>← 지금 (손해 0)</span>
        <span className="text-brand">8.15 (손해 최대) →</span>
      </div>

      {/* 데스크톱: 가로 5칸 / 모바일: 세로 스택 */}
      <ol className="grid gap-4 sm:grid-cols-5 sm:gap-3">
        {STOPS.map((s, i) => (
          <li key={s.when} className="relative flex flex-col">
            {/* 손해 게이지 막대 (좌→우 짙어짐) */}
            <div className="flex items-center gap-2 sm:block">
              <div className={`h-1.5 w-full rounded-full ${BAR[s.level]}`} />
            </div>
            {/* 노드 + 날짜 */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[s.level]}`} />
              <span className="text-lg font-bold tracking-tight">{s.when}</span>
            </div>
            <span className="font-mono mt-0.5 text-[11px] uppercase tracking-[0.12em] text-foreground/45">
              {s.tag}
            </span>
            {/* 잃는 것 */}
            <span
              className={`mt-3 inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${PILL[s.level]}`}
            >
              {s.lose}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">{s.detail}</p>
          </li>
        ))}
      </ol>

      {/* 결론 + CTA */}
      <div className="mt-9 flex flex-col items-center gap-3 border-t border-[var(--warm-border)]/30 pt-7 text-center">
        <p className="text-base font-bold sm:text-lg">
          가장 손해 없는 선택은 <span className="text-brand">‘오늘’</span> 입니다.
        </p>
        <PaymentDialog
          label="오늘 신청하고 손해 끊기"
          amount={tonggwan815.price}
          productKey={tonggwan815.productKey}
          deadline={tonggwan815.payDeadlineISO}
          deadlineLabel={tonggwan815.deadlineLabel}
          completePathPrefix="/815/complete"
          hidePromoBadges
          noticeCopy={
            <>
              이름과 휴대폰 번호를 입력하면 <span className="font-bold text-foreground">결제 페이지가 바로 열립니다.</span>{" "}
              결제 후 화면의 <span className="font-bold text-brand">‘입장 링크 받기’</span>로 카톡 오픈채팅방에 입장하세요. 6/21까지 방에서 챙겨드립니다.
            </>
          }
        />
      </div>
    </Section>
  )
}
