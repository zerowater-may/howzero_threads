# CLAUDE.md — 용팀장 무료강의 패키지 작업 지침

다른 Claude Code(또는 사람)가 이 폴더를 받아 **용팀장 스타일로 모든 섹션을 보고·수정·확장**할 수 있게 하는 안내서다.
작업 전 [DESIGN.md](DESIGN.md)(디자인 시스템)와 `docs/`(브랜드/페르소나/wiki)를 먼저 읽는다.

> ⚠️ **톤 가드 필수**: 상위노출 보장·가구매·전액환불·순익 보장·허위 긴급성·거액 가격 앵커 후 인하 금지. 수치(매출/부동산/세금)는 "본인 확인 후" 톤. 자세한 건 DESIGN.md §6.

---

## 1. 이 패키지가 뭔가

용팀장의 **2026-06-08 무료강의(120분) → 토요일 오프라인 5회 200만원 실전반** 전환 자료 묶음.
- **강의 슬라이드(PPT)** — PART 1~10 섹션 덱 (HTML)
- **좌우 비교** — 레퍼런스(빌리브로) 원본 vs 용팀장 변환 + 각 파트에서 슬라이드로 점프
- 전부 **상대경로 + 로컬 폰트**라 인터넷 없이, 압축해서 옮겨도 그대로 열림. 입구는 `START.html`.

## 2. 파일 맵

```
START.html                         ← 입구 (슬라이드 / 좌우비교 진입)
DESIGN.md                          ← 디자인 시스템 (색·폰트·패턴·톤가드)
CLAUDE.md                          ← (이 파일) 작업 지침
docs/
  wiki/BraveYong *.md              ← 브랜드 브레인 (페르소나·플레이북·퍼널·벤치마크)
  braveyong_persona.md             ← 페르소나 원본
  DECK-GUIDE.md                    ← 슬라이드 패턴 복붙 치트시트
  STRUCTURE.md                     ← 빌리브로 웨비나 구조 분석(레퍼런스)
braveyong_misc_free-webinar-2026-06-08-deck/   ← 강의 슬라이드(PPT)
  deck.css                         ← 공유 디자인(색·폰트·패턴). 전체 톤은 여기서
  deck.js                          ← 공유 런타임(HUD·네비·진행바·후기월 자동)
  index.html                       ← 섹션 런처
  section-1-opening.html ~ section-10-closing.html
  face.jpg                         ← 용팀장 사진(커버용)
  fonts/                           ← Pretendard·NanumPenScript·Gaegu (오프라인용)
  reviews/r01~r50.png              ← 후기 50장(후기월)
braveyong_misc_ref-billiebro-free-webinar/     ← 좌우 비교
  comparison.html                  ← 좌우 비교 뷰 (PARTS 배열이 본문)
  editor.html                      ← ✏️ 스크립트 CRUD 편집기 (추가·수정·삭제·저장)
  scripts.js                       ← 파트 1~10 전문 스크립트(좌/우) — 편집기가 읽고 씀
  slides.js                        ← 빌리브로 PPT 썸네일 ↔ 파트 매핑
  slides/sNNN.png                  ← 빌리브로 PPT 썸네일 114장
```

## 3. 어느 섹션이든 수정하는 법

### (A) 특정 섹션 슬라이드 내용/문구 고치기
1. 해당 `braveyong_misc_free-webinar-2026-06-08-deck/section-{N}-*.html`을 연다.
2. `<section class="slide ...">` 블록의 텍스트·클래스를 고친다. 패턴은 DESIGN.md §5 / `docs/DECK-GUIDE.md`.
3. 브라우저로 그 파일을 새로고침해 확인. (네비/HUD/진행바는 deck.js가 자동)
- 슬라이드 **추가**: `<section class="slide ...">…</section>`를 한 블록 더 넣으면 카운터·도트 자동 증가. 첫 장에만 `active`.
- **다크 슬라이드**(커버/후기월/세일즈): `class="slide cover dark"` 처럼 `dark` 부여 → HUD 자동 반전.

### (B) 전체 디자인(색·폰트·여백) 바꾸기
- `deck.css` 한 곳만 고친다. `:root` 토큰(예: `--red` 버건디) 바꾸면 전 섹션 일괄 반영.
- 폰트 교체: `fonts/`에 woff2 넣고 deck.css `@font-face` src 수정.

### (C) 네비/진행바/후기월 동작 바꾸기
- `deck.js`. 후기월은 `<div class="wall" data-reviews="50" data-path="reviews/r">`의 속성으로 장수/경로 제어.

### (D) 좌우 비교(레퍼런스↔용팀장) 고치기
- `comparison.html` 안의 **`PARTS` 배열**이 본문(각 파트의 제목·요지·발화·세부 bullet·톤가드).
- 좌우 비교의 **🎬 슬라이드 링크**는 `DECK`/`DECKBASE` 상수(상대경로)로 섹션 덱과 연결.

### (E) 섹션별 전문 스크립트 CRUD — **`editor.html`** (코딩 없이 수동 편집)
- `comparison.html` 상단 **✏️ 스크립트 편집기** 버튼 또는 `editor.html` 직접 열기.
- PART 1~10 탭별로 용팀장/빌리브로 문단을 **추가·수정·삭제·순서변경**.
- **💾 저장(브라우저)**: localStorage에 저장 → `comparison.html` 새로고침하면 즉시 반영(같은 브라우저).
- **⬇ 파일로 내보내기**: `scripts.js` 다운로드 → 폴더의 `scripts.js`에 덮어쓰면 **영구 저장 + 압축 전달/다른 PC에도 반영**.
- **📂 불러오기 / ↺ 초기화** 지원. (코드로 고칠 땐 `scripts.js`의 `window.SCRIPTS[n].rscript/lscript` 직접 수정)

## 4. 새 섹션 덱 만들기 (용팀장 스타일 유지)

1. `docs/DECK-GUIDE.md`의 head 보일러플레이트 복사 → `section-{N}-{slug}.html`.
2. `deck.css` + `deck.js`만 include. 슬라이드 마크업만 작성(패턴 조합).
3. 카피는 페르소나(`docs/braveyong_persona.md`, `docs/wiki/BraveYong Persona.md`)와 톤가드를 따른다.
4. 섹션 첫 장 = 커버(다크), 본문 = 종이, 좌하단 `pageft`에 "PART N · 섹션명".

## 5. 압축/배포

- 이 폴더(`braveyong_webinar-deliver/`) **통째로** 압축해 전달하면 어디서든 `START.html`로 열린다.
- 모든 링크·이미지·스크립트·폰트가 상대경로/로컬이라 인터넷 없이도 동작.
- 폴더 구조(두 하위 폴더가 형제)를 유지해야 좌우비교→슬라이드 `../` 링크가 산다. 폴더째 복사/압축할 것.
