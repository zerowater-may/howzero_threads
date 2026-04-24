# YouTube Scout Deep Collection Design

> 일일 1회 모든 카테고리에서 인기 롱폼 영상 깊게 수집 + 채널 기대치 대비 폭발 정도(performance_rate) 시그널 추가. zipsaja 마케팅용 viral 영상 reference 자동화.

**Date:** 2026-04-24
**Status:** Approved (brainstorming) → ready for plan
**Working dir:** `/Users/zerowater/Dropbox/zerowater/howzero-dashboard`
**Package:** `@howzero/youtube-scout`

---

## 1. Goal

기존 youtube-scout (keyword search 기반)에 **viewtrap 스타일 깊은 수집 + 채널 기대치 대비 폭발 시그널**을 하이브리드로 추가:

- 일일 1회 30개 카테고리 mostPopular 200개씩 (~6,000 영상 후보) 수집
- Shorts/롱폼 자동 분류 (`duration_seconds < 60`), UI 기본 "롱폼만"
- 채널 평균 조회수 대비 영상 폭발 정도 (`performance_rate`) 계산
- 기존 키워드/RSS 잡 유지 (zipsaja 부동산 등 정밀 타겟용)

---

## 2. Architecture

### 2.1 데이터 소스 (병행)

| 잡 | 트리거 | 목적 | API 사용 |
|---|---|---|---|
| **`daily-deep-scan`** (신규) | cron 매일 03:00 KST | 광범위 트렌드 (30 카테고리) | videos.list(mostPopular) + videos.list(stats) + channels.list |
| `scan:seed` (기존) | 수동 / 별도 cron | 정밀 keyword (zipsaja 부동산 등) | search.list (비쌈) |
| `scan:rss` (기존) | 수동 | 알려진 채널 신영상 | RSS (free) |
| `scan:stats` (기존) | 수동 | 기존 영상 stats 갱신 | videos.list |

### 2.2 시그널 (점수)

기존 + 신규 둘 다 계산 (호환):
- 기존: `score_view_sub`, `score_view_like`, `score_view_comment`, 등급 3종
- 신규: `performance_rate = viewCount / channel.avg_view_count`, `contribution_rate = viewCount / channel.total_view_count × 100`, `grade_performance` (Legendary/Viral/Great/Good/Normal)

### 2.3 Shorts 분류

수집은 Shorts/롱폼 둘 다. `is_shorts boolean` 자동 (`duration_seconds < 60`). UI 기본 "롱폼만" 토글.

### 2.4 Cron / 운영

- **node-cron** in-process (server에서 schedule 등록, 별도 프로세스 X)
- **잠금**: `yt_scan_runs` 테이블에 running flag로 중복 실행 방지
- 수동 호출: `pnpm --filter @howzero/youtube-scout daily-scan [--dry-run]`

---

## 3. Data Model

### 3.1 `yt_videos` 신규 컬럼

| Column | Type | 의미 | 기본값 |
|---|---|---|---|
| `is_shorts` | boolean NOT NULL | duration_seconds < 60 | false |
| `category_id` (이미 존재) | text | mostPopular 응답에서 자동 채움 | NULL |
| `performance_rate` | numeric | viewCount / channel.avg_view_count | NULL |
| `contribution_rate` | numeric | viewCount / channel.total_view_count × 100 | NULL |
| `grade_performance` | text | Legendary / Viral / Great / Good / Normal | NULL |
| `collected_via` | text | "mostPopular" / "search" / "rss" / "stats" | "search" (기존) |

### 3.2 `yt_channels` 신규 컬럼

| Column | Type | 의미 |
|---|---|---|
| `avg_view_count` | numeric | totalViewCount / videoCount (추정 평균) |
| `total_view_count` | bigint | channels.list 응답 |
| `total_video_count` | bigint | channels.list 응답 |
| `last_upload_at` | timestamptz | 최근 영상 publishedAt |
| `active_rate` | numeric | 최근 30일 신규 영상 수 / 30 |

### 3.3 `yt_scan_runs` 신규 테이블 (잠금 + 이력)

```sql
CREATE TABLE yt_scan_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,           -- "daily-deep-scan"
  status text NOT NULL,             -- "running" / "completed" / "failed"
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  videos_collected int DEFAULT 0,
  channels_updated int DEFAULT 0,
  error_message text
);
CREATE INDEX idx_yt_scan_runs_running ON yt_scan_runs (job_name) WHERE status = 'running';
```

### 3.4 마이그레이션

- 새 drizzle migration 1개 (`add_viewtrap_metrics`)
- 기존 60영상은 새 컬럼 NULL — 다음 daily-scan 때 자연스럽게 채워짐
- backfill 스크립트는 별도 옵션 (필요 시): `pnpm --filter @howzero/youtube-scout backfill-metrics`

---

## 4. Collection Job: `daily-deep-scan`

### 4.1 흐름

```
1. yt_scan_runs INSERT (status='running')
   - 동일 job 'running' 이미 있으면 abort (잠금)

2. 30 YouTube 카테고리 순회 (KR region)
   for categoryId in [1,2,10,15,17,19,20,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44]:
     videos.list(chart=mostPopular, regionCode=KR, categoryId, maxResults=50)
     pageToken으로 4 페이지 (200개 max)

3. 각 영상에 대해:
   - duration parse → is_shorts = duration < 60
   - upsert into yt_videos (collected_via='mostPopular')

4. 신규 채널 발견 시:
   channels.list(part=statistics,snippet) — 50개씩 배치
   upsert into yt_channels (subscriber, totalView, totalVideoCount)
   avg_view_count = totalViewCount / totalVideoCount

5. 파생 점수 계산:
   for each video:
     channel = lookup(video.channelId)
     performance_rate = video.viewCount / channel.avg_view_count
     contribution_rate = video.viewCount / channel.totalView × 100
     grade_performance = grade(performance_rate)

6. 채널 active_rate 갱신:
   active_rate = (최근 30일 신규 영상 수 / 30) — 영상 publishedAt 기반

7. yt_scan_runs UPDATE (status='completed', counts)
```

### 4.2 등급 함수 (`grade_performance`)

```typescript
function gradePerformance(rate: number): "Legendary" | "Viral" | "Great" | "Good" | "Normal" {
  if (rate >= 10) return "Legendary";   // 채널 평균 10배 이상
  if (rate >= 5)  return "Viral";       // 5배
  if (rate >= 2)  return "Great";       // 2배
  if (rate >= 1)  return "Good";        // 평균 이상
  return "Normal";                       // 평균 미만
}
```

### 4.3 Quota 추정

| 작업 | 호출 수 | Unit | 합계 |
|---|---|---|---|
| videos.list(mostPopular) 30 카테고리 × 4 page | 120 | 1 | 120 |
| channels.list (신규 채널 일평균 ~100) × 1 page | 2 | 1 | 2 |
| videos.list(stats) — mostPopular에 이미 포함 | 0 | — | 0 |
| **합계 (deep-scan 1회)** | | | **~125 units** |
| 별도 scan:seed (선택) — 키워드 5개 | 5 | 100 | 500 |
| **일일 합계 (deep + seed)** | | | **~625 units (6.3%)** |

→ Google 무료 일일 quota 10,000 units 대비 매우 안전. 매일 수동 추가 호출 여유.

---

## 5. UI

### 5.1 페이지 (변경)

`/HOWA/youtube-scout` (기존 라우트 유지) — 회사 무관 글로벌 데이터.

### 5.2 필터 (확장)

| 필터 | 옵션 | 기본값 |
|---|---|---|
| **형식** (신규) | 롱폼 / Shorts / 전체 | 롱폼 |
| 기간 | 1일 / 7일 / 30일 / 전체 | 30일 |
| 카테고리 | 전체 / 30 카테고리 (autopopulated) | 전체 |
| 구독자 | 0+ / 1만+ / 10만+ / 100만+ | 1만+ |
| **정렬** | score_view_sub / **performance_rate** (신규) / publishedAt | performance_rate |

### 5.3 테이블 컬럼

기존 + 신규:

| 컬럼 | 신규? |
|---|---|
| #, 채널, 제목, 구독자, 조회수, 좋아요, 댓글 | 기존 |
| 조회/구독 (등급) | 기존 |
| **평균 대비** ("+700%") | 🆕 |
| **채널 기여** ("12.4%") | 🆕 |
| **🩳/📺** 아이콘 | 🆕 |
| 게시일 | 기존 |

### 5.4 사이드바 badge (선택)

`yt_scan_runs.status='running'` 일 때 사이드바 YouTube Scout 항목에 ● 인디케이터.

---

## 6. Cron / 자동화

### 6.1 node-cron 등록 위치

`server/src/index.ts` startup 시점에:
```typescript
import cron from "node-cron";
import { runDeepScan } from "@howzero/youtube-scout";

cron.schedule("0 3 * * *", () => {  // 매일 03:00 KST
  runDeepScan(db, { logger });
}, { timezone: "Asia/Seoul" });
```

### 6.2 환경변수 의존

- `YOUTUBE_API_KEY` (필수, 없으면 cron skip + warn log)
- `DATABASE_URL` (이미 server에서 set)

### 6.3 잠금

`yt_scan_runs WHERE status='running' AND job_name='daily-deep-scan'` 존재 시 abort.

### 6.4 수동 호출 CLI

```bash
pnpm --filter @howzero/youtube-scout daily-scan         # 즉시
pnpm --filter @howzero/youtube-scout daily-scan --dry-run  # API 호출 X, 흐름만 출력
```

---

## 7. Out of Scope

- ❌ AI 자동 콘텐츠 추천 (별도 plan)
- ❌ Instagram/TikTok 통합 수집 (현재는 YouTube only)
- ❌ 비디오 다운로드 / transcript (yt_highlights 별도 스크립트로)
- ❌ 회사별 데이터 격리 (모든 회사 공유)
- ❌ Shorts 별도 페이지 — 토글로 처리

---

## 8. Tech Stack

- TypeScript (ESM)
- node-cron (^3) — Cron scheduling
- postgres.js — DB (이미 사용)
- drizzle-orm — schema/migration (이미 사용)
- vitest — 테스트 (이미 사용)
- YouTube Data API v3 (videos.list, channels.list)

---

## 9. 성공 기준

- ✅ daily-deep-scan 잡이 매일 03:00 자동 실행
- ✅ 일일 ~3,000~6,000 신규/갱신 영상 수집
- ✅ 채널 avg_view_count + performance_rate 정확히 계산 + grades 부여
- ✅ UI 기본 view: 롱폼만, performance_rate desc — viral 영상 즉시 보임
- ✅ Quota 일일 < 1,000 units (10% 미만)
- ✅ 기존 60영상도 새 메트릭 채워짐 (다음 scan 때 자동)
- ✅ Shorts 토글로 한 클릭 전환

---

## 10. Risks

| Risk | 완화 |
|---|---|
| YouTube API quota 초과 | 일일 추정 < 1,000 / 10,000 (10%). seed 추가 호출도 여유. |
| mostPopular 카테고리별 응답 0개 가능 | for-loop continue + log. abort X. |
| 채널 channels.list 통계가 hidden (구독자 비공개) | NULL 허용, performance_rate 기본 X (또는 viewCount fallback). |
| node-cron이 server crash 시 missed | 다음날 03:00에 자동 재시도. 큰 문제 X. |
| 신규 컬럼 NULL 호환 | UI에서 NULL 처리 (placeholder "—") |
| `.env` 안 키 만료 | 이미 발생 — 갱신 절차 README에 명시 |
