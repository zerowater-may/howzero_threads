"use client"

import { useEffect, useState } from "react"
import { course, priceText } from "@/lib/config"
import { CountdownTimer } from "./countdown-timer"
import { PaymentDialog } from "./payment-dialog"

/**
 * Sticky CTA — 스크롤 시작 직후 등장. 결제 버튼 하나만 둔다.
 * 이전에는 결제 버튼 옆에 "신청서 작성"(구글폼)을 나란히 뒀는데,
 * 결제 결심 직전에 무료 대안을 붙이는 꼴이라 결제 의도를 흡수했다 — 제거.
 * 등장 조건: 첫 화면을 지난 뒤. 히어로에서 가격을 뺀 이유와 같다 —
 * 금액은 뭘 하는 수업인지 본 다음에 보여야 거부감이 덜하다.
 */
export function StickyCTA() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hero = document.querySelector("#hero") as HTMLElement | null
    const trigger = hero ? hero.offsetTop + hero.offsetHeight - 120 : 600
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
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* 마감 카운트다운 + 가격 — 모바일 위쪽 한 줄, 데스크탑 좌측 */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span className="font-mono rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-foreground">
            {course.cohort} 개강 전 마감
          </span>
          <CountdownTimer compact className="text-foreground" label="" />
          <span className="text-foreground/30">·</span>
          <span className="tabular-nums">
            <span className="text-base font-bold text-foreground sm:text-lg">{priceText.total}</span>
            <span className="ml-1 text-xs text-foreground/55 sm:text-sm">부가세 포함</span>
            <span className="ml-1 hidden text-xs text-foreground/55 sm:inline sm:text-sm">
              · 월 {priceText.monthly6} / 6개월 무이자
            </span>
          </span>
        </div>

        {/* CTA — 결제 하나만. 폼·카톡 등 다른 출구는 두지 않는다. */}
        <div className="flex w-full items-center sm:w-auto">
          <div data-track="sticky_pay_open" className="min-w-0 flex-1 sm:flex-none">
            <PaymentDialog
              amount={course.priceFirst}
              label={priceText.payLabel}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-6 py-4 text-base font-extrabold tracking-tight text-brand-foreground shadow-lg transition-all hover:opacity-90 sm:w-auto sm:px-10 sm:text-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
