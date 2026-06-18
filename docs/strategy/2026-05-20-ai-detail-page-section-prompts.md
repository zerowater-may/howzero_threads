# AI 상세페이지 섹션 프롬프트 · 전략 (v2)

> 작성일: 2026-05-20 (v2 디테일 확장)
> 용도: 불사자 솔루션 · 자체 운영 스토어 · 셀러 봉사 콘텐츠에서 공통으로 쓰는 AI 상세페이지 제작 reference
> 페르소나: 커머스 하우제로 — "셀러를 위한 AI 자동화" 봉사 톤
> 전제: 1장 30원 자동화 워크플로우 안에서 섹션별로 LLM 카피 + 이미지 AI가 한 상품 3분 안에 동시 완성
> 자매 문서: [S-001 도입부 대본](../../brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page.md), [S-002 마누태그 대본](../../brands/howzero/howzero_script/S-002-commerce-smartstore-manutag.md)

---

## 목차

0. [한 줄 컨셉](#0-한-줄-컨셉)
1. [모바일 상세페이지의 물리적 제약](#1-모바일-상세페이지의-물리적-제약)
2. [상세페이지 표준 구조 — 8섹션 위→아래 설득 순서](#2-상세페이지-표준-구조--8섹션-위→아래-설득-순서)
3. [LLM 선택 가이드 (섹션별 권장 모델)](#3-llm-선택-가이드-섹션별-권장-모델)
4. [이미지 AI 선택 가이드 (섹션별 권장 모델)](#4-이미지-ai-선택-가이드-섹션별-권장-모델)
5. [섹션별 프롬프트 + 전략 (8섹션 풀버전)](#5-섹션별-프롬프트--전략-8섹션-풀버전)
6. [카테고리별 섹션 가중치 + 카테고리 전용 프롬프트 오버라이드](#6-카테고리별-섹션-가중치--카테고리-전용-프롬프트-오버라이드)
7. [컬러·타이포·간격 시스템 (S-001 디자인 시스템 계승)](#7-컬러타이포간격-시스템-s-001-디자인-시스템-계승)
8. [프롬프트 작성 9원칙](#8-프롬프트-작성-9원칙)
9. [광고법·식약처·전자상거래법 가드 (★ S-002 학습 반영)](#9-광고법식약처전자상거래법-가드--s-002-학습-반영)
10. [자동화 파이프라인 모듈 매핑 (불사자 기준)](#10-자동화-파이프라인-모듈-매핑-불사자-기준)
11. [품질 자동 평가 루브릭](#11-품질-자동-평가-루브릭)
12. [A/B 테스트 프레임워크](#12-ab-테스트-프레임워크)
13. [End-to-End 워크드 예제 — 스테인리스 텀블러 600ml](#13-end-to-end-워크드-예제--스테인리스-텀블러-600ml)
14. [다음 작업 + S-003 영상 후보](#14-다음-작업--s-003-영상-후보)

---

## 0. 한 줄 컨셉

> **상세페이지는 디자인이 아니라 "고객 설득 순서"다.**
> 8개 섹션을 정해진 순서로 박고, 각 섹션을 LLM 카피 + 이미지 AI 둘로 돌려서 **한 상품 3분 안에** 끝낸다. 단, 광고법 가드 없이는 1장 30원이 페널티 30만원이 된다.

세 가지 원칙:

1. **순서 > 디자인.** 같은 카피·이미지여도 순서 바꾸면 전환율 무너진다.
2. **데이터 > 감.** 모든 카피·이미지 결정에 측정 가능한 근거가 있어야 한다.
3. **봉사 > 자랑.** 셀러가 모르는 광고법·어뷰징·검색 페널티를 자동화가 막아준다.

---

## 1. 모바일 상세페이지의 물리적 제약

상세페이지의 80%는 모바일에서 본다. 데스크탑 기준으로 만들면 망한다.

| 제약 | 수치 | 영향 |
|---|---|---|
| 모바일 폭 (네이버 스마트스토어 PC 미러) | **750px 고정** | 이미지 기본 폭 = 750px, 권장 가로 = 860px (HiDPI) |
| 한 화면(1 viewport) 세로 | **약 1,334px (iPhone 평균)** | 한 섹션이 1.0–1.5 viewport 안에 끝나야 스크롤 이탈 막음 |
| 한 줄 본문 글자수 (모바일 14pt) | **약 19–22자** | 헤드라인 15자, 서브 25자는 이 제약에서 나온 숫자 |
| 이미지 로딩 권장 무게 | **장당 ≤ 200KB** | 10장 = 2MB 이내. 초과 시 첫 로딩 이탈 |
| 첫 화면 노출 (Above the Fold) | **상단 750–900px** | 섹션 1 후킹은 이 안에 전부 들어가야 한다 |
| 스크롤 깊이 50% 도달율 | **평균 35–45%** | 섹션 4(USP) 이후 살아남는 사람만 구매 후보 |
| 스크롤 깊이 100% 도달율 | **평균 8–15%** | CTA 섹션 직격으로 안 보고 사는 사람이 다수 |

**전략적 결론:**

- **상단 3섹션(후킹·문제·솔루션)에 전환의 50% 이상 책임.** 여기 시각·카피 다 박아라.
- **CTA를 마지막에만 두지 마라.** 섹션 4 끝, 섹션 6 끝에 인라인 CTA 배너 1줄 추가. (`옵션 보러 가기 →` 식)
- **이미지 압축**은 자동화 필수. 원본 PNG → WebP 80% 변환 → 200KB 이하.
- **세로 길이 권장 = 12,000–18,000px.** 너무 짧으면 가치 의심, 너무 길면 이탈.

---

## 2. 상세페이지 표준 구조 — 8섹션 위→아래 설득 순서

| # | 섹션 | 푸는 시청자 질문 | 평균 매수 | 평균 픽셀 (세로) |
|---|---|---|---|---|
| 1 | **메인 후킹 (커버)** | "이게 뭐고 왜 다른가" | 1 | 1,000–1,500 |
| 2 | **문제 제기 (페인포인트)** | "내 얘기인가" | 1–2 | 1,500–2,500 |
| 3 | **솔루션 소개** | "이게 그 문제를 푸나" | 1 | 1,000–1,500 |
| 4 | **핵심 특징 (USP 3–5개)** | "왜 다른 상품 말고 이거인가" | 3–5 | 3,000–5,500 |
| 5 | **신뢰 증명 (데이터·인증·리뷰)** | "증거 있나" | 1–2 | 1,500–2,500 |
| 6 | **사용 시나리오** | "내가 쓰면 어떤 모습인가" | 1–2 | 1,500–2,500 |
| 7 | **FAQ + 우려 해소** | "마지막 망설임" | 1 | 1,200–1,800 |
| 8 | **마지막 CTA** | "사야 하나" | 1 | 800–1,200 |
| 합계 | | | **10–14장** | **12,500–19,000px** |

### 왜 이 순서인가 — 3개 카피 프레임 결합

> **AIDA(주의→흥미→욕구→행동) + PAS(문제→증폭→해결) + FAB(특징→이득→증명)** = 한국 이커머스 전환율이 가장 높게 검증된 합성 순서.

**섹션별 프레임 매핑:**

| 섹션 | AIDA | PAS | FAB |
|---|---|---|---|
| 1 후킹 | **A (Attention)** | — | — |
| 2 문제 | **I (Interest)** | **P (Problem)** | — |
| 3 솔루션 | I → D 전환 | **A (Agitation)** + S (Solution) | — |
| 4 USP | **D (Desire)** | — | **F (Feature)** |
| 5 신뢰 | D 보강 | — | **A (Advantage)** + **B (Benefit)** 증명 |
| 6 시나리오 | D 증폭 | — | **B (Benefit)** 미래 시각화 |
| 7 FAQ | A 직전 회의 차단 | — | — |
| 8 CTA | **A (Action)** | — | — |

순서를 바꾸면 프레임이 깨진다. 예: 신뢰 증명을 솔루션 앞에 두면 "이게 뭔지 모르는데 증거부터?"가 되어 인지 부조화 발생.

---

## 3. LLM 선택 가이드 (섹션별 권장 모델)

| 섹션 | 권장 모델 | 이유 |
|---|---|---|
| 1 후킹 | **Claude Opus 4.7 / GPT-4o** | 짧은 카피에서 단어 선택 정밀도 ↑ |
| 2 문제 제기 | **Claude Sonnet 4.6 / Kimi K2** | 한국 페인포인트 디테일 ↑, 한국 상황 묘사 자연 |
| 3 솔루션 소개 | **Claude Opus 4.7** | 메커니즘 기술 설명 정확도 ↑ |
| 4 USP | **Claude Opus 4.7** | 비교·수치·증명 박는 정확도 핵심 |
| 5 신뢰 증명 | **GPT-4o / DeepSeek** | 데이터 정리·표 생성 강점 |
| 6 사용 시나리오 | **Kimi K2 / Claude Sonnet 4.6** | 한국 일상 컨텍스트 가장 자연 |
| 7 FAQ | **Claude Sonnet 4.6** | 대화체 답변 자연도 + 광고법 회피 균형 |
| 8 CTA | **Claude Opus 4.7** | 짧은 클로징 카피 단정력 |

**비용 최적화:**

- 자동화 파이프라인 표준: **Sonnet 4.6 + Kimi K2 혼합.** Opus 4.7은 4번 USP만 호출.
- 한 상품당 추정 토큰: 입력 3K + 출력 2K. Sonnet 4.6 기준 약 30–50원. Kimi K2는 5–10원.
- 1장 30원 목표 가격에서 카피 비용 비중은 **5원 이하**로 맞춘다. 나머지 25원은 이미지 + 인프라.

---

## 4. 이미지 AI 선택 가이드 (섹션별 권장 모델)

| 섹션 | 권장 모델 | 이유 |
|---|---|---|
| 1 커버 | **Nano Banana (Gemini 2.5 Flash Image) / FLUX 1.1 Pro** | 제품 형태 보존력 + 한국 제품 사진 톤 |
| 2 페인포인트 | **Nano Banana / SDXL** | 한국 일상 컨텍스트 강점, 모델 얼굴 회피 자연 |
| 3 솔루션 | **Nano Banana** | 직전 페인 이미지와 톤 매칭 + 같은 환경 유지 |
| 4 USP (매크로) | **FLUX 1.1 Pro / Midjourney v7** | 소재·표면 디테일 매크로 강점 |
| 5 신뢰 (Before/After) | **★ 실사진 사용 권장, 생성 금지** | 시험성적서·인증은 합성 시 위법 |
| 6 사용 시나리오 | **Nano Banana** | 한국 라이프스타일·인테리어 표현력 |
| 7 FAQ | **Nano Banana (간단한 배경)** | 텍스트 중심 섹션 — 보조 이미지만 |
| 8 CTA | **Nano Banana** | 1번 커버 변주 — 같은 모델 톤 유지 |

**Nano Banana 표준화 이유:**

- **한국 제품 사진 톤 자연** (특히 식품·생활용품)
- **연속 호출 시 톤 일관성** (1번 커버 톤을 8번 CTA까지 유지)
- **레퍼런스 이미지 입력 지원** (실제 상품 사진 → 동일 상품 다른 각도/씬 생성)
- 1장 생성 비용 5–15원 → 1장 30원 목표 안에 들어옴

**FLUX·Midjourney는 USP 매크로 컷에만 선택적으로.** 비용은 비싸지만(장당 30–80원) 그 한 장이 신뢰 결정.

---

## 5. 섹션별 프롬프트 + 전략 (8섹션 풀버전)

각 섹션 블록 구조:
- **목적** — 시청자 머릿속 질문
- **카피 LLM 프롬프트** — 그대로 던지는 템플릿
- **카피 출력 예시** — 모범 답안
- **이미지 AI 프롬프트** — 영문 표준
- **이미지 출력 예시 (서술)** — 통과 기준 시각화
- **통과 기준 (체크리스트)** — 자동 평가 가능한 6–8개 조건
- **흔한 실패 패턴 + 처방**

---

### 섹션 1 · 메인 후킹 (커버)

**목적:** 0.3초 안에 "카테고리 맞고 + 이 상품 다르네"를 인식시키기. Above the Fold 전체 책임.

**카피 LLM 프롬프트 (그대로 복붙):**

```
# 역할
당신은 한국 이커머스 상세페이지 커버 카피라이터다. 표시광고법과 식약처 가이드를 준수한다.

# 입력
- 상품명: {상품명}
- 카테고리: {카테고리}
- 타겟 고객: {고객 1줄, 예: "30대 직장인 여성, 출퇴근 보온병 용도"}
- USP 1순위: {다른 상품과 다른 점 1개, 예: "스테인리스 304 이중벽 12시간 보온"}
- 가격대: {원}
- 톤: {예: 차분한 프리미엄 / 친근한 가성비 / 전문가}

# 출력 (이 형식 그대로, 다른 말 X)
{
  "headline": "...",
  "subheadline": "...",
  "supporting": "..."
}

# 출력 규칙
- headline: 15자 이내, 숫자 1개 포함 권장, 카테고리+USP 둘 다 암시
- subheadline: 25자 이내, USP를 한 문장으로 풀이
- supporting: 40자 이내, 이득 또는 손실 명시 (1줄 보조 카피)
- 상품명 자체는 headline에 박지 않는다 (페이지 상단에 이미 노출)

# 금지 표현 (절대 사용 금지)
"최고", "최강", "유일", "1위", "세계 최초", "100%", "절대", "완치", "치료",
"혁신", "놀라운", "획기적", "당신", "여러분"

# 톤 가이드
- 안티하이프 — 자랑 X, 사실 단정 O
- 한국어 자연 구어 — 직역체 금지
- 형용사 최소화, 명사·동사 중심
```

**카피 출력 예시 (스테인리스 텀블러 600ml):**

```json
{
  "headline": "12시간 그대로",
  "subheadline": "스테인리스 304, 이중벽 진공 단열",
  "supporting": "아침에 담은 커피가 퇴근까지 따뜻합니다"
}
```

**이미지 AI 프롬프트 (Nano Banana / FLUX 표준):**

```
A premium product hero shot of a stainless steel insulated tumbler 600ml,
centered composition, soft natural lighting from upper-left at 45 degrees,
pure off-white background (#F5F5F0), shallow depth of field f/2.8,
photorealistic studio photography, 9:16 vertical or 1:1 square,
product occupies 60% of frame, subtle soft shadow at base,
matte stainless surface with single warm reflection highlight,
no text overlay, no watermark, no human, no hand,
color palette stays neutral with single warm accent,
sharp focus on product, 8K resolution

# Negative prompt
text, watermark, logo, hand, model, deformed, cluttered background,
oversaturated, plastic-looking surface
```

**이미지 출력 예시 (서술):**

> 깨끗한 오프화이트 배경 위에 텀블러가 정중앙. 상단 좌측에서 45도 자연광, 본체 매트 표면에 따뜻한 하이라이트 한 점. 바닥 그림자 부드러움. 인물·손 없음. 상품이 화면의 60%.

**통과 기준 (자동 평가 가능):**

- [ ] headline 15자 이내 (정규식 검사)
- [ ] 금지 표현 0 (사전 매칭)
- [ ] 이미지에서 상품 점유율 ≥ 50% (객체 인식)
- [ ] 인물·손 없음 (객체 인식)
- [ ] 배경 채도 < 0.15 (HSV 분석)
- [ ] 텍스트 오버레이 없음 (OCR)
- [ ] 파일 크기 ≤ 200KB (WebP 80% 변환 후)
- [ ] 모바일 750px 폭에서 1.5초 안에 인식되는가 (수동 검수 또는 시선 추적 시뮬레이션)

**흔한 실패 패턴 + 처방:**

| 실패 | 처방 |
|---|---|
| 헤드라인이 일반론 ("좋은 물병") | 프롬프트에 "숫자 1개 포함 권장" 추가 + USP 1순위 명시 |
| 이미지에 손이 박혀 나옴 | negative prompt에 "hand, human, finger" 추가 |
| 배경이 화려해서 상품이 묻힘 | 프롬프트에 "pure off-white background, minimal" 강조 |
| 상품 색이 과채도 | "matte surface, natural color, no oversaturation" 추가 |

---

### 섹션 2 · 문제 제기 (페인포인트 활성화)

**목적:** "어, 나 이거 있었지" 자기 인식 → 다음 섹션 볼 이유 만들기. PAS 프레임의 P+A.

**카피 LLM 프롬프트:**

```
# 역할
당신은 한국 이커머스 페인포인트 카피라이터다.

# 입력
- 상품: {상품명}
- 타겟 페르소나: {2문장 서술, 예: "30대 직장인 여성, 출퇴근 1시간, 일회용 컵 쓰레기 죄책감"}
- 이 상품이 푸는 핵심 문제: {1줄}
- 가격대: {원}

# 출력 (이 형식 그대로)
{
  "problem_headline": "...",
  "pain_points": [
    {"label": "...", "scene": "..."},
    {"label": "...", "scene": "..."},
    {"label": "...", "scene": "..."}
  ],
  "loss_amplification": "..."
}

# 출력 규칙
- problem_headline: 20자 이내, 의문문 또는 단정문
- pain_points 3개: 각 label 10자 이내, scene 30자 이내, 같은 페르소나가 하루 안에 연속으로 겪는 상황이어야 함
- loss_amplification: 50자 이내, 시간·돈·기회 손실을 숫자로 명시

# 금지
- 공포 마케팅 (병, 죽음, 실명, 사고)
- "당신은 ~ 입니까" 직역체
- 서로 다른 페르소나의 페인을 섞기

# 톤
- 한국 구어체
- 객관 묘사 우선, 감정 단어는 마지막 한 줄에만
```

**카피 출력 예시 (스테인리스 텀블러):**

```json
{
  "problem_headline": "출근길 커피, 도착하면 미지근하죠",
  "pain_points": [
    {"label": "아침 9시", "scene": "갓 내린 커피를 들고 지하철 탑승"},
    {"label": "낮 12시", "scene": "회의 끝나고 마신 커피가 식어 있음"},
    {"label": "퇴근길", "scene": "테이크아웃 컵 또 버리며 죄책감"}
  ],
  "loss_amplification": "1년 일회용 컵 250개, 미지근한 커피로 흘려보낸 카페비 60만원"
}
```

**이미지 AI 프롬프트 (페인 1장):**

```
A relatable Korean commuter scene at morning rush hour,
a person's hand holding a paper takeout coffee cup in a crowded subway,
muted desaturated palette (problem state visual cue),
natural overhead fluorescent lighting,
realistic Korean subway interior context,
no face shown, side angle or back view,
photorealistic, slight grain for authenticity,
1:1 square framing, no text overlay

# Negative prompt
bright cheerful colors, smiling face, posed model, fake setting
```

**이미지 출력 예시 (서술):**

> 채도 낮은 톤. 한국 지하철 내부에서 손에 일회용 종이컵을 든 측면 컷. 얼굴 안 보임. 형광등 약간 차가운 조명. 약간의 그레인.

**통과 기준:**

- [ ] pain_points 3개가 같은 페르소나의 하루 안 연속 상황인가
- [ ] loss_amplification에 숫자 단위(원/회/시간) 있는가
- [ ] 공포 단어 0 (병·죽음·실명·사고)
- [ ] 이미지 채도가 섹션 1 대비 명백히 낮은가 (HSV 분석으로 평균 saturation < 0.4)
- [ ] 이미지에 모델 정면 얼굴 없음
- [ ] 한국 컨텍스트 시각 단서 1개 이상 (지하철·아파트·편의점·한국 가구 등)

**흔한 실패 패턴 + 처방:**

| 실패 | 처방 |
|---|---|
| 페인 3개가 동떨어진 상황 | 프롬프트에 "같은 페르소나의 하루 안 연속" 강조 |
| 너무 강한 공포 카피 | 프롬프트에 "객관 묘사 우선" + 금지어 추가 |
| 이미지에 모델 정면 박힘 | "no face, back view, side angle" 강조 |

---

### 섹션 3 · 솔루션 소개

**목적:** "이 상품이 그 문제를 푸는 도구다"를 한 문장으로 박기. PAS의 S, AIDA의 I→D 전환.

**카피 LLM 프롬프트:**

```
# 역할
당신은 한국 이커머스 솔루션 포지셔닝 카피라이터다.

# 입력
- 상품: {상품명}
- 직전 섹션 문제 헤드라인: {복붙}
- 직전 섹션 페인포인트 3개: {복붙}
- 메커니즘 (어떻게 푸는지 기술적 핵심 1줄): {예: "스테인리스 304 이중벽 + 진공 단열"}
- 검증 가능한 수치 (있으면): {예: "12시간 후 65도 유지"}

# 출력 (이 형식 그대로)
{
  "solution_headline": "...",
  "mechanism": "...",
  "before_after": {"before": "...", "after": "..."}
}

# 출력 규칙
- solution_headline: 25자 이내, "~ 끝납니다" / "~ 됩니다" 단정 1줄, 직전 문제 헤드라인의 거울 문장
- mechanism: 30자 이내, 구체 부품·성분·기술명 박기 (두루뭉술 금지)
- before_after: before와 after 각 20자 이내, 페인 → 결과 직격 비교

# 금지
- "혁신", "특허받은", "유일" 단정 (특허번호 없으면)
- 메커니즘에 "특수한", "신기술" 같은 모호 표현
- 의약품·치료 단정

# 톤
- 단정형 종결어미 (~다, ~됩니다, ~끝납니다)
- 형용사 최소화
```

**카피 출력 예시:**

```json
{
  "solution_headline": "퇴근까지 그대로, 12시간 보온",
  "mechanism": "스테인리스 304 이중벽 진공 단열",
  "before_after": {
    "before": "9시 90도 → 18시 35도",
    "after": "9시 90도 → 18시 65도"
  }
}
```

**이미지 AI 프롬프트:**

```
The same stainless tumbler from cover, now in active use,
held by a hand pouring or sipping in a Korean office setting,
warm bright daylight from large window (signaling solved state),
midshot composition, partial silhouette of person (no full face),
desk visible with laptop and notebook in soft focus,
photorealistic, warmer palette than previous section,
1:1 square framing, no text overlay,
visible steam rising slightly from tumbler opening (showing hot)

# Negative prompt
dim lighting, cold tones, empty scene, posed model, oversaturated
```

**이미지 출력 예시:**

> 같은 텀블러를 사무실 책상 앞에서 부분 실루엣 인물이 들고 있음. 큰 창문에서 따뜻한 자연광. 김 살짝 올라옴. 데스크 위 노트북·노트 흐릿하게. 채도 페인 섹션 대비 명백히 높음.

**통과 기준:**

- [ ] solution_headline이 직전 problem_headline의 거울 문장인가 (의미 대응)
- [ ] mechanism에 구체 부품/성분/기술명 박힘 (정규식 또는 named entity)
- [ ] before_after 양쪽 모두 숫자 단위 박힘
- [ ] 이미지 채도가 섹션 2 대비 평균 saturation 0.15 이상 높은가
- [ ] 모델 정면 얼굴 없음
- [ ] 김·증기·움직임 등 "사용 중" 시각 단서 1개

---

### 섹션 4 · 핵심 특징 (USP 3–5개)

**목적:** "왜 다른 상품 말고 이거여야 하나" 비교 우위. FAB 프레임 F+A+B 본격.

**카피 LLM 프롬프트:**

```
# 역할
당신은 한국 이커머스 USP 비교 카피라이터다.

# 입력
- 상품: {상품명}
- 상품 사양 풀 덤프: {긴 리스트 OK}
- 경쟁 상품 또는 카테고리 평균: {1줄}
- 인증·시험성적서 (있으면): {리스트}
- USP 개수: {3 또는 5, 기본 3}

# 출력 (이 형식 그대로)
{
  "usp_count": 3,
  "usps": [
    {
      "rank": 1,
      "label": "...",
      "description": "...",
      "evidence": "...",
      "image_focus": "..."
    },
    ...
  ]
}

# 출력 규칙
- USP 개수는 3 또는 5 (홀수가 인식상 안정)
- 가장 강한 USP는 rank 1, 두 번째 강한 USP는 마지막 rank (수미상관)
- 각 USP는 서로 다른 축이어야 함 (소재·기능·사이즈·안전·편의 중 다른 축 선택)
- label: 10자 이내, 명사형 또는 숫자형
- description: 30자 이내
- evidence: 측정 가능한 수치·인증·비교·시험 결과 중 1개. 없으면 USP 채택 X
- image_focus: 이미지 매크로 컷에서 강조할 부위·소재 1줄 (영문 권장)

# 금지
- 같은 USP를 다른 단어로 두 번 (예: "튼튼함"·"내구성")
- 증거 없는 USP (evidence 비어 있으면 그 USP 빼라)
- "느낌", "고급스러운", "프리미엄한" 류 추상 형용사
```

**카피 출력 예시 (텀블러 USP 3개):**

```json
{
  "usp_count": 3,
  "usps": [
    {
      "rank": 1,
      "label": "스테인리스 304",
      "description": "식품 안전 등급, 녹·부식 차단",
      "evidence": "KC 식품안전 인증, 시험성적서 첨부",
      "image_focus": "extreme macro of brushed stainless 304 surface with engraved mark"
    },
    {
      "rank": 2,
      "label": "이중벽 진공",
      "description": "외벽 결로 0, 손에 차갑지 않음",
      "evidence": "10도 음료 60분 외벽 결로 0g (자체 측정)",
      "image_focus": "cross-section cutaway showing double wall vacuum gap"
    },
    {
      "rank": 3,
      "label": "12시간 보온",
      "description": "아침 90도 → 저녁 65도",
      "evidence": "KS 보온 시험 12시간 65도, 시험성적서 첨부",
      "image_focus": "thermometer reading 65°C next to tumbler at 9 hour mark"
    }
  ]
}
```

**이미지 AI 프롬프트 (USP당 1장 매크로 컷):**

```
# USP 1 — 스테인리스 304
Extreme macro photography of a brushed stainless steel surface
showing fine grain texture and a small "304" stamp engraving,
sharp focus on the engraved mark, blurred edges, neutral cool lighting,
no fingerprints, no reflections of objects, premium product photography style,
1:1 square framing, photorealistic 8K

# USP 2 — 이중벽 진공
A clean cross-section technical illustration of a tumbler showing
double wall construction with vacuum gap between inner and outer walls,
3D rendered cutaway view, neutral background, soft technical lighting,
labels removed (will overlay in post), 1:1 framing

# USP 3 — 12시간 보온
Close-up of the tumbler beside a digital thermometer reading 65.0°C,
hands not visible, neutral kitchen counter, warm soft lighting,
shallow depth of field, photorealistic, 1:1 framing
```

**통과 기준:**

- [ ] USP 개수가 3 또는 5
- [ ] 모든 USP에 evidence 있음 (빈 칸 0)
- [ ] USP들이 서로 다른 축 (label 임베딩 유사도 < 0.7)
- [ ] rank 1과 마지막 rank가 가장 강한 USP 2개
- [ ] 각 매크로 이미지가 해당 image_focus를 시각화하는가
- [ ] 추상 형용사 단어 빈도 0 ("느낌", "고급", "프리미엄")

**흔한 실패 패턴 + 처방:**

| 실패 | 처방 |
|---|---|
| USP 5개인데 2개가 중복 | usp_count를 3으로 줄여라. 부풀린 5개보다 정직한 3개가 강하다 |
| evidence가 "고객 만족도 99%" 류 무근거 | 출처 명시 안 되면 evidence로 인정 X. 출처 없으면 USP 빼라 |
| 매크로 이미지가 평범한 풀샷 | image_focus 프롬프트에 "extreme macro", "shallow DOF" 명시 |

---

### 섹션 5 · 신뢰 증명 (Before/After · 데이터 · 인증 · 리뷰)

**목적:** "증거 있나" 회의감 차단. FAB의 A(Advantage) + B(Benefit) 증명.

**카피 LLM 프롬프트:**

```
# 역할
당신은 한국 이커머스 신뢰 증명 카피라이터다.

# 입력
- 상품: {상품명}
- 가용 증명 자료 (있는 것만):
  - 시험성적서: {파일 있음/없음, 측정 항목}
  - 인증 마크: {KC, KS, FDA, ISO 등}
  - 자체 측정 데이터: {Before/After 수치}
  - 실제 리뷰: {복붙 또는 캡처 경로}
  - 판매 실적: {수량, 기간, 출처}

# 출력 (이 형식 그대로)
{
  "trust_headline": "...",
  "evidence_blocks": [
    {"type": "before_after|certification|measurement|review", "label": "...", "value": "...", "source": "..."},
    ...
  ],
  "guarantee": "..."
}

# 출력 규칙
- trust_headline: 20자 이내, "측정했습니다" / "기록입니다" 류 단정
- evidence_blocks: 3개 이상. 각 블록에 source 필수
- source 없는 블록은 만들지 마라 (입력에 없으면 빼라)
- guarantee: 환불·교환·A/S 중 실제 정책 그대로

# 금지
- "고객님들이 사랑하는" 류 무근거 사회 증명
- 출처 없는 숫자
- 합성 인증서·합성 시험성적서 (생성 X, 실물 첨부만)

# 톤
- 데이터 단정형
- 출처를 카피 자체에 박을 것
```

**카피 출력 예시:**

```json
{
  "trust_headline": "12시간, 직접 측정한 결과",
  "evidence_blocks": [
    {
      "type": "measurement",
      "label": "12시간 보온 성능",
      "value": "9시 90.0°C → 21시 65.2°C",
      "source": "자체 측정 / 실온 22°C / 디지털 온도계 PT100"
    },
    {
      "type": "certification",
      "label": "식품안전 인증",
      "value": "KC 식품안전 통과",
      "source": "KC 인증번호 KCS-1234-2026"
    },
    {
      "type": "before_after",
      "label": "외벽 결로",
      "value": "기존 텀블러 12g vs 본품 0g (60분 후)",
      "source": "10°C 음료 / 자체 측정 / 무게 측정 ±0.1g"
    }
  ],
  "guarantee": "수령 후 7일 내 단순 변심 환불, 1년 무상 A/S"
}
```

**이미지 AI 프롬프트:**

```
※ 시험성적서·인증서·리뷰는 실제 이미지 사용. 생성 금지.

# 자체 측정 시각화 (Before/After)
Split layout comparing two thermometers,
left half: thermometer reading 90.0°C labeled "9 AM",
right half: thermometer reading 65.2°C labeled "9 PM",
identical framing both sides, neutral background,
clean product photography style, 1:1 framing,
no other text — labels overlaid in post
```

**통과 기준:**

- [ ] evidence_blocks 모두 source 있음 (빈 칸 0)
- [ ] 인증·시험성적서 이미지는 실물 (합성 생성 0)
- [ ] guarantee가 실제 운영 정책과 일치
- [ ] 무근거 사회 증명 단어 0 ("고객님들이 사랑하는" 등)
- [ ] 숫자에 단위 + 측정 조건 박힘

---

### 섹션 6 · 사용 시나리오

**목적:** "내가 쓰는 미래" 머릿속 시각화. FAB의 B(Benefit) 증폭.

**카피 LLM 프롬프트:**

```
# 역할
당신은 한국 이커머스 사용 시나리오 카피라이터다.

# 입력
- 상품: {상품명}
- 타겟 페르소나: {2문장}
- 주요 사용 맥락 3개: {예: 아침 출근 / 사무실 점심 / 주말 카페}

# 출력 (이 형식 그대로)
{
  "scenarios": [
    {"time_label": "...", "scene": "...", "emotion": "..."},
    {"time_label": "...", "scene": "...", "emotion": "..."},
    {"time_label": "...", "scene": "...", "emotion": "..."}
  ]
}

# 출력 규칙
- 3개 시나리오는 시간·상황이 모두 달라야 함
- time_label: 10자 이내 (예: "아침 8시", "점심 12시", "주말 카페")
- scene: 60자 이내, 행동 동사 중심
- emotion: 1단어 (편안함, 깔끔함, 자유로움, 만족 등)

# 금지
- "당신은 ~ 할 수 있습니다" 직역체
- 과장 감정 단어 ("인생이 바뀝니다", "감동", "황홀")
- 시나리오 3개 변주 (같은 상황 살짝 바꾸기)

# 톤
- 한국 구어
- 객관 행동 묘사 우선, 감정은 마지막 1단어에만
```

**카피 출력 예시:**

```json
{
  "scenarios": [
    {
      "time_label": "아침 8시",
      "scene": "지하철에서 갓 내린 커피를 한 모금 마시고 책 한 페이지",
      "emotion": "여유"
    },
    {
      "time_label": "점심 1시",
      "scene": "회의 끝나고 책상에서 따뜻한 차로 머리 식히기",
      "emotion": "회복"
    },
    {
      "time_label": "주말 카페",
      "scene": "원두 사서 집에서 직접 내려 텀블러에 담고 산책",
      "emotion": "자유로움"
    }
  ]
}
```

**이미지 AI 프롬프트 (시나리오당 1장):**

```
# 시나리오 1 — 아침 8시 지하철
Korean morning subway commute scene, partial side view of a person
holding a stainless tumbler and a book, soft warm window light,
realistic Seoul subway interior, no face fully shown,
candid moment, warm palette, photorealistic, 1:1 framing

# 시나리오 2 — 점심 사무실
Modern Korean office desk, hand holding the tumbler near laptop,
afternoon soft natural light, plants on desk, photorealistic,
warm calm palette, no posed model, 1:1 framing

# 시나리오 3 — 주말 카페→산책
Lifestyle outdoor walking scene in a Korean park,
back view of person holding tumbler, autumn afternoon golden light,
fallen leaves on path, photorealistic, warm palette, 1:1 framing
```

**통과 기준:**

- [ ] 시나리오 3개의 time_label이 모두 다른가
- [ ] scene에 행동 동사 ≥ 2개
- [ ] emotion 단어가 과장 표현 0
- [ ] 이미지에 모델 정면 얼굴 0
- [ ] 한국 컨텍스트 시각 단서 (지하철·사무실·공원) 명확
- [ ] 이미지 톤이 섹션 5와 자연스럽게 이어지는가

---

### 섹션 7 · FAQ + 우려 해소

**목적:** 구매 직전 마지막 망설임 5개를 선제 답변으로 제거.

**카피 LLM 프롬프트:**

```
# 역할
당신은 한국 이커머스 반박 처리 카피라이터다.

# 입력
- 상품: {상품명}
- 가격대: {원}
- 흔한 구매 직전 우려 (있으면): {복붙}
- 실제 환불/A/S 정책: {복붙}

# 출력 (이 형식 그대로)
{
  "faqs": [
    {"q": "...", "a": "..."},
    {"q": "...", "a": "..."},
    {"q": "...", "a": "..."},
    {"q": "...", "a": "..."},
    {"q": "...", "a": "..."}
  ]
}

# 출력 규칙 (Q 순서 고정)
- Q1 가격 정당화: "왜 이 가격인가"
- Q2 품질 불안: "정말 ~ 인가요"
- Q3 호환/사이즈: "내 환경·체형에 맞나"
- Q4 사용 난이도: "초보도 가능한가"
- Q5 환불·A/S: "문제 생기면"
- 각 Q는 1줄 (30자 이내)
- 각 A는 2줄 이내 (60자 이내)

# 금지
- "절대", "100%", "확실히" 단정 (분쟁 시 책임)
- 환불·A/S 실제 정책과 다른 답변
- "고객 만족도 99%" 류 무근거 사회 증명

# 톤
- 친근한 구어, 격식 X
- 답변에 구체 수치·기간·조건 박을 것
```

**카피 출력 예시 (텀블러 FAQ):**

```json
{
  "faqs": [
    {
      "q": "다른 텀블러도 있는데 왜 이 가격인가요?",
      "a": "스테인리스 304는 식품 안전 등급입니다. 일반 201 등급보다 부식·녹 차단이 강해요. KC 인증서로 등급 확인 가능합니다."
    },
    {
      "q": "12시간 보온, 정말 끝까지 따뜻한가요?",
      "a": "실온 22도에서 9시 90도 음료가 21시 65.2도로 측정됐어요. 시험성적서 첨부드립니다."
    },
    {
      "q": "차에 컵홀더에 들어가나요?",
      "a": "직경 70mm로 일반 차량 컵홀더(73mm) 들어갑니다. 텀블러 입구는 50mm로 빨대 사용 가능해요."
    },
    {
      "q": "분리 세척이 어렵지 않나요?",
      "a": "뚜껑은 3단 분리, 식기세척기 가능합니다. 본체는 손세척 권장이에요."
    },
    {
      "q": "고장 나면요?",
      "a": "수령 후 7일 내 단순 변심 환불 가능합니다. 1년 무상 A/S, 그 이후는 부품 유상 교환이에요."
    }
  ]
}
```

**이미지 AI 프롬프트:**

```
※ FAQ 섹션은 텍스트 중심. 보조 이미지 1장.
Soft neutral background with the tumbler subtly placed bottom-right,
generous negative space in upper-left for text overlay,
warm minimal palette, no people,
calm trustworthy mood, no decorations,
photorealistic, 1:1 framing
```

**통과 기준:**

- [ ] FAQ 5쌍 (가격·품질·호환·난이도·환불 5축)
- [ ] 답변에 "절대", "100%", "확실히" 0
- [ ] 환불·A/S 답변이 실제 정책과 일치 (수동 검증)
- [ ] 각 답변에 구체 수치 또는 조건 1개 이상
- [ ] 무근거 사회 증명 0

---

### 섹션 8 · 마지막 CTA

**목적:** 결정 직전 1mm 푸시. 옵션 가이드 + 보장 안내 + 사실 기반 마지막 동기.

**카피 LLM 프롬프트:**

```
# 역할
당신은 한국 이커머스 클로징 카피라이터다.

# 입력
- 상품: {상품명}
- 옵션 (있으면): {색·사이즈·세트 등}
- 보장 정책: {1줄}
- 사실 기반 한정 요소 (있으면): {예: "신상품 출시 기념 5월 한정 1,000개"}

# 출력 (이 형식 그대로)
{
  "cta_headline": "...",
  "option_guide": "...",
  "guarantee": "...",
  "final_push": "..."
}

# 출력 규칙
- cta_headline: 15자 이내, 행동 동사 단정 ("담아두세요", "지금 선택하세요" 류 자연 표현, 느낌표 0)
- option_guide: 옵션별 누구에게 맞는지 한 줄 가이드
- guarantee: 환불·교환 한 줄
- final_push: 사실인 한정·재고·할인만. 가짜 긴급성 금지

# 금지
- 느낌표 폭격 ("!!!", "★★★")
- 가짜 한정 ("오늘만!" — 사실이 아니면 X)
- 가짜 재고 ("마지막 3개" — 사실이 아니면 X)
- 가짜 할인가 (정상가 부풀려서 X)

# 톤
- 차분한 단정형
- 결정을 강요하지 않고 도와주는 톤
```

**카피 출력 예시:**

```json
{
  "cta_headline": "두 가지 색에서 골라보세요",
  "option_guide": "매트 블랙 — 출근용 / 아이보리 — 카페 산책용",
  "guarantee": "수령 후 7일 내 단순 변심 환불 가능",
  "final_push": "5월 신상 출시 기념, 양각 이니셜 각인 무료 (5월 31일까지)"
}
```

**이미지 AI 프롬프트:**

```
Final hero shot of the tumbler in 3/4 angle (different from cover's straight-on),
both color options laid out side by side, matte black on left, ivory on right,
identical lighting, off-white background,
soft top-down light, no harsh shadows,
photorealistic, premium product photography,
1:1 framing, plenty of breathing space
```

**통과 기준:**

- [ ] cta_headline에 느낌표 0
- [ ] final_push가 사실 (가짜 한정·재고·할인 0, 수동 검증)
- [ ] option_guide가 옵션별 사용자 페르소나 매칭
- [ ] guarantee가 실제 정책과 일치
- [ ] 이미지 각도가 커버와 다른가 (3/4 권장)

---

## 6. 카테고리별 섹션 가중치 + 카테고리 전용 프롬프트 오버라이드

같은 8섹션이라도 카테고리마다 무게중심이 다르다. **약한 섹션을 빼지 말고, 강한 섹션을 2장으로 늘려라.**

### 6.1 가중치 표

| 카테고리 | 강화 섹션 | 약화 섹션 | 추가 필수 |
|---|---|---|---|
| **식품·건강식품** | 5 신뢰(원료·시험성적서) ×3장, 7 FAQ ×2 | 6 시나리오 ×1 | 원료 원산지 표, 영양성분표, 알레르기 |
| **화장품·뷰티** | 5 신뢰(Before/After) ×3, 4 USP(성분) ×5 | 3 솔루션 ×1 | 전성분, 임상 시험 결과, 피부 타입 매칭 |
| **디지털·가전** | 4 USP(스펙) ×5, 7 FAQ(호환·AS) ×2 | 2 문제 ×1 | 스펙표, 호환 OS 표, 보증 기간 |
| **패션·잡화** | 6 시나리오(착장) ×3, 4 USP(소재) ×4 | 5 신뢰 ×1 | 사이즈표, 모델 핏감, 소재 비율 |
| **생활용품·주방** | 1 후킹(Before/After 미니) ×2, 6 시나리오 ×2 | 5 신뢰 ×1 | 사이즈·재질·세척 방법 |
| **유아·반려** | 5 신뢰(안전 인증) ×3, 7 FAQ(주의사항) ×2 | 4 USP ×3 | 안전 인증(KC, ASTM), 연령 권장, 사용 주의 |
| **가구·인테리어** | 6 시나리오(공간 매칭) ×3, 4 USP(소재) ×4 | 5 신뢰 ×1 | 사이즈 그림, 조립 가이드, 배송 |
| **건강·운동** | 5 신뢰(임상·인증) ×3, 7 FAQ ×2 | 6 시나리오 ×1 | 의료기기 등급, 사용 금기, 효능 표현 한계 |

### 6.2 카테고리 전용 프롬프트 오버라이드 (식품 예시)

식품·건강식품 카테고리는 식약처 가이드가 가장 빡빡하다. 다음 라인을 모든 식품 카피 프롬프트 끝에 박는다:

```
# 식품·건강식품 추가 금지 표현
- 질병 예방·치료·완치 단정 일체 금지
- "혈관 청소", "면역 강화", "독소 배출", "암 예방" 단정 금지
- "다이어트 효과" 단정 금지 (체중 감량 비교 가능, 효과 단정 X)
- 임상 결과 인용 시 "OO대학 연구 결과" 등 출처 정확히 박을 것
- 일반 식품에 의약품 효능 단정 절대 금지

# 식품 필수 추가 정보
- 원료 원산지 (국가명 명시)
- 영양 성분표 (100g 또는 1회분 기준)
- 알레르기 유발 가능 원료 표시
- 보관 방법 + 유통기한
```

### 6.3 카테고리 전용 프롬프트 오버라이드 (화장품 예시)

```
# 화장품 추가 금지 표현
- 의약품 효능 단정 ("주름 제거", "기미 완치") 금지
- "최초", "유일", "1위" 무근거 사용 금지
- 임상 결과는 시험 기관·피험자 수·기간 명시 필수
- "100% 천연", "무방부제" 검증 없이 단정 금지

# 화장품 필수 추가 정보
- 전성분 (식약처 고시 표기법)
- 임상 시험 결과 (있을 경우 출처 명시)
- 피부 타입 권장 (지성·건성·복합성·민감성)
- 사용 순서·주의사항
```

### 6.4 카테고리 전용 프롬프트 오버라이드 (유아·반려 예시)

```
# 유아·반려 추가 금지 표현
- "100% 안전", "절대 안전" 금지
- 의료 효능 단정 금지 (특히 반려동물 사료·간식)
- 인증 마크 사용 시 인증번호 표기 필수

# 유아·반려 필수 추가 정보
- 안전 인증 (KC, ASTM F963, EN71, ISO 8124 등)
- 연령 권장 + 사용 금기 연령
- 사용 주의사항 (질식·삼킴·과민반응 등)
- 재질 정밀 표기 (BPA-Free, 프탈레이트-Free 등)
```

---

## 7. 컬러·타이포·간격 시스템 (S-001 디자인 시스템 계승)

상세페이지 전체에 일관된 디자인 시스템을 적용한다. S-001 영상 디자인과 톤 일치.

### 7.1 컬러 토큰

| 토큰 | HEX | 역할 | 사용 섹션 |
|---|---|---|---|
| `BG_LIGHT` | `#FFFFFF` | 기본 배경 (밝은 톤) | 1, 3, 6, 8 |
| `BG_MUTED` | `#F5F5F0` | 부드러운 배경 | 4, 7 |
| `BG_DARK` | `#0F0F0F` | 다크 강조 배경 (페인 또는 어뷰징 경고) | 2, 5 일부 |
| `TEXT_PRIMARY` | `#1A1A1A` | 본문 (밝은 배경 위) | 본문 |
| `TEXT_INVERSE` | `#F5F5F5` | 본문 (다크 배경 위) | 다크 섹션 |
| `TEXT_MUTED` | `#707070` | 부가·캡션 | 출처·주석 |
| `ACCENT_PRIMARY` | `#FF3B30` | 강조 (USP·신뢰 수치) | 4, 5 |
| `ACCENT_SECONDARY` | `#34E0C0` | 정답·해결 표시 | 3, 6 |
| `WARNING` | `#FFB800` | 주의 (FAQ·법적 안내) | 7 |

**색 규칙:**

- 빨강(`ACCENT_PRIMARY`) = 강조·중요·수치 하나만
- 민트(`ACCENT_SECONDARY`) = 해결 상태·정답
- 한 섹션에 빨강+민트 동시 사용 금지 (대비 컷 제외)
- 한 상세페이지에 ACCENT 사용 빈도 ≤ 8회

### 7.2 타이포 시스템

| 용도 | 폰트 | 크기 | 자간 | 사용처 |
|---|---|---|---|---|
| 헤드라인 | Pretendard ExtraBold | 48–72pt | -2% | 섹션 1, 3 헤드라인 |
| 서브헤드라인 | Pretendard SemiBold | 28–36pt | -1% | 서브 카피 |
| 본문 | Pretendard Regular | 22–28pt | 0% | 모든 본문 |
| 강조 숫자 | SF Pro Display ExtraBold | 64–120pt | -3% | 가격·수치·% |
| 캡션·출처 | Pretendard Light | 16–20pt | 0% | 신뢰 섹션 출처 |
| FAQ Q | Pretendard SemiBold | 24–28pt | 0% | FAQ Q |
| FAQ A | Pretendard Regular | 20–24pt | 0% | FAQ A |

### 7.3 간격 시스템 (8pt base)

| 간격 | 픽셀 | 사용처 |
|---|---|---|
| `xs` | 8px | 인라인 요소 간 |
| `sm` | 16px | 본문 행간 |
| `md` | 32px | 컴포넌트 간 |
| `lg` | 64px | 섹션 내 블록 간 |
| `xl` | 128px | 섹션 간 |

섹션 간 간격을 충분히 두지 않으면 모바일에서 어디서 끝나고 어디서 시작하는지 모른다. **xl(128px) 간격은 절대 줄이지 마라.**

---

## 8. 프롬프트 작성 9원칙

자동화 파이프라인에서 모든 섹션 프롬프트가 따라야 할 원칙.

1. **카테고리 명시 우선** — 첫 줄에 카테고리 박지 않으면 LLM이 일반론으로 답한다.
2. **출력 형식 JSON 고정** — 자유 산문 받아먹지 못한다. JSON 스키마 강제.
3. **금지 표현 명시** — "최고/최강/유일/100%/절대" 등을 프롬프트에 직접 박는다. LLM 기본 톤이 광고법 위반을 자주 낸다.
4. **이미지·카피 색 톤 동기화** — 페인 섹션 채도 낮춤, 솔루션 채도 높임. 명시 안 하면 톤 뒤죽박죽.
5. **모델 정면 얼굴 회피** — 저작권 + 고객 자기 투영. 부분·뒷모습·실루엣 위주.
6. **숫자에는 단위 + 출처** — "12시간" 박을 때 "측정 조건"까지 강제.
7. **섹션 간 연결 참조** — 직전 섹션 핵심 단어를 다음 섹션 첫 문장에 1개 반복 (연결감).
8. **카테고리 오버라이드 추가** — 식품·화장품·유아 등 가이드 빡빡한 카테고리는 별도 라인 끝에 추가.
9. **반복 호출에서 톤 일관성 유지** — 1번 커버 톤을 8번 CTA까지 유지하려면 system prompt에 "이 시리즈는 ~ 톤" 고정 명시.

---

## 9. 광고법·식약처·전자상거래법 가드 (★ S-002 학습 반영)

상세페이지는 네이버 쇼핑 적합도뿐 아니라 **표시광고법·식약처 가이드·전자상거래법**에 모두 걸린다. 자동화로 1장 30원에 찍어도 한 줄 잘못 들어가면 페널티 + 환불 분쟁 + 계정 정지.

### 9.1 절대 금지 표현 (전 카테고리 공통)

| 금지 표현 | 적용 법령 | 페널티 |
|---|---|---|
| "최고", "최강", "유일", "1위", "세계 최초" (인증 없을 시) | 표시광고법 제3조 (부당 광고) | 시정명령 + 과징금 |
| "100%", "절대", "확실히" 단정 효능 | 표시광고법 | 동일 |
| 의약품·치료·완치·예방 단정 (일반 식품·화장품) | 식약처 가이드 | 영업정지 + 과태료 |
| 경쟁사 비방 카피 | 표시광고법 (비방 광고) | 시정명령 |
| 가짜 한정·가짜 재고 | 전자상거래법 (기만적 표시) | 시정명령 + 과태료 |
| 가짜 할인가 (정상가 부풀려서) | 전자상거래법 | 동일 |
| 의료기관·전문가 무단 이름·로고 사용 | 의료광고법 | 형사 처벌 가능 |
| 인증 마크 무단 도용 | 표시광고법 + 사기죄 | 형사 + 행정 |
| 임상 결과 출처 없이 인용 | 식약처·광고법 | 시정명령 |
| 마누태그 복붙으로 무관 브랜드/제조사 박기 | 네이버 어뷰징 (S-002) | 노출 차단·퇴점 |

### 9.2 모든 LLM 프롬프트 끝에 박는 공통 가드 라인

```
# 한국 광고법 준수
표시광고법, 식약처 가이드, 전자상거래법을 위반하는 표현을 절대 사용하지 마라.
다음 단어·표현은 인증/근거가 없으면 절대 사용 금지:
"최고", "최강", "유일", "1위", "세계 최초", "100%", "절대", "확실히",
"완치", "치료", "예방", "안전 보장", "면역 강화", "독소 배출", "효과 보장".
경쟁사 비방, 가짜 한정·재고·할인, 무단 인증 사칭 일체 금지.
```

### 9.3 compliance_filter 모듈 책임

자동화 파이프라인의 `compliance_filter`는 다음 단계로 작동:

1. **정규식 1차 필터** — 위 금지 단어 사전 매칭 → 발견 시 reject
2. **LLM 2차 더블 체크** — 1차 통과 카피를 별도 LLM 호출에 "이 카피가 한국 광고법 위반인가" 질의
3. **카테고리별 추가 필터** — 식품·화장품·유아·의료기기 카테고리는 식약처 사전 추가
4. **수동 검수 큐** — 2차도 통과한 카피 중 high-risk 키워드(예: "효과", "효능", "개선") 포함 시 사람 검수 큐로

→ 셀러는 광고법 모른다. 그게 봉사 톤의 본질이다. **자동화는 셀러를 광고법에서 보호해야 한다.**

---

## 10. 자동화 파이프라인 모듈 매핑 (불사자 기준)

| 모듈 | 입력 | 처리 | 출력 |
|---|---|---|---|
| `section_planner` | 상품명·카테고리·USP 풀 덤프·가격 | 8섹션 매수 + 카테고리 가중치 반영 | `plan.json` (섹션 리스트 + 매수) |
| `copy_generator` | `plan.json` + 섹션별 프롬프트 템플릿 | LLM 호출 (섹션별 적합 모델) | `copy.json` (섹션별 카피 구조) |
| `image_prompt_builder` | `copy.json` + 섹션별 이미지 프롬프트 템플릿 | 카피 핵심 단어 → 영문 이미지 프롬프트 변환 | `image_prompts.json` |
| `image_generator` | `image_prompts.json` | Nano Banana / FLUX 호출 (섹션별) | 섹션별 PNG 묶음 |
| `compliance_filter` | `copy.json` | 정규식 + LLM 2차 + 카테고리 사전 | `copy_filtered.json` (위반 시 reject + 사람 검수 큐) |
| `image_compressor` | PNG 묶음 | WebP 80% 변환 + 200KB 이하 보장 | `images_optimized/` |
| `layout_composer` | `copy_filtered.json` + `images_optimized/` + 디자인 토큰 | HTML 또는 단일 긴 이미지 합성 | `detail_page.html` 또는 `detail_page.jpg` |
| `seo_tagger` | `copy_filtered.json` + 카테고리 + 마누태그 데이터 (S-002) | 상품명·태그·제조사·브랜드 필드 추천 | `seo_recommendations.json` |
| `quality_scorer` | 최종 페이지 | 11번 루브릭 자동 평가 | 점수 + 통과/재시도 |

**Critical path:**

```
section_planner → copy_generator → compliance_filter → image_prompt_builder → image_generator → image_compressor → layout_composer → quality_scorer
                                          ↓
                                   사람 검수 큐 (필요 시)
```

`compliance_filter`는 절대 우회 옵션을 만들지 마라. 셀러 요청이라도 막아라.

---

## 11. 품질 자동 평가 루브릭

생성된 상세페이지에 대해 자동 점수 0–100점 매김. 70점 미만은 재생성.

| 평가 항목 | 만점 | 측정 방법 |
|---|---|---|
| 섹션 매수 정확성 | 5 | 카테고리 가중치 매수와 일치 |
| 헤드라인 글자수 준수 | 5 | 정규식 글자수 검사 |
| 금지 표현 0 | 15 | compliance_filter 통과 |
| 숫자에 출처 박힘 | 10 | 정규식 "출처/측정/기준" 검색 |
| 이미지 상품 점유율 ≥ 50% | 5 | 객체 인식 |
| 이미지에 모델 정면 얼굴 0 | 5 | 객체 인식 |
| 이미지 채도 흐름 (페인 ↓ → 솔루션 ↑) | 5 | HSV 분석 |
| 이미지 압축 ≤ 200KB | 5 | 파일 크기 |
| 페이지 세로 길이 12,000–19,000px | 5 | 픽셀 측정 |
| 섹션 간 간격 ≥ 128px | 5 | 픽셀 측정 |
| 카테고리 필수 정보 누락 0 | 10 | 카테고리별 사전 매칭 (예: 식품 = 원산지, 영양표) |
| FAQ 5축 다 덮음 | 5 | 사전 매칭 |
| 옵션 가이드 명확성 | 5 | LLM 평가 |
| 톤 일관성 (1번 ↔ 8번) | 5 | 임베딩 유사도 |
| 모바일 로딩 시뮬레이션 ≤ 3초 | 10 | 합성 이미지 무게 + 가상 4G |

**자동 재생성 정책:**

- 70점 미만 → 전체 재생성
- 80점 이상 → 통과
- 70–79점 → 약한 섹션만 부분 재생성

---

## 12. A/B 테스트 프레임워크

상세페이지 1버전으로 끝내지 마라. 매 상품마다 2버전 동시 생성 → 7일 광고 동시 노출 → 전환율 비교 → 승자 채택.

### 12.1 A/B 변수 (한 번에 1개만 바꿔라)

| 테스트 라운드 | A | B | 측정 |
|---|---|---|---|
| 1차 | 헤드라인 (Q형 질문) | 헤드라인 (D형 손실 경고) | CTR |
| 2차 | 1번 커버 이미지 (정면 컷) | 1번 커버 이미지 (3/4 컷) | 스크롤 깊이 |
| 3차 | USP 3개 | USP 5개 | 페이지 체류 시간 |
| 4차 | Before/After 위치 (섹션 5) | Before/After 위치 (섹션 1 후킹 안) | 전환율 |
| 5차 | CTA 헤드라인 ("담아두세요") | CTA 헤드라인 ("지금 선택") | 클릭률 |

### 12.2 측정 지표

| 지표 | 정의 | 목표 |
|---|---|---|
| CTR (광고→상세페이지) | 클릭 / 노출 | 1.5% 이상 |
| 스크롤 깊이 50% | 페이지 절반까지 본 비율 | 40% 이상 |
| 스크롤 깊이 100% | CTA까지 본 비율 | 12% 이상 |
| 페이지 체류 시간 | 평균 페이지 머무름 | 60초 이상 |
| 전환율 (방문 → 결제) | 결제 / 페이지 방문 | 카테고리 평균 +20% |

### 12.3 통계적 유의성

- 표본 크기: 한 버전당 최소 1,000 방문 (광고 7일 정도)
- 신뢰도: 95% (p-value < 0.05)
- 작은 표본에서 큰 차이 보이면 추가 7일 더 측정 후 결정

---

## 13. End-to-End 워크드 예제 — 스테인리스 텀블러 600ml

자동화 파이프라인이 한 상품을 처음부터 끝까지 어떻게 통과시키는지 전체 시연.

### 13.1 입력

```json
{
  "product_name": "스테인리스 텀블러 600ml",
  "category": "생활용품·주방",
  "target_persona": "30대 직장인 여성, 출퇴근 1시간, 일회용 컵 죄책감",
  "usps_raw": ["스테인리스 304", "이중벽 진공", "12시간 보온", "외벽 결로 0", "차량 컵홀더 호환"],
  "price": 29900,
  "guarantee": "수령 후 7일 단순 변심 환불, 1년 무상 A/S",
  "certifications": ["KC 식품안전 KCS-1234-2026", "KS 보온 시험성적서"],
  "measurements": {"9_am_temp_c": 90.0, "21_pm_temp_c": 65.2}
}
```

### 13.2 section_planner 출력

```json
{
  "sections": [
    {"num": 1, "type": "hook", "image_count": 1},
    {"num": 2, "type": "problem", "image_count": 1},
    {"num": 3, "type": "solution", "image_count": 1},
    {"num": 4, "type": "usp", "image_count": 3, "usp_count": 3},
    {"num": 5, "type": "trust", "image_count": 1},
    {"num": 6, "type": "scenario", "image_count": 3},
    {"num": 7, "type": "faq", "image_count": 1},
    {"num": 8, "type": "cta", "image_count": 1}
  ],
  "total_images": 12,
  "category_weights_applied": "생활용품·주방 = 후킹 강화 + 시나리오 강화"
}
```

### 13.3 copy_generator 출력 (압축)

```json
{
  "section_1": {
    "headline": "12시간 그대로",
    "subheadline": "스테인리스 304, 이중벽 진공 단열",
    "supporting": "아침에 담은 커피가 퇴근까지 따뜻합니다"
  },
  "section_2": {
    "problem_headline": "출근길 커피, 도착하면 미지근하죠",
    "pain_points": [
      {"label": "아침 9시", "scene": "갓 내린 커피를 들고 지하철 탑승"},
      {"label": "낮 12시", "scene": "회의 끝나고 마신 커피가 식어 있음"},
      {"label": "퇴근길", "scene": "테이크아웃 컵 또 버리며 죄책감"}
    ],
    "loss_amplification": "1년 일회용 컵 250개, 미지근한 커피로 흘려보낸 카페비 60만원"
  },
  "section_3": {
    "solution_headline": "퇴근까지 그대로, 12시간 보온",
    "mechanism": "스테인리스 304 이중벽 진공 단열",
    "before_after": {"before": "9시 90도 → 18시 35도", "after": "9시 90도 → 18시 65도"}
  },
  "section_4": "(섹션 4 풀버전은 위 USP 예시 참조)",
  "section_5": "(섹션 5 풀버전은 위 신뢰 예시 참조)",
  "section_6": "(섹션 6 풀버전은 위 시나리오 예시 참조)",
  "section_7": "(섹션 7 풀버전은 위 FAQ 예시 참조)",
  "section_8": {
    "cta_headline": "두 가지 색에서 골라보세요",
    "option_guide": "매트 블랙 — 출근용 / 아이보리 — 카페 산책용",
    "guarantee": "수령 후 7일 내 단순 변심 환불 가능",
    "final_push": "5월 신상 출시 기념, 양각 이니셜 각인 무료 (5월 31일까지)"
  }
}
```

### 13.4 compliance_filter 결과

```json
{
  "verdict": "PASS",
  "checks": {
    "regex_blacklist": "PASS (금지 단어 0)",
    "llm_secondary": "PASS",
    "category_dictionary": "PASS (생활용품 카테고리 별도 가드 없음)",
    "high_risk_words": "NONE"
  }
}
```

### 13.5 image_prompt_builder 출력 (섹션 1 예시)

```
A premium product hero shot of a matte black stainless steel insulated tumbler 600ml,
centered composition, soft natural lighting from upper-left at 45 degrees,
pure off-white background (#F5F5F0), shallow depth of field f/2.8,
photorealistic studio photography, 1:1 square,
product occupies 60% of frame, subtle soft shadow at base,
matte stainless surface with single warm reflection highlight,
no text overlay, no watermark, no human, no hand,
sharp focus on product, 8K resolution

# Negative prompt
text, watermark, logo, hand, model, deformed, cluttered background,
oversaturated, plastic-looking surface
```

### 13.6 quality_scorer 결과

```json
{
  "score": 86,
  "breakdown": {
    "section_count_accuracy": 5,
    "headline_length": 5,
    "forbidden_words_zero": 15,
    "numbers_with_source": 9,
    "product_share_50pct": 5,
    "no_model_face": 5,
    "saturation_flow": 5,
    "image_compression": 5,
    "page_height": 5,
    "section_spacing": 5,
    "category_required_info": 9,
    "faq_5_axes": 5,
    "option_guide_clarity": 4,
    "tone_consistency": 5,
    "mobile_load_3s": 0
  },
  "deductions": [
    "category_required_info: 사이즈 그림 누락 (-1)",
    "mobile_load_3s: 이미지 총 무게 2.4MB로 3초 초과 (-10)",
    "option_guide_clarity: 옵션별 가이드는 명확하나 사이즈 옵션 누락 (-1)",
    "numbers_with_source: 60만원 손실 숫자에 출처 약함 (-1)"
  ],
  "verdict": "PASS (재생성 불필요)",
  "actions": [
    "이미지 압축 강화 → WebP 70%로 재인코딩",
    "섹션 4 끝에 사이즈 그림 1장 추가 (수동 또는 별도 생성)"
  ]
}
```

### 13.7 최종 산출물

```
detail_page_stainless_tumbler_600ml/
├── plan.json
├── copy.json
├── copy_filtered.json
├── image_prompts.json
├── images_raw/
│   ├── section_1_hero.png
│   ├── section_2_pain.png
│   ├── ...
├── images_optimized/
│   ├── section_1_hero.webp  (180KB)
│   ├── section_2_pain.webp  (165KB)
│   ├── ...
├── detail_page.html
├── detail_page.jpg  (단일 긴 이미지 합성본, 750px × 14,200px)
├── seo_recommendations.json  (상품명·태그·제조사·브랜드 추천)
└── quality_report.json
```

### 13.8 비용 합산

| 항목 | 단가 | 매수 | 합계 |
|---|---|---|---|
| LLM 카피 (Sonnet 4.6 + Kimi K2 혼합) | 8개 섹션 | 1상품 | ~5원 |
| LLM compliance_filter (Sonnet 4.6 2차) | 1회 | 1상품 | ~3원 |
| 이미지 생성 (Nano Banana 12장) | 10원/장 | 12장 | ~120원 |
| 이미지 압축·합성·렌더 | 인프라 | 1상품 | ~2원 |
| **합계** | | | **약 130원** |

→ 1장 30원 목표는 **상세페이지 1장 기준 = 12장 묶음**에서 평균. 위 예제는 약 130원 / 12장 = **장당 10.8원**으로 목표 안.

---

## 14. 다음 작업 + S-003 영상 후보

### 14.1 다음 자동화 작업

- [ ] `compliance_filter` 금지 표현 사전 구축 (카테고리별 50개+)
- [ ] `quality_scorer` 자동 평가 항목 코드 구현 (객체 인식 + OCR + HSV 분석)
- [ ] 카테고리 자동 분류 모델 (상품명 → 카테고리 + 가중치)
- [ ] 마누태그 패널(S-002) 데이터를 `seo_tagger`에 연결
- [ ] A/B 테스트 자동 분기 시스템 (두 버전 동시 생성 → 광고 분기 → 측정)
- [ ] 모바일 로딩 시뮬레이션 (가상 4G + LCP 측정)

### 14.2 S-003 영상 후보 (커머스 하우제로 채널)

**후보 A — 순서 강조형:**
> 제목: "상세페이지 디자인 아니에요. 8섹션 순서가 전부입니다"
> 핵심: AIDA + PAS + FAB 합성 순서 = 한국 이커머스 표준. 디자인 안 예뻐도 순서만 맞으면 전환율.

**후보 B — 광고법 경고형 (S-002 어뷰징 톤 계승):**
> 제목: "AI로 상세페이지 만들 때 광고법 모르면 1장 30원이 페널티 30만원 됩니다"
> 핵심: 자동화 + compliance_filter. 표시광고법·식약처·전자상거래법 금지 단어 + 카테고리별 가드.

**후보 C — 실데이터 비교형:**
> 제목: "같은 상품, 상세페이지 8섹션 vs 12섹션 — 전환율 데이터 까봤습니다"
> 핵심: A/B 프레임워크. 짧으면 가치 의심, 너무 길면 이탈. 12장 묶음이 평균 베스트인 이유.

**후보 D — 카테고리 가중치형:**
> 제목: "식품 상세페이지에 시나리오 박지 마세요 (대신 이걸 박으세요)"
> 핵심: 카테고리별 섹션 가중치 + 식약처 가드.

벤치마크 문서(`2026-05-13-howzero-commerce-benchmark.md`) 기준 후보 B가 가장 강함 (경고/역발상 + 실패 스토리 결합). 후보 D는 카테고리 셀러 동시 캡처로 retention 강함.

vidIQ 검증 후 결정.

---

## 부록 A · 프롬프트 빠른 복사용 (자동화 코드 임베드용)

### A.1 system prompt (모든 섹션 공통 prefix)

```
당신은 한국 이커머스 상세페이지 자동화 시스템의 카피 생성 모듈이다.
모든 출력은 JSON으로만 반환한다. 한국 표시광고법, 식약처 가이드, 전자상거래법을 준수한다.
다음 표현은 인증/근거가 없으면 절대 사용 금지:
"최고", "최강", "유일", "1위", "세계 최초", "100%", "절대", "확실히",
"완치", "치료", "예방", "안전 보장", "면역 강화", "독소 배출", "효과 보장".
한국어 자연 구어 톤을 유지하고 직역체("당신은 ~ 입니다")를 사용하지 않는다.
```

### A.2 user prompt 템플릿 (섹션 N용)

```
[섹션 {N}: {섹션명}]

상품: {상품명}
카테고리: {카테고리}
타겟: {페르소나}
직전 섹션 핵심: {직전 카피 핵심 단어 1–2개}

{섹션별 본 프롬프트 본문 — 위 5번 참조}

# 출력
{JSON 스키마 강제}
```

---

## 부록 B · 참고 자료

- 표시광고법 (공정거래위원회)
- 식약처 식품·화장품 표시·광고 가이드라인
- 전자상거래법 (소비자보호)
- 네이버 쇼핑 검색 SEO 가이드 — 적합도·인기도·신뢰도
- S-001 도입부 대본: `brands/howzero/howzero_script/S-001-commerce-intro-ai-detail-page.md`
- S-002 마누태그 대본: `brands/howzero/howzero_script/S-002-commerce-smartstore-manutag.md`
- 벤치마크 분석: `docs/strategy/2026-05-13-howzero-commerce-benchmark.md`
- 불사자 키워드 패널 (마누태그 탭): `bulsaja-issue/tmp/keyword-panel-preview`
