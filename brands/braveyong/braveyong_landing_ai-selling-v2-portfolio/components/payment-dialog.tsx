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
  shortURL?: string
  code?: string
  message?: string
  dryRun?: boolean
  amount?: number
}

export function PaymentDialog({
  label = "결제 청구서 받기",
  amount,
  className,
  dark = false,
}: PaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [memberName, setMemberName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [applyAgreed, setApplyAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const triggerClassName =
    className ||
    "inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground bg-foreground px-6 py-3.5 text-sm font-bold tracking-tight text-background transition-all hover:bg-background hover:text-foreground"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!applyAgreed) {
      setError("결제 후 신청서 작성 동의가 필요합니다.")
      return
    }
    setLoading(true)
    setError(null)
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "청구서 발송 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
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
                  결제 청구서 받기
                </h3>
              </div>
              <button
                type="button"
                aria-label="결제 청구서 모달 닫기"
                className="rounded-full border border-foreground/20 p-2 transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-foreground/70">
              이름과 휴대폰 번호를 입력하면, <span className="font-bold text-foreground">카톡으로 결제 청구서 링크</span>가 바로 발송됩니다.
              결제 후에는 <span className="font-bold text-brand">5주 시작 전까지 신청서 작성</span>이 필수입니다.
            </p>
            <p className="mt-2 rounded border-l-2 border-brand bg-brand/5 px-3 py-2 text-xs leading-relaxed text-foreground/80 sm:text-sm">
              ⚠️ <span className="font-bold text-brand">신청서와 결제정보(이름·휴대폰)는 꼭 동일하게</span> 작성해 주세요. 일치해야 본인 확인이 가능합니다.
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
              <div className="border-2 border-brand bg-brand/5 p-4">
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={applyAgreed}
                    onChange={(event) => setApplyAgreed(event.target.checked)}
                    className="mt-1 h-5 w-5 flex-none accent-brand"
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
                      className="mt-2 inline-flex items-center gap-1 font-bold text-brand underline underline-offset-4"
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
                    {result.dryRun ? "테스트 모드로 청구서 요청이 성공했습니다." : "청구서가 발송되었습니다."}
                  </p>
                  <p className="mt-1 text-foreground/65">Bill ID: {result.billId}</p>
                  {result.shortURL && !result.dryRun && (
                    <a
                      href={result.shortURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 font-bold underline underline-offset-4"
                    >
                      결제 페이지 열기
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !applyAgreed}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-6 py-4 text-base font-bold text-brand-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                {applyAgreed ? "카톡으로 결제 청구서 받기" : "신청서 동의 후 진행"}
              </button>
            </form>

            <p className={`mt-4 text-xs leading-relaxed ${dark ? "text-foreground/55" : "text-foreground/50"}`}>
              로컬 테스트는 dry-run 상태일 수 있습니다. 실제 발송 전에는 신청자 정보와 결제 안내 여부를 확인하세요.
            </p>
          </div>
        </div>
  ) : null

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        <CreditCard className="h-4 w-4" />
        {label}
      </button>

      {mounted && dialog ? createPortal(dialog, document.body) : null}
    </>
  )
}
