# BraveYong AI 셀링 오프라인 랜딩 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** `docs/superpowers/specs/2026-05-22-braveyong-ai-selling-offline-landing-design.md`의 6주 오프라인 AI 셀링 실전반 상세페이지를 Next.js 마케팅 라우트에 구현한다.

**Architecture:** 새 라우트 `/(marketing)/braveyong-ai-selling`에 서버 컴포넌트 페이지를 self-contained로 추가한다. 랜딩의 모든 텍스트/섹션 데이터는 같은 파일 상단의 typed arrays로 두고, 반복 UI는 작은 로컬 함수 컴포넌트로 분리한다. 신청 CTA는 `NEXT_PUBLIC_BRAVEYONG_AI_SELLING_FORM_URL` 환경변수가 있으면 구글폼으로, 없으면 페이지 내 `#apply` 안내 섹션으로 이동한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, lucide-react.

**Completion Status (2026-05-22):** 구현 완료. `/braveyong-ai-selling` 라우트, 마케팅 내비게이션 연결, 신청 CTA fallback, 반응형 visual scene, 전체 섹션, 전체 lint/build 검증, 로컬 HTTP/스크린샷 검증까지 완료했다. `npm run lint`는 에러 0개로 통과하며 기존 경고 11개는 남아 있다.

---

## Files

- Create: `howzero-web/src/app/(marketing)/braveyong-ai-selling/page.tsx`
  - BraveYong AI 셀링 랜딩 전체 페이지.
  - Metadata, CTA URL fallback, 섹션 데이터, 로컬 UI 컴포넌트를 포함한다.
- Modify: `howzero-web/src/app/(marketing)/layout.tsx`
  - 상단 마케팅 내비게이션에 `AI 셀링 실전반` 링크를 추가한다.
- Modify: `.gitignore`
  - visual brainstorming 산출물인 `.superpowers/`를 추적하지 않도록 ignore에 추가한다.

## Requirements Checklist

- [x] Hero에 직장인/육아아빠/현업셀러 진정성 카피가 보인다.
- [x] Hero는 얼굴 중심이 아니라 상품명/SEO/AI/상세페이지 작업 화면 중심의 visual scene이다.
- [x] 메인 CTA는 `6주 오프라인 실전반 지원하기`다.
- [x] CTA는 env 구글폼 URL 또는 `#apply` fallback으로 동작한다.
- [x] 대량등록 한계 섹션이 세 가지 문제를 다룬다: 노출 없음, 안 남는 매출, 정책/등록 한도 불안.
- [x] AI 셀링 정의가 `AI가 대신 팔아준다`가 아니라 반복 가능한 운영 구조로 설명된다.
- [x] 효자상품 10개 약속과 효자상품 정의가 명확하다.
- [x] 기존 상품 개선과 새 상품 소싱 모두 허용한다는 문구가 있다.
- [x] 오프라인 6회 + 줌 보강 5회 커리큘럼이 6주차까지 산출물과 함께 보인다.
- [x] 운영 정보가 보인다: 2026년 6월 10일 유튜브 무료강의, 2026년 6월 13일 시작, 서울 강남, 시간 추후 안내, 10~15명.
- [x] 왜 용팀장인가 섹션이 과장된 수익 보장 없이 현업셀러 신뢰를 만든다.
- [x] 졸업 후 오프라인 스터디 섹션이 가격 섹션 바로 앞 흐름에 있다.
- [x] 가격 섹션이 공개된다: 1기 180만원, 2기 이후 250만원.
- [x] 결제 방식이 공개된다: 카드/계좌이체 가능, 분할은 별도 안내.
- [x] 신청서 검토 후 맞는 사람에게만 결제 안내한다는 선별 흐름이 보인다.
- [x] FAQ에 효자상품이 매출 보장이 아니라 구조 완성이라는 답변이 있다.
- [x] 최종 CTA가 `1기 실행자 특별가로 지원하기`다.
- [x] 모바일/데스크톱에서 텍스트가 넘치지 않는다.
- [x] `npm run lint`가 통과한다.
- [x] `npm run build`가 통과한다.
- [x] 로컬 서버에서 `/braveyong-ai-selling`이 200으로 응답한다.

## Task 1: Create the Landing Route

**Files:**
- Create: `howzero-web/src/app/(marketing)/braveyong-ai-selling/page.tsx`

- [x] **Step 1: Create route directory**

Run:

```bash
mkdir -p 'howzero-web/src/app/(marketing)/braveyong-ai-selling'
```

Expected: directory exists.

- [x] **Step 2: Add page scaffold with metadata and CTA helper**

Create `page.tsx` with:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  MapPin,
  MessageSquareText,
  PackageCheck,
  PenTool,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Video,
} from "lucide-react";

export const metadata: Metadata = {
  title: "용팀장 AI 셀링 오프라인 실전반 — 효자상품 10개 만들기",
  description:
    "상품만 계속 올리던 초보 셀러를 위한 6주 오프라인 AI 셀링 실전반. 1기 실행자 특별가 180만원, 서울 강남, 오프라인 6회와 줌 보강 5회.",
};

const applicationUrl =
  process.env.NEXT_PUBLIC_BRAVEYONG_AI_SELLING_FORM_URL || "#apply";
```

Expected: TypeScript imports compile once page body is added.

## Task 2: Add Page Data and Local UI Components

**Files:**
- Modify: `howzero-web/src/app/(marketing)/braveyong-ai-selling/page.tsx`

- [x] **Step 1: Add arrays for stats, problems, standards, curriculum, operations, study, pricing, FAQ**

Use literal data matching the spec:

```tsx
const heroStats = [
  { value: "6주", label: "오프라인 실전반" },
  { value: "10개", label: "효자상품 완성" },
  { value: "10~15명", label: "소수정예" },
  { value: "180만원", label: "1기 실행자 특별가" },
];
```

Also define:

- `problems`: 노출 없음, 안 남는 매출, 정책/등록 한도 불안
- `productStandards`: 노출 구조, 전환 구조, 운영 구조, AI 반복 구조
- `curriculum`: 1~6주차 제목, 설명, 산출물, 효자상품 누적 목표
- `operations`: 무료강의, 본강의 시작, 장소, 구성
- `faqs`: 필수 FAQ 12개

Expected: all spec requirements have a corresponding data entry.

- [x] **Step 2: Add reusable local components**

Add simple local functions:

```tsx
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b51f1f]">
      {children}
    </p>
  );
}

function CtaButton({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={applicationUrl}
      className={
        variant === "primary"
          ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#15120f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2a2119] md:px-6"
          : "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#15120f]/20 bg-white px-5 py-3 text-sm font-bold text-[#15120f] transition hover:border-[#15120f] md:px-6"
      }
    >
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}
```

Expected: button text does not overflow on mobile because `min-h`, wrapped text, and responsive padding are used.

## Task 3: Implement All Spec Sections

**Files:**
- Modify: `howzero-web/src/app/(marketing)/braveyong-ai-selling/page.tsx`

- [x] **Step 1: Implement Hero**

Hero must include:

- `저도 직장 다니고, 애 재우고 나서 상품 올렸습니다.`
- `초보 셀러에게 필요한 건 더 많은 상품이 아니라...`
- CTA `6주 오프라인 실전반 지원하기`
- visual workbench scene with panels: 상품명/SEO 점검, AI 상품 분석, 상세페이지 기획, 등록/개선 체크
- small instructor proof badge, not a large portrait

Expected: first viewport communicates human trust + system promise.

- [x] **Step 2: Implement stats strip**

Render `6주`, `10개`, `10~15명`, `180만원`.

Expected: desktop 4 columns, mobile 2 columns.

- [x] **Step 3: Implement problem section**

Render 대량등록 한계 and three problem cards.

Expected: section contains “더 많은 상품이 아니라, 팔리는 구조입니다.”

- [x] **Step 4: Implement AI selling definition**

Render definition:

```txt
AI가 대신 팔아주는 게 아닙니다.
AI로 상품 선정, SEO, 상품명, 상세페이지, 등록 전 체크를 빠르게 반복하는 구조입니다.
```

Expected: clear contrast between old 대량등록 and new AI 셀링.

- [x] **Step 5: Implement 효자상품 10개 section**

Render promise, definition, standards, existing/new product scope.

Expected: includes 매출 보장 가드 in visible copy or FAQ link.

- [x] **Step 6: Implement curriculum**

Render six week cards with outputs and product count progression.

Expected: all six weeks from spec appear.

- [x] **Step 7: Implement operations timeline**

Render:

- 2026년 6월 10일 수요일 유튜브 무료 전환강의
- 2026년 6월 13일 토요일 본강의 시작
- 서울 강남
- 시간 추후 안내
- 오프라인 6회 + 줌 보강 5회

Expected: 날짜가 concrete and visible.

- [x] **Step 8: Implement why instructor section**

Render 진정성 copy without unverified income claims.

Expected: no visible promise of guaranteed sales.

- [x] **Step 9: Implement graduate study section before price**

Render:

- 매월 1회 오프라인 정기 모임
- 용팀장 특강 1타임
- 실습 + Q&A
- 정책/시장 변화 업데이트
- 3개월 15만원
- 1기 우선 참여권

Expected: section appears before pricing markup.

- [x] **Step 10: Implement pricing and application**

Render:

- 1기 실행자 특별가 180만원
- 2기 이후 정가 250만원
- 카드/계좌이체 가능
- 신청서 검토 후 결제 안내
- `#apply` section with Google Form env note if env is missing

Expected: page can support real Google Form by setting `NEXT_PUBLIC_BRAVEYONG_AI_SELLING_FORM_URL`.

- [x] **Step 11: Implement FAQ and final CTA**

Render all 12 FAQ items and final CTA `1기 실행자 특별가로 지원하기`.

Expected: FAQ includes “효자상품 10개는 매출을 보장한다는 뜻인가요?” and safe answer.

## Task 4: Add Navigation and Ignore Generated Mockups

**Files:**
- Modify: `howzero-web/src/app/(marketing)/layout.tsx`
- Modify: `.gitignore`

- [x] **Step 1: Add marketing nav link**

Modify `navLinks`:

```tsx
const navLinks = [
  { href: "/braveyong-ai-selling", label: "AI 셀링 실전반" },
  { href: "/ai-employees", label: "AI 직원" },
  { href: "/services", label: "서비스" },
  { href: "/pricing", label: "가격표" },
  { href: "/ai-score", label: "AI 준비도 진단" },
  { href: "/about", label: "하우제로 스토리" },
];
```

Expected: header exposes the page without changing dashboard routes.

- [x] **Step 2: Ignore `.superpowers/`**

Add to root `.gitignore`:

```gitignore
# Superpowers visual brainstorming artifacts
.superpowers/
```

Expected: `git status --short .superpowers` shows no untracked files.

## Task 5: Verify Static Checks

**Files:**
- Verify: `howzero-web/src/app/(marketing)/braveyong-ai-selling/page.tsx`
- Verify: `howzero-web/src/app/(marketing)/layout.tsx`

- [x] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Working directory: `howzero-web`

Expected: command exits 0.

- [x] **Step 2: Run production build**

Run:

```bash
npm run build
```

Working directory: `howzero-web`

Expected: command exits 0 and includes the `/braveyong-ai-selling` route.

## Task 6: Verify in Browser

**Files:**
- Verify route: `http://localhost:3100/braveyong-ai-selling`

- [x] **Step 1: Start dev server**

Run:

```bash
npm run dev
```

Working directory: `howzero-web`

Expected: server listens on `http://localhost:3100`. If port 3100 is in use, run `npx next dev --port 3102`.

- [x] **Step 2: Check HTTP response**

Run:

```bash
curl -I http://localhost:3100/braveyong-ai-selling
```

Expected: `HTTP/1.1 200 OK`.

- [x] **Step 3: Capture visual screenshot**

Use available browser tooling or a local browser to inspect:

- desktop viewport around 1440px wide
- mobile viewport around 390px wide

Expected:

- hero is not blank
- CTA buttons are visible
- text does not overlap
- price and dates are readable
- mobile layout stacks cleanly

## Task 7: Final Coverage Check

**Files:**
- Verify against: `docs/superpowers/specs/2026-05-22-braveyong-ai-selling-offline-landing-design.md`

- [x] **Step 1: Search for core visible strings**

Run:

```bash
rg -n "효자상품 10개|1기 실행자 특별가|180만원|250만원|2026년 6월 10일|2026년 6월 13일|서울 강남|졸업 후|오프라인 스터디|카드 결제|계좌이체|신청서 검토" 'howzero-web/src/app/(marketing)/braveyong-ai-selling/page.tsx'
```

Expected: all strings are found.

- [x] **Step 2: Check final git status for intended files**

Run:

```bash
git status --short howzero-web/src/app/'(marketing)'/braveyong-ai-selling/page.tsx howzero-web/src/app/'(marketing)'/layout.tsx .gitignore docs/superpowers/plans/2026-05-22-braveyong-ai-selling-offline-landing.md
```

Expected: only intended files appear for this implementation.
