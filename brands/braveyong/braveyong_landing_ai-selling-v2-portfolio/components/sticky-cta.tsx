"use client"

import { useEffect, useState } from "react"
import { config, course } from "@/lib/config"
import { CountdownTimer } from "./countdown-timer"
import { PaymentDialog } from "./payment-dialog"

/**
 * Sticky CTA — Hero 통과 후 등장. 데스크탑에도 노출 (이전 모바일 only).
 * 1기 마감 임박 카운트다운 + 가격 앵커링 + 단일 결제 CTA.
 * 저스크롤(평균 28%) 사용자에게 가장 중요한 결제 진입점이므로 결제 버튼을 풀폭/대비 강하게.
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
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* 마감 카운트다운 + 가격 앵커 — 모바일 위쪽 한 줄, 데스크탑 좌측 */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span className="font-mono rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-foreground">
            1기 마감 임박
          </span>
          <CountdownTimer compact className="text-foreground" />
          <span className="text-foreground/30">·</span>
          <span className="tabular-nums">
            <s className="text-xs font-bold text-foreground/45 sm:text-sm">{priceRegularWan}만원</s>
            <span className="mx-1 text-foreground/30">→</span>
            <span className="text-base font-bold text-foreground sm:text-lg">{priceFirstWan}만원</span>
            <span className="ml-1 hidden text-xs text-foreground/55 sm:inline sm:text-sm">(월 {monthlyWan}만원~ / 6개월 무이자)</span>
          </span>
        </div>

        {/* CTA — 주: 결제(PaymentDialog 모달), 보조: 신청서(outline) */}
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div data-track="sticky_pay_open" className="min-w-0 flex-1 sm:flex-none">
            <PaymentDialog
              amount={course.priceFirst}
              label="1기 특별가 — 지금 결제 198만원"
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-6 py-4 text-base font-extrabold tracking-tight text-brand-foreground shadow-lg transition-all hover:opacity-90 sm:w-auto sm:px-10 sm:text-lg"
            />
          </div>
          {/* 보조 — 신청서 작성 (outline, 컴팩트) */}
          <a
            href={config.googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="신청서 작성하기 — 약 1분, 새 창에서 열림"
            data-track="sticky_apply_form"
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-foreground bg-transparent px-4 py-4 text-xs font-bold text-foreground transition-all hover:bg-foreground hover:text-background sm:px-5 sm:text-sm"
          >
            신청서 작성
          </a>
        </div>
      </div>
    </div>
  )
}
