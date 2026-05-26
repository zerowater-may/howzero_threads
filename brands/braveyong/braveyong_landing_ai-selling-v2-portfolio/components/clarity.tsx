"use client"

import { useEffect } from "react"
import Clarity from "@microsoft/clarity"

/**
 * Microsoft Clarity — heatmap + session recording (무료, 무제한).
 * @microsoft/clarity npm package 사용.
 * NEXT_PUBLIC_CLARITY_ID 환경변수가 있을 때만 init.
 *
 * Custom events 추적 가능 (Clarity.event/setTag/identify) — 향후 결제·신청서 CTA 클릭에 추가.
 */
export function ClarityProvider() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_CLARITY_ID
    if (!id) return
    // production·preview 모두 활성. development는 NODE_ENV로 자동 noop 가능하지만
    // 운영자가 preview에서도 행동 확인하고 싶을 수 있어 일단 모두 init.
    try {
      Clarity.init(id)
    } catch (err) {
      // Clarity 초기화 실패 시 페이지 자체엔 영향 X
      console.warn("[clarity] init failed", err)
    }
  }, [])

  return null
}
