import type { ReactNode } from "react"
import { Section } from "@/components/section"

/**
 * 공포 해소 소구점 — "통장 사업자마다 / 사업자 통장 / 20영업일 룰" 3대 오해를 정면으로 깬다.
 * 단톡방에 도는 공포가 정점일 때(손실 섹션 직후) 배치해 fear → relief.
 * 정직성: 오해는 깨되 '은행별 확인 필요'는 남겨 특강 가치로 연결(브랜드 룰: 무조건/보장 금지).
 */
type Myth = {
  fear: string
  truth: ReactNode
  truthSub: string
}

const MYTHS: Myth[] = [
  {
    fear: "사업자마다 통장을 새로 만들어야 한다",
    truth: (
      <>
        통장 <span className="bg-brand px-1.5 text-brand-foreground">0개</span>로 갑니다
      </>
    ),
    truthSub: "원리는 바로 다음 섹션에서 보여드립니다.",
  },
  {
    fear: "기업뱅킹은 사업자통장이 있어야 한다",
    truth: (
      <>
        기존 <span className="bg-brand px-1.5 text-brand-foreground">개인계좌 그대로</span>
      </>
    ),
    truthSub: "단, 은행별로 다르니 확인은 필수입니다.",
  },
  {
    fear: "무조건 20영업일 기다려야 한다",
    truth: (
      <>
        순서를 알면 <span className="bg-brand px-1.5 text-brand-foreground">그 줄에 설 필요가 없습니다</span>
      </>
    ),
    truthSub: "모르고 창구부터 가면 진짜로 20영업일짜리 길로 들어섭니다.",
  },
]

export function MythBuster815() {
  return (
    <Section
      id="myth"
      tone="dark"
      label="오해 vs 진실"
      title={<>당신을 멈추게 한 건 8.15가 아니라, 이 세 가지 오해입니다.</>}
      lead="구매대행 사장님들 단톡방을 멈추게 한 그 소문들 — 셋 다 오해입니다. 텍스트 짧게 갑니다."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {MYTHS.map((m, i) => (
          <div key={i} className="flex flex-col border border-background/15 bg-background/[0.04] p-5">
            {/* 오해 */}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 font-bold text-red-400">✕</span>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-red-400/80">오해</p>
                <p className="mt-1 text-sm font-bold leading-snug text-background/45 line-through decoration-background/40">
                  {m.fear}
                </p>
              </div>
            </div>

            <div className="my-4 h-px bg-background/12" />

            {/* 진실 */}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 font-bold text-background">✓</span>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-background/60">진실</p>
                <p className="mt-1.5 text-base font-bold leading-snug text-background">{m.truth}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-background/70">{m.truthSub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 정직한 단서 → 특강 가치 */}
      <p className="mx-auto mt-7 max-w-2xl border-l-2 border-brand bg-background/[0.06] px-4 py-3 text-sm leading-relaxed text-background/85 sm:text-base">
        은행·지점마다 다릅니다. 그래서 6/21엔{" "}
        <span className="font-bold text-background">‘은행에 뭐라고 물어봐야 하는지’</span> 문의 멘트까지 드립니다.
      </p>
    </Section>
  )
}
