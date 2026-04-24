# 용감한용팀장 - 재사용 컴포넌트 라이브러리

1080x1440 슬라이드에서 재사용할 수 있는 HTML/CSS 컴포넌트. 캐러셀 작업 시 이 파일에서 그대로 복사해서 사용.

---

## 0. 기본 슬라이드 골격

```html
<div class="slide" id="slide-N">
  <div class="watermark-num">NN</div>
  <div class="slide-content">
    <!-- 번호 라벨 + 섹션 타이틀 -->
    <div style="display: flex; gap: 20px; align-items: baseline; margin-bottom: 20px;">
      <span class="num-label">NN</span>
      <span class="body-sm">섹션 부제</span>
    </div>
    <!-- 메인 타이틀 -->
    <div class="title title-md">
      메인 메시지<br>
      <span class="hl-red">강조 포인트.</span>
    </div>

    <!-- 여기에 컴포넌트 배치 -->

    <!-- 귓속말 -->
    <div style="margin-top: 24px;">
      <span class="whisper">귓속말 한 줄 코멘트</span>
    </div>
  </div>
  <div class="footer">
    <span class="handle">@brave._.yong_</span>
    <span class="page-num">NN</span>
    <span class="arrow-next">NEXT →</span>
  </div>
</div>
```

---

## 1. HOOK 슬라이드 (다크, 얼굴 없음)

```html
<div class="slide dark" id="slide-1">
  <div style="position: absolute; top:0; left:0; right:0; bottom:0;
    background: radial-gradient(ellipse at 20% 30%, rgba(63,0,0,0.35) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 90%, rgba(255,202,40,0.08) 0%, transparent 55%);
    z-index: 0;"></div>
  <div class="slide-content" style="justify-content: space-between; padding-bottom: 40px;">
    <div style="padding-top: 60px;">
      <div style="margin-bottom: 32px;">
        <span class="tag" style="background:#FFCA28; color:#1A0A0A;">긴급 분석</span>
      </div>
      <div class="cover-title" style="color:#fff; font-size: 172px; letter-spacing: -6px;">
        훅 라인 1,<span class="line2" style="color:#FFCA28;">훅 라인 2.</span>
      </div>
      <div class="cover-sub" style="color:#fff; margin-top: 40px; font-size: 42px;">
        서브 설명 <span style="background: #3F0000; color:#fff; padding: 4px 16px;">핵심 팩트</span>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="font-family: 'Black Han Sans'; font-size: 96px; color: #FFCA28;
        line-height: 0.95; letter-spacing: -3px;">
        반전 라인 1<br>
        <span style="color: #fff;">반전 라인 2.</span>
      </div>
      <div class="whisper" style="font-size: 34px; color: #E8B4B4; margin-top: 12px;">
        귓속말 한 줄.
      </div>
    </div>
  </div>
  <div class="footer">
    <span style="color:#d4a0a0;">용감한 용팀장 · 가짜는 가고 진짜만 남는다</span>
    <span class="page-num" style="color:#FFCA28;">01</span>
    <span class="arrow-next" style="color:#FFCA28;">NEXT →</span>
  </div>
</div>
```

---

## 2. Stat Row (2열 통계 카드)

```html
<div class="stat-row" style="margin-top: 44px;">
  <div class="stat-card">
    <div class="body-sm" style="margin-bottom: 8px;">기존</div>
    <div class="stat-num" style="color: #888;">10,000</div>
    <div class="stat-label">상품 등록 한도</div>
  </div>
  <div class="stat-card" style="border-color: #3F0000; background: #FFF8E1;">
    <div class="body-sm" style="margin-bottom: 8px; color: #3F0000;">변경</div>
    <div class="stat-num">1,000</div>
    <div class="stat-label">90% 셀러 적용</div>
  </div>
</div>
```

---

## 3. VS Grid (가짜 vs 진짜 비교)

```html
<div class="vs-grid" style="margin-top: 40px;">
  <div class="vs-card bad">
    <div class="vs-head bad">가짜 셀러</div>
    <ul class="vs-list bad">
      <li>항목 1</li>
      <li>항목 2</li>
      <li>항목 3</li>
      <li>항목 4</li>
    </ul>
  </div>
  <div class="vs-card good">
    <div class="vs-head good">진짜 셀러</div>
    <ul class="vs-list good">
      <li>항목 1</li>
      <li>항목 2</li>
      <li>항목 3</li>
      <li>항목 4</li>
    </ul>
  </div>
</div>
```

---

## 4. Steps (번호 리스트 ①②③)

```html
<div class="steps">
  <div class="step-row">
    <div class="step-num">①</div>
    <div>
      <div class="step-text">단계 타이틀 <span class="hl-gold">강조</span></div>
      <div class="body body-sm" style="margin-top: 6px;">부가 설명</div>
    </div>
  </div>
  <div class="step-row">
    <div class="step-num">②</div>
    <div>
      <div class="step-text">단계 타이틀</div>
      <div class="body body-sm" style="margin-top: 6px;">부가 설명</div>
    </div>
  </div>
  <div class="step-row">
    <div class="step-num">③</div>
    <div>
      <div class="step-text">단계 타이틀</div>
      <div class="body body-sm" style="margin-top: 6px;">부가 설명</div>
    </div>
  </div>
</div>
```

### OR 구분자 변형
```html
<div class="step-num" style="color: #E8B4B4;">OR</div>
```

---

## 5. Check List (체크리스트)

```html
<ul class="check-list">
  <li>항목 1 <span class="hl-red">&nbsp;강조 키워드&nbsp;</span></li>
  <li>항목 2 <span class="hl-gold">&nbsp;강조 키워드&nbsp;</span></li>
  <li>항목 3 <span class="hl-dark">&nbsp;강조 키워드&nbsp;</span></li>
  <li>항목 4 <span class="hl-red">&nbsp;강조 키워드&nbsp;</span></li>
</ul>
```

---

## 6. Callout (강조 박스)

```html
<div class="callout" style="margin-top: 40px;">
  <div class="body body-md">
    메시지 1줄<br>
    <span class="hl-dark">핵심 강조 메시지</span>
  </div>
</div>
```

### 골드 Callout 변형
```html
<div class="callout" style="margin-top: 40px; background: #FFF8E1; border-color: #8B2020;">
  <div class="body body-md">메시지...</div>
</div>
```

---

## 7. Quote Bad (망한 사례 인용)

```html
<div class="quote-bad">
  "실제 엉망인 상품명 예시 텍스트"
</div>
```

좌상단 ✗ 붉은 원형 배지 자동 렌더링.

---

## 8. Frame Card (YouTube 프레임 인라인)

```html
<div class="frame-card">
  <img src="frames/hXX_clean.jpg" alt="설명">
  <div class="frame-caption">실제 OO · 부가 설명</div>
</div>
```

붉은 그림자 shadow 자동 적용. 원본 프레임은 `convert` 또는 `magick`으로 자막 영역 크롭 필요:
```bash
convert frames/hXX_f01.jpg -crop 1080x460+0+0 +repage frames/hXX_clean.jpg
```

---

## 9. CTA Button

```html
<!-- 붉은 메인 CTA -->
<div class="cta-btn">무료 강의 신청</div>

<!-- 골드 서브 CTA -->
<div class="cta-btn gold">고정 댓글 단톡방 참여</div>
```

---

## 10. Before / After 2단 카드

```html
<div style="margin-top: 36px;">
  <!-- BEFORE -->
  <div style="background: #fff; border: 4px solid #3F0000; border-radius: 8px; padding: 28px 32px;">
    <div style="display: inline-block; background: #3F0000; color: #fff; padding: 6px 16px;
      border-radius: 4px; font-family: 'Noto Sans KR'; font-weight: 900; font-size: 22px;
      letter-spacing: 2px; margin-bottom: 16px;">✗ BEFORE</div>
    <div style="font-family: 'Noto Sans KR'; font-size: 28px; font-weight: 700;
      color: #1A1A1A; line-height: 1.45;">
      Before 본문
    </div>
    <div style="margin-top: 16px; display: flex; gap: 10px; flex-wrap: wrap;">
      <div style="background: #1A0A0A; color: #E8B4B4; padding: 8px 14px;
        border-radius: 4px; font-size: 20px; font-weight: 900;">태그 1</div>
      <div style="background: #3F0000; color: #fff; padding: 8px 14px;
        border-radius: 4px; font-size: 20px; font-weight: 900;">태그 2</div>
    </div>
  </div>
</div>

<div style="margin-top: 24px;">
  <!-- AFTER -->
  <div style="background: #FFF8E1; border: 4px solid #8B2020; border-radius: 8px; padding: 28px 32px;">
    <div style="display: inline-block; background: #FFCA28; color: #1A0A0A; padding: 6px 16px;
      border-radius: 4px; font-family: 'Noto Sans KR'; font-weight: 900; font-size: 22px;
      letter-spacing: 2px; margin-bottom: 16px;">✓ AFTER</div>
    <div style="font-family: 'Noto Sans KR'; font-size: 28px; font-weight: 900;
      color: #1A1A1A; line-height: 1.45;">
      After 본문 <span class="hl-gold">강조</span>
    </div>
    <div style="margin-top: 16px; display: flex; gap: 10px; flex-wrap: wrap;">
      <div style="background: #8B2020; color: #fff; padding: 8px 14px;
        border-radius: 4px; font-size: 20px; font-weight: 900;">태그 1</div>
      <div style="background: #FFCA28; color: #1A0A0A; padding: 8px 14px;
        border-radius: 4px; font-size: 20px; font-weight: 900;">태그 2</div>
    </div>
  </div>
</div>
```

---

## 11. Data Table (2열 비교 테이블)

```html
<div style="margin-top: 36px; background: #fff; border: 4px solid #1A1A1A;
  border-radius: 8px; overflow: hidden;">
  <!-- 헤더 -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; padding: 18px 28px;
    background: #1A0A0A; color: #FFCA28; font-family: 'Noto Sans KR';
    font-weight: 900; font-size: 22px; letter-spacing: 1px;">
    <div>컬럼 A 헤더</div>
    <div>컬럼 B 헤더</div>
  </div>
  <!-- 로우 -->
  <div style="padding: 0 28px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; padding: 20px 0;
      border-bottom: 2px dashed #ddd; font-family: 'Noto Sans KR'; font-size: 26px;
      font-weight: 700;">
      <div>로우 A 값</div>
      <div style="color: #3F0000;">✗ <b>로우 B 값</b></div>
    </div>
    <!-- 추가 로우들... -->
  </div>
</div>
```

---

## 12. CTA Dark 슬라이드 (마지막)

```html
<div class="slide dark" id="slide-N">
  <div class="face-bg" style="background-image:url('frames/hXX_clean.jpg');
    background-size: 1400px auto; background-position: center -50px;"></div>
  <div class="face-overlay"></div>
  <div class="slide-content">
    <div style="display: flex; gap: 20px; align-items: baseline; margin-bottom: 20px;">
      <span class="num-label">NN</span>
      <span class="body-sm" style="color: #E8B4B4;">진짜 셀러 모집</span>
    </div>
    <div class="title title-lg">
      가짜는 가고,<br>
      <span style="color: #FFCA28;">진짜만 남는다.</span>
    </div>

    <div style="margin-top: 48px;">
      <div class="body body-md" style="color: #fff; line-height: 1.5;">
        이 변화에서 흔들리지 않고<br>
        <span style="color: #FFCA28; font-weight: 900;">끝까지 살아남고 싶은 분</span>,<br>
        단톡방에서 함께 가죠.
      </div>
    </div>

    <div style="margin-top: 48px; display: flex; flex-direction: column;
      gap: 18px; align-items: flex-start;">
      <div class="cta-btn gold">고정 댓글 단톡방 참여</div>
      <div class="cta-btn">무료 강의 신청</div>
    </div>

    <div style="position: absolute; bottom: 160px; left: 80px; right: 80px;">
      <div class="whisper" style="font-size: 36px; color: #E8B4B4;">
        "끝까지 본 당신은 이미 상위 1%입니다."
      </div>
      <div class="body body-sm" style="color: #d4a0a0; margin-top: 12px;">
        — 용감한 용팀장
      </div>
    </div>
  </div>
  <div class="footer">
    <span class="handle">@brave._.yong_</span>
    <span class="page-num">NN</span>
    <span>END</span>
  </div>
</div>
```

---

## CSS 전체 스타일시트

```css
/* 기본 */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #dcd8cf; padding: 60px 0;
  display: flex; flex-direction: column; align-items: center; gap: 40px;
  font-family: 'Noto Sans KR', sans-serif; }
.slide { width: 1080px; height: 1440px; background: #FAF8F5;
  position: relative; overflow: hidden; padding: 80px 80px 120px; }
.slide.dark { background: #1A0A0A; color: #fff; }

/* Typography */
.title { font-family: 'Black Han Sans', sans-serif; font-weight: 400;
  color: #1A1A1A; letter-spacing: -2px; line-height: 1.05; }
.title-xl { font-size: 124px; } .title-lg { font-size: 104px; }
.title-md { font-size: 78px; } .title-sm { font-size: 60px; }
.slide.dark .title { color: #fff; }

.body { font-family: 'Noto Sans KR', sans-serif; font-weight: 700;
  color: #1A1A1A; line-height: 1.45; }
.body-lg { font-size: 44px; font-weight: 900; line-height: 1.35; }
.body-md { font-size: 36px; }
.body-sm { font-size: 28px; color: #555; font-weight: 700; }
.slide.dark .body { color: #fff; } .slide.dark .body-sm { color: #d4a0a0; }

.whisper { font-family: 'Gaegu', cursive; font-weight: 700;
  font-size: 32px; color: #888;
  display: inline-block; transform: rotate(-1deg); }
.slide.dark .whisper { color: #E8B4B4; }

/* Highlights */
.hl-red { background: linear-gradient(170deg, transparent 10%, #E8B4B4 15%,
  #d4a0a0 50%, #E8B4B4 85%, transparent 90%);
  padding: 2px 10px; display: inline;
  box-decoration-break: clone; -webkit-box-decoration-break: clone; }
.hl-gold { background: linear-gradient(168deg, transparent 10%, #FFD54F 15%,
  #FFCA28 50%, #FFD54F 85%, transparent 90%);
  padding: 2px 10px; display: inline;
  box-decoration-break: clone; -webkit-box-decoration-break: clone; }
.hl-dark { background: linear-gradient(172deg, transparent 8%, #3F0000 14%,
  #5A0000 50%, #3F0000 86%, transparent 92%);
  color: #fff; padding: 2px 10px; display: inline;
  box-decoration-break: clone; -webkit-box-decoration-break: clone; }

/* Tag */
.tag { display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 4px;
  background: #3F0000; color: #fff;
  font-family: 'Noto Sans KR'; font-size: 22px; font-weight: 900;
  letter-spacing: 2px; }
.tag::before { content: '●'; color: #FFCA28; font-size: 14px; }

/* Num Label */
.num-label { font-family: 'Black Han Sans', sans-serif; font-size: 100px;
  color: #3F0000; line-height: 0.9; letter-spacing: -4px; }
.slide.dark .num-label { color: #E8B4B4; }

/* Watermark */
.watermark-num { position: absolute; top: 40px; right: 70px;
  font-family: 'Black Han Sans', sans-serif; font-size: 200px;
  color: rgba(63,0,0,0.06); line-height: 0.9; letter-spacing: -10px;
  z-index: 1; }
.slide.dark .watermark-num { color: rgba(232,180,180,0.08); }

/* Callout */
.callout { background: #fff; border: 4px solid #1A1A1A; border-radius: 8px;
  padding: 36px 44px; margin-top: 28px; }
.slide.dark .callout { background: #2a1414; border-color: #E8B4B4; }

/* Stat */
.stat-row { display: grid; grid-template-columns: 1fr 1fr;
  gap: 28px; margin-top: 40px; }
.stat-card { background: #fff; border: 4px solid #1A1A1A; border-radius: 8px;
  padding: 36px 28px; text-align: center; }
.stat-num { font-family: 'Black Han Sans'; font-size: 104px;
  color: #3F0000; line-height: 1; letter-spacing: -3px; }
.stat-label { font-family: 'Noto Sans KR'; font-size: 24px; color: #555;
  font-weight: 900; margin-top: 14px; }

/* VS Grid */
.vs-grid { display: grid; grid-template-columns: 1fr 1fr;
  gap: 24px; margin-top: 32px; }
.vs-card { background: #fff; border: 4px solid #1A1A1A;
  border-radius: 8px; padding: 32px 28px; }
.vs-card.bad { border-color: #3F0000; }
.vs-card.good { border-color: #8B2020; background: #FFF8E1; }
.vs-head { font-family: 'Black Han Sans'; font-size: 44px;
  text-align: center; margin-bottom: 20px; }
.vs-head.bad { color: #3F0000; }
.vs-head.good { color: #8B2020; }
.vs-list { list-style: none; padding: 0; }
.vs-list li { font-family: 'Noto Sans KR'; font-size: 26px; font-weight: 700;
  padding: 10px 0; border-bottom: 1px dashed #ccc;
  display: flex; align-items: flex-start; gap: 10px; }
.vs-list li:last-child { border-bottom: none; }
.vs-list.bad li::before { content: '✗'; color: #3F0000;
  font-weight: 900; font-size: 28px; }
.vs-list.good li::before { content: '✓'; color: #8B2020;
  font-weight: 900; font-size: 28px; }

/* Quote Bad */
.quote-bad { background: #1A0A0A; color: #fff; border-radius: 8px;
  padding: 40px 44px; margin-top: 24px;
  font-family: 'Noto Sans KR'; font-size: 34px; font-weight: 700;
  line-height: 1.5; position: relative; }
.quote-bad::before { content: '✗'; position: absolute; top: -18px; left: 28px;
  background: #3F0000; color: #fff;
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 900; }

/* Steps */
.steps { margin-top: 40px; }
.step-row { display: flex; align-items: center; gap: 24px;
  padding: 22px 0; border-bottom: 2px dashed #ddd; }
.step-row:last-child { border-bottom: none; }
.step-num { font-family: 'Black Han Sans'; font-size: 72px;
  color: #FFCA28; -webkit-text-stroke: 2px #1A1A1A;
  line-height: 1; letter-spacing: -2px; min-width: 96px; }
.step-text { font-family: 'Noto Sans KR'; font-size: 36px;
  font-weight: 900; line-height: 1.3; }

/* Check List */
.check-list { margin-top: 40px; list-style: none; padding: 0; }
.check-list li { display: flex; align-items: flex-start; gap: 20px;
  padding: 18px 0;
  font-family: 'Noto Sans KR'; font-size: 38px; font-weight: 900;
  color: #1A1A1A; }
.check-list li::before { content: '✔'; color: #3F0000;
  font-size: 42px; font-weight: 900; flex-shrink: 0; }
.slide.dark .check-list li { color: #fff; }
.slide.dark .check-list li::before { color: #FFCA28; }

/* CTA Button */
.cta-btn { display: inline-block;
  background: #3F0000; color: #fff;
  padding: 24px 48px; border-radius: 6px;
  font-family: 'Noto Sans KR'; font-size: 36px; font-weight: 900;
  letter-spacing: -1px;
  box-shadow: 6px 6px 0 #FFCA28; }
.cta-btn.gold { background: #FFCA28; color: #1A1A1A;
  box-shadow: 6px 6px 0 #3F0000; }

/* Face BG (CTA 슬라이드) */
.face-bg { position: absolute; inset: 0;
  background-size: cover; background-position: center 20%;
  background-repeat: no-repeat;
  filter: grayscale(0.35) contrast(1.15) brightness(0.75);
  z-index: 0; }
.face-overlay { position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(180deg, rgba(26,10,10,0.72) 0%,
  rgba(26,10,10,0.58) 35%, rgba(26,10,10,0.78) 65%,
  rgba(26,10,10,0.96) 88%, #1A0A0A 100%); }

/* Frame Card */
.frame-card { width: 100%; margin-top: 24px;
  border: 4px solid #1A1A1A; border-radius: 8px; overflow: hidden;
  box-shadow: 8px 8px 0 #3F0000; background: #fff; }
.frame-card img { width: 100%; display: block; }
.frame-caption { padding: 14px 20px; background: #1A0A0A; color: #FFCA28;
  font-family: 'Noto Sans KR'; font-size: 20px; font-weight: 900;
  letter-spacing: 1px; text-transform: uppercase;
  display: flex; align-items: center; gap: 10px; }
.frame-caption::before { content: '▶'; color: #E8B4B4; font-size: 14px; }

/* Slide Content */
.slide-content { position: relative; z-index: 2; height: 100%;
  display: flex; flex-direction: column; }

/* Footer */
.footer { position: absolute; bottom: 0; left: 0; right: 0;
  padding: 24px 80px;
  display: flex; justify-content: space-between; align-items: center;
  font-family: 'Noto Sans KR'; font-size: 20px; color: #888;
  border-top: 2px solid rgba(63,0,0,0.12); }
.slide.dark .footer { border-top-color: rgba(232,180,180,0.2);
  color: #d4a0a0; }
.footer .handle { color: #3F0000; font-weight: 900; letter-spacing: 1px; }
.slide.dark .footer .handle { color: #FFCA28; }
.footer .page-num { font-family: 'Black Han Sans'; font-size: 32px;
  color: #3F0000; }
.slide.dark .footer .page-num { color: #FFCA28; }
.arrow-next { font-family: 'Black Han Sans'; font-size: 28px; color: #3F0000; }
.slide.dark .arrow-next { color: #FFCA28; }
```

---

## Google Fonts Import

```html
<link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Gaegu:wght@400;700&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
```

---

## 레퍼런스 캐러셀

- `docs/content/carousel-braveyong-AbFSATnz2_c/` — 구매대행 1,000개 제한 분석 (12장, 완성 레퍼런스)
