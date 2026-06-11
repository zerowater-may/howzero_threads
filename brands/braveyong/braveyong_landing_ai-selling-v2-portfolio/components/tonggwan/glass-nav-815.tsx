"use client"

import { ArrowRight, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { PaymentDialog } from "@/components/payment-dialog"
import { tonggwan815 } from "@/lib/products"

/**
 * 00 NAV (815) — 통관 특강 전용 글래스 상단 바.
 * GlassNav와 같은 vibrancy 톤, 단 815 섹션 앵커 + 815 결제로 구성.
 * - 가운데: 섹션 점프 탭 (모바일 hidden)
 * - 우측: 다크 토글 + 815 결제(productKey/deadline/완료링크/프로모배지 비노출)
 */
const links = [
  { href: "#why-now", label: "왜 지금" },
  { href: "#curriculum", label: "특강 내용" },
  { href: "#faq", label: "FAQ" },
  { href: "#price", label: "지금 신청", cta: true },
]

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
          <span className="font-mono ml-1 hidden text-[10px] uppercase tracking-[0.18em] text-foreground/45 md:inline">
            8.15 통관 특강
          </span>
        </button>

        {/* 섹션 점프 탭 — 모바일 hidden. 가격 자리는 미니 설득 버튼(cta) */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="섹션 이동">
          {links.map((l) =>
            l.cta ? (
              <a
                key={l.href}
                href={l.href}
                data-track="nav815_jump_price"
                className="group ml-1 inline-flex items-center gap-1.5 rounded-full border border-brand bg-brand px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.06em] text-brand-foreground transition-all hover:opacity-90"
              >
                {l.label}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </a>
            ) : (
              <a
                key={l.href}
                href={l.href}
                data-track={`nav815_jump_${l.href.replace("#", "")}`}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {l.label}
              </a>
            )
          )}
        </nav>

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
