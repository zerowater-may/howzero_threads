# 불사자 네이버 카페 대문 리뉴얼 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 불사자 네이버 카페 대문을 두 핵심 배너(용감한 용팀장 / 불사자)로 리뉴얼한다. PNG 2장 + 네이버 카페 에디터용 table HTML 스니펫 산출.

**Architecture:** HTML 템플릿 → Puppeteer로 960×360 PNG 렌더 (`scripts/content_carousel/capture.mjs` 패턴 그대로). 카페 에디터는 inline-style table만 지원하므로 최종 wrapper는 순수 `<table>`. 두 브랜드 톤은 각자 유지(병치) — 용팀장=순흑백+빨간 손글씨, 불사자=웜 베이지+오렌지 1포인트.

**Tech Stack:** Node 22 + Puppeteer ^24.42.0, Pretendard webfont, Gaegu(한글 손글씨) webfont, HTML5 + inline CSS.

**Spec:** `docs/superpowers/specs/2026-05-27-bulsaja-naver-cafe-renewal-design.md`

---

## File Structure

**Create:**
- `brands/bulsaja/INDEX.md` — 신규 브랜드 인덱스
- `brands/bulsaja/bulsaja_misc_naver-cafe-banner.png` — 불사자 배너 (Task 4 렌더 결과)
- `brands/braveyong/braveyong_misc_naver-cafe-banner.png` — 용팀장 배너 (Task 3 렌더 결과)
- `brands/howzero/howzero_misc_naver-cafe-bulsaja-renewal.html` — 카페 에디터 붙여넣기용 table HTML
- `scripts/naver_cafe_banner/package.json` — puppeteer 의존성
- `scripts/naver_cafe_banner/capture.mjs` — HTML → PNG 렌더러
- `scripts/naver_cafe_banner/banner-braveyong.html` — 용팀장 배너 템플릿
- `scripts/naver_cafe_banner/banner-bulsaja.html` — 불사자 배너 템플릿
- `scripts/naver_cafe_banner/README.md` — 사용 가이드 (재렌더 + 카페 업로드 절차)

**Modify:**
- `brands/INDEX.md` — bulsaja 브랜드 entry 추가
- `brands/braveyong/INDEX.md` — naver-cafe-banner.png 1회성 자료 entry 추가

---

## Task 1: brands/bulsaja/ 폴더 + INDEX.md 신설

**Files:**
- Create: `brands/bulsaja/INDEX.md`
- Modify: `brands/INDEX.md`

- [ ] **Step 1: brands/bulsaja/ 디렉토리 생성 + INDEX.md 작성**

```bash
mkdir -p brands/bulsaja
```

`brands/bulsaja/INDEX.md` 내용:

```markdown
# bulsaja — 불사자

> 4050 한국 이커머스 셀러 대상 AI 도구 SaaS. 토스·Notion 따뜻한 프리미엄 톤, 브랜드 오렌지 `#FF5A00` 포인트 사용.

## 브랜드 자산 / 시스템

- 디자인 시스템: `.claude/skills/bulsaja-design/SKILL.md` (글로벌 스킬)
- 코드베이스 (별도 repo): `~/Dropbox/zerowater/firelion/bulsaja/bulsaja-issue/`
- 홈페이지: https://bulsaja.com
- 채널톡: https://www.bulsaja.channel.io
- 오픈톡: https://open.kakao.com/o/g6v6tKlg

## 1회성 자료

| 파일 | 의미 |
|---|---|
| `bulsaja_misc_naver-cafe-banner.png` | 불사자 네이버 카페 대문 배너 (960×360, 2026-05-27 리뉴얼). spec: `docs/superpowers/specs/2026-05-27-bulsaja-naver-cafe-renewal-design.md` |
```

- [ ] **Step 2: brands/INDEX.md 에 bulsaja 항목 추가**

`brands/INDEX.md` 의 브랜드 목록 섹션에 한 줄 추가 (다른 브랜드 entry 패턴 그대로 따름).

먼저 현재 상태 확인:

```bash
cat brands/INDEX.md
```

기존 entry 사이에 다음 라인을 알파벳/논리 순서에 맞춰 삽입 (braveyong 다음, howzero 앞):

```markdown
- [bulsaja/](./bulsaja/INDEX.md) — 4050 셀러 AI 도구 SaaS (불사자). 본 repo는 콘텐츠만 — 코드베이스는 `firelion/bulsaja/bulsaja-issue`.
```

- [ ] **Step 3: 검증**

```bash
ls brands/bulsaja/INDEX.md
cat brands/INDEX.md | grep bulsaja
```

Expected: 파일 존재 + `brands/INDEX.md` 에 `bulsaja` 단어가 새 라인으로 보임.

- [ ] **Step 4: 커밋**

```bash
git add brands/bulsaja/INDEX.md brands/INDEX.md
git commit -m "feat(brands): bulsaja 브랜드 폴더 신설 + INDEX 등록"
```

---

## Task 2: scripts/naver_cafe_banner/ 디렉토리 셋업

**Files:**
- Create: `scripts/naver_cafe_banner/package.json`
- Create: `scripts/naver_cafe_banner/capture.mjs`

- [ ] **Step 1: 디렉토리 생성 + package.json 작성**

```bash
mkdir -p scripts/naver_cafe_banner
```

`scripts/naver_cafe_banner/package.json`:

```json
{
  "name": "naver_cafe_banner",
  "version": "1.0.0",
  "description": "HTML 템플릿을 960x360 PNG로 렌더해서 네이버 카페 대문 배너로 쓴다.",
  "type": "module",
  "scripts": {
    "render:braveyong": "node capture.mjs banner-braveyong.html ../../brands/braveyong/braveyong_misc_naver-cafe-banner.png",
    "render:bulsaja": "node capture.mjs banner-bulsaja.html ../../brands/bulsaja/bulsaja_misc_naver-cafe-banner.png",
    "render:all": "npm run render:braveyong && npm run render:bulsaja"
  },
  "dependencies": {
    "puppeteer": "^24.42.0"
  }
}
```

- [ ] **Step 2: capture.mjs 작성**

`scripts/naver_cafe_banner/capture.mjs`:

```javascript
// HTML 파일을 960×360 (deviceScaleFactor 2 → 1920×720 px 실제) PNG로 렌더한다.
// content_carousel/capture.mjs 패턴 단순화 버전.
// Usage: node capture.mjs <html-path> <out-png-path>
import path from "path";
import puppeteer from "puppeteer";

async function main() {
  const [, , htmlPath, outPath] = process.argv;
  if (!htmlPath || !outPath) {
    console.error("Usage: node capture.mjs <html-path> <out-png-path>");
    process.exit(1);
  }
  const url = `file://${path.resolve(htmlPath)}`;
  const launchArgs = process.getuid?.() === 0
    ? ["--no-sandbox", "--disable-setuid-sandbox"]
    : [];
  const browser = await puppeteer.launch({ headless: "new", args: launchArgs });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 960, height: 360, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");
    await page.screenshot({
      path: path.resolve(outPath),
      type: "png",
      clip: { x: 0, y: 0, width: 960, height: 360 },
    });
    console.log(`captured ${outPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: 의존성 설치**

```bash
cd scripts/naver_cafe_banner
npm install
```

Expected: `node_modules/` 생성, `puppeteer` 설치 (Chromium 다운로드 ~150MB 시간 소요 가능).

설치 후 working directory 원복:

```bash
cd ../..
```

- [ ] **Step 4: capture.mjs dry-run (도움말)**

```bash
node scripts/naver_cafe_banner/capture.mjs
```

Expected: `Usage: node capture.mjs <html-path> <out-png-path>` 출력 + exit code 1.

- [ ] **Step 5: 커밋**

`.gitignore` 에 `scripts/naver_cafe_banner/node_modules/` 가 포함되는지 확인. 안 되어 있으면 추가:

```bash
echo "scripts/naver_cafe_banner/node_modules/" >> .gitignore
```

(기존 `scripts/content_carousel/node_modules/` 패턴 따름. 이미 root .gitignore에 `node_modules` 글로벌 룰이 있으면 추가 불필요 — 먼저 `cat .gitignore | grep node_modules` 확인.)

```bash
git add scripts/naver_cafe_banner/package.json scripts/naver_cafe_banner/capture.mjs
# .gitignore 수정했으면 함께 add
git add .gitignore 2>/dev/null || true
git commit -m "feat(scripts): naver_cafe_banner Puppeteer 렌더러 셋업"
```

`package-lock.json` 도 함께 추적한다 (기존 `scripts/content_carousel/package-lock.json` 이 추적 중이라 동일 컨벤션).

```bash
git add scripts/naver_cafe_banner/package-lock.json
```

---

## Task 3: 용팀장 배너 HTML template 작성 + 렌더

**Files:**
- Create: `scripts/naver_cafe_banner/banner-braveyong.html`
- Create (rendered): `brands/braveyong/braveyong_misc_naver-cafe-banner.png`
- Modify: `brands/braveyong/INDEX.md`

- [ ] **Step 1: banner-braveyong.html 작성**

`scripts/naver_cafe_banner/banner-braveyong.html`:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>용감한 용팀장 배너</title>
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Gaegu:wght@700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 960px; height: 360px; overflow: hidden; }
  body {
    background: #FFFFFF;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #0A0A0A;
  }
  .banner {
    width: 960px;
    height: 360px;
    padding: 44px 56px;
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto 1fr auto;
    column-gap: 32px;
    row-gap: 0;
  }
  .label {
    grid-column: 1 / -1;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.22em;
    color: #8A8A8A;
    text-transform: uppercase;
  }
  .headline {
    grid-column: 1 / -1;
    align-self: center;
    font-size: 58px;
    font-weight: 900;
    line-height: 1.12;
    letter-spacing: -0.025em;
    margin-top: 4px;
  }
  .headline .marker {
    font-family: 'Gaegu', 'Pretendard', cursive;
    color: #E0301E;
    font-weight: 700;
    display: inline-block;
    transform: rotate(-1.2deg);
    border-bottom: 4px solid #E0301E;
    padding: 0 2px;
  }
  .right-stamp {
    grid-row: 2;
    grid-column: 2;
    align-self: center;
    font-family: 'Gaegu', cursive;
    color: #E0301E;
    font-size: 22px;
    transform: rotate(6deg);
    border: 2px solid #E0301E;
    border-radius: 50%;
    width: 110px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1.1;
    padding: 6px;
  }
  .footer {
    grid-column: 1 / -1;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .sub {
    font-size: 18px;
    font-weight: 500;
    line-height: 1.5;
    color: #404040;
  }
  .sub b { color: #0A0A0A; font-weight: 700; }
  .cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #0A0A0A;
    color: #FFFFFF;
    font-size: 18px;
    font-weight: 800;
    padding: 16px 26px;
    border-radius: 10px;
    letter-spacing: -0.01em;
  }
</style>
</head>
<body>
<div class="banner">
  <div class="label">용감한 용팀장 · GIGCLASS</div>
  <div class="headline">감으로 올리지 마세요.<br><span class="marker">데이터로 파세요.</span></div>
  <div class="right-stamp">팩폭<br>주의</div>
  <div class="footer">
    <div class="sub"><b>스마트스토어 · 쿠팡 · 구매대행</b><br>SEO부터 상세페이지까지</div>
    <div class="cta">강의 보러가기 →</div>
  </div>
</div>
</body>
</html>
```

- [ ] **Step 2: 렌더 실행**

```bash
cd scripts/naver_cafe_banner
npm run render:braveyong
cd ../..
```

Expected stdout: `captured ../../brands/braveyong/braveyong_misc_naver-cafe-banner.png`

- [ ] **Step 3: PNG 크기 검증**

```bash
file brands/braveyong/braveyong_misc_naver-cafe-banner.png
```

Expected: `PNG image data, 1920 x 720, 8-bit/color RGB(A), non-interlaced` (deviceScaleFactor 2 → 1920×720 실제 픽셀, 960×360 표시 사이즈).

- [ ] **Step 4: 시각 검수**

```bash
open brands/braveyong/braveyong_misc_naver-cafe-banner.png
```

체크리스트 (전부 만족해야 PASS):

1. 배경 순백
2. 메인 텍스트 "감으로 올리지 마세요." (1줄) + "데이터로 파세요." (2번째 줄, 빨간 손글씨 marker + 밑줄)
3. 우측 빨간 동그라미 도장 "팩폭 주의"
4. 좌하단 서브카피 "스마트스토어 · 쿠팡 · 구매대행" + "SEO부터 상세페이지까지"
5. 우하단 검정 박스 CTA "강의 보러가기 →"
6. 텍스트가 잘리거나 캔버스를 벗어나지 않음

- [ ] **Step 5: brands/braveyong/INDEX.md 업데이트**

`brands/braveyong/INDEX.md` 의 raw 폴더 표 또는 1회성 자료 섹션에 한 줄 추가. 기존 파일에 `braveyong_misc_lecture-content-knowhow.md` entry가 있는 패턴 따라:

```markdown
| `braveyong_misc_naver-cafe-banner.png` | 불사자 네이버 카페 대문용 용팀장 배너 (960×360, 2026-05-27). spec: `docs/superpowers/specs/2026-05-27-bulsaja-naver-cafe-renewal-design.md` |
```

(정확한 위치는 INDEX.md 의 기존 구조 확인 후 가장 자연스러운 곳에 삽입)

- [ ] **Step 6: 커밋**

```bash
git add scripts/naver_cafe_banner/banner-braveyong.html brands/braveyong/braveyong_misc_naver-cafe-banner.png brands/braveyong/INDEX.md
git commit -m "feat(braveyong): 네이버 카페 대문용 용팀장 배너 PNG 추가"
```

---

## Task 4: 불사자 배너 HTML template 작성 + 렌더

**Files:**
- Create: `scripts/naver_cafe_banner/banner-bulsaja.html`
- Create (rendered): `brands/bulsaja/bulsaja_misc_naver-cafe-banner.png`

- [ ] **Step 1: banner-bulsaja.html 작성**

`scripts/naver_cafe_banner/banner-bulsaja.html`:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>불사자 배너</title>
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 960px; height: 360px; overflow: hidden; }
  body {
    background: #FAF6F0;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #2A2520;
  }
  .banner {
    width: 960px;
    height: 360px;
    padding: 44px 56px;
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto 1fr auto;
    column-gap: 32px;
  }
  .label {
    grid-column: 1;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: #8B7E6E;
    text-transform: uppercase;
  }
  .badge {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
    background: #FFFFFF;
    border: 1px solid #E5DFD2;
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #5A4F44;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .badge .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #FF5A00;
  }
  .headline {
    grid-column: 1 / -1;
    align-self: center;
    font-size: 64px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }
  .footer {
    grid-column: 1 / -1;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .sub {
    font-size: 18px;
    font-weight: 500;
    line-height: 1.55;
    color: #5A4F44;
  }
  .sub b { color: #2A2520; font-weight: 700; }
  .cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #FF5A00;
    color: #FFFFFF;
    font-size: 18px;
    font-weight: 800;
    padding: 16px 28px;
    border-radius: 10px;
    letter-spacing: -0.01em;
  }
</style>
</head>
<body>
<div class="banner">
  <div class="label">BULSAJA · 불사자</div>
  <div class="badge"><span class="dot"></span>4050 사장님 옆에 24시간</div>
  <div class="headline">사장님 옆에 AI 팀.</div>
  <div class="footer">
    <div class="sub"><b>상품명 · 키워드 · 광고</b>까지<br>클릭 한 번에 끝</div>
    <div class="cta">지금 사용해보기 →</div>
  </div>
</div>
</body>
</html>
```

- [ ] **Step 2: 렌더 실행**

```bash
cd scripts/naver_cafe_banner
npm run render:bulsaja
cd ../..
```

Expected stdout: `captured ../../brands/bulsaja/bulsaja_misc_naver-cafe-banner.png`

- [ ] **Step 3: PNG 크기 검증**

```bash
file brands/bulsaja/bulsaja_misc_naver-cafe-banner.png
```

Expected: `PNG image data, 1920 x 720, 8-bit/color RGB(A), non-interlaced`

- [ ] **Step 4: 시각 검수**

```bash
open brands/bulsaja/bulsaja_misc_naver-cafe-banner.png
```

체크리스트:

1. 배경 웜 베이지 `#FAF6F0`
2. 좌상단 라벨 "BULSAJA · 불사자" (회색 작은 글씨)
3. 우상단 둥근 배지 "4050 사장님 옆에 24시간" + 오렌지 도트
4. 중앙 헤드라인 "사장님 옆에 AI 팀." (다크 그레이, 굵게)
5. 좌하단 서브카피 "상품명 · 키워드 · 광고까지" + "클릭 한 번에 끝"
6. 우하단 오렌지 박스 CTA "지금 사용해보기 →"
7. 오렌지는 CTA + 배지 도트 2곳만 (bulsaja-design 절대 가드: 대면적 오렌지 금지)
8. Sparkles/이모지 0개 (bulsaja-design 절대 가드)

- [ ] **Step 5: 커밋**

```bash
git add scripts/naver_cafe_banner/banner-bulsaja.html brands/bulsaja/bulsaja_misc_naver-cafe-banner.png
git commit -m "feat(bulsaja): 네이버 카페 대문용 불사자 배너 PNG 추가"
```

---

## Task 5: 네이버 카페 HTML 스니펫 + 사용 가이드 README

**Files:**
- Create: `brands/howzero/howzero_misc_naver-cafe-bulsaja-renewal.html`
- Create: `scripts/naver_cafe_banner/README.md`
- Modify: `brands/howzero/INDEX.md`

- [ ] **Step 1: 카페 에디터 HTML 스니펫 작성**

`brands/howzero/howzero_misc_naver-cafe-bulsaja-renewal.html`:

```html
<!--
  불사자 네이버 카페 대문 — 2026-05-27 리뉴얼 ver

  사용 절차:
  1. 두 PNG 를 네이버 카페 스마트에디터에 업로드 → cafefiles.pstatic.net 의 실제 URL 받기
     - brands/braveyong/braveyong_misc_naver-cafe-banner.png
     - brands/bulsaja/bulsaja_misc_naver-cafe-banner.png
  2. 아래 IMG_BRAVEYONG_URL, IMG_BULSAJA_URL 두 토큰을 그 URL 로 swap
  3. 카페 관리 → 메뉴 관리 → 대문 관리 → HTML 편집 모드에서 전체 붙여넣기
  4. 미리보기로 확인 후 저장

  주의: 네이버 카페 에디터는 <style> 태그와 class 를 strip 한다. 따라서 모든 스타일은 inline.
        table cellpadding/cellspacing/border 도 명시 (구버전 에디터 호환).
-->

<table cellpadding="0" cellspacing="0" border="0" align="center" style="width:960px;margin:0 auto;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,sans-serif">

  <!-- ===== 용팀장 배너 ===== -->
  <tr>
    <td style="padding:0">
      <a href="https://gigclass.kr" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none">
        <img src="IMG_BRAVEYONG_URL" alt="용감한 용팀장 — 강의 보러가기" width="960" height="360" style="display:block;width:960px;height:360px;border:0">
      </a>
    </td>
  </tr>
  <tr><td style="height:12px;line-height:12px;font-size:0">&nbsp;</td></tr>
  <tr>
    <td style="text-align:right;padding:0 8px">
      <a href="https://open.kakao.com/o/gcjQ8Hpi" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 20px;border:1.5px solid #0A0A0A;border-radius:8px;color:#0A0A0A;font-size:14px;font-weight:700;text-decoration:none">
        용팀장 단톡 입장 →
      </a>
    </td>
  </tr>

  <!-- ===== 디바이더 ===== -->
  <tr><td style="height:32px;line-height:32px;font-size:0">&nbsp;</td></tr>
  <tr><td style="height:1px;line-height:1px;font-size:0;background-color:#E5E5E5">&nbsp;</td></tr>
  <tr><td style="height:32px;line-height:32px;font-size:0">&nbsp;</td></tr>

  <!-- ===== 불사자 배너 ===== -->
  <tr>
    <td style="padding:0">
      <a href="https://www.bulsaja.com" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none">
        <img src="IMG_BULSAJA_URL" alt="불사자 — 지금 사용해보기" width="960" height="360" style="display:block;width:960px;height:360px;border:0">
      </a>
    </td>
  </tr>
  <tr><td style="height:12px;line-height:12px;font-size:0">&nbsp;</td></tr>
  <tr>
    <td style="text-align:right;padding:0 8px">
      <a href="https://open.kakao.com/o/g6v6tKlg" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 20px;border:1.5px solid #8B7E6E;border-radius:8px;color:#2A2520;font-size:14px;font-weight:700;text-decoration:none">
        불사자 단톡 입장 →
      </a>
    </td>
  </tr>

  <!-- ===== 기능 버튼 3개 ===== -->
  <tr><td style="height:32px;line-height:32px;font-size:0">&nbsp;</td></tr>
  <tr>
    <td style="padding:0">
      <table cellpadding="0" cellspacing="0" border="0" width="960" style="width:960px;border-collapse:separate">
        <tr>
          <td width="310" style="width:310px;padding:0 8px 0 0">
            <a href="https://www.youtube.com/channel/UCMi-D1REn7qLeJv8JftwgdA" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;padding:22px 0;background:#FFFFFF;border:1px solid #E5E5E5;border-radius:12px;color:#0A0A0A;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:-0.01em">
              유튜브 채널
            </a>
          </td>
          <td width="310" style="width:310px;padding:0 8px">
            <a href="https://www.bulsaja.channel.io" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;padding:22px 0;background:#FFFFFF;border:1px solid #E5E5E5;border-radius:12px;color:#0A0A0A;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:-0.01em">
              채널톡 문의
            </a>
          </td>
          <td width="310" style="width:310px;padding:0 0 0 8px">
            <a href="https://www.bulsaja.com" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;padding:22px 0;background:#FFFFFF;border:1px solid #E5E5E5;border-radius:12px;color:#0A0A0A;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:-0.01em">
              홈페이지 bulsaja.com
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
```

- [ ] **Step 2: 로컬 브라우저에서 스니펫 시각 검수**

```bash
open brands/howzero/howzero_misc_naver-cafe-bulsaja-renewal.html
```

브라우저에서 열렸을 때 (이미지는 `IMG_BRAVEYONG_URL` 가 깨진 src 이므로 placeholder X 아이콘으로 보임) 다음 확인:

1. table 전체 폭 960px 가운데 정렬
2. img placeholder 슬롯이 정확히 960×360 영역 차지
3. 단톡 버튼 outline 박스가 우측 정렬
4. 디바이더 1px 회색 라인 보임
5. 하단 3개 기능 버튼이 동일 폭 (≈310px) 가로 배치
6. 텍스트 잘림 없음, 모바일에서 줄바꿈 시에도 의미 유지

- [ ] **Step 3: scripts/naver_cafe_banner/README.md 작성**

`scripts/naver_cafe_banner/README.md` (아래 4-backtick fence 안 내용을 README 에 그대로 옮긴다 — fence 자체는 plan 의 nesting 회피용):

````markdown
# naver_cafe_banner

불사자 네이버 카페 대문용 배너 PNG 렌더러. HTML 템플릿을 Puppeteer 로 960×360 PNG 로 굽는다.

설계 spec: `docs/superpowers/specs/2026-05-27-bulsaja-naver-cafe-renewal-design.md`
실행 plan: `docs/superpowers/plans/2026-05-27-bulsaja-naver-cafe-renewal.md`

## 셋업

```bash
cd scripts/naver_cafe_banner
npm install
```

## 렌더

```bash
# 둘 다
npm run render:all

# 따로
npm run render:braveyong
npm run render:bulsaja
```

산출물:

- `brands/braveyong/braveyong_misc_naver-cafe-banner.png` — 1920×720 px (deviceScaleFactor 2, 표시 960×360)
- `brands/bulsaja/bulsaja_misc_naver-cafe-banner.png` — 동일

## 네이버 카페에 적용하는 절차

1. 두 PNG 를 네이버 카페 스마트에디터에 일단 업로드 (어느 게시판 임시글에 첨부) → `cafefiles.pstatic.net/...png` URL 확인
2. `brands/howzero/howzero_misc_naver-cafe-bulsaja-renewal.html` 열어서 `IMG_BRAVEYONG_URL`, `IMG_BULSAJA_URL` 토큰을 그 URL 로 swap
3. 카페 관리 → 메뉴 관리 → 대문 관리 → HTML 편집 모드에 전체 붙여넣기
4. 미리보기 → 저장

## 카피 / 톤 수정하기

각 배너 카피는 HTML 템플릿 상단에 직접 박혀 있다. `banner-*.html` 의 `.headline`, `.sub`, `.cta`, `.label`, `.badge`, `.right-stamp` 안 텍스트만 수정 후 재렌더하면 된다.

## 디자인 제약 (지킬 것)

- 용팀장 = 순흑백 + 빨간 손글씨 (Gaegu) 액센트. 강한 팩폭 카피.
- 불사자 = 웜 베이지 `#FAF6F0` + 다크 그레이 텍스트. 오렌지 `#FF5A00` 은 CTA 1곳 + 배지 도트만. 대면적 오렌지 X, Sparkles X, 이모지 X. (`.claude/skills/bulsaja-design/SKILL.md` 절대 가드)
````

- [ ] **Step 4: brands/howzero/INDEX.md 업데이트**

`brands/howzero/INDEX.md` 의 1회성 자료(`howzero_misc_*`) 섹션에 한 줄 추가:

```markdown
| `howzero_misc_naver-cafe-bulsaja-renewal.html` | 불사자 네이버 카페 대문 리뉴얼 HTML 스니펫 (2026-05-27). spec/plan: `docs/superpowers/{specs,plans}/2026-05-27-bulsaja-naver-cafe-renewal*.md` |
```

(정확한 위치는 INDEX.md 의 기존 misc 자료 표 구조 확인 후 삽입)

- [ ] **Step 5: 커밋**

```bash
git add brands/howzero/howzero_misc_naver-cafe-bulsaja-renewal.html scripts/naver_cafe_banner/README.md brands/howzero/INDEX.md
git commit -m "feat(howzero): 불사자 네이버 카페 대문 HTML 스니펫 + 렌더 README"
```

---

## Final Verification (수동)

모든 task 가 끝나면 다음을 확인:

- [ ] `git status` clean (untracked 없음, modified 없음)
- [ ] `git log --oneline -5` 에 4개 커밋이 보임:
  1. `feat(brands): bulsaja 브랜드 폴더 신설 + INDEX 등록`
  2. `feat(scripts): naver_cafe_banner Puppeteer 렌더러 셋업`
  3. `feat(braveyong): 네이버 카페 대문용 용팀장 배너 PNG 추가`
  4. `feat(bulsaja): 네이버 카페 대문용 불사자 배너 PNG 추가`
  5. `feat(howzero): 불사자 네이버 카페 대문 HTML 스니펫 + 렌더 README`
- [ ] `brands/braveyong/braveyong_misc_naver-cafe-banner.png` 1920×720
- [ ] `brands/bulsaja/bulsaja_misc_naver-cafe-banner.png` 1920×720
- [ ] `brands/howzero/howzero_misc_naver-cafe-bulsaja-renewal.html` 브라우저에서 placeholder 와 함께 정상 렌더
- [ ] `npm run render:all` 한 번 더 실행 시 두 PNG 가 재생산되며 git diff 가 거의 동일 (font hash 정도만 변동 가능)

본 plan 의 산출물 자체로는 네이버 카페에 게시되지 않는다. 게시 단계는 사용자가 직접 (a) PNG 업로드 → (b) URL swap → (c) HTML 붙여넣기. README 가 절차를 안내한다.
