"use client"

import { useEffect } from "react"
import Clarity from "@microsoft/clarity"

/**
 * Microsoft Clarity — heatmap + session recording (무료, 무제한).
 * @microsoft/clarity npm package 사용.
 *
 * 두 가지 기능:
 * 1. Clarity.init() — heatmap·session recording 자동 시작
 * 2. Delegated click handler — [data-track="event_name"] 속성 가진 element 클릭 시
 *    Clarity.event(event_name) 자동 호출. 각 CTA에 onClick 추가 안 해도 됨.
 *
 * 추적 이름 규칙: {section}_{action} (예: hero_apply, sticky_pay, apply_kakao)
 */
export function ClarityProvider() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_CLARITY_ID
    if (!id) return

    try {
      Clarity.init(id)
    } catch (err) {
      console.warn("[clarity] init failed", err)
      return
    }

    // Delegated click handler — data-track 속성 가진 element 자동 추적
    const handler = (e: MouseEvent) => {
      const target = (e.target as Element | null)?.closest("[data-track]")
      if (!target) return
      const event = target.getAttribute("data-track")
      if (!event) return
      try {
        Clarity.event(event)
      } catch {
        // 추적 실패는 무시 (페이지 동작 우선)
      }
    }
    document.addEventListener("click", handler, { capture: true })
    return () => document.removeEventListener("click", handler, { capture: true })
  }, [])

  return null
}
