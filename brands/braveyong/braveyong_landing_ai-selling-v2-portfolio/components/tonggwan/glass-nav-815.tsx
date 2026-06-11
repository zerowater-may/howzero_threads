"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { PaymentDialog } from "@/components/payment-dialog"
import { ProductTabs } from "@/components/product-tabs"
import { tonggwan815 } from "@/lib/products"

/**
 * 00 NAV (815) — 통관 특강 글래스 상단 바.
 * 가운데: 플랫폼 product 탭(ProductTabs, 현재 페이지 active).
 * 우측: 다크 토글 + 815 결제(productKey/deadline/완료링크/프로모배지 비노출).
 */
export function GlassNav815() {
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
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        backdropFilter: "blur(28px) saturate(160%)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-5">
        {/* 브랜드 — 최상단으로 */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group flex shrink-0 items-center gap-2 text-sm font-bold tracking-tight"
          aria-label="페이지 최상단으로"
          data-track="nav815_brand_home"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-brand transition-transform group-hover:scale-125" />
          <span className="hidden sm:inline">용감한 용팀장</span>
          <span className="sm:hidden">용팀장</span>
        </button>

        {/* 플랫폼 product 탭 — 강의 ↔ 통관 특강 (모바일 hidden) */}
        <ProductTabs className="hidden md:flex" />

        {/* 다크 토글 + 지금 신청(815 결제) */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            data-track="nav815_theme_toggle"
            className="rounded-full p-2 text-foreground transition-all hover:bg-foreground/10"
          >
            {mounted ? (
              isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <span className="block h-4 w-4" aria-hidden />
            )}
          </button>
          <PaymentDialog
            label="지금 신청"
            amount={tonggwan815.price}
            productKey={tonggwan815.productKey}
            deadline={tonggwan815.payDeadlineISO}
            deadlineLabel={tonggwan815.deadlineLabel}
            completePathPrefix="/815/complete"
            hidePromoBadges
            noticeCopy={
              <>
                이름과 휴대폰 번호를 입력하면 <span className="font-bold text-foreground">결제 페이지가 바로 열립니다.</span>{" "}
                결제 후 화면의 <span className="font-bold text-brand">‘입장 링크 받기’</span>로 카톡 오픈채팅방에 입장하세요. 6/21까지 방에서 챙겨드립니다.
              </>
            }
            className="group inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-bold tracking-tight text-brand-foreground transition-all hover:opacity-90 hover:ring-2 hover:ring-brand/40 sm:px-4 sm:py-2 sm:text-sm"
          />
        </div>
      </div>
    </header>
  )
}
