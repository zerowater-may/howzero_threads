# mkt (마케터스 클럽) 스타일 프리셋

인스타그램 `@mkt.co.kr` 마케팅 인사이트 포스팅 스타일을 재현하기 위한 프리셋.
브랜드가 아닌 **스타일** 선택지로도 쓸 수 있다 — "브루탈 미니멀 마케터" 톤.

## 기본 정보

- **핸들**: @mkt.co.kr
- **분야**: 마케터 인사이트, 조직 학습, 실무 사례
- **한 줄 소개**: 연차 쌓인 마케터가 스스로를 의심하는 순간에 꺼내드는 실무 인사이트.
- **톤앤매너**: 정갈한 존댓말. 도발 없음. 공감 → 문제 제기 → 해법. 조용한 자신감.
- **레퍼런스 공동체**: 샤크니자, 아모레퍼시픽, 직방 등 실무 조직 사례 인용

## 타겟 오디언스

- 3~10년 차 마케터 (의심·회의감 구간)
- "감각"만으로 판단하기 어려워진 중간 관리자
- 인사이트 공유 모임(인사이트 위크)에 관심 있는 프로

## 디자인 토큰

| 요소 | 값 |
|------|------|
| **배경색 (본문)** | `#ECECEC` (밝은 회색) |
| **배경색 (커버)** | 흑백 풀블리드 사진 (`filter: grayscale(1)`) |
| **다크 배경** | `#1a1a1a` |
| **텍스트** | `#1a1a1a` |
| **본문 보조** | `#333` ~ `#555` |
| **액센트 (유일한 컬러)** | `#FF5A1F` (주황) — **불릿 점으로만 사용** |
| **로고 워터마크** | `rgba(0,0,0,0.08)` |
| **Headline 폰트** | `Pretendard Black, 'Noto Sans KR 900'` |
| **Body 폰트** | `Pretendard Medium, 'Noto Sans KR 500'` |
| **Bold 강조** | `Pretendard Bold, 'Noto Sans KR 700'` |

### Google Fonts (Pretendard CDN + Noto fallback)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@500;700;900&display=swap" rel="stylesheet">
```

## 규칙 — 무엇을 쓰고 무엇을 쓰지 않는가

### 반드시 할 것
- **주황 불릿 점**: 각 본문 슬라이드 좌측 상단(약 80px, 80px)에 지름 24~28px 원.
- **헤드라인 두께 대비**: Black (900) 헤드라인 + Medium (500) 본문. 두께 대비로 계층 생성.
- **좌측 정렬**: 모든 텍스트 왼쪽 정렬. 중앙 정렬은 커버에서만.
- **여백**: 본문과 본문 사이 1~1.5em 여백. 호흡감 중요.
- **(X) / (O) 대비 패턴**: 2줄 헤드라인으로 "잘못된 방식 (X) / 올바른 방식 (O)" 구조.
- **사진 둥근 모서리**: `border-radius: 8px`. 상단 1/3 영역에 크게 배치.
- **흑백 커버**: 1번 슬라이드는 흑백 인물 사진 + 상단 로고 + 하단 흰 제목.
- **mkt 로고 워터마크**: 본문 슬라이드 좌측 하단에 `opacity: 0.12` 정도로.

### 절대 하지 말 것
| 금지 | 이유 |
|------|------|
| 형광펜 하이라이트 (gradient) | 이 스타일은 순수 타이포/구조로만 승부. 색은 주황 불릿 1점뿐. |
| 용팀장 톤 도발 ("가짜는 가라", "끝났다") | 이 스타일은 조용한 자신감. 반말·위협·과장 금지. |
| 손글씨 폰트 (Nanum Pen Script, Gaegu) | 전문가 톤 저해. 오직 Pretendard/Noto Sans 계열. |
| 여러 액센트 컬러 | 주황 딱 하나. 초록/파랑/노랑 추가 금지. |
| 카드 박스 테두리 과용 | 카드 자체를 되도록 쓰지 말 것. 구조는 여백과 타이포로. |
| 이모지 | 전문성 저해. |

## 공통 컴포넌트 CSS

```css
body {
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  color: #1a1a1a;
}

.slide {
  width: 1080px; height: 1440px;
  background: #ECECEC;
  padding: 80px 80px 140px;
  position: relative;
  overflow: hidden;
}

.slide.cover {
  padding: 0;
  background: #1a1a1a;
  color: #fff;
}

/* 주황 불릿 (본문 슬라이드 좌상단) */
.orange-dot {
  width: 28px; height: 28px; border-radius: 50%;
  background: #FF5A1F;
  margin-bottom: 40px;
}

/* 헤드라인 */
.mkt-head {
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  font-weight: 900;
  font-size: 68px;
  line-height: 1.25;
  letter-spacing: -1.2px;
  margin-bottom: 48px;
}

/* 본문 */
.mkt-body {
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  font-weight: 500;
  font-size: 32px;
  line-height: 1.55;
  color: #2a2a2a;
}
.mkt-body b, .mkt-body strong {
  font-weight: 700;
  color: #1a1a1a;
}
.mkt-body p + p { margin-top: 28px; }

/* 사진 (본문 슬라이드 상단) */
.mkt-photo {
  width: 100%; aspect-ratio: 16 / 10;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 40px;
}

/* 하단 로고 워터마크 */
.mkt-watermark {
  position: absolute;
  bottom: 80px; left: 80px;
  width: 180px; height: auto;
  opacity: 0.12;
  user-select: none;
}
```

## 커버 슬라이드 구조 (L2 HERO 변형)

```html
<div class="slide cover">
  <img src="frames/cover.jpg" class="cover-bg" alt="">
  <!-- 상단 중앙에 작은 로고 -->
  <div class="cover-logo">mkt</div>
  <!-- 하단 흰 제목 -->
  <div class="cover-title">
    스스로를 의심하는<br>
    마케터를 위한 사고법 3
  </div>
</div>

<style>
.cover .cover-bg {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; filter: grayscale(1) brightness(0.78);
}
.cover .cover-logo {
  position: absolute; top: 80px; left: 50%; transform: translateX(-50%);
  font-family: 'Pretendard'; font-weight: 900; font-size: 36px;
  letter-spacing: -2px; color: #fff;
}
.cover .cover-title {
  position: absolute; bottom: 160px; left: 50%; transform: translateX(-50%);
  font-family: 'Pretendard'; font-weight: 900; font-size: 52px;
  line-height: 1.35; color: #fff; text-align: center;
  letter-spacing: -1px;
}
</style>
```

## 본문 슬라이드 구조 (L4 BOTTOM / L1 TOP / 텍스트 전용)

### 텍스트 전용 (가장 많이 쓰는 형태)

```html
<div class="slide">
  <div class="orange-dot"></div>
  <div class="mkt-head">
    성과만 보기 (X)<br>
    성과의 이유까지 보기 (O)
  </div>
  <div class="mkt-body">
    <p>성과를 확인하는 것까지는 어렵지 않습니다.<br>문제는 그 이후입니다.</p>
    <p>성과만 보고 넘어가면 왜 잘됐는지 알 수 없고<br>다음에도 같은 결과를 만들기 어렵습니다.</p>
    <p>결과보다 '왜 이런 성과가 나왔는지' 보아야 해요.</p>
    <p>성과를 요소별로 나누어 보면<br><b>어떤 부분이 반응을 만들었는지</b> 알 수 있고<br>그때 비로소 다음 전략으로 이어갈 수 있습니다.</p>
  </div>
  <img src="logo-mkt.svg" class="mkt-watermark" alt="">
</div>
```

### 사진 + 텍스트 (L1 TOP)

```html
<div class="slide">
  <img src="frames/insight-week.jpg" class="mkt-photo" alt="">
  <div class="orange-dot" style="margin-bottom: 24px;"></div>
  <div class="mkt-head">
    각자의 조직에서도<br>
    이 기준들을 점검해보세요.
  </div>
  <div class="mkt-body">
    <p>연차가 쌓일수록 감각만으로는<br>판단하기 어려워집니다.</p>
    <p>이번 인사이트 위크에서 이 기준이 어떻게 만들어졌는지<br>그간 샤크니자와 아모레퍼시픽, 직방에서 직접 쌓아온<br>사례를 바탕으로 이야기 나눠봅니다.</p>
  </div>
</div>
```

## 문체 가이드

### 좋은 문장
- "연차가 쌓일수록 스스로를 의심하게 되는 순간이 많아집니다."
- "결과보다 '왜 이런 성과가 나왔는지' 보아야 해요."
- "이럴 땐 실제 유저 반응을 먼저 확인해보세요."

### 나쁜 문장 (이 스타일에서 금지)
- "90%가 모른다" (도발/과장)
- "끝났다" / "가짜" / "진짜" 이분법적 선언
- "!" 느낌표 과다
- "~하지 않으면 망한다" 위협

## 콘텐츠 구조 예시 (10장 캐러셀 기본)

1. **커버 (흑백 인물 + 흰 제목)** — "스스로를 의심하는 마케터를 위한 사고법 3"
2. **도입 (텍스트 전용)** — 공감 질문, 왜 이 주제인지
3. **관점 1 (X/O 대비)** — 첫 번째 사고 전환
4. **관점 1 근거 (사진 + 텍스트)** — 현장/사례
5. **관점 2 (X/O 대비)** — 두 번째
6. **관점 2 근거**
7. **관점 3 (X/O 대비)**
8. **관점 3 근거**
9. **정리 (텍스트 전용)** — 세 가지 관통하는 한 줄
10. **CTA (사진 + 텍스트)** — 인사이트 위크/커뮤니티 초대

## 언제 이 스타일을 선택하는가

| 적합 | 부적합 |
|------|--------|
| B2B 마케팅/교육 커뮤니티 | 자극적 소비자 훅 필요할 때 (→ braveyong 스타일) |
| 시니어 마케터 대상 | 얼리 셀러/초보 대상 (→ howzero 스타일) |
| 인사이트·방법론 공유 | 정책 폭로·케이스 비판 |
| 존댓말 톤 | 반말/도발 |
| 조용한 권위 | 숫자·도발·속도감 |

## 키워드

`mkt`, `mkt.co.kr`, `마케터스클럽`, `마케터 인사이트`, `brutalist-minimal`, `insight-week` 등.
