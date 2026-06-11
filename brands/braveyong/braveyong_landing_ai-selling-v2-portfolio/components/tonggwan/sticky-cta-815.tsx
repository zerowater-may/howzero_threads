"use client"

import { useEffect, useState } from "react"
import { CountdownTimer } from "@/components/countdown-timer"
import { PaymentDialog } from "@/components/payment-dialog"
import { tonggwan815 } from "@/lib/products"

/**
 * 815 전용 모바일 스티키 CTA — scrollY > 600px에서 등장 (md 이상 숨김).
 * 한 줄 바: 좌측 결제 마감 카운트다운(compact) + 우측 결제 버튼.
 */
export function StickyCta815() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-foreground/15 bg-background/90 px-4 py-3 backdrop-blur transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="shrink-0 text-[11px] font-bold text-foreground/60">결제 마감</span>
          <CountdownTimer compact deadline={tonggwan815.payDeadlineISO} className="text-foreground" />
        </div>
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
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border-2 border-brand bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground transition-all hover:opacity-90"
        />
      </div>
    </div>
  )
}
