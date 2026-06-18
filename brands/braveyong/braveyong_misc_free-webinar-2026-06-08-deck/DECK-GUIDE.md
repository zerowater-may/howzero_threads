# 용팀장 무료강의 덱 — 제작 가이드 (섹션별 HTML)

모든 섹션 HTML은 `deck.css` + `deck.js`만 include 한다. 디자인/네비/HUD/진행바는 자동. 너는 **슬라이드 마크업만** 쓴다.

## 브랜드 톤
- 색: **버건디**(#7c1f38, 밝은 버건디 #b9324f) + 따뜻한 종이(#f2ede2) + 형광펜 노랑(#ffe24a)
- 폰트: Pretendard(본문) / Nanum Pen Script(손글씨 `.pen`/`.note`/`.hand`)
- 톤: 직설적·실전·봉사. 도발 뒤 근거. 16:9, 한 슬라이드 = 메시지 하나.

## 파일 골격 (이 head 그대로 복사, {N}/{섹션명}만 교체)
```html
<!DOCTYPE html><html lang="ko"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>용팀장 무료강의 · {섹션명} (PART {N})</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Gaegu:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="deck.css">
<style>/* 섹션 전용 미세조정이 필요할 때만 */</style>
</head><body>
<div class="stage" id="stage">
  <!-- 슬라이드들 (첫 슬라이드에 active 부여) -->
</div>
<script src="deck.js"></script>
</body></html>
```

## 규칙
- **슬라이드 수: 4~7장.** 첫 장 = 섹션 커버(다크), 마지막 장 = 다음으로 넘기는 마무리.
- 첫 슬라이드에 `class="... active"` 를 줘서 로딩 깜빡임 방지.
- 다크 슬라이드는 `<section class="slide cover dark ...">` 또는 `swall dark`. 라이트 본문은 `<section class="slide ...">`.
- 모든 텍스트 요소에 `reveal d1`~`d8` 부여(순차 등장). 한 슬라이드에 d1부터 차례로.
- 각 본문 슬라이드 좌하단에 `<div class="pageft reveal d6">PART {N} · {섹션명}</div>`.
- 카피는 아래 **용팀장 스크립트 파일**(rscript)에서 뽑되, 문단 그대로 붙이지 말고 **슬라이드 헤드라인 + 핵심 포인트**로 압축.
- 숫자/성과를 **지어내지 말 것**. 스크립트에 있는 것만. 검증 필요 수치는 손글씨로 "본인 확인" 뉘앙스.
- 실연(소싱/SEO) 슬라이드는 실제 캡처가 아직 없으니 `.shot` placeholder 사용(라벨에 무슨 화면인지).

## 에셋 (이 폴더 안)
- `face.jpg` — 용팀장 인물 사진 (커버 `.cphoto`용). `style="background-image:url('face.jpg')"`
- `reviews/r01.png ~ r50.png` — 후기 50장 (후기 월 `data-reviews="50" data-path="reviews/r"`)

---

## 패턴 치트시트 (deck.css 클래스 — 복사해서 조합)

### 1) 섹션 커버 (다크 + 사진) — 첫 장 권장
```html
<section class="slide cover dark active">
  <div class="cphoto" style="background-image:url('face.jpg')"></div>
  <div class="cgrad"></div>
  <div class="ctext">
    <div class="ckick reveal d1">PART {N} · {섹션명}</div>
    <h1 class="ch1 reveal d2">큰 제목<br><span class="u">강조어</span></h1>
    <div class="csub reveal d4">손글씨 한 줄</div>
    <div class="cwho reveal d5">보조 설명 <b>강조</b></div>
  </div>
</section>
```
사진 없는 다크 커버면 `cphoto`/`cgrad` 빼고 `ctext`의 width 100%로.

### 2) 큰 진술 (라이트)
```html
<section class="slide">
  <div class="kicker reveal d1">키커</div>
  <h1 class="lead reveal d2">핵심 문장 <span class="hl">형광강조</span></h1>
  <div class="sub reveal d3">보조 설명 두 줄.</div>
  <div class="handabs reveal d5" style="right:8%; bottom:16%">손글씨 메모 ↗</div>
  <div class="pageft reveal d4">PART {N} · {섹션명}</div>
</section>
```

### 3) 큰 숫자
```html
<div class="stat reveal d2"><span class="brd">1억</span></div>
<div class="statcap reveal d3">설명</div>
```

### 4) 번호 리스트 (무료자료/포인트 3종 등)
```html
<div class="list">
  <div class="item reveal d3"><span class="no">1</span><div><span class="nm"><span class="hl">항목</span></span><span class="desc">설명</span></div></div>
  ...
</div>
```

### 5) 가로 플로우 (단계)
```html
<div class="flow">
  <div class="step reveal d3"><div class="si">STEP 1</div><div class="sn">소싱</div></div>
  <div class="arr reveal d3">→</div>
  <div class="step dim reveal d5"><div class="si">STEP 4</div><div class="sn">광고 <span style="font-size:.6em">(다음에)</span></div></div>
</div>
```

### 6) 비교 카드 (네 갈래 길 등) — 정답 카드에 `win`
```html
<div class="cards c4">
  <div class="card reveal d2"><div class="cbad">사입</div><div class="ct">초기비용</div><div class="cd">목돈 들고 재고 묶임</div></div>
  <div class="card reveal d3"><div class="cbad">국내위탁</div><div class="ct">세금 부담</div><div class="cd">매출 기준이라 무겁다</div></div>
  <div class="card win reveal d4"><div class="cbad">해외구매대행</div><div class="ct">순익 과세</div><div class="cd">세금 가볍다 ✓</div></div>
  <div class="card reveal d5"><div class="cbad">대량등록</div><div class="ct">1,000개 제한</div><div class="cd">이제 막혔다</div></div>
</div>
```

### 7) 태그 칩 (SEO 7요소 등) — 강조 칩에 `on`
```html
<div class="tags">
  <span class="tag-chip reveal d2">상품명</span>
  <span class="tag-chip on reveal d3">마노태그</span> ...
</div>
```

### 8) 메모지 (손글씨 노트)
```html
<div class="memo reveal d3" style="right:6%; top:24%; width:26%; aspect-ratio:1/.82">
  <div class="pen">오늘 할 일<br><span class="chk">☑</span> ...</div>
</div>
```

### 9) 실연 캡처 자리 (placeholder)
```html
<div class="shotrow">
  <div class="shot reveal d3">［ 셀러라이프 필터 화면 캡처 ］</div>
  <div class="shot reveal d4">［ GPTs 키워드 대화 캡처 ］</div>
</div>
<div class="shotcap reveal d5">* 실제 강의에선 라이브 화면 공유</div>
```

### 10) 후기 월 (사회적 증거)
```html
<section class="slide swall dark">
  <div class="wall" data-reviews="50" data-path="reviews/r"></div>
  <div class="veil"></div>
  <div class="rtext">
    <div class="rkick reveal d1">수강생 후기</div>
    <h1 class="rh1 reveal d2">제목 <span class="u">강조</span></h1>
    <div class="rsub reveal d3">설명 <b>강조</b></div>
    <div class="rbig reveal d5">손글씨</div>
  </div>
  <div class="pageft reveal d4" style="color:#caa9b0">PART {N} · {섹션명}</div>
</section>
```

### 11) 오퍼 박스 (유료 전환)
```html
<div class="offer reveal d3">
  <div class="oh">토요일 오프라인 5회 · 200만원</div>
  <div class="orow">강남/선릉 · 매주 토요일</div>
  <div class="orow">월 1회 평생 스터디</div>
  <div class="orow">불사자 풀버전 사용권</div>
</div>
```

## 톤 가드 (전 섹션 공통, 어기지 말 것)
- ❌ 상위노출 보장 / 가구매·어뷰징 산식 / 전액환불·순익 보장 / 좌석 카운트다운식 허위 긴급성 / 거액 가격 앵커 후 인하
- ⚠️ 매출·부동산·순익·세금 수치 단정 → "본인 확인 후" 톤. "거의 안 낸다/1% 미만" 금지
- 빌리브로식 위험기법은 용팀장 톤(신청서 선별·합법 SEO·현금흐름)으로 순화
