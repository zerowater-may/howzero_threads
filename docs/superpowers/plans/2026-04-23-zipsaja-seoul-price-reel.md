# Zipsaja Seoul Price Comparison Reel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 집사자(zipsaja) 브랜드 스타일로 "서울 25개 구 아파트 실거래가 1년 변화"를 보여주는 9:16 Remotion 릴스 단일 컴포지션을 만든다. 데이터는 batch_server 경유 PostgreSQL에서 가져오고, 영상은 `grueun_dong_reel.mp4` 레퍼런스처럼 **제목 pill 등장 → 행이 위에서부터 하나씩 슬라이드업 + 페이드인**으로 재생된다.

**Architecture:**
- Remotion 4.x 단일 composition `SeoulPriceReel` (1080×1920, 30fps)
- 데이터는 `public/data/seoul-prices.json` 정적 파일에서 로드 → SSG처럼 렌더 타임에 확정
- Python 스크립트가 batch_server로 SSH 터널(5432→localhost) 연 뒤 PG에서 SQL 실행해 JSON 저장
- 컴포넌트는 단일 파일 `SeoulPriceReel.tsx` 안에 내부 서브컴포넌트(Row, Header, BarCell)를 두어 재사용성과 가독성 확보 (사용자 요청 "하나의 컴포넌트" = 한 composition 의미로 해석)

**Tech Stack:**
- Remotion 4.0.451, React 18, TypeScript 5.5
- `@remotion/google-fonts` (Jua, Noto Sans KR, Gaegu)
- `@remotion/transitions` (필요 시)
- Python 3.11 + `psycopg2-binary` + `sshtunnel`
- 기존 위치 재활용: `.claude/skills/carousel/brands/zipsaja/reels/`

---

## File Structure

**Create:**
- `.claude/skills/carousel/brands/zipsaja/reels/src/SeoulPriceReel.tsx` — 단일 composition (header + 25행 + 바 차트)
- `.claude/skills/carousel/brands/zipsaja/reels/src/data/seoulPriceTypes.ts` — `DistrictPrice` 인터페이스 + 유틸
- `.claude/skills/carousel/brands/zipsaja/reels/public/data/seoul-prices.sample.json` — 개발용 샘플 (25개 행)
- `.claude/skills/carousel/brands/zipsaja/reels/public/data/seoul-prices.json` — 실제 데이터 (fetcher가 생성, gitignore)
- `scripts/zipsaja_seoul_prices/__init__.py` — 빈 파일
- `scripts/zipsaja_seoul_prices/__main__.py` — CLI entrypoint (SSH tunnel + SQL + JSON 출력)
- `scripts/zipsaja_seoul_prices/README.md` — 사용법
- `tests/zipsaja_seoul_prices/test_transform.py` — 데이터 변환 단위 테스트

**Modify:**
- `.claude/skills/carousel/brands/zipsaja/reels/src/Root.tsx` — `SeoulPriceReel` composition 등록
- `.claude/skills/carousel/brands/zipsaja/reels/package.json` — `build:seoul` script 추가
- `.claude/skills/carousel/brands/zipsaja/reels/.gitignore` — `public/data/seoul-prices.json` 제외
- `pyproject.toml` — psycopg2-binary, sshtunnel 의존성 추가

---

## Data Source Discovery Note

**현재 확인된 것 (2026-04-23):**
- batch_server SSH alias: `batch_server` (151.245.106.84, root)
- PostgreSQL 주소: **hh-worker-1 내부 IP `10.10.0.2:5432`** (batch_server에서 접근 가능)
- DB / User / Pass: `bulsaja_analytics` / `bulsaja` / `bulsaja2026`
- `.env`: `/root/keyword_crawler/.env` (PG_HOST=10.10.0.2, PG_PORT=5432, PG_DATABASE=bulsaja_analytics)

**확인 필요:**
- 서울 실거래가 테이블 이름·스키마 (`bulsaja_analytics` 안에 존재하는지, 혹은 별도 DB/스키마인지)
- Task 8에서 직접 PG 접속해 `\dt`로 테이블 탐색 후 SQL 확정

만약 서울 실거래가 테이블이 현재 존재하지 않으면 **Task 8에서 사용자에게 테이블 경로를 질의**하고, 최악의 경우 **샘플 JSON만으로 릴스를 완성**하고 데이터 파이프라인은 후속 PR로 미룬다.

---

## Design Reference

### 레퍼런스 영상 `grueun_dong_reel.mp4` 스타일 요약
- 5초 길이, 720×1280, 30fps
- 크림 베이지 배경(zipsaja `#F0E7D6`와 거의 동일)
- 상단 제목 위에 작은 **초록 bookmark flag** 등장 → 2초 뒤 사라짐 (zipsaja에서는 오렌지 pill로 대체)
- 제목 2줄: 1행 초록 pill / 2행 검정 굵은 글씨
- 행이 **위에서부터 하나씩** slide-up + fade-in (약 0.15초 간격)
- 행 배경 연베이지 rounded-box, 우측에 바 차트

### 스크린샷 (`/tmp/screenshot`) 컨텐츠 스펙
- 상단 메타: "출처: 국토부 실거래가 구별 아파트 평균, 26년도 4월 18일 조회 기준"
- 좌상단 핀 pill: "24평대 / 전용면적 55㎡ ~ 60㎡ / 동일기간 비교 / 1월 ~ 4월"
- 제목: "서울 실거래 1년간 변화" (Jua xl, 검정)
- 표 컬럼: 지역 | 25.1.1~4.18 평균 | 26.1.1~4.18 평균 | 동일기간 변동률 + 바
- 행 25개 (서울 25개 구)
- 바 차트: 양수=빨강(`#E5272A`), 음수=파랑(`#1A4FA0`), 중앙 0 기준 양옆

### Zipsaja 브랜드 토큰 (이미 존재 — `/brands/zipsaja/README.md`)
- 배경 `#F0E7D6` (따뜻한 베이지)
- 액센트 `#EA2E00` (오렌지 형광펜 — 제목 pill)
- 텍스트 `#1a1a1a`
- 서브 베이지 박스 `#F5EDE0`
- 폰트: Jua (제목) / Noto Sans KR 700 (본문) / Gaegu 700 (캡션)
- 양수 바 색: zipsaja 오렌지 `#EA2E00` (레퍼런스 영상은 초록이었지만 브랜드 일치를 위해 오렌지)
- 음수 바 색: `#1A4FA0` (파랑, 대비)

### 재생 타이밍 (22초 목표 — @reels 스킬 기본 길이)
| 구간 | 프레임 (30fps) | 내용 |
|---|---|---|
| 0–0.5s | 0–15 | 배경 + bookmark flag + 제목 pill 등장 |
| 0.5–1.0s | 15–30 | 부제 + 컬럼 헤더 등장 |
| 1.0–6.0s | 30–180 | 25개 행 순차 등장 (0.2초 간격) |
| 6.0–20s | 180–600 | 전체 표 유지, 바가 천천히 채워지는 2차 애니메이션 |
| 20–22s | 600–660 | 하단 "자세한 설명은 캡션 참고!" 페이드인 |

총 660 프레임 = 22초

---

### Task 1: 데이터 타입 + 샘플 JSON

**Files:**
- Create: `.claude/skills/carousel/brands/zipsaja/reels/src/data/seoulPriceTypes.ts`
- Create: `.claude/skills/carousel/brands/zipsaja/reels/public/data/seoul-prices.sample.json`

- [ ] **Step 1: 타입 정의 작성**

파일: `.claude/skills/carousel/brands/zipsaja/reels/src/data/seoulPriceTypes.ts`

```ts
export interface DistrictPrice {
  district: string;        // "서초구"
  priceLastYear: number;   // 2025 평균가, 단위: 만원 (67980 = 6억 7980만원)
  priceThisYear: number;   // 2026 평균가
  changePct: number;       // (thisYear - lastYear) / lastYear * 100, 소수점 1자리
}

export interface SeoulPriceDataset {
  generatedAt: string;     // ISO8601, fetcher가 찍음
  periodLabel: string;     // "25.1.1 ~ 4.18 vs 26.1.1 ~ 4.18"
  sizeLabel: string;       // "24평대 / 전용 55㎡ ~ 60㎡"
  source: string;          // "국토부 실거래가"
  districts: DistrictPrice[]; // 25개 (서울 자치구)
}

export const SEOUL_DISTRICTS_ORDER = [
  "서초구","강남구","용산구","송파구","성동구","마포구","동작구","강동구",
  "광진구","중구","영등포구","종로구","동대문구","서대문구","양천구","강서구",
  "성북구","은평구","관악구","구로구","강북구","금천구","노원구","중랑구","도봉구",
] as const;

export function formatWon(manwon: number): { eok: number; man: number; display: string } {
  const eok = Math.floor(manwon / 10000);
  const man = manwon % 10000;
  const display = man === 0 ? `${eok}억` : `${eok}억 ${man.toLocaleString()}만원`;
  return { eok, man, display };
}
```

- [ ] **Step 2: 샘플 JSON 작성 (스크린샷의 값을 그대로 옮김)**

파일: `.claude/skills/carousel/brands/zipsaja/reels/public/data/seoul-prices.sample.json`

```json
{
  "generatedAt": "2026-04-23T00:00:00+09:00",
  "periodLabel": "25.1.1 ~ 4.18 vs 26.1.1 ~ 4.18",
  "sizeLabel": "24평대 / 전용 55㎡ ~ 60㎡",
  "source": "국토부 실거래가",
  "districts": [
    {"district":"서초구","priceLastYear":226798,"priceThisYear":235528,"changePct":3.8},
    {"district":"강남구","priceLastYear":207450,"priceThisYear":196021,"changePct":-5.5},
    {"district":"용산구","priceLastYear":148527,"priceThisYear":186178,"changePct":25.3},
    {"district":"송파구","priceLastYear":152307,"priceThisYear":155326,"changePct":2.0},
    {"district":"성동구","priceLastYear":127269,"priceThisYear":154044,"changePct":21.1},
    {"district":"마포구","priceLastYear":144311,"priceThisYear":146802,"changePct":1.9},
    {"district":"동작구","priceLastYear":110315,"priceThisYear":130371,"changePct":18.2},
    {"district":"강동구","priceLastYear":112659,"priceThisYear":126734,"changePct":12.5},
    {"district":"광진구","priceLastYear":107171,"priceThisYear":122668,"changePct":14.5},
    {"district":"중구","priceLastYear":104782,"priceThisYear":122332,"changePct":16.7},
    {"district":"영등포구","priceLastYear":97995,"priceThisYear":115652,"changePct":18.0},
    {"district":"종로구","priceLastYear":119064,"priceThisYear":106294,"changePct":-10.7},
    {"district":"동대문구","priceLastYear":85452,"priceThisYear":97399,"changePct":14.0},
    {"district":"서대문구","priceLastYear":93634,"priceThisYear":95625,"changePct":2.1},
    {"district":"양천구","priceLastYear":93065,"priceThisYear":93553,"changePct":0.5},
    {"district":"강서구","priceLastYear":83289,"priceThisYear":92577,"changePct":11.2},
    {"district":"성북구","priceLastYear":76517,"priceThisYear":88018,"changePct":15.0},
    {"district":"은평구","priceLastYear":78771,"priceThisYear":87339,"changePct":10.9},
    {"district":"관악구","priceLastYear":75216,"priceThisYear":81970,"changePct":9.0},
    {"district":"구로구","priceLastYear":76364,"priceThisYear":81378,"changePct":7.6},
    {"district":"강북구","priceLastYear":72416,"priceThisYear":89723,"changePct":11.7},
    {"district":"금천구","priceLastYear":71016,"priceThisYear":75245,"changePct":6.9},
    {"district":"노원구","priceLastYear":71504,"priceThisYear":74321,"changePct":4.6},
    {"district":"중랑구","priceLastYear":67136,"priceThisYear":74157,"changePct":12.3},
    {"district":"도봉구","priceLastYear":62832,"priceThisYear":69765,"changePct":13.1}
  ]
}
```

- [ ] **Step 3: 커밋**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
git add .claude/skills/carousel/brands/zipsaja/reels/src/data/seoulPriceTypes.ts \
        .claude/skills/carousel/brands/zipsaja/reels/public/data/seoul-prices.sample.json
git commit -m "feat(zipsaja-reel): 서울 실거래가 데이터 타입 + 샘플 JSON 25개 구 추가"
```

---

### Task 2: 헤더 서브컴포넌트 (제목 pill + bookmark flag + 부제)

**Files:**
- Create: `.claude/skills/carousel/brands/zipsaja/reels/src/SeoulPriceReel.tsx` (header 부분까지만)

- [ ] **Step 1: 컴포넌트 스켈레톤 + 폰트 로드**

파일: `.claude/skills/carousel/brands/zipsaja/reels/src/SeoulPriceReel.tsx`

```tsx
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadJua } from "@remotion/google-fonts/Jua";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansKR";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";
import type { SeoulPriceDataset } from "./data/seoulPriceTypes";

loadJua();
loadNoto();
loadGaegu();

export const FPS = 30;
export const SEOUL_PRICE_TOTAL_FRAMES = 660; // 22s

const BG = "#F0E7D6";
const ACCENT = "#EA2E00";
const INK = "#1a1a1a";
const CREAM_BOX = "#F5EDE0";
const BAR_POS = "#EA2E00";
const BAR_NEG = "#1A4FA0";

export const SeoulPriceReel: React.FC<{ data: SeoulPriceDataset }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: "Noto Sans KR" }}>
      <Header frame={frame} fps={fps} data={data} />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Header 서브컴포넌트 구현**

같은 파일 아래에 추가:

```tsx
const Header: React.FC<{ frame: number; fps: number; data: SeoulPriceDataset }> = ({
  frame,
  fps,
  data,
}) => {
  // 0~15f: bookmark flag slide-down + title pill scale-in
  const flagY = interpolate(frame, [0, 10], [-80, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const pillScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  // 15~30f: 부제 fade + slide-up
  const subOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(frame, [15, 30], [24, 0], { extrapolateRight: "clamp" });
  // 20~660f: flag fade-out after 60f
  const flagOpacity = interpolate(frame, [60, 90], [1, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 0,
        width: 1080,
        textAlign: "center",
      }}
    >
      {/* bookmark flag */}
      <div
        style={{
          transform: `translateY(${flagY}px)`,
          opacity: flagOpacity,
          marginBottom: 18,
        }}
      >
        <svg width="48" height="70" viewBox="0 0 48 70">
          <path d="M4 0 H44 V60 L24 48 L4 60 Z" fill={ACCENT} />
        </svg>
      </div>

      {/* 메타 pill (작은 글씨) */}
      <div
        style={{
          fontFamily: "Noto Sans KR",
          fontWeight: 700,
          fontSize: 26,
          color: INK,
          opacity: subOpacity,
          marginBottom: 14,
        }}
      >
        <MetaPill label={data.sizeLabel} />
      </div>

      {/* 제목 (Jua 굵게) */}
      <div
        style={{
          fontFamily: "Jua",
          fontSize: 110,
          lineHeight: 1.05,
          color: INK,
          transform: `scale(${pillScale})`,
          letterSpacing: -2,
        }}
      >
        서울 실거래 1년간 변화
      </div>

      {/* 기간 안내 */}
      <div
        style={{
          marginTop: 22,
          fontFamily: "Noto Sans KR",
          fontWeight: 500,
          fontSize: 28,
          color: "#444",
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
        }}
      >
        {data.periodLabel} · 출처 {data.source}
      </div>
    </div>
  );
};

const MetaPill: React.FC<{ label: string }> = ({ label }) => (
  <span
    style={{
      display: "inline-block",
      background: ACCENT,
      color: "#fff",
      padding: "10px 24px",
      borderRadius: 999,
      fontFamily: "Jua",
      fontSize: 30,
      letterSpacing: -1,
    }}
  >
    {label}
  </span>
);
```

- [ ] **Step 3: Root에 임시 등록하여 헤더만 미리보기**

파일: `.claude/skills/carousel/brands/zipsaja/reels/src/Root.tsx`

기존 import 아래에 추가:

```tsx
import { SeoulPriceReel, SEOUL_PRICE_TOTAL_FRAMES } from "./SeoulPriceReel";
import seoulPricesSample from "../public/data/seoul-prices.sample.json";
import type { SeoulPriceDataset } from "./data/seoulPriceTypes";
```

기존 `<Composition ... />` 다음에 추가:

```tsx
<Composition
  id="SeoulPriceReel"
  component={SeoulPriceReel}
  durationInFrames={SEOUL_PRICE_TOTAL_FRAMES}
  fps={FPS}
  width={1080}
  height={1920}
  defaultProps={{ data: seoulPricesSample as SeoulPriceDataset }}
/>
```

`FPS` import도 잊지 말고 추가 (`import { ZipsajaReel, FPS, TOTAL_FRAMES } from "./ZipsajaReel";` 이미 존재함).

- [ ] **Step 4: 타입 체크 통과 확인**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/carousel/brands/zipsaja/reels
npx tsc --noEmit
```

Expected: 에러 없음. `Cannot find module '../public/data/seoul-prices.sample.json'` 에러가 나면 `tsconfig.json`의 `compilerOptions.resolveJsonModule: true` 확인 (없으면 추가).

- [ ] **Step 5: 스튜디오에서 헤더 프레임 확인**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/carousel/brands/zipsaja/reels
npx remotion render SeoulPriceReel out/header-check.mp4 --frames=0-60 --log=error
```

Expected: `out/header-check.mp4` 생성 (2초). 파일 크기 > 0.

- [ ] **Step 6: 커밋**

```bash
git add .claude/skills/carousel/brands/zipsaja/reels/src/SeoulPriceReel.tsx \
        .claude/skills/carousel/brands/zipsaja/reels/src/Root.tsx
git commit -m "feat(zipsaja-reel): SeoulPriceReel 헤더 애니메이션 (북마크 flag + 제목 pill)"
```

---

### Task 3: 행(Row) 서브컴포넌트 — 지역명/가격/바 차트

**Files:**
- Modify: `.claude/skills/carousel/brands/zipsaja/reels/src/SeoulPriceReel.tsx`

- [ ] **Step 1: 포맷 유틸 추가 + Row 컴포넌트 구현**

`SeoulPriceReel.tsx` 아래쪽에 추가:

```tsx
// 만원 → "22억 6,798만원" 포맷
function fmtPrice(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (rest === 0) return `${eok}억`;
  return `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
}

interface RowProps {
  district: string;
  priceLastYear: number;
  priceThisYear: number;
  changePct: number;
  appearFrame: number;   // 이 행이 등장하기 시작하는 전역 프레임
  frame: number;         // 현재 전역 프레임
  fps: number;
  maxAbsChange: number;  // 바 스케일 기준 (전체 최대 |changePct|)
}

const Row: React.FC<RowProps> = ({
  district,
  priceLastYear,
  priceThisYear,
  changePct,
  appearFrame,
  frame,
  fps,
  maxAbsChange,
}) => {
  const local = frame - appearFrame;
  // 행 등장: 0~8f slide-up + fade
  const rowOpacity = interpolate(local, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rowY = interpolate(local, [0, 8], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  // 바 차트: 행 등장 후 6f 뒤부터 20f에 걸쳐 width 채움
  const barProgress = interpolate(local, [6, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const isPositive = changePct >= 0;
  const barColor = isPositive ? BAR_POS : BAR_NEG;
  const barWidth = (Math.abs(changePct) / maxAbsChange) * 260 * barProgress; // 최대 260px

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        opacity: rowOpacity,
        transform: `translateY(${rowY}px)`,
        height: 48,
        padding: "0 14px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {/* 지역명 */}
      <div
        style={{
          width: 140,
          fontFamily: "Jua",
          fontSize: 30,
          color: ACCENT,
          letterSpacing: -1,
        }}
      >
        {district}
      </div>
      {/* 작년 가격 */}
      <div
        style={{
          width: 220,
          fontFamily: "Noto Sans KR",
          fontWeight: 700,
          fontSize: 24,
          color: INK,
          textAlign: "right",
          paddingRight: 16,
        }}
      >
        {fmtPrice(priceLastYear)}
      </div>
      {/* 올해 가격 */}
      <div
        style={{
          width: 220,
          fontFamily: "Noto Sans KR",
          fontWeight: 700,
          fontSize: 24,
          color: INK,
          textAlign: "right",
          paddingRight: 16,
        }}
      >
        {fmtPrice(priceThisYear)}
      </div>
      {/* 바 + 변동률 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "relative",
          height: 28,
          marginLeft: 10,
        }}
      >
        <div style={{ width: 4, background: "#888", height: "100%" }} />{/* 0선 */}
        <div
          style={{
            width: barWidth,
            height: 20,
            background: barColor,
            marginLeft: isPositive ? 0 : -barWidth,
            transform: isPositive ? "none" : "translateX(-100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: isPositive ? barWidth + 14 : -barWidth - 70,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "Noto Sans KR",
            fontWeight: 700,
            fontSize: 22,
            color: barColor,
          }}
        >
          {isPositive ? "+" : ""}
          {changePct.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: 메인 컴포지션에 Row 25개 렌더링 추가**

`SeoulPriceReel` 내부 `return` 블록의 `<Header />` 뒤에 테이블 추가:

```tsx
// maxAbs 계산 (샘플: 25.3%)
const maxAbsChange = Math.max(
  ...data.districts.map((d) => Math.abs(d.changePct)),
  10, // 최소 스케일
);

const ROWS_START_FRAME = 30;   // 헤더 등장 끝난 직후
const ROW_STAGGER = 6;          // 각 행 0.2초 간격
const TABLE_TOP = 620;          // 제목+부제 아래

return (
  <AbsoluteFill style={{ backgroundColor: BG, fontFamily: "Noto Sans KR" }}>
    <Header frame={frame} fps={fps} data={data} />
    <div
      style={{
        position: "absolute",
        top: TABLE_TOP,
        left: 40,
        width: 1000,
        background: CREAM_BOX,
        border: `3px solid ${INK}`,
        borderRadius: 20,
        padding: "16px 8px",
      }}
    >
      {/* 컬럼 헤더 */}
      <ColumnHeader frame={frame} />

      {/* 25개 행 */}
      {data.districts.map((d, i) => (
        <Row
          key={d.district}
          district={d.district}
          priceLastYear={d.priceLastYear}
          priceThisYear={d.priceThisYear}
          changePct={d.changePct}
          appearFrame={ROWS_START_FRAME + i * ROW_STAGGER}
          frame={frame}
          fps={fps}
          maxAbsChange={maxAbsChange}
        />
      ))}
    </div>
    <Footer frame={frame} />
  </AbsoluteFill>
);
```

- [ ] **Step 3: 컬럼 헤더 + Footer 구현**

`SeoulPriceReel.tsx` 맨 아래에 추가:

```tsx
const ColumnHeader: React.FC<{ frame: number }> = ({ frame }) => {
  const op = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        display: "flex",
        opacity: op,
        padding: "8px 14px 14px",
        borderBottom: `2px solid ${INK}`,
        marginBottom: 6,
        fontFamily: "Jua",
        fontSize: 24,
        color: INK,
      }}
    >
      <div style={{ width: 140 }}>지역</div>
      <div style={{ width: 220, textAlign: "right", paddingRight: 16 }}>
        25.1.1~4.18
      </div>
      <div style={{ width: 220, textAlign: "right", paddingRight: 16 }}>
        26.1.1~4.18
      </div>
      <div style={{ flex: 1, marginLeft: 10 }}>동일기간 변동률</div>
    </div>
  );
};

const Footer: React.FC<{ frame: number }> = ({ frame }) => {
  const op = interpolate(frame, [600, 630], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        width: 1080,
        textAlign: "center",
        opacity: op,
        fontFamily: "Gaegu",
        fontWeight: 700,
        fontSize: 32,
        color: INK,
      }}
    >
      *자세한 설명은 아래 캡션을 참고해주세요!*
    </div>
  );
};
```

- [ ] **Step 4: 타입 체크**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/carousel/brands/zipsaja/reels
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 5: 전체 프레임 렌더 (저화질 빠른 검증)**

```bash
npx remotion render SeoulPriceReel out/seoul-price-check.mp4 \
  --scale=0.5 --log=error
```

Expected: 약 5-15초 소요, 540×960 해상도 mp4 생성. 재생해서 25개 구가 순차 등장하고 바가 채워지는지 눈으로 확인.

Finder에서 확인:
```bash
open -R /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/carousel/brands/zipsaja/reels/out/seoul-price-check.mp4
```

- [ ] **Step 6: 커밋**

```bash
git add .claude/skills/carousel/brands/zipsaja/reels/src/SeoulPriceReel.tsx
git commit -m "feat(zipsaja-reel): 서울 25개 구 Row + 바 차트 순차 애니메이션"
```

---

### Task 4: 레이아웃 미세 조정 + 음수 바 방향 수정

레퍼런스 영상처럼 바가 세로 가운데 0선 기준 좌우로 뻗는 게 아니라, **스크린샷처럼 표 우측 영역에 0선이 정렬되고 양수는 오른쪽·음수는 왼쪽으로** 뻗도록 정렬한다.

**Files:**
- Modify: `.claude/skills/carousel/brands/zipsaja/reels/src/SeoulPriceReel.tsx` (Row 컴포넌트)

- [ ] **Step 1: Row의 bar 영역을 `position: relative` 고정 폭 280px로 바꾸고 0선을 가운데 고정**

Row 내부 "바 + 변동률" div를 다음으로 교체:

```tsx
{/* 바 + 변동률 — 0선 중앙 고정, 양수는 오른쪽·음수는 왼쪽 */}
<div
  style={{
    position: "relative",
    width: 280,
    height: 28,
    marginLeft: 10,
  }}
>
  {/* 0선 */}
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: 0,
      width: 2,
      height: "100%",
      background: "#888",
    }}
  />
  {/* 바 */}
  <div
    style={{
      position: "absolute",
      left: isPositive ? "50%" : `calc(50% - ${barWidth}px)`,
      top: 4,
      width: barWidth,
      height: 20,
      background: barColor,
    }}
  />
  {/* 퍼센트 라벨 */}
  <div
    style={{
      position: "absolute",
      left: isPositive ? `calc(50% + ${barWidth + 8}px)` : `calc(50% - ${barWidth + 8}px)`,
      top: "50%",
      transform: isPositive ? "translateY(-50%)" : "translate(-100%, -50%)",
      fontFamily: "Noto Sans KR",
      fontWeight: 700,
      fontSize: 22,
      color: barColor,
      whiteSpace: "nowrap",
    }}
  >
    {isPositive ? "+" : ""}
    {changePct.toFixed(1)}%
  </div>
</div>
```

바 최대 width를 130px로 줄임 (좌우 130씩 → 총 260 within 280 width):

Row 위쪽 barWidth 계산을 수정:

```tsx
const barWidth = (Math.abs(changePct) / maxAbsChange) * 130 * barProgress;
```

- [ ] **Step 2: 렌더 후 시각 확인**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/carousel/brands/zipsaja/reels
npx remotion render SeoulPriceReel out/seoul-price-v2.mp4 --scale=0.5 --log=error
open -R out/seoul-price-v2.mp4
```

Expected: 강남(-5.5%)·종로(-10.7%)는 왼쪽, 나머지는 오른쪽 바. 0선 가운데.

- [ ] **Step 3: 커밋**

```bash
git add .claude/skills/carousel/brands/zipsaja/reels/src/SeoulPriceReel.tsx
git commit -m "fix(zipsaja-reel): 0선 중앙 고정하여 양수/음수 바 방향 교정"
```

---

### Task 5: Row 개수 25개가 화면 안에 들어가는지 레이아웃 검증 + 조정

1920 높이에서 헤더 620px 사용, 테이블은 1220px 사용 가능. 25행 × 48px = 1200 + 헤더 줄 = 딱 맞지만 여유 없음. 행 높이를 45로 낮추고 Footer 공간도 확보.

**Files:**
- Modify: `.claude/skills/carousel/brands/zipsaja/reels/src/SeoulPriceReel.tsx`

- [ ] **Step 1: Row 높이 조정**

Row 컴포넌트의 최상위 `style.height`를 `48`에서 `42`로.
폰트 크기도 `fontSize: 30` (지역명)을 `26`으로, 가격 `24`를 `22`로 축소.

- [ ] **Step 2: Footer 여유 확보**

TABLE_TOP을 640으로, Footer `bottom`을 50으로.

- [ ] **Step 3: 전체 렌더**

```bash
npx remotion render SeoulPriceReel out/seoul-price-v3.mp4 --log=error
open -R out/seoul-price-v3.mp4
```

Expected: 25행이 잘림 없이 표 안에 들어가고, 하단 Footer도 보임. 길이 22초.

- [ ] **Step 4: 커밋**

```bash
git add .claude/skills/carousel/brands/zipsaja/reels/src/SeoulPriceReel.tsx
git commit -m "fix(zipsaja-reel): 행 높이 42px 축소 + 레이아웃 여백 조정"
```

---

### Task 6: Python 데이터 fetcher — SSH 터널 + PG 쿼리 + JSON 출력

**Files:**
- Create: `scripts/zipsaja_seoul_prices/__init__.py`
- Create: `scripts/zipsaja_seoul_prices/__main__.py`
- Create: `scripts/zipsaja_seoul_prices/README.md`
- Modify: `pyproject.toml`
- Create: `tests/zipsaja_seoul_prices/test_transform.py`
- Modify: `.claude/skills/carousel/brands/zipsaja/reels/.gitignore`

- [ ] **Step 1: 의존성 추가**

`pyproject.toml`의 `[project.dependencies]`에 추가 (기존 섹션이 없으면 새로 만들거나 `requirements.txt` 스타일 확인):

```toml
dependencies = [
    # ... 기존 ...
    "psycopg2-binary>=2.9",
    "sshtunnel>=0.4.0",
]
```

설치:
```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
pip install psycopg2-binary sshtunnel
```

- [ ] **Step 2: 빈 패키지 init 작성**

파일: `scripts/zipsaja_seoul_prices/__init__.py`
```python
"""zipsaja Seoul price fetcher — batch_server PG → reels JSON."""
```

- [ ] **Step 3: 변환 함수 단위 테스트 먼저 작성 (TDD)**

파일: `tests/zipsaja_seoul_prices/test_transform.py`

```python
from scripts.zipsaja_seoul_prices.__main__ import compute_change_pct, to_dataset_dict


def test_compute_change_pct_positive():
    assert compute_change_pct(100_000, 120_000) == 20.0


def test_compute_change_pct_negative():
    assert compute_change_pct(100_000, 80_000) == -20.0


def test_compute_change_pct_zero_base_returns_zero():
    assert compute_change_pct(0, 10_000) == 0.0


def test_to_dataset_dict_rounds_to_one_decimal():
    rows = [("서초구", 226798, 235528)]
    ds = to_dataset_dict(rows, period="25 vs 26", size="24평대", source="국토부")
    assert ds["districts"][0]["changePct"] == 3.8
    assert ds["periodLabel"] == "25 vs 26"
    assert len(ds["districts"]) == 1
```

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
mkdir -p tests/zipsaja_seoul_prices
touch tests/zipsaja_seoul_prices/__init__.py
python -m pytest tests/zipsaja_seoul_prices -v
```

Expected: FAIL (함수 없음).

- [ ] **Step 4: __main__.py 구현 (변환 함수 + CLI)**

파일: `scripts/zipsaja_seoul_prices/__main__.py`

```python
"""Fetch Seoul district price comparison from batch_server PG → JSON."""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import psycopg2
from sshtunnel import SSHTunnelForwarder

DEFAULT_OUT = Path(
    ".claude/skills/carousel/brands/zipsaja/reels/public/data/seoul-prices.json"
)

# 서울 25개 자치구 정렬 순서 (스크린샷 기준)
DISTRICT_ORDER = [
    "서초구", "강남구", "용산구", "송파구", "성동구", "마포구", "동작구",
    "강동구", "광진구", "중구", "영등포구", "종로구", "동대문구",
    "서대문구", "양천구", "강서구", "성북구", "은평구", "관악구",
    "구로구", "강북구", "금천구", "노원구", "중랑구", "도봉구",
]


def compute_change_pct(last_year: float, this_year: float) -> float:
    if last_year <= 0:
        return 0.0
    return round((this_year - last_year) / last_year * 100, 1)


def to_dataset_dict(
    rows: list[tuple[str, int, int]],
    *,
    period: str,
    size: str,
    source: str,
) -> dict:
    by_dist = {d: (ly, ty) for d, ly, ty in rows}
    districts = []
    for d in DISTRICT_ORDER:
        if d in by_dist:
            ly, ty = by_dist[d]
            districts.append({
                "district": d,
                "priceLastYear": int(ly),
                "priceThisYear": int(ty),
                "changePct": compute_change_pct(ly, ty),
            })
    return {
        "generatedAt": datetime.now(timezone.utc).astimezone().isoformat(),
        "periodLabel": period,
        "sizeLabel": size,
        "source": source,
        "districts": districts,
    }


SQL = """
SELECT gu AS district,
       ROUND(AVG(price_last_year))::int AS ly,
       ROUND(AVG(price_this_year))::int AS ty
FROM zipsaja_seoul_gu_price_compare
WHERE area_pyeong = 24
GROUP BY gu
"""
# 주의: 테이블/컬럼 이름은 Task 7에서 실제 DB 스키마 확인 후 조정.


def fetch_via_tunnel(
    *, ssh_host: str, pg_host: str, pg_port: int, pg_user: str, pg_pass: str, pg_db: str
) -> list[tuple[str, int, int]]:
    with SSHTunnelForwarder(
        (ssh_host, 22),
        ssh_username="root",
        remote_bind_address=(pg_host, pg_port),
    ) as tunnel:
        conn = psycopg2.connect(
            host="127.0.0.1",
            port=tunnel.local_bind_port,
            user=pg_user,
            password=pg_pass,
            dbname=pg_db,
        )
        try:
            with conn.cursor() as cur:
                cur.execute(SQL)
                return cur.fetchall()
        finally:
            conn.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Fetch zipsaja Seoul price JSON")
    parser.add_argument("--ssh-host", default="batch_server")
    parser.add_argument("--pg-host", default="10.10.0.2")
    parser.add_argument("--pg-port", type=int, default=5432)
    parser.add_argument("--pg-user", default=os.environ.get("PG_USER", "bulsaja"))
    parser.add_argument("--pg-pass", default=os.environ.get("PG_PASSWORD", "bulsaja2026"))
    parser.add_argument("--pg-db", default=os.environ.get("PG_DATABASE", "bulsaja_analytics"))
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--period", default="25.1.1 ~ 4.18 vs 26.1.1 ~ 4.18")
    parser.add_argument("--size", default="24평대 / 전용 55㎡ ~ 60㎡")
    parser.add_argument("--source", default="국토부 실거래가")
    args = parser.parse_args(argv)

    rows = fetch_via_tunnel(
        ssh_host=args.ssh_host,
        pg_host=args.pg_host,
        pg_port=args.pg_port,
        pg_user=args.pg_user,
        pg_pass=args.pg_pass,
        pg_db=args.pg_db,
    )

    dataset = to_dataset_dict(rows, period=args.period, size=args.size, source=args.source)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(dataset, ensure_ascii=False, indent=2))
    print(f"Wrote {len(dataset['districts'])} districts → {args.out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 5: 테스트 재실행 → PASS**

```bash
python -m pytest tests/zipsaja_seoul_prices -v
```

Expected: 4 tests PASS.

- [ ] **Step 6: README 작성**

파일: `scripts/zipsaja_seoul_prices/README.md`

```markdown
# zipsaja Seoul Price Fetcher

batch_server 경유 PostgreSQL에서 서울 25개 구 아파트 평균 실거래가를
조회하여 `reels/public/data/seoul-prices.json` 파일로 출력한다.

## 사전 조건

- SSH alias `batch_server`가 `~/.ssh/config`에 존재 (151.245.106.84 root)
- PostgreSQL 접근 정보: 기본값은 bulsaja_analytics DB (환경 변수로 override 가능)
- `pip install psycopg2-binary sshtunnel`

## 사용

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
python3 -m scripts.zipsaja_seoul_prices

# 특정 크기·기간으로
python3 -m scripts.zipsaja_seoul_prices \
  --size "30평대 / 전용 80㎡" \
  --period "25.1 vs 26.1"
```

## 테이블 스키마 (가정)

`zipsaja_seoul_gu_price_compare`:
- `gu` TEXT — 구 이름 (예: "서초구")
- `area_pyeong` INT — 평형 (24, 30, 등)
- `price_last_year` INT — 전년 동기 평균 (단위: 만원)
- `price_this_year` INT — 올해 평균

**실제 DB 스키마가 다르면 `__main__.py`의 `SQL` 상수를 조정할 것.**
```

- [ ] **Step 7: 산출물 gitignore**

파일: `.claude/skills/carousel/brands/zipsaja/reels/.gitignore` (없으면 생성)

```
node_modules/
out/
public/data/seoul-prices.json
```

- [ ] **Step 8: 커밋**

```bash
git add scripts/zipsaja_seoul_prices/ tests/zipsaja_seoul_prices/ pyproject.toml \
        .claude/skills/carousel/brands/zipsaja/reels/.gitignore
git commit -m "feat(zipsaja-seoul-prices): PG 데이터 fetcher + SSH 터널 + pytest"
```

---

### Task 7: 실제 PG 스키마 탐색 + SQL 조정

**Files:**
- Modify (as needed): `scripts/zipsaja_seoul_prices/__main__.py`

- [ ] **Step 1: PG에 접속해 테이블 목록 확인**

```bash
ssh batch_server "docker exec coolify-db psql -U postgres -l" 2>&1 | head -20
# 또는 이미 알고 있는 bulsaja_analytics DB:
ssh batch_server "docker ps --format '{{.Names}}' | grep -i postgres"
```

Coolify-db는 Coolify 전용이므로 실제 데이터는 `10.10.0.2:5432` bulsaja_analytics일 가능성이 큼. 터널 테스트:

```bash
python3 -c "
from sshtunnel import SSHTunnelForwarder
import psycopg2
with SSHTunnelForwarder(('batch_server', 22), ssh_username='root',
    remote_bind_address=('10.10.0.2', 5432)) as t:
    conn = psycopg2.connect(host='127.0.0.1', port=t.local_bind_port,
        user='bulsaja', password='bulsaja2026', dbname='bulsaja_analytics')
    cur = conn.cursor()
    cur.execute(\"SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename\")
    for (t,) in cur.fetchall():
        print(t)
"
```

- [ ] **Step 2: zipsaja / 실거래 관련 테이블이 있으면 스키마 확인, 없으면 결정 지점**

테이블이 존재하는 경우:
```bash
python3 -c "... SELECT column_name, data_type FROM information_schema.columns WHERE table_name='<발견한 테이블>'"
```

스키마에 맞게 `__main__.py`의 `SQL`을 수정.

테이블이 존재하지 않는 경우 (가능성 높음):
1. 사용자에게 확인 — "서울 실거래가 테이블이 어디에 있나요? 혹은 CSV 등 다른 소스로 임포트가 필요한가요?"
2. 임시 대안: sample JSON만으로 영상 완성 (Task 9 렌더는 sample 데이터로 수행)

- [ ] **Step 3: SQL이 실제로 돌아가면 fetcher 실행**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
python3 -m scripts.zipsaja_seoul_prices
```

Expected: `seoul-prices.json` 생성, stderr에 `Wrote 25 districts`.

- [ ] **Step 4: 데이터 정확성 스팟 체크**

```bash
python3 -c "
import json
d = json.load(open('.claude/skills/carousel/brands/zipsaja/reels/public/data/seoul-prices.json'))
assert len(d['districts']) == 25, f'Got {len(d[\"districts\"])}'
print('✓ 25 districts')
print('max change:', max(x['changePct'] for x in d['districts']))
print('min change:', min(x['changePct'] for x in d['districts']))
"
```

Expected: `✓ 25 districts` 출력.

- [ ] **Step 5: 커밋 (SQL 조정이 있었을 경우만)**

```bash
git add scripts/zipsaja_seoul_prices/__main__.py
git commit -m "fix(zipsaja-seoul-prices): 실제 PG 스키마에 맞게 SQL 조정"
```

---

### Task 8: Root.tsx를 실제 데이터로 전환 + package.json 렌더 스크립트

**Files:**
- Modify: `.claude/skills/carousel/brands/zipsaja/reels/src/Root.tsx`
- Modify: `.claude/skills/carousel/brands/zipsaja/reels/package.json`

- [ ] **Step 1: Root.tsx에서 실제 JSON 우선, 없으면 sample fallback**

`Root.tsx` 기존 `import seoulPricesSample from "../public/data/seoul-prices.sample.json"` 아래에 try/catch 대신 정적 import를 유지하되, defaultProps 우선순위 주석 추가:

```tsx
// 렌더 전에 `python3 -m scripts.zipsaja_seoul_prices` 실행으로
// seoul-prices.json이 생성되면 아래 import를 sample에서 교체.
// CI/로컬 편의상 sample JSON을 기본값으로 둠.
import seoulPricesSample from "../public/data/seoul-prices.sample.json";
```

(실제 데이터가 있을 때의 import 구문은 Task 7이 끝난 뒤 Step 2에서 바꿀지 결정.)

- [ ] **Step 2: 실제 데이터로 전환 (Task 7이 성공한 경우만)**

`Root.tsx`의 import를 다음으로 교체:
```tsx
import seoulPricesData from "../public/data/seoul-prices.json";
```

그리고 Composition `defaultProps`를 `{{ data: seoulPricesData as SeoulPriceDataset }}`로.

실제 JSON이 없으면 이 Step은 스킵 — sample로 계속 사용.

- [ ] **Step 3: package.json 빌드 스크립트 추가**

`.claude/skills/carousel/brands/zipsaja/reels/package.json`의 `scripts`에 추가:

```json
"build:seoul": "remotion render SeoulPriceReel out/zipsaja-seoul-price.mp4 --log=error"
```

- [ ] **Step 4: 커밋**

```bash
git add .claude/skills/carousel/brands/zipsaja/reels/src/Root.tsx \
        .claude/skills/carousel/brands/zipsaja/reels/package.json
git commit -m "chore(zipsaja-reel): Root에 SeoulPriceReel 등록 + build:seoul npm 스크립트"
```

---

### Task 9: 최종 렌더 + ffmpeg 인코딩 최적화 + 사용자 확인

**Files:** (산출물만, 코드 변경 없음)
- Output: `.claude/skills/carousel/brands/zipsaja/reels/out/zipsaja-seoul-price.mp4`
- Output: `.claude/skills/carousel/brands/zipsaja/reels/out/zipsaja-seoul-price-22s.mp4`

- [ ] **Step 1: Full-res 렌더**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/carousel/brands/zipsaja/reels
npm run build:seoul
```

Expected: 1-3분 소요, `out/zipsaja-seoul-price.mp4` 생성 (1080×1920, 22초, H.264).

- [ ] **Step 2: ffmpeg 재인코딩 (용량/품질 최적)**

```bash
ffmpeg -y -i out/zipsaja-seoul-price.mp4 \
  -t 22 \
  -c:v libx264 -preset medium -crf 18 \
  -pix_fmt yuv420p -movflags +faststart \
  out/zipsaja-seoul-price-22s.mp4
```

Expected: 출력 파일 크기 5-15MB 수준.

- [ ] **Step 3: 파일 크기·해상도·길이 검증**

```bash
ffprobe -v error -show_streams -show_format out/zipsaja-seoul-price-22s.mp4 2>&1 \
  | grep -E "^(width|height|duration|codec_name|size)" | head -8
```

Expected:
- width=1080, height=1920
- duration=22.xx
- codec_name=h264
- size < 20000000

- [ ] **Step 4: Finder에 열기 → 사용자 육안 확인 체크리스트**

```bash
open -R out/zipsaja-seoul-price-22s.mp4
```

확인할 것:
- [ ] 제목 "서울 실거래 1년간 변화"가 첫 0.5초 안에 pill + 북마크 flag와 함께 등장
- [ ] 25개 구가 **서초구부터** 순차적으로 등장
- [ ] 바 차트가 0선 중심으로 양수=오렌지(오른쪽), 음수=파랑(왼쪽)
- [ ] 강남구(-5.5%), 종로구(-10.7%) 확인 — 파란 바가 왼쪽으로 뻗음
- [ ] 용산구(+25.3%) — 가장 긴 오렌지 바
- [ ] 하단 Footer "자세한 설명은 아래 캡션을 참고해주세요!" 20초 이후 등장
- [ ] 글꼴이 Jua(제목)·Noto Sans KR(본문)·Gaegu(Footer)로 올바름
- [ ] 22초 종료 후 페이드아웃 없이 클린 컷

- [ ] **Step 5: 커밋 (산출물은 gitignore되므로 커밋 없음)**

산출물 `out/*.mp4`는 이미 gitignore됨. 커밋할 것 없음.

대신 최종 PR 메시지에 요약:
```
zipsaja 서울 실거래 1년 변화 릴스 구현 완료.
- src/SeoulPriceReel.tsx (단일 composition)
- scripts/zipsaja_seoul_prices (SSH 터널 + PG 쿼리)
- 22초 1080x1920 H.264 아웃풋
```

---

## Self-Review Checklist (작성자 본인)

**Spec coverage:**
- [x] 레퍼런스 영상 스타일 (베이지 배경, 북마크 flag, 순차 행 등장) — Task 2·3
- [x] 스크린샷 데이터 (25개 구, before/after 가격, 변동률 바) — Task 1 샘플 + Task 3 Row
- [x] zipsaja 브랜드 톤 (Jua 폰트, 오렌지 pill, Gaegu Footer) — Task 2·3
- [x] 단일 composition (SeoulPriceReel.tsx 하나에 서브컴포넌트 모두) — Task 2~5
- [x] PostgreSQL 데이터 소스 (batch_server 경유) — Task 6·7
- [x] 9:16 Remotion 1080×1920 — Task 2 `width/height`

**Placeholder scan:**
- "스키마는 실제 확인 후 조정" — Task 7에 구체 절차 포함 (막연하지 않음)
- 모든 코드 블록이 실행 가능한 완전 스니펫

**Type consistency:**
- `DistrictPrice` 필드 (`district`, `priceLastYear`, `priceThisYear`, `changePct`) — Task 1, 3, 6에서 일관
- Python `to_dataset_dict` 반환이 TS `SeoulPriceDataset`과 키 일치 확인: `generatedAt`, `periodLabel`, `sizeLabel`, `source`, `districts` ✓

**Risks:**
- PG 테이블이 존재하지 않을 수 있음 → Task 7 Step 2에서 결정 분기 명시
- Remotion 4.0.451에서 @remotion/google-fonts import path — 이미 기존 `ZipsajaReel`에서 검증됨 (같은 프로젝트이므로 안전)
- 25행 × 42px = 1050 + 헤더 줄 + padding → 1200 fit check는 Task 5에서 수행
