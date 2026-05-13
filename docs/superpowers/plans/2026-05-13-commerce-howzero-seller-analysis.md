# 커머스 하우제로 셀러 페르소나·니즈 분석 리포트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 불사자(커머스) 채널을 우선으로 커머스 하우제로 셀러 페르소나의 페인·니즈를 기존 9개 커머스 콘텐츠 자산 + 3개 페르소나/전략 문서에서 추출해 분석 리포트(.md) 1편으로 정리한다.

**Architecture:** 6개 task로 분할. (1) 입력 인벤토리·페르소나 ground truth 확정 → (2) raw 페인 포인트 인용 추출 → (3) 매출 단계 × 니즈 매트릭스 작성 → (4) 불사자 채널 콘텐츠 갭 분석 → (5) 통합 리포트 1편으로 합치기 → (6) 페르소나 톤 검수(금지 표현 grep + 호칭 일관성). 중간 산출물 4개는 `docs/marketing/2026-05-13-commerce-howzero-seller-analysis/`에 두고, 최종 리포트는 그 폴더 옆 `docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md`로 둔다. TDD가 아닌 "검증 가능한 산출 기준"(개수·grep 결과·표 컬럼)으로 각 task를 자기 검증한다.

**Tech Stack:** Markdown only. `grep`/`rg`/`wc -l`로 검증. 새 코드·스크립트 생성 금지.

**Ground truth 페르소나 1순위:** `~/.claude/projects/-Users-zerowater-Dropbox-zerowater-howzero/memory/commerce_howzero_persona.md` (이 plan 안의 모든 톤·금지 표현은 이 파일에서 가져옴)

---

## File Structure

생성:
- `docs/marketing/2026-05-13-commerce-howzero-seller-analysis/00-inputs.md` (Task 1)
- `docs/marketing/2026-05-13-commerce-howzero-seller-analysis/01-pain-points-raw.md` (Task 2)
- `docs/marketing/2026-05-13-commerce-howzero-seller-analysis/02-stage-needs-matrix.md` (Task 3)
- `docs/marketing/2026-05-13-commerce-howzero-seller-analysis/03-content-gaps.md` (Task 4)
- `docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md` (Task 5, 최종)

수정:
- `docs/superpowers/plans/2026-05-13-commerce-howzero-seller-analysis.md` (이 파일, 진행 시 체크박스만)

읽기 전용 입력 (9개 콘텐츠 + 3개 페르소나/전략):
- `brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page.md`
- `brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page-READ.md`
- `brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page-DESIGN.md`
- `brands/howzero/howzero_script/A-005-ecommerce-automation-case-study.md`
- `brands/howzero/howzero_script/A-009-ecommerce-seller-five-to-zero-full.md`
- `brands/howzero/howzero_script/A-127-cross-border-ecommerce-ai-automation.md`
- `brands/howzero/howzero_shorts/B-009-shorts-ecommerce-seller-pain.md`
- `brands/howzero/howzero_carousel_raw/C-122-carousel-automation-package-ecommerce.md`
- `~/.claude/projects/-Users-zerowater-Dropbox-zerowater-howzero/memory/commerce_howzero_persona.md`
- `docs/persona-howzero-identity.md`
- `docs/MARKETING-MASTER-STRATEGY.md`

---

### Task 1: 입력 자산 인벤토리 + 페르소나 ground truth 요약

**Files:**
- Create: `docs/marketing/2026-05-13-commerce-howzero-seller-analysis/00-inputs.md`
- Read (확인용): 위 9+3개 파일 전체

- [x] **Step 1: 분석 폴더 생성**

```bash
mkdir -p docs/marketing/2026-05-13-commerce-howzero-seller-analysis
```

- [x] **Step 2: 입력 파일 9개가 모두 존재하는지 검증**

```bash
for f in \
  brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page.md \
  brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page-READ.md \
  brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page-DESIGN.md \
  brands/howzero/howzero_script/A-005-ecommerce-automation-case-study.md \
  brands/howzero/howzero_script/A-009-ecommerce-seller-five-to-zero-full.md \
  brands/howzero/howzero_script/A-127-cross-border-ecommerce-ai-automation.md \
  brands/howzero/howzero_shorts/B-009-shorts-ecommerce-seller-pain.md \
  brands/howzero/howzero_carousel_raw/C-122-carousel-automation-package-ecommerce.md \
  docs/persona-howzero-identity.md \
  docs/MARKETING-MASTER-STRATEGY.md; do
  [ -f "$f" ] && echo "OK $f" || echo "MISSING $f"
done
```

Expected: 모든 줄이 `OK ...`. `MISSING ...`이 하나라도 있으면 즉시 멈추고 사용자에게 보고.

- [x] **Step 3: 9개 콘텐츠 + 3개 페르소나/전략 문서 전체 Read**

각 파일 Read 도구로 한 번씩 끝까지 읽기. 9개 콘텐츠는 페인 인용 추출용 raw 자료, 3개 페르소나/전략은 톤·매출 권위·금지 표현 ground truth.

- [x] **Step 4: `00-inputs.md` 작성**

다음 구조 그대로 작성:

```markdown
# 00 · 입력 자산 인벤토리

## 1. 페르소나 ground truth (1순위)

- 파일: `~/.claude/projects/-Users-zerowater-Dropbox-zerowater-howzero/memory/commerce_howzero_persona.md`
- 한 줄: "셀러 1년 차에 월 1억 만들어보고, 데이터에 빠져 AI 개발자가 된 후, 셀러를 위한 AI 자동화만 박는 중."
- 타깃: 1인 셀러 · 구매대행 · 쿠팡셀러 · 스마트스토어 셀러
- 시청자 호칭: "대표님" (복수 "대표님들")
- 플랫폼 명칭: "스마트스토어/스스", "쿠팡" — "매장" 금지
- 가격 포인트: 불사자 상세페이지 **1장 30원** (vs 크몽 외주 30만원 = 1만 배)

## 2. 보조 페르소나

- `docs/persona-howzero-identity.md`: 스마트스토어 셀러 김민수, 월매출 3,000만원, "이커머스 CS 자동화" 유튜브 검색 진입
- `docs/MARKETING-MASTER-STRATEGY.md`: 불사자 마스터 전략의 하우제로 변환 페르소나, 1인 이커머스 사업자 김민수(34세)

## 3. 콘텐츠 자산 인벤토리 (9개)

| ID | 타입 | 주제 | 파일 |
|---|---|---|---|
| S-001 (v1) | 긴 영상 대본 | AI 상세페이지 도입부 1분 | brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page.md |
| S-001 (READ) | 낭독본 | 동일 주제 readable | brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page-READ.md |
| S-001 (DESIGN) | 설계 노트 | 동일 주제 설계 | brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page-DESIGN.md |
| A-005 | 긴 대본 | 이커머스 자동화 케이스 스터디 | brands/howzero/howzero_script/A-005-ecommerce-automation-case-study.md |
| A-009 | 긴 대본 | 이커머스 셀러 5to0 | brands/howzero/howzero_script/A-009-ecommerce-seller-five-to-zero-full.md |
| A-127 | 긴 대본 | 크로스보더 이커머스 AI 자동화 | brands/howzero/howzero_script/A-127-cross-border-ecommerce-ai-automation.md |
| B-009 | 쇼츠 | 이커머스 셀러 페인 | brands/howzero/howzero_shorts/B-009-shorts-ecommerce-seller-pain.md |
| C-122 | 카러셀 raw | 자동화 패키지 이커머스 | brands/howzero/howzero_carousel_raw/C-122-carousel-automation-package-ecommerce.md |

## 4. 분석 범위·제외

- **포함**: 위 9개 자산 + 3개 페르소나/전략 문서에서 직접 발견되는 페인·니즈
- **제외**: 외부 시장 데이터, 경쟁사 리서치, 신규 인터뷰 (이번 plan 범위 밖)
- **출력 채널 우선순위**: 불사자(커머스) > 본체 하우제로
```

- [x] **Step 5: 검증**

```bash
test $(grep -c "^| " docs/marketing/2026-05-13-commerce-howzero-seller-analysis/00-inputs.md) -ge 8 && echo OK || echo FAIL
```

Expected: `OK` (콘텐츠 자산 표 8개 row + header).

- [x] **Step 6: Commit**

```bash
git add docs/marketing/2026-05-13-commerce-howzero-seller-analysis/00-inputs.md docs/superpowers/plans/2026-05-13-commerce-howzero-seller-analysis.md
git commit -m "docs(분석): 커머스 하우제로 셀러 분석 입력 인벤토리 작성"
```

---

### Task 2: 페인 포인트 raw 인용 추출

**Files:**
- Create: `docs/marketing/2026-05-13-commerce-howzero-seller-analysis/01-pain-points-raw.md`
- Read: Task 1에서 인벤토리한 9개 콘텐츠 자산

목적: 분석 전에 9개 자산에서 "셀러가 직접 호소하는 페인" 또는 "콘텐츠가 명시한 셀러 페인"을 **출처·원문 인용** 형태로 모은다. 해석은 다음 task로 미룬다.

- [ ] **Step 1: 페인 포인트 분류 카테고리 확정**

다음 6개 카테고리만 사용 (임의 추가 금지):
1. **시간 코스트** — 상세페이지/이미지/CS 응대 등에 들어가는 시간
2. **외주·인건비** — 디자이너·CS 담당자·MD 등 외부 비용
3. **반복 작업** — 상품 등록·옵션 정리·문의 응대 같은 휴먼 루프
4. **데이터 무지** — "왜 팔리지/안 팔리지" 모르는 상태
5. **플랫폼 정책 압박** — 스스/쿠팡 등의 정책·검수·랭킹
6. **확장 정체** — 매출 구간 고정, 시스템화 막힘

- [ ] **Step 2: 9개 자산 각각에서 페인 인용 추출**

각 파일에서 최소 1개, 최대 6개까지 페인 인용을 뽑는다. 인용은 **원문 그대로**, 의역 금지. 형식:

```markdown
### {파일 ID}

- **[시간 코스트]** "원문 인용 그대로" — line {줄번호 또는 섹션}
- **[외주·인건비]** "원문 인용 그대로" — line {줄번호}
```

해당 자산에서 페인이 보이지 않으면 그 자산 섹션 밑에 `_페인 인용 없음 (자료가 페인보다 솔루션·구조 중심)_` 한 줄만 남긴다.

- [ ] **Step 3: `01-pain-points-raw.md` 작성**

다음 헤더로 시작:

```markdown
# 01 · 페인 포인트 raw 인용

> 9개 콘텐츠 자산에서 원문 인용 형태로 추출. 해석·매트릭스화는 02에서.

## 카테고리

1. 시간 코스트
2. 외주·인건비
3. 반복 작업
4. 데이터 무지
5. 플랫폼 정책 압박
6. 확장 정체
```

이후 9개 자산 섹션을 ID 알파벳 순서(A-005, A-009, A-127, B-009, C-122, S-001, S-001-DESIGN, S-001-READ)로 채운다.

- [ ] **Step 4: 카테고리별 인용 개수 합계 표 추가**

문서 맨 끝에:

```markdown
## 카테고리별 인용 개수

| 카테고리 | 인용 개수 |
|---|---|
| 시간 코스트 | N |
| 외주·인건비 | N |
| 반복 작업 | N |
| 데이터 무지 | N |
| 플랫폼 정책 압박 | N |
| 확장 정체 | N |
| **합계** | N |
```

N은 실제 카운트로 채운다.

- [ ] **Step 5: 검증**

```bash
total=$(grep -cE "^- \*\*\[" docs/marketing/2026-05-13-commerce-howzero-seller-analysis/01-pain-points-raw.md)
echo "총 인용: $total"
test $total -ge 9 && echo OK || echo FAIL
```

Expected: `OK` (자산이 9개이므로 인용 최소 9개. "없음" 자산이 일부 있어도 합계 9 이상 확보. 미달이면 Step 2로 복귀해 누락 자산 재확인).

```bash
grep -E "운 좋게|찍어봤다|GPT-3 SaaS 연 10억|셀러님|매장" docs/marketing/2026-05-13-commerce-howzero-seller-analysis/01-pain-points-raw.md
```

Expected: 결과 없음 (원문 인용에서 금지 표현이 등장하면 인용은 유지하되 본 문서 본문 톤에 끌려가지 않도록 다음 task에서 변환).

- [ ] **Step 6: Commit**

```bash
git add docs/marketing/2026-05-13-commerce-howzero-seller-analysis/01-pain-points-raw.md
git commit -m "docs(분석): 9개 커머스 자산에서 페인 포인트 원문 인용 추출"
```

---

### Task 3: 셀러 매출 단계 × 니즈 매트릭스 작성

**Files:**
- Create: `docs/marketing/2026-05-13-commerce-howzero-seller-analysis/02-stage-needs-matrix.md`
- Read: `01-pain-points-raw.md`, 페르소나 ground truth, `docs/persona-howzero-identity.md`

목적: raw 인용을 4개 매출 단계 × 5개 니즈 컬럼 매트릭스(20셀)로 정리. 셀이 비면 "근거 부족"이라고 명시.

- [ ] **Step 1: 매출 단계 4구간 확정**

페르소나 자료를 기준으로 다음 4구간만 사용:

| 단계 | 월매출 범위 | 페르소나 자료 매핑 |
|---|---|---|
| S0 입문 | 0 ~ 500만원 | 콘텐츠 자산에서 추정되는 신규 진입 셀러 |
| S1 단발 | 500 ~ 3,000만원 | `docs/persona-howzero-identity.md` 김민수(3,000만원) |
| S2 구조화 | 3,000만 ~ 1억 | 메모리 페르소나가 "구조"라 부르는 진입 구간 |
| S3 시스템 | 1억 이상 | 메모리 페르소나 본인 ("1억 구조 완성") |

- [ ] **Step 2: 니즈 컬럼 5개 확정**

1. **핵심 페인** (가장 큰 1~2개)
2. **시간 누수 구간** (어디서 시간이 빠지는가)
3. **돈 누수 구간** (어디서 돈이 빠지는가)
4. **AI/자동화 도입 후보** (구체 워크플로 1~2개)
5. **불사자 솔루션 매칭** (1장 30원 상세페이지 등 — 매칭 없으면 "현재 없음")

- [ ] **Step 3: `02-stage-needs-matrix.md` 작성**

```markdown
# 02 · 셀러 매출 단계 × 니즈 매트릭스

> 입력: `01-pain-points-raw.md` + 페르소나 ground truth + persona-howzero-identity.md
> 4단계 × 5컬럼 = 20셀. 근거가 없는 셀은 `_근거 부족_`으로 명시.

## 매트릭스

| 단계 | 핵심 페인 | 시간 누수 구간 | 돈 누수 구간 | AI/자동화 도입 후보 | 불사자 솔루션 매칭 |
|---|---|---|---|---|---|
| S0 입문 (0~500만) | ... | ... | ... | ... | ... |
| S1 단발 (500~3,000만) | ... | ... | ... | ... | ... |
| S2 구조화 (3,000만~1억) | ... | ... | ... | ... | ... |
| S3 시스템 (1억+) | ... | ... | ... | ... | ... |

## 셀별 근거 (raw 인용 출처)

### S0 입문 · 핵심 페인
- 출처: {파일 ID} "{원문 인용}"

### S0 입문 · 시간 누수 구간
- 출처: ...

[... 20셀 모두 ...]
```

20셀 모두 채우되 인용 출처가 없는 셀은 `_근거 부족_`만 적고 셀별 근거 섹션은 생략.

- [ ] **Step 4: 검증 — 매트릭스 row 수**

```bash
grep -cE "^\| S[0-3] " docs/marketing/2026-05-13-commerce-howzero-seller-analysis/02-stage-needs-matrix.md
```

Expected: `4`

- [ ] **Step 5: 검증 — 셀별 근거 또는 "근거 부족" 표기 합계**

```bash
근거=$(grep -cE "^### S[0-3] " docs/marketing/2026-05-13-commerce-howzero-seller-analysis/02-stage-needs-matrix.md)
부족=$(grep -cE "_근거 부족_" docs/marketing/2026-05-13-commerce-howzero-seller-analysis/02-stage-needs-matrix.md)
echo "근거 채워진 셀: $근거, 근거 부족 셀: $부족, 합계: $((근거+부족))"
test $((근거+부족)) -ge 20 && echo OK || echo FAIL
```

Expected: `OK` (4단계 × 5컬럼 = 20셀이 모두 분류됨).

- [ ] **Step 6: Commit**

```bash
git add docs/marketing/2026-05-13-commerce-howzero-seller-analysis/02-stage-needs-matrix.md
git commit -m "docs(분석): 셀러 매출 4단계 × 5니즈 매트릭스 작성"
```

---

### Task 4: 불사자 채널 콘텐츠 갭 분석

**Files:**
- Create: `docs/marketing/2026-05-13-commerce-howzero-seller-analysis/03-content-gaps.md`
- Read: `00-inputs.md`, `02-stage-needs-matrix.md`

목적: 매트릭스의 20셀 vs 9개 기존 콘텐츠 자산이 다루는 셀을 비교해 **이미 다룬 셀 / 비어 있는 셀** 두 분류로 갈라 불사자 채널에서 다음에 만들 콘텐츠 후보 5개를 우선순위 매겨 제안.

- [ ] **Step 1: 9개 자산의 매트릭스 매핑**

각 자산이 어느 단계(S0~S3)와 어느 니즈 컬럼(핵심 페인/시간 누수/돈 누수/AI 도입 후보/불사자 매칭)을 다루는지 1~3개 셀로 라벨링.

```markdown
| 자산 ID | 대표 단계 | 대표 니즈 컬럼 |
|---|---|---|
| S-001 | ? | ? |
| ... | ... | ... |
```

- [ ] **Step 2: 갭 표 만들기**

20셀에 대해 다음을 표시:

```markdown
| 단계 | 니즈 컬럼 | 다룬 자산 수 | 갭 여부 |
|---|---|---|---|
| S0 입문 | 핵심 페인 | 1 | 보강 필요 |
| ... | ... | ... | ... |
```

다룬 자산 수가 0이면 `갭`, 1~2이면 `보강 필요`, 3+이면 `충분`.

- [ ] **Step 3: 불사자 채널 콘텐츠 후보 5개 작성**

`갭` 또는 `보강 필요` 셀 중에서, 불사자 페르소나 톤("셀러를 위해 AI 자동화", 1장 30원 상세페이지)과 가장 잘 맞는 5개 후보를 다음 형식으로:

```markdown
## 불사자 채널 다음 콘텐츠 후보 TOP 5

### 1. {제목 1줄}
- 대상 셀: S{n} × {니즈 컬럼}
- 형식: shorts | carousel | reels | longform
- 한 줄 hook: "..."
- 페르소나 톤 체크: 호칭 "대표님", 플랫폼 명칭 "스스/쿠팡", 가격 라인 활용 여부
- 근거 셀: 02 매트릭스의 어느 셀에서 가져왔는가
```

5개 모두 동일 형식. 후보 제목 중 어떤 것도 다음 금지 표현 포함 금지: "운 좋게", "찍어봤다", "GPT-3 SaaS 연 10억", "지금도 셀링 중", "B2B AX 컨설턴트", "셀러님", "매장".

- [ ] **Step 4: 검증 — 갭 표가 20행인지**

```bash
grep -cE "^\| S[0-3] [^|]+ \|" docs/marketing/2026-05-13-commerce-howzero-seller-analysis/03-content-gaps.md
```

Expected: `20`

- [ ] **Step 5: 검증 — 콘텐츠 후보 5개**

```bash
grep -cE "^### [0-9]+\. " docs/marketing/2026-05-13-commerce-howzero-seller-analysis/03-content-gaps.md
```

Expected: `5`

- [ ] **Step 6: 검증 — 금지 표현 grep 0 hit**

```bash
grep -nE "운 좋게|찍어봤다|GPT-3 SaaS 연 10억|지금도 셀링 중|B2B AX 컨설턴트|셀러님|(^|[^스])매장" docs/marketing/2026-05-13-commerce-howzero-seller-analysis/03-content-gaps.md
```

Expected: 결과 없음 (스마트스토어의 "매"는 제외하는 패턴). 하나라도 걸리면 해당 줄 수정 후 재실행.

- [ ] **Step 7: Commit**

```bash
git add docs/marketing/2026-05-13-commerce-howzero-seller-analysis/03-content-gaps.md
git commit -m "docs(분석): 불사자 채널 콘텐츠 갭 + 다음 콘텐츠 후보 TOP 5"
```

---

### Task 5: 통합 분석 리포트 1편으로 합치기

**Files:**
- Create: `docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md`
- Read: `00-inputs.md`, `01-pain-points-raw.md`, `02-stage-needs-matrix.md`, `03-content-gaps.md`

목적: 4개 중간 산출물을 한 문서로 합치되, raw 인용은 부록으로 빼고 본문은 "결론 → 매트릭스 → 콘텐츠 후보" 순서로 의사결정 가능한 형태로 정리.

- [ ] **Step 1: 최종 문서 구조 확정**

```markdown
# 커머스 하우제로 셀러 페르소나·니즈 분석

> 생성: 2026-05-13. 채널 우선순위: 불사자 > 본체 하우제로.
> 입력: 9개 커머스 콘텐츠 자산 + 3개 페르소나/전략 문서.
> Ground truth 페르소나: `~/.claude/projects/-Users-zerowater-Dropbox-zerowater-howzero/memory/commerce_howzero_persona.md`

## 0. 한 장 요약

- 핵심 셀러 페인 TOP 3 (매트릭스에서 자산 수 기준 상위 3)
- 가장 큰 콘텐츠 갭 (가장 적게 다룬 매트릭스 셀 1~2개)
- 다음 분기 콘텐츠 우선순위 (TOP 5 중 1~2번)

## 1. 페르소나 ground truth

(00-inputs.md의 §1, §2 발췌 — 한 줄 페르소나 + 호칭 + 가격 포인트)

## 2. 셀러 매출 단계 × 니즈 매트릭스

(02-stage-needs-matrix.md의 매트릭스 표 그대로 + 단계별 해석 단락 4개)

## 3. 콘텐츠 자산 커버리지 & 갭

(03-content-gaps.md의 갭 표 + 갭 해석 단락)

## 4. 불사자 채널 다음 콘텐츠 후보 TOP 5

(03-content-gaps.md의 후보 5개 그대로)

## 5. 다음 액션

- 콘텐츠 발주 후보 (TOP 5 중 어떤 ID/형식부터?)
- 추가 리서치가 필요한 셀 (매트릭스의 "근거 부족" 셀 목록)
- 페르소나 보완 포인트 (필요 시 commerce_howzero_persona.md 업데이트 제안)

## 부록 A. raw 페인 포인트 인용

(01-pain-points-raw.md 전체)

## 부록 B. 입력 자산 인벤토리

(00-inputs.md §3, §4 발췌)
```

- [ ] **Step 2: 위 구조 그대로 작성. 중간 산출물 4개 본문을 인용·발췌 형식으로 그대로 옮긴다**

복붙 + 단락 해석 추가. 새로 만드는 부분은 §0 한 장 요약과 §5 다음 액션과 §2/§3의 해석 단락(각 3~5줄)만.

- [ ] **Step 3: 검증 — 모든 섹션 존재**

```bash
for h in "## 0. 한 장 요약" "## 1. 페르소나 ground truth" "## 2. 셀러 매출 단계 × 니즈 매트릭스" "## 3. 콘텐츠 자산 커버리지 & 갭" "## 4. 불사자 채널 다음 콘텐츠 후보 TOP 5" "## 5. 다음 액션" "## 부록 A. raw 페인 포인트 인용" "## 부록 B. 입력 자산 인벤토리"; do
  grep -qF "$h" docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md && echo "OK $h" || echo "MISSING $h"
done
```

Expected: 8줄 모두 `OK ...`.

- [ ] **Step 4: 검증 — 한 장 요약(§0)이 3개 불릿 모두 채워짐**

```bash
awk '/^## 0\./,/^## 1\./' docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md | grep -cE "^- "
```

Expected: `3` 이상.

- [ ] **Step 5: Commit**

```bash
git add docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md
git commit -m "docs(분석): 커머스 하우제로 셀러 페르소나·니즈 분석 리포트 v1"
```

---

### Task 6: 페르소나 톤 검수 + 호칭 일관성 + 가격 라인 노출 확인

**Files:**
- Modify: `docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md` (위반 시 수정)
- Modify: `docs/marketing/2026-05-13-commerce-howzero-seller-analysis/03-content-gaps.md` (위반 시 수정)

목적: 최종 리포트와 콘텐츠 후보가 커머스 하우제로 페르소나 톤 규칙을 위반하지 않는지 grep 기반으로 자동 검수. 위반 발견 시 해당 줄만 수정 후 재검수.

- [ ] **Step 1: 금지 표현 7종 grep**

```bash
grep -nE "운 좋게|찍어봤다|GPT-3 SaaS 연 10억|지금도 셀링 중|B2B AX 컨설턴트|셀러님" \
  docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md \
  docs/marketing/2026-05-13-commerce-howzero-seller-analysis/*.md
```

Expected: 부록 A의 raw 인용을 제외하면 hit 0건. 본문(§0~§5, §4 후보)에서 hit 있으면 해당 줄을 페르소나 권장 표현으로 치환:
- "운 좋게" → "구조를 만들었다"
- "찍어봤다" → "박았다"
- "GPT-3 SaaS 연 10억" → 삭제 또는 "셀러 채널은 1억 셀러 구조 권위로"로 치환
- "셀러님" → "대표님"

raw 인용(부록 A)은 출처 보존을 위해 수정 금지. 본문 해석 단락에서만 치환.

- [ ] **Step 2: "매장" 단어 사용 검사 (스마트스토어/매대 같은 합성어 제외)**

```bash
grep -nE "(^|[^스마])(매장)([^스]|$)" \
  docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md \
  docs/marketing/2026-05-13-commerce-howzero-seller-analysis/*.md
```

Expected: 부록 A raw 인용 제외 hit 0건. 본문 hit 있으면 "스마트스토어" 또는 "쿠팡" 또는 "스스든 쿠팡이든"으로 치환.

- [ ] **Step 3: 가격 라인 노출 확인**

```bash
grep -nE "1장 30원|30원" docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md
```

Expected: 최소 1건 hit (§1 페르소나 ground truth 또는 §4 콘텐츠 후보 중 1장 30원 라인 노출). 0건이면 §1에 ground truth 가격 포인트를 한 줄 추가.

- [ ] **Step 4: 호칭 "대표님" 노출 확인**

```bash
grep -cE "대표님" docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md
```

Expected: 최소 2건 (§1 + §4 후보 중 hook에서 1회 이상). 미달이면 §4 후보의 hook을 "대표님"이 들어가도록 수정.

- [ ] **Step 5: 4개 매출 단계 모두 등장 확인**

```bash
for s in "S0 입문" "S1 단발" "S2 구조화" "S3 시스템"; do
  grep -qF "$s" docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md && echo "OK $s" || echo "MISSING $s"
done
```

Expected: 4줄 모두 `OK ...`.

- [ ] **Step 6: 위반 수정이 있었으면 Commit**

```bash
git status --short docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md docs/marketing/2026-05-13-commerce-howzero-seller-analysis/
```

수정이 있으면:

```bash
git add docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md docs/marketing/2026-05-13-commerce-howzero-seller-analysis/
git commit -m "docs(분석): 페르소나 톤 위반 grep 결과 본문 치환"
```

수정이 없으면 commit 생략 ("clean. no changes"라고 본문에 보고).

- [ ] **Step 7: 최종 보고**

`docs/marketing/2026-05-13-commerce-howzero-seller-analysis.md` 경로와 §0 한 장 요약 본문을 stdout에 그대로 출력 + 사용자에게 다음 액션 후보(§5 첫 줄) 1개 제안.

---

## Self-Review 결과

- **Spec coverage**: 답한 3개 요구사항 — (1) 분석 대상 "커머스 셀러 페르소나·니즈" → Task 2~3, (2) 산출물 ".md 분석 리포트" → Task 5, (3) 채널 우선순위 "불사자" → Task 4 + Task 6. 모두 매핑됨.
- **Placeholder scan**: "TBD"·"이후"·"적절히" 없음. 단, Task 3 §1의 4개 매출 단계 구분은 페르소나 자료 기반 추정이므로 Task 6에서 실제 자료와 어긋나면 사용자 확인 필요 (이 plan 안에 명시).
- **Type consistency**: 매출 단계 라벨은 모든 task에서 `S0 입문 / S1 단발 / S2 구조화 / S3 시스템` 4종 동일. 니즈 컬럼은 `핵심 페인 / 시간 누수 / 돈 누수 / AI 도입 후보 / 불사자 솔루션 매칭` 5종 동일. 금지 표현 7종은 ground truth(`commerce_howzero_persona.md`)에서 그대로 가져옴.
- **갭 1개 발견 → 보강 완료**: Task 6 Step 1에서 "raw 인용은 수정 금지, 본문 해석 단락만 치환" 규칙을 명시해 Task 2의 원문 보존 원칙과 Task 6의 톤 강제 사이 충돌 해소.
