import type { ReactNode } from "react"

/** 공통 섹션 wrapper — 톤 변형 + 일관된 패딩·max-width·라벨 */
export function Section({
  id,
  tone = "light",
  label,
  title,
  lead,
  children,
  className = "",
}: {
  id?: string
  tone?: "light" | "dark" | "warm"
  label?: string
  title?: ReactNode
  lead?: ReactNode
  children?: ReactNode
  className?: string
}) {
  const toneClass =
    tone === "dark"
      ? "bg-foreground text-background"
      : tone === "warm"
        ? "bg-[var(--warm)] text-foreground border-y border-[var(--warm-border)]"
        : "bg-background text-foreground"

  return (
    // overflow-x-clip: 섹션 안에서 의도적으로 컨테이너를 벗어나는 요소
    // (유튜브 캐러셀의 -mx-4 등)가 320~360px 극좁은 폭에서 body 폭을 넘겨
    // 페이지 전체에 가로 스크롤을 만들던 것을 각 섹션 안에 가둔다.
    <section id={id} className={`relative overflow-x-clip px-4 py-20 sm:px-6 sm:py-24 ${toneClass} ${className}`}>
      <div className="mx-auto max-w-5xl" data-reveal>
        {label && (
          <div className="font-mono mb-4 text-[11px] font-bold uppercase tracking-[0.22em] opacity-55">
            {label}
          </div>
        )}
        {title && (
          <h2 className="mb-6 text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
            {title}
          </h2>
        )}
        {lead && <p className="mb-10 max-w-2xl text-base opacity-75 sm:text-lg">{lead}</p>}
        {children}
      </div>
    </section>
  )
}
