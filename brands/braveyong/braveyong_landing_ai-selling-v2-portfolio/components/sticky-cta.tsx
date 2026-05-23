"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"
import { config } from "@/lib/config"

/**
 * 모바일 sticky CTA — 02 STRIP 지나면 등장, 데스크톱에선 hidden.
 * Hero 안에 있을 땐 숨겨 결제 압을 강제하지 않음.
 */
export function StickyCTA() {
  const [show, setShow] = useState(false)

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
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-background/95 px-3 py-3 backdrop-blur transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Link
        href={config.googleFormUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-full items-center justify-center gap-2 rounded-full border-2 border-foreground bg-foreground px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] text-background transition-all hover:bg-background hover:text-foreground"
      >
        1기 실행자 특별가로 지원하기
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}
