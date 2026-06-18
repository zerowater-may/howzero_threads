# 용감한 용팀장 v2 — 9건 큰 수정 design (체크리스트)

> 2026-05-26 · brainstorming 결과
> 원본 요청: 사용자 메시지 (1~9)

## 결정 사항 (확정)

| # | 결정 |
|---|---|
| 5주 구조 | 오프 5 + 줌 4 + 효자상품 10개 그대로 |
| 카운트다운 | 진짜 1기 마감 datetime cron (자연 압박) |
| 1기 마감 default | `2026-06-08T23:59:59+09:00` (env `NEXT_PUBLIC_COHORT1_DEADLINE`로 override) |
| 부동산 페르소나 수위 | 자연스럽게 노출 ("부동산 자산" 정도, "20채" 같은 강한 fact는 인터뷰/영상에서만) |
| 유튜브 캐러셀 위치 | why-yong 직전 (용팀장 노하우 → 왜 용팀장인가 자연 연결) |

## 체크리스트 (9건)

### #1 — 인원 명시 제거
- [ ] `lib/config.ts`: `capacityMin/capacityMax` 유지하되 페이지 노출 제거
- [ ] `components/strip.tsx`: "10~15명 · 소수정예" 항목 제거
- [ ] `components/operation.tsx`: stats `10~15명 / 소수정예` 항목 제거
- [ ] `components/scarcity.tsx`: title `10~15명 소수정예` 항목 제거 (또는 "소수정예"만 남기고 숫자 빼기)
- [ ] `components/comparison.tsx`: 7번째 행 `10~15명 · 신청서 보고 한 분씩` → `신청서 보고 한 분씩` (인원 제거)
- [ ] `components/calendar.tsx`: lead "오프라인 6회 + 줌 보강 5회" → 5주 매핑 후 인원 무관
- [ ] `app/layout.tsx` meta description: `10~15명` 제거 (있으면)
- [ ] `components/hero.tsx` 보조 안내: `course.capacityMin~Max명만 받아요` → 인원 빼고 "신청서 보고 한 분씩 따로 연락드립니다" 만

### #2 — 250만원 → 180만원 앵커링 강화
- [ ] `components/strip.tsx`: `180만원` 옆에 `s태그 250만원` 같이 노출 (현재 "1기 특별가 · 정가 250만원" sub에만 있음 → 메인에 두 가격 동시 노출)
- [ ] `components/price.tsx`: 5xl 180만원 + 250만원 strike 이미 있음 → 더 큰 대비 (line-through 강조, "1기에만" 라벨 시각 강화)
- [ ] `components/scarcity.tsx` 카드 2 title: `1기 ${priceFirst}만원 · 정가 ${priceRegular}만원` 유지

### #3 — trust-evidence "강의 전에, 현업이 먼저입니다." → 현업 진행 강조
- [ ] body 3 → "지금도 매일 직접 운영 중인 셀러입니다."

### #4 — ai-definition title 더 감성·사람답게
- 옛: "AI 셀링은 툴 쓰는 법이 아니에요. 매일 돌리는 판매 운영 구조입니다."
- 새 후보: "AI는 대신 팔아주지 않아요. 제가 매일 손으로 돌리던 일을, 같이 빠르게 반복하는 거예요." 또는 "AI에 팔아달라는 게 아닙니다. 제가 매일 하던 판단을, 더 빠르게 반복하게 만드는 거예요."

### #5 — Origin Story step 1 부동산 정합 재수정
- 브랜드 에셋: "부동산 20채 / 자산은 있어도 매월 현금흐름은 별도 / 직장 월급만으로는 부족"
- 옛: "회사 다니던 직장인, 부동산 자산은 있었습니다." (이미 N+24 수정 — 어색)
- 새: head `"부동산도, 월급도 있었는데 — 매월 흐르는 돈은 따로였습니다."` / body `"부동산 자산을 모으면 노후가 끝나는 줄 알았어요. 그런데 막상 살아보니 매월 들어오는 돈은 또 다른 얘기더라고요. 아이는 크고 학원비는 늘고, 자산이 있어도 '매월 흐르는 돈'은 따로 만들어야 한다는 걸 그때 처음 알았습니다."`

### #6 — 6주 → 5주 전체 변경
- [ ] `lib/config.ts`: `offlineCount: 6→5`, `zoomCount: 5→4`
- [ ] hero/strip/operation/comparison/scarcity/study/faq/curriculum/calendar/outcome 등 모든 컴포넌트에서 "6주" → "5주" grep+replace
- [ ] `curriculum.tsx`: 6주차 1개 통합 또는 삭제. Week 5에 "효자상품 10개 점검 · 다음 30일 운영" + "AI 반복 작업 루틴" 통합
- [ ] `calendar.tsx`: weeks 배열 6→5 항목. 일정 6.13~7.11 (5주). 줌 4회 (6.17/6.24/7.1/7.8)
- [ ] `outcome.tsx`: "6주 동안 효자상품 10개" → "5주 동안 효자상품 10개" (밀도 ↑ 자연 강조)
- [ ] meta description, JSON-LD, OG description "6주" → "5주"

### #7 — Study 섹션 톤 (보통 강의 = 끝나면 끝 vs 우리 = 끝나고가 진짜) 부드럽게
- [ ] `components/study.tsx` 메시지:
  - 옛 title: "6주 강의는 시작일 뿐입니다." (단정)
  - 새 title: "보통 강의는 끝나면 거기서 끝나죠." (대비 setup)
  - 본문: "저는 끝나고 나서가 더 중요하다고 생각해요. 5주가 끝나도 매월 같이 모여서, 정책 바뀌고 시장 바뀌어도 천천히 같이 따라갑니다."
  - 메모 한 줄: "같이 한다는 게, 5주짜리 약속이 아니어서요." (부드러운 진정성)

### #8 — Sticky CTA + 진짜 마감 카운트다운 + 할인 노출
- [ ] `lib/config.ts`: `cohort1Deadline = process.env.NEXT_PUBLIC_COHORT1_DEADLINE || "2026-06-08T23:59:59+09:00"`
- [ ] 새 컴포넌트 `components/countdown-timer.tsx`: 실시간 D-N · HH:MM:SS, 마감 후 자동 숨김
- [ ] `components/sticky-cta.tsx` 확장:
  - 모바일: 기존 + 위쪽 한 줄 카운트다운 + 가격 (1기 180만원 · 정가 ̶2̶5̶0̶만원)
  - 데스크탑: 우측 하단 고정 floating pill (기존 모바일 only → 데스크탑도)
- [ ] sticky CTA가 hero 통과 후 위→아래 모든 스크롤 영역에서 등장 (이미 그렇지만 데스크탑은 hidden md:flex 추가)

### #9 — 유튜브 캐러셀 신규 섹션 ("용팀장의 노하우")
- [ ] 새 컴포넌트 `components/youtube-carousel.tsx`:
  - 3개 영상 (사용자 URL):
    - `https://youtu.be/lkpxv0H3TG0?si=LZyRxOqffwsM97AP`
    - `https://youtu.be/AdYg6Gv-gpo?si=XsSQBxQ4HXS2ZXD9`
    - `https://youtu.be/_dXN6UhhdEc?si=kvEXbMjhWZynSsOC`
  - 가로 스크롤 (snap-x snap-mandatory + overflow-x-auto) — 외부 라이브러리 없이 native scroll
  - 각 카드: youtube thumbnail (`https://i.ytimg.com/vi/{id}/maxresdefault.jpg`) + 제목 placeholder + "유튜브에서 보기" link
  - 클릭: 새 창 youtube로 이동 (in-page embed iframe은 LCP 무거움 — link 방식)
- [ ] `app/page.tsx`: `<Calendar />` 다음 `<WhyYong />` 직전에 `<YouTubeCarousel />` 삽입
- [ ] 섹션 title: "용팀장의 노하우 보기" / lead: "현장에서 직접 풀어본 작업법을 영상으로도 확인하실 수 있어요."

## 영향 범위 요약

| 파일 | 변경 종류 |
|---|---|
| `lib/config.ts` | 카운트다운 datetime + offlineCount/zoomCount |
| `components/hero.tsx` | 인원 제거 |
| `components/strip.tsx` | 인원·가격·5주 |
| `components/origin-story.tsx` | step 1 재작성 |
| `components/trust-evidence.tsx` | body 3 |
| `components/ai-definition.tsx` | title 감성 |
| `components/curriculum.tsx` | 6주차 통합 → 5주차 |
| `components/operation.tsx` | 인원 stats 제거, 5주 |
| `components/calendar.tsx` | 5주 weeks 배열, 일정 단축 |
| `components/outcome.tsx` | 6주 → 5주 |
| `components/study.tsx` | "될 때까지 같이" 강화 |
| `components/comparison.tsx` | 인원 행 변경 |
| `components/scarcity.tsx` | 인원·5주 |
| `components/price.tsx` | 가격 앵커링 강화 |
| `components/faq.tsx` | "6주" → "5주" |
| `components/sticky-cta.tsx` | 데스크탑 노출 + 카운트다운 + 가격 |
| `components/countdown-timer.tsx` | **신규** |
| `components/youtube-carousel.tsx` | **신규** |
| `app/page.tsx` | YouTubeCarousel 삽입 |
| `app/layout.tsx` | meta description 5주 |

## 가드 (지속)
- 가격 숫자는 노출 OK (이전 정책 반전 유지)
- 매출 단정 X, "월 X만원 번다" 같은 보장 X
- 부동산 페르소나는 "자산은 있어도 매월 현금흐름은 별도" 톤으로만 노출 (재산 자랑 X)
- 카운트다운은 **진짜 마감 datetime 기반** (fake daily reset X)
