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
    <section id={id} className={`relative px-4 py-20 sm:px-6 sm:py-24 ${toneClass} ${className}`}>
      <div className="mx-auto max-w-5xl">
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
