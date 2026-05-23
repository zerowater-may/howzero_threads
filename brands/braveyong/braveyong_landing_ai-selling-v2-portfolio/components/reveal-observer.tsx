"use client"

import { useEffect } from "react"

/**
 * 전역 스크롤 reveal — data-reveal 속성이 달린 요소를 뷰포트 진입 시 .is-visible.
 * page.tsx 또는 layout에 한 번만 마운트. prefers-reduced-motion은 globals.css에서 처리.
 */
export function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]")
    if (els.length === 0) return

    // prefers-reduced-motion 사용자는 즉시 노출 (globals.css도 폴백)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-visible"))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible")
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    )

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return null
}
