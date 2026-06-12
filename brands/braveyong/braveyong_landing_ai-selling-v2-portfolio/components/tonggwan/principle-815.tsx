import { Section } from "@/components/section"
import { ScribbleCircle } from "@/components/handwriting"

/**
 * 원리 섹션 (잠금판) — 4칸의 '존재'와 '딱 1칸에서 막힌다'는 긴장만 남기고
 * 칸 내용(How)은 전부 자물쇠·블러 처리. 블러 아래에 실제 답을 두지 않는다(소스 유출 방지) —
 * 더미 문자만 블러. 방법은 잠그되 거짓말은 안 한다: 비용 손익·은행별 변수·3원칙은 그대로 공개.
 */
type Step = {
  label: string
  locked?: boolean
  bottleneck?: boolean
}

const STEPS: Step[] = [
  { label: "STEP 1", locked: true },
  { label: "STEP 2", locked: true },
  { label: "STEP 3", bottleneck: true },
  { label: "STEP 4", locked: true },
]

export function Principle815() {
  return (
    <Section
      id="principle"
      tone="warm"
      label="HOW IT WORKS"
      title={<>8.15 등록까지 가는 길은 4칸. 막히는 칸은 하나뿐입니다.</>}
    >
      {/* 4칸 가로 플로우 — 내용은 비공개, 구조와 병목만 공개 */}
      <div className="grid gap-8 sm:grid-cols-4 sm:gap-5">
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            className={`relative border-2 p-4 ${
              s.bottleneck ? "border-brand bg-brand text-brand-foreground" : "border-foreground bg-background"
            }`}
          >
            <span
              className={`font-mono text-xs font-bold ${s.bottleneck ? "text-brand-foreground/70" : "text-foreground/45"}`}
            >
              {s.label}
            </span>

            {s.bottleneck ? (
              <>
                <p className="mt-1 text-sm font-bold leading-snug sm:text-base">🔒 여기서 전부 막힘</p>
                <p className="mt-1.5 text-xs leading-relaxed text-brand-foreground/80">
                  남들은 이 칸에서 한 달을 날립니다.
                </p>
              </>
            ) : (
              <>
                {/* 더미 문자 블러 — 실제 내용 아님(유출 방지) */}
                <p aria-hidden className="mt-1 select-none text-sm font-bold leading-snug blur-[5px] sm:text-base">
                  ●●● ●●●● ●●
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground/55">🔒 비공개 — 라이브에서 공개</p>
              </>
            )}

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

      {/* 본문 — 긴장만, 방법은 6/21로 */}
      <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed sm:text-lg">
        남들은 이 한 칸에서 새 통장을 만들려다 <span className="font-bold">한 달을 날립니다.</span>{" "}
        우리는 이 칸을 ‘다른 순서’로 통과합니다 —{" "}
        <span className="font-bold">그 순서가 6/21의 전부입니다.</span>
      </p>

      {/* 비용 1줄 압축 — 결과(손익)는 공개 OK */}
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
