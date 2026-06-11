import { Section } from "@/components/section"
import { ScribbleCircle } from "@/components/handwriting"

/**
 * 원리 통합 섹션 — why-now(병목 구조) + solution-teaser(통장 0개 원리) + cost(유료 인증서 비용)
 * 3섹션을 4칸 플로우 다이어그램 하나로 압축. 병목은 '인증서' 칸 하나뿐임을 시각화.
 * 정직성: '무조건 된다' 금지 — 은행·지점별 변수는 단서로 남겨 6/21 가치로 연결.
 */
type Step = {
  title: string
  sub: string
  bottleneck?: boolean
}

const STEPS: Step[] = [
  { title: "기존 개인계좌 연결", sub: "이미 쓰는 내 통장 그대로" },
  { title: "기업인터넷뱅킹 가입", sub: "사업자 명의 인터넷뱅킹" },
  { title: "무료 인증서 발급", sub: "공동인증서 — 옛 공인인증서", bottleneck: true },
  { title: "UNI-PASS 부호 등록", sub: "관세청 사이트에서 등록번호 받기" },
]

export function Principle815() {
  return (
    <Section
      id="principle"
      tone="warm"
      label="HOW IT WORKS"
      title={<>부호까지 가는 길은 4칸. 막히는 칸은 하나뿐입니다.</>}
    >
      {/* 4칸 가로 플로우 — 모바일은 세로 ↓, 데스크톱은 가로 → */}
      <div className="grid gap-8 sm:grid-cols-4 sm:gap-5">
        {STEPS.map((s, i) => (
          <div key={s.title} className="relative border-2 border-foreground bg-background p-4">
            {s.bottleneck && (
              <span className="absolute -top-3 left-3 inline-flex items-center gap-1 bg-brand px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] text-brand-foreground">
                ⚠ 남들이 막히는 칸
              </span>
            )}
            <span className="font-mono text-xs font-bold text-foreground/45">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-1 text-sm font-bold leading-snug sm:text-base">{s.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-foreground/65">{s.sub}</p>

            {/* 칸 사이 화살표 */}
            {i < STEPS.length - 1 && (
              <>
                <span
                  aria-hidden
                  className="absolute -right-[1.15rem] top-1/2 hidden -translate-y-1/2 text-lg font-bold text-brand sm:block"
                >
                  →
                </span>
                <span
                  aria-hidden
                  className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-lg font-bold text-brand sm:hidden"
                >
                  ↓
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 본문 — 병목의 정체 */}
      <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed sm:text-lg">
        남들이 막히는 칸은 <span className="font-bold">‘인증서’</span>입니다. 새 사업자통장을 만들려다{" "}
        <span className="font-bold">20영업일 줄</span>에 서죠. 우리는 새 통장을 안 만드니까 그 벽이 없습니다.
        저는 이걸 제 사업자들로 직접 해봤습니다.
      </p>

      {/* 비용 1줄 압축 */}
      <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-2 border-foreground bg-background px-5 py-4">
        <p className="font-mono text-xs tabular-nums leading-relaxed text-foreground/75 sm:text-sm">
          유료로 가면 — 사업자 5개 연 10만 / 20개 연 40만 / 30개 연 60만 원, 매년.
        </p>
        <p className="text-base font-bold sm:text-lg">
          오늘 방법이면{" "}
          <span className="text-brand">
            <ScribbleCircle>0원</ScribbleCircle>
          </span>
        </p>
      </div>

      {/* 정직 단서 → 특강 가치 */}
      <p className="mx-auto mt-6 max-w-2xl border-l-2 border-[var(--warm-border)] pl-4 text-base leading-relaxed text-foreground/80">
        단, <span className="font-bold text-foreground">은행·지점·비대면 정책마다 되고 안 되고가 갈립니다.</span>{" "}
        되는 경로와 막혔을 때 빠지는 우회로까지가 6/21 내용입니다.
      </p>

      <p className="mx-auto mt-6 max-w-2xl font-mono text-xs leading-relaxed text-foreground/55">
        정확성 3원칙 — ① ‘무조건 된다’는 없다 ② 막혀도 빠질 길이 있다 ③ 화면 그대로, 안 되는 건 안 된다고 말합니다
      </p>
    </Section>
  )
}
