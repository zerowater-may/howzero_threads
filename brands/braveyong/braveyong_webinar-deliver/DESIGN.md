# 용팀장 무료강의 — 디자인 시스템 (DESIGN.md)

다른 AI(Claude Code 등)나 사람이 **용팀장 스타일**로 슬라이드/HTML을 만들거나 고칠 때 이 문서를 기준으로 한다.
공유 구현체는 `braveyong_misc_free-webinar-2026-06-08-deck/deck.css` + `deck.js`.

---

## 1. 브랜드

- 화자: **용감한 용팀장** — 9살·7살 키우는 직장인 육아아빠, 직접 다 깨져본 실전 셀러.
- 대상: 구매대행 / 스마트스토어 / 네이버 SEO 초보~중급 셀러.
- 톤: 직설적·실전·봉사. 도발 뒤 반드시 근거·순서·체크리스트. 현금흐름·순익 중심.
- 핵심 무기: 불사자(SEO 자동화·마노태그·상세페이지), 효자상품(많이 말고 제대로), AI 무재고 셀링.

## 2. 색 토큰 (deck.css `:root`)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--red` | `#7c1f38` | **버건디(브랜드 메인)** — 숫자·키커·강조 |
| `--burg-bright` | `#b9324f` | 밝은 버건디 — 다크 배경 위 강조/형광밑줄 |
| `--burg-dk` | `#1a070e` | 다크 버건디 배경(커버/후기월) |
| `--paper` | `#f2ede2` | 따뜻한 종이 본문 배경 |
| `--card` | `#fffdf5` | 카드/메모지 |
| `--ink` | `#16130d` | 먹색 본문 텍스트 |
| `--soft` | `#6e6557` | 보조 텍스트 |
| `--hl` | `#ffe24a` | 형광펜 노랑 (라이트 본문 강조) |

대비 구조: **커버/후기월/세일즈 = 다크 버건디**, **본문 = 따뜻한 종이 + 버건디 액센트**.

## 3. 폰트 (로컬 동봉 — 오프라인 OK)

`braveyong_misc_free-webinar-2026-06-08-deck/fonts/` 안에 woff2 동봉. deck.css 상단 `@font-face`로 로컬 로드.

| 패밀리 | 파일 | 용도 | 클래스 |
|---|---|---|---|
| Pretendard | `Pretendard.woff2` | 본문/헤드라인 | (기본) |
| Nanum Pen Script | `NanumPenScript.woff2` | 손글씨 메모/액센트 | `.pen` `.note` `.hand` `.handabs` `.csub` |
| Gaegu | `Gaegu-400.woff2` | 보조 손글씨 | `.gae` |

> CDN `<link>`도 head에 있으나(온라인 보강용), 로컬 @font-face가 있어 인터넷 없어도 안 깨진다.

## 4. 덱 골격 (16:9)

- 무대 `.stage` = 16:9 고정, 종이 그레인.
- 슬라이드 `.slide` 1장씩 표시. 첫 장에 `active`.
- `deck.js`가 진행바·HUD(도트/카운터)·좌우 클릭존·키보드(←/→/Space/Home/End)·후기월을 **자동 주입**.
- 슬라이드에 `class="dark"` → 그 슬라이드에서 HUD가 밝은 톤으로 전환(커버/후기월/세일즈용).
- 등장 애니메이션: 요소에 `reveal d1`~`d8`(순차 지연).

## 5. 재사용 패턴 (deck.css 클래스)

상세 예제·복붙 스니펫은 `braveyong_misc_free-webinar-2026-06-08-deck/DECK-GUIDE.md` 참조. 요약:

| 패턴 | 클래스 | 쓰임 |
|---|---|---|
| 섹션 커버(다크+사진) | `cover dark` + `cphoto`/`cgrad`/`ctext`/`ckick`/`ch1`/`csub`/`cwho` | 섹션 첫 장 |
| 후기/캡처 월 | `swall dark` + `wall[data-reviews][data-path]` + `veil`/`rtext` | 사회적 증거 |
| 큰 진술 | `lead`/`punch`/`sub` + `hl`/`hlb` 강조 | 본문 핵심 |
| 큰 숫자 | `stat`/`statcap` | 충격 수치 |
| 번호 리스트 | `list`/`item`/`no`/`nm`/`desc` | 3종 자료 등 |
| 가로 플로우 | `flow`/`step`/`si`/`sn`/`arr`/`dim` | 단계 |
| 비교 카드 | `cards c4`/`c3`/`c2` + `card`(정답엔 `win`) | 네 갈래 길 등 |
| 태그 칩 | `tags`/`tag-chip`(강조 `on`) | SEO 7요소 |
| 메모지 | `memo`/`pen`/`chk` | 손글씨 노트 |
| 실연 캡처 자리 | `shotrow`/`shot`/`shotcap` | 라이브 캡처 placeholder |
| 오퍼 박스 | `offer`/`oh`/`orow` | 유료 전환 |
| 손글씨 | `pen`/`note`/`hand`/`handabs`(절대위치) | 액센트 |
| 형광/취소 | `hl`(노랑)/`hlb`(버건디)/`strike` | 강조 |

## 6. 톤 가드 (반드시 지킴 — 어기면 용팀장 아님)

- ❌ 상위노출 보장 / 가구매·어뷰징 산식 / 전액환불·순익 보장 / 좌석 카운트다운식 허위 긴급성 / 거액 가격 앵커 후 라이브 인하
- ⚠️ 매출·부동산·순익·세금 수치는 단정 금지 → "본인 확인 후" 톤. "거의 안 낸다 / 1% 미만" 금지
- 레퍼런스(빌리브로)의 위험 기법은 **용팀장 톤(신청서 선별·합법 SEO·현금흐름)으로 순화**하거나 "저는 그렇게 안 합니다"로 거부
- 유료 오퍼는 **토요일 오프라인 5회 200만원 + 월1회 평생 스터디 + 불사자 풀버전**, 신청서 선별 톤

## 7. 파일 컨벤션

- 섹션 덱: `section-{N}-{slug}.html` (N=1~10). head는 DECK-GUIDE의 보일러플레이트.
- 새 섹션도 `deck.css` + `deck.js`만 include하면 디자인·네비 자동.
- 실연 화면은 실제 캡처가 생기면 `.shot` placeholder를 `<img src>`로 교체.
