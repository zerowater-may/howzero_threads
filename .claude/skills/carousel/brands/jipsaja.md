# 집사자 (Jipsaja) 브랜드 프리셋

인스타 `@go.nyangee` 계열 **친근한 부동산/내집마련 큐레이터** 스타일을 재현한 프리셋.
손그림 마스코트(**집사자** — 집을 지키는 사자)가 반말로 정보를 정리해주는 톤.

## 기본 정보

- **브랜드명**: 집사자 (Jipsaja)
- **마스코트**: 노란 사자 + 흰 날개. "집사자"는 "집 사자" / "집 + 사자"의 이중 의미.
- **분야**: 부동산 정보 / 내집마련 / 신혼부부·생애최초 가이드 / 청약·대출
- **한 줄 소개**: 어려운 부동산, 옆집 친한 오빠처럼 풀어주는 집사자의 큐레이션.
- **톤앤매너**: 반말. 귀엽지만 정보는 정확. 친구가 노트에 정리해준 느낌.
  - 예: "여기가 딱이다~", "대출 꼭 알아보고 와야해!", "찾아봤다구"
- **타겟**: 20대 후반~30대 부린이, 신혼부부, 생애최초 구입 예정자
- **레퍼런스 계정**: `@go.nyangee` (고양이 마스코트로 서울 9억대 아파트 정리)

## 디자인 토큰

| 요소 | 값 |
|------|------|
| **배경 (본문)** | `#FFFFFF` (순백) |
| **다크 CTA 배경** | `#1a1a1a` |
| **텍스트** | `#1a1a1a` |
| **본문 보조** | `#333` |
| **메인 액센트 (노란 형광펜)** | `#FFD43B` |
| **서브 액센트 (진한 노랑)** | `#F5B100` |
| **서브 액센트 (크림 박스)** | `#FFF4D6` |
| **박스 테두리** | `#1a1a1a` 2.5~3px solid |
| **말풍선 선** | `#1a1a1a` 2.5px solid |
| **Headline 폰트** | `Jua` (Google Fonts — 둥근 한글 Bold) |
| **Body 폰트** | `Noto Sans KR 700` |
| **말풍선/코멘트** | `Gaegu 700` |

### Google Fonts CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Gaegu:wght@400;700&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
```

## 규칙 — 스타일 DNA

### 반드시 할 것

- **노란 Pill 하이라이트**: 단어·구 전체를 **둥근 pill 모양 노란색**으로 감쌈. inline이 아니라 block처럼 크게. `border-radius: 999px`.
- **점박이 hatching**: pill 양끝 또는 테두리에 작은 점 패턴(`radial-gradient`)으로 손으로 그린 듯한 질감 추가.
- **말풍선 (speech bubble)**: 마스코트 대사는 둥근 말풍선에 담아 그림에 꼬리(tail) 연결. Gaegu 700 폰트.
- **검은 굵은 테두리 박스**: 지도·평면도·체크포인트 박스는 모두 `3px solid #1a1a1a`로 두른다. `border-radius: 16px`.
- **Check Point 박스**: 노란 배경(`#FFD43B` 또는 `#FFF4D6`) + 검은 굵은 테두리 + `Check Point!` 라벨.
- **마스코트 등장**: 모든 본문 슬라이드에 최소 1번 집사자 마스코트(작아도 OK) 배치. 말풍선 또는 코너 액센트.
- **반말 / 친근 어미**: "~해봐", "~찾아봤다구", "~알아두면 좋아!", "~꼭 받아야봐".
- **정보 박스 괄호**: 단지 정보는 `(1074세대 / 2004년 / 전용84 / 계단식 방3화2)` 처럼 슬래시로 구분.

### 절대 하지 말 것

| 금지 | 이유 |
|------|------|
| 도발 톤 ("끝났다", "가짜는 가라") | 집사자는 친구다. 위협하지 않는다. |
| 숫자 위협 / 비관론 ("폭락", "망한다") | 부린이가 겁먹는다. 정보와 안심만 준다. |
| 이모지 남발 | 마스코트 스티커·말풍선으로 감정 표현. 이모지는 없음. |
| 그라디언트 배경 | 순백 고정. AI 디자인 티 남. |
| 복잡한 폰트 (Black Han Sans 같은 각진 체) | Jua의 둥근 느낌이 브랜드 본체. |
| 전문가 존댓말 ("~입니다") | 친구 톤 깨짐. 반말로 통일. |
| 형광펜 여러 색 순환 | 노란색 하나만. 강조 필요하면 크림(`#FFF4D6`) 박스로. |

## 공통 컴포넌트 CSS

```css
body { font-family: 'Noto Sans KR', sans-serif; color: #1a1a1a; }

.slide {
  width: 1080px; height: 1440px;
  background: #fff;
  padding: 80px 70px 130px;
  position: relative;
  overflow: hidden;
}
.slide.dark { background: #1a1a1a; color: #fff; }

/* Headline — Jua 둥근 손글씨 */
.js-head {
  font-family: 'Jua', sans-serif;
  font-size: 92px;
  line-height: 1.15;
  letter-spacing: -1px;
  color: #1a1a1a;
}
.js-head-xl { font-size: 120px; line-height: 1.08; }

/* Body */
.js-body {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 34px;
  line-height: 1.55;
  color: #1a1a1a;
}

/* Pill 하이라이트 — 단어 감싸는 노란 알약 */
.pill {
  display: inline-block;
  background: #FFD43B;
  padding: 6px 28px;
  border-radius: 999px;
  line-height: 1.1;
  /* 점박이 텍스처 — 양끝 hatching 느낌 */
  background-image:
    radial-gradient(circle, rgba(245,177,0,0.35) 1.5px, transparent 2.5px);
  background-size: 12px 12px;
  background-position: 0 0;
  background-color: #FFD43B;
}

/* 옅은 크림 박스 — 부제/정보용 */
.cream-box {
  background: #FFF4D6;
  border: 3px solid #1a1a1a;
  border-radius: 16px;
  padding: 28px 32px;
}

/* Check Point 박스 */
.check-box {
  background: #FFD43B;
  border: 3px solid #1a1a1a;
  border-radius: 16px;
  padding: 28px 32px;
}
.check-label {
  font-family: 'Jua', sans-serif; font-size: 42px; line-height: 1;
  color: #1a1a1a; margin-bottom: 14px;
}

/* 말풍선 — 마스코트 대사 */
.bubble {
  position: relative;
  display: inline-block;
  background: #fff;
  border: 2.5px solid #1a1a1a;
  border-radius: 24px;
  padding: 18px 26px;
  font-family: 'Gaegu', cursive;
  font-weight: 700;
  font-size: 30px;
  line-height: 1.35;
  color: #1a1a1a;
  max-width: 340px;
}
.bubble::after {
  content: '';
  position: absolute;
  bottom: -14px; left: 40px;
  width: 22px; height: 22px;
  background: #fff;
  border-right: 2.5px solid #1a1a1a;
  border-bottom: 2.5px solid #1a1a1a;
  transform: rotate(45deg);
}

/* 마스코트 삽입 */
.mascot {
  width: 220px; height: auto;
  image-rendering: auto;
}
.mascot-sm { width: 140px; }
.mascot-xs { width: 90px; }

/* 정보 괄호 스타일 (단지 메타) */
.meta-paren {
  font-family: 'Noto Sans KR'; font-weight: 700; font-size: 26px; color: #555;
  letter-spacing: -0.5px;
}

/* 귓속말 코멘트 — Gaegu 노란 */
.whisper-yellow {
  font-family: 'Gaegu', cursive; font-weight: 700; font-size: 28px;
  color: #F5B100;
}
```

## 마스코트 에셋 라이브러리

위치: `.claude/skills/carousel/brands/jipsaja-assets/`

**컬러 버전** (날개 달린 풀컬러):
- `mascot.png` — 기본 컬러 캐릭터 (노란 사자 + 흰 날개)

**선화 버전** (투명 배경 검정 선, 10가지 표정):

| 파일 | 표정 | 언제 쓰나 |
|------|------|----------|
| `mascot-hero.png` | 정면 기본 (크게 1024) | 커버 슬라이드, CTA 슬라이드 등 메인 등장 |
| `mascot-default.png` | 정면 중립 | 일반 본문 슬라이드 코너, 도입 |
| `mascot-smile.png` | 정면 미소 | 긍정 결론, 공감 슬라이드 |
| `mascot-happy.png` | 눈 감고 웃음 | 정리/요약/체크리스트 슬라이드, 만족 |
| `mascot-shining.png` | 빛나는 갈기, 놀람 | "진짜 발견!" 순간, 핵심 인사이트 |
| `mascot-surprise.png` | 입 'o' 놀람 | 충격적 수치·반전 슬라이드 |
| `mascot-worried.png` | 걱정 찡그림 | 리스크·주의 슬라이드, 문제 제기 |
| `mascot-angry.png` | 찡그린 표정 | 반대·경고 ("이러면 안 된다") |
| `mascot-blank.png` | 멍함 | 중립 리액션, 정보 나열 |
| `mascot-side.png` | 옆 얼굴 | 대사 말풍선 대화 구도 |

**선화 에셋 사용 팁**:
- 투명 배경 PNG라 어떤 배경(흰색/크림/다크)에도 바로 얹기 가능
- 흑백 선화라 **주변 노란 형광펜·컬러와 충돌 안 함**
- 기본 크기는 200~260px, 코너 액센트용은 100~140px
- 좌우반전(`transform: scaleX(-1)`)으로 방향 맞추기
- 색 필요하면 CSS `filter: sepia(1) saturate(5) hue-rotate(-10deg)`로 노란 톤 입히기 가능

## 커버 슬라이드 구조

```html
<div class="slide">
  <div class="js-head" style="text-align:center; margin-top: 120px;">
    <span class="pill">서울 9억대</span><br>
    <span class="pill">내집마련</span><br>
    <span style="font-size: 0.85em;">아파트 추천!</span>
  </div>

  <div style="position: relative; margin-top: 80px; display:flex; justify-content:center;">
    <img src="brands/jipsaja-assets/mascot.png" class="mascot" style="width:360px;">
    <div class="bubble" style="position:absolute; left: 60px; top: 40px;">
      서울<br>9억대 아파트,<br>어디가 좋을까?
    </div>
    <div class="whisper-yellow" style="position:absolute; right: 80px; top: 140px;">
      서울 동서남북에서<br>찾아봤다구
    </div>
  </div>
</div>
```

## 본문 슬라이드 구조 (정보 카드형)

```html
<div class="slide">
  <div class="js-head" style="text-align:center; font-size: 72px;">
    성북구
  </div>
  <div style="text-align:center; margin-top: 24px;">
    <span class="pill" style="font-family:'Jua'; font-size:72px;">돈암브라운스톤</span>
  </div>
  <div class="meta-paren" style="text-align:center; margin-top: 20px;">
    (1074세대 / 2004년 / 전용84 / 계단식 방3화2)
  </div>

  <!-- 지도+평면도 박스 (검은 굵은 테두리) -->
  <div style="margin-top: 40px; border: 3px solid #1a1a1a; border-radius: 16px; overflow: hidden;">
    <img src="assets/map1.jpg" style="width:100%;">
  </div>

  <!-- 하단 체크포인트 -->
  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top: 40px;">
    <div class="cream-box">지하철 4호선 성신여대입구역 548m / 도보 8분</div>
    <div class="check-box">
      <div class="check-label">Check Point!</div>
      <div class="js-body" style="font-size:28px;">
        4호선 / 우이신설 성신여대입구역<br>
        성신여대 학원가<br>
        성신여대 상권
      </div>
    </div>
  </div>
</div>
```

## 콘텐츠 구조 예시 (10장 캐러셀)

1. **커버** — 큰 pill 제목 3줄 + 마스코트 말풍선 질문
2. **도입** — "이 글 왜 봐야 돼?" 마스코트 설명 (반말)
3. **조건 박스** — 대출 공식 / 종잣돈 계산 (크림 박스 + 노란 pill)
4. **매물 1** — 단지명 pill + 지도/평면도 + Check Point
5. **매물 2** — 동일 포맷
6. **매물 3** — 동일 포맷
7. **매물 4** — 동일 포맷
8. **매물 5** — 동일 포맷
9. **정리** — 비교표 or 3줄 요약 (크림 박스)
10. **CTA (다크)** — "다음엔 어디?" + 팔로우/저장 마스코트

## 문체 가이드

### 좋은 문장 (반말·친근)
- "9억대 아파트, 어디가 좋을까?"
- "대출 꼭 알아보고 와야해!"
- "서울 동서남북에서 찾아봤다구"
- "여기가 학원가라서 애 키우기 딱이다"
- "생애최초면 무조건 이거부터 체크"

### 나쁜 문장 (이 스타일에서 금지)
- "9억대 아파트에 대해 알려드리겠습니다" (존댓말 → 톤 깨짐)
- "절대 놓치면 안 되는 핵심 3가지" (도발 훅 → 친근함 깨짐)
- "망한다 / 끝났다" (위협)
- "!!" / "???" (과장)

## 언제 이 스타일을 선택하는가

| 적합 | 부적합 |
|------|--------|
| 부동산 정보 / 내집마련 / 청약·대출 | B2B SaaS / 컨설팅 (→ howzero) |
| 20-30대 부린이 대상 | 중견기업 CEO 대상 |
| "친구가 정리해준 노트" 톤 | 권위·도발 톤 (→ braveyong) |
| 지도·평면도·숫자 표 많은 컨텐츠 | 인사이트·에세이형 (→ mkt) |
| 반말 친근 | 존댓말 격식 |

## 키워드

`jipsaja`, `집사자`, `go.nyangee`, `부린이`, `내집마련`, `부동산친절`, `cute-realty`, `yellow-highlight`, `jua-font`

---

## Nano Banana V2 자동화 워크플로 (권장 프로덕션 경로)

순수 HTML/CSS로만 손그림 질감을 흉내 내면 한계가 있다. 진짜 go.nyangee 결을 얻으려면 **Nano Banana로 손그림 레이아웃을 생성**하고 **HTML로 글씨만 얹는** 하이브리드 파이프라인을 쓴다.

### 원리

```
[마스코트 reference image (mascot-hero.png)]
              +
[브랜드 스타일 + 레이아웃 프롬프트]
              ↓
  Nano Banana 2 (gemini-3.1-flash-image-preview, aspectRatio 3:4)
              ↓
[손그림 템플릿 PNG — 마스코트 포함, 텍스트 빈칸]
              ↓  PIL resize to 1080x1440
[HTML 글씨 overlay (Jua/Gaegu/Noto Sans KR)]
              ↓  Puppeteer capture @2x
[최종 슬라이드 PNG]
```

### 핵심 포인트

1. **마스코트는 AI가 한 번에 그림** — 기존 PNG overlay 금지 (복붙 티 남).
2. **캐릭터 일관성은 `mascot-hero.png` 레퍼런스 이미지 첨부**로 확보 — Nano Banana 2가 reference를 따라 같은 집사자를 매번 자연스럽게 그림.
3. **프롬프트는 ~1800자 이하 간결**하게. 3000자 넘으면 `IMAGE_RECITATION` 에러로 거부됨.
4. **프롬프트에 한글 절대 금지** — 이미지에 한글이 새어 들어감. 글씨는 HTML로만.
5. **aspectRatio 3:4 + PIL resize** — Gemini가 3:4 내에서 임의 사이즈 반환하니 1080×1440으로 강제 리사이즈.

### CLI 사용

```bash
# spec.json 예시 (SlideSpec schema)
{
  "idx": 1,
  "layout": "apartment-card",
  "mascot_pose": "shining",
  "headline": "가양2단지성지 34A",
  "body_lines": ["5년 +136%", "현재 호가 7.16억"],
  "checkpoint_lines": ["9호선 급행역", "마곡지구 접근성"],
  "whisper": "시세 뽑아봤다구~"
}

# 실행
set -a && source .env.gemini && set +a
python3 -m scripts.nano_carousel \
  --spec docs/content/carousel-X/spec.json \
  --out docs/content/carousel-X
```

### 지원 레이아웃 (MVP)

- `apartment-card` — 매물 카드 (상단 헤드라인 + 본문 박스 + 좌우 2박스 + 하단 마스코트+말풍선)
- `cover` — 커버 슬라이드
- `cta-dark` — 다크 CTA

### 파이프라인 파일

- `scripts/nano_carousel/prompt_builder.py` — 간결 프롬프트 조립
- `scripts/nano_carousel/gemini_client.py` — reference + aspect_ratio 지원 REST 호출
- `scripts/nano_carousel/html_renderer.py` — 글씨만 absolute overlay
- `scripts/nano_carousel/layout_presets.py` — 레이아웃별 텍스트 좌표
- `scripts/nano_carousel/__main__.py` — CLI orchestrator (prompt → image → resize → html → puppeteer)

### 비용

- 1장 = `$0.039` (Nano Banana 2 기본가, 약 50원)
- IMAGE_RECITATION 재시도 고려: 평균 1.2~1.5장 호출 비용 예상
- 10장 캐러셀 1개 = 약 500~700원

### 주의 사항 / 튜닝 포인트

- **글씨 좌표가 매번 정확히 맞진 않음**: Nano Banana는 매 호출마다 박스 위치가 약간 변동. `layout_presets.py`의 좌표는 평균값. 슬라이드마다 수동 조정 필요할 수 있음.
- **완전 자동은 V3**: `marker_detector`로 박스 위치 자동 검출 → 좌표 JSON 생성 → 오버레이 (V1에서 시도했으나 실패, 재설계 필요).
- **Nano Banana 1 (gemini-2.5-flash-image)** 은 reference image 품질이 V2보다 약함 — V2 우선 사용.

### 안티패턴 (절대 하지 말 것)

- ❌ **마스코트를 HTML `<img>`로 overlay** — 복붙 느낌 나옴. 반드시 Nano Banana가 장면 일부로 그리게.
- ❌ **녹색 원 마커 요청** — Nano Banana가 레이아웃을 엔지니어링 도면처럼 만들어 버림.
- ❌ **프롬프트에 Korean 헤드라인 포함** — 이미지에 한글 새어 들어감.
- ❌ **transparent PNG 요청** — Nano Banana가 체크무늬 패턴을 실제 픽셀로 그림.

