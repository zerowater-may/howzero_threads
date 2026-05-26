"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { config, course } from "@/lib/config"
import { CountdownTimer } from "./countdown-timer"
import { PaymentDialog } from "./payment-dialog"

/**
 * Sticky CTA — Hero 통과 후 등장. 데스크탑에도 노출 (이전 모바일 only).
 * 1기 마감 datetime 카운트다운 + 가격 앵커링.
 */
export function StickyCTA() {
  const [show, setShow] = useState(false)
  const priceFirstWan = (course.priceFirst / 10000).toLocaleString()
  const priceRegularWan = (course.priceRegular / 10000).toLocaleString()
  const monthlyWan = (course.priceFirst / 6 / 10000).toLocaleString() // 6개월 무이자 할부 기준

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
        {/* 카운트다운 + 할부가 — 모바일 위쪽 한 줄, 데스크탑 좌측 */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <CountdownTimer compact className="text-foreground" />
          <span className="text-foreground/30">·</span>
          <span className="tabular-nums">
            <s className="text-xs font-bold text-foreground/45 sm:text-sm">{priceRegularWan}만원</s>
            <span className="mx-1 text-foreground/30">→</span>
            <span className="text-base font-bold text-foreground sm:text-lg">월 {monthlyWan}만원~</span>
            <span className="ml-1 hidden text-xs text-foreground/55 sm:inline sm:text-sm">({priceFirstWan}만원 / 6개월 무이자)</span>
          </span>
          <span className="font-mono rounded-full bg-[var(--warm)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--warm-border)]">
            1기 한정
          </span>
        </div>

        {/* CTA — 신청서(보조) + 바로 결제하기(PaymentDialog 모달: 이름·전화 입력 → 카톡 청구서 발송 + 신청서 동의) */}
        <div className="flex w-full gap-2 sm:w-auto sm:gap-2">
          <Link
            href={config.googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="신청서 작성하기 — 약 1분, 새 창에서 열림"
            className="group flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-foreground bg-background px-5 py-4 text-base font-bold tracking-tight text-foreground transition-all hover:bg-foreground hover:text-background sm:flex-none sm:px-7 sm:py-4"
          >
            신청서부터 적기 (약 1분)
          </Link>
          <PaymentDialog
            amount={course.priceFirst}
            label="바로 결제하기"
            className="group flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-5 py-4 text-base font-bold tracking-tight text-brand-foreground transition-all hover:opacity-90 sm:flex-none sm:px-7 sm:py-4"
          />
        </div>
      </div>
    </div>
  )
}
