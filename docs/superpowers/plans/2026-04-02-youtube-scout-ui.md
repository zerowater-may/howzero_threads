# YouTube Scout 대시보드 UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** howzero-dashboard(Paperclip 포크)의 사이드바에 YouTube Scout 메뉴를 추가하고, 바이럴 영상을 엑셀 스타일 그리드 테이블로 보여주는 페이지 구축

**Architecture:** 서버에 `/api/youtube-scout/videos` + `/api/youtube-scout/stats` API 라우트 추가. UI에 `YouTubeScout` 페이지 + 사이드바 메뉴 추가. 기존 `@howzero/youtube-scout` 패키지의 `createDb` + `queries`를 서버에서 직접 사용. UI는 `@tanstack/react-query` + 기존 테이블 컴포넌트 패턴 활용.

**Tech Stack:** Express (server routes), React + Vite (UI), @tanstack/react-query, lucide-react icons

**Working directory:** `/tmp/howzero-dashboard/`

---

### Task 1: 서버 API 라우트 — youtube-scout

**Files:**
- Create: `server/src/routes/youtube-scout.ts`
- Modify: `server/src/routes/index.ts` (export 추가)
- Modify: `server/src/app.ts` (라우트 마운트)

- [ ] **Step 1: server/src/routes/youtube-scout.ts 생성**

```typescript
import { Router } from "express";
import postgres from "postgres";

export function youtubeScoutRoutes() {
  const router = Router();

  function getDb() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");
    return postgres(dbUrl);
  }

  router.get("/api/youtube-scout/videos", async (req, res) => {
    const sql = getDb();
    try {
      const {
        period = "7d",
        minViews = "0",
        maxViews,
        minSubscribers = "0",
        maxSubscribers,
        category,
        sortBy = "score_view_sub",
        order = "desc",
        page = "1",
        limit = "50",
        gradeViewSub,
      } = req.query as Record<string, string | undefined>;

      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(200, Math.max(1, Number(limit)));
      const offset = (pageNum - 1) * limitNum;

      const allowedSort = ["score_view_sub", "score_view_like", "score_view_comment", "view_count", "published_at", "subscriber_count_at_collect"];
      const sortCol = allowedSort.includes(sortBy!) ? sortBy! : "score_view_sub";
      const sortDir = order === "asc" ? "ASC" : "DESC";

      let periodFilter = "";
      if (period === "1d") periodFilter = "AND v.published_at >= NOW() - INTERVAL '1 day'";
      else if (period === "7d") periodFilter = "AND v.published_at >= NOW() - INTERVAL '7 days'";
      else if (period === "30d") periodFilter = "AND v.published_at >= NOW() - INTERVAL '30 days'";

      const conditions: string[] = [];
      if (Number(minViews) > 0) conditions.push(`v.view_count >= ${Number(minViews)}`);
      if (maxViews) conditions.push(`v.view_count <= ${Number(maxViews)}`);
      if (Number(minSubscribers) > 0) conditions.push(`v.subscriber_count_at_collect >= ${Number(minSubscribers)}`);
      if (maxSubscribers) conditions.push(`v.subscriber_count_at_collect <= ${Number(maxSubscribers)}`);
      if (category) conditions.push(`c.category = '${category.replace(/'/g, "''")}'`);
      if (gradeViewSub) conditions.push(`v.grade_view_sub = '${gradeViewSub.replace(/'/g, "''")}'`);

      const whereExtra = conditions.length > 0 ? "AND " + conditions.join(" AND ") : "";

      const countResult = await sql.unsafe(
        `SELECT COUNT(*) as total FROM yt_videos v LEFT JOIN yt_channels c ON v.channel_id = c.channel_id WHERE 1=1 ${periodFilter} ${whereExtra}`
      );
      const total = Number(countResult[0]?.total ?? 0);

      const rows = await sql.unsafe(
        `SELECT v.*, c.name as channel_name, c.subscriber_count, c.category as channel_category, c.thumbnail_url as channel_thumbnail
         FROM yt_videos v
         LEFT JOIN yt_channels c ON v.channel_id = c.channel_id
         WHERE 1=1 ${periodFilter} ${whereExtra}
         ORDER BY ${sortCol} ${sortDir} NULLS LAST
         LIMIT ${limitNum} OFFSET ${offset}`
      );

      res.json({ data: rows, total, page: pageNum, limit: limitNum });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    } finally {
      // sql will be garbage collected
    }
  });

  router.get("/api/youtube-scout/stats", async (_req, res) => {
    const sql = getDb();
    try {
      const [channels] = await sql`SELECT COUNT(*) as count FROM yt_channels`;
      const [videos] = await sql`SELECT COUNT(*) as count FROM yt_videos`;
      const [lastScan] = await sql`SELECT MAX(collected_at) as last_scan FROM yt_videos`;
      const [categories] = await sql`SELECT COUNT(DISTINCT category) as count FROM yt_channels WHERE category IS NOT NULL`;
      res.json({
        totalChannels: Number(channels.count),
        totalVideos: Number(videos.count),
        totalCategories: Number(categories.count),
        lastScanAt: lastScan.last_scan,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/api/youtube-scout/categories", async (_req, res) => {
    const sql = getDb();
    try {
      const rows = await sql`SELECT DISTINCT category FROM yt_channels WHERE category IS NOT NULL ORDER BY category`;
      res.json(rows.map((r: any) => r.category));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}
```

- [ ] **Step 2: server/src/routes/index.ts에 export 추가**

파일 맨 끝에 추가:
```typescript
export { youtubeScoutRoutes } from "./youtube-scout.js";
```

- [ ] **Step 3: server/src/app.ts에 라우트 마운트**

import 추가:
```typescript
import { youtubeScoutRoutes } from "./routes/youtube-scout.js";
```

`api.use(sidebarBadgeRoutes(db));` 라인 바로 아래에 추가:
```typescript
  api.use(youtubeScoutRoutes());
```

- [ ] **Step 4: 커밋**

```bash
cd /tmp/howzero-dashboard && git add server/src/routes/youtube-scout.ts server/src/routes/index.ts server/src/app.ts
git commit -m "feat: YouTube Scout API 라우트 (/api/youtube-scout/videos, stats, categories)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: UI API 클라이언트

**Files:**
- Create: `ui/src/api/youtube-scout.ts`

- [ ] **Step 1: ui/src/api/youtube-scout.ts 생성**

```typescript
import { api } from "./client";

export interface YTVideoRow {
  id: number;
  video_id: string;
  channel_id: string;
  title: string;
  channel_title: string;
  channel_name: string;
  published_at: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  view_count: number;
  like_count: number | null;
  comment_count: number | null;
  subscriber_count: number | null;
  subscriber_count_at_collect: number | null;
  channel_category: string | null;
  channel_thumbnail: string | null;
  score_view_sub: number | null;
  score_view_like: number | null;
  score_view_comment: number | null;
  grade_view_sub: string | null;
  grade_view_like: string | null;
  grade_view_comment: string | null;
  collected_at: string;
}

export interface YTVideoListResponse {
  data: YTVideoRow[];
  total: number;
  page: number;
  limit: number;
}

export interface YTScoutStats {
  totalChannels: number;
  totalVideos: number;
  totalCategories: number;
  lastScanAt: string | null;
}

export interface YTVideoFilters {
  period?: string;
  minViews?: number;
  maxViews?: number;
  minSubscribers?: number;
  maxSubscribers?: number;
  category?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  limit?: number;
  gradeViewSub?: string;
}

export const youtubeScoutApi = {
  listVideos: (filters: YTVideoFilters = {}): Promise<YTVideoListResponse> => {
    const params = new URLSearchParams();
    if (filters.period) params.set("period", filters.period);
    if (filters.minViews) params.set("minViews", String(filters.minViews));
    if (filters.maxViews) params.set("maxViews", String(filters.maxViews));
    if (filters.minSubscribers) params.set("minSubscribers", String(filters.minSubscribers));
    if (filters.maxSubscribers) params.set("maxSubscribers", String(filters.maxSubscribers));
    if (filters.category) params.set("category", filters.category);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.order) params.set("order", filters.order);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.gradeViewSub) params.set("gradeViewSub", filters.gradeViewSub);
    const qs = params.toString();
    return api.get(`/youtube-scout/videos${qs ? `?${qs}` : ""}`);
  },

  getStats: (): Promise<YTScoutStats> => api.get("/youtube-scout/stats"),

  getCategories: (): Promise<string[]> => api.get("/youtube-scout/categories"),
};
```

- [ ] **Step 2: 커밋**

```bash
cd /tmp/howzero-dashboard && git add ui/src/api/youtube-scout.ts
git commit -m "feat: YouTube Scout UI API 클라이언트

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: YouTube Scout 페이지 컴포넌트

**Files:**
- Create: `ui/src/pages/YouTubeScout.tsx`

- [ ] **Step 1: ui/src/pages/YouTubeScout.tsx 생성**

```tsx
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { youtubeScoutApi, type YTVideoFilters, type YTVideoRow } from "../api/youtube-scout";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { Youtube, TrendingUp, Users, Eye, ThumbsUp, MessageSquare, ExternalLink } from "lucide-react";

const GRADE_COLORS: Record<string, string> = {
  Legendary: "text-yellow-500 font-bold",
  Viral: "text-red-500 font-semibold",
  Great: "text-orange-500 font-semibold",
  Good: "text-green-500",
  AboveAvg: "text-blue-500",
  Normal: "text-muted-foreground",
  Exceptional: "text-yellow-500 font-bold",
  High: "text-orange-500 font-semibold",
  Hot: "text-red-500 font-bold",
  Active: "text-orange-500",
  Quiet: "text-muted-foreground",
  Silent: "text-muted-foreground/50",
  Low: "text-muted-foreground/50",
};

const GRADE_STARS: Record<string, string> = {
  Legendary: "★★★★★",
  Viral: "★★★★☆",
  Great: "★★★☆☆",
  Good: "★★☆☆☆",
  AboveAvg: "★☆☆☆☆",
  Normal: "☆☆☆☆☆",
};

const SUB_RANGES = [
  { label: "전체", min: 0, max: undefined },
  { label: "마이크로 (0~1K)", min: 0, max: 1000 },
  { label: "소형 (1K~5K)", min: 1000, max: 5000 },
  { label: "중소형 (5K~1만)", min: 5000, max: 10000 },
  { label: "중형 (1만~5만)", min: 10000, max: 50000 },
  { label: "중대형 (5만~10만)", min: 50000, max: 100000 },
  { label: "대형 (10만~50만)", min: 100000, max: 500000 },
  { label: "메가 (50만+)", min: 500000, max: undefined },
];

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "-";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function YouTubeScout() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const [filters, setFilters] = useState<YTVideoFilters>({
    period: "7d",
    sortBy: "score_view_sub",
    order: "desc",
    page: 1,
    limit: 50,
    minViews: 10000,
  });

  useEffect(() => {
    setBreadcrumbs([{ label: "YouTube Scout" }]);
  }, [setBreadcrumbs]);

  const { data: statsData } = useQuery({
    queryKey: ["youtube-scout-stats"],
    queryFn: () => youtubeScoutApi.getStats(),
  });

  const { data: categories } = useQuery({
    queryKey: ["youtube-scout-categories"],
    queryFn: () => youtubeScoutApi.getCategories(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["youtube-scout-videos", filters],
    queryFn: () => youtubeScoutApi.listVideos(filters),
  });

  const videos = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / (filters.limit ?? 50));

  function updateFilter(key: keyof YTVideoFilters, value: any) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  function toggleSort(col: string) {
    setFilters((prev) => ({
      ...prev,
      sortBy: col,
      order: prev.sortBy === col && prev.order === "desc" ? "asc" : "desc",
    }));
  }

  function SortHeader({ col, children }: { col: string; children: React.ReactNode }) {
    const active = filters.sortBy === col;
    const arrow = active ? (filters.order === "desc" ? " ▼" : " ▲") : "";
    return (
      <th
        className="px-3 py-2 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap select-none"
        onClick={() => toggleSort(col)}
      >
        {children}{arrow}
      </th>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          <h1 className="text-lg font-semibold">YouTube Scout</h1>
          <span className="text-xs text-muted-foreground">바이럴 영상 파인더</span>
        </div>
        {statsData && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>채널 {statsData.totalChannels.toLocaleString()}개</span>
            <span>영상 {statsData.totalVideos.toLocaleString()}개</span>
            {statsData.lastScanAt && (
              <span>마지막 수집: {new Date(statsData.lastScanAt).toLocaleString("ko-KR")}</span>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select
          className="rounded border border-border bg-background px-2 py-1.5 text-xs"
          value={filters.period}
          onChange={(e) => updateFilter("period", e.target.value)}
        >
          <option value="1d">오늘</option>
          <option value="7d">7일</option>
          <option value="30d">30일</option>
          <option value="all">전체</option>
        </select>

        <select
          className="rounded border border-border bg-background px-2 py-1.5 text-xs"
          value={`${filters.minSubscribers ?? 0}-${filters.maxSubscribers ?? ""}`}
          onChange={(e) => {
            const range = SUB_RANGES.find(
              (r) => `${r.min}-${r.max ?? ""}` === e.target.value
            );
            if (range) {
              setFilters((prev) => ({
                ...prev,
                minSubscribers: range.min || undefined,
                maxSubscribers: range.max,
                page: 1,
              }));
            }
          }}
        >
          {SUB_RANGES.map((r) => (
            <option key={r.label} value={`${r.min}-${r.max ?? ""}`}>
              {r.label}
            </option>
          ))}
        </select>

        <select
          className="rounded border border-border bg-background px-2 py-1.5 text-xs"
          value={filters.category ?? ""}
          onChange={(e) => updateFilter("category", e.target.value || undefined)}
        >
          <option value="">카테고리 전체</option>
          {(categories ?? []).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          className="rounded border border-border bg-background px-2 py-1.5 text-xs"
          value={filters.minViews ?? 0}
          onChange={(e) => updateFilter("minViews", Number(e.target.value) || undefined)}
        >
          <option value="0">최소 조회수</option>
          <option value="10000">1만+</option>
          <option value="50000">5만+</option>
          <option value="100000">10만+</option>
          <option value="500000">50만+</option>
        </select>

        <span className="text-xs text-muted-foreground ml-auto">
          {total.toLocaleString()}건
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-8">#</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground min-w-[120px]">채널</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground min-w-[250px]">제목</th>
              <SortHeader col="subscriber_count_at_collect">구독자</SortHeader>
              <SortHeader col="view_count">조회수</SortHeader>
              <SortHeader col="score_view_sub">조회/구독</SortHeader>
              <SortHeader col="score_view_like">좋아요</SortHeader>
              <SortHeader col="score_view_comment">댓글</SortHeader>
              <SortHeader col="published_at">게시일</SortHeader>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">로딩 중...</td></tr>
            ) : videos.length === 0 ? (
              <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">데이터 없음. 스캔을 먼저 실행하세요.</td></tr>
            ) : videos.map((v, i) => (
              <tr key={v.video_id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {((filters.page ?? 1) - 1) * (filters.limit ?? 50) + i + 1}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {v.channel_thumbnail && (
                      <img src={v.channel_thumbnail} className="w-6 h-6 rounded-full" alt="" />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate max-w-[120px]">{v.channel_name || v.channel_title}</div>
                      <div className="text-[10px] text-muted-foreground">{formatNumber(v.subscriber_count)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <a
                    href={`https://www.youtube.com/watch?v=${v.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1 hover:text-foreground"
                  >
                    <span className="text-xs truncate max-w-[280px]">{v.title}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 shrink-0" />
                  </a>
                </td>
                <td className="px-3 py-2 text-xs text-right">{formatNumber(v.subscriber_count_at_collect)}</td>
                <td className="px-3 py-2 text-xs text-right font-medium">{formatNumber(v.view_count)}</td>
                <td className="px-3 py-2">
                  <div className="text-right">
                    <span className={`text-xs ${GRADE_COLORS[v.grade_view_sub ?? ""] ?? ""}`}>
                      {v.score_view_sub != null ? `${v.score_view_sub.toFixed(1)}x` : "-"}
                    </span>
                    <div className={`text-[10px] ${GRADE_COLORS[v.grade_view_sub ?? ""] ?? "text-muted-foreground"}`}>
                      {GRADE_STARS[v.grade_view_sub ?? ""] ?? ""} {v.grade_view_sub ?? ""}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="text-right">
                    <span className="text-xs">{v.score_view_like != null ? `1:${Math.round(v.score_view_like)}` : "-"}</span>
                    <div className={`text-[10px] ${GRADE_COLORS[v.grade_view_like ?? ""] ?? "text-muted-foreground"}`}>
                      {v.grade_view_like ?? ""}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="text-right">
                    <span className="text-xs">{v.score_view_comment != null ? `1:${Math.round(v.score_view_comment)}` : "-"}</span>
                    <div className={`text-[10px] ${GRADE_COLORS[v.grade_view_comment ?? ""] ?? "text-muted-foreground"}`}>
                      {v.grade_view_comment ?? ""}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(v.published_at).toLocaleDateString("ko-KR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <button
            className="px-3 py-1 rounded border border-border text-xs hover:bg-accent disabled:opacity-30"
            disabled={filters.page === 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
          >
            ← 이전
          </button>
          <span className="text-xs text-muted-foreground">
            {filters.page} / {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded border border-border text-xs hover:bg-accent disabled:opacity-30"
            disabled={(filters.page ?? 1) >= totalPages}
            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
          >
            다음 →
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
cd /tmp/howzero-dashboard && git add ui/src/pages/YouTubeScout.tsx
git commit -m "feat: YouTube Scout 페이지 (엑셀 스타일 그리드 테이블 + 필터 + 페이지네이션)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: 사이드바 메뉴 + 라우트 등록

**Files:**
- Modify: `ui/src/components/Sidebar.tsx` (YouTube Scout 메뉴 추가)
- Modify: `ui/src/App.tsx` (라우트 추가)

- [ ] **Step 1: Sidebar.tsx에 YouTube Scout 메뉴 추가**

`import` 섹션에 추가:
```typescript
import { Youtube } from "lucide-react";
```

(이미 있는 lucide-react import 라인에 `Youtube`를 추가)

사이드바의 `<SidebarSection label={t("nav.company")}>` 바로 위에 추가:
```tsx
        <SidebarSection label="Tools">
          <SidebarNavItem to="/youtube-scout" label="YouTube Scout" icon={Youtube} />
        </SidebarSection>
```

- [ ] **Step 2: App.tsx에 라우트 추가**

import 섹션에 추가:
```typescript
import { YouTubeScout } from "./pages/YouTubeScout";
```

`boardRoutes()` 함수 내, `<Route path="activity" element={<Activity />} />` 라인 아래에 추가:
```tsx
      <Route path="youtube-scout" element={<YouTubeScout />} />
```

- [ ] **Step 3: 커밋**

```bash
cd /tmp/howzero-dashboard && git add ui/src/components/Sidebar.tsx ui/src/App.tsx
git commit -m "feat: 사이드바에 YouTube Scout 메뉴 + 라우트 등록

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: 서버에 postgres 의존성 추가 + 푸시

**Files:**
- Modify: `server/package.json` (postgres 의존성 추가)

- [ ] **Step 1: server/package.json에 postgres 추가**

```bash
cd /tmp/howzero-dashboard && pnpm --filter @howzero/server add postgres
```

- [ ] **Step 2: pnpm install**

```bash
cd /tmp/howzero-dashboard && pnpm install
```

- [ ] **Step 3: 최종 커밋 + 푸시**

```bash
cd /tmp/howzero-dashboard && git add -A
git commit -m "feat: YouTube Scout 대시보드 UI 완성 — 사이드바 메뉴 + 그리드 테이블 + API

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push origin main
```
