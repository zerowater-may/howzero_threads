"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"
import { config, course } from "@/lib/config"
import { CountdownTimer } from "./countdown-timer"

/**
 * Sticky CTA — Hero 통과 후 등장. 데스크탑에도 노출 (이전 모바일 only).
 * 1기 마감 datetime 카운트다운 + 가격 앵커링.
 */
export function StickyCTA() {
  const [show, setShow] = useState(false)
  const priceFirstWan = (course.priceFirst / 10000).toLocaleString()
  const priceRegularWan = (course.priceRegular / 10000).toLocaleString()

  useEffect(() => {
    const hero = document.querySelector("#hero") as HTMLElement | null
    if (!hero) {
      setShow(true)
      return
    }
    const trigger = hero.offsetTop + hero.offsetHeight - 100
    const onScroll = () => setShow(window.scrollY > trigger)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t-2 border-foreground bg-background/95 px-3 py-3 backdrop-blur-md transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        {/* 카운트다운 + 가격 — 모바일 위쪽 한 줄, 데스크탑 좌측 */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <CountdownTimer compact className="text-foreground" />
          <span className="text-foreground/30">·</span>
          <span className="tabular-nums">
            <s className="text-xs font-bold text-foreground/45 sm:text-sm">{priceRegularWan}만원</s>{" "}
            <span className="text-base font-bold text-foreground sm:text-lg">{priceFirstWan}만원</span>
          </span>
          <span className="font-mono rounded-full bg-[var(--warm)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--warm-border)]">
            1기 한정
          </span>
        </div>

        {/* CTA */}
        <Link
          href={config.googleFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="신청서 작성하기 — 약 3분, 새 창에서 열림"
          className="group flex w-full items-center justify-center gap-2 rounded-full border-2 border-foreground bg-foreground px-5 py-3 text-sm font-bold tracking-tight text-background transition-all hover:bg-background hover:text-foreground sm:w-auto sm:px-7"
        >
          신청서부터 적기 (약 3분)
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
