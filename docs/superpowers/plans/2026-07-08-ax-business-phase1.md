# AX 사업 Phase 1 (리서치 & 전략) Implementation Plan

> **For agentic workers:** 이 계획은 코드가 아니라 리서치 `.md` 산출물을 만든다. 실행은 Workflow 멀티에이전트 팬아웃으로 한다. 각 Task는 정확한 산출물 경로 + 검증 기준을 가진다.

**Goal:** 해외 AX 벤치마킹부터 사업계획서·1년 로드맵까지 12종 전략 `.md`를 근거·출처와 함께 `docs/ax-business/`에 만든다.

**Architecture:** 2단계. Stage 1 리서치 Workflow(5차원 팬아웃 + 적대적 검증) → 네이밍/포지셔닝 게이트(사용자 확정) → Stage 2 전략 합성 Workflow. 근거 없는 주장은 `⚠️ 미확인`.

**Tech Stack:** Workflow 오케스트레이션, web search, `insane-search`(차단 크롤링), 산출물 = Markdown.

---

## 파일 구조

산출물: `docs/ax-business/00-overview.md` … `11-goals-milestones-1yr.md` (스펙 §3 표와 1:1).
중간 근거: `docs/ax-business/_research/*.json` (에이전트 raw + 출처, 게이트 후 정리).

---

### Task 1: Stage 1 리서치 Workflow

**Files:**
- Create: `docs/ax-business/_research/stage1-findings.json` (검증된 사실 + 출처)
- Create: `docs/ax-business/01-market-overseas-ax.md`
- Create: `docs/ax-business/02-competitors-korea.md`

**방법 (Workflow 팬아웃):** 5개 리서치 에이전트 병렬 → 각자 web search + `insane-search`, 구조화 스키마 반환. 그 뒤 핵심 주장별 적대적 검증(refute) 에이전트 다수결 → 통과분만 `verified`. 마지막 합성 에이전트가 01/02 md 초안.

리서치 차원(에이전트별 output schema = `{claims:[{text, sourceUrls:[], confidence}], examples:[{name, url, offering, pricingModel, positioning, channel}]}`):
1. 해외 AX/자동화 에이전시·컨설팅 벤치마킹 (US/EU/글로벌): 서비스 구성, 가격모델, 포지셔닝
2. 이커머스 특화 자동화 유스케이스·수요 (해외+국내)
3. 국내 경쟁사(AI팀/alphabrothers, 기타) + 각사 마케팅 채널·콘텐츠
4. 소구점/pain 시그널 (커뮤니티·리뷰·SNS의 실제 대표 자동화 고민)
5. 마케팅 벤치마킹 (쓰레드/IG릴스/유튜브에서 AX·자동화 크리에이터 방식)

- [ ] **Step 1:** Stage 1 Workflow 실행 (위 5차원 + 적대적 검증 + 01/02 합성)
- [ ] **Step 2 (검증):** `01/02` 파일 존재 + 각 핵심 주장에 sourceUrl 존재 + 미확인 항목은 `⚠️ 미확인` 표기 확인

---

### Task 2: 네이밍/포지셔닝 게이트 산출물

**Files:**
- Create: `docs/ax-business/03-brand-naming.md` (후보 8~12 + 도메인/상표 스크리닝 + 추천 top3)
- Create: `docs/ax-business/_research/positioning-brief.md` (1페이지: 한줄 포지셔닝, 타겟, 핵심 소구점, 차별점 가설)

**방법:** Task 1 findings를 입력으로 네이밍 에이전트(후보 생성 + 의미/발음/도메인 가용성 추정) + 포지셔닝 합성. 도메인 가용성은 추정치이며 확정은 사용자 확인 필요 → `⚠️ 미확인` 표기.

- [ ] **Step 1:** 03 + positioning-brief 생성
- [ ] **Step 2 (게이트):** 사용자에게 요약 + 네이밍 top3 + 포지셔닝 제시 → **방향 확정 수신 전 Task 3 시작 금지**

---

### Task 3: Stage 2 전략 합성 Workflow

**Files (확정 포지셔닝 입력):**
- Create: `04-persona-founder.md`, `05-target-segments.md`, `06-value-prop-소구점.md`, `07-differentiation.md`, `08-sales-discovery-questions.md`, `09-content-strategy.md`, `10-business-plan.md`, `11-goals-milestones-1yr.md`

**방법:** Workflow 팬아웃 — 문서군을 병렬 합성. 04~08(포지셔닝·세일즈), 09(콘텐츠, Task1 차원5 입력), 10(사업계획서, Asana business-plan 구조), 11(로드맵, Asana goals-milestones 구조). 완결성 크리틱 에이전트가 누락·모순 점검 → 수정.

- [ ] **Step 1:** Stage 2 Workflow 실행 (8종 md)
- [ ] **Step 2 (검증):** 8종 파일 존재 + 확정 포지셔닝과 일관 + 10/11이 Asana 템플릿 섹션 커버 확인

---

### Task 4: 인덱스 + 무결성

**Files:**
- Create: `docs/ax-business/00-overview.md` (인덱스 + 방법론 + 출처 마스터 목록)

- [ ] **Step 1:** 00 생성, 01~11 링크 + 출처 집계
- [ ] **Step 2 (검증):** 00의 내부 링크 전부 유효(파일 존재) + 12종 전부 링크됨 확인

---

## Self-Review (spec 대비)

- 스펙 §3 산출물 12종 → Task 1~4가 전부 생성(01,02 / 03 / 04-11 / 00). ✅
- 검증(§4): 각 Task Step2가 존재·출처·일관성 체크. ✅
- 게이트(§2): Task 2 Step2가 사용자 확정 게이트. ✅
- 날조 금지: 미확인 `⚠️` 규칙 Task1/2에 명시. ✅
