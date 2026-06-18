# HowZero Commerce Content Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 하우제로의 기존 셀러/불사자 채널 자산과 `S-001` 커머스 브랜치를 분석해, 커머스 하우제로 포지셔닝, 콘텐츠 필러, 4주 제작 큐, 측정 루프를 실행 가능한 문서와 원고 산출물로 뽑는다.
**Architecture:** 로컬 `brands/howzero/**` 콘텐츠 저장소를 원본으로 삼고, `docs/strategy/**`에는 분석/운영 문서, `brands/howzero/howzero_script|howzero_shorts|howzero_carousel_raw/**`에는 실제 콘텐츠 원고를 저장한다. vidIQ MCP는 유튜브 채널/키워드 측정 스냅샷에만 사용한다.
**Tech Stack:** Markdown, existing HowZero brand/content conventions, vidIQ MCP, shell inventory commands, optional YouTube upload analytics exported later as CSV.

---

## 1. 현재 판단

### 1.1 핵심 결론

하우제로 커머스는 새로 만들어야 할 브랜드가 아니라, 이미 존재하는 `하우제로 - 셀링하는 AI 개발자` 채널과 `Bulsaja` 자산을 하나의 메시지로 재정렬해야 한다.

가장 강한 포지션은 다음 한 문장이다.

> 셀러 1년 차에 월 1억 구조를 만들어보고, 데이터에 빠져 AI 개발자가 된 사람이 셀러 업무 자동화를 직접 깔아준다.

이 포지션은 일반 `AI 자동화 컨설턴트`보다 강하다. 이유는 타겟이 더 좁고, 기존 채널의 인기 자산이 이미 구매대행/상품기획/불사자 튜토리얼에 몰려 있기 때문이다.

### 1.2 vidIQ 스냅샷

조회 기준일: 2026-05-13

채널 `UCGgr-Js3FUxRqJiX6KkZ8Ig`

- 채널명: `하우제로 - 셀링하는 AI 개발자`
- 구독자: `2,220`
- 누적 조회수: `71,908`
- 영상 수: `30`
- 최근 30일: 구독자 `+30`, 조회수 `+1,655`, 업로드 `1개`

인기 롱폼 상위권 신호:

- `월 4000만원 버는 02년생의 충격적인 노하우 (2편)`
- `AI 상품기획 마술사`
- `구매대행 시작하는 사람은 꼭 보세요`
- `AI 상품명 생성기`
- `카테고리 소싱`
- `AI 이미지 편집`
- `불사자 제대로 활용하기`

해석:

- 채널은 이미 셀러/구매대행/상품기획 시청자를 갖고 있다.
- 최근 업로드 빈도는 낮다. 새 메시지를 많이 테스트하기보다, 검증된 셀러 키워드로 4주 연속성을 만드는 게 우선이다.
- 기존 `HowZero = 5분에서 0분으로` 메시지는 유지하되, 커머스 브랜치에서는 `상세페이지/상품등록/소싱/CS`처럼 셀러가 바로 이해하는 업무명으로 내려야 한다.

### 1.3 키워드 스냅샷

vidIQ 기준:

| 키워드 | Volume | Competition | Overall | Estimated Monthly Search | 판단 |
|---|---:|---:|---:|---:|---|
| `상세페이지 ai` | 77.47 | 16.7 | 79.80 | 154,825 | 1순위 메인 키워드 |
| `AI 상세페이지` | 70.54 | 18.5 | 74.92 | 53,133 | 제목/설명 반복 키워드 |
| `상세페이지 만들기 ai` | 68.30 | 17.0 | 74.18 | 37,593 | 튜토리얼형 키워드 |
| `구매대행 AI` | 55.03 | 24.5 | 63.22 | 4,861 | 불사자 기존 유저 전환 키워드 |
| `스마트스토어 AI` | 0 | 22.7 | 30.92 | 0 | 단독 메인 키워드로 약함 |
| `스마트스토어` | 73.79 | 29.5 | 72.48 | 87,786 | 조합 키워드로 사용 |
| `상세페이지` | 76.49 | 31.4 | 73.33 | 133,004 | 범용 고수요 키워드 |
| `구매대행` | 72.02 | 27.8 | 72.09 | 66,734 | 기존 채널 자산과 맞음 |
| `해외구매대행` | 70.19 | 18.9 | 74.55 | 50,361 | 소싱/등록 콘텐츠에 적합 |
| `1인셀러` | 55.65 | 9.6 | 69.55 | 5,345 | 페르소나 키워드 |

해석:

- `스마트스토어 AI`를 제목 앞에 세우면 검색 신호가 약하다.
- `상세페이지 AI`, `상세페이지 만들기`, `구매대행 AI`, `스마트스토어 상세페이지` 조합이 우선이다.
- 첫 4주는 Bulsaja의 AI 상세페이지 기능을 중심축으로 삼고, 이후 상품등록/CS/리뷰/가격 모니터링으로 넓힌다.

---

## 2. 분석 산출물 구조

실행 후 만들어야 할 파일:

```text
docs/strategy/
├── 2026-05-13-howzero-commerce-content-analysis.md
├── 2026-05-13-howzero-commerce-content-scorecard.md
└── 2026-05-13-howzero-commerce-4week-calendar.md

brands/howzero/
├── howzero_script/
│   ├── S-002-commerce-ai-detail-page-demo.md
│   ├── S-003-commerce-kmong-vs-ai-detail-page.md
│   ├── S-004-commerce-purchase-agency-ai-workflow.md
│   └── S-005-commerce-seller-5-bottlenecks-ai.md
├── howzero_shorts/
│   ├── B-<next>-shorts-commerce-detail-page-30won.md
│   ├── B-<next>-shorts-commerce-one-product-3min.md
│   ├── B-<next>-shorts-commerce-kmong-300k-vs-ai.md
│   ├── B-<next>-shorts-commerce-before-after-conversion.md
│   └── B-<next>-shorts-commerce-seller-ai-developer-origin.md
└── howzero_carousel_raw/
    ├── C-<next>-carousel-commerce-detail-page-ai.md
    ├── C-<next>-carousel-commerce-kmong-vs-ai.md
    └── C-<next>-carousel-commerce-seller-automation-map.md
```

`<next>`는 TASK 1에서 현재 최대 번호를 확인한 뒤 실제 번호로 치환한다.

---

## 3. 콘텐츠 전략

### 3.1 커머스 하우제로의 5개 필러

| Pillar | 역할 | 첫 콘텐츠 |
|---|---|---|
| AI 상세페이지 | Bulsaja 제품 가치와 검색 수요가 만나는 핵심 | `S-002` |
| 구매대행/소싱 자동화 | 기존 채널 시청자와 가장 가까운 진입점 | `S-004` |
| 셀러 5대 병목 | 하우제로의 `5 -> 0` 브랜드와 연결 | `S-005` |
| Before/After 수치 증명 | 신뢰 확보. 전환율, 제작비, 시간 절감 | `S-003` |
| 셀링하는 AI 개발자 스토리 | 권위와 차별화. 단, 과장 금지 | 숏폼/오프닝 반복 |

### 3.2 금지/주의

- `운 좋게`, `찍어봤다`, `SaaS 연 10억`, `지금도 셀링 중` 금지.
- `AI가 다 해준다`처럼 완전 자동 환상을 팔지 않는다.
- `스마트스토어 AI`를 단독 제목 키워드로 쓰지 않는다.
- `매장`, `사장님`보다 커머스 문맥에서는 `셀러`, `대표님`, `스마트스토어/쿠팡`을 우선 사용한다.
- Bulsaja 기능 설명보다 셀러의 비용/시간/전환율 변화가 먼저 나와야 한다.

### 3.3 우선 CTA

1. Bulsaja 상세페이지 기능 체험
2. 커머스 전용 무료 AI 오딧
3. CS/상품등록 자동화 템플릿 신청

초기 4주는 CTA를 하나로 고정하지 말고, 영상별로 1개만 둔다. `S-002/S-003`은 Bulsaja, `S-004/S-005`는 무료 오딧으로 보낸다.

---

## 4. 4주 실행 큐

### Week 1: AI 상세페이지 도입

- 롱폼: `S-002` — `상세페이지 AI로 3분 만에 만드는 법: 외주 30만원 vs 이미지 30원`
- 쇼츠 5개:
  - 이미지 1장 30원 훅
  - 상품 1개 3분 훅
  - 외주 30만원 비교
  - 전환율 4% -> 5% 계산
  - 셀링하는 AI 개발자 자기소개
- 캐러셀 1개: `상세페이지 제작비 30만원을 30원으로 낮춘 구조`

### Week 2: 비교와 증명

- 롱폼: `S-003` — `크몽 상세페이지 vs AI 상세페이지: 셀러가 봐야 할 건 디자인이 아니라 전환율`
- 쇼츠 5개: 가격, 시간, 수정 속도, 광고 테스트, 실패 사례
- 캐러셀 1개: `상세페이지 외주 전에 확인할 7가지`

### Week 3: 구매대행/소싱 자동화

- 롱폼: `S-004` — `구매대행 셀러가 AI로 소싱부터 업로드까지 줄이는 순서`
- 쇼츠 5개: 키워드, 상품명, 이미지 번역, 썸네일, 업로드
- 캐러셀 1개: `구매대행 자동화 맵: 소싱 -> 상품명 -> 상세페이지 -> 업로드`

### Week 4: 셀러 5대 병목

- 롱폼: `S-005` — `1인 셀러 하루 5대 병목: CS, 리뷰, 상품등록, 가격, 보고서`
- 쇼츠 5개: 병목별 Before/After
- 캐러셀 1개: `셀러 업무 5개를 0에 가깝게 줄이는 순서`

---

## 5. Implementation Tasks

### TASK 0: 작업 전 안전 확인

- [ ] `git status --short`로 현재 더티 상태를 확인한다.
- [ ] 사용자 변경 파일은 되돌리지 않는다.
- [ ] 계획 실행 중 수정할 파일을 아래로 제한한다.
  - `docs/strategy/**`
  - `brands/howzero/howzero_script/S-002*`부터 `S-005*`
  - `brands/howzero/howzero_shorts/B-*shorts-commerce-*`
  - `brands/howzero/howzero_carousel_raw/C-*carousel-commerce-*`
  - `brands/howzero/INDEX.md`

### TASK 1: 콘텐츠 인벤토리 확정

- [ ] 현재 커머스 관련 파일을 추출한다.

```bash
rg --files brands/howzero docs/marketing docs \
  | rg -i 'commerce|커머스|bulsaja|불사자|seller|셀러|ecommerce|구매대행|상세페이지|스마트스토어|쿠팡'
```

- [ ] 현재 `B-***`, `C-***` 최대 번호를 확인한다.

```bash
find brands/howzero/howzero_shorts -maxdepth 1 -type f -name 'B-*.md' | sort | tail -5
find brands/howzero/howzero_carousel_raw -maxdepth 1 -type f -name 'C-*.md' | sort | tail -5
```

- [ ] `brands/howzero/INDEX.md`의 커머스 브랜치 설명과 금지어를 다시 확인한다.
- [ ] `S-001-commerce-intro-ai-detail-page.md`를 기준 원고로 삼는다.

### TASK 2: 분석 문서 작성

- [ ] `docs/strategy/` 디렉토리를 만든다.
- [ ] `docs/strategy/2026-05-13-howzero-commerce-content-analysis.md`를 작성한다.
- [ ] 문서에 아래 섹션을 포함한다.
  - 현재 채널 상태
  - 기존 콘텐츠 자산 맵
  - 커머스 하우제로 포지셔닝
  - 키워드 우선순위
  - 5개 콘텐츠 필러
  - 메시지 금지어/권장어
  - 4주 실행 큐
  - CTA 매핑
- [ ] vidIQ 숫자는 `조회 기준일: 2026-05-13`로 명시한다.

### TASK 3: 측정 스코어카드 작성

- [ ] `docs/strategy/2026-05-13-howzero-commerce-content-scorecard.md`를 작성한다.
- [ ] 측정 컬럼을 고정한다.
  - 발행일
  - 채널
  - 포맷
  - 제목
  - 메인 키워드
  - CTA
  - 24시간 조회수
  - 7일 조회수
  - 평균 시청 지속 시간
  - 클릭률
  - 댓글 질문 수
  - Bulsaja 체험 클릭
  - 무료 오딧 신청
  - 다음 액션
- [ ] 판단 규칙을 넣는다.
  - 조회수만 보고 판단하지 않는다.
  - `상세페이지 AI` 계열은 클릭/체험 전환을 우선 본다.
  - `구매대행` 계열은 댓글 질문/구독 전환을 같이 본다.

### TASK 4: 4주 캘린더 작성

- [ ] `docs/strategy/2026-05-13-howzero-commerce-4week-calendar.md`를 작성한다.
- [ ] Week 1~4별 롱폼 1개, 쇼츠 5개, 캐러셀 1개를 표로 정리한다.
- [ ] 각 콘텐츠에 `훅`, `증거`, `CTA`, `재활용 경로`를 넣는다.
- [ ] `S-001`은 Week 1 오프닝 재료로 연결한다.

### TASK 5: 롱폼 원고 4개 작성

- [ ] `brands/howzero/howzero_script/S-002-commerce-ai-detail-page-demo.md` 작성.
- [ ] `brands/howzero/howzero_script/S-003-commerce-kmong-vs-ai-detail-page.md` 작성.
- [ ] `brands/howzero/howzero_script/S-004-commerce-purchase-agency-ai-workflow.md` 작성.
- [ ] `brands/howzero/howzero_script/S-005-commerce-seller-5-bottlenecks-ai.md` 작성.
- [ ] 각 원고는 아래 구조를 따른다.
  - 메타데이터
  - 0~5초 훅
  - 문제 정의
  - 실제 데모/구조
  - Before/After 수치
  - 셀러용 주의점
  - CTA
  - 설명란
  - 고정 댓글
  - 썸네일 가이드

### TASK 6: 쇼츠 원고 20개 작성

- [ ] TASK 1에서 확인한 다음 번호로 `B-***` 파일을 생성한다.
- [ ] Week 1~4별 5개씩 총 20개 작성.
- [ ] 각 쇼츠는 아래 구조를 따른다.
  - 0~2초 훅
  - 2~15초 문제/증거
  - 15~40초 해결 구조
  - 40~55초 수치/비교
  - 55~60초 CTA
- [ ] 첫 3초에 반드시 셀러 업무명 또는 숫자를 넣는다.

### TASK 7: 캐러셀 원고 4개 작성

- [ ] TASK 1에서 확인한 다음 번호로 `C-***` 파일을 생성한다.
- [ ] Week 1~4별 1개씩 총 4개 작성.
- [ ] 각 캐러셀은 8~10장 구조로 쓴다.
  - 1장: 숫자 훅
  - 2장: 셀러 문제
  - 3~6장: 구조/비교
  - 7~8장: Before/After
  - 마지막: CTA

### TASK 8: INDEX 업데이트

- [ ] `brands/howzero/INDEX.md`의 커머스 브랜치 섹션에 `S-002`~`S-005`와 신규 `B/C` 산출물을 추가한다.
- [ ] 금지어와 권장 포지셔닝은 기존 섹션을 유지하고, 중복 설명은 최소화한다.
- [ ] `docs/strategy/**` 분석 문서 링크를 참고 문서로 추가한다.

### TASK 9: 검수

- [ ] 금지어 검색.

```bash
rg -n '운 좋게|찍어봤다|SaaS 연 10억|지금도 셀링 중|매장' \
  brands/howzero/howzero_script/S-00*.md \
  brands/howzero/howzero_shorts/B-*shorts-commerce-*.md \
  brands/howzero/howzero_carousel_raw/C-*carousel-commerce-*.md \
  docs/strategy/2026-05-13-howzero-commerce-*.md
```

- [ ] 키워드 누락 검색.

```bash
rg -n '상세페이지|구매대행|스마트스토어|쿠팡|셀러|Bulsaja|불사자' \
  docs/strategy/2026-05-13-howzero-commerce-*.md \
  brands/howzero/howzero_script/S-00*.md
```

- [ ] `git diff --stat`으로 변경 범위가 계획과 일치하는지 확인한다.
- [ ] 새 파일 경로가 `brands/` 컨벤션과 맞는지 확인한다.

---

## 6. Definition of Done

- [ ] 커머스 하우제로 분석 문서 1개 작성 완료.
- [ ] 측정 스코어카드 1개 작성 완료.
- [ ] 4주 콘텐츠 캘린더 1개 작성 완료.
- [ ] 롱폼 원고 4개 작성 완료.
- [ ] 쇼츠 원고 20개 작성 완료.
- [ ] 캐러셀 원고 4개 작성 완료.
- [ ] `brands/howzero/INDEX.md` 업데이트 완료.
- [ ] 금지어 검수 통과.
- [ ] vidIQ 채널/키워드 수치 기준일 명시 완료.

---

## 7. Execution Note

Plan complete and saved to `docs/superpowers/plans/2026-05-13-howzero-commerce-content-analysis.md`.

Two execution options:

1. Subagent-Driven Execution: run independent workers for `analysis docs`, `long-form scripts`, `shorts`, and `carousels`, then integrate.
2. Inline Execution: execute tasks sequentially in this session, checking each artifact before moving on.

Which approach?
