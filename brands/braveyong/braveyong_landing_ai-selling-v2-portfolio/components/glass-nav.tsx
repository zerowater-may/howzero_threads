"use client"

import Link from "next/link"
import { ArrowRight, ArrowUpRight, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { config } from "@/lib/config"

/**
 * 00 NAV — iOS 26 식 글래스 상단 바.
 * - bg-background/55 + backdrop-blur-2xl + saturate-150 (vibrancy)
 * - 미세한 하단 보더, 스크롤하면 살짝 진해짐
 * - 가운데: 섹션 점프 링크 (모바일 hidden)
 * - 우측: 다크 토글 + APPLY 버튼
 */
/**
 * 가운데 점프 링크.
 * `cta: true` 가 붙으면 가격 자리에 미니 설득 버튼(검정 박스 + 화살표)으로 렌더.
 * 가격은 페이지에 숫자가 없으니 메뉴를 행동 유도로 전환했다.
 */
const links = [
  { href: "#testimonials", label: "후기" },
  { href: "#curriculum", label: "커리큘럼" },
  { href: "#apply", label: "1기 지원", cta: true },
  { href: "#faq", label: "FAQ" },
]

export function GlassNav() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-foreground/10 bg-background/65 supports-[backdrop-filter]:bg-background/45"
          : "border-b border-transparent bg-background/30 supports-[backdrop-filter]:bg-background/15"
      } backdrop-blur-2xl backdrop-saturate-150`}
      style={{
        // iOS 26 vibrancy 느낌 — Tailwind 토큰 밖
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        backdropFilter: "blur(28px) saturate(160%)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-5">
        {/* 브랜드 */}
        <Link
          href="#hero"
          className="group flex shrink-0 items-center gap-2 text-sm font-bold tracking-tight"
          aria-label="페이지 최상단으로"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-foreground transition-transform group-hover:scale-125" />
          <span className="hidden sm:inline">용감한 용팀장</span>
          <span className="sm:hidden">용팀장</span>
          <span className="font-mono ml-1 hidden text-[10px] uppercase tracking-[0.18em] text-foreground/45 md:inline">
            AI Selling 실전반
          </span>
        </Link>

        {/* 섹션 점프 링크 — 모바일 hidden. 가격 자리는 미니 설득 버튼(cta) */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="섹션 이동">
          {links.map((l) =>
            l.cta ? (
              <Link
                key={l.href}
                href={l.href}
                className="group ml-1 inline-flex items-center gap-1.5 rounded-full border border-foreground bg-foreground px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.06em] text-background transition-all hover:bg-background hover:text-foreground"
              >
                {l.label}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {l.label}
              </Link>
            )
          )}
        </nav>

        {/* 다크 토글 + APPLY */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="rounded-full p-2 text-foreground transition-all hover:bg-foreground/10"
          >
            {mounted ? (
              isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <span className="block h-4 w-4" aria-hidden />
            )}
          </button>
          <Link
            href={config.googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="신청서 작성하기 — 새 창에서 열림"
            className="group inline-flex items-center gap-1 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-bold tracking-tight text-background transition-all hover:bg-background hover:text-foreground hover:ring-2 hover:ring-foreground sm:px-4 sm:py-2 sm:text-sm"
          >
            신청서 작성
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
