---
name: carousel
description: 인스타그램/소셜미디어 카드뉴스 캐러셀을 HTML로 생성하고 Puppeteer로 1080x1440 PNG로 자동 추출합니다. 주제만 주면 8~10장 캐러셀을 동적으로 만들어냅니다.
---

# 카드뉴스 캐러셀 생성 스킬

인스타그램/소셜미디어용 카드뉴스 캐러셀을 생성합니다.
주제와 내용을 받아서 HTML 슬라이드를 만들고, Puppeteer로 1080x1440 @2x PNG를 자동 추출합니다.

---

## 워크플로우

### Step 0: 맥락 수집 (작업 전 필수)

콘텐츠를 만들기 전에 반드시 다음을 확인한다:

1. **브랜드 결정** — 어떤 브랜드인지 파악하고 해당 프리셋 파일을 읽는다:

   | 키워드 | 브랜드 | 프리셋 파일 |
   |--------|--------|------------|
   | `howzero`, `하우제로` | 하우제로 | `brands/howzero.md` + `docs/persona-howzero.md` |
   | `braveyong`, `용감한용팀장`, `용팀장` | 용감한용팀장 | `brands/braveyong.md` |
   | 그 외 | 사용자에게 톤/브랜드 질문 | — |

2. **캐러셀 포맷 결정** — 5가지 포맷 중 어떤 것인지 파악 (아래 참조)
3. **사용자에게 질문** — 아래 항목 중 모르는 것이 있으면 먼저 질문:
   - 타겟 오디언스
   - 톤 (직설적/친근한/전문적)
   - 핵심 메시지 / CTA
   - 레퍼런스 자료
4. **콘텐츠가 충분히 주어진 경우** — 질문 없이 바로 구성 시작 가능

**브랜드별 디자인 토큰(배경색, 폰트, 색상, 형광펜, CTA 등)은 각 프리셋 파일에 정의되어 있다. 반드시 해당 파일을 읽고 그대로 적용할 것.**

> "맥락 없이 시작하는 디자인은 항상 나쁜 디자인으로 이어진다" — Claude Design System Prompt

### Step 1: 입력 소스 결정 (독립 모드 중 택 1)

콘텐츠를 **어디서 가져올지** 먼저 정한다. 각 모드는 독립적으로 동작하며 서로 결합하지 않는다. 하나를 선택해서 끝까지 밀어붙인다.

| 모드 | 언제 사용 | 전처리 | 프레임 자산 |
|------|----------|--------|-------------|
| **A. Text** (기본) | 사용자가 주제/내용을 직접 줄 때 | 없음. 바로 Step 2. | 없음 (텍스트 전용) |
| **B. NotebookLM** | 사용자가 NotebookLM 노트북 링크 + 질문을 줄 때 | `/Users/zerowater/.local/bin/notebooklm --storage <state> use <partial-id>` → `ask "질문"` → 답변 저장 | 없음 (텍스트 전용) |
| **C. YouTube** | 사용자가 유튜브 URL을 줄 때 | `python3 -m scripts.yt_highlights "<URL>" --out <dir>` → `highlights.json` + `frames/` 생성 | `frames/h01_f01.jpg` 등 각 하이라이트당 2장 |

**중요**: 모드를 섞지 말 것. 예를 들어 "YouTube 영상 + 내 메모"를 한 캐러셀에 넣고 싶다면, 각각 별도 캐러셀을 만들어서 **결과를 나란히 두고 사용자가 고르게 한다**. 통합은 하지 않는다.

### Step 2: 포맷 결정 & 콘텐츠 구성

5가지 포맷(아래) 중 고르고 슬라이드 수(8~10장) 결정.

**모드 C(YouTube)의 경우 추가 규칙**:
- `highlights.json`의 상위 spans를 슬라이드 후보로 매핑
- 각 하이라이트의 `transcript[]`를 해당 슬라이드 본문 재료로 사용
- **프레임 사용 방식 3가지 (택 1)**:
  - **배경 모드**: `background-image: url('frames/h0X_f01.jpg')` + 어두운 오버레이 + 흰 텍스트
  - **인라인 모드**: 슬라이드 상단 절반에 이미지, 하단에 텍스트 (저작권 명확한 자막 인용)
  - **참고 모드**: 이미지는 쓰지 않고 자막만 재료로 쓰고, 마지막 슬라이드에 "원본 영상 링크" 고지
- **저작권 경고**: YouTube 프레임은 2차 저작물. 배경/인라인 모드를 상업 콘텐츠에 사용할 경우 원저작권자 표기 또는 허락 확인. 애매하면 참고 모드로.

### Step 3: HTML 생성

아래 디자인 시스템에 따라 `slides.html` 생성.

### Step 4: PNG 추출

`capture.mjs`로 각 슬라이드를 개별 PNG로 추출. 슬라이드 수 자동 감지.

### Step 5: Finder 열기

`open {폴더}`로 결과물 확인.

---

## 캐러셀 5가지 포맷

콘텐츠 성격에 따라 가장 적합한 포맷을 선택한다:

| 포맷 | 설명 | 예시 |
|------|------|------|
| **Comparison** | Bad vs Good 비교 | "남들 vs 하우제로" |
| **Tutorial** | 단계별 방법 설명 | "AI 퀄리티 높이는 5가지 규칙" |
| **Native** | "나는 이걸 했다 + 배운 것들" | "10억 달성까지의 여정" |
| **Compilation** | 궁극의 가이드/리스트 | "2026 최고의 AI 툴 모음" |
| **Story** | 개인 스토리텔링 | "번아웃 후 다시 시작한 이야기" |

---

## 10장 프레임워크 (기본 구조)

@marketingharry 850K 팔로워, 2500+ 캐러셀 기반 프레임워크:

| # | 역할 | 구성 | 필수 |
|---|------|------|------|
| 1 | **Stop the scroll** | 스크롤을 멈추게 하는 강력한 훅. 중앙 정렬. | ✅ |
| 2 | **Hook confirmation** | 왜 이걸 읽어야 하는지 확인. 권위/숫자/약속. | ✅ |
| 3-4 | **Build interest** | 예시/스크린샷으로 흥미 구축 | 선택 |
| 5-6 | **Retain attention** | 다이어그램/비주얼/비교로 주의 유지 | 선택 |
| 7-8 | **Practical info** | 실용적 정보/팁/방법론 제공 | 선택 |
| 9 | **Simple CTA** | 심플한 행동 유도 (저장/공유/팔로우) | ✅ |
| 10 | **CTA with photo** | 본인 사진 + 1개 액션 | 선택 |

### 동적 결정 로직

```
내용 포인트가 5개 이하 → 8장 (필수 3장 + 내용 5장)
내용 포인트가 6~7개 → 9장
내용 포인트가 8개 이상 → 10장

리스트형 (규칙 5개 등) → 커버 + 훅확인 + 항목당 1장 + CTA
스토리형 → 커버 + 훅확인 + 스토리 전개 + CTA
비교형 → 커버 + 훅확인 + VS + 실용팁 + CTA
```

### 3종류 슬라이드

모든 슬라이드는 아래 3가지 중 하나:

- **Hook Slides (1-2장)** — 훅 + 훅 확인. 다음으로 밀게 만드는 것이 목적
- **Value Slides (3-8장)** — 텍스트 적게, 비주얼 많게. 실질적 가치 전달
- **CTA Slides (9-10장)** — 본인 사진 슬롯 + 단 1개 액션

### 슬라이드 1 (HOOK) 전용 규칙 — 스크롤을 멈추게 하는 공식

**밋밋하면 즉시 탈락.** 슬라이드 1은 설명이 아니라 **명치 때리기**다.

권장 훅 공식 5가지:

| 공식 | 예시 |
|------|------|
| **① 숫자 공격** | "90%가 퇴출된다" / "1,000개로 잘렸다" |
| **② 선언형 도발** | "구매대행, 진짜 끝났다" / "가짜는 가고 진짜만 남는다" |
| **③ 반전 예고** | "X가 터졌다. 근데 나는 오히려 좋다" |
| **④ 위협 + 날짜** | "6.2 전에 이거 안 하면 매출 0" |
| **⑤ 질문 폭탄** | "왜 다들 스토어를 지울까?" / "광고 보고 고소당했다?" |

**금지 훅 (절대 쓰지 말 것):**
- ❌ "X에 대한 설명"
- ❌ "오늘의 팁 3가지"
- ❌ "~하는 방법"
- ❌ 완화된 표현 ("아마", "~일지도", "참고로")
- ❌ 반전/해결책을 훅에서 다 터트리는 것 (2페이지 이후로 미뤄라)

**시각 규칙:**
- Headline 사이즈 최소 100px 이상 (1080 폭 기준)
- 한 줄에 핵심 단어 1-2개만
- HERO 레이아웃 고정 (풀블리드 이미지 + 하단 다크 블록)
- 상단에 **빨간 불릿(●) + 작은 날짜/숫자 태그**로 긴급감 추가

> "1번이 안 먹으면 2번은 보이지 않는다." — 캐러셀 1번 법칙

---

## 디자인 시스템

### 슬라이드 기본

- 크기: **`1080px × 1440px`** (3:4 비율 — 인스타 캐러셀 최적)
- 배경: `#F5F3EE` (크림색)
- 패딩: `80px 80px 120px`
- 다크 슬라이드(CTA 등): `#1a1a1a`

### 커버 세이프존

인스타 피드에서 잘리지 않도록 핵심 텍스트는 세이프존 안에:

```
상단: 180px
하단: 180px
좌측: 50px
우측: 120px
```

커버(1장) 슬라이드의 제목/부제는 반드시 이 영역 안에 배치.

### 폰트 규칙: 2+1 시스템

**메인 2개 (디자인 핵심):**

| 역할 | 폰트 | 사이즈 | 용도 |
|------|------|--------|------|
| **Headline** | `Nanum Pen Script` | 78-96px | 제목, callout, 큰 숫자, 브랜드명 |
| **Body** | `Noto Sans KR 700` | 30-42px | 설명, 통계 라벨, VS 항목 |

**보조 1개 (귓속말 전용):**

| 역할 | 폰트 | 사이즈 | 용도 |
|------|------|--------|------|
| **Whisper** | `Gaegu 700` | 28-32px | 회색 사이드 코멘트, 부연 설명 |

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Gaegu:wght@400;700&family=Noto+Sans+KR:wght@400;700;900&display=swap
```

### 색상 규칙: 3색 시스템

| 역할 | 색상 | 용도 |
|------|------|------|
| **Background** | `#F5F3EE` | 크림색 배경 |
| **Text** | `#1a1a1a` | 제목/본문 |
| **Accent** | 형광펜 하이라이트 | 강조 (연두/핑크/레몬/초록/파랑 순환) |

다크 슬라이드: Background `#1a1a1a`, Text `#fff`, Accent `#FFE082`

### 형광펜 하이라이트 (삐뚤빼뚤 효과)

**하이라이트만 삐뚤빼뚤하게. 나머지 요소는 반듯하게 정렬 유지.**

```css
/* 연두 */
.hl-y {
  background: linear-gradient(170deg, transparent 10%, #d4f59c 15%, #c6ef72 50%, #d4f59c 85%, transparent 90%);
  padding: 2px 10px; display: inline;
  box-decoration-break: clone; -webkit-box-decoration-break: clone;
}
/* 핑크 */
.hl-p {
  background: linear-gradient(168deg, transparent 8%, #f8b4b4 14%, #f5a0a0 50%, #f8b4b4 86%, transparent 92%);
  padding: 2px 10px; display: inline;
  box-decoration-break: clone; -webkit-box-decoration-break: clone;
}
/* 레몬 */
.hl-lemon {
  background: linear-gradient(172deg, transparent 10%, #fff176 16%, #ffee58 50%, #fff176 84%, transparent 90%);
  padding: 2px 10px; display: inline;
  box-decoration-break: clone; -webkit-box-decoration-break: clone;
}
/* 초록 */
.hl-g {
  background: linear-gradient(169deg, transparent 10%, #c6ef72 15%, #aee55c 50%, #c6ef72 85%, transparent 90%);
  padding: 2px 10px; display: inline;
  box-decoration-break: clone; -webkit-box-decoration-break: clone;
}
/* 파랑 */
.hl-b {
  background: linear-gradient(171deg, transparent 10%, #b3e5fc 15%, #81d4fa 50%, #b3e5fc 85%, transparent 90%);
  padding: 2px 10px; display: inline;
  box-decoration-break: clone; -webkit-box-decoration-break: clone;
}
```

하이라이트 색상은 슬라이드마다 순환: 연두 → 핑크 → 레몬 → 초록 → 파랑

### 레이아웃 요소

**callout 박스:**
```css
.callout {
  background: #fff; border: 3px solid #1a1a1a; border-radius: 6px;
  padding: 32px 40px; margin-top: 32px;
}
.callout-text {
  font-family: 'Nanum Pen Script', cursive; font-size: 42px; color: #1a1a1a; line-height: 1.4;
}
```

**통계 카드:**
```css
.stat-card {
  background: #fff; border: 3px solid #1a1a1a; border-radius: 6px;
  padding: 32px; text-align: center;
}
.stat-num { font-family: 'Nanum Pen Script', cursive; font-size: 72px; }
.stat-label { font-family: 'Noto Sans KR', sans-serif; font-size: 20px; font-weight: 700; color: #888; }
```

**VS 비교:**
```css
.vs-header.bad { background: linear-gradient(168deg, transparent 8%, #f8b4b4 14%, #f5a0a0 50%, #f8b4b4 86%, transparent 92%); }
.vs-header.good { background: linear-gradient(172deg, transparent 8%, #c6ef72 14%, #aee55c 50%, #c6ef72 86%, transparent 92%); }
```

**코드/템플릿 블록:**
```css
.code-block {
  background: #1a1a1a; border-radius: 8px; padding: 32px 36px; margin-top: 24px;
  font-family: 'Courier New', monospace; font-size: 21px; color: #e0e0e0;
  line-height: 1.6; white-space: pre-wrap;
}
```

**금지 목록 (ban-list):**
```css
.ban-item {
  display: flex; align-items: center; gap: 16px;
  background: #fff; border: 2px solid #e0e0e0; border-radius: 6px; padding: 20px 24px;
}
.ban-x { font-family: 'Nanum Pen Script', cursive; font-size: 36px; color: #e53935; }
.ban-text { font-family: 'Noto Sans KR', sans-serif; font-size: 28px; font-weight: 700; }
```

**규칙 번호 (배경 워터마크):**
```css
.rule-num {
  font-family: 'Nanum Pen Script', cursive; font-size: 160px; color: rgba(0,0,0,0.06);
  position: absolute; top: 20px; right: 60px; line-height: 1;
}
```

**사진 슬롯 (CTA용):**
```css
.photo-slot {
  width: 200px; height: 200px; border-radius: 50%;
  background: #e0e0e0; border: 4px solid #1a1a1a;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Gaegu', cursive; font-size: 24px; color: #999;
  margin: 0 auto 24px;
}
```

**하단 (모든 슬라이드 공통):**
```html
<div class="footer">
  <span class="handle">@howzero</span>
  <div class="page-num">{N}</div>
  <div class="arrow-next">→ SVG</div>  <!-- 마지막 슬라이드에서는 생략 -->
</div>
```

### 귓속말 코멘트 (각 슬라이드에 1개씩)

Gaegu 폰트, 회색(#999), 30px. 본문 아래에 사이드 코멘트로 친근한 톡 느낌.
핵심 메시지를 보완하는 한 줄 코멘트.

---

## AI 안티패턴 금지 (Claude Design 시스템 프롬프트 기반)

> "Avoid AI slop tropes" — Claude Design System Prompt

### 절대 하지 말 것

| 금지 항목 | 이유 |
|----------|------|
| 그라디언트 배경 남발 | AI가 만든 티의 대표 징후 |
| 이모지 남발 | 전문성 떨어져 보임 |
| 둥근 모서리 + 왼쪽 색깔 보더 카드 | AI 100% 패턴 |
| AI가 직접 그린 SVG 일러스트 | 퀄리티 낮음 |
| Inter / Roboto / Arial 폰트 | 뻔해 보임 |
| 빈 공간을 장식으로 채우기 | 여백은 디자인의 일부 |
| 불필요한 아이콘/통계 숫자 | 모든 요소는 존재 이유가 있어야 함 |
| 슬라이드당 메시지 2개 이상 | 1슬라이드 = 1메시지 |

### 반드시 할 것

- 단색 배경 (`#F5F3EE`) 또는 다크 (`#1a1a1a`)
- 텍스트와 여백으로 구조 잡기
- 2+1 폰트 시스템만 사용
- 3색 시스템만 사용
- 하이라이트는 형광펜 gradient
- Value Slides는 텍스트 적게, 비주얼 많게

> "하나를 넣기 위해 천 개를 거절하라" — Claude Design System Prompt

---

## 레이아웃 변주 규칙

**단조로움은 캐러셀의 최대 적.** 슬라이드마다 텍스트·이미지 배치를 적극적으로 바꾼다.

### 6가지 레이아웃 풀 (이미지 있는 슬라이드)

| 코드 | 이름 | 구조 | 언제 쓰나 |
|------|------|------|----------|
| **L1** | TOP | 상단 이미지(16:9) + 하단 텍스트 | 기본 톱-헤비. 너무 많이 쓰지 말 것 |
| **L2** | HERO | 이미지 풀블리드 + 하단 다크 영역에 큰 타이틀 | 1번(훅), 10번(CTA) 권장 |
| **L3** | SIDE | 좌(60%) 이미지 / 우(40%) 텍스트 — 또는 반대 | 인물 샷, 실제 화면 캡처 |
| **L4** | BOTTOM | 상단 큰 타이틀 + 하단 이미지 | 숫자·슬로건 먼저 읽히게 하고 싶을 때 |
| **L5** | SANDWICH | 텍스트 → 이미지 → 텍스트 | 인용문 + 근거 화면 |
| **L6** | OVERLAY | 이미지 풀블리드 + 화면 중앙 흰 박스에 텍스트 | 시각적 임팩트 최대화 |

### 텍스트 전용 슬라이드 풀

- **STAT** (통계 카드 3개) · **VS** (2열 비교) · **CHECKLIST** (번호 리스트) · **QUOTE** (큰 인용구) · **FORMULA** (수식/before→after 박스) · **BAN-LIST** (금지 목록)

### 배치 규칙

1. **슬라이드 1 = L2(HERO)**, **슬라이드 10 = L2(HERO)** 로 고정 (앵커)
2. **중간 (2~9)**:
   - **연속 2장 같은 레이아웃 금지** (L1 다음 L1 불가)
   - **L1(TOP) 비율 ≤ 40%** — 너무 쉽게 가지 말 것
   - **텍스트 전용 슬라이드 최소 1~2장** 섞기 (숨 쉴 틈)
   - **시각적 무게 교차**: 무거운(HERO/OVERLAY) 장 뒤에는 가벼운(TOP/STAT) 장
3. **하이라이트 색상**도 슬라이드마다 순환 (붉은/골드/다크)

### 추천 시퀀스 (10장 기본)

```
1: HERO            ← 훅
2: SIDE (인물)     ← 권위 + stat
3: STAT / FORMULA  ← 숫자
4: L4 BOTTOM       ← 룰 설명
5: L6 OVERLAY      ← 반전/기회 (비주얼 임팩트)
6: L5 SANDWICH     ← 2단계 설명
7: L1 TOP          ← 실전 팁 1
8: L3 SIDE         ← 실전 팁 2 (화면 캡처)
9: CHECKLIST       ← to-do
10: HERO           ← CTA
```

이대로 복사할 필요는 없고, 콘텐츠에 맞춰 풀에서 고르되 **연속 중복 금지 + L1 과사용 금지**만 지켜라.

---

## PNG 추출 스크립트

`capture.mjs` — 슬라이드 수 자동 감지:

```javascript
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });

const htmlPath = resolve(__dirname, 'slides.html');
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

const slideCount = await page.$$eval('[id^="slide-"]', els => els.length);

for (let i = 1; i <= slideCount; i++) {
  const slide = await page.$(`#slide-${i}`);
  await slide.screenshot({
    path: resolve(__dirname, `slide-${i}.png`),
    type: 'png',
  });
  console.log(`✅ slide-${i}.png`);
}

console.log(`\n🎉 ${slideCount}장 전체 생성 완료!`);
await browser.close();
```

---

## 실행 절차

1. 출력 폴더 결정 (기본: `docs/content/carousel-{주제}/`)
2. 폴더에 `package.json` + `puppeteer` 설치 여부 확인 (없으면 설치)
3. `slides.html` 생성 (1080x1440, 슬라이드 수는 내용에 따라 8~10장)
4. `capture.mjs` 생성 (없으면)
5. `node capture.mjs` 실행
6. `open {폴더}` 로 Finder 열기

---

## 중요 규칙 요약

- **맥락 먼저**: 브랜드 가이드/페르소나를 먼저 읽고 시작
- **포맷 먼저**: 5가지 포맷 중 가장 적합한 것 선택
- **질문 먼저**: 모르는 정보가 있으면 만들기 전에 질문
- **3:4 (1080x1440)**: 인스타 캐러셀 최적 비율
- **커버 세이프존**: 상하 180px, 좌 50px, 우 120px
- **10장 프레임워크**: 훅 → 훅확인 → 흥미 → 주의유지 → 실용정보 → CTA
- **3종 슬라이드**: Hook / Value / CTA
- **2+1 폰트**: Headline(Nanum Pen Script) + Body(Noto Sans KR) + Whisper(Gaegu)
- **3색**: Background + Text + Accent(형광펜)
- **형광펜만 삐뚤빼뚤**: gradient 각도로. 나머지 반듯하게
- **귓속말 필수**: 모든 슬라이드에 Gaegu 코멘트 1개씩
- **AI 안티패턴 금지**: 그라디언트, 이모지, 둥근카드, 기본폰트, 빈공간 채우기 금지
- **빼기 우선**: 1슬라이드 = 1메시지. 여백은 디자인의 일부
- **레이아웃 변주**: 연속 3장 같은 레이아웃 금지
- **마지막은 다크 CTA**: 다크 배경 + 1개 액션
- **브랜드 프리셋 필수**: `brands/` 폴더에서 해당 브랜드 프리셋을 읽고 디자인 토큰 적용
- **하우제로**: `brands/howzero.md` + `docs/persona-howzero.md`
- **용감한용팀장**: `brands/braveyong.md` (붉은/골드 Accent, Black Han Sans Headline)
