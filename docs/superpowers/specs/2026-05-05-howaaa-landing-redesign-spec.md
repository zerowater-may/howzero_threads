---
title: HOWAAA 랜딩 페이지 리디자인 기획서
status: draft
owner: zerowater-may
date: 2026-05-05
benchmark: https://ai-team.kr/ax-consulting
related:
  - docs/marketing/P2-website-cro-landing-page-optimization.md
  - .playwright-mcp/howaaa-verify/howaaa-1440-fullpage.png
  - ai-team-ax-desktop-fullpage.png
---

# HOWAAA 랜딩 페이지 리디자인 기획서

> **범위**: 본 문서는 기획서다. 코드/디자인 자산을 변경하지 않는다.
> 구현 작업은 본 문서 승인 후 별도 plan으로 분리한다.

---

## 1. 배경

### 1.1 현재 상태 (2026-05-05 기준)

HOWAAA는 "콘텐츠 한 편, AI 팀이 끝까지 운영합니다"를 hero 메시지로 하는 콘텐츠 운영체제 SaaS다. 현재 랜딩은 다음 구조다.

- Hero: 텍스트 + 카드 비주얼 (제품 스샷)
- 카드 단위 stage 흐름 설명 (트렌드 근거 수집 → 기획 각도 생성 → AI 담당자 자동 점유 → 검증 Gate → 발행/성과 기록)
- "AI 작업이 사라지지 않고 운영 카드로 바뀌도록" 라인

### 1.2 진단 (현재 랜딩의 약점)

| 항목 | 현 상태 | 문제 |
|---|---|---|
| Hero 임팩트 | 텍스트 + 라이트 톤 카드 그래픽 | "AI 회사 한 번 더" 느낌. 톤이 약함 |
| 차별화 메시지 | 5단계 stage 카드 한 번에 노출 | 1번에 다 보여줘서 무엇이 핵심인지 흐림 |
| 신뢰 근거 | 사례·수치 부족 | "정말 되는 건가?" 의심 해소가 안 됨 |
| 시각적 리듬 | 라이트-라이트-라이트 단조 | 스크롤 피로, 섹션 구분 약함 |
| CTA | 어디서 신청/체험하는지 가이드 약함 | 전환 leakage |
| 모바일 | 카드 5개 세로 줄줄이 | 스크롤 길어지고 한 번에 한 카드만 봐서 맥락 끊김 |

### 1.3 벤치마크: ai-team.kr/ax-consulting

(분석 산출물: `ai-team-ax-desktop-fullpage.png`, `ai-team-ax-01~08-*.png`, `ai-team-ax-consulting-snapshot.md`)

**잘하는 것 (적용 후보)**

1. **Hero를 시네마틱 사람 영상 + 어두운 BG**로 깔아 "추상적 AI 컨설팅"을 "사람이 일하는 현장"으로 구체화
2. **Light → Dark → Light → Dark 리듬**으로 섹션 구분과 시각적 호흡 확보
3. **Point 01/02/03 단 3개**로 차별화 메시지를 압축 (5개가 아니라)
4. **다크 카드 + 라인아트 그래프**로 데모하기 어려운 단계를 추상화
5. **사례 캐러셀(좌 텍스트 + 우 제품 스샷, 1개씩)**로 디테일 집중
6. **익명 사례 (E사 / G사) + 수치**로 신뢰 (94% 단축, 1시간→15분)
7. **마지막 그라디언트 CTA 카드**로 임팩트 마무리
8. **헤더 우상단 sticky CTA 버튼** 항상 보임

**피해야 할 것**

- Hero 영상 + 본문 텍스트 명도 대비 약함 → HOWAAA는 영상 도입 시 처음부터 contrast 가드
- 다크 본문 회색 텍스트 WCAG AA 미달 가능 → 본문은 #D8DEE6 이상
- 사례 캐러셀이 한 번에 1장 → 모바일에서 답답. HOWAAA는 1장 캐러셀 + 하단 인디케이터 4~5개로 조정
- 푸터 회사명과 브랜드 분리 (alphabrothers.co.kr) → HOWAAA 브랜드 단일화 유지

---

## 2. 목적 & 성공 기준

### 2.1 목적

콘텐츠 운영체제로서의 HOWAAA의 정체성("AI 한 명이 아니라 AI 팀이 카드 단위로 협업한다")을 시각·메시지로 명확히 전달하고, 도입 검토자의 미팅 신청 / 무료 체험 전환을 끌어올린다.

### 2.2 성공 지표 (KPI 후보)

| 지표 | 현재 (가정) | 목표 |
|---|---|---|
| Hero → 1st scroll 비율 | TBD | +20% |
| Sticky CTA 클릭률 | TBD | 2.5% 이상 |
| 미팅 신청 폼 제출 / 방문자 | TBD | 1.0% 이상 |
| 평균 체류 시간 | TBD | 1분 30초 이상 |
| 모바일 이탈률 | TBD | -15% |

(현재 수치는 GA4·Plausible 등에서 baseline 측정 후 본 문서 v1.1에서 채운다.)

### 2.3 비목적 (out of scope)

- 가격 페이지 리디자인
- 대시보드/제품 UI 변경
- 블로그/로그인 플로우
- SEO 키워드 전략 전체 (별도 문서)

---

## 3. 타깃 페르소나 & 핵심 메시지

### 3.1 페르소나

| # | 역할 | 페인 | 의사결정 단서 |
|---|---|---|---|
| P1 | **콘텐츠 운영 리드** (스타트업 마케팅팀장) | AI 도구 5~6개 쓰지만 결과물이 흩어짐. 누가 무엇을 했는지 추적 불가 | "이게 우리 워크플로우에 맞나?" |
| P2 | **1인 콘텐츠 사업가** | AI로 빠르게 만들지만 운영(트렌드 추적, 발행, 성과 분석)은 손으로 함 | "내 시간 얼마나 줄여주나?" |
| P3 | **C레벨/실무 임원** | "AI 도입했다"는 것을 보고 가능한 KPI로 만들어야 함 | "정량 성과 사례 있나?" |

### 3.2 핵심 메시지 (Value Proposition)

> **"AI 한 명이 아닌 AI 팀이, 콘텐츠 한 편을 끝까지 운영합니다."**

서브 메시지:

1. 트렌드를 실시간으로 끌어와 콘텐츠 카드 한 장으로 만들고
2. 기획·집필·검증·발행·성과 회수를 AI 담당자들에게 자동 분배하며
3. 매번 사람이 다시 챙겨야 하는 운영 노동을 0에 수렴시킵니다

### 3.3 카피 톤 (HowZero 가이드 + ai-team 벤치마크 합)

- 직설적, 데이터 기반, 과장 배제 (HowZero 페르소나 가이드)
- "X가 아니라 Y입니다" 대비 구문 사용 (ai-team 패턴)
- 수치는 1자리 강조 ("90% 절감", "1시간→8분")
- 익명 사례 표기: "강남 D사", "교육 스타트업 K사"

---

## 4. 정보 구조 (IA)

총 9개 섹션. ai-team.kr 8섹션 + HOWAAA 고유 "AI 팀 구성도" 1섹션.

```
[1] Hero (Dark, 시네마틱 영상 + 한 줄 메시지)
        ↓
[2] Problem statement (Light, 한 줄 헤드라인 + 2줄 본문)
        ↓
[3] Point 01 — 트렌드부터 자동 (Light, 데이터 카드 6개)
        ↓
[4] Point 02 — AI 팀 협업 (Light, 5단계 흐름 다이어그램)
        ↓
[5] Point 03 — 운영 카드가 자산이 됩니다 (Light, 사람 사진 + 메시지)
        ↓
[6] Dark — "콘텐츠 운영체제는 어떻게 다른가" (Dark, 좌 텍스트 + 우 카드 3장)
        ↓
[7] Dark — "AI 팀 구성도" (Dark, AI 담당자 6~8 페르소나 카드)
        ↓
[8] 사례 캐러셀 (Light, 좌 텍스트 + 우 제품 스샷, ←→)
        ↓
[9] 그라디언트 CTA + Footer
```

### 4.1 섹션 간 톤 리듬

```
Dark   → Light → Light → Light → Light → Dark → Dark → Light → Dark
hero    문제    P01    P02    P03    "다른가" "AI팀"  사례    CTA
```

라이트 4연속 구간(섹션 2~5)은 BG 단조로 보이지 않게 다음 변주를 둔다.

- §2: 순백 (#FFFFFF) + 센터 정렬
- §3: 연회색 (#FAFAFA) + 그리드 카드
- §4: 순백 + 다이어그램
- §5: 연회색 + 사람 사진 두 컷

---

## 5. 섹션별 카피 + 와이어 가이드

### §1 Hero

**비주얼**
- 좌→우로 천천히 panning되는 풀블리드 영상 (자동재생, muted, loop, poster fallback)
- 영상 컨텐츠: 노트북 앞에서 사람이 일하는 장면 + 화면에는 HOWAAA 카드 UI가 슬쩍 비침
- 영상 위 다크 그라디언트 (top: 0% → bottom: 60% black) — 본문 가독성 확보
- 본문은 영상의 "정중앙 어두운 영역"에만 배치

**카피**
```
(eyebrow pill)   COLLABORATIVE AI OS

(h1)             콘텐츠 한 편을, AI 팀이
                  끝까지 운영합니다.

(sub)            트렌드 수집부터 발행과 성과 회수까지.
                  카드 하나가 AI 팀에 자동 배정됩니다.

(cta primary)    14일 무료 체험 시작
(cta ghost)      도입 상담 받기
```

**컴포넌트**
- Eyebrow pill: BG `rgba(255,255,255,0.08)`, border `1px rgba(255,255,255,0.18)`, text `Figtree 14/600/white`
- H1: Pretendard 56px / 600 / line-height 1.3 / white
- Sub: 18px / 400 / `#D8DEE6`
- Primary CTA: HOWZERO accent (TBD, brand color reference 필요) + radius 8px
- Ghost CTA: 1px white border, transparent BG

**모바일**
- H1 → 32px, sub → 16px
- 영상 = 9:16 안전영역 crop
- CTA는 stack (vertical)

---

### §2 Problem statement

**카피**
```
(h3)   똑같은 AI 도구를 써도, 결과는 모두 다릅니다.

(p)    AI는 콘텐츠 한 편을 빠르게 만들 수 있습니다.
       하지만 트렌드 추적, 분배, 검증, 발행, 회수까지 운영하는 일은
       여전히 사람이 들고 있습니다.
```

**비주얼**: 텍스트만, 양쪽에 얇은 horizontal divider line, 배경 #FFFFFF, 센터 정렬, 상하 padding 160px (desktop) / 96px (mobile)

---

### §3 Point 01 — 트렌드부터 자동

**카피**
```
(pill)   POINT 01
(h3)     트렌드 근거 수집부터 자동입니다
(p)      유튜브, 인스타, 검색, 뉴스, 자사 데이터까지.
         HOWAAA가 매일 아침 콘텐츠 카드 위에 올려둡니다.
```

**비주얼**: 6개 데이터 소스 카드 (3 × 2 그리드, 모바일 2 × 3)
- 카드 1: YouTube 트렌드 카드 (썸네일 모자이크 + 조회수 라인)
- 카드 2: 인스타 trend (해시태그 클러스터)
- 카드 3: 검색량 (워드클라우드)
- 카드 4: 뉴스 (헤드라인 list)
- 카드 5: 자사 GA4 (라인 차트)
- 카드 6: 댓글 / 리뷰 (말풍선 stack)

각 카드 우상단에 카테고리 라벨 (`마케팅`, `브랜딩`, `시장조사`...)

**컴포넌트**
- 카드 BG: 파스텔 4종 순환 (`#F2F4FB`, `#EAF7F1`, `#FBF1E8`, `#F4ECFB`) — ai-team 패턴 차용
- 카드 radius: 16px
- 카드 그림자: `0 1px 2px rgba(0,0,0,0.04)` (가벼움)
- 카드 텍스트 영역: 카드 하단 padding 24px, 24px / 600 제목 + 14px / 400 부제

---

### §4 Point 02 — AI 팀 협업

**카피**
```
(pill)   POINT 02
(h3)     AI 한 명이 아니라 AI 팀이 일합니다
(p)      카드 한 장이 5명의 AI 담당자에게 차례로 배정됩니다.
         사람은 검증 Gate에서만 결정합니다.
```

**비주얼**: 5단계 원형 다이어그램 (가로 일렬, 모바일은 세로 stack)

```
[기획]  →  [집필]  →  [검증]  →  [발행]  →  [회수]
```

- 원 크기: 144px desktop / 96px mobile
- 짝수 인덱스(2, 4)만 다크 채움 (`#0F141A`) + 흰 텍스트 → 시선 리듬 (ai-team 차용)
- 홀수 인덱스는 흰 BG + 1px stroke (`#E5E9EE`)
- 원 사이 connector: 0.5px solid `#CFD5DB`, 가운데 작은 화살표
- 원 내부: 라벨(brand accent) + 두 줄 설명

| 단계 | 누가 | 무엇 |
|---|---|---|
| 기획 | 트렌드 분석 AI | 카드 brief + 각도 추천 |
| 집필 | 카피라이터 AI | 초안 + 변형 5개 |
| 검증 | 사실확인 AI + 사람 Gate | 출처/오류 검증 |
| 발행 | 채널 매니저 AI | 플랫폼별 자동 게시 |
| 회수 | 분석 AI | 성과 카드로 환원 |

---

### §5 Point 03 — 운영 카드가 자산이 됩니다

**카피**
```
(pill)   POINT 03
(h3)     운영 카드가 사라지지 않고 자산이 됩니다
(p)      AI가 다음에 새 카드를 만들 때, 지난 카드의 성과와 결정이
         그대로 컨텍스트로 들어갑니다. 인수인계가 사라집니다.
```

**비주얼**: 사람 두 컷 사진 (좌: 노트북으로 카드 검토하는 장면, 우: 미팅 화이트보드)

**선택 옵션**: 사진 하단에 작은 캡션 카드 ("월 80개 카드 운영, 인수인계 0회" 같은 한 줄 metric)

---

### §6 Dark — "콘텐츠 운영체제는 어떻게 다른가"

**카피 (좌)**
```
(h3, white)    AI 팀의 OS는,
               비즈니스 임팩트가 중심입니다.

(p, #ADB4BA)   콘텐츠는 단순히 발행하는 것이 아닙니다.
               기업의 매출 증대와 비용 절감으로 연결되는 카드만
               우선 순위에 올라옵니다.
```

**비주얼 (우)**: 다크 카드 3장 세로 스택, 카드 안에는 라인아트 그래프 (글로우 효과)
1. **트렌드 적합도 카드** — 거품 차트 위에 빛나는 점
2. **임팩트 목표 카드** — 우상향 라인 + 정점에 빛나는 다이아몬드
3. **자동화 매핑 카드** — node-link 그래프 (기업문화 / AI / 자동화 노드)

**컴포넌트 토큰**
- 섹션 BG: 그라데이션 `linear-gradient(180deg, #0B1018 0%, #0F1A26 100%)` + 노이즈 텍스처 1% opacity
- 카드 BG: `#10171F`, border 1px `rgba(255,255,255,0.04)`, radius 20px, padding 32px
- 카드 그래프: 단색 sky `#7CC4FF` 또는 mint `#7DE6CB`, glow `box-shadow: 0 0 24px <color>`

---

### §7 Dark — "AI 팀 구성도" (HOWAAA 고유)

**카피**
```
(h3, white)    AI 팀에는 6명의 담당자가 있습니다
(p, #ADB4BA)   각자 역할이 있고, 카드 한 장이 차례로 거쳐갑니다.
```

**비주얼**: 6개 페르소나 카드 (3 × 2 그리드)

| # | 이름 (예시) | 역할 | 일러스트 컨셉 |
|---|---|---|---|
| 1 | 트렌드 큐레이터 | 매일 트렌드 카드 생성 | 안테나/레이더 |
| 2 | 기획가 | 각도/타이틀/구조 잡기 | 보드 + 마인드맵 |
| 3 | 카피라이터 | 초안 + 변형 작성 | 만년필 + 페이지 |
| 4 | 팩트체커 | 출처/숫자/표현 검증 | 돋보기 + 체크 |
| 5 | 채널 매니저 | 플랫폼별 발행 + 스케줄 | 캘린더 + 채널 아이콘 |
| 6 | 성과 분석가 | 성과 카드로 환원 | 차트 + 인사이트 라벨 |

**카드 컴포넌트**
- BG: `#10171F`, radius 16px, padding 24px
- 상단 일러스트 영역 96px (단색 라인아트 + accent 컬러 1색)
- 이름: 18px / 600 / white
- 역할: 14px / 400 / `#9AA3AE`
- 호버: border `1px <accent>` + slight lift (transform translateY(-2px))

---

### §8 사례 캐러셀

**카피 헤더**
```
(h3)  HOWAAA로 운영한 팀들의 변화
```

**카드 구조 (좌 텍스트 + 우 제품 스샷)**

| Slide | 회사 | 산업 | 메트릭 | Before / After |
|---|---|---|---|---|
| 1 | 강남 D사 | DTC 코스메틱 | 콘텐츠 운영 시간 90% 절감 | 10시간/주 → 1시간/주 |
| 2 | 교육 스타트업 K사 | 에듀테크 | 발행 카드 수 4배 | 월 12 → 월 50 |
| 3 | 서울 G사 | 농업회사법인 | 블로그 운영 75% 자동화 | 1일 1시간 → 15분 |
| 4 | 부산 E사 | 친환경 화장품 | 시장 조사 시간 94% 단축 | 1.5시간/일 → 5분/일 |

**컴포넌트**
- 카드 컨테이너: 16:9 비율, radius 24px, 좌 텍스트 / 우 제품 mock 화면
- 좌측 padding 64px, 텍스트 max-width 420px
- 우측은 BG accent (sky 또는 lavender) + 제품 스샷 띄우기
- ←/→ 버튼: 60px 원, 1px stroke, 호버시 BG fill
- 인디케이터: 점 4개, 활성은 brand accent

**모바일**: 좌/우 stack → 위 텍스트, 아래 스샷. 캐러셀은 가로 스와이프.

---

### §9 그라디언트 CTA + Footer

**CTA 카드**
```
(h3, white)    어디서부터 시작할지 모르겠다면
                14일 무료 체험으로 첫 카드부터 띄워보세요.

(cta)          14일 무료 체험 시작 →
(ghost)        도입 상담 받기
```

**컴포넌트**
- 카드: full-width 안에 inset 96px, BG `radial-gradient(120% 80% at 30% 30%, #6D5CE7 0%, #1F60D9 60%, #0B1018 100%)` + noise
- radius 32px
- 카드 위 빛나는 작은 별 1개 (HOWZERO 모티프)
- CTA 버튼: 흰 BG + dark text, radius 999 (pill)

**Footer**
- 단일 브랜드 (HOWAAA만 노출, 모회사명은 "© HowZero, Inc." 한 줄로만)
- 4 컬럼: 제품 / 리소스 / 회사 / 법적 고지
- 우하단에 SNS 아이콘 4개 (Threads, Instagram, YouTube, LinkedIn)

---

## 6. 디자인 토큰 (HOWAAA × ai-team 합성)

### 6.1 컬러

```
/* 브랜드 */
--brand-primary:    [HOWAAA 기존 accent — TBD, 본 문서 v1.1에서 확정]
                     (후보: #1F60D9 sky-blue / #6D5CE7 violet)
--brand-accent-2:   #7DE6CB  (mint glow)

/* 텍스트 */
--text-strong:      #0B1018
--text-default:     #1B232C
--text-muted:       #5A636A
--text-on-dark:     #FFFFFF
--text-on-dark-mut: #D8DEE6   (WCAG AA 보장 회색)

/* 표면 */
--surface-white:    #FFFFFF
--surface-soft:     #FAFAFA
--surface-pastel-1: #F2F4FB
--surface-pastel-2: #EAF7F1
--surface-pastel-3: #FBF1E8
--surface-pastel-4: #F4ECFB

/* 다크 */
--surface-dark-0:   #0B1018   (deepest)
--surface-dark-1:   #10171F   (card)
--surface-dark-2:   #1A2330   (hover)
--stroke-dark:      rgba(255,255,255,0.06)
```

### 6.2 타이포

```
font-display: Pretendard
font-accent:  Figtree (영문 라벨 / 숫자)

H1 (hero):           56 / 600 / 1.30
H2 (section title):  42 / 600 / 1.30
H3 (subsection):     30 / 600 / 1.40
Body L:              18 / 400 / 1.65
Body M:              16 / 400 / 1.60
Body S:              14 / 400 / 1.55
Caption:             12 / 600 / 1.40 (uppercase, letter-spacing 0.04em)

mobile scale: H1 32, H2 28, H3 22, Body 15
```

### 6.3 컴포넌트 토큰

```
radius:        4 / 8 / 16 / 20 / 32 / 999
shadow-card:   0 1px 2px rgba(0,0,0,0.04)
shadow-glow:   0 0 24px var(--accent)
section-pad:   desktop 160px, tablet 112px, mobile 96px
container-max: 1200px (gutter 24px), 1440 wrapper
grid-gap:      24px
```

---

## 7. 인터랙션 / 모션

| 위치 | 트리거 | 동작 |
|---|---|---|
| Hero 영상 | 로드 | autoplay, muted, loop, prefers-reduced-motion이면 poster 정지 |
| Hero 텍스트 | 진입 | 0.4s ease-out fade-up, stagger 80ms |
| Eyebrow pill | 항상 | 4s 주기로 미세 호흡 (opacity 0.85↔1.0) |
| §3 카드 | 진입 | IntersectionObserver, stagger 60ms, translateY(8→0) |
| §4 다이어그램 | 진입 | 원 1→2→3→4→5 순차 점등, connector draw (1.2s) |
| §6 다크카드 | 진입 | glow opacity 0→1 (800ms) |
| §7 페르소나 카드 | 호버 | translateY(-2px) + border accent + 일러스트 micro 회전 (3°) |
| §8 캐러셀 | 자동 | 7초 자동 전환, 사용자 인터랙션 시 자동 정지 |
| §9 그라디언트 | 마우스 | 마우스 위치 따라 radial center 미세 이동 (5%) |

**원칙**

- 모든 모션은 `prefers-reduced-motion: reduce`에서 비활성
- 모션은 메시지를 강조하기 위해서만 사용 (장식 금지)
- 60fps 보장 (transform/opacity만 사용, layout 트리거 금지)

---

## 8. 모바일 (390 ~ 768)

| 섹션 | 모바일 처리 |
|---|---|
| Hero | 영상 9:16 crop, H1 32px, CTA stack |
| §3 6카드 | 2×3 grid → 모바일 1×6 stack, 3번째 카드부터 `Show more` 접기 |
| §4 5단계 | 가로 → 세로 stack, connector는 점선 세로 라인 |
| §6 다크 카드 3장 | 가로 그리드 → 세로 stack, 좌측 텍스트가 위로 이동 |
| §7 6 페르소나 | 3×2 → 2×3 또는 1×6, 일러스트 사이즈 축소 |
| §8 사례 캐러셀 | 좌/우 → 위/아래 stack, 가로 스와이프 |
| Sticky CTA | 화면 하단 고정 floating bar (모바일 전용) |

---

## 9. 접근성 (a11y)

- 본문 텍스트 최소 명도 대비 4.5:1, large text 3:1 (WCAG AA)
- 다크 본문 텍스트는 `#D8DEE6` 이상 (ai-team의 `#ADB4BA` 기각)
- 영상에는 자막 트랙 또는 텍스트 대안 제공
- 캐러셀: ←→ 키보드 네비게이션, ARIA `aria-roledescription="carousel"`
- CTA 버튼은 `aria-label` 포함, 아이콘 단독 버튼 금지
- 포커스 링 가시 (`outline: 2px solid var(--brand-primary)` + offset 2px)
- 다이어그램은 SVG `<title>` + `<desc>` 제공

---

## 10. 측정 / 분석

### 10.1 이벤트 정의

| 이벤트 | 발생 시점 | 파라미터 |
|---|---|---|
| `hero_cta_primary_click` | Hero "14일 무료 체험" 클릭 | section, variant |
| `hero_cta_ghost_click` | Hero "도입 상담" 클릭 | |
| `section_view` | 섹션이 viewport 50% 이상 차지 | section_id, scroll_depth |
| `point_card_hover` | §3 카드 hover 1초 이상 | card_id |
| `case_carousel_advance` | 캐러셀 슬라이드 변경 | from_index, to_index, mode (auto/manual) |
| `cta_card_click` | §9 CTA 클릭 | variant |
| `mobile_sticky_cta_click` | 모바일 sticky bar 클릭 | |

### 10.2 분석 도구

- GA4 (이벤트 + funnel)
- Plausible (대시보드)
- Hotjar 또는 Microsoft Clarity (heatmap, scrollmap)
- 자체 `posthog` 인스턴스 검토

---

## 11. 리스크 & 오픈 이슈

| # | 이슈 | 가정 / 다음 행동 |
|---|---|---|
| R1 | HOWAAA 브랜드 컬러가 본 문서에 명시 안 됨 | 브랜드 가이드 확인 후 v1.1에서 토큰 확정 |
| R2 | Hero 영상 자산 없음 | 사진/영상 촬영 일정 별도 plan 필요 (2~3주) |
| R3 | 사례 4건이 아직 ROI 수치 미확보 | 고객사 확인 후 수치/익명 표기 합의 |
| R4 | "AI 팀 구성도"의 6명 페르소나 일러스트 | 일러스트레이터 의뢰 또는 라인아트 self-build 결정 필요 |
| R5 | 사용 중인 CMS / 프레임워크 미결 | Next.js 14 (howzero-web) 활용 vs 신규 프로젝트 결정 필요 |
| R6 | 모바일 sticky CTA가 키보드 접근성 침해 가능 | 안전 영역 + ARIA `role="region"` |
| R7 | 캐러셀 자동 전환이 a11y 가이드 위반 | "사용자 인터랙션 시 정지"로 만족, 그래도 토글 옵션 검토 |

---

## 12. 다음 단계

1. **본 기획서 리뷰** (zerowater-may, 1차) — 페르소나/메시지 컨펌
2. **브랜드 토큰 확정** — `--brand-primary` 컬러, 로고 사용 가이드
3. **Wireframe excalidraw** — 9개 섹션 와이어 (별도 파일: `2026-05-05-howaaa-landing-wireframe.excalidraw.md`)
4. **카피 레퍼런스 1차 라이팅** — H1/H3/카드 카피 5개 변형씩
5. **Hero 영상 자산 기획** — 촬영 컷 리스트 또는 모션 그래픽 대안
6. **사례 4건 수치 확정** — 고객사 컨펌 + 익명화 합의
7. **빌드 plan 작성** — `docs/superpowers/plans/2026-05-XX-howaaa-landing-build.md`
8. **MVP 구현 → A/B 테스트** — 현재 랜딩 50% / 신규 50% 한 달 측정

---

## 13. 부록

### 13.1 벤치마크 캡처 위치

- `ai-team-ax-desktop-fullpage.png` (1440 풀페이지)
- `ai-team-ax-01-hero.png` ~ `ai-team-ax-08-cta-footer.png` (섹션별)
- `ai-team-ax-mobile-fullpage.png` (390 모바일)
- `ai-team-ax-consulting-snapshot.md` (DOM 트리)

### 13.2 참고

- HowZero 페르소나: `docs/persona-howzero.md`
- 마스터 마케팅 전략: `docs/MARKETING-MASTER-STRATEGY.md`
- 랜딩 CRO 가이드: `docs/marketing/P2-website-cro-landing-page-optimization.md`
- 비교 랜딩 SEO: `docs/marketing/P3-128-comparison-landing-page-seo.md`

### 13.3 변경 이력

| 버전 | 날짜 | 작성자 | 변경 |
|---|---|---|---|
| v1.0 | 2026-05-05 | Claude (zerowater-may 요청) | 최초 작성 |
