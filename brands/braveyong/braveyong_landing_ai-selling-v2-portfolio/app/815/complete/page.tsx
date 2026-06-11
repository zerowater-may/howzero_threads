"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, Clock } from "lucide-react"
import { tonggwan815 } from "@/lib/products"

type Phase = "loading" | "paid" | "pending" | "error" | "no-bill"

export default function CompletePage() {
  const params = useSearchParams()
  const billId = params.get("bill_id") || ""
  const [phase, setPhase] = useState<Phase>("loading")

  useEffect(() => {
    if (!billId) {
      setPhase("no-bill")
      return
    }
    let alive = true
    ;(async () => {
      try {
        const res = await fetch("/api/paymint/read-bill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ billId }),
        })
        const payload = await res.json()
        if (!alive) return
        const r = payload?.data ?? {}
        const inner = (r.data ?? {}) as Record<string, unknown>
        // 결제완료 상태코드 'C' 가정 — 실제 결제선생 응답으로 검증 필요(아래 한 줄만 교체).
        const state = inner.apprState ?? r.apprState ?? r.appr_state
        const isPaid = Boolean(r.dryRun) || state === "C"
        setPhase(payload?.success ? (isPaid ? "paid" : "pending") : "error")
      } catch {
        if (alive) setPhase("error")
      }
    })()
    return () => {
      alive = false
    }
  }, [billId])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-20 text-foreground">
      <div className="w-full max-w-md border-2 border-foreground bg-background p-6 text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/50">
          8.15 통관대응 라이브 특강
        </p>

        {phase === "loading" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-foreground/70">결제 상태를 확인하고 있습니다…</p>
          </div>
        )}

        {phase === "paid" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <CheckCircle2 className="h-10 w-10 text-brand" />
            <h1 className="text-xl font-bold tracking-tight">결제가 확인됐습니다</h1>
            <p className="text-sm leading-relaxed text-foreground/70">
              아래 버튼으로 카톡 오픈채팅방에 입장하세요.<br />6/21 라이브까지 방에서 안내드립니다.
            </p>
            {tonggwan815.openchatUrl ? (
              <a
                href={tonggwan815.openchatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-full items-center justify-center rounded-full border-2 border-brand bg-brand px-6 py-3.5 text-sm font-bold text-brand-foreground transition-opacity hover:opacity-90"
              >
                카톡 오픈채팅방 입장하기
              </a>
            ) : (
              <p className="mt-2 w-full rounded border-l-2 border-foreground bg-foreground/[0.04] px-3 py-2 text-left text-xs text-foreground/70">
                입장 링크 준비 중입니다. 잠시 후 결제 시 사용한 번호로 카톡 안내를 보내드립니다.
              </p>
            )}
          </div>
        )}

        {phase === "pending" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <Clock className="h-9 w-9 text-foreground/60" />
            <h1 className="text-lg font-bold tracking-tight">결제가 아직 확인되지 않았어요</h1>
            <p className="text-sm leading-relaxed text-foreground/70">
              결제를 마치셨다면 1~2분 후 새로고침해 주세요.<br />입장 링크는 결제가 확인되면 이 화면에 나타납니다.
            </p>
            <button
              type="button"
              onClick={() => location.reload()}
              className="mt-2 inline-flex items-center justify-center rounded-full border-2 border-foreground px-5 py-2.5 text-sm font-bold transition-colors hover:bg-foreground hover:text-background"
            >
              새로고침
            </button>
          </div>
        )}

        {(phase === "error" || phase === "no-bill") && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm leading-relaxed text-foreground/70">
              {phase === "no-bill"
                ? "결제 정보가 없어요. 신청 화면에서 결제를 먼저 진행해 주세요."
                : "상태 확인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요."}
            </p>
            <a
              href="/815"
              className="mt-1 inline-flex items-center justify-center rounded-full border-2 border-foreground px-5 py-2.5 text-sm font-bold transition-colors hover:bg-foreground hover:text-background"
            >
              신청 화면으로
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
