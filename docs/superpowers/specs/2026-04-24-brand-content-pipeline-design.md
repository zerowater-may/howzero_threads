# Brand Content Pipeline — Design Spec

**Date:** 2026-04-24
**Status:** Approved (design)
**Scope:** Master orchestration + skill interfaces. Internal implementation of each sub-skill is deferred to separate specs.

---

## 1. Goal

주제 하나를 입력하면 브랜드(zipsaja/howzero/braveyong)를 라우팅하여 캐러셀 + Remotion 릴스 + 첨부자료(Excel + PDF) + 플랫폼별 캡션(3종)을 일괄 생성하는 파이프라인.

하이브리드 플로우: 브랜드·데이터는 대화형 확인, 나머지 산출물은 batch 생성.

---

## 2. High-Level Architecture

```
/pipeline [brand] [topic]
  │
  ├─ 1. Parse brand + topic       (interactive if missing)
  ├─ 2. Fetch data (brand-specific) (interactive — zipsaja only; howzero/braveyong skip)
  ├─ 3. Generate 4 artifacts in batch
  │    ├─ carousel
  │    ├─ reels (9:16 22s mp4)
  │    ├─ attachments (Excel + PDF)
  │    └─ captions (Instagram / Threads / LinkedIn)
  ├─ 4. Final review (interactive)
  └─ 5. Organize into brands/ bundle
```

---

## 3. Skill Decomposition

5 skills + 1 future placeholder. Each is independently invokable for retry; only the master chains them.

| # | Skill | Role | Reads | Writes |
|---|---|---|---|---|
| 1 | `pipeline` (master) | Router · interactive checkpoints · state machine | CLI args, user input | `pipeline-state.json` |
| 2 | `zipsaja-data-fetch` | SSH tunnel + SQL preset + dataset assembly | `state.brand == "zipsaja"`, `state.topic` | `state.data` |
| 3 | `content-carousel` | Brand-toned carousel HTML + PNG (wraps existing `/carousel`) | `state.brand`, `state.data` | `state.artifacts.carousel` |
| 4 | `content-reels` | Carousel → 9:16 22s mp4 (wraps existing `/reels`) | `state.artifacts.carousel` | `state.artifacts.reels` |
| 5 | `content-attachments` | Excel raw + PDF insights | `state.data` | `state.artifacts.{excel,pdf}` |
| 6 | `content-captions` | 3-platform captions (Instagram lead-magnet hook front-placed) | `state.data`, `state.artifacts.reels` (for duration cues) | `state.artifacts.captions` |
| — | `howzero-data-fetch` (future) | TBD when howzero data source is defined | — | — |
| — | `braveyong-data-fetch` (future) | TBD when braveyong data source is defined | — | — |

**Execution flow inside master:**
```
pipeline
  ├─ if brand == zipsaja: call zipsaja-data-fetch
  ├─ else:                 skip data step
  ├─ parallel:
  │    ├─ content-carousel → content-reels (depends on carousel)
  │    ├─ content-attachments
  │    └─ content-captions (depends on data + reels preview)
  └─ finalize: /brands-organize
```

**Isolation rules:**
- Each skill reads/writes only `pipeline-state.json`. No direct inter-skill calls.
- Each skill is independently re-runnable (for retry on partial failure).
- Brand-specific logic stays in its data-fetch skill; the master is brand-agnostic.

---

## 4. Interactive Checkpoints (Hybrid Flow)

| Step | Mode | User interaction |
|---|---|---|
| 1. Input parse | Interactive when needed | If `brand` missing → ask among zipsaja/howzero/braveyong |
| 2. Data fetch (zipsaja) | Interactive | Show selected preset, filters, and confirm before running SQL. After run, show data preview (top 3 rows or similar) before approving content generation. |
| 2. Data fetch (howzero/braveyong) | Skipped | Topic text passed through as-is |
| 3. Artifact batch | Automatic | All 4 artifacts generated in parallel without interruption |
| 4. Final review | Interactive | All outputs presented together; user can request modifications (per-artifact retry) |
| 5. brands/ organize | Automatic | Moves everything into `brands/{brand}/{brand}_pipeline_{slug}/` |

**Example zipsaja dialogue:**
```
User: /pipeline zipsaja 이재명 당선후 서울 실거래 변화
Bot:  주제 분석 중... 프리셋 "leejaemyung-before-after"가 적절합니다.
      필터: 300세대 이상 아파트, 평형 무관, 매매(A1)
      기간: 2024-06-04 ~ 2025-06-03 vs 2025-06-04 ~ 현재
      진행할까요? (y / preset 변경 / 필터 수정)
User: y
Bot:  [SSH 쿼리 실행] 25개 구 데이터 확보. 상위: 광진 +17.3%, 성동 +17.1%, 동대문 +17.1%
      산출물 생성으로 진행할까요? (y / 데이터 수정)
User: y
Bot:  [batch 생성 중, 약 2-3분]
      ✓ carousel (10 slides)
      ✓ reels (22s)
      ✓ excel + pdf
      ✓ captions × 3
      최종 리뷰 열까요?
```

---

## 5. Pipeline State JSON (Data Contract)

Single source of truth. Persisted to disk at `brands/{brand}/{brand}_pipeline_{slug}/pipeline-state.json`.

```json
{
  "pipelineId": "zipsaja_20260424_leejaemyung-seoul",
  "createdAt": "2026-04-24T12:00:00+09:00",
  "brand": "zipsaja",
  "topic": "이재명 당선후 서울 실거래 변화",
  "slug": "leejaemyung-seoul",

  "data": {
    "source": "ssh:hh-worker-2/proptech_db",
    "preset": "leejaemyung-before-after",
    "params": {
      "pivotDate": "2025-06-04",
      "minTotalUnits": 300,
      "tradeType": "A1"
    },
    "dataset": {
      "title": "이재명 대통령 당선후 서울 실거래 변화",
      "subtitle": "취임 전 12개월 vs 취임 후 ~ 현재",
      "periodLabel": "2024.6 ~ 2025.6 vs 2025.6 ~ 현재",
      "source": "국토부 실거래가 (매매)",
      "districts": [
        {
          "district": "광진구",
          "priceLastYear": 144870,
          "priceThisYear": 169973,
          "changePct": 17.3
        }
      ]
    }
  },

  "tone": {
    "brandVoice": "반말 친구 톤",
    "accent": "#EA2E00",
    "bg": "#F0E7D6"
  },

  "artifacts": {
    "carousel": {
      "path": "brands/zipsaja/zipsaja_pipeline_leejaemyung-seoul/carousel/",
      "slideCount": 10
    },
    "reels": {
      "path": "brands/zipsaja/zipsaja_pipeline_leejaemyung-seoul/reels/zipsaja-leejaemyung-seoul-22s.mp4",
      "duration": 22
    },
    "excel": {
      "path": "brands/zipsaja/zipsaja_pipeline_leejaemyung-seoul/attachments/seoul-price-change.xlsx"
    },
    "pdf": {
      "path": "brands/zipsaja/zipsaja_pipeline_leejaemyung-seoul/attachments/seoul-price-insights.pdf"
    },
    "captions": {
      "instagram": "instagram.txt contents...",
      "threads": "threads.txt contents...",
      "linkedin": "linkedin.txt contents..."
    }
  },

  "status": "completed"
}
```

**Rules:**
- `data` block shape differs per brand. zipsaja = rich dataset; howzero/braveyong = `{"topic": "...", "notes": "..."}` minimal shape.
- `artifacts` block: each sub-skill writes ONLY its own key.
- `status` values: `pending`, `data-ready`, `generating`, `completed`, `failed`.
- On failure, `status = failed` + a `failedAt` key indicating which step; the pipeline is resumable from that point.

---

## 6. Output File Convention

Deviates from per-type folders in existing `AGENTS.md §3` by bundling everything under one pipeline folder.

```
brands/zipsaja/zipsaja_pipeline_leejaemyung-seoul/
├── pipeline-state.json
├── README.md                        (auto-generated — topic, data source, files, usage)
├── carousel/
│   ├── slides.html
│   ├── slide-01.png ~ slide-10.png
│   └── capture.mjs
├── reels/
│   ├── zipsaja-leejaemyung-seoul.mp4      (1080×1920 H.264 full render)
│   └── zipsaja-leejaemyung-seoul-22s.mp4  (ffmpeg re-encoded, faststart)
├── attachments/
│   ├── seoul-price-change.xlsx
│   └── seoul-price-insights.pdf
└── captions/
    ├── instagram.txt
    ├── threads.txt
    └── linkedin.txt
```

**Naming:**
- Folder: `{brand}_pipeline_{slug}`
- `slug` extracted from topic by the master skill (example: "이재명 당선후 서울 실거래 변화" → `leejaemyung-seoul`).
- `slug` is the single source of truth for all artifact filenames inside the bundle.

**Relationship to existing convention:**
- Pipeline bundles are a new `_pipeline_` type. Legacy `_carousel_` / `_reels_` / `_captions_` / `_comments_` standalone folders remain valid for one-off manual work.
- `AGENTS.md §3` table gets a new row: `pipeline | 통합 산출물 (carousel + reels + attachments + captions) | zipsaja_pipeline_leejaemyung-seoul`.

---

## 7. AGENTS.md Additions

Add new section 8 to `AGENTS.md`:

```markdown
## 8. 콘텐츠 파이프라인 (/pipeline)

### 브랜드 × 데이터 소스 매핑

| 브랜드 | 데이터 소스 | 상태 |
|---|---|---|
| zipsaja   | SSH hh-worker-2 → proptech_db (real_prices × complexes) | **필수** |
| howzero   | 없음 (주제 텍스트만)                                    | TBD |
| braveyong | 없음 (주제 텍스트만)                                    | TBD |

### zipsaja SSH 접속 설정 (고정)
- SSH alias: `hh-worker-2`
- DB: `postgresql://proptech@localhost:5432/proptech_db`
- Password: `/opt/proptech/.env` 참조 (DATABASE_URL)
- 주요 테이블: `real_prices` (1M+ rows, trade_type A1=매매), `complexes` (total_units, gu)
- 인덱스: `idx_complexes_total_units`, `idx_complexes_gu`, `idx_real_prices_trade_date`

### SQL 프리셋
- leejaemyung-before-after — 취임 전 12개월 vs 취임 후 평균가 (구별)
- weekly-rate             — 한국부동산원식 주간 변동률 (구별)
- custom-period           — AI가 주제에서 기간 추출

### 사용법
```bash
# zipsaja: SSH + SQL 자동
/pipeline zipsaja 이재명 당선후 서울 실거래 변화

# howzero/braveyong: 주제 텍스트만
/pipeline howzero 1인 기업가 시간관리
```

산출물 위치: `brands/{brand}/{brand}_pipeline_{slug}/`
```

Also update `§3` type table with `pipeline` row.

---

## 8. Error Handling

| Failure point | Behavior |
|---|---|
| Brand not specified and user silent | Master asks once. On second silence, abort. |
| SSH tunnel fails (zipsaja) | Prompt: "터널 실패. 마지막 캐시 데이터(`pipeline-state.json.bak`)로 진행할까요?" — yes/no/abort. |
| SQL preset doesn't match topic | Show preset list, let user pick. |
| Empty dataset | Abort with message; no silent placeholder data. |
| Artifact step fails | Mark `status = failed`, `failedAt = "<skill>"`; keep partial artifacts; allow user to retry that one step via `/pipeline --resume {pipelineId}`. |
| User dislikes a single artifact at final review | Retry that skill only (e.g. `content-captions` with updated tone hint). |

**No silent fallback to sample data.** When data is unavailable, abort with a clear message.

---

## 9. Out of Scope (Future Specs)

The following are explicitly excluded from this design spec and must go through their own brainstorm → spec → plan cycles:

- **Internal implementation of each sub-skill** — this spec only defines interfaces, not how carousel HTML is generated, how PDFs are rendered, etc.
- **howzero and braveyong data sources** — data sources are marked TBD. A separate spec will add `howzero-data-fetch` and `braveyong-data-fetch` skills when their source is decided.
- **Auto-posting to Instagram/Threads/LinkedIn** — this pipeline stops at generating files. Posting is manual or a separate automation.
- **Analytics / comment-lead-magnet delivery automation** — caption tells users to comment "엑셀" to get the file, but actually sending files via DM is a separate job (existing `scripts/post.py` territory).
- **Multi-language** — Korean only.

---

## 10. Skill Priority

If implemented sequentially, recommended order:

1. `pipeline` (master) — without it, nothing composes
2. `zipsaja-data-fetch` — unlocks the MVP (zipsaja is the only brand with data today)
3. `content-carousel` + `content-reels` — reuse existing `/carousel` and `/reels` as wrappers
4. `content-captions` — moderate complexity, high value (3 variants)
5. `content-attachments` — last because PDF generation is the heaviest lift

MVP = skills 1 + 2 + 3 + 4 (+ content-reels via existing `/reels`).

---

## 11. Open Questions for Implementation Spec

To resolve during `writing-plans` for each sub-skill:

- How does `pipeline` persist and recover `pipeline-state.json` across turns (if user closes and re-opens)?
- Exact SQL for each preset (column list, aggregation window).
- PDF rendering library (weasyprint vs reportlab vs Remotion stills).
- Excel library (openpyxl vs pandas.to_excel).
- Caption generation: Claude Sonnet with brand-specific prompt templates?
- Carousel reuses existing `/carousel` — does the pipeline provide a data JSON that `/carousel` consumes, or does `content-carousel` wrap `/carousel` with additional logic?

---

**End of design spec.**
