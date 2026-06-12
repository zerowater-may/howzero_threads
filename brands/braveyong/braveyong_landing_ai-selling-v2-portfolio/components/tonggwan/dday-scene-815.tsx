import { Section } from "@/components/section"

/**
 * D+1 시뮬레이션 — 준비 안 한 8월 16일 아침을 스마트폰 알림 4장으로 재현.
 * 정직성 가드: 지어낸 건 시각뿐임을 본문에서 명시. 마무리는 무료 UNI-PASS 조회 행동 지시.
 */
type Alert = {
  time: string
  source?: string
  title: string
  sub: string
}

const ALERTS: Alert[] = [
  {
    time: "07:32",
    source: "배대지 알림",
    title: "통관 보류 — 통관고유부호 미기재",
    sub: "배대지: 해외 물건을 받아 한국으로 부쳐주는 대행 창고. 멈추는 곳이 여기입니다.",
  },
  {
    time: "09:10",
    source: "스토어 문의 7건",
    title: "“배송 언제 되나요?”",
    sub: "답할 말이 없습니다. 통관고유부호는 하루 만에 안 나옵니다.",
  },
  {
    time: "13:00",
    title: "첫 환불 요청",
    sub: "구매대행은 현지 결제가 이미 끝난 구조 — 환불은 곧 내 돈이 나가는 겁니다.",
  },
  {
    time: "17:45",
    title: "배송지연 누적 — 판매자 점수 하락",
    sub: "노출이 줄고, 최악은 판매 제한입니다.",
  },
]

export function DdayScene815() {
  return (
    <Section
      id="dday"
      tone="dark"
      label="D+1 SIMULATION"
      title={<>준비 안 하면, 8월 16일 아침은 이렇게 시작됩니다.</>}
    >
      {/* 스마트폰 알림 카드 4장 — 세로 스택 */}
      <div className="mx-auto flex max-w-md flex-col gap-3">
        {ALERTS.map((a) => (
          <div
            key={a.time}
            className="flex items-start gap-3 rounded-lg border border-background/15 bg-background/[0.06] p-4"
          >
            <span className="font-mono mt-0.5 shrink-0 text-sm font-bold tabular-nums text-brand">
              {a.time}
            </span>
            <div>
              {a.source && (
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-background/45">
                  {a.source}
                </p>
              )}
              <p className="mt-0.5 text-sm font-bold leading-snug text-background">{a.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-background/55">{a.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 정직성 — 지어낸 건 시각뿐 */}
      <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-background/75 sm:text-base">
        과장 같습니까? 저 네 줄에서 제가 지어낸 건 시각뿐입니다. 저도 구매대행을 직접 돌리는
        사람이라 압니다.
      </p>

      {/* 오늘 할 일 — 무료 UNI-PASS 조회 */}
      <div className="mx-auto mt-6 max-w-md border-l-2 border-brand bg-background/[0.06] px-4 py-4">
        <p className="text-sm leading-relaxed text-background/90 sm:text-base">
          그래서 오늘 할 일 — 지금{" "}
          <span className="font-bold text-background">UNI-PASS(관세청 전자통관 사이트)</span>에서 내
          통관고유부호가 있는지 조회하세요. 무료고, 1분입니다. 없다면, 아래를 계속 읽으셔야 합니다.
        </p>
        <a
          href="https://unipass.customs.go.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono mt-2 inline-block text-[11px] font-bold text-background/60 underline underline-offset-4 transition-colors hover:text-background"
        >
          UNI-PASS 바로가기 ↗
        </a>
      </div>
    </Section>
  )
}
