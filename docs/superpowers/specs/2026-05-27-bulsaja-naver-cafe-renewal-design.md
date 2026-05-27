# 불사자 네이버 카페 대문 리뉴얼 디자인

> **목적**: 잡다한 배너·잔여 코드로 어수선한 불사자 네이버 카페 대문을 두 핵심 브랜드(용감한 용팀장 / 불사자) 50:50 동등 노출 구조로 리뉴얼한다.
> **카페**: `cafe.naver.com/minisnomad` (불사자 카페)
> **결정 컨텍스트**: Q1=A(50:50 동등) / Q2=A(각자 톤 유지 병치) / Q3=D(상하 풀폭 + 하단 기능 버튼)
> **작성일**: 2026-05-27

---

## 1. 문제 인식

### 1.1 현재 대문의 문제

원본 HTML 분석 (네이버 카페 에디터 출력)에서 발견된 이슈:

- **잡음 배너 다수**: 빌리브로 GIF(645×244), 엔잡곰불사자(960×299), `자산_27`(834×261) — 모두 정체/CTA 불분명
- **카톡방 3개 분산**: `gHbUfFDg`, `sSJNCQie`, `g6v6tKlg` — 어느 게 어느 브랜드 방인지 불명
- **chrome extension 잔여 div**: `1688-aibuy-*`, `cbu-aibuy-*` — 카페 본 콘텐츠와 무관한 침투 코드
- **브랜드 식별 약함**: 카페 본진(불사자)과 콜라보(용팀장)의 관계가 시각적으로 안 보임

### 1.2 리뉴얼 목표

1. **두 브랜드 동등 노출** — 어느 한 쪽이 밀리지 않는 50:50 비중
2. **각 브랜드 톤 보존** — 통합 톤으로 뭉개지 않고 각자 시각 정체성 살림
3. **방문자 다음 행동 명확화** — 각 배너당 primary CTA 1개 + 단톡 입장 secondary CTA 1개
4. **카페 utility 정리** — 유튜브/채널톡/홈페이지 3개로 압축

---

## 2. 레이아웃 설계

### 2.1 폭

카페 대문 표준 폭 **960px**. 원본도 와이드 배너가 960px 기준이라 이 폭을 따른다.

### 2.2 수직 스택 구조

```
┌──────────────────────────────────────────────┐  ← 폭 960px
│                                              │
│   용감한 용팀장 배너          960 × 360      │
│   [강의 보러가기 →]  [용팀장 단톡 입장]      │
│                                              │
├──── 32px 간격 + 1px 회색 디바이더 ────────┤
│                                              │
│   불사자 배너                 960 × 360      │
│   [지금 사용해보기 →]  [불사자 단톡 입장]    │
│                                              │
├──── 24px 간격 ───────────────────────────────┤
│                                              │
│   [ 유튜브 ]  [ 채널톡 ]  [ bulsaja.com ]   │  3 × 320px × 80px
│                                              │
└──────────────────────────────────────────────┘
```

**배너 순서**: 용팀장 위 → 불사자 아래. 카페 식별(불사자)은 네이버 카페 헤더가 처리하므로 대문은 "오늘 무엇을 할 것인가"의 hook 강도 순으로 배치. 용팀장의 팩폭 카피가 더 강한 시선 유도. 마케팅 결과에 따라 순서 flip 가능 (구현 시 HTML 블록만 위치 swap).

### 2.3 모바일 대응

네이버 카페 모바일 앱은 자체 렌더링 룰을 따른다 (이미지 자동 fit). PC 기준 960×360 PNG가 모바일에서도 폭에 맞춰 비례 축소되므로 추가 모바일 시안은 만들지 않는다. 단 **CTA 영역의 텍스트 가독성**을 위해 PNG 안 텍스트는 모바일에서 줄어들어도 읽힐 수 있는 크기로 설계한다 (헤드 60px+, 서브 28px+).

---

## 3. 두 배너 디자인 토큰

### 3.1 용감한 용팀장 배너 (960 × 360)

| 항목 | 값 |
|---|---|
| 배경 | 순백 `#FFFFFF` |
| 메인 텍스트 | 블랙 `#0A0A0A` |
| 액센트 | 빨간 손글씨 1줄 `#E0301E` (밑줄/마커 효과) |
| 폰트 | Pretendard Black (헤드) + Pretendard Medium (서브) + 나눔손글씨/배민(액센트) |
| 헤드 카피 | **"감으로 올리지 마세요. 데이터로 파세요."** |
| 서브 카피 | "스마트스토어 · 쿠팡 · 구매대행 — SEO부터 상세페이지까지" |
| Primary CTA | 검정 박스 / 화이트 텍스트 "강의 보러가기 →" |
| Secondary CTA | 검정 outline 박스 / 검정 텍스트 "용팀장 단톡 입장" |
| 비주얼 요소 | 좌측 60%: 카피 + 손글씨 / 우측 40%: 용팀장 인물 컷 또는 흑백 일러스트 |
| Primary 링크 | `https://gigclass.kr` |
| Secondary 링크 | `https://open.kakao.com/o/gcjQ8Hpi` |

근거: `brands/braveyong/braveyong_persona.md`의 직설/도발/팩폭 + 근거 톤과 `braveyong_landing_ai-selling-v2-portfolio/`의 순흑백 + 손글씨 액센트 스타일 정렬.

### 3.2 불사자 배너 (960 × 360)

| 항목 | 값 |
|---|---|
| 배경 | 웜 베이지 `#FAF6F0` (또는 `--warm-50` hsl(30 20% 98%)) |
| 메인 텍스트 | 다크 그레이 `#2A2520` |
| 액센트 | 브랜드 오렌지 `#FF5A00` — CTA 1곳만 |
| 폰트 | Pretendard SemiBold (헤드) + Pretendard Regular (서브). 숫자는 tabular-nums |
| 헤드 카피 | **"사장님 옆에 AI 팀."** |
| 서브 카피 | "상품명 · 키워드 · 광고까지 — 클릭 한 번에" |
| Primary CTA | 오렌지 박스 `#FF5A00` / 화이트 텍스트 "지금 사용해보기 →" |
| Secondary CTA | 다크 그레이 outline / 다크 그레이 텍스트 "불사자 단톡 입장" |
| 비주얼 요소 | 좌측 55%: 카피 + CTA / 우측 45%: 불사자 UI 스크린샷 부분 컷 (상품명 추천 카드 1장 정도, 모서리 라운드 16px) |
| Primary 링크 | `https://bulsaja.com` |
| Secondary 링크 | `https://open.kakao.com/o/g6v6tKlg` |

근거: `.claude/skills/bulsaja-design/SKILL.md`의 절대 가드 — 오렌지 대면적 금지, 웜 그레이/베이지 배경, Sparkles/이모지 금지, 4050 사장님 호칭, padding 24px+.

### 3.3 두 배너 사이 처리

- 32px 수직 간격
- 1px 회색 `#E5E5E5` 디바이더
- 두 배너 BG가 각각 화이트/베이지로 다르기 때문에 디바이더가 없어도 영역 구분은 됨. 디바이더는 안전장치.

---

## 4. 기능 버튼 영역

### 4.1 그리드

960px / 3 = **320px each × 80px height**. 3개 모두 카페 공용 utility.

### 4.2 버튼 스펙

| 슬롯 | 라벨 | 아이콘 | 링크 |
|---|---|---|---|
| 1 | 유튜브 | YouTube SVG (red 또는 모노) | `https://www.youtube.com/channel/UCMi-D1REn7qLeJv8JftwgdA` |
| 2 | 채널톡 | Channel.io SVG | `https://www.bulsaja.channel.io` |
| 3 | 홈페이지 | 홈 outline 아이콘 | `https://www.bulsaja.com` |

### 4.3 시각 스펙

- 배경: 화이트 `#FFFFFF`
- 보더: 1px 회색 `#E5E5E5`
- 라운드: 12px
- 아이콘 + 라벨 가운데 정렬 (아이콘 24×24 + 라벨 16px Medium)
- 호버: `box-shadow: 0 4px 12px rgba(0,0,0,0.06)` + 보더 색 `#0A0A0A`로 강조

각 단톡은 해당 브랜드 배너 내부 secondary CTA로 들어가므로 여기서는 제외 (1:1 매핑 명확화).

---

## 5. 제거 자산

다음은 신규 대문에서 **완전 제거**한다.

- 빌리브로 GIF (`%EB%B9%8C%EB%A6%AC%EB%B8%8C%EB%A1%9C.gif`) — 정체 불명
- 엔잡곰불사자 배너 (`%EC%97%94%EC%9E%A1%EA%B3%B0%EB%B6%88%EC%82%AC%EC%9E%90.png`) — 별개 브랜드 라인, 추후 별도 슬롯 필요 시 재검토
- `자산_27.png` 와이드 (834×261) — 관계 불명
- `1688-aibuy-*`, `cbu-aibuy-*` 모든 div + userImg* — Chrome extension 잔여 코드
- 좌측 사이드바 4단 (`자산_16/17/18/19`) — 신규 기능 버튼 영역으로 대체

---

## 6. 산출물

### 6.1 이미지 자산

| 경로 | 사양 | 비고 |
|---|---|---|
| `brands/braveyong/braveyong_misc_naver-cafe-banner.png` | 960×360, sRGB, PNG-24 | 용팀장 배너 (인물 컷/그라데이션 포함 가능성 → 24bit) |
| `brands/bulsaja/bulsaja_misc_naver-cafe-banner.png` | 960×360, sRGB, PNG-24 | 불사자 배너. `brands/bulsaja/` 폴더 신설 + `INDEX.md` 생성 |

### 6.2 카페 에디터용 HTML

| 경로 | 비고 |
|---|---|
| `brands/howzero/howzero_misc_naver-cafe-bulsaja-renewal.html` | 네이버 카페 에디터 붙여넣기용. `<table>` 기반 (cafe 에디터는 div/flex 보존 안 함). 이미지는 네이버 cafefiles CDN 업로드 URL로 치환 필요 (사용자 업로드 후 URL swap) |

### 6.3 디자인 spec

| 경로 | 비고 |
|---|---|
| `docs/superpowers/specs/2026-05-27-bulsaja-naver-cafe-renewal-design.md` | 본 문서 |

---

## 7. 작업 단위 (구현 plan에서 분리될 단위)

1. **`brands/bulsaja/` 폴더 신설** — INDEX.md 작성 (zipsaja/braveyong 패턴 따름)
2. **배너 PNG 2장 디자인 & 생성**
   - 옵션 A: `design` 또는 `banner-design` 스킬로 AI 생성 + Puppeteer 스크린샷
   - 옵션 B: HTML 템플릿(Tailwind) → Puppeteer 1080×360 (네이버 카페 retina 대응) 스크린샷 → 960×360 다운샘플
   - 권장: 옵션 B. 컨트롤 가능 + 카피 수정 빠름
3. **카페 HTML 스니펫 작성** — table 레이아웃, 이미지 src placeholder, 단톡/CTA 링크 hardcoded
4. **사용자가 PNG를 네이버 카페에 업로드** → cafefiles.pstatic.net CDN URL 발급
5. **HTML 스니펫의 img src를 발급된 CDN URL로 swap** → 카페 에디터에 붙여넣기

---

## 8. 명시적 가정

- 카페 슬러그가 `minisnomad`인 이유는 옛 카페 슬러그 그대로 사용 중일 가능성 (옛 이름 → 불사자로 리브랜딩). 카페 정체성은 "불사자 카페"로 간주한다.
- 용팀장의 primary CTA는 `https://gigclass.kr` (용팀장 강의 사이트)로 직접 연결한다. 카페 내부 게시판이 아니라 외부 도메인으로 빠진다.
- 네이버 카페 에디터의 `<style>` 미지원으로 인해 모든 스타일은 inline + table cellpadding/cellspacing으로 처리한다. CSS class는 사용하지 않는다.
- 모바일은 네이버 카페 앱이 자체 fit하므로 PC 960px 1세트만 만든다. 모바일 별도 시안 없음.

## 9. 비스코프

- 카페 게시판 내부 디자인 (이번 작업은 대문 = home 한 페이지만)
- 게시글 템플릿
- 모바일 별도 시안
- 다국어
- 카페 헤더(네이버 플랫폼 자체) 변경 (불가능)

---

## 10. 성공 기준

1. PNG 2장 + HTML 스니펫이 만들어진다
2. 사용자가 네이버 카페 대문에 붙여넣어 정상 렌더링된다 (이미지 깨짐, 정렬 깨짐 없음)
3. 두 브랜드의 CTA 클릭이 각각 정확한 URL로 연결된다
4. 잡음 배너 4종 + 1688-aibuy 잔여 div가 완전히 제거된 깨끗한 HTML이다
