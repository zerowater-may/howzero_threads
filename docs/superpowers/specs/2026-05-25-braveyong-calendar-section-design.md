# 용감한 용팀장 — 1기 강의일정 캘린더 섹션 design

> 2026-05-25 · 결정 기록 + 구현 가이드

## 결정

| 항목 | 결정 |
|---|---|
| 컴포넌트 | `components/calendar.tsx` — vertical timeline 6 카드 |
| 위치 | `app/page.tsx`의 Operation **다음**, WhyYong 직전 |
| 톤 | `tone="warm"` (Operation dark 직후 warm으로 색 리듬) |
| 데이터 | 무료 전환강의 1 highlight pill + 6주 카드(오프라인+줌) |
| Reveal | 카드별 `data-reveal` + `hz-delay-{1..5}` stagger |
| 모바일 | vertical 1컬럼, 좌측 라인+도트 (origin-story와 일관) |
| 디스클레이머 | "실제 날짜·시간은 1기 확정 후 따로 안내. 아래는 예정." |

## 데이터

course 시작일 `2026-06-13 (토)` 기준 매주 토요일 오프라인, 줌은 2~6주차 직전 수요일.

```ts
const free = { date: "6.10 (수)", label: "무료 전환강의" }
const weeks = [
  { n: 1, off: "6.13 (토)", title: "대량등록 탈출 진단", zoom: null },
  { n: 2, off: "6.20 (토)", title: "상품 선정 · 키워드 · 카테고리", zoom: "6.17 (수)" },
  { n: 3, off: "6.27 (토)", title: "AI 상세페이지 설계", zoom: "6.24 (수)" },
  { n: 4, off: "7.4 (토)",  title: "등록 · 대표이미지 · 전환 체크", zoom: "7.1 (수)" },
  { n: 5, off: "7.11 (토)", title: "AI 반복 작업 루틴", zoom: "7.8 (수)" },
  { n: 6, off: "7.18 (토)", title: "효자상품 10개 점검 · 다음 30일 운영", zoom: "7.15 (수)" },
]
```

오프라인 6회, 줌 5회(2~6주차) — config의 `offlineCount: 6`, `zoomCount: 5`와 일치.

## 시각 구조

```
┌─ Section (tone=warm) ─────────────────────────┐
│  label: "Calendar"                            │
│  title: "1기 강의일정"                        │
│  lead: "오프라인 6회 + 줌 보강 5회. 매주 토   │
│         요일 오프라인, 사이 주중에 줌."       │
│                                               │
│  ┌─ 무료 전환강의 highlight pill ───────────┐ │
│  │ 🎁 6.10 (수) · 유튜브 무료 전환강의      │ │
│  └────────────────────────────────────────┘ │
│                                               │
│  ┌─ 6주 timeline ─────────────────────────┐ │
│  │ ● W1 ┃ 6.13 토 · 오프라인 1주차         │ │
│  │   │  │ 대량등록 탈출 진단               │ │
│  │   │  └─────────────────────────────────┘ │
│  │   │                                       │
│  │ ● W2 ┃ 6.20 토 · 오프라인 2주차         │ │
│  │   │  │ 상품 선정 · 키워드 · 카테고리    │ │
│  │   │  │ + 6.17 (수) 줌 보강              │ │
│  │   │  └─────────────────────────────────┘ │
│  │   ...                                     │
│  │ ● W6 ┃ 7.18 토 · 오프라인 마무리         │ │
│  │      │ 효자상품 10개 점검 · 다음 30일    │ │
│  │      │ + 7.15 (수) 줌 보강              │ │
│  └────────────────────────────────────────┘ │
│                                               │
│  ※ 실제 날짜·시간은 1기 확정 후 따로 안내    │
└───────────────────────────────────────────────┘
```

## 애니메이션 (animate 스킬 가이드 반영)

- **timing**: `200–300ms` entrance, `cubic-bezier(0.22, 1, 0.36, 1)` (이미 globals.css의 [data-reveal] 활용)
- **stagger**: 카드별 `hz-delay-{1..5}` 80ms 간격 — 위→아래 흐름
- **hover**: 카드 hover 시 `translate-y-[-2px] + border-foreground` (operation 카드 패턴 차용)
- **focus**: 카드 자체는 비-interactive. 도트만 시각 강조.
- **reduced-motion**: `prefers-reduced-motion` 자동 noop (globals.css 폴백)

## 영향 범위

| 파일 | 변경 |
|---|---|
| `components/calendar.tsx` | 신규 |
| `app/page.tsx` | import + `<Operation />` 다음 `<Calendar />` 삽입 |

기존 코드 수정 최소 — 새 컴포넌트 1개 + page 1줄.

## 검증

- alias HTTP 200 + 새 문구 "1기 강의일정" / "6.13 (토)" 등 노출
- 모바일 viewport에서 vertical timeline 깨지지 않음
- prefers-reduced-motion 켜고도 카드 보임
