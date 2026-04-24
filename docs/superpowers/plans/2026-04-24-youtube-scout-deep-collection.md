# YouTube Scout Deep Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** howzero-dashboard에 일일 03:00 KST 자동 deep-scan 추가 (30 카테고리 mostPopular) + 채널 평균 대비 폭발 시그널(`performance_rate`) + Shorts/롱폼 자동 분류 + UI 신규 필터/정렬.

**Architecture:**
- 신규 잡 `daily-deep-scan` (30 카테고리 mostPopular fetch + channels stats batch + 점수 계산 + 잠금)
- 기존 keyword/RSS/stats 잡 그대로 유지 (병행)
- `node-cron` in-process로 server 시작 시 03:00 KST 등록
- DB: `yt_videos` 6컬럼 + `yt_channels` 5컬럼 + `yt_scan_runs` 신규 테이블
- UI: 형식 토글(롱폼 기본) + 평균 대비 컬럼 + performance_rate 정렬 + 30 카테고리 자동 dropdown

**Tech Stack:**
- TypeScript (ESM), Node 22
- pnpm 9 workspace
- postgres.js (raw SQL, drizzle 사용 X — 이 패키지)
- node-cron ^3
- vitest 2 + @testing-library/react
- YouTube Data API v3 (videos.list mostPopular, channels.list)

**Working Directory:** `/Users/zerowater/Dropbox/zerowater/howzero-dashboard`

**Spec Reference:** [/Users/zerowater/Dropbox/zerowater/howzero/docs/superpowers/specs/2026-04-24-youtube-scout-deep-collection-design.md](/Users/zerowater/Dropbox/zerowater/howzero/docs/superpowers/specs/2026-04-24-youtube-scout-deep-collection-design.md)

---

## File Structure

### Create
- `packages/youtube-scout/src/lib/__tests__/scoring.test.ts` — gradePerformance unit tests
- `packages/youtube-scout/src/lib/__tests__/youtube-api.test.ts` — fetch함수 mock tests
- `packages/youtube-scout/src/jobs/daily-deep-scan.ts` — 신규 잡 메인 함수
- `packages/youtube-scout/src/jobs/__tests__/daily-deep-scan.test.ts` — integration test (memory db + mock api)
- `packages/youtube-scout/src/cli/run-deep-scan.ts` — 수동 호출 CLI
- `server/src/__tests__/youtube-scout-route-filters.test.ts` — 새 query param tests
- `ui/src/pages/__tests__/YouTubeScout-filters.test.tsx` — UI 필터 tests

### Modify
- `packages/youtube-scout/src/db/queries.ts` — DDL에 6+5+잠금 테이블 추가, upsert에 신규 컬럼, scan-runs 잠금 함수
- `packages/youtube-scout/src/lib/scoring.ts` — `gradePerformance` 추가
- `packages/youtube-scout/src/lib/types.ts` — `GradePerformance`, `CollectedVia` 타입 + `YTVideo`/`YTChannel` 새 필드
- `packages/youtube-scout/src/lib/youtube-api.ts` — `fetchMostPopularByCategory`, `fetchChannelsBatch` 추가
- `packages/youtube-scout/package.json` — `daily-scan` script 추가
- `packages/youtube-scout/src/index.ts` — `runDeepScan` export
- `server/src/app.ts` — startup 시 cron 등록 (또는 startCronJobs 함수 호출)
- `server/src/index.ts` — node-cron 등록
- `server/src/routes/youtube-scout.ts` — `isShorts`, `gradePerformance`, sortBy=`performance_rate` 추가
- `ui/src/api/youtube-scout.ts` — `YTVideoFilters`/`YTVideoRow` 새 필드
- `ui/src/pages/YouTubeScout.tsx` — 형식 토글, 평균 대비 컬럼, 카테고리 dropdown autopop, sortBy 추가
- `package.json` (root, optional) — Node-cron 추가

### No Touch
- `packages/youtube-scout/src/jobs/daily-scan.ts` (기존 keyword/RSS/stats 잡)
- `packages/youtube-scout/src/lib/seed-expander.ts`
- 기존 60영상 데이터 (마이그레이션 후 NULL 컬럼 자동 채워짐)

---

## Tasks

### Task 1: 새 브랜치 + 사전 점검

**Files:** —

- [ ] **Step 1: 새 브랜치 생성**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero-dashboard
git status   # clean인지 확인 (있으면 먼저 commit/stash)
git checkout main 2>/dev/null || git checkout master 2>/dev/null
git pull --ff-only
git checkout -b feat/youtube-scout-deep-collection
```

- [ ] **Step 2: 환경변수 + DB 살아있는지 확인**

```bash
export YOUTUBE_API_KEY="AIzaSyCmPd7ntVdx6BbWGq0y2qyixybGFp6fxR8"
export DATABASE_URL="postgres://howzero:howzero@127.0.0.1:54329/howzero"
curl -sw "STATUS=%{http_code}\n" "https://www.googleapis.com/youtube/v3/videos?part=statistics&id=dQw4w9WgXcQ&key=${YOUTUBE_API_KEY}" | tail -2
# 기대: STATUS=200
psql "${DATABASE_URL}" -c "SELECT COUNT(*) FROM yt_videos;" || echo "PG 연결 실패 — howzero-cli run 먼저"
```

- [ ] **Step 3: `node-cron` 의존성 설치**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero-dashboard
pnpm --filter @howzero/server add node-cron
pnpm --filter @howzero/server add -D @types/node-cron
```

- [ ] **Step 4: 베이스라인 테스트 통과 확인**

```bash
pnpm --filter @howzero/youtube-scout vitest run 2>&1 | tail -5
pnpm --filter @howzero/server vitest run 2>&1 | tail -5
```
Expected: 모두 PASS (회귀 베이스라인 잡기)

---

### Task 2: DB Schema 확장 (DDL + scan-runs 테이블)

**Files:**
- Modify: `packages/youtube-scout/src/db/queries.ts`

- [ ] **Step 1: 기존 DDL 위치 파악**

```bash
grep -n "CREATE TABLE\|migrate\|sql.unsafe" packages/youtube-scout/src/db/queries.ts | head -20
```
DDL이 어떤 함수 안에 있는지 확인 (보통 `migrate()` 또는 init 함수). 없으면 다음 step에서 신설.

- [ ] **Step 2: `db.migrate()`에 ALTER TABLE + CREATE TABLE 추가**

`packages/youtube-scout/src/db/queries.ts`의 `migrate()` 함수 안에 (없으면 createDb의 db 객체에 추가):

```typescript
async migrate() {
  // 기존 CREATE TABLE 코드들 ...
  await sql`ALTER TABLE yt_videos ADD COLUMN IF NOT EXISTS is_shorts boolean NOT NULL DEFAULT false`;
  await sql`ALTER TABLE yt_videos ADD COLUMN IF NOT EXISTS performance_rate numeric`;
  await sql`ALTER TABLE yt_videos ADD COLUMN IF NOT EXISTS contribution_rate numeric`;
  await sql`ALTER TABLE yt_videos ADD COLUMN IF NOT EXISTS grade_performance text`;
  await sql`ALTER TABLE yt_videos ADD COLUMN IF NOT EXISTS collected_via text NOT NULL DEFAULT 'search'`;

  await sql`ALTER TABLE yt_channels ADD COLUMN IF NOT EXISTS avg_view_count numeric`;
  await sql`ALTER TABLE yt_channels ADD COLUMN IF NOT EXISTS total_view_count bigint`;
  await sql`ALTER TABLE yt_channels ADD COLUMN IF NOT EXISTS total_video_count bigint`;
  await sql`ALTER TABLE yt_channels ADD COLUMN IF NOT EXISTS last_upload_at timestamptz`;
  await sql`ALTER TABLE yt_channels ADD COLUMN IF NOT EXISTS active_rate numeric`;

  await sql`
    CREATE TABLE IF NOT EXISTS yt_scan_runs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      job_name text NOT NULL,
      status text NOT NULL,
      started_at timestamptz NOT NULL DEFAULT now(),
      finished_at timestamptz,
      videos_collected int DEFAULT 0,
      channels_updated int DEFAULT 0,
      error_message text
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_yt_scan_runs_running ON yt_scan_runs (job_name) WHERE status = 'running'`;
  await sql`CREATE INDEX IF NOT EXISTS idx_yt_videos_is_shorts ON yt_videos (is_shorts)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_yt_videos_performance ON yt_videos (performance_rate DESC NULLS LAST)`;
}
```

- [ ] **Step 3: 마이그레이션 실행 확인**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero-dashboard
node -e "
const { createDb } = require('./packages/youtube-scout/dist/db/queries.js');
(async () => {
  const db = createDb(process.env.DATABASE_URL);
  await db.migrate();
  console.log('Migrate OK');
  await db.sql.end();
})().catch(e => { console.error(e); process.exit(1); });
" 2>&1 || pnpm --filter @howzero/youtube-scout build && \
node -e "
const { createDb } = require('./packages/youtube-scout/dist/db/queries.js');
(async () => {
  const db = createDb(process.env.DATABASE_URL);
  await db.migrate();
  console.log('Migrate OK');
  await db.sql.end();
})().catch(e => { console.error(e); process.exit(1); });
"
```

또는 더 단순하게 psql로 직접 컬럼 존재 확인:
```bash
psql "$DATABASE_URL" -c "\d yt_videos" | grep -E "is_shorts|performance_rate|grade_performance"
psql "$DATABASE_URL" -c "\d yt_scan_runs"
```
Expected: 새 컬럼 + yt_scan_runs 테이블 존재

- [ ] **Step 4: Commit**

```bash
git add packages/youtube-scout/src/db/queries.ts
git commit -m "feat(youtube-scout): add viewtrap-style metrics columns + scan-runs table"
```

---

### Task 3: `gradePerformance` 함수 (TDD)

**Files:**
- Create: `packages/youtube-scout/src/lib/__tests__/scoring.test.ts`
- Modify: `packages/youtube-scout/src/lib/scoring.ts`
- Modify: `packages/youtube-scout/src/lib/types.ts`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// packages/youtube-scout/src/lib/__tests__/scoring.test.ts
import { describe, it, expect } from "vitest";
import { gradePerformance } from "../scoring.js";

describe("gradePerformance", () => {
  it.each([
    [10.0, "Legendary"],
    [9.99,  "Viral"],
    [5.0,  "Viral"],
    [4.99, "Great"],
    [2.0,  "Great"],
    [1.99, "Good"],
    [1.0,  "Good"],
    [0.99, "Normal"],
    [0,    "Normal"],
  ])("rate=%s → %s", (rate, expected) => {
    expect(gradePerformance(rate)).toBe(expected);
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero-dashboard
pnpm --filter @howzero/youtube-scout vitest run src/lib/__tests__/scoring.test.ts
```
Expected: FAIL — `gradePerformance is not exported`

- [ ] **Step 3: 타입 정의 추가**

`packages/youtube-scout/src/lib/types.ts`에 추가:

```typescript
export type GradePerformance = "Legendary" | "Viral" | "Great" | "Good" | "Normal";
export type CollectedVia = "mostPopular" | "search" | "rss" | "stats";

// 기존 YTVideo interface 안에 추가:
//   isShorts: boolean;
//   performanceRate: number | null;
//   contributionRate: number | null;
//   gradePerformance: GradePerformance | null;
//   collectedVia: CollectedVia;

// 기존 YTChannel interface 안에 추가:
//   avgViewCount: number | null;
//   totalViewCount: number | null;
//   totalVideoCount: number | null;
//   lastUploadAt: Date | null;
//   activeRate: number | null;
```

- [ ] **Step 4: `gradePerformance` 구현**

`packages/youtube-scout/src/lib/scoring.ts` 끝에 추가:

```typescript
import type { GradePerformance } from "./types.js";

export function gradePerformance(rate: number): GradePerformance {
  if (rate >= 10) return "Legendary";
  if (rate >= 5)  return "Viral";
  if (rate >= 2)  return "Great";
  if (rate >= 1)  return "Good";
  return "Normal";
}
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
pnpm --filter @howzero/youtube-scout vitest run src/lib/__tests__/scoring.test.ts
```
Expected: PASS (9 tests)

- [ ] **Step 6: Commit**

```bash
git add packages/youtube-scout/src/lib/scoring.ts packages/youtube-scout/src/lib/types.ts packages/youtube-scout/src/lib/__tests__/scoring.test.ts
git commit -m "feat(youtube-scout): gradePerformance + GradePerformance/CollectedVia types"
```

---

### Task 4: `fetchMostPopularByCategory` + `fetchChannelsBatch` (TDD)

**Files:**
- Create: `packages/youtube-scout/src/lib/__tests__/youtube-api.test.ts`
- Modify: `packages/youtube-scout/src/lib/youtube-api.ts`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// packages/youtube-scout/src/lib/__tests__/youtube-api.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchMostPopularByCategory, fetchChannelsBatch } from "../youtube-api.js";

describe("fetchMostPopularByCategory", () => {
  beforeEach(() => { vi.spyOn(global, "fetch"); });
  afterEach(() => { vi.restoreAllMocks(); });

  it("hits videos.list with chart=mostPopular and categoryId", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [
        { id: "vid1", snippet: { title: "T1", channelId: "ch1", channelTitle: "CH1", publishedAt: "2026-04-01T00:00:00Z", thumbnails: { default: { url: "x" } } },
          statistics: { viewCount: "1000", likeCount: "10", commentCount: "5" },
          contentDetails: { duration: "PT2M30S" } },
      ], nextPageToken: undefined }),
    });
    const out = await fetchMostPopularByCategory("KEY", "22", { regionCode: "KR", maxResults: 50 });
    expect(out).toHaveLength(1);
    expect(out[0].videoId).toBe("vid1");
    expect(out[0].durationSeconds).toBe(150);
    expect(out[0].categoryId).toBe("22");
    const url = (fetch as any).mock.calls[0][0];
    expect(url).toContain("chart=mostPopular");
    expect(url).toContain("videoCategoryId=22");
    expect(url).toContain("regionCode=KR");
  });

  it("paginates until maxResults", async () => {
    (fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: Array.from({ length: 50 }, (_, i) => ({
        id: `v${i}`, snippet: { title: `T${i}`, channelId: "c", channelTitle: "C", publishedAt: "2026-04-01T00:00:00Z", thumbnails: {} },
        statistics: { viewCount: "1" }, contentDetails: { duration: "PT1M" }
      })), nextPageToken: "p2" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: Array.from({ length: 50 }, (_, i) => ({
        id: `v${i+50}`, snippet: { title: `T${i+50}`, channelId: "c", channelTitle: "C", publishedAt: "2026-04-01T00:00:00Z", thumbnails: {} },
        statistics: { viewCount: "1" }, contentDetails: { duration: "PT1M" }
      })) }) });
    const out = await fetchMostPopularByCategory("KEY", "22", { regionCode: "KR", maxResults: 100 });
    expect(out).toHaveLength(100);
  });
});

describe("fetchChannelsBatch", () => {
  beforeEach(() => { vi.spyOn(global, "fetch"); });
  afterEach(() => { vi.restoreAllMocks(); });

  it("batches up to 50 channel IDs per call", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [
        { id: "ch1", snippet: { title: "Ch1", thumbnails: { default: { url: "x" } } },
          statistics: { subscriberCount: "1200", videoCount: "50", viewCount: "500000" } },
      ] }),
    });
    const out = await fetchChannelsBatch("KEY", ["ch1"]);
    expect(out).toHaveLength(1);
    expect(out[0].channelId).toBe("ch1");
    expect(out[0].subscriberCount).toBe(1200);
    expect(out[0].totalVideoCount).toBe(50);
    expect(out[0].totalViewCount).toBe(500000);
  });

  it("splits 75 channel IDs into 2 calls (50 + 25)", async () => {
    const ids = Array.from({ length: 75 }, (_, i) => `ch${i}`);
    (fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: ids.slice(0, 50).map(id => ({ id, snippet: {}, statistics: { subscriberCount: "0", videoCount: "0", viewCount: "0" } })) }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: ids.slice(50).map(id => ({ id, snippet: {}, statistics: { subscriberCount: "0", videoCount: "0", viewCount: "0" } })) }) });
    const out = await fetchChannelsBatch("KEY", ids);
    expect(out).toHaveLength(75);
    expect((fetch as any).mock.calls.length).toBe(2);
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
pnpm --filter @howzero/youtube-scout vitest run src/lib/__tests__/youtube-api.test.ts
```
Expected: FAIL — `fetchMostPopularByCategory is not exported`

- [ ] **Step 3: `fetchMostPopularByCategory` 구현**

`packages/youtube-scout/src/lib/youtube-api.ts` 끝에 추가:

```typescript
export interface MostPopularItem {
  videoId: string;
  channelId: string;
  channelTitle: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  categoryId: string;
  viewCount: number;
  likeCount: number | null;
  commentCount: number | null;
}

export async function fetchMostPopularByCategory(
  apiKey: string,
  categoryId: string,
  opts: { regionCode?: string; maxResults?: number } = {}
): Promise<MostPopularItem[]> {
  const { regionCode = "KR", maxResults = 50 } = opts;
  const out: MostPopularItem[] = [];
  let pageToken: string | undefined;
  while (out.length < maxResults) {
    const perPage = Math.min(50, maxResults - out.length);
    const url = `${YT_API}/videos?part=snippet,statistics,contentDetails`
      + `&chart=mostPopular&regionCode=${encodeURIComponent(regionCode)}`
      + `&videoCategoryId=${encodeURIComponent(categoryId)}`
      + `&maxResults=${perPage}&key=${encodeURIComponent(apiKey)}`
      + (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`mostPopular ${categoryId} failed: ${res.status} ${await res.text()}`);
    const data: any = await res.json();
    for (const it of data?.items ?? []) {
      out.push({
        videoId: String(it.id),
        channelId: String(it?.snippet?.channelId ?? ""),
        channelTitle: String(it?.snippet?.channelTitle ?? ""),
        title: String(it?.snippet?.title ?? ""),
        publishedAt: String(it?.snippet?.publishedAt ?? ""),
        thumbnailUrl: bestThumbnail(it?.snippet?.thumbnails),
        durationSeconds: parseIso8601Duration(String(it?.contentDetails?.duration ?? "")),
        categoryId,
        viewCount: Number(it?.statistics?.viewCount ?? 0),
        likeCount: it?.statistics?.likeCount != null ? Number(it.statistics.likeCount) : null,
        commentCount: it?.statistics?.commentCount != null ? Number(it.statistics.commentCount) : null,
      });
    }
    pageToken = data?.nextPageToken;
    if (!pageToken) break;
  }
  return out.slice(0, maxResults);
}

export interface ChannelStatsItem {
  channelId: string;
  title: string | null;
  thumbnailUrl: string | null;
  subscriberCount: number | null;
  totalVideoCount: number | null;
  totalViewCount: number | null;
}

export async function fetchChannelsBatch(
  apiKey: string,
  channelIds: string[]
): Promise<ChannelStatsItem[]> {
  const out: ChannelStatsItem[] = [];
  for (let i = 0; i < channelIds.length; i += 50) {
    const batch = channelIds.slice(i, i + 50);
    const url = `${YT_API}/channels?part=snippet,statistics`
      + `&id=${batch.map(encodeURIComponent).join(",")}`
      + `&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`channels.list failed: ${res.status} ${await res.text()}`);
    const data: any = await res.json();
    for (const it of data?.items ?? []) {
      const hidden = !!it?.statistics?.hiddenSubscriberCount;
      out.push({
        channelId: String(it.id),
        title: it?.snippet?.title ? String(it.snippet.title) : null,
        thumbnailUrl: bestThumbnail(it?.snippet?.thumbnails),
        subscriberCount: hidden ? null : (it?.statistics?.subscriberCount != null ? Number(it.statistics.subscriberCount) : null),
        totalVideoCount: it?.statistics?.videoCount != null ? Number(it.statistics.videoCount) : null,
        totalViewCount: it?.statistics?.viewCount != null ? Number(it.statistics.viewCount) : null,
      });
    }
  }
  return out;
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
pnpm --filter @howzero/youtube-scout vitest run src/lib/__tests__/youtube-api.test.ts
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/youtube-scout/src/lib/youtube-api.ts packages/youtube-scout/src/lib/__tests__/youtube-api.test.ts
git commit -m "feat(youtube-scout): fetchMostPopularByCategory + fetchChannelsBatch"
```

---

### Task 5: queries.ts upsert 확장 + scan-runs 잠금

**Files:**
- Modify: `packages/youtube-scout/src/db/queries.ts`

- [ ] **Step 1: 기존 upsertVideo / upsertChannel 위치 + 시그니처 확인**

```bash
grep -n "upsertVideo\|upsertChannel\|insertVideo\|insertChannel" packages/youtube-scout/src/db/queries.ts | head -10
```

- [ ] **Step 2: `upsertVideo` 시그니처 확장 (신규 컬럼 추가)**

기존 `upsertVideo(...)` 함수의 INSERT INTO yt_videos 절에:
- 컬럼 리스트에 `is_shorts, performance_rate, contribution_rate, grade_performance, collected_via` 추가
- VALUES에 `${v.isShorts ?? false}, ${v.performanceRate ?? null}, ${v.contributionRate ?? null}, ${v.gradePerformance ?? null}, ${v.collectedVia ?? 'search'}`
- ON CONFLICT (video_id) DO UPDATE SET 절에도 동일 컬럼 갱신 추가

- [ ] **Step 3: `upsertChannel` 함수 확장 (없으면 신설)**

```typescript
async upsertChannel(c: {
  channelId: string;
  name?: string | null;
  category?: string | null;
  subscriberCount?: number | null;
  thumbnailUrl?: string | null;
  totalVideoCount?: number | null;
  totalViewCount?: number | null;
  avgViewCount?: number | null;
  lastUploadAt?: Date | null;
  activeRate?: number | null;
  source?: "search_seed" | "related" | "manual" | "mostPopular";
}) {
  return sql`
    INSERT INTO yt_channels
      (channel_id, name, category, subscriber_count, thumbnail_url,
       video_count, total_view_count, avg_view_count, last_upload_at, active_rate, total_video_count, source)
    VALUES (${c.channelId}, ${c.name ?? null}, ${c.category ?? null}, ${c.subscriberCount ?? null}, ${c.thumbnailUrl ?? null},
            ${c.totalVideoCount ?? null}, ${c.totalViewCount ?? null}, ${c.avgViewCount ?? null}, ${c.lastUploadAt ?? null}, ${c.activeRate ?? null}, ${c.totalVideoCount ?? null}, ${c.source ?? 'mostPopular'})
    ON CONFLICT (channel_id) DO UPDATE SET
      name              = COALESCE(EXCLUDED.name, yt_channels.name),
      category          = COALESCE(EXCLUDED.category, yt_channels.category),
      subscriber_count  = COALESCE(EXCLUDED.subscriber_count, yt_channels.subscriber_count),
      thumbnail_url     = COALESCE(EXCLUDED.thumbnail_url, yt_channels.thumbnail_url),
      total_view_count  = COALESCE(EXCLUDED.total_view_count, yt_channels.total_view_count),
      total_video_count = COALESCE(EXCLUDED.total_video_count, yt_channels.total_video_count),
      avg_view_count    = COALESCE(EXCLUDED.avg_view_count, yt_channels.avg_view_count),
      last_upload_at    = COALESCE(EXCLUDED.last_upload_at, yt_channels.last_upload_at),
      active_rate       = COALESCE(EXCLUDED.active_rate, yt_channels.active_rate),
      updated_at        = now()
  `;
}
```

- [ ] **Step 4: `scan-runs` 잠금 함수 추가**

`createDb` 반환 객체에 추가:

```typescript
async acquireScanLock(jobName: string): Promise<{ runId: string } | null> {
  // 동시 running 있으면 null
  const [running] = await sql`
    SELECT id FROM yt_scan_runs WHERE job_name = ${jobName} AND status = 'running' LIMIT 1
  `;
  if (running) return null;
  const [row] = await sql`
    INSERT INTO yt_scan_runs (job_name, status) VALUES (${jobName}, 'running') RETURNING id
  `;
  return { runId: String(row.id) };
},

async finishScanRun(runId: string, opts: { status: 'completed' | 'failed'; videos?: number; channels?: number; error?: string | null }) {
  await sql`
    UPDATE yt_scan_runs
    SET status = ${opts.status},
        finished_at = now(),
        videos_collected = ${opts.videos ?? 0},
        channels_updated = ${opts.channels ?? 0},
        error_message = ${opts.error ?? null}
    WHERE id = ${runId}
  `;
},
```

- [ ] **Step 5: 빠른 잠금 동작 검증 (수동)**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero-dashboard
pnpm --filter @howzero/youtube-scout build
node -e "
const { createDb } = require('./packages/youtube-scout/dist/db/queries.js');
(async () => {
  const db = createDb(process.env.DATABASE_URL);
  await db.migrate();
  const a = await db.acquireScanLock('test-lock');
  console.log('A:', a);  // { runId: '...' }
  const b = await db.acquireScanLock('test-lock');
  console.log('B:', b);  // null (이미 running)
  await db.finishScanRun(a.runId, { status: 'completed' });
  const c = await db.acquireScanLock('test-lock');
  console.log('C:', c);  // 새 runId
  await db.finishScanRun(c.runId, { status: 'completed' });
  await db.sql.end();
})().catch(e => { console.error(e); process.exit(1); });
"
```
Expected: A=runId, B=null, C=새 runId

- [ ] **Step 6: Commit**

```bash
git add packages/youtube-scout/src/db/queries.ts
git commit -m "feat(youtube-scout): upsert with new metrics + scan-runs lock"
```

---

### Task 6: `daily-deep-scan` 잡 + 통합 테스트 (TDD)

**Files:**
- Create: `packages/youtube-scout/src/jobs/daily-deep-scan.ts`
- Create: `packages/youtube-scout/src/jobs/__tests__/daily-deep-scan.test.ts`
- Modify: `packages/youtube-scout/src/index.ts`

- [ ] **Step 1: 실패 통합 테스트 작성**

```typescript
// packages/youtube-scout/src/jobs/__tests__/daily-deep-scan.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runDeepScan } from "../daily-deep-scan.js";

const mockDb = () => {
  const videos: any[] = [];
  const channels: any[] = [];
  const runs: any[] = [];
  let runIdCounter = 0;
  return {
    videos, channels, runs,
    async migrate() {},
    async acquireScanLock(jobName: string) {
      const running = runs.find((r) => r.job_name === jobName && r.status === "running");
      if (running) return null;
      const id = `run-${++runIdCounter}`;
      runs.push({ id, job_name: jobName, status: "running" });
      return { runId: id };
    },
    async finishScanRun(runId: string, opts: any) {
      const r = runs.find((x) => x.id === runId);
      if (r) Object.assign(r, { status: opts.status, videos_collected: opts.videos, channels_updated: opts.channels });
    },
    async upsertVideo(v: any) { videos.push(v); },
    async upsertChannel(c: any) {
      const i = channels.findIndex((x) => x.channelId === c.channelId);
      if (i >= 0) channels[i] = { ...channels[i], ...c };
      else channels.push(c);
    },
    async getKnownChannelIds(): Promise<string[]> { return channels.map((c) => c.channelId); },
    sql: { end: async () => {} },
  };
};

describe("runDeepScan", () => {
  beforeEach(() => { vi.spyOn(global, "fetch"); });
  afterEach(() => { vi.restoreAllMocks(); });

  it("aborts when lock cannot be acquired", async () => {
    const db = mockDb();
    db.runs.push({ id: "x", job_name: "daily-deep-scan", status: "running" });
    const res = await runDeepScan(db as any, "KEY", { categoryIds: ["22"], maxPerCategory: 50 });
    expect(res.skipped).toBe(true);
    expect(db.videos).toHaveLength(0);
  });

  it("collects videos from multiple categories and computes performance", async () => {
    const db = mockDb();
    (fetch as any).mockImplementation(async (url: string) => {
      if (url.includes("/videos")) {
        const cat = new URL(url).searchParams.get("videoCategoryId");
        return {
          ok: true,
          json: async () => ({ items: [{
            id: `v-${cat}`, snippet: { title: `T${cat}`, channelId: "ch1", channelTitle: "Ch1", publishedAt: "2026-04-20T00:00:00Z", thumbnails: {} },
            statistics: { viewCount: "10000", likeCount: "100", commentCount: "20" },
            contentDetails: { duration: "PT3M" },
          }] }),
        };
      }
      if (url.includes("/channels")) {
        return {
          ok: true,
          json: async () => ({ items: [{
            id: "ch1", snippet: { title: "Ch1", thumbnails: {} },
            statistics: { subscriberCount: "1000", videoCount: "100", viewCount: "200000" },
          }] }),
        };
      }
      return { ok: false, json: async () => ({}) };
    });

    const res = await runDeepScan(db as any, "KEY", { categoryIds: ["22", "26"], maxPerCategory: 50 });
    expect(res.skipped).toBeFalsy();
    expect(db.videos).toHaveLength(2);
    expect(db.channels).toHaveLength(1);
    // avgView = 200000 / 100 = 2000; performance = 10000 / 2000 = 5 → "Viral"
    expect(db.videos[0].performanceRate).toBeCloseTo(5);
    expect(db.videos[0].gradePerformance).toBe("Viral");
    // collected_via
    expect(db.videos[0].collectedVia).toBe("mostPopular");
    // duration 180s → not shorts
    expect(db.videos[0].isShorts).toBe(false);
    // run completed
    expect(db.runs[0].status).toBe("completed");
  });

  it("flags videos < 60s as shorts", async () => {
    const db = mockDb();
    (fetch as any).mockImplementation(async (url: string) => {
      if (url.includes("/videos")) return { ok: true, json: async () => ({ items: [{
        id: "vshort", snippet: { title: "S", channelId: "ch1", channelTitle: "C", publishedAt: "2026-04-20T00:00:00Z", thumbnails: {} },
        statistics: { viewCount: "100" }, contentDetails: { duration: "PT45S" }
      }] }) };
      if (url.includes("/channels")) return { ok: true, json: async () => ({ items: [
        { id: "ch1", snippet: {}, statistics: { subscriberCount: "10", videoCount: "10", viewCount: "1000" } }
      ] }) };
      return { ok: false, json: async () => ({}) };
    });
    await runDeepScan(db as any, "KEY", { categoryIds: ["22"], maxPerCategory: 50 });
    expect(db.videos[0].isShorts).toBe(true);
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
pnpm --filter @howzero/youtube-scout vitest run src/jobs/__tests__/daily-deep-scan.test.ts
```
Expected: FAIL — `runDeepScan is not exported`

- [ ] **Step 3: `daily-deep-scan.ts` 구현**

```typescript
// packages/youtube-scout/src/jobs/daily-deep-scan.ts
import { fetchMostPopularByCategory, fetchChannelsBatch } from "../lib/youtube-api.js";
import { computeScores, gradePerformance } from "../lib/scoring.js";

// YouTube 카테고리 ID (KR 활성)
export const KR_CATEGORY_IDS = ["1","2","10","15","17","19","20","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44"];

export interface DeepScanOptions {
  categoryIds?: string[];
  maxPerCategory?: number;
  regionCode?: string;
  logger?: { info(...args: any[]): void; warn(...args: any[]): void; error(...args: any[]): void };
}

export interface DeepScanResult {
  skipped?: boolean;
  reason?: string;
  videosCollected?: number;
  channelsUpdated?: number;
  runId?: string;
}

export async function runDeepScan(db: any, apiKey: string, opts: DeepScanOptions = {}): Promise<DeepScanResult> {
  const { categoryIds = KR_CATEGORY_IDS, maxPerCategory = 200, regionCode = "KR" } = opts;
  const log = opts.logger ?? { info: console.log, warn: console.warn, error: console.error };

  await db.migrate();

  const lock = await db.acquireScanLock("daily-deep-scan");
  if (!lock) {
    log.warn("daily-deep-scan: another run is already in progress, skipping");
    return { skipped: true, reason: "already_running" };
  }

  try {
    const allItems: any[] = [];
    const channelIds = new Set<string>();
    for (const catId of categoryIds) {
      try {
        const items = await fetchMostPopularByCategory(apiKey, catId, { regionCode, maxResults: maxPerCategory });
        allItems.push(...items);
        for (const v of items) if (v.channelId) channelIds.add(v.channelId);
        log.info(`category ${catId}: ${items.length} items`);
      } catch (e: any) {
        log.warn(`category ${catId} failed: ${e?.message?.slice(0, 200)}`);
      }
    }

    const channels = channelIds.size > 0 ? await fetchChannelsBatch(apiKey, [...channelIds]) : [];
    const channelById = new Map(channels.map((c) => [c.channelId, c]));

    let videosCollected = 0;
    for (const v of allItems) {
      const ch = channelById.get(v.channelId);
      const avgView = ch && ch.totalViewCount && ch.totalVideoCount
        ? ch.totalViewCount / Math.max(1, ch.totalVideoCount)
        : null;
      const performanceRate = avgView ? v.viewCount / avgView : null;
      const contributionRate = ch?.totalViewCount ? (v.viewCount / ch.totalViewCount) * 100 : null;
      const grade = performanceRate != null ? gradePerformance(performanceRate) : null;
      const isShorts = v.durationSeconds != null && v.durationSeconds < 60;

      const scores = computeScores(v.viewCount, ch?.subscriberCount ?? null, v.likeCount, v.commentCount);

      await db.upsertVideo({
        videoId: v.videoId, channelId: v.channelId, title: v.title, channelTitle: v.channelTitle,
        publishedAt: new Date(v.publishedAt), thumbnailUrl: v.thumbnailUrl,
        durationSeconds: v.durationSeconds, categoryId: v.categoryId,
        viewCount: v.viewCount, likeCount: v.likeCount, commentCount: v.commentCount,
        subscriberCountAtCollect: ch?.subscriberCount ?? null,
        scoreViewSub: scores.scoreViewSub, scoreViewLike: scores.scoreViewLike, scoreViewComment: scores.scoreViewComment,
        gradeViewSub: scores.gradeViewSub, gradeViewLike: scores.gradeViewLike, gradeViewComment: scores.gradeViewComment,
        isShorts, performanceRate, contributionRate, gradePerformance: grade,
        collectedVia: "mostPopular",
      });
      videosCollected++;
    }

    let channelsUpdated = 0;
    for (const c of channels) {
      const avgView = c.totalViewCount && c.totalVideoCount ? c.totalViewCount / Math.max(1, c.totalVideoCount) : null;
      await db.upsertChannel({
        channelId: c.channelId, name: c.title, thumbnailUrl: c.thumbnailUrl,
        subscriberCount: c.subscriberCount, totalVideoCount: c.totalVideoCount,
        totalViewCount: c.totalViewCount, avgViewCount: avgView,
        source: "mostPopular",
      });
      channelsUpdated++;
    }

    await db.finishScanRun(lock.runId, { status: "completed", videos: videosCollected, channels: channelsUpdated });
    log.info(`daily-deep-scan: completed (videos=${videosCollected}, channels=${channelsUpdated})`);
    return { runId: lock.runId, videosCollected, channelsUpdated };
  } catch (e: any) {
    await db.finishScanRun(lock.runId, { status: "failed", error: e?.message?.slice(0, 1000) });
    throw e;
  }
}
```

- [ ] **Step 4: index.ts에서 export**

`packages/youtube-scout/src/index.ts`에 추가:
```typescript
export { runDeepScan, KR_CATEGORY_IDS } from "./jobs/daily-deep-scan.js";
```

- [ ] **Step 5: 테스트 통과**

```bash
pnpm --filter @howzero/youtube-scout vitest run src/jobs/__tests__/daily-deep-scan.test.ts
```
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add packages/youtube-scout/src/jobs/daily-deep-scan.ts packages/youtube-scout/src/jobs/__tests__/daily-deep-scan.test.ts packages/youtube-scout/src/index.ts
git commit -m "feat(youtube-scout): runDeepScan job (mostPopular by category + perf metrics)"
```

---

### Task 7: CLI `run-deep-scan.ts` + package script

**Files:**
- Create: `packages/youtube-scout/src/cli/run-deep-scan.ts`
- Modify: `packages/youtube-scout/package.json`

- [ ] **Step 1: CLI 작성**

```typescript
// packages/youtube-scout/src/cli/run-deep-scan.ts
import { createDb } from "../db/queries.js";
import { runDeepScan } from "../jobs/daily-deep-scan.js";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const apiKey = process.env.YOUTUBE_API_KEY;
const dbUrl = process.env.DATABASE_URL;
if (!apiKey) { console.error("YOUTUBE_API_KEY 필요"); process.exit(1); }
if (!dbUrl)  { console.error("DATABASE_URL 필요"); process.exit(1); }

const db = createDb(dbUrl);

if (dryRun) {
  console.log("DRY-RUN: API 호출 없이 흐름만 출력");
  console.log("- 30 KR 카테고리 mostPopular fetch (각 200개)");
  console.log("- channels.list 배치");
  console.log("- upsert + 점수 계산");
  process.exit(0);
}

console.log("YouTube Scout deep-scan 시작...");
const res = await runDeepScan(db, apiKey, { logger: { info: console.log, warn: console.warn, error: console.error } });
console.log("\n결과:", JSON.stringify(res, null, 2));
await db.sql.end();
```

- [ ] **Step 2: package.json에 script 추가**

`packages/youtube-scout/package.json`:
```json
"scripts": {
  ...,
  "daily-scan": "tsx src/cli/run-deep-scan.ts"
}
```

- [ ] **Step 3: --dry-run 검증**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero-dashboard
pnpm --filter @howzero/youtube-scout daily-scan --dry-run
```
Expected: 흐름 텍스트 출력, exit 0

- [ ] **Step 4: 실 호출 — 1 카테고리만 (smoke test)**

CLI에 `--category` 옵션 추가하지 않고, 작은 변경 — 상단에:
```typescript
const onlyCat = args.find((a) => a.startsWith("--category="))?.split("=")[1];
const opts = onlyCat ? { categoryIds: [onlyCat], maxPerCategory: 50 } : {};
const res = await runDeepScan(db, apiKey, { ...opts, logger: { info: console.log, warn: console.warn, error: console.error } });
```

```bash
export YOUTUBE_API_KEY="AIzaSyCmPd7ntVdx6BbWGq0y2qyixybGFp6fxR8"
export DATABASE_URL="postgres://howzero:howzero@127.0.0.1:54329/howzero"
pnpm --filter @howzero/youtube-scout daily-scan --category=22
```
Expected: `category 22: 50 items`, `completed (videos=50, channels=N)`

- [ ] **Step 5: Commit**

```bash
git add packages/youtube-scout/src/cli/run-deep-scan.ts packages/youtube-scout/package.json
git commit -m "feat(youtube-scout): cli run-deep-scan with --dry-run + --category"
```

---

### Task 8: server route 새 필터 (TDD)

**Files:**
- Create: `server/src/__tests__/youtube-scout-route-filters.test.ts`
- Modify: `server/src/routes/youtube-scout.ts`

- [ ] **Step 1: 실패 테스트 작성 (supertest)**

기존 `server/src/__tests__/companies-route-path-guard.test.ts` 패턴으로 createTestApp 사용. 없으면 inline express app + youtubeScoutRoutes만 mount.

```typescript
// server/src/__tests__/youtube-scout-route-filters.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import request from "supertest";
import { youtubeScoutRoutes } from "../routes/youtube-scout.js";
import postgres from "postgres";

const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || "postgres://howzero:howzero@127.0.0.1:54329/howzero";

describe("youtube-scout route filters", () => {
  const app = express();
  app.use("/api", youtubeScoutRoutes(dbUrl));
  const sql = postgres(dbUrl);

  beforeAll(async () => {
    await sql`INSERT INTO yt_videos (video_id, channel_id, title, channel_title, published_at, view_count, is_shorts, performance_rate, grade_performance, collected_via, duration_seconds)
              VALUES ('test-long-1', 'ch-test', 'Long', 'C', now(), 1000, false, 5.0, 'Viral', 'mostPopular', 180),
                     ('test-short-1', 'ch-test', 'Short', 'C', now(), 500, true, 1.0, 'Good', 'mostPopular', 30)
              ON CONFLICT (video_id) DO NOTHING`;
  });
  afterAll(async () => {
    await sql`DELETE FROM yt_videos WHERE video_id IN ('test-long-1', 'test-short-1')`;
    await sql.end();
  });

  it("filters out shorts when isShorts=false", async () => {
    const res = await request(app).get("/api/youtube-scout/videos?period=30d&isShorts=false&limit=200");
    const ids = res.body.data.map((v: any) => v.video_id);
    expect(ids).toContain("test-long-1");
    expect(ids).not.toContain("test-short-1");
  });

  it("returns only shorts when isShorts=true", async () => {
    const res = await request(app).get("/api/youtube-scout/videos?period=30d&isShorts=true&limit=200");
    const ids = res.body.data.map((v: any) => v.video_id);
    expect(ids).toContain("test-short-1");
    expect(ids).not.toContain("test-long-1");
  });

  it("sorts by performance_rate desc", async () => {
    const res = await request(app).get("/api/youtube-scout/videos?period=30d&sortBy=performance_rate&order=desc&limit=10");
    const rates = res.body.data
      .filter((v: any) => v.performance_rate != null)
      .map((v: any) => Number(v.performance_rate));
    for (let i = 1; i < rates.length; i++) expect(rates[i - 1]).toBeGreaterThanOrEqual(rates[i]);
  });

  it("filters by gradePerformance=Viral", async () => {
    const res = await request(app).get("/api/youtube-scout/videos?period=30d&gradePerformance=Viral&limit=200");
    expect(res.body.data.every((v: any) => v.grade_performance === "Viral")).toBe(true);
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
pnpm --filter @howzero/server vitest run src/__tests__/youtube-scout-route-filters.test.ts
```
Expected: FAIL (모든 테스트 — 새 필터 미구현)

- [ ] **Step 3: route handler 확장**

`server/src/routes/youtube-scout.ts`의 `/youtube-scout/videos` 핸들러:

`allowedSort` 배열에 `performance_rate` 추가:
```typescript
const allowedSort = ["score_view_sub","score_view_like","score_view_comment","view_count","published_at","subscriber_count_at_collect","performance_rate"];
```

쿼리 파라미터 destructure에 추가:
```typescript
const { period = "7d", minViews = "0", maxViews, minSubscribers = "0", maxSubscribers,
  category, sortBy = "score_view_sub", order = "desc", page = "1", limit = "50",
  gradeViewSub, gradePerformance, isShorts } = req.query as Record<string, string | undefined>;
```

`conditions` 배열에 추가:
```typescript
if (gradePerformance) conditions.push(`v.grade_performance = '${gradePerformance.replace(/'/g, "''")}'`);
if (isShorts === "true") conditions.push(`v.is_shorts = true`);
else if (isShorts === "false") conditions.push(`v.is_shorts = false`);
```

SELECT 절에 신규 컬럼 추가 (UI에 노출):
```sql
SELECT v.*, c.name as channel_name, c.subscriber_count, c.category as channel_category, c.thumbnail_url as channel_thumbnail,
       c.avg_view_count, c.total_view_count, c.total_video_count
FROM yt_videos v ...
```

- [ ] **Step 4: 테스트 통과**

```bash
pnpm --filter @howzero/server vitest run src/__tests__/youtube-scout-route-filters.test.ts
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/youtube-scout.ts server/src/__tests__/youtube-scout-route-filters.test.ts
git commit -m "feat(server): youtube-scout filters (isShorts, gradePerformance, sortBy=performance_rate)"
```

---

### Task 9: server cron 등록 (in-process)

**Files:**
- Modify: `server/src/index.ts` (또는 `server/src/app.ts` startup hook)

- [ ] **Step 1: Cron 등록 코드 추가**

`server/src/index.ts`의 `app.listen` 직전 또는 createApp 후:

```typescript
import cron from "node-cron";
import { runDeepScan } from "@howzero/youtube-scout";
import { createDb as createScoutDb } from "@howzero/youtube-scout/dist/db/queries.js";

// ... 기존 코드 ...

if (process.env.YOUTUBE_API_KEY && activeDatabaseConnectionString) {
  const scoutDb = createScoutDb(activeDatabaseConnectionString);
  cron.schedule("0 3 * * *", async () => {
    try {
      logger.info("youtube-scout: starting daily-deep-scan (cron)");
      const res = await runDeepScan(scoutDb, process.env.YOUTUBE_API_KEY!, { logger });
      logger.info({ res }, "youtube-scout: daily-deep-scan finished");
    } catch (e) {
      logger.error({ err: e }, "youtube-scout: daily-deep-scan failed");
    }
  }, { timezone: "Asia/Seoul" });
  logger.info("youtube-scout: cron registered (03:00 KST daily)");
} else {
  logger.warn("youtube-scout: YOUTUBE_API_KEY not set or DB unavailable, cron NOT registered");
}
```

- [ ] **Step 2: package.json import path 확인**

`packages/youtube-scout/package.json`의 `exports`에 `"./db/queries"` 가 있는지 확인. 없으면:
```json
"exports": {
  ".": "./src/index.ts",
  "./db/queries": "./src/db/queries.ts",
  "./*": "./src/*.ts"
}
```

- [ ] **Step 3: server 재시작 + cron 등록 로그 확인**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero-dashboard
lsof -ti :3100 | xargs kill -9 2>/dev/null
export YOUTUBE_API_KEY="AIzaSyCmPd7ntVdx6BbWGq0y2qyixybGFp6fxR8"
pnpm howzero-cli run 2>&1 | head -30 | grep -E "cron|Server listening"
```
Expected: `youtube-scout: cron registered (03:00 KST daily)` + `Server listening on 127.0.0.1:3100`

- [ ] **Step 4: Commit**

```bash
git add server/src/index.ts packages/youtube-scout/package.json
git commit -m "feat(server): register node-cron 03:00 KST daily-deep-scan"
```

---

### Task 10: UI — 필터 + 컬럼 + 카테고리 dropdown

**Files:**
- Modify: `ui/src/api/youtube-scout.ts`
- Modify: `ui/src/pages/YouTubeScout.tsx`

- [ ] **Step 1: API client 타입 확장**

`ui/src/api/youtube-scout.ts`:

```typescript
export interface YTVideoFilters {
  period?: "1d" | "7d" | "30d" | "all";
  minViews?: number; maxViews?: number;
  minSubscribers?: number; maxSubscribers?: number;
  category?: string;
  sortBy?: "score_view_sub" | "score_view_like" | "score_view_comment" | "view_count" | "published_at" | "performance_rate";
  order?: "asc" | "desc";
  page?: number; limit?: number;
  gradeViewSub?: string;
  gradePerformance?: "Legendary" | "Viral" | "Great" | "Good" | "Normal";
  isShorts?: boolean;  // undefined = 전체, true = shorts만, false = 롱폼만
}

// YTVideoRow에 추가:
//   is_shorts?: boolean;
//   performance_rate?: number | null;
//   contribution_rate?: number | null;
//   grade_performance?: "Legendary" | "Viral" | "Great" | "Good" | "Normal" | null;
//   avg_view_count?: number | null;
```

- [ ] **Step 2: YouTubeScout.tsx 필터 state 확장**

`ui/src/pages/YouTubeScout.tsx`의 `useState<YTVideoFilters>` 초기값:

```typescript
const [filters, setFilters] = useState<YTVideoFilters>({
  period: "30d",
  isShorts: false,           // 기본 롱폼만
  sortBy: "performance_rate", // 기본 정렬
  order: "desc",
  limit: 50,
});
```

- [ ] **Step 3: 형식 토글 UI 추가**

필터 영역에 (기존 period select 옆):
```tsx
<select
  value={filters.isShorts === undefined ? "all" : filters.isShorts ? "shorts" : "long"}
  onChange={(e) => updateFilter("isShorts", e.target.value === "all" ? undefined : e.target.value === "shorts")}
  className="..."
>
  <option value="long">롱폼 (60s+)</option>
  <option value="shorts">Shorts (&lt;60s)</option>
  <option value="all">전체</option>
</select>
```

- [ ] **Step 4: 정렬 옵션 추가 + 평균 대비 컬럼**

테이블 컬럼 정의에 `평균 대비` 추가 (performance_rate ×100% + grade label):

```tsx
<th onClick={() => toggleSort("performance_rate")}>
  평균 대비{renderArrow("performance_rate")}
</th>
// row:
<td>
  {row.performance_rate != null
    ? `+${Math.round((row.performance_rate - 1) * 100)}%`
    : "—"}
  {row.grade_performance && (
    <span className="ml-1 text-xs opacity-70">{row.grade_performance}</span>
  )}
</td>
```

Shorts 표시 (제목 옆):
```tsx
<span className="ml-2 text-xs opacity-60">{row.is_shorts ? "🩳" : "📺"}</span>
```

- [ ] **Step 5: 카테고리 dropdown autopopulated**

기존 카테고리 select가 `/api/youtube-scout/categories` API 호출. 확인 — 만약 hardcoded면 다음과 같이 변경:

```tsx
const { data: categoryList = [] } = useQuery({
  queryKey: ["youtube-scout-categories"],
  queryFn: () => youtubeScoutApi.listCategories(),
});

<select value={filters.category ?? ""} onChange={(e) => updateFilter("category", e.target.value || undefined)}>
  <option value="">카테고리 전체</option>
  {categoryList.map((c) => <option key={c} value={c}>{c}</option>)}
</select>
```

- [ ] **Step 6: 빌드 + 시각 확인**

```bash
pnpm --filter @howzero/ui build 2>&1 | tail -3
lsof -ti :3100 | xargs kill -9 2>/dev/null
sleep 2
pnpm howzero-cli run &
sleep 5
open "http://localhost:3100/HOWA/youtube-scout"
```
Expected: 페이지 로드 → 형식 토글 (롱폼 default) + 평균 대비 컬럼 + Shorts 아이콘 보임

- [ ] **Step 7: 단위 테스트 (vitest + react-testing-library)**

```typescript
// ui/src/pages/__tests__/YouTubeScout-filters.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { YouTubeScout } from "../YouTubeScout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

function wrap(node: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("YouTubeScout filters", () => {
  it("renders 형식 토글 with 롱폼 default", () => {
    render(wrap(<YouTubeScout />));
    const sel = screen.getByDisplayValue(/롱폼/) as HTMLSelectElement;
    expect(sel.value).toBe("long");
  });

  it("default sort is performance_rate", () => {
    render(wrap(<YouTubeScout />));
    expect(screen.getByText(/평균 대비/)).toBeInTheDocument();
  });
});
```

```bash
pnpm --filter @howzero/ui vitest run src/pages/__tests__/YouTubeScout-filters.test.tsx
```
Expected: PASS (2 tests)

- [ ] **Step 8: Commit**

```bash
git add ui/src/api/youtube-scout.ts ui/src/pages/YouTubeScout.tsx ui/src/pages/__tests__/YouTubeScout-filters.test.tsx
git commit -m "feat(ui): youtube-scout 형식 토글 + 평균 대비 컬럼 + performance_rate 정렬"
```

---

### Task 11: 전체 검증 + PR

**Files:** —

- [ ] **Step 1: 전체 테스트 회귀**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero-dashboard
pnpm --filter @howzero/youtube-scout vitest run 2>&1 | tail -5
pnpm --filter @howzero/server vitest run 2>&1 | tail -5
pnpm --filter @howzero/ui vitest run 2>&1 | tail -5
pnpm typecheck 2>&1 | tail -5
```
Expected: 모두 PASS, typecheck 0 errors

- [ ] **Step 2: 실 API 1회 deep-scan 실행 + UI 확인**

```bash
export YOUTUBE_API_KEY="AIzaSyCmPd7ntVdx6BbWGq0y2qyixybGFp6fxR8"
export DATABASE_URL="postgres://howzero:howzero@127.0.0.1:54329/howzero"
pnpm --filter @howzero/youtube-scout daily-scan 2>&1 | tail -10
# UI 새로고침
open "http://localhost:3100/HOWA/youtube-scout"
```
Expected:
- CLI: `completed (videos=N, channels=M)` (N >= 1000 예상)
- UI: 30일 + 롱폼 + performance_rate desc → 새 영상 다수 + 평균 대비 컬럼에 % 표시

- [ ] **Step 3: GitHub 계정 스위치 + push**

```bash
REPO_OWNER=$(git remote -v | grep origin | head -1 | sed -E 's/.*github\.com[\/:]([^\/]+)\/.*/\1/')
ACTIVE=$(gh auth status 2>&1 | grep -B1 "Active account: true" | head -1 | awk '{print $NF}')
[ "$REPO_OWNER" != "$ACTIVE" ] && gh auth switch -u "$REPO_OWNER"
git push -u origin feat/youtube-scout-deep-collection
```

- [ ] **Step 4: PR 생성**

```bash
gh pr create --base main --title "feat: youtube-scout deep collection (mostPopular + performance_rate)" --body "$(cat <<'EOF'
## Summary
- 일일 03:00 KST node-cron으로 30 카테고리 mostPopular 깊게 수집
- 새 메트릭: `performance_rate` (채널 평균 대비), `contribution_rate`, `grade_performance`
- Shorts/롱폼 자동 분류 (`duration_seconds < 60`), UI 기본 "롱폼만"
- 기존 keyword/RSS/stats 잡 유지 (병행)
- 신규 CLI: `pnpm --filter @howzero/youtube-scout daily-scan [--dry-run] [--category=N]`

## DB Changes
- `yt_videos` +6 columns (is_shorts, performance_rate, contribution_rate, grade_performance, collected_via, category_id 활용)
- `yt_channels` +5 columns (avg_view_count, total_view_count, total_video_count, last_upload_at, active_rate)
- New `yt_scan_runs` table (잠금 + 이력)

## Test plan
- [x] vitest unit tests (scoring, youtube-api, daily-deep-scan, route filters, UI filters)
- [x] CLI `--dry-run` + 1 카테고리 실 호출 검증
- [x] UI: 형식 토글, 평균 대비 컬럼, performance_rate 정렬
- [x] cron 등록 로그 확인 (03:00 KST)
- [x] Quota: deep-scan 1회 ~125 units (1.3% of 10,000)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: PR URL 반환 + 검증**

```bash
gh pr view --json url --jq .url
```

---

## Self-Review Checklist (작성자 자체 점검)

**1. Spec coverage:**
- ✅ §3 데이터 모델 → Task 2 (DDL)
- ✅ §3.4 마이그레이션 → Task 2 Step 2
- ✅ §4 daily-deep-scan 흐름 → Task 6
- ✅ §4.2 grade 함수 → Task 3
- ✅ §4.3 quota 추정 → Task 11 검증 단계
- ✅ §5 UI 필터/컬럼 → Task 10
- ✅ §6 cron 등록 → Task 9
- ✅ §6.4 수동 CLI → Task 7

**2. Type consistency:**
- `gradePerformance(rate: number): GradePerformance` — Task 3, 6, 10 동일 ✓
- `runDeepScan(db, apiKey, opts): DeepScanResult` — Task 6, 7, 9 동일 ✓
- `acquireScanLock(jobName)` / `finishScanRun(runId, opts)` — Task 5, 6 동일 ✓
- `isShorts` query param — Task 8 (server), Task 10 (UI) 동일 ✓

**3. Placeholder scan:**
- 모든 step에 실제 코드 ✓
- "TBD" 없음 ✓
- Task 5 Step 1, Task 8 Step 3에 grep으로 정확한 export 명 확인 명시됨 ✓

**4. Risks / 미리 대응:**
- ⚠ `db.migrate()`가 실제 어떻게 동작하는지 코드 확인 필요 (Task 2 Step 1) — 안 되면 ALTER TABLE 직접 실행
- ⚠ Task 9의 `@howzero/youtube-scout/dist/db/queries.js` import는 build 후만 동작 — dev mode에서는 src 직접 import 또는 export 명시
- ⚠ supertest가 server package 의존성에 있는지 확인. 없으면 add `pnpm --filter @howzero/server add -D supertest @types/supertest`

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-24-youtube-scout-deep-collection.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — 각 task마다 fresh subagent dispatch + 두 단계 review (TDD 단계별 검증). Task 사이에 사용자 확인 가능.

**2. Inline Execution** — 현재 세션에서 task 순서대로 실행. 빠르지만 컨텍스트 누적.

**예상 시간:** Task 1-4 약 1시간, Task 5-7 약 1시간, Task 8-10 약 1시간, Task 11 검증 + PR 약 30분 = **총 약 3.5시간**

**작업 위치:** `/Users/zerowater/Dropbox/zerowater/howzero-dashboard` (이 repo로 cd 후 시작).

**어느 방식?**
