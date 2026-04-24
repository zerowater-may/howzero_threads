# YouTube Scout — 바이럴 영상 파인더 설계 스펙

> **작성일**: 2026-04-02
> **위치**: `howzero-dashboard` 모노레포 → `packages/youtube-scout/`
> **기반 코드**: hypeduck-server (`src/libs/youtube/`)

---

## 목적

YouTube에서 "구독자 대비 비정상적으로 높은 성과를 내는 영상"을 자동으로 찾아내는 시스템. 매일 새벽 크론잡으로 수집하고, 대시보드(그리드 테이블)에서 필터/정렬하여 확인.

## 기술 스택

- TypeScript (ESM)
- YouTube Data API v3 + RSS 피드
- PostgreSQL (howzero-dashboard 기존 DB 활용)
- pnpm 모노레포 패키지

## 아키텍처

```
[매일 새벽 크론]
    │
    ├─ Job 1: seed-channels
    │   YouTube search API → 카테고리별 키워드 검색 → 새 채널 발견 → DB
    │
    ├─ Job 2: rss-scan
    │   DB 전체 채널 RSS 피드 조회 → 새 영상 발견 → DB
    │
    └─ Job 3: collect-stats
        새 영상 videos API → 조회수/좋아요/댓글 수집 → 스코어링 → DB
```

## 디렉토리 구조

```
packages/youtube-scout/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                # 패키지 엔트리 (export all)
│   ├── lib/
│   │   ├── youtube-api.ts      # YouTube Data API 래퍼
│   │   ├── rss-scanner.ts      # RSS 피드 스캐너 (채널별 새 영상 감지)
│   │   ├── scoring.ts          # 3개 지표 × 6/5단계 등급
│   │   ├── seed-expander.ts    # 카테고리별 키워드 검색 → 채널 발견
│   │   └── types.ts            # 타입 정의
│   ├── jobs/
│   │   ├── daily-scan.ts       # 크론 메인 (3개 잡 순차 실행)
│   │   ├── seed-channels.ts    # 채널 시드 확장
│   │   ├── rss-scan.ts         # RSS 스캔
│   │   └── collect-stats.ts    # 통계 수집 + 스코어링
│   └── db/
│       ├── schema.sql          # yt_channels, yt_videos DDL
│       └── queries.ts          # CRUD 쿼리
└── scripts/
    └── run-scan.ts             # 수동 실행 CLI
```

## DB 스키마

### yt_channels

```sql
CREATE TABLE yt_channels (
  id            SERIAL PRIMARY KEY,
  channel_id    VARCHAR(64) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  subscriber_count  INTEGER,
  video_count       INTEGER,
  total_view_count  BIGINT,
  category      VARCHAR(64),
  thumbnail_url VARCHAR(512),
  source        VARCHAR(32) DEFAULT 'search_seed',  -- search_seed / related / manual
  last_scanned_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_yt_channels_channel_id ON yt_channels(channel_id);
CREATE INDEX idx_yt_channels_subscriber ON yt_channels(subscriber_count);
```

### yt_videos

```sql
CREATE TABLE yt_videos (
  id              SERIAL PRIMARY KEY,
  video_id        VARCHAR(32) UNIQUE NOT NULL,
  channel_id      VARCHAR(64) NOT NULL REFERENCES yt_channels(channel_id),
  title           VARCHAR(512) NOT NULL,
  published_at    TIMESTAMPTZ NOT NULL,
  thumbnail_url   VARCHAR(512),
  duration_seconds INTEGER,
  category_id     VARCHAR(8),
  view_count      INTEGER DEFAULT 0,
  like_count      INTEGER,
  comment_count   INTEGER,
  subscriber_count_at_collect INTEGER,  -- 수집 시점 구독자 수
  -- 스코어
  score_view_sub      REAL,   -- viewCount / subscriberCount
  score_view_like     REAL,   -- viewCount / likeCount
  score_view_comment  REAL,   -- viewCount / commentCount
  grade_view_sub      VARCHAR(16),  -- Legendary/Viral/Great/Good/AboveAvg/Normal
  grade_view_like     VARCHAR(16),  -- Exceptional/High/Good/Normal/Low
  grade_view_comment  VARCHAR(16),  -- Hot/Active/Normal/Quiet/Silent
  collected_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_yt_videos_video_id ON yt_videos(video_id);
CREATE INDEX idx_yt_videos_channel_id ON yt_videos(channel_id);
CREATE INDEX idx_yt_videos_published ON yt_videos(published_at DESC);
CREATE INDEX idx_yt_videos_score ON yt_videos(score_view_sub DESC NULLS LAST);
CREATE INDEX idx_yt_videos_views ON yt_videos(view_count DESC);
```

## 스코어링 시스템

### score_view_sub (조회수/구독자 비율)

| 비율 | 등급 | 라벨 |
|------|------|------|
| 100x+ | Legendary | ★★★★★ |
| 50x~100x | Viral | ★★★★☆ |
| 20x~50x | Great | ★★★☆☆ |
| 10x~20x | Good | ★★☆☆☆ |
| 5x~10x | AboveAvg | ★☆☆☆☆ |
| <5x | Normal | ☆☆☆☆☆ |

### score_view_like (좋아요 밀도 — 낮을수록 좋음)

| 비율 | 등급 | 의미 |
|------|------|------|
| ~20 | Exceptional | 조회 20회당 좋아요 1개 |
| 20~35 | High | 높은 반응 |
| 35~50 | Good | 평균 이상 |
| 50~100 | Normal | 보통 |
| 100+ | Low | 반응 낮음 |

### score_view_comment (댓글 밀도 — 낮을수록 좋음)

| 비율 | 등급 | 의미 |
|------|------|------|
| ~100 | Hot | 토론 활발 |
| 100~300 | Active | 댓글 활발 |
| 300~500 | Normal | 보통 |
| 500~1000 | Quiet | 조용한 편 |
| 1000+ | Silent | 반응 거의 없음 |

### 구독자 범위 필터

| 범위 | 라벨 |
|------|------|
| 0~1,000 | 마이크로 |
| 1,000~5,000 | 소형 |
| 5,000~10,000 | 중소형 |
| 10,000~50,000 | 중형 |
| 50,000~100,000 | 중대형 |
| 100,000~500,000 | 대형 |
| 500,000+ | 메가 |

## 수집 전략

### 1. 채널 시드 확장 (seed-channels)

- YouTube search API로 카테고리별 키워드 검색
- 카테고리 20개 × 키워드 5개 = 100회 search = 2,000 유닛/일
- 일 약 500~1,000개 새 채널 발견
- 초기 한국(KR), 이후 글로벌 확장

카테고리 설정:
```typescript
const CATEGORIES = {
  "22": { name: "인물_블로그", keywords: ["브이로그", "일상", "자기계발"] },
  "24": { name: "엔터테인먼트", keywords: ["예능", "리액션", "웃긴영상"] },
  "26": { name: "노하우_스타일", keywords: ["꿀팁", "라이프핵", "뷰티"] },
  "27": { name: "교육", keywords: ["강의", "공부법", "독학"] },
  "28": { name: "과학기술", keywords: ["AI", "IT 리뷰", "테크"] },
  // ...확장 가능
};
```

### 2. RSS 스캔 (rss-scan)

- 각 채널의 RSS 피드 조회 (API 쿼터 0)
- URL: `https://www.youtube.com/feeds/videos.xml?channel_id={ID}`
- 최신 영상 15개 중 DB에 없는 것 → 새 영상으로 등록
- 동시성: 50개 채널 병렬 fetch

### 3. 통계 수집 (collect-stats)

- 새로 등록된 영상의 videos API 호출 (50개 배치, 1유닛/요청)
- 채널 통계도 갱신 (channels API, 50개 배치)
- 스코어링 계산 후 DB 업데이트

### API 쿼터 배분 (일 10,000 유닛)

| 용도 | 유닛 |
|------|------|
| search (시드 확장) | 2,000 |
| videos (통계 수집) | 5,000 |
| channels (채널 정보) | 2,000 |
| 여유 | 1,000 |

## hypeduck에서 이식하는 코드

| hypeduck 파일 | → youtube-scout 파일 | 변경사항 |
|--------------|---------------------|---------|
| `src/libs/youtube/search.ts` | `src/lib/youtube-api.ts` | ESM으로 전환, fetch 사용 |
| `src/libs/youtube/utils.ts` | `src/lib/scoring.ts` | 3지표 6단계로 확장 |
| `src/libs/youtube/types.ts` | `src/lib/types.ts` | 스코어 필드 추가 |
| `scripts/yt-trending-by-category.ts` | `src/jobs/seed-channels.ts` | DB 저장으로 변경 (엑셀 제거) |

## 수동 실행 CLI

```bash
# 전체 스캔 (시드 + RSS + 통계)
pnpm --filter @howzero/youtube-scout run scan

# 시드 채널만 확장
pnpm --filter @howzero/youtube-scout run scan:seed

# RSS 스캔만
pnpm --filter @howzero/youtube-scout run scan:rss

# 통계 수집만
pnpm --filter @howzero/youtube-scout run scan:stats
```

## API 엔드포인트 (서버 연동 시)

```
GET /api/youtube-scout/videos
  ?period=7d|30d|all
  &category=education|entertainment|...
  &minViews=50000
  &maxViews=1000000
  &minSubscribers=0
  &maxSubscribers=10000
  &sortBy=score_view_sub|score_view_like|score_view_comment|view_count|published_at
  &order=asc|desc
  &page=1
  &limit=50

GET /api/youtube-scout/channels
  ?sortBy=subscriber_count|video_count
  &limit=50

GET /api/youtube-scout/stats
  → { totalChannels, totalVideos, lastScanAt }
```

## 환경변수

```env
YOUTUBE_API_KEY=your_api_key_here
DATABASE_URL=postgresql://user:pass@localhost:5432/howzero
```
