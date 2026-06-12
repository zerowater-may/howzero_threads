"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

/**
 * 플랫폼 product 탭 — 용팀장 랜딩 전환(AI 셀링 강의 ↔ 8월 통관 특강).
 * 현재 경로를 active로 강조. 두 상단 바(GlassNav / GlassNav815)에서 공용.
 */
const products = [
  { href: "/", label: "AI 셀링 강의" },
  // 8월 통관 특강 일시 중단 — 재개 시 아래 항목 주석 해제
  // { href: "/815", label: "8월 통관 특강" },
]

export function ProductTabs({ className = "" }: { className?: string }) {
  const pathname = usePathname()
  return (
    <nav
      className={`items-center rounded-full border border-foreground/15 bg-foreground/[0.04] p-1 ${className}`}
      aria-label="용팀장 랜딩 전환"
    >
      {products.map((p) => {
        const active = pathname === p.href
        return (
          <Link
            key={p.href}
            href={p.href}
            aria-current={active ? "page" : undefined}
            data-track={`nav_product_${p.href === "/" ? "course" : "tonggwan"}`}
            className={
              active
                ? "rounded-full bg-foreground px-3.5 py-1.5 text-sm font-bold tracking-tight text-background"
                : "rounded-full px-3.5 py-1.5 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
            }
          >
            {p.label}
          </Link>
        )
      })}
    </nav>
  )
}
