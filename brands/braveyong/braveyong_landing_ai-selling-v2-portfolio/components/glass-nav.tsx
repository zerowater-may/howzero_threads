"use client"

import Link from "next/link"
import { ArrowRight, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { PaymentDialog } from "@/components/payment-dialog"
import { ProductTabs } from "@/components/product-tabs"
import { course } from "@/lib/config"

/**
 * 00 NAV — iOS 26 식 글래스 상단 바.
 * - bg-background/55 + backdrop-blur-2xl + saturate-150 (vibrancy)
 * - 미세한 하단 보더, 스크롤하면 살짝 진해짐
 * - 가운데: 섹션 점프 링크 (모바일 hidden)
 * - 우측: 다크 토글 + 결제 버튼
 */
/**
 * 가운데 점프 링크.
 * `cta: true` 가 붙으면 오퍼 자리(#price)로 점프하는 미니 설득 버튼(검정 박스 + 화살표)으로 렌더.
 * 우측 영구 CTA는 결제 모달을 바로 여는 PaymentDialog.
 */
const links = [
  { href: "#problem", label: "막힌 지점" },
  { href: "#choice", label: "내 상황" },
  { href: "#curriculum", label: "커리큘럼" },
  // 라벨을 "지금 결제"로 두면 우측 결제 버튼과 이름이 겹치는데 동작은 다르다(이건 스크롤 점프).
  // 눌렀는데 결제창이 안 열리면 그 자리에서 이탈하므로, 하는 일을 그대로 쓴다.
  { href: "#price", label: "가격 보기", cta: true },
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
        {/* 브랜드 + 플랫폼 product 탭 */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="#hero"
            className="group flex shrink-0 items-center gap-2 text-sm font-bold tracking-tight"
            aria-label="페이지 최상단으로"
            data-track="nav_brand_home"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-foreground transition-transform group-hover:scale-125" />
            <span className="hidden sm:inline">용감한 용팀장</span>
            <span className="sm:hidden">용팀장</span>
          </Link>
          <ProductTabs className="hidden md:flex" />
        </div>

        {/* 섹션 점프 링크 — 모바일 hidden. 가격 자리는 미니 설득 버튼(cta) */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="섹션 이동">
          {links.map((l) =>
            l.cta ? (
              <Link
                key={l.href}
                href={l.href}
                data-track="nav_jump_price_pay"
                className="group ml-1 inline-flex items-center gap-1.5 rounded-full border border-brand bg-brand px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.06em] text-brand-foreground transition-all hover:opacity-90"
              >
                {l.label}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                data-track={`nav_jump_${l.href.replace("#", "")}`}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {l.label}
              </Link>
            )
          )}
        </nav>

        {/* 다크 토글 + 지금 결제 */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            data-track="nav_theme_toggle"
            className="rounded-full p-2 text-foreground transition-all hover:bg-foreground/10"
          >
            {mounted ? (
              isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <span className="block h-4 w-4" aria-hidden />
            )}
          </button>
          <PaymentDialog
            amount={course.priceFirst}
            label="지금 결제"
            className="group inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-bold tracking-tight text-brand-foreground transition-all hover:opacity-90 hover:ring-2 hover:ring-brand/40 sm:px-4 sm:py-2 sm:text-sm"
          />
        </div>
      </div>
    </header>
  )
}
