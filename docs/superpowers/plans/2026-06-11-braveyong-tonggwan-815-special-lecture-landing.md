# 8.15 통관대응 라이브 특강 랜딩 구현 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 braveyong v2 앱에 `/815` 전용 라우트를 추가해, 6/21(일) 통관대응 라이브 특강을 결제선생으로 판매하고 결제 완료자에게만 카톡 오픈채팅 링크를 노출한다.

**Architecture:** 기존 `braveyong_landing_ai-selling-v2-portfolio` Next.js 15 앱에 라우트만 증설. PayMint 라이브러리·디자인 토큰·`PaymentDialog`·`Section`·`CountdownTimer`를 재활용하고, 상품 종속부는 `lib/products.ts`(productKey 단일 출처)로 파라미터화한다. 결제 완료 노출은 `/815/complete`가 `read-bill`로 결제상태를 검증한 뒤에만(= fail-closed) 링크를 보여주는 방식.

**Tech Stack:** Next.js 15 (App Router, server components), React, Tailwind v4, TypeScript, 결제선생(PayMint) REST, zod.

---

## 작업 디렉토리 (모든 명령의 CWD)

```
brands/braveyong/braveyong_landing_ai-selling-v2-portfolio/
```
아래 모든 상대경로·명령은 이 디렉토리 기준이다. (repo 루트 아님)

## 범위 경계 (이 plan이 하는 것 / 안 하는 것)

**한다**
- `/815` 단일 페이지(11블록) + `/815/complete` 결제확인 페이지.
- `lib/products.ts` 신규 + `send-bill` productKey 파라미터화 (course 결제 무손상).
- `PaymentDialog`·`CountdownTimer` optional prop 확장.
- 구조/결제 검증 스크립트 2종 + npm script.

**안 한다 (Phase 2 / 별도)**
- 콜백→카톡 오픈채팅 자동발송. bill↔구매자 영속화(KV/DB)가 필요해 이 plan에서 제외. 1차 노출은 `/815/complete`로 충분히 커버. TALK fallback(결제 URL 못 여는 환경)에서의 자동 링크 전달도 Phase 2.
- 실제 ZERNIO/게시·운영 자동화.

## 운영입력 기본값 (구현은 default로, 운영자가 추후 env로 교체)

| 항목 | 기본값 | env |
|---|---|---|
| 가격 | 209,000원(부가세 포함, 공급가 190,000 + VAT 19,000) | (고정) |
| 라이브 | 2026-06-21(일) 20:00, 90분 | (고정 텍스트) |
| 결제 마감 | 2026-06-20T23:59:59+09:00 | `NEXT_PUBLIC_TONGGWAN_PAY_DEADLINE` |
| 정원 | 50 | `NEXT_PUBLIC_TONGGWAN_CAPACITY` |
| 오픈채팅 URL | "" (미설정 시 안내문 노출) | `NEXT_PUBLIC_TONGGWAN_OPENCHAT_URL` |

---

## Task 1: 상품 카탈로그 + send-bill productKey 파라미터화

**Files:**
- Create: `lib/products.ts`
- Modify: `app/api/paymint/send-bill/route.ts`
- Create: `scripts/check-815-payment.mjs`

- [ ] **Step 1: 검증 스크립트 먼저 작성 (실패 확인용)**

Create `scripts/check-815-payment.mjs`:

```js
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()
const read = (p) => readFileSync(resolve(root, p), "utf8")
const must = (src, needle, label) => {
  if (!src.includes(needle)) throw new Error(`${label} is missing: ${needle}`)
}

const products = read("lib/products.ts")
must(products, '"tonggwan-815"', "products: 통관 특강 key")
must(products, "resolveProduct", "products: resolveProduct()")
must(products, "209_000", "products: 통관 특강 가격 209,000")
must(products, "tonggwan815", "products: 통관 운영 상수")

const sendRoute = read("app/api/paymint/send-bill/route.ts")
must(sendRoute, "resolveProduct", "send-bill: resolveProduct 사용")
must(sendRoute, "productKey", "send-bill: productKey 입력")

const dialog = read("components/payment-dialog.tsx")
must(dialog, "productKey", "payment-dialog: productKey prop")
must(dialog, "completePathPrefix", "payment-dialog: 완료 페이지 링크")

const complete = read("app/815/complete/page.tsx")
must(complete, "read-bill", "complete: read-bill 검증")
must(complete, "openchatUrl", "complete: 오픈채팅 링크 노출")
must(complete, "apprState", "complete: 결제상태 fail-closed 판정")

console.log("check-815-payment OK")
```

- [ ] **Step 2: 실패 확인**

Run: `node scripts/check-815-payment.mjs`
Expected: FAIL — `Error: ... is missing` (lib/products.ts 아직 없음)

- [ ] **Step 3: `lib/products.ts` 작성**

```ts
import { course as courseConfig } from "@/lib/config"

/** 상품 카탈로그 — productKey 단일 출처. send-bill·랜딩·완료 페이지가 공유한다. */
export type ProductKey = "course" | "tonggwan-815"

export type Product = {
  key: ProductKey
  name: string
  amount: number // 부가세 포함 결제 금액(원)
}

export const products: Record<ProductKey, Product> = {
  course: {
    key: "course",
    name: "용감한용팀장 AI셀링 실전반 오프라인 1기",
    amount: courseConfig.priceFirst, // 1,980,000 — config 단일 출처
  },
  "tonggwan-815": {
    key: "tonggwan-815",
    name: "용감한용팀장 8.15 통관대응 라이브 특강",
    amount: 209_000,
  },
}

/** 알 수 없는 key는 기존 강의로 안전 fallback (course 결제 무손상). */
export function resolveProduct(key: string | undefined | null): Product {
  if (key && key in products) return products[key as ProductKey]
  return products.course
}

/** 8.15 통관 특강 운영 상수 — 운영입력(추후 env로 교체). */
export const tonggwan815 = {
  productKey: "tonggwan-815" as const,
  price: products["tonggwan-815"].amount, // 209,000
  supplyPrice: 190_000,
  vat: 19_000,
  liveLabel: "2026년 6월 21일 (일) 저녁 8시",
  liveDurationLabel: "약 90분 + Q&A",
  payDeadlineISO: process.env.NEXT_PUBLIC_TONGGWAN_PAY_DEADLINE || "2026-06-20T23:59:59+09:00",
  deadlineLabel: "결제 마감까지",
  capacity: Number(process.env.NEXT_PUBLIC_TONGGWAN_CAPACITY || 50),
  /** 결제 완료자에게만 노출. 미설정이면 complete 페이지가 "안내 준비 중" 표기. */
  openchatUrl: process.env.NEXT_PUBLIC_TONGGWAN_OPENCHAT_URL || "",
} as const
```

- [ ] **Step 4: `send-bill/route.ts` 수정 — productKey 해석 (course 동작 보존)**

`lib/config`의 `course` import를 `resolveProduct`로 교체하고 schema에 `productKey`를 추가한다. 수정 후 파일 전체:

```ts
import { NextResponse } from "next/server"
import { z } from "zod"
import { resolveProduct } from "@/lib/products"
import { sendBill } from "@/lib/paymint/client"
import { sanitizePhone } from "@/lib/paymint/hash"

export const runtime = "nodejs"

const SendBillSchema = z.object({
  memberName: z.string().trim().min(2, "이름을 입력해주세요.").max(30, "이름은 30자 이하로 입력해주세요."),
  phoneNumber: z.string().trim().min(10, "연락처를 입력해주세요.").max(20, "연락처가 너무 깁니다."),
  productKey: z.string().trim().optional(), // 미지정 시 기존 강의(course)로 fallback
})

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

export async function POST(request: Request) {
  try {
    const body = SendBillSchema.parse(await request.json())
    const phoneNumber = sanitizePhone(body.phoneNumber)

    if (!/^01[0-9]{8,9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: "휴대폰 번호를 01012345678 형식으로 입력해주세요." },
        { status: 400 },
      )
    }

    const product = resolveProduct(body.productKey)
    const result = await sendBill({
      memberName: body.memberName,
      phoneNumber,
      amount: product.amount,
      productName: product.name,
      message: `${product.name} 결제 청구서입니다. 신청서·결제정보는 동일한 이름·연락처로 작성해 주세요.`,
      sendType: "URL",
    })
    const data = result.data || {}
    const billId = readString(data.billId) || readString(result.billId) || readString(result.bill_id)
    const shortUrl = readString(data.shortUrl) || readString(result.shortUrl) || readString(result.shortURL)
    const deliveryType = readString(data.deliveryType) || readString(result.deliveryType) || (shortUrl ? "URL" : "TALK")
    const fallbackReason = readString(data.fallbackReason) || readString(result.fallbackReason)
    const message = result.message || result.msg

    return NextResponse.json({
      success: result.code === "0000",
      data: {
        billId,
        shortUrl,
        code: result.code,
        message,
        deliveryType,
        fallbackReason,
        dryRun: Boolean(result.dryRun),
        amount: product.amount,
        productKey: product.key,
      },
      error: result.code === "0000" ? undefined : message,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || "입력값을 확인해주세요." }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "청구서 발송 중 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}
```

> 이후 Task 3·4에서 `payment-dialog.tsx`·`app/815/complete/page.tsx`를 만들면 `check-815-payment.mjs`의 나머지 단언도 통과한다. 지금은 products/send-bill 단언까지만 통과시킨다.

- [ ] **Step 5: 타입 확인**

Run: `npx tsc --noEmit`
Expected: PASS (에러 없음)

- [ ] **Step 6: 기존 강의 결제 회귀 확인 (수동 grep)**

Run: `node scripts/check-paymint-url-flow.mjs`
Expected: PASS — 기존 PayMint URL 흐름 단언 그대로 통과.

- [ ] **Step 7: Commit**

```bash
git add lib/products.ts app/api/paymint/send-bill/route.ts scripts/check-815-payment.mjs
git commit -m "feat(815): 상품 카탈로그 + send-bill productKey 파라미터화"
```

---

## Task 2: CountdownTimer에 deadline/label prop 추가

**Files:**
- Modify: `components/countdown-timer.tsx`

- [ ] **Step 1: optional prop 추가 (기존 호출 무손상)**

`deadline`·`label`을 optional로 추가하고, 미지정 시 기존 `config.cohort1Deadline`/"1기 마감까지"를 쓴다. 수정 후 함수 시그니처 + 본문 변경부:

```tsx
export function CountdownTimer({
  className = "",
  compact = false,
  deadline,
  label = "1기 마감까지",
}: {
  className?: string
  /** 모바일/sticky용 단일 줄 압축 표기 */
  compact?: boolean
  /** ISO datetime(KST). 미지정 시 config.cohort1Deadline */
  deadline?: string
  /** 비-compact 라벨 텍스트 */
  label?: string
}) {
  const deadlineMs = new Date(deadline ?? config.cohort1Deadline).getTime()
```

그리고 비-compact 렌더의 하드코딩 라벨을 `{label}`로 교체:

```tsx
      <span className="text-xs uppercase tracking-[0.18em] opacity-60">{label}</span>
```

(나머지 코드는 그대로)

- [ ] **Step 2: 타입 + 기존 사용처 확인**

Run: `npx tsc --noEmit`
Expected: PASS. `payment-dialog.tsx`·`sticky-cta.tsx`의 기존 `<CountdownTimer ... />` 호출은 prop 미지정으로 동일 동작.

- [ ] **Step 3: Commit**

```bash
git add components/countdown-timer.tsx
git commit -m "feat(815): CountdownTimer deadline/label prop 추가"
```

---

## Task 3: PaymentDialog 파라미터화 (productKey·deadline·완료 링크)

**Files:**
- Modify: `components/payment-dialog.tsx`

기존 코드를 최소 변경한다: ① props 5종 추가, ② submit body에 productKey 포함, ③ CountdownTimer에 deadline/label 전달, ④ 안내문구 override, ⑤ 결제 후 `completePathPrefix`가 있으면 `?bill_id=` 링크 버튼 노출.

- [ ] **Step 1: props 타입 확장**

`PaymentDialogProps` 교체:

```tsx
import type { ReactNode } from "react"

type PaymentDialogProps = {
  label?: string
  amount: number
  className?: string
  dark?: boolean
  /** send-bill로 보낼 상품 key. 미지정 시 서버가 기존 강의(course)로 처리 */
  productKey?: string
  /** 카운트다운 마감 ISO. 미지정 시 1기 마감 */
  deadline?: string
  deadlineLabel?: string
  /** 안내 문단 override (기본은 강의용 문구) */
  noticeCopy?: ReactNode
  /** 설정 시 결제 후 `${completePathPrefix}?bill_id=...` 입장확인 링크 노출 */
  completePathPrefix?: string
}
```

함수 시그니처도 분해:

```tsx
export function PaymentDialog({
  label = "지금 바로 결제하기",
  amount,
  className,
  dark = false,
  productKey,
  deadline,
  deadlineLabel,
  noticeCopy,
  completePathPrefix,
}: PaymentDialogProps) {
```

- [ ] **Step 2: submit body에 productKey 추가**

`submit()` 내 fetch body 교체:

```tsx
        body: JSON.stringify({ memberName, phoneNumber, productKey }),
```

- [ ] **Step 3: 안내문구 + 카운트다운 prop 적용**

안내 문단(기존 `이름과 휴대폰 번호를 입력하면 ...` `<p>`)을 noticeCopy 우선으로 교체:

```tsx
            <p className="mt-3 text-sm leading-relaxed text-foreground/70">
              {noticeCopy ?? (
                <>
                  이름과 휴대폰 번호를 입력하면, <span className="font-bold text-foreground">결제 페이지가 바로 열립니다.</span>{" "}
                  바로 열 수 없는 결제선생 환경에서는 카톡 청구서로 자동 전환됩니다.{" "}
                  결제 후 용팀장이 <span className="font-bold text-brand">카톡으로 1주차 일정·장소</span>를 직접 챙겨 드려요.
                </>
              )}
            </p>
```

CountdownTimer 호출 교체:

```tsx
                <CountdownTimer className="text-brand" deadline={deadline} label={deadlineLabel} />
```

- [ ] **Step 4: 결제 후 입장확인 링크 버튼**

`result` 블록 안, `result.billId && !result.dryRun` 카톡 재발송 블록 **위**에 다음을 추가(완료 페이지 prefix가 있을 때만):

```tsx
                  {completePathPrefix && result.billId && (
                    <div className="mt-3 border-t border-foreground/15 pt-3">
                      <p className="text-foreground/70">
                        <span className="font-bold text-foreground">결제를 마쳤다면</span> 아래에서 카톡 오픈채팅방 입장 링크를 확인하세요.
                      </p>
                      <a
                        href={`${completePathPrefix}?bill_id=${encodeURIComponent(result.billId)}`}
                        data-track="payment_complete_link"
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-4 py-2.5 font-bold text-brand-foreground transition-colors hover:opacity-90"
                      >
                        결제 완료 후 입장 링크 받기
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
```

(`ExternalLink`는 이미 import되어 있음)

- [ ] **Step 5: 타입 + 기존 강의 결제 회귀**

Run: `npx tsc --noEmit && node scripts/check-paymint-url-flow.mjs`
Expected: PASS. 기존 `<PaymentDialog amount={...} />` 호출은 신규 prop 미지정으로 동일 동작.

- [ ] **Step 6: Commit**

```bash
git add components/payment-dialog.tsx
git commit -m "feat(815): PaymentDialog productKey·완료링크 파라미터화"
```

---

## Task 4: `/815/complete` 결제확인 페이지 (fail-closed 링크 노출)

**Files:**
- Create: `app/815/complete/page.tsx`

`bill_id`를 받아 `/api/paymint/read-bill`로 결제상태를 확인하고, **결제완료(또는 dryRun 테스트)일 때만** 오픈채팅 링크를 노출한다. 미결제/불확실은 링크를 숨기고 새로고침 안내(fail-closed).

- [ ] **Step 1: 페이지 작성**

```tsx
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
```

> ⚠️ **결제완료 상태코드**: `state === "C"`는 가정값이다. 실제 결제선생 read-bill 응답의 결제완료 코드를 Step 3에서 확인하고, 다르면 `isPaid` 한 줄만 교체한다. 잘못된 코드여도 링크는 **노출 안 됨(fail-closed)** 이라 유출 위험은 없다.

- [ ] **Step 2: 타입 + dryRun 로컬 검증**

Run: `npx tsc --noEmit`
Expected: PASS.

로컬(`PAYMINT_DRY_RUN` 기본 true)에서 `npm run dev` 후 `http://localhost:3200/815/complete?bill_id=TESTBILL` 접속 → read-bill이 dryRun(`apprState:"W"` + `dryRun:true`) 반환 → `isPaid=true(dryRun)` → "결제가 확인됐습니다" 노출(테스트 모드). `?bill_id` 없이 접속 → "결제 정보가 없어요".

- [ ] **Step 3: 실제 결제완료 코드 확인 (운영 검증 항목)**

운영 키로 실제 1건 결제 후 read-bill 응답의 상태 필드를 로그로 확인하고, `state === "C"` 가정이 맞는지 검증한다. 다르면 `isPaid` 라인만 교체. (배포 전 체크리스트 항목)

- [ ] **Step 4: Commit**

```bash
git add app/815/complete/page.tsx
git commit -m "feat(815): 결제확인 완료 페이지(read-bill fail-closed 링크 노출)"
```

---

## Task 5: 섹션 컴포넌트 A — hero / why-now / cost / solution-teaser

**Files:**
- Create: `components/tonggwan/hero-815.tsx`
- Create: `components/tonggwan/why-now-815.tsx`
- Create: `components/tonggwan/cost-815.tsx`
- Create: `components/tonggwan/solution-teaser-815.tsx`

공통: `PaymentDialog`는 아래 props로 재사용한다(여러 섹션에서 동일).

```tsx
<PaymentDialog
  label="6/21 라이브 자리 잡기"
  amount={tonggwan815.price}
  productKey={tonggwan815.productKey}
  deadline={tonggwan815.payDeadlineISO}
  deadlineLabel={tonggwan815.deadlineLabel}
  completePathPrefix="/815/complete"
  noticeCopy={
    <>
      이름과 휴대폰 번호를 입력하면 <span className="font-bold text-foreground">결제 페이지가 바로 열립니다.</span>{" "}
      결제 후 화면의 <span className="font-bold text-brand">‘입장 링크 받기’</span>로 카톡 오픈채팅방에 입장하세요. 6/21까지 방에서 챙겨드립니다.
    </>
  }
/>
```

- [ ] **Step 1: `hero-815.tsx`**

```tsx
import { PaymentDialog } from "@/components/payment-dialog"
import { CountdownTimer } from "@/components/countdown-timer"
import { Marker } from "@/components/handwriting"
import { tonggwan815 } from "@/lib/products"

export function Hero815() {
  return (
    <header className="relative overflow-hidden bg-background px-4 pt-20 pb-16 text-foreground sm:px-6 sm:pt-28 sm:pb-20">
      <div className="mx-auto max-w-3xl text-center" data-reveal>
        <div className="font-mono mb-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
          <span className="rounded-full border border-foreground/20 px-3 py-1">6/21(일) 온라인 라이브</span>
          <span className="rounded-full border border-foreground/20 px-3 py-1">선착순 {tonggwan815.capacity}명</span>
          <span className="rounded-full bg-brand px-3 py-1 text-brand-foreground">8.15 데드라인</span>
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          8월 15일, 부호 없으면<br />
          당신 구매대행은 <Marker>통관에서 멈춥니다.</Marker>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg">
          통장 한 개도 더 안 만들고, 인증서 비용 <span className="font-bold text-foreground">0원</span>으로
          전자상거래업자 부호를 끝내는 법. <br className="hidden sm:block" />
          6월 21일(일) 단 한 번의 라이브 특강.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <PaymentDialog
            label="6/21 라이브 자리 잡기"
            amount={tonggwan815.price}
            productKey={tonggwan815.productKey}
            deadline={tonggwan815.payDeadlineISO}
            deadlineLabel={tonggwan815.deadlineLabel}
            completePathPrefix="/815/complete"
          />
          <CountdownTimer deadline={tonggwan815.payDeadlineISO} label={tonggwan815.deadlineLabel} />
          <p className="font-mono text-[11px] text-foreground/45">
            {tonggwan815.price.toLocaleString()}원 (부가세 포함) · 결제선생 안전결제
          </p>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: `why-now-815.tsx` (병목 체인, dark)**

```tsx
import { Section } from "@/components/section"

const CHAIN = [
  "8.15 전자상거래 전용 통관플랫폼 개통",
  "전자상거래업자 ‘부호’가 수입신고서·통관목록 필수기재 — 없으면 통관 불가",
  "부호 발급 = UNI-PASS 사업자 회원가입 (사업자용 인증서 필요)",
  "무료 인증서 = 기업인터넷뱅킹 가입이 전제",
  "기업뱅킹 가입 = 출금(연결)계좌 필요 → 새 사업자통장은 20영업일 룰에 막힘",
]

export function WhyNow815() {
  return (
    <Section
      id="why-now"
      tone="dark"
      label="WHY NOW"
      title={<>왜 지금 이게 문제냐면</>}
      lead="하나가 막히면 그 아래가 전부 막히는 구조입니다. 병목은 ‘인증서’예요."
    >
      <ol className="mx-auto max-w-2xl space-y-3">
        {CHAIN.map((step, i) => (
          <li key={i} className="flex gap-4 border border-background/15 bg-background/[0.04] p-4">
            <span className="font-mono shrink-0 text-sm font-bold text-background/50">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-sm leading-relaxed sm:text-base">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mx-auto mt-6 max-w-2xl border-l-2 border-brand bg-background/[0.06] px-4 py-3 text-sm leading-relaxed">
        “예전에 등록했으니 괜찮다” ❌ — 기존 구매대행업자도 <span className="font-bold">신규 시스템에서 재등록 대상</span>입니다.
      </p>
    </Section>
  )
}
```

- [ ] **Step 3: `cost-815.tsx` (인증서 비용표)**

```tsx
import { Section } from "@/components/section"

const ROWS: [string, string][] = [
  ["사업자 5개", "약 100,000원 / 년"],
  ["사업자 10개", "약 200,000원 / 년"],
  ["사업자 20개", "약 400,000원 / 년"],
  ["사업자 30개", "약 600,000원 / 년"],
]

export function Cost815() {
  return (
    <Section
      id="cost"
      label="COST"
      title={<>막히면, 그날부터 매출이 멈춥니다</>}
      lead="통관이 막히는 손실은 말할 것도 없고 — 유료 범용 인증서로 가면 매년 이 돈이 나갑니다."
    >
      <div className="mx-auto max-w-xl overflow-hidden border-2 border-foreground">
        {ROWS.map(([k, v], i) => (
          <div
            key={k}
            className={`flex items-center justify-between px-5 py-4 text-sm sm:text-base ${i % 2 ? "bg-foreground/[0.03]" : ""}`}
          >
            <span className="font-bold">{k}</span>
            <span className="font-mono tabular-nums text-foreground/80">{v}</span>
          </div>
        ))}
        <div className="flex items-center justify-between bg-brand px-5 py-4 text-brand-foreground">
          <span className="font-bold">오늘 배우는 방법이면</span>
          <span className="font-mono text-lg font-bold tabular-nums">0원</span>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-xl text-center text-xs text-foreground/55">
        범용 인증서 약 2만원/년/사업자 기준. 사업자가 많을수록 격차가 커집니다.
      </p>
    </Section>
  )
}
```

- [ ] **Step 4: `solution-teaser-815.tsx` (반전 티저, warm)**

```tsx
import { Section } from "@/components/section"
import { Marker } from "@/components/handwriting"

export function SolutionTeaser815() {
  return (
    <Section id="solution" tone="warm" label="THE KEY" title={<>그런데, 통장 0개로 끝낼 수 있습니다</>}>
      <div className="mx-auto max-w-2xl space-y-5 text-base leading-relaxed sm:text-lg">
        <p>
          기업뱅킹이 요구하는 건 ‘새로 만든 사업자 통장’이 아니라 <Marker>‘연결할 계좌’</Marker>입니다.
          개인사업자는 대표 개인과 사업체가 같은 인격이라, <span className="font-bold">이미 쓰는 개인계좌를 연결</span>해
          기업인터넷뱅킹에 신규 가입하고 무료 인증서를 받을 수 있어요.
        </p>
        <p>
          사업자가 수십 개여도 전부 <span className="font-bold">내 기존 개인계좌 하나에 연결</span> → 추가 통장 0개 →
          20영업일 룰에 애초에 안 걸립니다.
        </p>
        <p className="border-l-2 border-[var(--warm-border)] pl-4 text-base text-foreground/80">
          단, <span className="font-bold">은행·지점·비대면 정책마다 되고 안 되고가 갈립니다.</span>
          되는 경로와, 막혔을 때 빠지는 길까지 정확히 알아야 끝나요. 그 실행 디테일을 6/21에 같이 합니다.
        </p>
        <p className="font-mono text-xs text-foreground/55">
          정확성 3원칙: ① “무조건 된다”는 없다 ② 막혀도 빠질 길이 있다 ③ 지금은 공동·금융인증서(공인인증서는 폐지)
        </p>
      </div>
    </Section>
  )
}
```

- [ ] **Step 5: 타입 확인**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/tonggwan/hero-815.tsx components/tonggwan/why-now-815.tsx components/tonggwan/cost-815.tsx components/tonggwan/solution-teaser-815.tsx
git commit -m "feat(815): 섹션 A(hero/why-now/cost/solution-teaser)"
```

---

## Task 6: 섹션 컴포넌트 B — curriculum / why-yong / scarcity

**Files:**
- Create: `components/tonggwan/curriculum-815.tsx`
- Create: `components/tonggwan/why-yong-815.tsx`
- Create: `components/tonggwan/scarcity-815.tsx`

- [ ] **Step 1: `curriculum-815.tsx`**

```tsx
import { Section } from "@/components/section"

const OUTCOMES: [string, string][] = [
  ["내가 등록 대상인지 3초 판별", "구매대행·배대지·판매중개·재등록 — 어디에 걸리는지 바로 확인"],
  ["통장 0개로 기업뱅킹 가입 → 무료 인증서 발급", "은행 고객센터·지점에 그대로 읽는 문의 멘트까지"],
  ["막혔을 때 빠지는 3가지 우회로", "금융인증서 / 세관 직접 제출 / 유료 최후수단 — 어떤 은행에서 막혀도 등록 완료"],
  ["UNI-PASS 부호 등록 5단계", "회원가입 → 신청서 작성 → 서류 첨부 → 처리현황 확인 → 부호 발급"],
  ["사업자 수십 개, 하루에 끝내는 대량 처리", "한 은행 통일 · 서류 일괄 세팅 · 비대면 우선 처리 전략"],
  ["사업자별 처리현황 체크리스트", "누락 0으로 8.15 전 전 사업자 부호 발급 확인"],
]

export function Curriculum815() {
  return (
    <Section
      id="curriculum"
      label="WHAT YOU GET"
      title={<>6/21 이후, 당신이 할 수 있게 되는 것</>}
      lead="원본 스텝바이스텝을 라이브로, 막히는 지점마다 바로 풀면서 진행합니다."
    >
      <div className="grid gap-px overflow-hidden border-2 border-foreground sm:grid-cols-2">
        {OUTCOMES.map(([t, d], i) => (
          <div key={i} className="bg-background p-5">
            <div className="font-mono text-sm font-bold text-brand">{String(i + 1).padStart(2, "0")}</div>
            <h3 className="mt-2 text-base font-bold leading-snug">{t}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: `why-yong-815.tsx`**

```tsx
import { Section } from "@/components/section"
import { Signature } from "@/components/handwriting"

export function WhyYong815() {
  return (
    <Section id="why-yong" label="WHO" title={<>왜 용팀장인가</>}>
      <div className="mx-auto max-w-2xl space-y-4 text-base leading-relaxed text-foreground/80 sm:text-lg">
        <p>
          구매대행·글로벌 위탁판매 현직 셀러이자, 수많은 셀러의 실전 세팅을 직접 잡아온 사람.
          제도 바뀔 때마다 “그래서 오늘 뭘 하면 되는지”를 단계로 정리해 왔습니다.
        </p>
        <p>
          이번 통관 변화도 똑같습니다. 막연한 공지 말고, <span className="font-bold text-foreground">은행 문의 멘트부터 우회로까지</span>
          실행 단위로 떠먹여 드립니다.
        </p>
        <Signature className="pt-2">용감한 용팀장</Signature>
      </div>
    </Section>
  )
}
```

- [ ] **Step 3: `scarcity-815.tsx` (dark, 정원 + 마감 + 8.15 역산)**

```tsx
import { Section } from "@/components/section"
import { CountdownTimer } from "@/components/countdown-timer"
import { tonggwan815 } from "@/lib/products"

const TIMELINE: [string, string][] = [
  ["오늘", "서류 폴더 세팅 + 거래은행 ‘개인계좌 연결’ 가능 여부 확인"],
  ["1~3일", "기업뱅킹 가입 → 무료 사업자 인증서 발급 (사업자 단위 반복)"],
  ["3~5일", "UNI-PASS 사업자 회원가입 + 부호 등록 신청"],
  ["8.15 전", "전 사업자 부호 발급 확인 → 통관플랫폼 대비 완료"],
]

export function Scarcity815() {
  return (
    <Section
      id="scarcity"
      tone="dark"
      label="DEADLINE"
      title={<>자리도, 시간도 정해져 있습니다</>}
      lead={`라이브 Q&A 품질을 위해 선착순 ${tonggwan815.capacity}명으로 닫습니다. 그리고 8.15는 협상이 안 됩니다.`}
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col items-center gap-2 border border-background/15 bg-background/[0.05] p-5 text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/55">결제 마감</span>
          <CountdownTimer className="text-background" deadline={tonggwan815.payDeadlineISO} label="결제 마감까지" />
        </div>
        <ol className="space-y-2">
          {TIMELINE.map(([when, what]) => (
            <li key={when} className="flex flex-col gap-1 border-l-2 border-brand pl-4 sm:flex-row sm:gap-4">
              <span className="font-mono w-20 shrink-0 text-sm font-bold text-brand">{when}</span>
              <span className="text-sm leading-relaxed text-background/85">{what}</span>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
```

- [ ] **Step 4: 타입 확인 + Commit**

Run: `npx tsc --noEmit`
Expected: PASS.

```bash
git add components/tonggwan/curriculum-815.tsx components/tonggwan/why-yong-815.tsx components/tonggwan/scarcity-815.tsx
git commit -m "feat(815): 섹션 B(curriculum/why-yong/scarcity)"
```

---

## Task 7: 섹션 컴포넌트 C — price / flow / faq / final-cta

**Files:**
- Create: `components/tonggwan/price-815.tsx`
- Create: `components/tonggwan/flow-815.tsx`
- Create: `components/tonggwan/faq-815.tsx`
- Create: `components/tonggwan/final-cta-815.tsx`

- [ ] **Step 1: `price-815.tsx`**

```tsx
import { Section } from "@/components/section"
import { PaymentDialog } from "@/components/payment-dialog"
import { tonggwan815 } from "@/lib/products"

export function Price815() {
  return (
    <Section id="price" tone="warm" label="PRICE" title={<>특강 한 번이, 인증서 비용보다 쌉니다</>}>
      <div className="mx-auto max-w-md border-2 border-foreground bg-background p-6 text-center">
        <p className="text-sm text-foreground/60">8.15 통관대응 라이브 특강 · 6/21(일)</p>
        <div className="mt-3 flex items-end justify-center gap-1">
          <span className="text-4xl font-bold tracking-tight">{tonggwan815.price.toLocaleString()}</span>
          <span className="mb-1 text-lg font-bold">원</span>
        </div>
        <p className="mt-1 font-mono text-xs text-foreground/50">
          공급가 {tonggwan815.supplyPrice.toLocaleString()}원 + 부가세 {tonggwan815.vat.toLocaleString()}원
        </p>
        <p className="mt-4 border-y border-foreground/10 py-3 text-sm leading-relaxed text-foreground/75">
          사업자 20개면 유료 인증서만 <span className="font-bold text-foreground">매년 40만원</span>.
          이 특강 한 번이 그보다 쌉니다.
        </p>
        <div className="mt-5">
          <PaymentDialog
            label="6/21 라이브 자리 잡기"
            amount={tonggwan815.price}
            productKey={tonggwan815.productKey}
            deadline={tonggwan815.payDeadlineISO}
            deadlineLabel={tonggwan815.deadlineLabel}
            completePathPrefix="/815/complete"
          />
        </div>
        <p className="mt-3 text-xs text-foreground/50">환불 정책은 결제 전 카톡으로 안내드립니다.</p>
      </div>
    </Section>
  )
}
```

> 환불 문구는 운영입력. 정책 확정 시 이 한 줄 교체.

- [ ] **Step 2: `flow-815.tsx`**

```tsx
import { Section } from "@/components/section"

const STEPS: [string, string][] = [
  ["신청폼 작성", "이름·휴대폰 번호 입력"],
  ["결제선생으로 결제", "카톡/카드로 안전결제"],
  ["오픈채팅방 입장", "결제 후 화면의 ‘입장 링크 받기’로 카톡방 입장"],
  ["6/21 라이브", "방에서 일정 안내 → 당일 라이브 참여"],
]

export function Flow815() {
  return (
    <Section
      id="flow"
      label="HOW IT WORKS"
      title={<>결제하면 끝이 아닙니다</>}
      lead="결제 후 바로 카톡 오픈채팅방으로 들어와, 6/21까지 방에서 챙겨드립니다."
    >
      <div className="grid gap-4 sm:grid-cols-4">
        {STEPS.map(([t, d], i) => (
          <div key={i} className="relative border-2 border-foreground p-4">
            <span className="font-mono text-2xl font-bold text-brand">{i + 1}</span>
            <h3 className="mt-1 text-sm font-bold">{t}</h3>
            <p className="mt-1 text-xs leading-relaxed text-foreground/70">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
```

- [ ] **Step 3: `faq-815.tsx` (server-render `<details>`)**

```tsx
import { Section } from "@/components/section"

const FAQ: [string, string][] = [
  ["법인사업자도 개인계좌로 되나요?", "법인은 인격이 분리돼 다릅니다. 이 동선은 개인사업자 기준이며, 법인은 별도 확인이 필요합니다."],
  ["은행에서 거절당하면요?", "은행·지점마다 정책이 달라 생길 수 있는 일입니다. 다른 은행/비대면을 시도하고, 그래도 막히면 금융인증서·세관 직접 제출로 우회합니다. 특강에서 다 다룹니다."],
  ["인증서 없이 등록도 되나요?", "인증서 구비가 어려우면 통관지 세관에 서류를 직접 제출하는 오프라인 경로가 있습니다."],
  ["기존에 등록했는데 또 해야 하나요?", "네. 기존 구매대행업자도 신규 시스템에서 재등록 대상입니다."],
  ["통장을 진짜 하나도 안 만들어도 되나요?", "개인계좌 연결을 허용하는 은행이라면 추가 통장 없이 진행 가능합니다. (은행별 확인 필수)"],
  ["당일 라이브에 못 들어가면요?", "결제 후 카톡 오픈채팅방에서 일정과 참여 방법을 안내드립니다."],
]

export function Faq815() {
  return (
    <Section id="faq" label="FAQ" title={<>자주 묻는 질문</>}>
      <div className="mx-auto max-w-2xl divide-y divide-foreground/10 border-y border-foreground/10">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold">
              {q}
              <span className="font-mono shrink-0 text-foreground/40 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
```

- [ ] **Step 4: `final-cta-815.tsx` (dark, CTA + 면책)**

```tsx
import { Section } from "@/components/section"
import { PaymentDialog } from "@/components/payment-dialog"
import { tonggwan815 } from "@/lib/products"

export function FinalCta815() {
  return (
    <Section id="final" tone="dark" title={<>8.15는 기다려주지 않습니다</>}>
      <div className="mx-auto max-w-xl text-center">
        <p className="text-base leading-relaxed text-background/80 sm:text-lg">
          통장 0개, 인증서 0원. 단 한 번의 라이브로 끝내세요.
        </p>
        <div className="mt-7 flex justify-center">
          <PaymentDialog
            label="6/21 라이브 자리 잡기"
            amount={tonggwan815.price}
            productKey={tonggwan815.productKey}
            deadline={tonggwan815.payDeadlineISO}
            deadlineLabel={tonggwan815.deadlineLabel}
            completePathPrefix="/815/complete"
            dark
          />
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-left text-[11px] leading-relaxed text-background/45">
          ⚠️ 본 특강은 일반 정보 제공용이며 개별 사안에 대한 법률·세무·관세 자문이 아닙니다.
          제도·은행 정책·세관 절차는 변경될 수 있으므로 실행 직전 관세청·관세사·세무사·해당 은행에 최신 내용을 확인하세요.
          특정 결과나 성과를 보장하지 않습니다.
        </p>
      </div>
    </Section>
  )
}
```

- [ ] **Step 5: 타입 확인 + Commit**

Run: `npx tsc --noEmit`
Expected: PASS.

```bash
git add components/tonggwan/price-815.tsx components/tonggwan/flow-815.tsx components/tonggwan/faq-815.tsx components/tonggwan/final-cta-815.tsx
git commit -m "feat(815): 섹션 C(price/flow/faq/final-cta)"
```

---

## Task 8: 페이지 조립 + metadata + 구조 검증 스크립트

**Files:**
- Create: `app/815/page.tsx`
- Create: `scripts/check-815-structure.mjs`
- Modify: `package.json`

- [ ] **Step 1: 구조 검증 스크립트 먼저 작성**

Create `scripts/check-815-structure.mjs`:

```js
import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()
const read = (p) => readFileSync(resolve(root, p), "utf8")

const page = read("app/815/page.tsx")
const ordered = [
  "<Hero815",
  "<WhyNow815",
  "<Cost815",
  "<SolutionTeaser815",
  "<Curriculum815",
  "<WhyYong815",
  "<Scarcity815",
  "<Price815",
  "<Flow815",
  "<Faq815",
  "<FinalCta815",
]
let prev = -1
for (const c of ordered) {
  const i = page.indexOf(c)
  if (i === -1) throw new Error(`${c} 누락 (app/815/page.tsx)`)
  if (i <= prev) throw new Error(`${c} 순서 오류`)
  prev = i
}

const hero = read("components/tonggwan/hero-815.tsx")
for (const copy of ["8월 15일", "통관에서 멈춥니다", "6/21"]) {
  if (!hero.includes(copy)) throw new Error(`hero 카피 누락: ${copy}`)
}

// 오픈채팅 링크는 env(complete 페이지)에서만 — 본문 하드코딩 금지(유출 방지)
const dir = resolve(root, "components/tonggwan")
for (const f of readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue
  if (read(`components/tonggwan/${f}`).includes("open.kakao.com")) {
    throw new Error(`오픈채팅 링크 하드코딩 금지: components/tonggwan/${f}`)
  }
}
if (page.includes("open.kakao.com")) throw new Error("오픈채팅 링크 하드코딩 금지: app/815/page.tsx")

console.log("check-815-structure OK")
```

- [ ] **Step 2: 실패 확인**

Run: `node scripts/check-815-structure.mjs`
Expected: FAIL — `app/815/page.tsx` 아직 없음.

- [ ] **Step 3: `app/815/page.tsx` 작성 (라우트별 metadata 포함)**

```tsx
import type { Metadata } from "next"
import { RevealObserver } from "@/components/reveal-observer"
import { Hero815 } from "@/components/tonggwan/hero-815"
import { WhyNow815 } from "@/components/tonggwan/why-now-815"
import { Cost815 } from "@/components/tonggwan/cost-815"
import { SolutionTeaser815 } from "@/components/tonggwan/solution-teaser-815"
import { Curriculum815 } from "@/components/tonggwan/curriculum-815"
import { WhyYong815 } from "@/components/tonggwan/why-yong-815"
import { Scarcity815 } from "@/components/tonggwan/scarcity-815"
import { Price815 } from "@/components/tonggwan/price-815"
import { Flow815 } from "@/components/tonggwan/flow-815"
import { Faq815 } from "@/components/tonggwan/faq-815"
import { FinalCta815 } from "@/components/tonggwan/final-cta-815"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "8.15 통관대응 라이브 특강 — 용감한 용팀장",
  description:
    "8월 15일부터 부호 없으면 구매대행 통관이 막힙니다. 통장 0개·인증서 0원으로 전자상거래업자 부호를 끝내는 6/21(일) 라이브 특강.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "8.15 통관대응 라이브 특강 — 용감한 용팀장",
    description: "통장 0개·인증서 0원으로 전자상거래업자 부호 끝내기. 6/21(일) 단 한 번의 라이브.",
    siteName: "용감한 용팀장",
  },
  robots: { index: true, follow: true },
}

/**
 * 용감한 용팀장 — 8.15 통관대응 라이브 특강 랜딩
 * spec: docs/superpowers/specs/2026-06-11-braveyong-tonggwan-815-special-lecture-landing-design.md
 */
export default function Page() {
  return (
    <>
      <main className="min-h-screen bg-background text-foreground">
        <Hero815 />          {/* 01 */}
        <WhyNow815 />        {/* 02 병목 체인 */}
        <Cost815 />          {/* 03 손실 */}
        <SolutionTeaser815 />{/* 04 반전 티저 */}
        <Curriculum815 />    {/* 05 얻는 것 */}
        <WhyYong815 />       {/* 06 권위 */}
        <Scarcity815 />      {/* 07 희소성 */}
        <Price815 />         {/* 08 가격 */}
        <Flow815 />          {/* 09 결제→입장 흐름 */}
        <Faq815 />           {/* 10 FAQ */}
        <FinalCta815 />      {/* 11 최종 CTA + 면책 */}
        <Footer />
      </main>
      <RevealObserver />
    </>
  )
}
```

- [ ] **Step 4: `package.json`에 검증 스크립트 추가**

`scripts` 블록에 추가:

```json
    "test:815": "node scripts/check-815-structure.mjs && node scripts/check-815-payment.mjs",
```

- [ ] **Step 5: 전체 검증 통과 확인**

Run: `npm run test:815`
Expected: PASS — `check-815-structure OK` + `check-815-payment OK`.

- [ ] **Step 6: 타입 + 빌드**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS — `/815`, `/815/complete` 라우트가 빌드 산출물에 포함.

- [ ] **Step 7: Commit**

```bash
git add app/815/page.tsx scripts/check-815-structure.mjs package.json
git commit -m "feat(815): 랜딩 페이지 조립 + 구조 검증 스크립트"
```

---

## Task 9: env 문서화 + INDEX + 카톡 안내문 + 최종 검증

**Files:**
- Modify: `.env.example`
- Modify: `kakao_notice_messages.txt`
- Modify: `brands/braveyong/INDEX.md` (repo 루트 기준 경로)

- [ ] **Step 1: `.env.example`에 통관 특강 env 추가**

파일 끝에 추가:

```bash
# 8.15 통관대응 라이브 특강 (/815)
NEXT_PUBLIC_TONGGWAN_OPENCHAT_URL=   # 결제 완료자에게만 노출되는 카톡 오픈채팅방 링크
NEXT_PUBLIC_TONGGWAN_PAY_DEADLINE=2026-06-20T23:59:59+09:00
NEXT_PUBLIC_TONGGWAN_CAPACITY=50
```

- [ ] **Step 2: `kakao_notice_messages.txt`에 통관 특강 입장 안내 추가**

파일 끝에 추가:

```
8.15 통관 특강 입장 안내용

결제 감사합니다. 8.15 통관대응 라이브 특강 입장하셨어요.

안녕하세요, 용팀장입니다.
6월 21일(일) 저녁 8시 라이브로 진행합니다.

📌 준비물(미리 해두면 당일이 빨라집니다)
1. 사업자등록증·통신판매업 신고증 등 서류를 사업자별 폴더로 정리
2. 거래은행에 ‘개인계좌 연결 기업뱅킹 가입’ 가능 여부 문의

⏰ 라이브 시작 전 이 방으로 입장 링크와 리마인드를 보냅니다.

— 용감한 용팀장
```

- [ ] **Step 3: `brands/braveyong/INDEX.md` 랜딩 표에 행 추가**

“랜딩 / 세일즈 페이지” 표에 행 추가:

```
| `/815` (in v2 앱) | **8.15 통관대응 라이브 특강** — 6/21(일), 209,000원, 결제선생 청구서 → 결제 완료 시 오픈채팅 노출. 기획서 [spec](../../docs/superpowers/specs/2026-06-11-braveyong-tonggwan-815-special-lecture-landing-design.md) | `app/815/`, `components/tonggwan/`, `lib/products.ts` |
```

- [ ] **Step 4: 전체 회귀 + 빌드 최종 확인**

Run (CWD = 번들 디렉토리):

```
npm run test:815 && node scripts/check-landing-structure.mjs && node scripts/check-paymint-url-flow.mjs && npx tsc --noEmit && npm run build
```

Expected: 전부 PASS — 신규 815 검증 + 기존 강의 구조/결제 검증 동시 통과.

- [ ] **Step 5: 수동 시각 확인 (dryRun)**

```
npm run dev
```
브라우저: `http://localhost:3200/815` (11블록 렌더) → 결제 다이얼로그에서 이름/번호 입력(dryRun이라 실제 청구 없음) → 결과의 “입장 링크 받기” → `/815/complete?bill_id=...` → dryRun이라 “결제가 확인됐습니다” + (env 설정 시) 오픈채팅 버튼 노출 확인.

- [ ] **Step 6: Commit**

```bash
git add .env.example kakao_notice_messages.txt
git commit -m "docs(815): env 예시 + 카톡 입장 안내문"
```

INDEX.md는 repo 루트에서 별도 커밋:

```bash
cd ../../..   # repo 루트로
git add brands/braveyong/INDEX.md
git commit -m "docs(braveyong): INDEX에 8.15 통관 특강 랜딩 추가"
```

---

## 배포 전 운영 체크리스트 (코드 외)

- [ ] 운영 env 설정: `NEXT_PUBLIC_TONGGWAN_OPENCHAT_URL`(전용 방), `PAYMINT_DRY_RUN=false` + PayMint 운영 키.
- [ ] 실제 결제 1건으로 read-bill 결제완료 상태코드 확인 → `app/815/complete/page.tsx`의 `isPaid` 가정(`state === "C"`) 검증/교체.
- [ ] 라이브 시간·정원·결제 마감·환불 정책 최종 확정값 반영.
- [ ] `/815` OG 이미지 필요 시 별도 추가(현재 텍스트 기반 OG).

## Phase 2 (이 plan 범위 밖, 후속)

- 콜백 승인 시 오픈채팅 링크 **카톡 자동발송** — bill↔구매자(productKey·phone) 영속화(Vercel KV 등) 후 `callback/route.ts`에서 조회·발송. TALK fallback(결제 URL 못 여는 환경) 구매자까지 자동 커버.

---

## Self-Review (작성자 점검 완료)

- **Spec 커버리지**: §2 빌드 A안→Task 1·8 / §3 11블록→Task 5·6·7·8 / §4 결제·노출 흐름→Task 1·3·4 / §5 products·send-bill·complete→Task 1·4 / §6 운영입력 env→Task 1·9 / §7 톤·면책·리스크→섹션 카피·final-cta 면책·환불 운영입력 / §8 검증→check-815-* 스크립트. 콜백 자동발송(§5 2차)은 Phase 2로 명시 분리.
- **Placeholder 스캔**: TODO/“적절히 처리” 없음. 모든 코드 단계 완전 코드. 운영입력 값은 default 상수 + env로 구체화(미정 아님).
- **타입 일관성**: `resolveProduct`/`products`/`tonggwan815`(products.ts) ↔ send-bill·섹션·complete 사용 일치. `productKey`/`deadline`/`deadlineLabel`/`noticeCopy`/`completePathPrefix`(payment-dialog props) ↔ 섹션 호출 일치. 컴포넌트명 `Hero815`…`FinalCta815` ↔ page import ↔ check-815-structure 단언 일치.
