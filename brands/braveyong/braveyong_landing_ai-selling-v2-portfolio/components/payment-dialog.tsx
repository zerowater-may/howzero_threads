"use client"

import { FormEvent, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { createPortal } from "react-dom"
import { CreditCard, ExternalLink, Loader2, X, Landmark } from "lucide-react"
import { CountdownTimer } from "./countdown-timer"
import { tonggwan815 } from "@/lib/products"
import { config, course } from "@/lib/config"

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
  /** true 시 6개월 할부 힌트 행 숨김 (815 특강 전용 — 209,000원이라 할부 안내가 안 맞는다) */
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

  /**
   * 신청서 관문 (2026-08-13) — 실전반(course) 결제는 신청서를 먼저 받는다.
   * 815 특강은 단발 라이브라 신청서를 받지 않는다.
   */
  const requireApplication = productKey !== tonggwan815.productKey
  const [step, setStep] = useState<"application" | "payment">(requireApplication ? "application" : "payment")
  /** 구글폼을 실제로 열었는지 — 열지 않으면 "작성했다" 체크 자체를 못 하게 막는다 */
  const [formOpened, setFormOpened] = useState(false)
  const [formConfirmed, setFormConfirmed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  /** 모달을 닫으면 처음 단계로 되돌린다 — 다시 열었을 때 결제 단계부터 시작하면 관문이 뚫린다 */
  useEffect(() => {
    if (open) return
    setStep(requireApplication ? "application" : "payment")
    setFormOpened(false)
    setFormConfirmed(false)
    setError(null)
  }, [open, requireApplication])

  function goToPayment() {
    if (!formConfirmed) {
      setError("신청서를 작성하신 뒤 아래 확인란을 체크해 주세요.")
      return
    }
    setError(null)
    setStep("payment")
  }

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

  /**
   * 6개월 무이자 시 월 납입액 — 천원 단위 반올림.
   * 페이지가 큰 숫자로 월 납입액을 원 단위로 걸어두는데 모달만 만원 단위로 뭉개면
   * 결제 직전에 숫자가 달라 보인다. 같은 값을 같은 단위로 보여준다.
   */
  const monthly6 = (Math.round(amount / 6 / 1000) * 1000).toLocaleString()

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
        body: JSON.stringify({
          memberName,
          phoneNumber,
          productKey,
          applicationConfirmed: requireApplication ? formConfirmed : undefined,
        }),
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
                  {step === "application" ? "신청서 먼저 (30초)" : "바로 결제하기"}
                </h3>
                {requireApplication && (
                  <p className="font-mono mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/40">
                    {step === "application" ? "1 / 2 단계" : "2 / 2 단계 · 신청서 완료"}
                  </p>
                )}
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

            {step === "application" ? (
              <div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                  결제 전에 <span className="font-bold text-foreground">신청서를 먼저 작성해 주세요.</span>{" "}
                  용팀장이 이 답변을 보고 {course.cohort} 진행 방향을 잡습니다. 객관식이라 1분이면 끝나요.
                </p>

                <a
                  href={config.googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="application_form_open"
                  onClick={() => setFormOpened(true)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-6 py-4 text-base font-bold text-brand-foreground transition-all hover:opacity-90"
                >
                  신청서 작성하러 가기
                  <ExternalLink className="h-4 w-4" />
                </a>
                <p className="mt-2 text-center text-[11px] text-foreground/55">
                  새 탭에서 열립니다. 작성 후 이 창으로 돌아오세요.
                </p>

                {/* 링크를 열기 전에는 체크 자체를 막는다 — 신청서를 안 보고 통과하는 걸 한 번 더 거른다 */}
                <label
                  className={`mt-4 flex cursor-pointer items-start gap-3 border-2 p-3.5 transition-colors ${
                    formConfirmed ? "border-brand bg-brand/[0.06]" : "border-foreground/20"
                  } ${formOpened ? "" : "cursor-not-allowed opacity-45"}`}
                >
                  <input
                    type="checkbox"
                    checked={formConfirmed}
                    disabled={!formOpened}
                    onChange={(event) => {
                      setFormConfirmed(event.target.checked)
                      if (event.target.checked) setError(null)
                    }}
                    className="mt-0.5 h-5 w-5 flex-none accent-[var(--brand,#c0392b)]"
                  />
                  <span className="text-sm font-bold leading-snug">
                    신청서 작성을 마쳤습니다
                    <span className="mt-0.5 block text-xs font-normal leading-relaxed text-foreground/60">
                      {formOpened
                        ? "제출까지 끝내셨는지 확인해 주세요. 신청서가 없으면 자리 확정이 안 됩니다."
                        : "위 버튼으로 신청서를 먼저 열어주세요."}
                    </span>
                  </span>
                </label>

                {error && (
                  <div className="mt-4 border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  data-track="application_next"
                  onClick={goToPayment}
                  disabled={!formConfirmed}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-foreground bg-foreground px-6 py-4 text-base font-bold text-background transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  다음 — 결제하기
                </button>
                <p className="mt-2 text-center text-[11px] text-foreground/55">
                  신청서를 작성해야 결제창이 열립니다.
                </p>
              </div>
            ) : (
              <>
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
                  <span className="font-bold text-foreground">카드 6개월 무이자 · 월 {monthly6}원</span>
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
              {/* 여기에 "3개월 환불 보장" 배지가 있었다 (2026-08-06 제거).
                  같은 페이지 FAQ가 "환불 기준은 기수 시작 전까지 확정해서 따로 안내드립니다.
                  임시 기준을 예시처럼 적어두지 않으려고 일부러 비워뒀어요"라고 말하는데,
                  결제 직전 화면만 3개월 환불을 확정 약속하고 있었다. 근거 문서가 없는 약속이라 뺐다.
                  환불 기준이 실제로 확정되면 그 내용대로 다시 넣을 것 — FAQ와 반드시 같은 말을 해야 한다. */}
              <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] font-bold text-foreground/60">
                <span>결제 후 용팀장 직접 확인</span>
                <span className="text-foreground/25">·</span>
                <span>안전결제(결제선생)</span>
              </div>
            </form>

            {/* 신청서로 되돌아가기 — 청구서 발행 전에만. 발행 후엔 답변을 고쳐도 반영되지 않는다 */}
            {requireApplication && !result && (
              <button
                type="button"
                onClick={() => setStep("application")}
                className="mt-3 w-full text-center text-xs font-bold text-foreground/50 underline underline-offset-4 transition-colors hover:text-foreground"
              >
                신청서 답변 고치기
              </button>
            )}
              </>
            )}
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
