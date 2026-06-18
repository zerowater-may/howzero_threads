---
title: HOWAAA 랜딩 페이지 빌드 Plan
status: ready-for-execution
owner: zerowater-may
date: 2026-05-05
parent_spec: ../specs/2026-05-05-howaaa-landing-redesign-spec.md
copy_deck:  ../specs/2026-05-05-howaaa-landing-copy-deck.md
wireframe:  ../specs/2026-05-05-howaaa-landing-wireframe.excalidraw
---

# HOWAAA 랜딩 페이지 빌드 Plan

> **목적**: 기획서 + 와이어 + 카피 deck을 실제 랜딩 페이지로 구현하기 위한 작업 단위 분해 plan.
> **이 문서는 plan이다 — 본 문서 승인 전까지 코드 변경 금지.**

---

## 1. Goal & Definition of Done

### 1.1 Goal

벤치마크(ai-team.kr/ax-consulting)와 동급 이상의 랜딩 페이지를 HOWAAA 정체성으로 구현하고, 기존 랜딩과 A/B 테스트 가능한 상태로 운영서버에 배포한다.

### 1.2 Definition of Done

- [ ] 9개 섹션 모두 구현 완료 (Hero / Problem / P01 / P02 / P03 / Dark1 / Dark2 / Cases / CTA+Footer)
- [ ] desktop 1440 + mobile 390 + tablet 768 3 breakpoint 검수 통과
- [ ] Lighthouse 점수: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95
- [ ] WCAG AA 명도 대비 통과 (axe-core 0 errors)
- [ ] GA4 이벤트 7개 모두 발화 검증
- [ ] 운영 도메인에 `/landing-v2` 또는 `/?v=2` route로 배포, 기존 랜딩과 동시 운영 가능
- [ ] A/B 분배 router (50:50) 작동
- [ ] 기획서 §10 측정 이벤트 모두 GA4 dashboard에 표출

---

## 2. 가정 / 사전 결정

| 항목 | 결정 | 비고 |
|---|---|---|
| Tech stack | Next.js 14 (App Router), TypeScript, Tailwind | `howzero-web` 안에 끼움 |
| 컴포넌트 라이브러리 | shadcn/ui + 자체 컴포넌트 | 이미 howzero-web에 도입됨 (가정 — TASK 0에서 확인) |
| 모션 | Framer Motion + IntersectionObserver hook | reduced-motion 가드 |
| 폰트 | Pretendard (self-hosted woff2) + Figtree (Google Fonts) | next/font |
| 이미지 | next/image + WebP/AVIF | LCP < 2.5s 목표 |
| Hero 영상 | mp4 + webm (poster fallback) | autoplay muted loop, prefers-reduced-motion이면 정지 |
| 분석 | GA4 (gtag) | 별도 PostHog는 v1.1에서 검토 |
| 배포 | 운영 서버 `/opt/howzero` deploy 표준 | systemd unit `howzero-web.service` |
| Brand primary | `#6D5CE7` violet | §9 그라디언트 톤 일관 |
| 사례 4건 수치 | placeholder (강남D 90% 등) | R3 컨펌 후 v1.1 교체 |

---

## 3. 디렉토리 구조 (제안)

```
howzero-web/src/
├── app/
│   └── (landing-v2)/
│       └── page.tsx                  ← 신규 랜딩 entry
├── components/
│   └── landing-v2/
│       ├── Section.tsx               ← 공통 섹션 래퍼 (light/dark prop)
│       ├── Container.tsx             ← max-width 1200 컨테이너
│       ├── PointPill.tsx             ← "POINT 01" 라벨
│       ├── EyebrowPill.tsx           ← Hero 상단 라벨
│       ├── PrimaryCTA.tsx            ← 14일 무료 체험 버튼
│       ├── GhostCTA.tsx              ← 도입 상담 버튼
│       ├── HeroVideo.tsx             ← 영상 + 오버레이
│       ├── DataCard.tsx              ← §3 6 카드용
│       ├── StepDiagram.tsx           ← §4 5단계 원
│       ├── TwoPhotoGrid.tsx          ← §5 사진 두 컷
│       ├── DarkInsightCard.tsx       ← §6 다크카드 + 라인아트
│       ├── PersonaCard.tsx           ← §7 AI 팀 6명
│       ├── CaseCarousel.tsx          ← §8 캐러셀
│       ├── GradientCTACard.tsx       ← §9 그라디언트 카드
│       ├── Footer.tsx                ← 4컬럼 footer
│       └── sections/
│           ├── HeroSection.tsx       ← §1
│           ├── ProblemSection.tsx    ← §2
│           ├── Point01Section.tsx    ← §3
│           ├── Point02Section.tsx    ← §4
│           ├── Point03Section.tsx    ← §5
│           ├── ImpactSection.tsx     ← §6
│           ├── AITeamSection.tsx     ← §7
│           ├── CasesSection.tsx      ← §8
│           └── CTAFooterSection.tsx  ← §9
├── lib/
│   ├── analytics/
│   │   └── landing-v2-events.ts      ← 이벤트 7개 type-safe wrapper
│   └── ab/
│       └── landing-router.ts         ← 50:50 분배 (cookie 기반)
└── styles/
    └── landing-v2-tokens.css         ← CSS variables
public/
├── landing-v2/
│   ├── hero.mp4                      ← Hero 영상 (TASK 5에서 추가)
│   ├── hero.webm
│   ├── hero-poster.jpg               ← reduced-motion fallback
│   ├── case-01-mock.png              ← 사례별 제품 mock
│   ├── case-02-mock.png
│   ├── case-03-mock.png
│   ├── case-04-mock.png
│   ├── point03-people-1.jpg          ← §5 사진
│   ├── point03-people-2.jpg
│   └── personas/
│       ├── 01-trend-curator.svg      ← §7 6명 일러스트 라인아트
│       ├── 02-planner.svg
│       ├── 03-copywriter.svg
│       ├── 04-fact-checker.svg
│       ├── 05-channel-manager.svg
│       └── 06-analyst.svg
contents/landing-v2/
├── cases.json                        ← 사례 4건 데이터 (수치 교체 쉽게)
└── personas.json                     ← AI 팀 6명 데이터
```

---

## 4. 디자인 토큰 (`landing-v2-tokens.css`)

```css
:root {
  /* Brand */
  --brand-primary: #6D5CE7;            /* violet */
  --brand-primary-fg: #FFFFFF;
  --brand-accent-2: #7DE6CB;           /* mint glow */
  --brand-gradient: radial-gradient(
    120% 80% at 30% 30%,
    #6D5CE7 0%,
    #1F60D9 60%,
    #0B1018 100%
  );

  /* Text */
  --text-strong: #0B1018;
  --text-default: #1B232C;
  --text-muted: #5A636A;
  --text-on-dark: #FFFFFF;
  --text-on-dark-mut: #D8DEE6;

  /* Surface */
  --surface-white: #FFFFFF;
  --surface-soft: #FAFAFA;
  --surface-pastel-1: #F2F4FB;
  --surface-pastel-2: #EAF7F1;
  --surface-pastel-3: #FBF1E8;
  --surface-pastel-4: #F4ECFB;

  /* Dark */
  --surface-dark-0: #0B1018;
  --surface-dark-1: #10171F;
  --surface-dark-2: #1A2330;
  --stroke-dark: rgba(255,255,255,0.06);

  /* Shape */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 32px;
  --radius-pill: 999px;

  /* Shadow */
  --shadow-card: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-glow: 0 0 24px var(--brand-primary);

  /* Spacing */
  --section-pad-d: 160px;
  --section-pad-t: 112px;
  --section-pad-m: 96px;
  --container-max: 1200px;
  --container-gutter: 24px;
  --grid-gap: 24px;

  /* Type scale */
  --fs-h1: 56px;
  --fs-h2: 42px;
  --fs-h3: 30px;
  --fs-body-l: 18px;
  --fs-body-m: 16px;
  --fs-body-s: 14px;
  --fs-caption: 12px;
}

@media (max-width: 768px) {
  :root {
    --fs-h1: 32px;
    --fs-h2: 28px;
    --fs-h3: 22px;
    --fs-body-l: 16px;
    --section-pad-d: 96px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. 작업 단위 (TASK 분해)

각 TASK는 1 PR 1 commit 단위. 의존성 순서로 정렬됨.

### TASK 0 — Discovery & Setup (0.5d)

- [ ] `howzero-web/` 현재 stack 확인 (Next.js 버전, Tailwind 버전, shadcn/ui 도입 여부)
- [ ] 기존 랜딩 위치 식별 (대체 vs 신규 route 결정)
- [ ] `/landing-v2` route 생성 가능 여부 확인 (basePath, middleware)
- [ ] GA4 measurement ID 확보, gtag 설치 여부 확인
- [ ] Pretendard / Figtree 폰트 라이선스 / 호스팅 방식 결정
- [ ] 결정사항 본 plan §2에 update commit

**DoD**: 본 plan §2 가정 표가 모두 ✅로 채워짐.

---

### TASK 1 — 디자인 토큰 & 기반 컴포넌트 (1d)

- [ ] `landing-v2-tokens.css` 생성 (위 §4 그대로)
- [ ] Tailwind config에 토큰 매핑 (CSS variable 참조)
- [ ] `Section.tsx` 공통 래퍼 (`tone="light" | "dark"`, `padTop/padBottom`)
- [ ] `Container.tsx` (max-width 1200, gutter 24)
- [ ] `PointPill.tsx` (props: `number: "01" | "02" | "03"`)
- [ ] `EyebrowPill.tsx` (props: `text: string`)
- [ ] `PrimaryCTA.tsx`, `GhostCTA.tsx` (props: `href`, `onClick`, `children`)
- [ ] Storybook 또는 `app/(landing-v2)/_dev/` route에서 단독 확인 가능

**DoD**: 4개 컴포넌트 + Section/Container가 storybook 또는 dev route에서 모두 렌더, lint pass.

---

### TASK 2 — Hero Section (§1) (1d)

- [ ] `HeroSection.tsx` 구조 (영상 + 오버레이 + 텍스트)
- [ ] `HeroVideo.tsx` (mp4/webm/poster, autoplay muted loop, reduced-motion 가드)
- [ ] 카피 deck §1 ★ 추천안 적용
- [ ] CTA 2개 (`14일 무료 체험 시작` primary, `도입 상담 받기` ghost)
- [ ] 헤더 sticky CTA (우상단)
- [ ] 텍스트 진입 모션 (fade-up 0.4s, stagger 80ms)
- [ ] 모바일 H1 32px, CTA stack
- [ ] 영상 자산이 없으면 dark gradient + noise placeholder로 임시 빌드 (TASK 5에서 교체)

**DoD**: desktop/mobile 둘 다 렌더 OK, axe-core 0 errors, sticky CTA 작동.

---

### TASK 3 — Problem (§2) + Point 01 (§3) (1d)

- [ ] `ProblemSection.tsx` (가로 라인 + 센터 정렬 텍스트)
- [ ] `Point01Section.tsx` 구조 (pill + h3 + sub + 6 카드 grid)
- [ ] `DataCard.tsx` (props: `title`, `subtitle`, `bgVariant: 1~4`, `categoryTag`)
- [ ] 6 카드 데이터 hardcode (카피 deck §3 카드 라벨 참조)
- [ ] 진입 stagger 모션 (60ms)
- [ ] 모바일: 6 카드 1×6 stack, 3번째부터 "Show more" 접기

**DoD**: 6 카드 4종 파스텔 컬러 정확, 모바일 접기 작동.

---

### TASK 4 — Point 02 (§4) + Point 03 (§5) (1d)

- [ ] `Point02Section.tsx` 구조
- [ ] `StepDiagram.tsx` 5단계 원 (props: `steps: [{label, who, what}]`)
  - 짝수 인덱스만 다크 채움
  - connector line draw 모션 (1.2s)
  - 모바일은 세로 stack + 점선 connector
- [ ] `Point03Section.tsx` 구조
- [ ] `TwoPhotoGrid.tsx` (props: `images: [src, alt][]`, `caption?: string`)
- [ ] §5 한 줄 metric 옵션 (`"월 80개 카드 · 인수인계 0회"`)
- [ ] 사진 placeholder (TASK 5에서 교체)

**DoD**: §4 다이어그램 진입 모션 작동, §5 모바일 사진 stack 정상.

---

### TASK 5 — 자산 제작 / 수급 (병렬, 2d)

병렬 작업이라 다른 TASK와 동시 진행 가능. 자산이 없을 땐 placeholder로 빌드 진행.

- [ ] Hero 영상 1편 (15초 loop, 1920×1080 mp4 + webm + poster)
  - 옵션 1: 실제 촬영 (사람이 노트북 앞에서 작업, HOWAAA 카드 보임)
  - 옵션 2: 모션 그래픽 (After Effects, dark BG + 카드 슬라이드 인)
- [ ] §3 6 카드 일러스트 또는 미니 mock UI 6장 (각 ~400×280)
- [ ] §5 사람 사진 2장 (각 800×600)
- [ ] §6 다크카드 라인아트 그래프 3종 (SVG, glow accent)
- [ ] §7 AI 팀 6명 페르소나 일러스트 (SVG, 라인아트, brand accent 1색)
- [ ] §8 사례 4건 mock UI (각 800×500, HOWAAA 카드 보드 화면)
- [ ] favicon, og:image (1200×630)

**DoD**: 모든 자산이 `public/landing-v2/` 정확한 경로에 위치, 파일명 컨벤션 준수.

---

### TASK 6 — Dark Sections (§6 §7) (1d)

- [ ] `ImpactSection.tsx` 구조 (좌 텍스트 / 우 카드 3장)
- [ ] `DarkInsightCard.tsx` (props: `title`, `svgGraphic`)
- [ ] glow 진입 모션 (opacity 0→1, 800ms)
- [ ] `AITeamSection.tsx` 구조 (h3 + sub + 6 페르소나 grid)
- [ ] `PersonaCard.tsx` (props: `number`, `name`, `role`, `iconSvg`)
- [ ] hover 모션 (translateY -2px, border accent)
- [ ] 모바일: 3 카드 / 6 카드 모두 세로 stack

**DoD**: 다크 본문 텍스트 명도 대비 4.5:1 검증, hover 부드러움.

---

### TASK 7 — Cases Carousel (§8) (1d)

- [ ] `CasesSection.tsx` 구조
- [ ] `CaseCarousel.tsx` (props: `cases: Case[]`, `autoAdvanceMs?: 7000`)
- [ ] 카드 구조: 좌 텍스트 / 우 mock UI (16:9)
- [ ] ←/→ 버튼 + 점 인디케이터
- [ ] 자동 7초 전환, 사용자 인터랙션 시 정지
- [ ] 키보드 네비게이션 (ARIA `roledescription="carousel"`)
- [ ] `cases.json`에서 데이터 로드 (수치 교체 쉽게)
- [ ] 모바일: 좌/우 → 위/아래 stack, 가로 스와이프

**DoD**: 키보드/터치/마우스 모두 캐러셀 navigation 작동, ARIA 검증.

---

### TASK 8 — CTA + Footer (§9) (0.5d)

- [ ] `GradientCTACard.tsx` (radial gradient + noise + h3 + 두 CTA)
- [ ] 마우스 위치 따라 radial center 미세 이동 (5%, prefers-reduced-motion 가드)
- [ ] `Footer.tsx` 4컬럼 + 저작권 한 줄 + SNS 4 아이콘
- [ ] 모바일 sticky CTA (하단 floating bar, mobile-only)
- [ ] 모든 CTA 링크 — `/signup?from=landing-v2-{position}`, `/contact?from=landing-v2-{position}`

**DoD**: sticky CTA 모바일에서만 노출, 키보드 접근성 검증.

---

### TASK 9 — Analytics 통합 (0.5d)

- [ ] `landing-v2-events.ts` type-safe wrapper
- [ ] 7개 이벤트 모두 hook
  - `hero_cta_primary_click`, `hero_cta_ghost_click`
  - `section_view` (IntersectionObserver, 50% threshold)
  - `point_card_hover` (1초 dwell)
  - `case_carousel_advance` (manual / auto 구분)
  - `cta_card_click`
  - `mobile_sticky_cta_click`
- [ ] GA4 DebugView에서 모든 이벤트 발화 확인
- [ ] 이벤트 명세를 `docs/marketing/landing-v2-analytics.md`에 export

**DoD**: GA4 DebugView에서 7개 이벤트 모두 확인, parameter 정확.

---

### TASK 10 — A/B Router (0.5d)

- [ ] `landing-router.ts` cookie 기반 50:50 분배
  - 첫 방문 시 `landing_variant: "v1" | "v2"` 쿠키 set
  - 30일 만료
- [ ] middleware에서 `/?v=2` 또는 cookie variant 따라 route
- [ ] 기존 랜딩 (`v1`)은 그대로, 신규는 `v2`
- [ ] GA4에 `landing_variant` user property 전송

**DoD**: 시크릿 창 10번 진입 시 5:5 근사, GA4에 `landing_variant` 표출.

---

### TASK 11 — QA & Lighthouse (1d)

- [ ] axe-core 0 errors (desktop + mobile)
- [ ] Lighthouse Mobile: Perf ≥ 85, A11y ≥ 95, SEO ≥ 95, BP ≥ 95
- [ ] Chrome / Safari / Firefox cross-browser
- [ ] 1440 / 1024 / 768 / 414 / 390 / 360 6 width 확인
- [ ] 영상 + 모션 prefers-reduced-motion 가드 작동 확인
- [ ] 키보드 navigation 모든 인터랙션 도달 가능
- [ ] 텍스트 명도 대비 axe-core + 수동 spot check
- [ ] OG image, twitter:card meta 검증

**DoD**: Lighthouse 4 지표 모두 통과, axe-core 0 errors.

---

### TASK 12 — Staging & Prod 배포 (0.5d)

- [ ] `howzero-web/` 빌드 통과 (`npm run build`)
- [ ] 운영서버 `/opt/howzero` deploy 표준 절차
- [ ] systemd `howzero-web.service` reload
- [ ] 운영 도메인에서 `/?v=2` 진입 확인
- [ ] GA4 production stream에 이벤트 도달 확인
- [ ] 기존 `/`(v1) 정상 동작 회귀 확인
- [ ] rollback plan 문서화

**DoD**: 운영 도메인에서 v1/v2 모두 동작, GA4 production 이벤트 도달.

---

### TASK 13 — A/B 측정 시작 + 1주 운영 (1주, 비차단)

- [ ] Day 0: A/B 시작, GA4 dashboard 설정
- [ ] Day 3: 중간 점검, 명백한 회귀 없는지
- [ ] Day 7: 1주 결과 분석 (전환율, 이탈률, 체류시간 비교)
- [ ] 결과를 `docs/marketing/landing-v2-week1-result.md`에 기록
- [ ] 다음 단계 결정 (확장 / 추가 A/B / 롤백)

**DoD**: 1주 KPI 4개 (Hero scroll, sticky CTA click, form submit, dwell time) 비교 표 확보.

---

## 6. 작업 일정 (Critical Path)

```
Day 0       TASK 0 (Discovery)             ┐
Day 1       TASK 1 (Tokens & Base)         │
Day 2       TASK 2 (Hero)                  │ TASK 5 (자산) ← 병렬
Day 3       TASK 3 (Problem + P01)         │
Day 4       TASK 4 (P02 + P03)             │ TASK 5 finish
Day 5       TASK 6 (Dark §6 §7)            │
Day 6       TASK 7 (Cases)                 │
Day 6.5     TASK 8 (CTA + Footer)          │
Day 7       TASK 9 (Analytics)             │
Day 7.5     TASK 10 (A/B Router)           │
Day 8       TASK 11 (QA)                   │
Day 8.5     TASK 12 (Deploy)               ┘
Day 9~15    TASK 13 (1주 측정)
```

총 9 work-day + 1주 측정. 자산 (TASK 5)이 늦어지면 TASK 2/4/6/7가 placeholder 상태에서 대기.

---

## 7. PR 네이밍 컨벤션

```
TASK 0  → chore(landing-v2): discovery & stack lock
TASK 1  → feat(landing-v2): design tokens & base components
TASK 2  → feat(landing-v2): hero section
TASK 3  → feat(landing-v2): problem & point01
TASK 4  → feat(landing-v2): point02 & point03
TASK 5  → chore(landing-v2): assets (video / illustrations / mocks)
TASK 6  → feat(landing-v2): dark sections (impact + ai team)
TASK 7  → feat(landing-v2): cases carousel
TASK 8  → feat(landing-v2): cta card & footer
TASK 9  → feat(landing-v2): analytics events
TASK 10 → feat(landing-v2): a/b router
TASK 11 → chore(landing-v2): qa & lighthouse fixes
TASK 12 → chore(landing-v2): deploy to production
```

각 PR에 `landing-v2` 라벨 부여, 본 plan 링크 첨부.

---

## 8. 데이터 / 콘텐츠 source

### 8.1 `cases.json` 스키마

```typescript
type Case = {
  id: string;             // "case-01-gangnam-d"
  tag: string;            // "CASE 01"
  company: string;        // "강남 D사"
  industry: string;       // "DTC 코스메틱"
  metric: string;         // "콘텐츠 운영 시간 90% 절감"
  before: string;         // "10시간/주"
  after: string;          // "1시간/주"
  body: string;           // "AI 팀 6명이 카드 단위로 자동 분담"
  mockImage: string;      // "/landing-v2/case-01-mock.png"
  detailUrl?: string;     // "/cases/gangnam-d"
};
```

### 8.2 `personas.json` 스키마

```typescript
type Persona = {
  id: string;             // "persona-01-trend-curator"
  number: string;         // "01"
  name: string;           // "트렌드 큐레이터"
  role: string;           // "매일 트렌드 카드 생성"
  icon: string;           // "/landing-v2/personas/01-trend-curator.svg"
  accent: string;         // "#7CC4FF" 카드별 hover 컬러
};
```

---

## 9. 측정 / Analytics 정의 (TASK 9에서 구현)

### 9.1 이벤트 7개

| 이벤트 | trigger | 파라미터 |
|---|---|---|
| `hero_cta_primary_click` | Hero "14일 무료 체험" 클릭 | `section: "hero"`, `variant: "v2"` |
| `hero_cta_ghost_click` | Hero "도입 상담" 클릭 | `section: "hero"`, `variant: "v2"` |
| `section_view` | 섹션 50% 진입 | `section_id`, `scroll_depth` |
| `point_card_hover` | §3 카드 hover ≥1s | `card_id` |
| `case_carousel_advance` | 캐러셀 슬라이드 변경 | `from_index`, `to_index`, `mode: "auto" \| "manual"` |
| `cta_card_click` | §9 CTA 클릭 | `variant: "primary" \| "ghost"` |
| `mobile_sticky_cta_click` | 모바일 sticky bar 클릭 | — |

### 9.2 user property

| property | 값 | 용도 |
|---|---|---|
| `landing_variant` | `"v1"` \| `"v2"` | A/B 분리 |

### 9.3 funnel (GA4 dashboard)

```
session_start
  → landing_view (variant="v2")
    → section_view (section_id="hero")
      → section_view (section_id="cta_card")
        → cta_card_click
          → /signup or /contact 진입
```

---

## 10. 리스크 / 미해결 (R)

| # | 이슈 | 대응 / Owner |
|---|---|---|
| R1 | Hero 영상 자산 제작 시간 (촬영 또는 모션 그래픽) | TASK 5 병렬, placeholder로 다른 TASK 비차단 |
| R2 | 사례 4건 수치가 placeholder | TASK 13 시작 전까지 R3 컨펌 → `cases.json` 교체 |
| R3 | AI 팀 6명 일러스트 6장 | 외주 vs 자체 SVG 라인아트 결정 (TASK 5에서) |
| R4 | shadcn/ui 미도입 시 기간 ↑ | TASK 0에서 결정, 미도입이면 자체 컴포넌트로 |
| R5 | 운영 도메인 A/B 분배가 SEO에 영향 | `<link rel="canonical">` 동일 URL 유지 |
| R6 | Pretendard 폰트 라이선스 | self-host 시 라이선스 확인 (BSD-Like, ok 가정) |
| R7 | 모바일 sticky CTA가 키보드 접근 침해 | TASK 8에서 ARIA + safe-area-inset 처리 |
| R8 | GA4 ad-blocker 손실 | 로드 실패 fallback (콘솔 warn), 측정값은 ±10% 허용 |
| R9 | A/B 결과가 inconclusive (1주) | TASK 13 결과 따라 2주 연장 결정 |

---

## 11. 다음 단계 (이 plan 승인 후)

1. **TASK 0** 즉시 시작 — howzero-web 현재 상태 점검 (0.5d)
2. R3 (사례 4건 수치) 컨펌 요청 → `cases.json` 채움 준비
3. TASK 5 자산 제작 발주 (병렬)
4. TASK 1부터 순차 진행

본 plan은 1차 완료. 작업 중 발견한 모든 결정사항은 본 문서 §2 가정 표 또는 §10 리스크 표에 update commit.

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 |
|---|---|---|---|
| v1.0 | 2026-05-05 | Claude (zerowater-may 요청) | Brand violet `#6D5CE7` lock, 13개 TASK 분해 |
