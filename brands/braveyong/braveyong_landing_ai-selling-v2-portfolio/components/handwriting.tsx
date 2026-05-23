import type { ReactNode } from "react"

/** 노란 형광펜 — 한·두 키워드만 감쌈 */
export function Marker({ children }: { children: ReactNode }) {
  return <span className="marker">{children}</span>
}

/** 펜글씨 서명 — 약간 회전 */
export function Signature({
  children,
  className = "",
  small,
}: {
  children: ReactNode
  className?: string
  small?: ReactNode
}) {
  return (
    <span className={`inline-block ${className}`}>
      <span className="signature text-2xl sm:text-3xl">{children}</span>
      {small && (
        <span className="font-memo mt-1 block text-xs text-foreground/55">{small}</span>
      )}
    </span>
  )
}

/** 손그림 SVG 동그라미 — 강조하고 싶은 단어 감쌈 (보통 숫자) */
export function ScribbleCircle({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block px-1">
      {children}
      <svg
        aria-hidden
        className="pointer-events-none absolute -inset-y-1 -inset-x-2 h-[calc(100%+0.5rem)] w-[calc(100%+1rem)]"
        viewBox="0 0 120 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <path d="M14 28 C 10 14, 30 6, 60 6 C 96 6, 112 18, 110 28 C 108 38, 92 46, 58 46 C 30 46, 12 40, 16 28 C 18 22, 22 18, 28 16" />
      </svg>
    </span>
  )
}

/** 손그림 화살표 + 짧은 메모 (Nanum Pen Script) */
export function ArrowNote({ children }: { children: ReactNode }) {
  return (
    <p className="font-hand inline-flex -rotate-1 items-center gap-2 text-lg text-[var(--warm-border)]">
      <svg
        aria-hidden
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M4 16 C 8 8, 14 4, 20 6" />
        <path d="M20 6 L 16 5 M 20 6 L 19 11" />
      </svg>
      {children}
    </p>
  )
}
