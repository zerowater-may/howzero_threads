"use client"

import { FormEvent, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { createPortal } from "react-dom"
import { CreditCard, ExternalLink, Loader2, X, ShieldCheck, Landmark } from "lucide-react"
import { CountdownTimer } from "./countdown-timer"

type PaymentDialogProps = {
  label?: string
  amount: number
  className?: string
  dark?: boolean
  /** send-bill로 보낼 상품 key. 미지정 시 서버가 기존 강의(course)로 처리 */
  productKey?: string
  /** 카운트다운 마감 ISO. 미지정 시 개강 전 결제 마감(config.payDeadline) */
  deadline?: string
  deadlineLabel?: string
  /** 안내 문단 override (기본은 강의용 문구) */
  noticeCopy?: ReactNode
  /**
   * 결제 후 `${completePathPrefix}?bill_id=...` 확인 링크 경로.
   * 기본은 실전반 완료 페이지(/complete) — 예전엔 미지정이라 course 결제자는
   * 확인 화면 없이 "지금 결제하세요" 섹션으로 되돌아가 중복 결제 불안을 겪었다.
   * 815 특강은 자체 경로(/815/complete)를 명시적으로 넘긴다.
   */
  completePathPrefix?: string
  /** true 시 6개월 할부 힌트 행 + 3개월 환불 보장 배지 숨김 (815 특강 전용) */
  hidePromoBadges?: boolean
}

type PaymentResult = {
  billId?: string
  shortUrl?: string
  code?: string
  message?: string
  deliveryType?: "URL" | "TALK"
  fallbackReason?: string
  dryRun?: boolean
  amount?: number
}

export function PaymentDialog({
  label = "지금 바로 결제하기",
  amount,
  className,
  dark = false,
  productKey,
  deadline,
  deadlineLabel,
  noticeCopy,
  completePathPrefix = "/complete",
  hidePromoBadges,
}: PaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [memberName, setMemberName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  /**
   * 모달이 열려 있는 동안: ESC로 닫히게 하고, 뒤 페이지 스크롤을 잠근다.
   * 이전엔 ESC도 배경 클릭도 안 먹어서 34px짜리 X 버튼이 유일한 출구였고,
   * 모달 안에서 스크롤하면 뒤 페이지가 같이 밀려 결제 도중 위치를 잃었다.
   */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  const monthly6 = Math.max(1, Math.round(amount / 6 / 10000))

  const triggerClassName =
    className ||
    "inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground bg-foreground px-6 py-3.5 text-sm font-bold tracking-tight text-background transition-all hover:bg-background hover:text-foreground"

  function preparePaymentWindow() {
    try {
      const opened = window.open("", "_blank")
      if (!opened) return null
      opened.opener = null
      opened.document.write(
        "<!doctype html><html><head><title>결제창 준비 중</title></head><body style=\"font-family:system-ui,sans-serif;padding:24px\"><strong>결제창을 준비하고 있습니다.</strong><p>잠시만 기다려주세요.</p></body></html>",
      )
      return opened
    } catch {
      return null
    }
  }

  function openPaymentPage(shortUrl: string, preparedWindow?: Window | null) {
    try {
      if (preparedWindow && !preparedWindow.closed) {
        preparedWindow.location.href = shortUrl
        return true
      }

      const opened = window.open(shortUrl, "_blank", "noopener,noreferrer")
      if (opened) return true
    } catch {
      // fall through to same-window navigation
    }

    window.location.href = shortUrl
    return false
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const preparedWindow = preparePaymentWindow()
    setLoading(true)
    setError(null)
    setResendMessage(null)
    setResult(null)

    try {
      const response = await fetch("/api/paymint/send-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberName, phoneNumber, productKey }),
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "청구서 발송에 실패했습니다.")
      }

      setResult(payload.data)
      if (payload.data?.shortUrl) {
        openPaymentPage(payload.data.shortUrl, preparedWindow)
      } else if (preparedWindow && !preparedWindow.closed) {
        preparedWindow.close()
      }
    } catch (err) {
      if (preparedWindow && !preparedWindow.closed) {
        preparedWindow.close()
      }
      setError(err instanceof Error ? err.message : "청구서 발송 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  async function resendKakao() {
    if (!result?.billId) {
      setResendMessage("먼저 결제창을 열어 청구서를 생성해주세요.")
      return
    }

    setResendLoading(true)
    setError(null)
    setResendMessage(null)

    try {
      const response = await fetch("/api/paymint/resend-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId: result.billId }),
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "카톡 재발송에 실패했습니다.")
      }

      setResendMessage("같은 결제 청구서를 카톡으로 다시 보냈습니다.")
    } catch (err) {
      setResendMessage(err instanceof Error ? err.message : "카톡 재발송 중 오류가 발생했습니다.")
    } finally {
      setResendLoading(false)
    }
  }

  const dialog = open ? (
    // 배경 클릭 시 닫힘 — 안쪽(dialog)에서 올라온 클릭은 무시한다.
    // 결제 모달에서 빠져나올 길이 34px짜리 X 버튼 하나뿐이면 갇힌 느낌을 준다.
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-black/45 px-4 py-16 backdrop-blur-sm sm:py-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="paymint-dialog-title"
            className="mx-auto w-full max-w-md border-2 border-foreground bg-background p-5 text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/50">
                  Paymint / 결제선생
                </p>
                <h3 id="paymint-dialog-title" className="mt-1 text-xl font-bold tracking-tight">
                  바로 결제하기
                </h3>
              </div>
              <button
                type="button"
                aria-label="결제 청구서 모달 닫기"
                data-track="payment_dialog_close"
                // 모바일 최소 터치 영역 44px — 이전엔 34x34라 정확히 누르기 어려웠다
                className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-foreground/20 transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-foreground/70">
              {noticeCopy ?? (
                <>
                  이름과 휴대폰 번호만 넣으면 <span className="font-bold text-foreground">결제창이 바로 열립니다.</span>{" "}
                  혹시 창이 안 열리면 같은 청구서를 카톡으로 보내드리니 그걸로 결제하셔도 돼요.{" "}
                  결제가 끝나면 용팀장이 <span className="font-bold text-brand">카톡으로 1주차 일정·장소</span>를 직접 챙겨 드립니다.
                </>
              )}
            </p>
            <p className="mt-2 rounded border-l-2 border-foreground bg-foreground/[0.04] px-3 py-2 text-xs leading-relaxed text-foreground/80 sm:text-sm">
              ⚠️ <span className="font-bold text-foreground">결제정보(이름·휴대폰)는 본인 명의로 정확히</span> 입력해 주세요. 본인 확인·연락에 사용됩니다.
            </p>

            <div className="mt-4 rounded border border-foreground/15 bg-foreground/[0.03] px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-foreground/60">결제 금액</span>
                <span className="text-right">
                  <span className="font-mono text-base font-bold tabular-nums">
                    {amount.toLocaleString()}원
                  </span>
                  <span className="ml-1 text-[11px] font-normal text-foreground/45">
                    (부가세 포함)
                  </span>
                </span>
              </div>
              {!hidePromoBadges && (
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-foreground/10 pt-2 text-xs text-foreground/60">
                  <span>한 번에 부담되면</span>
                  <span className="font-bold text-foreground">카드 6개월 무이자 · 월 {monthly6}만원대</span>
                </div>
              )}
              <div className="mt-2 border-t border-foreground/10 pt-2 text-center">
                <CountdownTimer className="text-brand" deadline={deadline} label={deadlineLabel} />
              </div>
            </div>

            <form className="mt-4 space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="text-sm font-bold">이름</span>
                <input
                  value={memberName}
                  onChange={(event) => setMemberName(event.target.value)}
                  placeholder="홍길동"
                  className="mt-2 w-full rounded-none border-2 border-foreground/20 bg-background px-3 py-3 text-base outline-none transition-colors focus:border-foreground"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold">휴대폰 번호</span>
                <input
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="01012345678"
                  className="mt-2 w-full rounded-none border-2 border-foreground/20 bg-background px-3 py-3 text-base outline-none transition-colors focus:border-foreground"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                />
              </label>

              {error && (
                <div className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </div>
              )}

              {result && (
                <div className="border-l-4 border-foreground bg-foreground/[0.04] px-4 py-3 text-sm leading-relaxed">
                  <p className="font-bold">
                    {result.dryRun
                      ? "테스트 모드로 결제 URL 요청이 성공했습니다."
                      : result.shortUrl
                        ? "결제창이 열렸습니다."
                        : "카톡으로 결제 청구서를 보냈습니다."}
                  </p>
                  <p className="mt-1 text-foreground/65">Bill ID: {result.billId}</p>
                  {!result.shortUrl && !result.dryRun && (
                    <p className="mt-2 text-foreground/70">
                      결제창을 바로 열 수 없어 같은 결제 청구서를 카톡으로 보냈습니다.
                    </p>
                  )}
                  {result.shortUrl && (
                    <div className="mt-3 flex flex-col gap-2">
                      <p className="text-foreground/70">
                        결제창이 열렸습니다. 안 열렸다면 아래 버튼으로 다시 열 수 있습니다.
                      </p>
                      <button
                        type="button"
                        data-track="payment_reopen"
                        onClick={() => result.shortUrl && openPaymentPage(result.shortUrl)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-foreground px-4 py-2 font-bold transition-colors hover:bg-foreground hover:text-background"
                      >
                        결제창 다시 열기
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  {completePathPrefix && result.billId && (
                    <div className="mt-3 border-t border-foreground/15 pt-3">
                      <p className="text-foreground/70">
                        <span className="font-bold text-foreground">결제를 마쳤다면</span> 아래에서 결제가 제대로 됐는지 확인하세요.
                      </p>
                      <a
                        href={`${completePathPrefix}?bill_id=${encodeURIComponent(result.billId)}`}
                        data-track="payment_complete_link"
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-4 py-2.5 font-bold text-brand-foreground transition-colors hover:opacity-90"
                      >
                        결제 확인하기
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                  {result.billId && !result.dryRun && (
                    <div className="mt-3 border-t border-foreground/15 pt-3">
                      <p className="text-foreground/65">
                        결제창을 닫았거나 나중에 결제해야 하면 같은 청구서를 카톡으로 다시 받을 수 있습니다.
                      </p>
                      <button
                        type="button"
                        data-track="payment_resend_kakao"
                        disabled={resendLoading}
                        onClick={resendKakao}
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-foreground bg-background px-4 py-2.5 font-bold text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {resendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        카톡으로 다시 받기
                      </button>
                    </div>
                  )}
                  {resendMessage && (
                    <p className="mt-3 text-xs font-bold text-foreground/70">
                      {resendMessage}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                data-track="payment_submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-6 py-4 text-base font-bold text-brand-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                지금 바로 결제하기
              </button>

              {/* 결제수단·안심 배지 — 입력폼 위에 있으면 모바일에서 제출 버튼이 화면 밖으로 밀려난다.
                  안심시키는 문구는 버튼 아래에 있어도 같은 일을 한다. */}
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-bold text-foreground/55">
                <span className="inline-flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> 카드</span>
                <span className="text-foreground/25">·</span>
                <span className="inline-flex items-center gap-1"><Landmark className="h-3.5 w-3.5" /> 계좌이체</span>
                <span className="text-foreground/25">·</span>
                <span>무이자 할부</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] font-bold text-foreground/60">
                {!hidePromoBadges && (
                  <>
                    <span className="inline-flex items-center gap-1 text-brand"><ShieldCheck className="h-3.5 w-3.5" /> 3개월 환불 보장</span>
                    <span className="text-foreground/25">·</span>
                  </>
                )}
                <span>결제 후 용팀장 직접 확인</span>
                <span className="text-foreground/25">·</span>
                <span>안전결제(결제선생)</span>
              </div>
            </form>
          </div>
        </div>
  ) : null

  return (
    <>
      <button type="button" data-track="payment_dialog_open" className={triggerClassName} onClick={() => setOpen(true)}>
        <CreditCard className="h-4 w-4" />
        {label}
      </button>

      {mounted && dialog ? createPortal(dialog, document.body) : null}
    </>
  )
}
