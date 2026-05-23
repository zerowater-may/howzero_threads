# BraveYong AI 셀링 실전반 — 랜딩 v2 (포트폴리오 스타일) 설계

작성일: 2026-05-23
선행 spec: [`2026-05-22-braveyong-ai-selling-offline-landing-design.md`](./2026-05-22-braveyong-ai-selling-offline-landing-design.md) (v1, 워밍 페이퍼 톤). v2는 시각 시스템·구현 스택을 새로 잡고 v1의 15블록 구조·카피·톤 가드를 모두 승계한다.

## 목적

용감한 용팀장 `6주 오프라인 AI 셀링 실전반` 1기 모집용 세일즈 랜딩의 **두 번째 버전**을 만든다. v1과 동일한 상품·카피·구조를 유지하되, 다음 세 가지를 새로 한다.

1. **시각 시스템 교체** — 워밍 페이퍼 + 신뢰 블루 → **순흑백 모노톤 + 노란 형광펜 한 톤** (포트폴리오 템플릿 스타일 차용)
2. **구현 스택 교체** — 단독 vanilla HTML → **Next.js 15 + App Router + shadcn/ui + Tailwind v4** (포트폴리오 zip 그대로 시작점)
3. **production 배포 준비** — Vercel 배포 호환, env var 분리, og:image, robots/sitemap, Vercel Analytics, 모바일 sticky CTA, 다크/라이트 토글

v1과 v2는 **동시 보존**한다. 향후 A/B 비교 가능.

## 참조 자료

- 포트폴리오 템플릿 zip: `brands/braveyong/_template/` (Next.js 15, shadcn/ui, Tailwind v4, oklch 채도 0 모노톤, 원형 grayscale 프로필, pill 버튼, 다크/라이트 토글)
- 실제 자료 폴더: `brands/braveyong/용감한용팀장/` (얼굴 사진 1장, 채널 배너 1장, **후기 캡처 54장** — 카페·DM·블로그 풍 텍스트)
- 페르소나: `brands/braveyong/braveyong_persona.md`, `wiki/BraveYong Persona.md`
- 부트캠프 합성: `wiki/BraveYong AI Selling Bootcamp.md`

## 핵심 결정 (브레인스토밍 합의)

| 영역 | 결정 | 이유 |
|---|---|---|
| 시각 톤 | 순흑백 모노톤 + 노란 형광펜 1톤 | 포트폴리오 톤. 절제·신뢰 + 손글씨 액센트 도드라짐 |
| 구조 길이 | 15섹션 그대로 유지 (스타일만 차용) | "포트폴리오 길이"로 압축하면 결제 판단 정보 부족 |
| Hero 레이아웃 | 포트폴리오 1컬럼 중앙 (시안 A) | 가장 미니멀·정직. CTA 압은 02 STRIP 띠로 보완 |
| 후기 노출 | 토글형 (시안 A) — 하이라이트 8 + 더 보기 → 캡처 46 | Hero 미니멀과 톤 일관. 가독성·압도감 균형 |
| 손글씨 폰트 | `Nanum Pen Script` + `Gowun Dodum` + `Geist` + `Pretendard` | 영문 제목·UI = Geist, 한글 본문 = Pretendard, 손글씨 액센트 = Nanum Pen Script + Gowun Dodum |
| 구현 스택 | Next.js 15 + App Router + shadcn/ui + Tailwind v4 | "코드대로" 요청 + Vercel 배포 + production 품질 |
| 산출물 위치 | `brands/braveyong/braveyong_landing_ai-selling-v2-portfolio/` | v1 보존, 별도 폴더 |
| 신청서 폼 | 구글폼 iframe 임베드 | v1과 동일, 가장 가벼움 |
| 결제 | 페이지 외부 — 용팀장 수동 안내 | v1과 동일 (현 시점). Phase 2에서 Toss Payments 연동 가능성 열어둠 |
| 배포 | Vercel | 자동 빌드·도메인·Analytics |
| 톤 가드 | v1 spec과 동일 — 매출 보장 ✕, 카운트다운 ✕, 거짓 잔여석 ✕, "AI가 대신 판다" ✕ | 페르소나 금지 표현 일치 |

## 비주얼 시스템

### 컬러 (oklch)

`app/globals.css` 토큰을 포트폴리오 그대로 + 형광펜 한 색만 추가.

```css
:root {
  --background: oklch(1 0 0);            /* 순흰 */
  --foreground: oklch(0.1 0 0);          /* 거의 검정 */
  --muted: oklch(0.96 0 0);
  --muted-foreground: oklch(0.45 0 0);
  --border: oklch(0.9 0 0);
  --primary: oklch(0.1 0 0);             /* 검정 = primary */
  --primary-foreground: oklch(1 0 0);
  --marker: oklch(0.92 0.16 92);         /* 따뜻한 노란 형광펜 (유일한 강조색) */
  --warm: oklch(0.96 0.05 80);           /* 소수정예 섹션 배경 */
  --warm-border: oklch(0.55 0.13 60);    /* 소수정예 보더/액센트 */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --border: oklch(0.269 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --marker: oklch(0.85 0.18 92);
}
```

**원칙**: 무채색 + 노란 형광펜 한 톤. 그 외 컬러 금지 (v1의 신뢰 블루도 삭제).

### 타이포

```css
--font-sans: var(--font-geist-sans);      /* 영문 UI/제목 (Geist) */
--font-mono: var(--font-geist-mono);      /* 데이터/코드 */
--font-ko: "Pretendard Variable", system-ui, sans-serif;
--font-hand: "Nanum Pen Script", "Gowun Dodum", cursive;
--font-memo: "Gowun Dodum", "Gaegu", sans-serif;
```

- **영문 라벨/배지/UPPERCASE 제목** = Geist Sans bold
- **한글 본문/제목** = Pretendard Variable
- **손글씨 강조·서명** = Nanum Pen Script
- **메모/sticky note** = Gowun Dodum
- **데이터/코드** = Geist Mono

`app/layout.tsx`에서 next/font로 Geist 로드, Google Fonts CDN으로 Nanum Pen Script + Gowun Dodum + Gaegu 로드.

### 컴포넌트 키트

shadcn/ui (이미 zip에 포함):

| 컴포넌트 | 용도 |
|---|---|
| `Button` (pill, rounded-full, variant outline/default) | 모든 CTA |
| `Card` | 신뢰 지표, 반론 차단, 졸업 스터디 |
| `Accordion` | 6주 커리큘럼, FAQ |
| `Dialog` | 후기 캡처 lightbox |
| `Badge` | 일정·인원·장소 미니배지, STRIP 띠 |
| `Avatar` | 후기 카드의 이니셜 원 |
| `Separator` | 섹션 구분 가로선 |
| `Sheet`/`Drawer` | 모바일 메뉴 (없으면 생략) |

아이콘은 `lucide-react`만 사용 (zip에 포함). 손그림 동그라미·밑줄·화살표는 inline SVG로 직접.

### 모션·인터랙션

- **다크/라이트 토글** — `next-themes` 사용. **기본값은 `system` (OS 환경설정 따름), system 미지원시 light**. localStorage에 사용자 선택 저장. 우상단 고정. `suppressHydrationWarning` 적용해 SSR 깜빡임 방지.
- **fade-in on scroll** — IntersectionObserver 또는 `framer-motion`(가벼우면). `prefers-reduced-motion` 존중.
- **pill 버튼 hover 반전** — 포트폴리오 그대로 (border-current bg-transparent → bg-current text-bg).
- **카드 hover** — translate-y-[-2px] + shadow.
- **후기 캡처 클릭 lightbox** — shadcn/ui `Dialog` 또는 vanilla `<dialog>`.

### 글로벌 배경

- 라이트: subtle SVG noise overlay (opacity 0.025, multiply blend) — 인쇄 종이 톤
- 다크: 같은 noise, opacity 0.04

## 페이지 구조 (18블록 wireframe 그대로)

| # | 섹션 | 톤 | 손글씨 | 자료 슬롯 |
|---|---|---|---|---|
| 00 | NAV — 브랜드 로고/이름 · APPLY · 다크토글 | 라이트(고정) | — | — |
| 01 | **Hero** — 포트폴리오 1컬럼 중앙: ○ 얼굴 → 이름 UPPERCASE → 서브라인 → 한 단락 → APPLY · FREE LECTURE | 라이트 | ✎ 작은 한 줄 ("저도 직장 다니고…") | ● 얼굴 사진 1장 |
| 02 | **STRIP** — 가격·일정·인원·장소 한 줄 띠 | **다크** | — | — |
| 03 | 신뢰 증거 — 현업 사실 지표 4카드 + "1기 모집 중" 후기 자리 | 라이트 | — | ● 운영 입력 |
| 04 | **후기 벽** — 하이라이트 8장 텍스트 카드 + ▼ 더 보기 → 캡처 46장 그리드 + lightbox | 라이트 | — | ● 후기 캡처 54장 + 텍스트 8장 운영입력 |
| 05 | 문제 제기 — 대량등록 한계 4종 | **다크** | ✎ "팔리는 구조" 형광펜 | — |
| 06 | AI 셀링 정의 — 판매 운영 구조 + 반복 루프 | 라이트 | ✎ "빠르게 반복하는 구조" 형광펜 | — |
| 07 | 핵심 결과물 — 효자상품 10개 (정의 7요소 + 제작방식 + 가드) | 라이트 | ✎ "10" 손그림 동그라미 | — |
| 08 | 6주 커리큘럼 — Accordion (1주~6주) | 라이트 | — | — |
| 09 | 운영 방식 — 5 stat + 일정·장소 | **다크** | — | — |
| 10 | 왜 용팀장인가 — 인용 + 신뢰 ul | 라이트 | ✎ "— 용감한 용팀장 드림" 서명 | — |
| 11 | 졸업 후 오프라인 스터디 | 라이트 | — | — |
| 12 | 반론 차단 — 4종 (보장 없이 사실로만) | 라이트 | — | — |
| 13 | 비교표 — 온라인 강의 vs 오프라인 실전반 6항목 | **다크** | — | — |
| 14 | 가격 — 1기 180 / 정가 250, 카피 + 방어 + 결제 | 라이트 | ✎ "1기에만 적용" 손글씨 화살표 메모 | — |
| 15 | **소수정예 한정** — 10~15명·1기 특별가·선별 | 🟧 **워밍** (유일) | — | — |
| 16 | 신청서 & 선별 — **같은 페이지 안 구글폼 `<iframe>` 임베드** (별도 라우트 없음) + 신청서 11문항 설명(미리보기) + 강한 문구 | 라이트 | — | — |
| 17 | FAQ — Accordion 12개 | 라이트 | — | — |
| 18 | **최종 CTA** — 큰 CTA + 보조문구 | **다크** | ✎ "— 용감한 용팀장 드림" 흰 펜글씨 서명 | — |
| 19 | Footer — 디스클레이머·© | 라이트 | — | — |

**원칙**: 모노톤에서 섹션 리듬은 라이트/다크 교차 + 큰 라벨 + 가로 separator로 만든다. 워밍 톤은 15 소수정예 1곳뿐.

## 자료-슬롯 매핑

| 자료 | 위치 |
|---|---|
| 얼굴 사진 1장 (`56_.png`) | Hero 원형 grayscale (h-40~h-64) |
| 채널 배너 1장 (`55_channels4_banner.png`) | og:image (1200×630 크롭/리사이즈) |
| 후기 캡처 54장 (`01_~54_*.png`) | `04 후기 벽` 그리드 (Next/Image 최적화) |
| 하이라이트 후기 8장 텍스트 | 운영 입력 — placeholder 카드로 두고 운영자가 캡처 보고 텍스트 + 출처(`네이버 카페`/`DM`/`블로그`/`카톡`) + 이니셜 입력 |
| 스터디 현장 사진 / 작업화면 스크린샷 | **없음** — placeholder 유지, 운영자 추후 추가 ("운영자가 다음 주 촬영해서 교체" 표시) |

자료 폴더는 그대로 두지 않고 `public/assets/testimonials/`로 복사·리네임 (`t-01.png ~ t-54.png`, `face.jpg`, `og.jpg`).

## 손글씨 액센트 정책

본문은 Pretendard·Geist로 깔끔 유지. 손글씨는 6곳에만:

1. **Hero 한 줄** (Gowun Dodum) — "저도 직장 다니고, 애 재우고 나서…"
2. **05 문제** — "팔리는 구조" 형광펜 marker
3. **06 정의** — "빠르게 반복하는 구조" 형광펜 marker
4. **07 결과** — "10" 손그림 SVG 동그라미
5. **10 강사** — 인용 끝 펜글씨 서명 "— 용감한 용팀장 드림"
6. **14 가격** — 1기 특별가 카드 안 손그림 화살표 메모 "1기에만 적용되는 가격이에요"
7. **18 최종 CTA** — 흰 펜글씨 서명

이 외에는 손글씨 금지. "여기저기 손글씨면 가벼워진다" 가드.

## production 준비 (Vercel 배포)

### 환경변수 (`.env.example`)

```bash
# 신청서 구글폼 URL
NEXT_PUBLIC_GOOGLE_FORM_URL=https://forms.gle/XXXX

# 6/10 유튜브 무료강의 URL
NEXT_PUBLIC_YOUTUBE_FREE_URL=https://youtube.com/XXXX

# 운영자 이메일 (mailto 링크용)
NEXT_PUBLIC_CONTACT_EMAIL=braveyong@example.com

# Vercel Analytics — 자동 (NEXT_PUBLIC_VERCEL_ANALYTICS_ID는 Vercel이 주입)

# GA4 (선택)
NEXT_PUBLIC_GA4_ID=G-XXXX
```

값이 비어 있으면 placeholder 표시 + 콘솔 warn.

### SEO / 메타

- `app/layout.tsx`에 metadata API로 title·description·og:image·twitter card·robots 설정
- `public/og.jpg` — 1200×630, 채널 배너 기반
- `app/robots.txt` (또는 `app/robots.ts`)
- `app/sitemap.xml` (또는 `app/sitemap.ts`) — 단일 페이지지만 추가
- favicon, apple-touch-icon (zip 포함된 것 활용)
- `lang="ko"`, `<html>` charset, viewport

### 분석

- `@vercel/analytics/react`의 `<Analytics />` 추가
- GA4는 `NEXT_PUBLIC_GA4_ID`가 있으면 `next/script`로 로드

### 모바일

- **sticky bottom CTA bar** — 데스크톱에선 `hidden`, 모바일(`< md`)에서만 노출. 위치는 `position: fixed; bottom: 0`. Hero 안에서는 숨기고 02 STRIP 지나면 등장. 클릭 시 `#apply`로 smooth scroll. 다크/라이트 토글 색상 동기화.
- 후기 캡처 그리드는 모바일에서 2컬럼
- 비교표는 가로 스크롤(min-width)
- Touch target 44px 이상

### 접근성

- semantic HTML — `header`, `main`, `section`, `footer`, `nav`, `details`/`summary` 또는 Accordion ARIA
- 모든 이미지 alt
- 색 대비 WCAG AA (모노톤이라 통과 쉬움)
- 키보드 포커스 ring
- `prefers-reduced-motion`

### 성능

- Next/Image로 자료 최적화 (54장 후기 캡처는 lazy + blur placeholder)
- 폰트는 next/font (Geist) + display=swap (Google Fonts)
- Lighthouse 90+ 목표

## 파일 구조

```
brands/braveyong/braveyong_landing_ai-selling-v2-portfolio/
├── README.md
├── CHECKLIST.md
├── package.json
├── pnpm-lock.yaml
├── next.config.mjs
├── tsconfig.json
├── postcss.config.mjs
├── components.json
├── .env.example
├── .gitignore
├── app/
│   ├── layout.tsx              # 메타·폰트·테마 프로바이더·Analytics
│   ├── globals.css             # oklch 토큰·marker 컬러·노이즈
│   ├── page.tsx                # 페이지 진입점 — 섹션 컴포넌트 조립만
│   ├── robots.ts
│   └── sitemap.ts
│   # NOTE: app/apply/ 별도 라우트는 만들지 않는다. 16 섹션 안 iframe 임베드.
├── components/
│   ├── theme-provider.tsx      # next-themes
│   ├── theme-toggle.tsx        # 우상단 토글 버튼
│   ├── nav.tsx                 # 00
│   ├── hero.tsx                # 01
│   ├── strip.tsx               # 02
│   ├── trust-evidence.tsx      # 03
│   ├── testimonial-wall.tsx    # 04 — 하이라이트 8 + 캡처 그리드 토글 + lightbox
│   ├── problem.tsx             # 05
│   ├── ai-definition.tsx       # 06
│   ├── outcome.tsx             # 07
│   ├── curriculum.tsx          # 08 — Accordion
│   ├── operation.tsx           # 09
│   ├── why-yong.tsx            # 10
│   ├── study.tsx               # 11
│   ├── objections.tsx          # 12
│   ├── comparison.tsx          # 13
│   ├── price.tsx               # 14
│   ├── scarcity.tsx            # 15 (워밍)
│   ├── apply.tsx               # 16 — 구글폼 임베드 + 안내
│   ├── faq.tsx                 # 17 — Accordion
│   ├── final-cta.tsx           # 18
│   ├── footer.tsx              # 19
│   ├── sticky-cta.tsx          # 모바일 하단 고정
│   ├── handwriting/
│   │   ├── marker.tsx          # 노란 형광펜 span
│   │   ├── signature.tsx       # 펜글씨 서명
│   │   ├── scribble-circle.tsx # 손그림 SVG 동그라미
│   │   └── arrow-note.tsx      # 손그림 화살표 + 메모
│   └── ui/                     # shadcn (zip 그대로)
├── lib/
│   ├── utils.ts                # cn
│   ├── testimonials.ts         # 8장 하이라이트 데이터 + 54장 캡처 리스트
│   └── config.ts               # env 통합 + 기본값
└── public/
    ├── og.jpg                  # 1200×630
    ├── favicon.ico, apple-touch-icon.png, ...
    └── assets/
        ├── face.jpg            # Hero용 얼굴
        ├── og-banner.png       # 채널 배너 원본
        └── testimonials/
            ├── t-01.png ~ t-54.png
            └── manifest.json   # (선택) lightbox 메타
```

각 섹션 컴포넌트는 한 파일에 한 책임. `page.tsx`는 조립만 한다 — 본문 로직 없음.

## 운영 입력 필요 사항

배포 전 운영자가 채워야 하는 값. 비어 있으면 placeholder/`추후 안내`로 표시.

| 항목 | 위치 | 처리 |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_FORM_URL` | env | 16 신청 섹션 iframe src + CTA href |
| `NEXT_PUBLIC_YOUTUBE_FREE_URL` | env | Hero 보조 + 최종 CTA 보조 |
| `NEXT_PUBLIC_CONTACT_EMAIL` | env | footer mailto |
| `NEXT_PUBLIC_GA4_ID` | env | 선택 |
| 오프라인 수업 시간 | `lib/config.ts` | 02 STRIP, 09 운영 → 비면 "추후 안내" |
| 상세 주소 | `lib/config.ts` | 09 운영 → "참여 확정자에게 안내" |
| 환불 기준 | `lib/config.ts` | 17 FAQ Q12 |
| 용팀장 현업 사실 지표 4종 | `lib/config.ts` | 03 신뢰 증거 (수익 단정 금지) |
| 1기 종료 후 실제 후기 8장 | `lib/testimonials.ts` | 04 후기 하이라이트 |
| Hero 얼굴 사진 | `public/assets/face.jpg` | 폴더 56번 → 리네임 |
| og:image | `public/og.jpg` | 폴더 55번(채널 배너) → 1200×630 리사이즈 |
| 스터디 현장·작업화면 사진 | (없음) | placeholder 유지 |

## 톤 가드 (v1 spec 승계 — 절대 위반 금지)

- 매출·수익 단정 ✕ ("월 OOO만원", "월 OOO 신화" 등)
- "리스크 제로 / 돈 잃을 수 없다" 류 보장 ✕
- "AI가 알아서 / 자동으로" 류 딸깍 자동화 과장 ✕
- 실시간 카운트다운 타이머 ✕
- 거짓 "잔여 N석" 숫자 ✕
- "오늘 마감" 류 허위 압박 ✕
- 사람을 조롱하는 `가짜 셀러` 표현 ✕
- 검증 안 된 수익 단정 ✕

소수정예 희소성(15 섹션)은 **사실 기반만** — 10~15명 물리적 한정 + 1기 특별가 + 신청서 검토.

## 성공 기준

- [ ] Vercel `vercel deploy --prod`로 한 번에 배포 가능 (env 채운 상태)
- [ ] Lighthouse Performance 90+ / Accessibility 95+ / Best Practices 95+ / SEO 100
- [ ] 데스크톱(1280) + 모바일(390) Playwright 풀페이지 렌더 검증
- [ ] 다크/라이트 토글 동작, localStorage 저장
- [ ] 후기 캡처 lightbox 동작 (키보드 ESC 닫기 포함)
- [ ] 18블록 모두 표시 (다크/라이트/워밍 교차)
- [ ] 손글씨 액센트 6곳 정확히 위치 (Hero 한 줄·문제·정의·결과·강사·가격·최종 CTA)
- [ ] 톤 가드 위반 0건 (매출 보장·카운트다운·거짓 잔여석 등)
- [ ] 모바일 sticky CTA 동작
- [ ] og:image, robots, sitemap 응답 OK
- [ ] Vercel Analytics 수집

## Out of Scope (이번 단계 아님)

- 자체 결제 페이지 (`/api/checkout`, Toss Payments) → Phase 2
- 자체 신청서 DB + admin 페이지 → Phase 2 (현 시점은 구글폼)
- `app/apply/` 별도 라우트 — 만들지 않는다. 16 섹션 안 iframe만.
- 후기 캡처 OCR로 텍스트 자동 추출 → 수동 입력
- 다국어 → 한국어만
- CMS 연동 → 콘텐츠 코드 내 상수

## Phase 2 후보 (이 spec 다음 단계 아이디어)

후속 spec으로 다룰 것 — 이 spec에는 포함 안 함:

- Toss Payments SDK 연동 (`/api/checkout`, webhook, 영수증 메일)
- Supabase/Vercel Postgres에 신청서 저장 + 간단 admin
- 1기 종료 후 실제 후기 8장 자동 수집 시스템
- 결제 후 Welcome 시퀀스 (이메일·카톡)

## 관련 문서

- v1 spec: [`2026-05-22-braveyong-ai-selling-offline-landing-design.md`](./2026-05-22-braveyong-ai-selling-offline-landing-design.md)
- v1 구현: `brands/braveyong/braveyong_landing_ai-selling/`
- wiki: `wiki/BraveYong AI Selling Bootcamp.md`, `wiki/BraveYong Index.md`, `wiki/BraveYong Persona.md`
- 페르소나: `brands/braveyong/braveyong_persona.md`
