"use client"

import { useEffect } from "react"
import Clarity from "@microsoft/clarity"

/**
 * Microsoft Clarity — heatmap + session recording (무료, 무제한).
 * @microsoft/clarity npm package 사용.
 *
 * 모바일 LCP/INP 보호를 위해 init을 두 단계로 지연:
 * 1) requestIdleCallback (idle 시) 또는 setTimeout(2500) — main thread 양보
 * 2) 첫 user interaction (click/scroll/touchstart) 후 즉시 init — 분석 손실 최소화
 * 둘 중 먼저 일어나는 쪽으로 init.
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

    let initialized = false

    const initClarity = () => {
      if (initialized) return
      initialized = true
      try {
        Clarity.init(id)
      } catch (err) {
        console.warn("[clarity] init failed", err)
      }
    }

    // 1) idle 시 init — main thread 한가할 때
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }
    const w = window as IdleWindow
    const idleId = w.requestIdleCallback
      ? w.requestIdleCallback(initClarity, { timeout: 4000 })
      : (window.setTimeout(initClarity, 2500) as unknown as number)

    // 2) 첫 interaction 시 즉시 init — 사용자가 빠르게 움직이면 idle 못 기다림
    const onInteract = () => initClarity()
    const interactEvents = ["pointerdown", "keydown", "scroll"] as const
    interactEvents.forEach((evt) =>
      window.addEventListener(evt, onInteract, { once: true, passive: true })
    )

    // Delegated click handler — data-track 속성 가진 element 자동 추적.
    // Clarity가 아직 init 안 됐어도 등록은 즉시 (이벤트 누락 방지) — Clarity.event는 init 후에만 실제 전송.
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

    return () => {
      document.removeEventListener("click", handler, { capture: true })
      interactEvents.forEach((evt) => window.removeEventListener(evt, onInteract))
      if (w.cancelIdleCallback) {
        w.cancelIdleCallback(idleId)
      } else {
        clearTimeout(idleId)
      }
    }
  }, [])

  return null
}
