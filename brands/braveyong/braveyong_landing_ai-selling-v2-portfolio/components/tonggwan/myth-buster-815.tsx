import { Section } from "@/components/section"

/**
 * 공포 해소 소구점 — "통장 사업자마다 / 사업자 통장 / 20영업일 룰" 3대 오해를 정면으로 깬다.
 * 단톡방에 도는 공포가 정점일 때(손실 섹션 직후) 배치해 fear → relief.
 * 정직성: 통장 개수 공포는 깨되, '은행별 확인 필요'는 남겨 특강 가치로 연결(브랜드 룰: 무조건/보장 금지).
 */
type Myth = {
  fear: string
  fearSub: string
  truth: string
  truthSub: string
}

const MYTHS: Myth[] = [
  {
    fear: "사업자마다 통장을 새로 만들어야 한다",
    fearSub: "사업자 30개면 통장 30개?!",
    truth: "통장은 한 개도 새로 안 만듭니다",
    truthSub: "사업자가 30개여도 기존 개인계좌 하나에 전부 연결.",
  },
  {
    fear: "‘사업자 통장(사업용)’이어야 한다",
    fearSub: "새 사업용 계좌부터 터야 한다고?",
    truth: "개인사업자는 기존 개인계좌 그대로",
    truthSub: "대표 개인 = 사업체라, 이미 쓰는 개인통장을 연결합니다.",
  },
  {
    fear: "20영업일 룰에 막혀 등록을 못 한다",
    fearSub: "통장을 못 만들어서 ‘망했다’?",
    truth: "새 통장을 안 만드니 룰에 안 걸립니다",
    truthSub: "신규 계좌 개설 자체가 없어 20영업일 제한과 무관.",
  },
]

export function MythBuster815() {
  return (
    <Section
      id="myth"
      tone="dark"
      label="오해 vs 진실"
      title={<>통장 30개? — 그 공포, 사실이 아닙니다</>}
      lead="구매대행 사장님들이 지금 가장 무서워하는 게 이겁니다. 사업자 수만큼 통장을 새로 만들어야 하고, 그것도 ‘사업자 통장’이어야 하고, 20영업일 룰에 막혀 못 한다는 말 — 셋 다 오해예요."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {MYTHS.map((m, i) => (
          <div key={i} className="flex flex-col border border-background/15 bg-background/[0.04] p-5">
            {/* 오해 */}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 font-bold text-red-400">✕</span>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-red-400/80">이렇게 알고 계셨죠</p>
                <p className="mt-1 text-sm font-bold leading-snug text-background/65">{m.fear}</p>
                <p className="mt-1 text-xs text-background/40">{m.fearSub}</p>
              </div>
            </div>

            <div className="my-4 h-px bg-background/12" />

            {/* 진실 */}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 font-bold text-background">✓</span>
              <div>
                <span className="inline-flex rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-foreground">
                  진실
                </span>
                <p className="mt-1.5 text-base font-bold leading-snug text-background">{m.truth}</p>
                <p className="mt-1 text-sm leading-relaxed text-background/70">{m.truthSub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 정직한 단서 → 특강 가치 */}
      <p className="mx-auto mt-7 max-w-2xl border-l-2 border-brand bg-background/[0.06] px-4 py-3 text-sm leading-relaxed text-background/85 sm:text-base">
        진짜 변수는 <span className="font-bold text-background">‘통장 개수’가 아니라</span> — 은행·지점이 이 연결을 받아주느냐입니다.
        되는 은행과, 막혔을 때 빠지는 길까지 6/21 라이브에서 정확히 짚어드립니다.
      </p>
    </Section>
  )
}
