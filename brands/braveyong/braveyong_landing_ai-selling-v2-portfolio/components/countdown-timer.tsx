"use client"

import { useEffect, useState } from "react"
import { config } from "@/lib/config"

/**
 * 개강 전 결제 마감 카운트다운. (얼리버드 이중 가격은 2026-07-20 폐지)
 * `config.payDeadline` (ISO datetime, KST)까지 D-N · HH:MM:SS.
 * 마감 후 자동 숨김 → consumer가 `showWhenExpired={false}` 기본으로 조건부 렌더.
 *
 * 가드: fake daily reset 아님. 실제 마감 datetime 기반.
 */
type Remaining = { d: number; h: number; m: number; s: number; total: number }

function calc(deadlineMs: number, nowMs: number): Remaining {
  const total = Math.max(0, deadlineMs - nowMs)
  const d = Math.floor(total / (1000 * 60 * 60 * 24))
  const h = Math.floor((total / (1000 * 60 * 60)) % 24)
  const m = Math.floor((total / (1000 * 60)) % 60)
  const s = Math.floor((total / 1000) % 60)
  return { d, h, m, s, total }
}

export function CountdownTimer({
  className = "",
  compact = false,
  deadline,
  label = "개강 전 결제 마감까지",
}: {
  className?: string
  /** 모바일/sticky용 단일 줄 압축 표기 */
  compact?: boolean
  /** ISO datetime(KST). 미지정 시 config.payDeadline */
  deadline?: string
  /** 비-compact 라벨 텍스트 */
  label?: string
}) {
  const deadlineMs = new Date(deadline ?? config.payDeadline).getTime()
  const [r, setR] = useState<Remaining | null>(null)

  useEffect(() => {
    const tick = () => setR(calc(deadlineMs, Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadlineMs])

  // 클라이언트 mount 전엔 자리만 차지하지 않게 noop
  if (!r) return null
  // 마감 후 자동 숨김
  if (r.total <= 0) return null

  const pad = (n: number) => String(n).padStart(2, "0")

  if (compact) {
    return (
      <span className={`font-mono inline-flex items-center gap-1 tabular-nums ${className}`}>
        <span className="font-bold">D-{r.d}</span>
        <span className="opacity-60">·</span>
        <span>{pad(r.h)}:{pad(r.m)}:{pad(r.s)}</span>
      </span>
    )
  }

  // flex-wrap + 각 조각 whitespace-nowrap — 좁은 폭(모달 375px 등)에서
  // "D-4"가 "D-" / "4"로 쪼개지던 문제를 막는다. 줄바꿈은 조각 사이에서만 일어난다.
  return (
    <div className={`font-mono inline-flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 tabular-nums ${className}`}>
      {label ? (
        <span className="whitespace-nowrap text-xs uppercase tracking-[0.18em] opacity-60">{label}</span>
      ) : null}
      <span className="whitespace-nowrap">
        <span className="text-lg font-bold">D-{r.d}</span>
        <span className="mx-1.5 opacity-50">·</span>
        <span className="text-base font-bold">
          {pad(r.h)}:{pad(r.m)}:{pad(r.s)}
        </span>
      </span>
    </div>
  )
}
