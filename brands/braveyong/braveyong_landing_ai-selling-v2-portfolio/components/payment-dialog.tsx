"use client"

import { FormEvent, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { CreditCard, ExternalLink, Loader2, X } from "lucide-react"
import { config } from "@/lib/config"

type PaymentDialogProps = {
  label?: string
  amount: number
  className?: string
  dark?: boolean
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
}: PaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [memberName, setMemberName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [applyAgreed, setApplyAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    if (!applyAgreed) {
      setError("결제 후 신청서 작성 동의가 필요합니다.")
      return
    }
    const preparedWindow = preparePaymentWindow()
    setLoading(true)
    setError(null)
    setResendMessage(null)
    setResult(null)

    try {
      const response = await fetch("/api/paymint/send-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberName, phoneNumber }),
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
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/45 px-4 py-16 backdrop-blur-sm sm:py-20">
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
                className="rounded-full border border-foreground/20 p-2 transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-foreground/70">
              이름과 휴대폰 번호를 입력하면, <span className="font-bold text-foreground">결제 페이지가 바로 열립니다.</span>
              바로 열 수 없는 결제선생 환경에서는 카톡 청구서로 자동 전환됩니다.
              결제 후에는 <span className="font-bold text-brand">5주 시작 전까지 신청서 작성</span>이 필수입니다.
            </p>
            <p className="mt-2 rounded border-l-2 border-foreground bg-foreground/[0.04] px-3 py-2 text-xs leading-relaxed text-foreground/80 sm:text-sm">
              ⚠️ <span className="font-bold text-foreground">신청서와 결제정보(이름·휴대폰)는 꼭 동일하게</span> 작성해 주세요. 일치해야 본인 확인이 가능합니다.
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
            </div>

            <form className="mt-5 space-y-4" onSubmit={submit}>
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

              {/* 신청서 동의 — 필수. 미동의 시 결제 청구서 발송 안 됨 */}
              <div className="border-2 border-foreground bg-foreground/[0.04] p-4">
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={applyAgreed}
                    onChange={(event) => setApplyAgreed(event.target.checked)}
                    className="mt-1 h-5 w-5 flex-none accent-foreground"
                    required
                  />
                  <span className="leading-relaxed">
                    <span className="font-bold text-foreground">
                      결제 후 5주 시작 전까지 신청서를 꼭 작성하겠습니다.
                    </span>
                    <br />
                    <span className="text-foreground/70">
                      신청서 미작성 시 환불·참여 진행이 어려울 수 있어요.
                    </span>
                    <a
                      href={config.googleFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track="payment_modal_apply_link"
                      className="mt-2 inline-flex items-center gap-1 font-bold text-foreground underline underline-offset-4"
                    >
                      📝 신청서 미리 작성 (약 1분)
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                </label>
              </div>

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
                disabled={loading || !applyAgreed}
                data-track="payment_submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-6 py-4 text-base font-bold text-brand-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                {applyAgreed ? "지금 바로 결제하기" : "신청서 동의 후 진행"}
              </button>
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
