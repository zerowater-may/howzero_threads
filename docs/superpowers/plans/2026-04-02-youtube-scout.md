# YouTube Scout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** YouTube에서 구독자 대비 비정상적 성과를 내는 바이럴 영상을 자동 수집하고 스코어링하는 시스템

**Architecture:** howzero-dashboard 모노레포의 `packages/youtube-scout/` 패키지. hypeduck-server의 YouTube API 라이브러리를 ESM으로 이식하고, RSS 피드 스캐너 + 6단계 3지표 스코어링 + PostgreSQL 저장을 추가. 크론잡 또는 수동 CLI로 실행.

**Tech Stack:** TypeScript (ESM), YouTube Data API v3, RSS (xml2js), PostgreSQL (postgres.js), pnpm monorepo

**Source repo:** `/tmp/howzero-dashboard/` → `github.com/hedgehogcandy/howzero-dashboard`
**Reference code:** `/Users/zerowater/Downloads/hypeduck-server-main/src/libs/youtube/`

---

### Task 1: 패키지 스캐폴딩

**Files:**
- Create: `packages/youtube-scout/package.json`
- Create: `packages/youtube-scout/tsconfig.json`
- Create: `packages/youtube-scout/src/index.ts`

- [ ] **Step 1: package.json 생성**

```json
{
  "name": "@howzero/youtube-scout",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  },
  "scripts": {
    "scan": "tsx src/cli/run-scan.ts",
    "scan:seed": "tsx src/cli/run-scan.ts --seed-only",
    "scan:rss": "tsx src/cli/run-scan.ts --rss-only",
    "scan:stats": "tsx src/cli/run-scan.ts --stats-only",
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "postgres": "^3.4.5",
    "xml2js": "^0.6.2"
  },
  "devDependencies": {
    "@types/node": "^24.6.0",
    "@types/xml2js": "^0.4.14",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3",
    "vitest": "^3.0.5"
  }
}
```

- [ ] **Step 2: tsconfig.json 생성**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: src/index.ts 생성**

```typescript
export { type YTChannel, type YTVideo, type ScoreGrade } from "./lib/types.js";
export { computeScores, getViewSubGrade, getViewLikeGrade, getViewCommentGrade } from "./lib/scoring.js";
export { searchVideosByViewCount, fetchVideoStats, fetchChannelStats } from "./lib/youtube-api.js";
export { scanRssFeeds } from "./lib/rss-scanner.js";
export { expandSeedChannels } from "./lib/seed-expander.js";
```

- [ ] **Step 4: pnpm install**

```bash
cd /tmp/howzero-dashboard && pnpm install
```

- [ ] **Step 5: 커밋**

```bash
git add packages/youtube-scout/
git commit -m "feat: youtube-scout 패키지 스캐폴딩"
```

---

### Task 2: 타입 정의

**Files:**
- Create: `packages/youtube-scout/src/lib/types.ts`

- [ ] **Step 1: types.ts 작성**

```typescript
// YouTube Scout 타입 정의 — hypeduck types.ts 기반 확장

export interface YTChannel {
  id?: number;
  channelId: string;
  name: string;
  subscriberCount: number | null;
  videoCount: number | null;
  totalViewCount: number | null;
  category: string | null;
  thumbnailUrl: string | null;
  source: "search_seed" | "related" | "manual";
  lastScannedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface YTVideo {
  id?: number;
  videoId: string;
  channelId: string;
  title: string;
  channelTitle: string;
  publishedAt: Date;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  categoryId: string | null;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
  subscriberCountAtCollect: number | null;
  // scores
  scoreViewSub: number | null;
  scoreViewLike: number | null;
  scoreViewComment: number | null;
  gradeViewSub: ViewSubGrade | null;
  gradeViewLike: ViewLikeGrade | null;
  gradeViewComment: ViewCommentGrade | null;
  collectedAt: Date;
  updatedAt: Date;
}

export type ViewSubGrade = "Legendary" | "Viral" | "Great" | "Good" | "AboveAvg" | "Normal";
export type ViewLikeGrade = "Exceptional" | "High" | "Good" | "Normal" | "Low";
export type ViewCommentGrade = "Hot" | "Active" | "Normal" | "Quiet" | "Silent";
export type ScoreGrade = ViewSubGrade | ViewLikeGrade | ViewCommentGrade;

export interface RssEntry {
  videoId: string;
  title: string;
  channelId: string;
  publishedAt: string;
}

export interface YouTubeApiVideo {
  videoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  categoryId: string | null;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
}

export interface YouTubeApiChannel {
  channelId: string;
  title: string;
  subscriberCount: number | null;
  videoCount: number | null;
  totalViewCount: number | null;
  thumbnailUrl: string | null;
  hiddenSubscriberCount: boolean;
}

export interface SeedConfig {
  categoryId: string;
  name: string;
  keywords: string[];
}
```

- [ ] **Step 2: 커밋**

```bash
git add packages/youtube-scout/src/lib/types.ts
git commit -m "feat: youtube-scout 타입 정의"
```

---

### Task 3: 스코어링 시스템

**Files:**
- Create: `packages/youtube-scout/src/lib/scoring.ts`

- [ ] **Step 1: scoring.ts 작성**

```typescript
import type { ViewSubGrade, ViewLikeGrade, ViewCommentGrade } from "./types.js";

export function getViewSubGrade(ratio: number): ViewSubGrade {
  if (ratio >= 100) return "Legendary";
  if (ratio >= 50) return "Viral";
  if (ratio >= 20) return "Great";
  if (ratio >= 10) return "Good";
  if (ratio >= 5) return "AboveAvg";
  return "Normal";
}

export function getViewLikeGrade(ratio: number): ViewLikeGrade {
  if (ratio <= 20) return "Exceptional";
  if (ratio <= 35) return "High";
  if (ratio <= 50) return "Good";
  if (ratio <= 100) return "Normal";
  return "Low";
}

export function getViewCommentGrade(ratio: number): ViewCommentGrade {
  if (ratio <= 100) return "Hot";
  if (ratio <= 300) return "Active";
  if (ratio <= 500) return "Normal";
  if (ratio <= 1000) return "Quiet";
  return "Silent";
}

export function computeScores(
  viewCount: number,
  subscriberCount: number | null,
  likeCount: number | null,
  commentCount: number | null
): {
  scoreViewSub: number | null;
  scoreViewLike: number | null;
  scoreViewComment: number | null;
  gradeViewSub: ViewSubGrade | null;
  gradeViewLike: ViewLikeGrade | null;
  gradeViewComment: ViewCommentGrade | null;
} {
  const scoreViewSub = subscriberCount && subscriberCount > 0
    ? viewCount / subscriberCount
    : null;
  const scoreViewLike = likeCount && likeCount > 0
    ? viewCount / likeCount
    : null;
  const scoreViewComment = commentCount && commentCount > 0
    ? viewCount / commentCount
    : null;

  return {
    scoreViewSub,
    scoreViewLike,
    scoreViewComment,
    gradeViewSub: scoreViewSub !== null ? getViewSubGrade(scoreViewSub) : null,
    gradeViewLike: scoreViewLike !== null ? getViewLikeGrade(scoreViewLike) : null,
    gradeViewComment: scoreViewComment !== null ? getViewCommentGrade(scoreViewComment) : null,
  };
}
```

- [ ] **Step 2: 커밋**

```bash
git add packages/youtube-scout/src/lib/scoring.ts
git commit -m "feat: 3지표 6단계 스코어링 시스템"
```

---

### Task 4: YouTube Data API 래퍼

**Files:**
- Create: `packages/youtube-scout/src/lib/youtube-api.ts`

hypeduck의 `search.ts`를 ESM으로 이식. `searchVideosByViewCount`, `fetchVideoStats`, `fetchChannelStats` 3개 함수로 분리.

- [ ] **Step 1: youtube-api.ts 작성**

```typescript
import type { YouTubeApiVideo, YouTubeApiChannel } from "./types.js";

const YT_API = "https://www.googleapis.com/youtube/v3";

function parseIso8601Duration(iso: string): number | null {
  if (!iso) return null;
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  return (m[1] ? +m[1] : 0) * 3600 + (m[2] ? +m[2] : 0) * 60 + (m[3] ? +m[3] : 0);
}

function bestThumbnail(thumbs: any): string | null {
  if (!thumbs) return null;
  for (const key of ["maxres", "standard", "high", "medium", "default"]) {
    if (thumbs[key]?.url) return thumbs[key].url;
  }
  return null;
}

export async function searchVideosByViewCount(
  query: string,
  apiKey: string,
  opts: { maxResults?: number; recentDays?: number; regionCode?: string } = {}
): Promise<string[]> {
  const { maxResults = 50, recentDays = 30, regionCode = "KR" } = opts;
  const publishedAfter = new Date(Date.now() - recentDays * 86400000).toISOString();
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  while (videoIds.length < maxResults) {
    const perPage = Math.min(50, maxResults - videoIds.length);
    const url = `${YT_API}/search?part=snippet&type=video&order=viewCount`
      + `&maxResults=${perPage}&publishedAfter=${encodeURIComponent(publishedAfter)}`
      + `&regionCode=${encodeURIComponent(regionCode)}&q=${encodeURIComponent(query)}`
      + `&key=${encodeURIComponent(apiKey)}`
      + (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube search failed: ${res.status} ${await res.text()}`);
    const data: any = await res.json();

    for (const item of data?.items ?? []) {
      const vid = item?.id?.videoId;
      if (vid && !videoIds.includes(vid)) videoIds.push(vid);
    }
    pageToken = data?.nextPageToken;
    if (!pageToken) break;
  }
  return videoIds.slice(0, maxResults);
}

export async function fetchVideoStats(
  videoIds: string[],
  apiKey: string
): Promise<YouTubeApiVideo[]> {
  const results: YouTubeApiVideo[] = [];

  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const url = `${YT_API}/videos?part=snippet,contentDetails,statistics`
      + `&id=${encodeURIComponent(chunk.join(","))}&key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube videos failed: ${res.status} ${await res.text()}`);
    const data: any = await res.json();

    for (const v of data?.items ?? []) {
      const snippet = v?.snippet ?? {};
      const stats = v?.statistics ?? {};
      const cd = v?.contentDetails ?? {};

      results.push({
        videoId: String(v?.id ?? ""),
        title: String(snippet?.title ?? ""),
        channelId: String(snippet?.channelId ?? ""),
        channelTitle: String(snippet?.channelTitle ?? ""),
        publishedAt: String(snippet?.publishedAt ?? ""),
        thumbnailUrl: bestThumbnail(snippet?.thumbnails),
        durationSeconds: parseIso8601Duration(String(cd?.duration ?? "")),
        categoryId: String(snippet?.categoryId ?? ""),
        viewCount: Number(stats?.viewCount ?? 0),
        likeCount: stats?.likeCount != null ? Number(stats.likeCount) : null,
        commentCount: stats?.commentCount != null ? Number(stats.commentCount) : null,
      });
    }
  }
  return results;
}

export async function fetchChannelStats(
  channelIds: string[],
  apiKey: string
): Promise<YouTubeApiChannel[]> {
  const results: YouTubeApiChannel[] = [];

  for (let i = 0; i < channelIds.length; i += 50) {
    const chunk = channelIds.slice(i, i + 50);
    const url = `${YT_API}/channels?part=snippet,statistics`
      + `&id=${encodeURIComponent(chunk.join(","))}&key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube channels failed: ${res.status} ${await res.text()}`);
    const data: any = await res.json();

    for (const ch of data?.items ?? []) {
      const stats = ch?.statistics ?? {};
      const snippet = ch?.snippet ?? {};
      const hidden = Boolean(stats?.hiddenSubscriberCount);

      results.push({
        channelId: String(ch?.id ?? ""),
        title: String(snippet?.title ?? ""),
        subscriberCount: !hidden && stats?.subscriberCount != null ? Number(stats.subscriberCount) : null,
        videoCount: stats?.videoCount != null ? Number(stats.videoCount) : null,
        totalViewCount: stats?.viewCount != null ? Number(stats.viewCount) : null,
        thumbnailUrl: bestThumbnail(snippet?.thumbnails),
        hiddenSubscriberCount: hidden,
      });
    }
  }
  return results;
}

export async function fetchMostPopular(
  apiKey: string,
  categoryId: string,
  regionCode: string = "KR"
): Promise<string[]> {
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  while (true) {
    const url = `${YT_API}/videos?part=snippet,contentDetails,statistics`
      + `&chart=mostPopular&regionCode=${regionCode}`
      + `&videoCategoryId=${categoryId}&maxResults=50`
      + `&key=${encodeURIComponent(apiKey)}`
      + (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "");

    const res = await fetch(url);
    if (!res.ok) break;
    const data: any = await res.json();
    for (const v of data?.items ?? []) {
      const vid = String(v?.id ?? "");
      if (vid) videoIds.push(vid);
    }
    pageToken = data?.nextPageToken;
    if (!pageToken) break;
  }
  return videoIds;
}
```

- [ ] **Step 2: 커밋**

```bash
git add packages/youtube-scout/src/lib/youtube-api.ts
git commit -m "feat: YouTube Data API 래퍼 (search, videos, channels)"
```

---

### Task 5: RSS 피드 스캐너

**Files:**
- Create: `packages/youtube-scout/src/lib/rss-scanner.ts`

- [ ] **Step 1: rss-scanner.ts 작성**

```typescript
import { parseStringPromise } from "xml2js";
import type { RssEntry } from "./types.js";

const RSS_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=";
const CONCURRENCY = 30;

async function fetchRss(channelId: string): Promise<RssEntry[]> {
  try {
    const res = await fetch(`${RSS_URL}${channelId}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = await parseStringPromise(xml, { explicitArray: false });
    const entries = parsed?.feed?.entry;
    if (!entries) return [];
    const list = Array.isArray(entries) ? entries : [entries];

    return list.map((e: any) => ({
      videoId: String(e?.["yt:videoId"] ?? ""),
      title: String(e?.title ?? ""),
      channelId,
      publishedAt: String(e?.published ?? ""),
    })).filter((e: RssEntry) => e.videoId.length > 0);
  } catch {
    return [];
  }
}

export async function scanRssFeeds(
  channelIds: string[],
  knownVideoIds: Set<string>
): Promise<RssEntry[]> {
  const newEntries: RssEntry[] = [];

  for (let i = 0; i < channelIds.length; i += CONCURRENCY) {
    const batch = channelIds.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(fetchRss));

    for (const result of results) {
      if (result.status === "fulfilled") {
        for (const entry of result.value) {
          if (!knownVideoIds.has(entry.videoId)) {
            newEntries.push(entry);
            knownVideoIds.add(entry.videoId);
          }
        }
      }
    }

    if (i + CONCURRENCY < channelIds.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return newEntries;
}
```

- [ ] **Step 2: 커밋**

```bash
git add packages/youtube-scout/src/lib/rss-scanner.ts
git commit -m "feat: RSS 피드 스캐너 (채널별 새 영상 감지)"
```

---

### Task 6: 채널 시드 확장기

**Files:**
- Create: `packages/youtube-scout/src/lib/seed-expander.ts`

- [ ] **Step 1: seed-expander.ts 작성**

```typescript
import type { SeedConfig } from "./types.js";
import { searchVideosByViewCount, fetchChannelStats } from "./youtube-api.js";

export const DEFAULT_SEED_CONFIGS: SeedConfig[] = [
  { categoryId: "22", name: "인물_블로그", keywords: ["브이로그", "일상 브이로그", "자기계발 루틴"] },
  { categoryId: "24", name: "엔터테인먼트", keywords: ["예능", "리액션", "웃긴영상"] },
  { categoryId: "26", name: "노하우_스타일", keywords: ["꿀팁", "라이프핵", "뷰티 튜토리얼"] },
  { categoryId: "27", name: "교육", keywords: ["강의", "공부법", "독학"] },
  { categoryId: "28", name: "과학기술", keywords: ["AI 기술", "IT 리뷰", "테크 뉴스"] },
  { categoryId: "10", name: "음악", keywords: ["커버곡", "음악 리뷰", "작곡"] },
  { categoryId: "17", name: "스포츠", keywords: ["운동 루틴", "헬스", "골프 레슨"] },
  { categoryId: "20", name: "게임", keywords: ["게임 리뷰", "공략", "실황"] },
  { categoryId: "25", name: "뉴스_정치", keywords: ["시사", "경제 뉴스", "부동산"] },
  { categoryId: "19", name: "여행_이벤트", keywords: ["여행 브이로그", "맛집", "카페 투어"] },
];

export async function expandSeedChannels(
  apiKey: string,
  configs: SeedConfig[] = DEFAULT_SEED_CONFIGS,
  knownChannelIds: Set<string>,
  opts: { maxPerKeyword?: number; recentDays?: number } = {}
): Promise<{ channelId: string; name: string; category: string }[]> {
  const { maxPerKeyword = 30, recentDays = 90 } = opts;
  const discovered: { channelId: string; name: string; category: string }[] = [];

  for (const config of configs) {
    for (const keyword of config.keywords) {
      try {
        const videoIds = await searchVideosByViewCount(keyword, apiKey, {
          maxResults: maxPerKeyword,
          recentDays,
        });

        if (videoIds.length === 0) continue;

        // videos API로 channelId 추출
        const { fetchVideoStats } = await import("./youtube-api.js");
        const videos = await fetchVideoStats(videoIds, apiKey);

        for (const v of videos) {
          if (v.channelId && !knownChannelIds.has(v.channelId)) {
            knownChannelIds.add(v.channelId);
            discovered.push({
              channelId: v.channelId,
              name: v.channelTitle,
              category: config.name,
            });
          }
        }
      } catch (e: any) {
        console.error(`  [seed] "${keyword}" 실패: ${e.message?.slice(0, 80)}`);
      }
    }
  }

  return discovered;
}
```

- [ ] **Step 2: 커밋**

```bash
git add packages/youtube-scout/src/lib/seed-expander.ts
git commit -m "feat: 카테고리별 채널 시드 자동 확장"
```

---

### Task 7: DB 스키마 + 쿼리

**Files:**
- Create: `packages/youtube-scout/src/db/schema.sql`
- Create: `packages/youtube-scout/src/db/queries.ts`

- [ ] **Step 1: schema.sql 작성**

```sql
CREATE TABLE IF NOT EXISTS yt_channels (
  id              SERIAL PRIMARY KEY,
  channel_id      VARCHAR(64) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  subscriber_count INTEGER,
  video_count     INTEGER,
  total_view_count BIGINT,
  category        VARCHAR(64),
  thumbnail_url   VARCHAR(512),
  source          VARCHAR(32) DEFAULT 'search_seed',
  last_scanned_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yt_channels_channel_id ON yt_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_yt_channels_subscriber ON yt_channels(subscriber_count);

CREATE TABLE IF NOT EXISTS yt_videos (
  id                SERIAL PRIMARY KEY,
  video_id          VARCHAR(32) UNIQUE NOT NULL,
  channel_id        VARCHAR(64) NOT NULL,
  title             VARCHAR(512) NOT NULL,
  channel_title     VARCHAR(255),
  published_at      TIMESTAMPTZ NOT NULL,
  thumbnail_url     VARCHAR(512),
  duration_seconds  INTEGER,
  category_id       VARCHAR(8),
  view_count        INTEGER DEFAULT 0,
  like_count        INTEGER,
  comment_count     INTEGER,
  subscriber_count_at_collect INTEGER,
  score_view_sub    REAL,
  score_view_like   REAL,
  score_view_comment REAL,
  grade_view_sub    VARCHAR(16),
  grade_view_like   VARCHAR(16),
  grade_view_comment VARCHAR(16),
  collected_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yt_videos_video_id ON yt_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_yt_videos_channel_id ON yt_videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_yt_videos_published ON yt_videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_yt_videos_score ON yt_videos(score_view_sub DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_yt_videos_views ON yt_videos(view_count DESC);
```

- [ ] **Step 2: queries.ts 작성**

```typescript
import postgres from "postgres";

export function createDb(connectionString: string) {
  const sql = postgres(connectionString);

  return {
    sql,

    async migrate() {
      const { readFileSync } = await import("fs");
      const { fileURLToPath } = await import("url");
      const { dirname, join } = await import("path");
      const dir = dirname(fileURLToPath(import.meta.url));
      const schema = readFileSync(join(dir, "schema.sql"), "utf-8");
      await sql.unsafe(schema);
    },

    async getAllChannelIds(): Promise<string[]> {
      const rows = await sql`SELECT channel_id FROM yt_channels ORDER BY id`;
      return rows.map((r: any) => r.channel_id);
    },

    async getKnownVideoIds(): Promise<Set<string>> {
      const rows = await sql`SELECT video_id FROM yt_videos`;
      return new Set(rows.map((r: any) => r.video_id));
    },

    async getKnownChannelIds(): Promise<Set<string>> {
      const rows = await sql`SELECT channel_id FROM yt_channels`;
      return new Set(rows.map((r: any) => r.channel_id));
    },

    async upsertChannel(ch: {
      channelId: string; name: string; subscriberCount?: number | null;
      videoCount?: number | null; totalViewCount?: number | null;
      category?: string | null; thumbnailUrl?: string | null;
      source?: string;
    }) {
      await sql`
        INSERT INTO yt_channels (channel_id, name, subscriber_count, video_count, total_view_count, category, thumbnail_url, source)
        VALUES (${ch.channelId}, ${ch.name}, ${ch.subscriberCount ?? null}, ${ch.videoCount ?? null}, ${ch.totalViewCount ?? null}, ${ch.category ?? null}, ${ch.thumbnailUrl ?? null}, ${ch.source ?? "search_seed"})
        ON CONFLICT (channel_id) DO UPDATE SET
          name = EXCLUDED.name,
          subscriber_count = COALESCE(EXCLUDED.subscriber_count, yt_channels.subscriber_count),
          video_count = COALESCE(EXCLUDED.video_count, yt_channels.video_count),
          total_view_count = COALESCE(EXCLUDED.total_view_count, yt_channels.total_view_count),
          thumbnail_url = COALESCE(EXCLUDED.thumbnail_url, yt_channels.thumbnail_url),
          updated_at = NOW()
      `;
    },

    async upsertVideo(v: {
      videoId: string; channelId: string; title: string; channelTitle?: string;
      publishedAt: string; thumbnailUrl?: string | null;
      durationSeconds?: number | null; categoryId?: string | null;
      viewCount: number; likeCount?: number | null; commentCount?: number | null;
      subscriberCountAtCollect?: number | null;
      scoreViewSub?: number | null; scoreViewLike?: number | null;
      scoreViewComment?: number | null;
      gradeViewSub?: string | null; gradeViewLike?: string | null;
      gradeViewComment?: string | null;
    }) {
      await sql`
        INSERT INTO yt_videos (video_id, channel_id, title, channel_title, published_at, thumbnail_url, duration_seconds, category_id, view_count, like_count, comment_count, subscriber_count_at_collect, score_view_sub, score_view_like, score_view_comment, grade_view_sub, grade_view_like, grade_view_comment)
        VALUES (${v.videoId}, ${v.channelId}, ${v.title}, ${v.channelTitle ?? null}, ${v.publishedAt}, ${v.thumbnailUrl ?? null}, ${v.durationSeconds ?? null}, ${v.categoryId ?? null}, ${v.viewCount}, ${v.likeCount ?? null}, ${v.commentCount ?? null}, ${v.subscriberCountAtCollect ?? null}, ${v.scoreViewSub ?? null}, ${v.scoreViewLike ?? null}, ${v.scoreViewComment ?? null}, ${v.gradeViewSub ?? null}, ${v.gradeViewLike ?? null}, ${v.gradeViewComment ?? null})
        ON CONFLICT (video_id) DO UPDATE SET
          view_count = EXCLUDED.view_count,
          like_count = EXCLUDED.like_count,
          comment_count = EXCLUDED.comment_count,
          score_view_sub = EXCLUDED.score_view_sub,
          score_view_like = EXCLUDED.score_view_like,
          score_view_comment = EXCLUDED.score_view_comment,
          grade_view_sub = EXCLUDED.grade_view_sub,
          grade_view_like = EXCLUDED.grade_view_like,
          grade_view_comment = EXCLUDED.grade_view_comment,
          updated_at = NOW()
      `;
    },

    async updateChannelScannedAt(channelId: string) {
      await sql`UPDATE yt_channels SET last_scanned_at = NOW() WHERE channel_id = ${channelId}`;
    },

    async getStats() {
      const [channels] = await sql`SELECT COUNT(*) as count FROM yt_channels`;
      const [videos] = await sql`SELECT COUNT(*) as count FROM yt_videos`;
      const [lastScan] = await sql`SELECT MAX(collected_at) as last_scan FROM yt_videos`;
      return {
        totalChannels: Number(channels.count),
        totalVideos: Number(videos.count),
        lastScanAt: lastScan.last_scan,
      };
    },
  };
}

export type ScoutDb = ReturnType<typeof createDb>;
```

- [ ] **Step 3: 커밋**

```bash
git add packages/youtube-scout/src/db/
git commit -m "feat: DB 스키마 + 쿼리 (yt_channels, yt_videos)"
```

---

### Task 8: 일일 스캔 잡 + CLI

**Files:**
- Create: `packages/youtube-scout/src/jobs/daily-scan.ts`
- Create: `packages/youtube-scout/src/cli/run-scan.ts`

- [ ] **Step 1: daily-scan.ts 작성**

```typescript
import type { ScoutDb } from "../db/queries.js";
import { expandSeedChannels } from "../lib/seed-expander.js";
import { scanRssFeeds } from "../lib/rss-scanner.js";
import { fetchVideoStats, fetchChannelStats } from "../lib/youtube-api.js";
import { computeScores } from "../lib/scoring.js";

export interface ScanOptions {
  seedOnly?: boolean;
  rssOnly?: boolean;
  statsOnly?: boolean;
}

export async function runDailyScan(
  db: ScoutDb,
  apiKey: string,
  opts: ScanOptions = {}
) {
  const runAll = !opts.seedOnly && !opts.rssOnly && !opts.statsOnly;

  // === Job 1: 채널 시드 확장 ===
  if (runAll || opts.seedOnly) {
    console.log("\n=== Job 1: 채널 시드 확장 ===");
    const knownChannels = await db.getKnownChannelIds();
    console.log(`  기존 채널: ${knownChannels.size}개`);

    const discovered = await expandSeedChannels(apiKey, undefined, knownChannels);
    console.log(`  새 채널 발견: ${discovered.length}개`);

    // 채널 상세 정보 가져오기
    if (discovered.length > 0) {
      const channelDetails = await fetchChannelStats(
        discovered.map((d) => d.channelId),
        apiKey
      );
      for (const detail of channelDetails) {
        const disc = discovered.find((d) => d.channelId === detail.channelId);
        await db.upsertChannel({
          channelId: detail.channelId,
          name: detail.title,
          subscriberCount: detail.subscriberCount,
          videoCount: detail.videoCount,
          totalViewCount: detail.totalViewCount,
          category: disc?.category ?? null,
          thumbnailUrl: detail.thumbnailUrl,
          source: "search_seed",
        });
      }
      console.log(`  DB 저장 완료: ${channelDetails.length}개`);
    }
  }

  // === Job 2: RSS 스캔 ===
  let newVideoIds: string[] = [];
  if (runAll || opts.rssOnly) {
    console.log("\n=== Job 2: RSS 스캔 ===");
    const allChannelIds = await db.getAllChannelIds();
    const knownVideos = await db.getKnownVideoIds();
    console.log(`  스캔 대상: ${allChannelIds.length}개 채널`);

    const newEntries = await scanRssFeeds(allChannelIds, knownVideos);
    newVideoIds = newEntries.map((e) => e.videoId);
    console.log(`  새 영상 발견: ${newVideoIds.length}개`);
  }

  // === Job 3: 통계 수집 + 스코어링 ===
  if (runAll || opts.statsOnly) {
    console.log("\n=== Job 3: 통계 수집 + 스코어링 ===");

    // statsOnly 모드면 DB에서 최근 영상 가져오기
    if (opts.statsOnly) {
      const known = await db.getKnownVideoIds();
      newVideoIds = Array.from(known).slice(0, 500);
    }

    if (newVideoIds.length === 0) {
      console.log("  수집할 영상 없음");
      return;
    }

    const videos = await fetchVideoStats(newVideoIds, apiKey);
    console.log(`  영상 통계 수집: ${videos.length}개`);

    // 채널 통계도 가져오기
    const channelIds = [...new Set(videos.map((v) => v.channelId))];
    const channels = await fetchChannelStats(channelIds, apiKey);
    const channelMap = new Map(channels.map((ch) => [ch.channelId, ch]));

    for (const video of videos) {
      const ch = channelMap.get(video.channelId);
      const subs = ch?.subscriberCount ?? null;
      const scores = computeScores(video.viewCount, subs, video.likeCount, video.commentCount);

      await db.upsertVideo({
        videoId: video.videoId,
        channelId: video.channelId,
        title: video.title,
        channelTitle: video.channelTitle,
        publishedAt: video.publishedAt,
        thumbnailUrl: video.thumbnailUrl,
        durationSeconds: video.durationSeconds,
        categoryId: video.categoryId,
        viewCount: video.viewCount,
        likeCount: video.likeCount,
        commentCount: video.commentCount,
        subscriberCountAtCollect: subs,
        ...scores,
      });

      // 채널 정보도 갱신
      if (ch) {
        await db.upsertChannel({
          channelId: ch.channelId,
          name: ch.title,
          subscriberCount: ch.subscriberCount,
          videoCount: ch.videoCount,
          totalViewCount: ch.totalViewCount,
          thumbnailUrl: ch.thumbnailUrl,
        });
      }
    }

    console.log(`  DB 저장 완료: ${videos.length}개 영상`);
  }

  const stats = await db.getStats();
  console.log(`\n=== 완료 ===`);
  console.log(`  채널 DB: ${stats.totalChannels}개`);
  console.log(`  영상 DB: ${stats.totalVideos}개`);
  console.log(`  마지막 수집: ${stats.lastScanAt ?? "없음"}`);
}
```

- [ ] **Step 2: run-scan.ts CLI 작성**

```typescript
import { createDb } from "../db/queries.js";
import { runDailyScan } from "../jobs/daily-scan.js";

const args = process.argv.slice(2);
const seedOnly = args.includes("--seed-only");
const rssOnly = args.includes("--rss-only");
const statsOnly = args.includes("--stats-only");

const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey) {
  console.error("YOUTUBE_API_KEY 환경변수가 필요합니다.");
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL 환경변수가 필요합니다.");
  process.exit(1);
}

const db = createDb(dbUrl);

console.log("YouTube Scout 스캔 시작...");
console.log(`  모드: ${seedOnly ? "seed-only" : rssOnly ? "rss-only" : statsOnly ? "stats-only" : "전체"}`);

await db.migrate();
await runDailyScan(db, apiKey, { seedOnly, rssOnly, statsOnly });

await db.sql.end();
console.log("\n완료!");
```

- [ ] **Step 3: .env.example 업데이트**

```env
YOUTUBE_API_KEY=your_youtube_api_key
DATABASE_URL=postgresql://user:pass@localhost:5432/howzero
```

- [ ] **Step 4: 커밋**

```bash
git add packages/youtube-scout/src/jobs/ packages/youtube-scout/src/cli/
git commit -m "feat: 일일 스캔 잡 + CLI runner"
```

---

### Task 9: index.ts 최종화 + 푸시

**Files:**
- Modify: `packages/youtube-scout/src/index.ts`

- [ ] **Step 1: index.ts 업데이트**

```typescript
// YouTube Scout — 바이럴 영상 파인더
export { type YTChannel, type YTVideo, type ScoreGrade, type RssEntry, type YouTubeApiVideo, type YouTubeApiChannel, type SeedConfig } from "./lib/types.js";
export { computeScores, getViewSubGrade, getViewLikeGrade, getViewCommentGrade } from "./lib/scoring.js";
export { searchVideosByViewCount, fetchVideoStats, fetchChannelStats, fetchMostPopular } from "./lib/youtube-api.js";
export { scanRssFeeds } from "./lib/rss-scanner.js";
export { expandSeedChannels, DEFAULT_SEED_CONFIGS } from "./lib/seed-expander.js";
export { createDb, type ScoutDb } from "./db/queries.js";
export { runDailyScan } from "./jobs/daily-scan.js";
```

- [ ] **Step 2: typecheck**

```bash
cd /tmp/howzero-dashboard && pnpm --filter @howzero/youtube-scout typecheck
```

- [ ] **Step 3: 최종 커밋 + 푸시**

```bash
git add -A
git commit -m "feat: youtube-scout 패키지 완성 (API + RSS + 스코어링 + DB)"
git push origin main
```

---

## 실행 방법

```bash
# 환경변수 설정
export YOUTUBE_API_KEY=your_key
export DATABASE_URL=postgresql://user:pass@localhost:5432/howzero

# 전체 스캔
pnpm --filter @howzero/youtube-scout run scan

# 채널 시드만
pnpm --filter @howzero/youtube-scout run scan:seed

# RSS 스캔만
pnpm --filter @howzero/youtube-scout run scan:rss
```
