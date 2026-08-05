"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle2, Clock } from "lucide-react"
import { config, course, priceText } from "@/lib/config"

/**
 * 결제 완료 확인 — 실전반(현재 기수)용 — 기수 표기는 course.cohort를 따른다.
 *
 * 이전에는 course 결제 후 돌아올 화면이 없어서 "지금 결제하세요" 섹션(/#apply)으로
 * 튕겼다. 220만원을 결제한 직후에 결제 권유 화면을 다시 보면
 * "내 결제가 된 건가, 또 해야 하나" 불안이 생긴다 — 그 자리를 메우는 페이지.
 *
 * 결제창은 별도 탭에서 열리므로, 결제 모달의 '결제 완료 후 확인' 링크로 들어온다.
 */
type Phase = "loading" | "paid" | "pending" | "error" | "no-bill"

function CompleteInner() {
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
    <div className="w-full max-w-md border-2 border-foreground bg-background p-6 text-center sm:p-7">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/50">
        {course.name} · {course.cohort}
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
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">결제가 확인됐습니다.</h1>
          <p className="text-sm leading-relaxed text-foreground/75">
            {course.cohort} 자리가 확정됐어요. 결제하신 번호로{" "}
            <span className="font-bold text-foreground">용팀장이 카톡으로 1주차 일정·장소</span>를 직접 보내드립니다.
            <br />
            <br />
            {course.startDate} 개강이고, 노트북 꼭 챙겨 오세요. 그 자리에서 같이 돌려봅니다.
          </p>
          <Link
            href={config.kakaoOpenChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-track="complete_openchat"
            className="mt-2 inline-flex w-full items-center justify-center rounded-full border-2 border-foreground bg-foreground px-5 py-3 text-sm font-bold text-background transition-opacity hover:opacity-90"
          >
            단톡방 먼저 들어가기
          </Link>
        </div>
      )}

      {phase === "pending" && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <Clock className="h-9 w-9 text-foreground/60" />
          <h1 className="text-xl font-bold tracking-tight">아직 결제가 확인되지 않았어요.</h1>
          <p className="text-sm leading-relaxed text-foreground/75">
            결제창을 방금 닫으셨다면 반영에 1~2분 걸릴 수 있습니다. 잠시 후 새로고침해 주세요.
            <br />
            이미 결제하셨다면 <span className="font-bold text-foreground">다시 결제하지 마시고</span> 아래로 문의해 주세요.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            data-track="complete_refresh"
            className="mt-2 inline-flex w-full items-center justify-center rounded-full border-2 border-foreground px-5 py-3 text-sm font-bold transition-colors hover:bg-foreground hover:text-background"
          >
            새로고침
          </button>
          <Link
            href={config.kakao1to1Url}
            target="_blank"
            rel="noopener noreferrer"
            data-track="complete_ask_1to1"
            className="text-xs font-bold text-foreground/70 underline underline-offset-4 hover:text-foreground"
          >
            용팀장에게 1:1로 물어보기
          </Link>
        </div>
      )}

      {(phase === "error" || phase === "no-bill") && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">결제 정보를 찾지 못했어요.</h1>
          <p className="text-sm leading-relaxed text-foreground/75">
            {phase === "no-bill"
              ? "결제 확인에 필요한 정보가 주소에 없습니다."
              : "결제 상태를 불러오지 못했습니다."}
            <br />
            이미 결제하셨다면 <span className="font-bold text-foreground">다시 결제하지 마시고</span> 용팀장에게 알려주세요. 바로 확인해 드립니다.
          </p>
          <Link
            href={config.kakao1to1Url}
            target="_blank"
            rel="noopener noreferrer"
            data-track="complete_ask_1to1_error"
            className="mt-2 inline-flex w-full items-center justify-center rounded-full border-2 border-foreground bg-foreground px-5 py-3 text-sm font-bold text-background transition-opacity hover:opacity-90"
          >
            용팀장에게 1:1로 문의하기
          </Link>
          <Link
            href="/"
            data-track="complete_back_home"
            className="text-xs font-bold text-foreground/70 underline underline-offset-4 hover:text-foreground"
          >
            강의 페이지로 돌아가기
          </Link>
        </div>
      )}

      <p className="mt-6 border-t border-foreground/10 pt-4 text-[11px] leading-relaxed text-foreground/45">
        수강료 {priceText.headline}(부가세 별도) · 결제금액 {priceText.total}
      </p>
    </div>
  )
}

export default function CompletePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-20 text-foreground">
      <Suspense
        fallback={
          <div className="flex items-center gap-3 text-sm text-foreground/60">
            <Loader2 className="h-5 w-5 animate-spin" /> 불러오는 중…
          </div>
        }
      >
        <CompleteInner />
      </Suspense>
    </main>
  )
}
