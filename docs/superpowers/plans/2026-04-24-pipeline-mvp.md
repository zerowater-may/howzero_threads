# Pipeline MVP (Master + zipsaja-data-fetch) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/pipeline zipsaja <주제>` 커맨드가 SSH 터널로 proptech_db에 접속해 SQL preset 실행 → 25개 구 dataset을 `brands/zipsaja/zipsaja_pipeline_<slug>/pipeline-state.json` 에 저장하는 MVP. content-* 산출물 스킬들은 후속 plan.

**Architecture:** 두 개 skill 신설 — `pipeline` (master: 입력 파싱·bundle path 계산·state 관리) + `zipsaja-data-fetch` (SSH tunnel + SQL preset 실행 + dataset 구조화). state는 JSON 파일 (`src/howzero_threads/store/state.py` StateStore 패턴 재사용). 기존 `scripts/zipsaja_seoul_prices` 는 잘못된 인프라(batch_server+bulsaja_analytics) 참조하므로 **삭제**하고 새 `scripts/zipsaja_data_fetch` 로 완전 교체.

**Tech Stack:** Python 3.11 + `psycopg2-binary` + `sshtunnel` + `pytest`. Claude Code skills (SKILL.md frontmatter + description).

---

## File Structure

**Create:**
```
scripts/pipeline/
├── __init__.py                        # "Pipeline master orchestrator"
├── __main__.py                        # argparse CLI
├── state.py                           # PipelineState dataclass + load/save
├── paths.py                           # bundle path + slug computation
└── dispatch.py                        # brand→skill routing (phase 1: zipsaja only)

scripts/zipsaja_data_fetch/
├── __init__.py
├── __main__.py                        # CLI for standalone invocation
├── fetch.py                           # SSH tunnel + psycopg2 execute
├── presets.py                         # preset registry (name → SQL template + param extractor)
└── presets_sql/
    └── leejaemyung_before_after.sql   # SQL template (pivotDate param)

tests/pipeline/
├── __init__.py
├── test_state.py
├── test_paths.py
└── test_dispatch.py

tests/zipsaja_data_fetch/
├── __init__.py
├── test_presets.py                    # preset registry + SQL template unit tests
└── test_fetch_transforms.py           # row → dataset shape tests (no DB)

.claude/skills/pipeline/
└── SKILL.md                           # skill doc + trigger keywords

.claude/skills/zipsaja-data-fetch/
└── SKILL.md
```

**Modify:**
- `AGENTS.md` — add `pipeline` row to §3 type table; add new §8 for pipeline doc + brand data mapping
- `pyproject.toml` — ensure `psycopg2-binary>=2.9` + `sshtunnel>=0.4.0` in a new `pipeline` optional group

**Delete:**
- `scripts/zipsaja_seoul_prices/` (entire directory) — superseded by `scripts/zipsaja_data_fetch`; references wrong infra
- `tests/zipsaja_seoul_prices/` (entire directory) — tests for deleted module

---

## Pre-work: Verify existing branch state

Before Task 1, confirm you are on the feature branch:

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
git branch --show-current
# Expected: feat/zipsaja-seoul-price-reel   (current WIP branch)
# If on main, run: git checkout -b feat/pipeline-mvp
```

---

### Task 1: Delete obsolete zipsaja_seoul_prices + tests

The existing package references `batch_server` + `bulsaja_analytics` + nonexistent view `zipsaja_seoul_gu_price_compare`. Spec §7 says "완전 교체". Clean slate before new module.

**Files:**
- Delete: `scripts/zipsaja_seoul_prices/` (directory)
- Delete: `tests/zipsaja_seoul_prices/` (directory)
- Verify: no imports elsewhere

- [ ] **Step 1: Check for imports**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
grep -r "zipsaja_seoul_prices" --include="*.py" --include="*.md" --include="*.json" --include="*.toml" . 2>/dev/null | grep -v "scripts/zipsaja_seoul_prices\|tests/zipsaja_seoul_prices\|docs/superpowers"
```

Expected: No output (no external references). If hits appear, report them in Step 4.

- [ ] **Step 2: Delete directories**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
git rm -r scripts/zipsaja_seoul_prices tests/zipsaja_seoul_prices
```

- [ ] **Step 3: Verify pytest still collects cleanly**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
python -m pytest --collect-only 2>&1 | tail -10
```

Expected: No ImportError. Existing tests still discoverable.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(pipeline): zipsaja_seoul_prices 제거 — 잘못된 infra(batch_server+bulsaja_analytics) 참조. zipsaja_data_fetch로 교체"
```

---

### Task 2: PipelineState dataclass + persistence

Follow the `StateStore` JSON-on-disk pattern from `src/howzero_threads/store/state.py` but a dedicated class for pipeline state (separate responsibilities).

**Files:**
- Create: `scripts/pipeline/__init__.py`
- Create: `scripts/pipeline/state.py`
- Create: `tests/pipeline/__init__.py`
- Create: `tests/pipeline/test_state.py`

- [ ] **Step 1: Write the failing test**

File: `tests/pipeline/test_state.py`

```python
import json
from pathlib import Path

from scripts.pipeline.state import PipelineState


def test_pipeline_state_roundtrip(tmp_path: Path):
    state_path = tmp_path / "pipeline-state.json"
    state = PipelineState(
        pipeline_id="zipsaja_20260424_test",
        brand="zipsaja",
        topic="테스트 주제",
        slug="test",
    )
    state.status = "pending"
    state.save(state_path)

    loaded = PipelineState.load(state_path)
    assert loaded.pipeline_id == "zipsaja_20260424_test"
    assert loaded.brand == "zipsaja"
    assert loaded.topic == "테스트 주제"
    assert loaded.slug == "test"
    assert loaded.status == "pending"


def test_pipeline_state_load_missing_file_raises(tmp_path: Path):
    import pytest
    with pytest.raises(FileNotFoundError):
        PipelineState.load(tmp_path / "nope.json")


def test_pipeline_state_mark_failed(tmp_path: Path):
    state = PipelineState(
        pipeline_id="zipsaja_20260424_x",
        brand="zipsaja",
        topic="x",
        slug="x",
    )
    state.mark_failed("zipsaja-data-fetch", "SSH tunnel timeout")
    assert state.status == "failed"
    assert state.failed_at == "zipsaja-data-fetch"
    assert state.failed_reason == "SSH tunnel timeout"


def test_pipeline_state_data_block_optional(tmp_path: Path):
    state_path = tmp_path / "p.json"
    state = PipelineState(
        pipeline_id="howzero_20260424_x",
        brand="howzero",
        topic="x",
        slug="x",
    )
    # howzero has no data step — data block stays empty
    assert state.data is None
    state.save(state_path)
    raw = json.loads(state_path.read_text())
    assert raw["data"] is None
```

- [ ] **Step 2: Run the failing tests**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
mkdir -p tests/pipeline
touch tests/pipeline/__init__.py
python -m pytest tests/pipeline/test_state.py -v
```

Expected: `ModuleNotFoundError: No module named 'scripts.pipeline'` or collection error. That is the TDD red.

- [ ] **Step 3: Create package + PipelineState implementation**

File: `scripts/pipeline/__init__.py`

```python
"""Pipeline master orchestrator."""
```

File: `scripts/pipeline/state.py`

```python
"""PipelineState dataclass + JSON persistence.

Mirrors the StateStore pattern from src/howzero_threads/store/state.py but with
fields tailored for the /pipeline skill (brand, topic, slug, data block, artifacts).
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional


@dataclass
class PipelineState:
    pipeline_id: str
    brand: str
    topic: str
    slug: str
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).astimezone().isoformat()
    )
    status: str = "pending"
    failed_at: Optional[str] = None
    failed_reason: Optional[str] = None
    data: Optional[dict[str, Any]] = None
    tone: Optional[dict[str, Any]] = None
    artifacts: dict[str, Any] = field(default_factory=dict)

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(asdict(self), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    @classmethod
    def load(cls, path: Path) -> "PipelineState":
        raw = json.loads(path.read_text(encoding="utf-8"))
        return cls(**raw)

    def mark_failed(self, step: str, reason: str) -> None:
        self.status = "failed"
        self.failed_at = step
        self.failed_reason = reason
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
python -m pytest tests/pipeline/test_state.py -v
```

Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/pipeline/__init__.py scripts/pipeline/state.py \
        tests/pipeline/__init__.py tests/pipeline/test_state.py
git commit -m "feat(pipeline): PipelineState dataclass + JSON persistence + failed-state 기록"
```

---

### Task 3: Bundle path + slug computation

Turns a topic like `"이재명 당선후 서울 실거래 변화"` into a slug like `leejaemyung-seoul` and a bundle path `brands/zipsaja/zipsaja_pipeline_leejaemyung-seoul/`.

**Files:**
- Create: `scripts/pipeline/paths.py`
- Create: `tests/pipeline/test_paths.py`

- [ ] **Step 1: Write the failing test**

File: `tests/pipeline/test_paths.py`

```python
from pathlib import Path

from scripts.pipeline.paths import (
    BUNDLE_ROOT,
    bundle_path,
    make_slug,
    state_file_path,
)


def test_make_slug_korean_to_ascii():
    # Simple hyphenation for Korean topics
    assert make_slug("이재명 당선후 서울 실거래 변화") == "이재명-당선후-서울-실거래-변화"


def test_make_slug_strips_punctuation():
    assert make_slug("2026년 6월! 아파트/주택 변화?") == "2026년-6월-아파트-주택-변화"


def test_make_slug_collapses_whitespace():
    assert make_slug("  서울   실거래   변화  ") == "서울-실거래-변화"


def test_make_slug_allows_ascii_mix():
    assert make_slug("SCHD 배당") == "SCHD-배당"


def test_bundle_path_structure():
    result = bundle_path("zipsaja", "leejaemyung-seoul")
    assert result == BUNDLE_ROOT / "zipsaja" / "zipsaja_pipeline_leejaemyung-seoul"


def test_state_file_path_uses_bundle():
    result = state_file_path("zipsaja", "test")
    assert result == BUNDLE_ROOT / "zipsaja" / "zipsaja_pipeline_test" / "pipeline-state.json"


def test_bundle_root_is_brands_dir():
    assert BUNDLE_ROOT.name == "brands"
    # BUNDLE_ROOT is absolute (resolved from __file__)
    assert BUNDLE_ROOT.is_absolute()
```

- [ ] **Step 2: Run — expect fail**

```bash
python -m pytest tests/pipeline/test_paths.py -v
```

Expected: ImportError / module not found.

- [ ] **Step 3: Implement**

File: `scripts/pipeline/paths.py`

```python
"""Bundle path + slug computation for pipeline outputs.

BUNDLE_ROOT is resolved relative to the repo (scripts/pipeline/paths.py → .. → ..)
so invocation from any CWD produces correct paths.
"""
from __future__ import annotations

import re
from pathlib import Path

# repo_root/brands/
BUNDLE_ROOT = Path(__file__).resolve().parents[2] / "brands"


def make_slug(topic: str) -> str:
    """Topic → URL-safe slug.

    Rules:
    - Strip punctuation (Korean: 。,!?/ etc; ASCII: .,!?/ etc)
    - Collapse whitespace to single hyphens
    - Preserve Korean characters, ASCII letters, digits
    """
    # 1) remove punctuation (keep Korean + ASCII alphanumeric + whitespace)
    cleaned = re.sub(r"[^\w\s]", " ", topic, flags=re.UNICODE)
    # 2) collapse whitespace to single space then strip
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    # 3) spaces → hyphens
    return cleaned.replace(" ", "-")


def bundle_path(brand: str, slug: str) -> Path:
    return BUNDLE_ROOT / brand / f"{brand}_pipeline_{slug}"


def state_file_path(brand: str, slug: str) -> Path:
    return bundle_path(brand, slug) / "pipeline-state.json"
```

- [ ] **Step 4: Run — expect PASS**

```bash
python -m pytest tests/pipeline/test_paths.py -v
```

Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/pipeline/paths.py tests/pipeline/test_paths.py
git commit -m "feat(pipeline): bundle path + slug 계산 유틸 — 한글 주제 → 하이픈 slug"
```

---

### Task 4: Brand dispatcher (zipsaja path only for MVP)

`dispatch.py` decides which data-fetch skill runs for each brand. MVP: zipsaja → `zipsaja_data_fetch`. howzero/braveyong → skip data step.

**Files:**
- Create: `scripts/pipeline/dispatch.py`
- Create: `tests/pipeline/test_dispatch.py`

- [ ] **Step 1: Write the failing test**

File: `tests/pipeline/test_dispatch.py`

```python
import pytest

from scripts.pipeline.dispatch import (
    SUPPORTED_BRANDS,
    brand_needs_data_fetch,
    validate_brand,
)


def test_supported_brands_exact():
    assert SUPPORTED_BRANDS == ("zipsaja", "howzero", "braveyong")


def test_validate_brand_passes_for_zipsaja():
    validate_brand("zipsaja")  # should not raise


def test_validate_brand_raises_for_unknown():
    with pytest.raises(ValueError, match="Unknown brand"):
        validate_brand("mkt")


def test_validate_brand_raises_for_empty():
    with pytest.raises(ValueError, match="Brand is required"):
        validate_brand("")


def test_zipsaja_needs_data_fetch():
    assert brand_needs_data_fetch("zipsaja") is True


def test_howzero_skips_data_fetch():
    assert brand_needs_data_fetch("howzero") is False


def test_braveyong_skips_data_fetch():
    assert brand_needs_data_fetch("braveyong") is False
```

- [ ] **Step 2: Run — expect fail**

```bash
python -m pytest tests/pipeline/test_dispatch.py -v
```

- [ ] **Step 3: Implement**

File: `scripts/pipeline/dispatch.py`

```python
"""Brand → data-fetch routing.

MVP scope: zipsaja needs data fetch (SSH + proptech_db). howzero/braveyong
skip the data step and pass topic text through as-is (per spec §2 Step 2).
"""
from __future__ import annotations

SUPPORTED_BRANDS: tuple[str, ...] = ("zipsaja", "howzero", "braveyong")

_DATA_FETCH_BRANDS: frozenset[str] = frozenset({"zipsaja"})


def validate_brand(brand: str) -> None:
    if not brand:
        raise ValueError("Brand is required")
    if brand not in SUPPORTED_BRANDS:
        raise ValueError(
            f"Unknown brand '{brand}'. Supported: {', '.join(SUPPORTED_BRANDS)}"
        )


def brand_needs_data_fetch(brand: str) -> bool:
    return brand in _DATA_FETCH_BRANDS
```

- [ ] **Step 4: Run — expect PASS**

```bash
python -m pytest tests/pipeline/test_dispatch.py -v
```

Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/pipeline/dispatch.py tests/pipeline/test_dispatch.py
git commit -m "feat(pipeline): 브랜드 라우팅 — zipsaja는 data fetch 필요, howzero/braveyong은 스킵"
```

---

### Task 5: SQL preset registry — leejaemyung-before-after

Preset #1 of 3 (per spec §11). Takes a `pivotDate` parameter (default `2025-06-04`) and returns a SQL template that compares the 12 months before vs everything since. Other presets (`weekly-rate`, `custom-period`) land in later plans.

**Files:**
- Create: `scripts/zipsaja_data_fetch/__init__.py`
- Create: `scripts/zipsaja_data_fetch/presets.py`
- Create: `scripts/zipsaja_data_fetch/presets_sql/leejaemyung_before_after.sql`
- Create: `tests/zipsaja_data_fetch/__init__.py`
- Create: `tests/zipsaja_data_fetch/test_presets.py`

- [ ] **Step 1: Write the SQL template**

File: `scripts/zipsaja_data_fetch/presets_sql/leejaemyung_before_after.sql`

```sql
-- Seoul 25 districts · 300+ households · trade_type A1 (매매)
-- Compare: 12 months before pivot_date vs from pivot_date onward
-- Params: :pivot_date (date), :min_total_units (int, default 300)
WITH seoul AS (
  SELECT complex_id, gu
  FROM complexes
  WHERE total_units >= :min_total_units
    AND gu = ANY(ARRAY[
      '서초구','강남구','용산구','송파구','성동구','마포구','동작구','강동구',
      '광진구','중구','영등포구','종로구','동대문구','서대문구','양천구','강서구',
      '성북구','은평구','관악구','구로구','강북구','금천구','노원구','중랑구','도봉구'
    ])
),
before_p AS (
  SELECT s.gu, ROUND(AVG(rp.price))::bigint AS avg_price, COUNT(*) AS cnt
  FROM real_prices rp JOIN seoul s USING (complex_id)
  WHERE rp.trade_type = 'A1' AND rp.is_cancel = false
    AND rp.trade_date >= (:pivot_date::date - INTERVAL '12 months')
    AND rp.trade_date < :pivot_date::date
  GROUP BY s.gu
),
after_p AS (
  SELECT s.gu, ROUND(AVG(rp.price))::bigint AS avg_price, COUNT(*) AS cnt
  FROM real_prices rp JOIN seoul s USING (complex_id)
  WHERE rp.trade_type = 'A1' AND rp.is_cancel = false
    AND rp.trade_date >= :pivot_date::date
  GROUP BY s.gu
)
SELECT b.gu AS district,
       b.avg_price AS price_before,
       a.avg_price AS price_after,
       b.cnt AS trades_before,
       a.cnt AS trades_after
FROM before_p b JOIN after_p a USING (gu)
ORDER BY b.gu;
```

- [ ] **Step 2: Write the failing test**

File: `tests/zipsaja_data_fetch/test_presets.py`

```python
from datetime import date

import pytest

from scripts.zipsaja_data_fetch.presets import (
    PRESETS,
    Preset,
    extract_params,
    get_preset,
)


def test_leejaemyung_preset_exists():
    preset = get_preset("leejaemyung-before-after")
    assert isinstance(preset, Preset)
    assert preset.name == "leejaemyung-before-after"


def test_leejaemyung_preset_default_params():
    preset = get_preset("leejaemyung-before-after")
    params = preset.default_params
    assert params["pivot_date"] == date(2025, 6, 4)
    assert params["min_total_units"] == 300


def test_leejaemyung_sql_loads_from_file():
    preset = get_preset("leejaemyung-before-after")
    sql = preset.sql_template
    assert "real_prices" in sql
    assert "complexes" in sql
    assert ":pivot_date" in sql
    assert ":min_total_units" in sql
    # Ensure 25 districts in the ARRAY literal
    assert sql.count("구'") >= 25


def test_unknown_preset_raises():
    with pytest.raises(KeyError, match="unknown preset"):
        get_preset("nope-preset")


def test_presets_registry_lists_all():
    # Only leejaemyung-before-after in Plan 1. weekly-rate/custom-period in Plan 2+.
    assert "leejaemyung-before-after" in PRESETS
    assert len(PRESETS) == 1


def test_extract_params_override_pivot_date():
    preset = get_preset("leejaemyung-before-after")
    params = extract_params(preset, user_overrides={"pivot_date": "2024-01-01"})
    assert params["pivot_date"] == date(2024, 1, 1)
    # Other defaults retained
    assert params["min_total_units"] == 300


def test_extract_params_override_min_units():
    preset = get_preset("leejaemyung-before-after")
    params = extract_params(preset, user_overrides={"min_total_units": 500})
    assert params["min_total_units"] == 500
    # Pivot date default retained
    assert params["pivot_date"] == date(2025, 6, 4)


def test_extract_params_rejects_unknown_override():
    preset = get_preset("leejaemyung-before-after")
    with pytest.raises(ValueError, match="unknown parameter"):
        extract_params(preset, user_overrides={"bogus_key": "x"})
```

- [ ] **Step 3: Run — expect fail**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
mkdir -p tests/zipsaja_data_fetch
touch tests/zipsaja_data_fetch/__init__.py
python -m pytest tests/zipsaja_data_fetch/test_presets.py -v
```

Expected: ModuleNotFoundError.

- [ ] **Step 4: Implement presets module**

File: `scripts/zipsaja_data_fetch/__init__.py`

```python
"""zipsaja data fetch — SSH tunnel + proptech_db SQL presets.

Supersedes the obsolete scripts/zipsaja_seoul_prices (deleted in Task 1).
"""
```

File: `scripts/zipsaja_data_fetch/presets.py`

```python
"""SQL preset registry for zipsaja proptech_db queries.

Each preset bundles a SQL template + default parameters + a validator for
user-supplied overrides. The template uses psycopg2-compatible :named
placeholders.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any

_SQL_DIR = Path(__file__).parent / "presets_sql"


@dataclass(frozen=True)
class Preset:
    name: str
    sql_template: str
    default_params: dict[str, Any] = field(default_factory=dict)


def _load_sql(filename: str) -> str:
    return (_SQL_DIR / filename).read_text(encoding="utf-8")


PRESETS: dict[str, Preset] = {
    "leejaemyung-before-after": Preset(
        name="leejaemyung-before-after",
        sql_template=_load_sql("leejaemyung_before_after.sql"),
        default_params={
            "pivot_date": date(2025, 6, 4),
            "min_total_units": 300,
        },
    ),
}


def get_preset(name: str) -> Preset:
    if name not in PRESETS:
        raise KeyError(f"unknown preset '{name}' — known: {list(PRESETS)}")
    return PRESETS[name]


def extract_params(preset: Preset, *, user_overrides: dict[str, Any] | None = None) -> dict[str, Any]:
    """Merge user overrides onto preset defaults.

    Raises ValueError if user provides a key not in default_params.
    Coerces pivot_date string → date.
    """
    overrides = user_overrides or {}
    unknown = set(overrides) - set(preset.default_params)
    if unknown:
        raise ValueError(f"unknown parameter(s): {sorted(unknown)}")

    merged: dict[str, Any] = dict(preset.default_params)
    for key, value in overrides.items():
        if key == "pivot_date" and isinstance(value, str):
            merged[key] = date.fromisoformat(value)
        else:
            merged[key] = value
    return merged
```

- [ ] **Step 5: Run — expect PASS**

```bash
python -m pytest tests/zipsaja_data_fetch/test_presets.py -v
```

Expected: 8 passed.

- [ ] **Step 6: Commit**

```bash
git add scripts/zipsaja_data_fetch/__init__.py \
        scripts/zipsaja_data_fetch/presets.py \
        scripts/zipsaja_data_fetch/presets_sql/leejaemyung_before_after.sql \
        tests/zipsaja_data_fetch/__init__.py \
        tests/zipsaja_data_fetch/test_presets.py
git commit -m "feat(zipsaja-data-fetch): leejaemyung-before-after preset + SQL 템플릿 + 파라미터 오버라이드"
```

---

### Task 6: Fetch — SSH tunnel + psycopg2 execution + row → dataset shape

Pure transform logic (row → dataset dict) is unit-testable. Network-side (tunnel + psycopg2) is validated by live smoke test in Task 11 (integration).

**Files:**
- Create: `scripts/zipsaja_data_fetch/fetch.py`
- Create: `tests/zipsaja_data_fetch/test_fetch_transforms.py`

- [ ] **Step 1: Write the failing test**

File: `tests/zipsaja_data_fetch/test_fetch_transforms.py`

```python
from scripts.zipsaja_data_fetch.fetch import (
    SEOUL_DISTRICTS_ORDER,
    compute_change_pct,
    rows_to_dataset,
)


def test_compute_change_pct_positive():
    assert compute_change_pct(100_000_000, 117_300_000) == 17.3


def test_compute_change_pct_negative():
    assert compute_change_pct(1_000_000_000, 931_000_000) == -6.9


def test_compute_change_pct_zero_base_returns_zero():
    assert compute_change_pct(0, 1_000_000) == 0.0


def test_rows_to_dataset_full_shape():
    # (district, price_before_won, price_after_won, trades_before, trades_after)
    rows = [
        ("광진구", 144_870_974_200, 169_973_622_400, 1242, 784),
        ("서초구", 316_824_955_600, 326_003_732_900, 2817, 951),
    ]
    dataset = rows_to_dataset(
        rows,
        title="이재명 대통령 당선후 서울 실거래 변화",
        subtitle="취임 전 12개월 vs 취임 후 ~ 현재",
        period_label="2024.6 ~ 2025.6 vs 2025.6 ~ 현재",
        source="국토부 실거래가 (매매)",
    )
    assert dataset["title"] == "이재명 대통령 당선후 서울 실거래 변화"
    assert len(dataset["districts"]) == 2
    # Sorted by SEOUL_DISTRICTS_ORDER: 서초구 (index 0) comes before 광진구 (index 8)
    assert dataset["districts"][0]["district"] == "서초구"
    assert dataset["districts"][1]["district"] == "광진구"
    # priceBefore / priceAfter stored in 만원 for Remotion consistency
    # (원 → 만원 = divide by 10000, truncate)
    assert dataset["districts"][0]["priceBefore"] == 31_682_495
    assert dataset["districts"][1]["priceAfter"] == 16_997_362
    # changePct: (169973622400 - 144870974200) / 144870974200 * 100 ≈ 17.3
    assert dataset["districts"][1]["changePct"] == 17.3


def test_rows_to_dataset_empty_district_dropped():
    # PG returns a district NOT in SEOUL_DISTRICTS_ORDER (impossible given SQL ARRAY filter,
    # but defensive).
    rows = [
        ("서초구", 100_000_000, 110_000_000, 10, 15),
        ("임의구", 200_000_000, 220_000_000, 20, 25),  # not in order → dropped
    ]
    dataset = rows_to_dataset(
        rows, title="", subtitle="", period_label="", source=""
    )
    assert len(dataset["districts"]) == 1
    assert dataset["districts"][0]["district"] == "서초구"


def test_seoul_districts_order_has_25():
    assert len(SEOUL_DISTRICTS_ORDER) == 25
    assert "서초구" in SEOUL_DISTRICTS_ORDER
    assert "도봉구" in SEOUL_DISTRICTS_ORDER
```

- [ ] **Step 2: Run — expect fail**

```bash
python -m pytest tests/zipsaja_data_fetch/test_fetch_transforms.py -v
```

- [ ] **Step 3: Implement fetch.py**

File: `scripts/zipsaja_data_fetch/fetch.py`

```python
"""SSH tunnel + psycopg2 PG execution + row → dataset transform.

Network boundary is isolated from pure transforms so unit tests cover
row shaping without needing a live DB.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import psycopg2
from sshtunnel import SSHTunnelForwarder

# 25 Seoul 자치구 — ordered for consistent rendering
SEOUL_DISTRICTS_ORDER: tuple[str, ...] = (
    "서초구", "강남구", "용산구", "송파구", "성동구", "마포구", "동작구", "강동구",
    "광진구", "중구", "영등포구", "종로구", "동대문구", "서대문구", "양천구", "강서구",
    "성북구", "은평구", "관악구", "구로구", "강북구", "금천구", "노원구", "중랑구", "도봉구",
)


def compute_change_pct(price_before: int, price_after: int) -> float:
    if price_before <= 0:
        return 0.0
    return round((price_after - price_before) / price_before * 100, 1)


def _won_to_manwon(won: int) -> int:
    """Convert won → 만원 (truncated). 100,000,000원 (1억) → 10,000만원."""
    return won // 10_000


def rows_to_dataset(
    rows: list[tuple[str, int, int, int, int]],
    *,
    title: str,
    subtitle: str,
    period_label: str,
    source: str,
) -> dict[str, Any]:
    """Shape DB rows into the SeoulPriceDataset contract.

    Rows: (district, price_before_won, price_after_won, trades_before, trades_after)
    """
    by_district = {r[0]: r for r in rows}
    districts: list[dict[str, Any]] = []
    for gu in SEOUL_DISTRICTS_ORDER:
        if gu not in by_district:
            continue
        _, price_before, price_after, _, _ = by_district[gu]
        districts.append({
            "district": gu,
            "priceBefore": _won_to_manwon(price_before),
            "priceAfter": _won_to_manwon(price_after),
            "changePct": compute_change_pct(price_before, price_after),
        })

    return {
        "generatedAt": datetime.now(timezone.utc).astimezone().isoformat(),
        "title": title,
        "subtitle": subtitle,
        "periodLabel": period_label,
        "source": source,
        "districts": districts,
    }


def fetch_via_tunnel(
    *,
    ssh_host: str,
    ssh_user: str,
    pg_host: str,
    pg_port: int,
    pg_user: str,
    pg_pass: str,
    pg_db: str,
    sql: str,
    params: dict[str, Any],
) -> list[tuple]:
    """Open SSH tunnel, run SQL with params, return all rows."""
    with SSHTunnelForwarder(
        (ssh_host, 22),
        ssh_username=ssh_user,
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
                cur.execute(sql, params)
                return cur.fetchall()
        finally:
            conn.close()
```

- [ ] **Step 4: Run — expect PASS**

```bash
python -m pytest tests/zipsaja_data_fetch/test_fetch_transforms.py -v
```

Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/zipsaja_data_fetch/fetch.py tests/zipsaja_data_fetch/test_fetch_transforms.py
git commit -m "feat(zipsaja-data-fetch): SSH 터널 + row→dataset 변환 (원→만원 truncation 포함)"
```

---

### Task 7: zipsaja-data-fetch CLI (`__main__.py`)

Standalone CLI for manual invocation / debugging — master skill will call this.

**Files:**
- Create: `scripts/zipsaja_data_fetch/__main__.py`
- Create: `tests/zipsaja_data_fetch/test_cli_args.py`

- [ ] **Step 1: Write the failing test**

File: `tests/zipsaja_data_fetch/test_cli_args.py`

```python
import pytest

from scripts.zipsaja_data_fetch.__main__ import build_parser, merge_cli_overrides


def test_parser_defaults():
    parser = build_parser()
    args = parser.parse_args([])
    assert args.preset == "leejaemyung-before-after"
    assert args.ssh_host == "hh-worker-2"
    assert args.pg_host == "localhost"  # proptech_db is bound to localhost on the SSH host
    assert args.pg_port == 5432
    assert args.pg_user == "proptech"
    assert args.pg_db == "proptech_db"


def test_parser_preset_override():
    parser = build_parser()
    args = parser.parse_args(["--preset", "leejaemyung-before-after"])
    assert args.preset == "leejaemyung-before-after"


def test_parser_requires_title_and_out():
    parser = build_parser()
    args = parser.parse_args([
        "--title", "테스트",
        "--out", "/tmp/out.json",
    ])
    assert args.title == "테스트"
    assert str(args.out) == "/tmp/out.json"


def test_merge_cli_overrides_pivot_date():
    overrides = merge_cli_overrides(pivot_date="2024-01-01", min_total_units=None)
    assert overrides == {"pivot_date": "2024-01-01"}


def test_merge_cli_overrides_min_units():
    overrides = merge_cli_overrides(pivot_date=None, min_total_units=500)
    assert overrides == {"min_total_units": 500}


def test_merge_cli_overrides_both():
    overrides = merge_cli_overrides(pivot_date="2024-01-01", min_total_units=500)
    assert overrides == {"pivot_date": "2024-01-01", "min_total_units": 500}


def test_merge_cli_overrides_neither():
    overrides = merge_cli_overrides(pivot_date=None, min_total_units=None)
    assert overrides == {}
```

- [ ] **Step 2: Run — expect fail**

```bash
python -m pytest tests/zipsaja_data_fetch/test_cli_args.py -v
```

- [ ] **Step 3: Implement __main__.py**

File: `scripts/zipsaja_data_fetch/__main__.py`

```python
"""CLI for zipsaja_data_fetch.

Usage:
  python3 -m scripts.zipsaja_data_fetch \
    --title "이재명 대통령 당선후 서울 실거래 변화" \
    --subtitle "취임 전 12개월 vs 취임 후 ~ 현재" \
    --period "2024.6 ~ 2025.6 vs 2025.6 ~ 현재" \
    --source "국토부 실거래가 (매매)" \
    --out brands/zipsaja/zipsaja_pipeline_leejaemyung-seoul/data.json

Credentials:
  Read from env: PG_PASSWORD (required), or from /opt/proptech/.env on the SSH host
  (master skill can fetch via `ssh hh-worker-2 cat /opt/proptech/.env`).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

from .fetch import fetch_via_tunnel, rows_to_dataset
from .presets import extract_params, get_preset


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="zipsaja_data_fetch",
        description="Fetch zipsaja real-estate dataset from proptech_db via SSH",
    )
    parser.add_argument("--preset", default="leejaemyung-before-after")
    parser.add_argument("--pivot-date", default=None, help="YYYY-MM-DD override for preset")
    parser.add_argument("--min-total-units", type=int, default=None, help="Override complex size filter")
    parser.add_argument("--ssh-host", default="hh-worker-2")
    parser.add_argument("--ssh-user", default="root")
    parser.add_argument("--pg-host", default="localhost")
    parser.add_argument("--pg-port", type=int, default=5432)
    parser.add_argument("--pg-user", default="proptech")
    parser.add_argument("--pg-pass", default=None, help="PG password. Falls back to $PG_PASSWORD env.")
    parser.add_argument("--pg-db", default="proptech_db")
    parser.add_argument("--title", default="이재명 대통령 당선후 서울 실거래 변화")
    parser.add_argument("--subtitle", default="취임 전 12개월 vs 취임 후 ~ 현재")
    parser.add_argument("--period", default="2024.6 ~ 2025.6 vs 2025.6 ~ 현재")
    parser.add_argument("--source", default="국토부 실거래가 (매매)")
    parser.add_argument("--out", type=Path, required=False, help="Output JSON path")
    return parser


def merge_cli_overrides(*, pivot_date: str | None, min_total_units: int | None) -> dict[str, Any]:
    overrides: dict[str, Any] = {}
    if pivot_date is not None:
        overrides["pivot_date"] = pivot_date
    if min_total_units is not None:
        overrides["min_total_units"] = min_total_units
    return overrides


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    pg_pass = args.pg_pass or os.environ.get("PG_PASSWORD")
    if not pg_pass:
        print("ERROR: --pg-pass or $PG_PASSWORD required", file=sys.stderr)
        return 2

    preset = get_preset(args.preset)
    overrides = merge_cli_overrides(pivot_date=args.pivot_date, min_total_units=args.min_total_units)
    params = extract_params(preset, user_overrides=overrides)

    # psycopg2 uses %(name)s placeholders; convert :name → %(name)s
    sql = preset.sql_template
    for key in params:
        sql = sql.replace(f":{key}", f"%({key})s")

    rows = fetch_via_tunnel(
        ssh_host=args.ssh_host,
        ssh_user=args.ssh_user,
        pg_host=args.pg_host,
        pg_port=args.pg_port,
        pg_user=args.pg_user,
        pg_pass=pg_pass,
        pg_db=args.pg_db,
        sql=sql,
        params=params,
    )

    dataset = rows_to_dataset(
        rows,
        title=args.title,
        subtitle=args.subtitle,
        period_label=args.period,
        source=args.source,
    )

    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(dataset, ensure_ascii=False, indent=2))
        print(f"Wrote {len(dataset['districts'])} districts → {args.out}", file=sys.stderr)
    else:
        json.dump(dataset, sys.stdout, ensure_ascii=False, indent=2)
        print()  # trailing newline

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run — expect PASS**

```bash
python -m pytest tests/zipsaja_data_fetch/test_cli_args.py -v
```

Expected: 7 passed.

- [ ] **Step 5: Verify no SQL injection vector (the `replace :name → %(name)s` step is safe because preset keys are whitelisted)**

```bash
python -m pytest tests/zipsaja_data_fetch/ -v
```

Expected: all tests (16 = 8 presets + 6 transforms + 7 cli) pass. Wait, 8+6+7 = 21. Adjust expectation.

- [ ] **Step 6: Commit**

```bash
git add scripts/zipsaja_data_fetch/__main__.py tests/zipsaja_data_fetch/test_cli_args.py
git commit -m "feat(zipsaja-data-fetch): CLI — argparse 인터페이스 + preset/override 머지"
```

---

### Task 8: Pipeline master CLI (`__main__.py`)

Wires everything: parse brand/topic → compute slug → init state → call zipsaja_data_fetch (if brand=zipsaja) → save state.

**Files:**
- Create: `scripts/pipeline/__main__.py`
- Create: `tests/pipeline/test_cli_args.py`

- [ ] **Step 1: Write the failing test**

File: `tests/pipeline/test_cli_args.py`

```python
import pytest

from scripts.pipeline.__main__ import build_parser, compute_pipeline_id


def test_parser_brand_topic_positional():
    parser = build_parser()
    args = parser.parse_args(["zipsaja", "이재명", "당선후", "변화"])
    assert args.brand == "zipsaja"
    assert args.topic == "이재명 당선후 변화"


def test_parser_brand_only_no_topic():
    parser = build_parser()
    args = parser.parse_args(["zipsaja"])
    assert args.brand == "zipsaja"
    assert args.topic == ""


def test_parser_no_args():
    parser = build_parser()
    args = parser.parse_args([])
    assert args.brand is None
    assert args.topic == ""


def test_parser_accepts_preset_flag():
    parser = build_parser()
    args = parser.parse_args(["zipsaja", "test", "--preset", "leejaemyung-before-after"])
    assert args.preset == "leejaemyung-before-after"


def test_compute_pipeline_id_format():
    # zipsaja_YYYYMMDD_slug (date taken from passed datetime to make test deterministic)
    from datetime import datetime, timezone
    dt = datetime(2026, 4, 24, 12, 0, 0, tzinfo=timezone.utc)
    pid = compute_pipeline_id("zipsaja", "test-slug", now=dt)
    assert pid == "zipsaja_20260424_test-slug"
```

- [ ] **Step 2: Run — expect fail**

```bash
python -m pytest tests/pipeline/test_cli_args.py -v
```

- [ ] **Step 3: Implement master __main__.py**

File: `scripts/pipeline/__main__.py`

```python
"""Pipeline master CLI.

Usage:
  python3 -m scripts.pipeline zipsaja 이재명 당선후 서울 실거래 변화

Flow (MVP):
  1. Parse brand + topic
  2. Validate brand
  3. Compute slug + bundle path + pipeline_id
  4. Create PipelineState
  5. If brand needs data fetch → invoke scripts.zipsaja_data_fetch
     Otherwise skip (howzero/braveyong: Plan 2+ will add content generation from topic only)
  6. Save state → brands/{brand}/{brand}_pipeline_{slug}/pipeline-state.json
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from .dispatch import brand_needs_data_fetch, validate_brand
from .paths import bundle_path, make_slug, state_file_path
from .state import PipelineState


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="pipeline",
        description="Brand content pipeline — Phase 1 MVP (master + zipsaja data fetch)",
    )
    parser.add_argument("brand", nargs="?", default=None, help="zipsaja / howzero / braveyong")
    parser.add_argument("topic", nargs="*", help="주제 (공백 허용)")
    parser.add_argument("--preset", default="leejaemyung-before-after")
    parser.add_argument("--pivot-date", default=None)
    parser.add_argument("--min-total-units", type=int, default=None)
    # Post-parse: topic list → space-joined string
    return _TopicJoiningParser(parser)


class _TopicJoiningParser:
    """Wrap argparse to join topic list into a single string."""

    def __init__(self, parser: argparse.ArgumentParser):
        self._parser = parser

    def parse_args(self, argv: list[str] | None = None):
        ns = self._parser.parse_args(argv)
        ns.topic = " ".join(ns.topic) if ns.topic else ""
        return ns


def compute_pipeline_id(brand: str, slug: str, *, now: Optional[datetime] = None) -> str:
    now = now or datetime.now(timezone.utc)
    return f"{brand}_{now.strftime('%Y%m%d')}_{slug}"


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    if not args.brand:
        print("ERROR: brand required (zipsaja / howzero / braveyong)", file=sys.stderr)
        return 2

    validate_brand(args.brand)

    if not args.topic:
        print("ERROR: topic required", file=sys.stderr)
        return 2

    slug = make_slug(args.topic)
    pipeline_id = compute_pipeline_id(args.brand, slug)
    state = PipelineState(
        pipeline_id=pipeline_id,
        brand=args.brand,
        topic=args.topic,
        slug=slug,
        status="pending",
    )

    state_path = state_file_path(args.brand, slug)
    state.save(state_path)
    print(f"[pipeline] state initialized → {state_path}", file=sys.stderr)

    if brand_needs_data_fetch(args.brand):
        print(f"[pipeline] brand={args.brand} → invoking zipsaja_data_fetch", file=sys.stderr)
        data_out = bundle_path(args.brand, slug) / "data.json"
        cmd = [
            sys.executable, "-m", "scripts.zipsaja_data_fetch",
            "--preset", args.preset,
            "--out", str(data_out),
        ]
        if args.pivot_date:
            cmd += ["--pivot-date", args.pivot_date]
        if args.min_total_units is not None:
            cmd += ["--min-total-units", str(args.min_total_units)]

        result = subprocess.run(cmd, check=False)
        if result.returncode != 0:
            state.mark_failed("zipsaja-data-fetch", f"CLI exit {result.returncode}")
            state.save(state_path)
            print(f"[pipeline] zipsaja_data_fetch FAILED ({result.returncode})", file=sys.stderr)
            return result.returncode

        # Load dataset into state.data
        state.data = {
            "source": f"ssh:{os.environ.get('PIPELINE_SSH_HOST', 'hh-worker-2')}/proptech_db",
            "preset": args.preset,
            "dataset": json.loads(data_out.read_text(encoding="utf-8")),
        }
        state.status = "data-ready"
        state.save(state_path)
        print(f"[pipeline] data ready → {len(state.data['dataset']['districts'])} districts", file=sys.stderr)
    else:
        print(f"[pipeline] brand={args.brand} — no data fetch step (Plan 2+ will add content generation)", file=sys.stderr)
        state.status = "data-ready"
        state.save(state_path)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run — expect PASS**

```bash
python -m pytest tests/pipeline/test_cli_args.py -v
```

Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/pipeline/__main__.py tests/pipeline/test_cli_args.py
git commit -m "feat(pipeline): master CLI — brand/topic 파싱 + state 저장 + zipsaja 데이터 페치 위임"
```

---

### Task 9: `/pipeline` skill (SKILL.md)

The skill-level interface visible to Claude Code when the user types `/pipeline` or drops a matching keyword.

**Files:**
- Create: `.claude/skills/pipeline/SKILL.md`

- [ ] **Step 1: Write SKILL.md**

File: `.claude/skills/pipeline/SKILL.md`

```markdown
---
name: pipeline
description: 브랜드 선택 + 주제 입력 → 데이터 수집 (zipsaja만) + pipeline-state.json 생성. content-* 산출물 스킬들의 기반 스킬. 트리거 — `/pipeline`, "파이프라인 돌려", "콘텐츠 생성 시작".
---

# Brand Content Pipeline 마스터 스킬

`/pipeline <brand> <주제>` 진입점. Phase 1 MVP는 zipsaja용 데이터 수집 + 번들 폴더 초기화까지만 수행. 캐러셀·릴스·첨부자료·캡션은 Plan 2+의 content-* 스킬이 같은 번들에 추가로 기록.

## 지원 브랜드

| 브랜드 | 데이터 소스 | 상태 |
|---|---|---|
| zipsaja | SSH hh-worker-2 → proptech_db (real_prices × complexes) | ✅ MVP 지원 |
| howzero | 없음 (주제 텍스트만, 향후 추가) | ⏳ Plan 2+ |
| braveyong | 없음 (주제 텍스트만, 향후 추가) | ⏳ Plan 2+ |

## 사용

```bash
# zipsaja (데이터 자동 페치)
python3 -m scripts.pipeline zipsaja 이재명 당선후 서울 실거래 변화

# howzero/braveyong (데이터 없이 state만 초기화)
python3 -m scripts.pipeline howzero 1인 기업가 시간관리
```

### 옵션

- `--preset <name>` — SQL 프리셋. MVP는 `leejaemyung-before-after` 하나. (default)
- `--pivot-date YYYY-MM-DD` — 프리셋의 기준 날짜 오버라이드.
- `--min-total-units N` — 단지 최소 세대수 (default 300).

## 산출물

```
brands/{brand}/{brand}_pipeline_{slug}/
├── pipeline-state.json   # 상태 + 메타데이터 + data 블록
└── data.json             # zipsaja: 25개 구 dataset (Plan 2 캐러셀이 소비)
```

- `slug`는 주제에서 자동 추출 (공백 → 하이픈, 특수문자 제거, 한글 유지).
- `pipeline-state.json` 은 PipelineState dataclass 직렬화. 실패 시 `status="failed"` + `failed_at` 필드로 재개 가능.

## 환경 변수

- `PG_PASSWORD` — proptech_db 비밀번호. `.env` 파일 없이 쓸 경우 필수.

비밀번호 획득:
```bash
ssh hh-worker-2 'grep DATABASE_URL /opt/proptech/.env'
```

## 제한 사항 (Plan 1)

- ❌ 캐러셀 생성 — Plan 2에서 `content-carousel` 스킬 추가
- ❌ 릴스 mp4 — Plan 3에서 `content-reels`
- ❌ Excel/PDF — Plan 4에서 `content-attachments`
- ❌ 캡션 (IG/Threads/LinkedIn) — Plan 5에서 `content-captions`

Plan 1의 MVP는 **데이터 확보 + 번들 폴더 초기화**까지. 이후 plan들이 같은 번들에 산출물을 덧붙이는 구조.

## 트러블슈팅

| 증상 | 원인 | 대처 |
|---|---|---|
| `ERROR: --pg-pass or $PG_PASSWORD required` | 비밀번호 미제공 | `export PG_PASSWORD=<from ssh hh-worker-2>` |
| `Unknown brand 'mkt'` | 지원 목록 외 | zipsaja/howzero/braveyong 중 선택 |
| SSH tunnel 타임아웃 | hh-worker-2 접속 실패 | `ssh hh-worker-2 hostname` 먼저 테스트 |
| `unknown preset` | 잘못된 프리셋 이름 | Plan 1은 `leejaemyung-before-after` 하나만 |

## 관련 문서

- 설계 문서: [docs/superpowers/specs/2026-04-24-brand-content-pipeline-design.md](../../../docs/superpowers/specs/2026-04-24-brand-content-pipeline-design.md)
- 구현 계획: [docs/superpowers/plans/2026-04-24-pipeline-mvp.md](../../../docs/superpowers/plans/2026-04-24-pipeline-mvp.md)
- AGENTS.md §8 — 파이프라인 브랜드×데이터 소스 매핑
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/pipeline/SKILL.md
git commit -m "docs(pipeline): /pipeline 스킬 SKILL.md — MVP 사용법 + 지원 브랜드"
```

---

### Task 10: `zipsaja-data-fetch` skill (SKILL.md)

Independent skill doc so the fetcher can be invoked standalone (for debugging, re-runs).

**Files:**
- Create: `.claude/skills/zipsaja-data-fetch/SKILL.md`

- [ ] **Step 1: Write SKILL.md**

File: `.claude/skills/zipsaja-data-fetch/SKILL.md`

```markdown
---
name: zipsaja-data-fetch
description: zipsaja 브랜드 전용 부동산 실거래가 데이터 페치 스킬. SSH → hh-worker-2 → proptech_db (real_prices × complexes) 쿼리 후 JSON 출력. /pipeline 스킬의 zipsaja 분기에서 자동 호출되지만, 단독 실행도 가능.
---

# zipsaja Data Fetch 스킬

SSH 터널로 `hh-worker-2` → PostgreSQL `proptech_db` 접속해 서울 25개 구 × 300세대 이상 아파트의 매매가 집계 데이터를 JSON으로 출력.

## 데이터 소스 (고정)

| 항목 | 값 |
|---|---|
| SSH alias | `hh-worker-2` (151.245.106.86, root) |
| DB | `postgresql://proptech@localhost:5432/proptech_db` |
| Password | `/opt/proptech/.env` 의 DATABASE_URL 참조 |
| 주요 테이블 | `real_prices` (2.4M rows) × `complexes` (1377 rows) |

## SQL 프리셋

| 프리셋 | 설명 | 파라미터 |
|---|---|---|
| `leejaemyung-before-after` | 취임 전 12개월 vs 취임 후 현재 평균가 비교 | `pivot_date` (default 2025-06-04), `min_total_units` (default 300) |

Plan 2+에서 `weekly-rate`, `custom-period` 프리셋 추가 예정.

## 사용

```bash
# 기본 (leejaemyung-before-after, default 파라미터)
export PG_PASSWORD=<from ssh hh-worker-2 cat /opt/proptech/.env>
python3 -m scripts.zipsaja_data_fetch \
  --out brands/zipsaja/zipsaja_pipeline_leejaemyung-seoul/data.json

# 기준일 변경
python3 -m scripts.zipsaja_data_fetch \
  --pivot-date 2024-01-01 \
  --title "2024년 vs 2026년 서울 실거래 변화" \
  --out brands/zipsaja/zipsaja_pipeline_2024-vs-now/data.json

# 세대수 필터 변경 (500세대 이상)
python3 -m scripts.zipsaja_data_fetch --min-total-units 500 \
  --out brands/zipsaja/zipsaja_pipeline_500plus/data.json
```

## 출력 스키마

```json
{
  "generatedAt": "2026-04-24T12:00:00+09:00",
  "title": "...",
  "subtitle": "...",
  "periodLabel": "...",
  "source": "국토부 실거래가 (매매)",
  "districts": [
    {
      "district": "광진구",
      "priceBefore": 144870,
      "priceAfter": 169973,
      "changePct": 17.3
    }
  ]
}
```

- `priceBefore` / `priceAfter` 단위: **만원** (원 → 만원 truncated, ex: 1억 7천만원 = 17000).
- `changePct` 소수점 1자리.
- `districts` 는 항상 SEOUL_DISTRICTS_ORDER 순서 (서초구부터 도봉구).

## 관련 파일

- `scripts/zipsaja_data_fetch/presets.py` — 프리셋 레지스트리
- `scripts/zipsaja_data_fetch/presets_sql/leejaemyung_before_after.sql` — SQL 템플릿
- `scripts/zipsaja_data_fetch/fetch.py` — SSH 터널 + row→dataset 변환

## 구 `scripts/zipsaja_seoul_prices` 와의 관계

**완전 교체**. 구 모듈은 잘못된 인프라(batch_server + bulsaja_analytics + 존재하지 않는 view `zipsaja_seoul_gu_price_compare`)를 참조하여 작동 불가. 이 스킬이 후속.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/zipsaja-data-fetch/SKILL.md
git commit -m "docs(zipsaja-data-fetch): 스킬 문서 — 데이터 소스·프리셋·스키마 명세"
```

---

### Task 11: End-to-end integration smoke test (live DB)

Validates the entire Plan 1 MVP against the real `proptech_db` on `hh-worker-2`. This is not a pytest — it's a shell smoke test documented so the operator can verify manually.

**Files:** (test output only, no new files)

- [ ] **Step 1: Verify SSH reachability**

```bash
ssh -o ConnectTimeout=10 hh-worker-2 'hostname && echo OK'
```

Expected: `hh-worker-2` followed by `OK`.

- [ ] **Step 2: Fetch password**

```bash
export PG_PASSWORD=$(ssh hh-worker-2 'grep DATABASE_URL /opt/proptech/.env' | sed -E 's|.*://proptech:([^@]+)@.*|\1|')
echo "pg_pass prefix: ${PG_PASSWORD:0:4}***"
```

Expected: password prefix visible (not empty).

- [ ] **Step 3: Install deps**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
pip install 'psycopg2-binary>=2.9' 'sshtunnel>=0.4.0'
```

Expected: already installed from earlier Task 1 removal / prior work. If not, installs cleanly.

- [ ] **Step 4: Standalone fetch run**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
python3 -m scripts.zipsaja_data_fetch \
  --title "이재명 대통령 당선후 서울 실거래 변화" \
  --out /tmp/pipeline-smoke.json
cat /tmp/pipeline-smoke.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'districts={len(d[\"districts\"])}'); print(f'top: {d[\"districts\"][0]}'); print(f'avg change: {sum(x[\"changePct\"] for x in d[\"districts\"])/len(d[\"districts\"]):.1f}%')"
```

Expected:
```
districts=25
top: {'district': '서초구', 'priceBefore': ..., 'priceAfter': ..., 'changePct': ...}
avg change: X.Y%
```

If `districts != 25`, investigate (SQL filter, DB state). If error mentions SSH/auth, revisit Task 7 `__main__.py` defaults.

- [ ] **Step 5: Full pipeline run**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
python3 -m scripts.pipeline zipsaja 이재명 당선후 서울 실거래 변화
ls -la brands/zipsaja/zipsaja_pipeline_이재명-당선후-서울-실거래-변화/
cat brands/zipsaja/zipsaja_pipeline_이재명-당선후-서울-실거래-변화/pipeline-state.json | python3 -c "import json,sys; s=json.load(sys.stdin); print('status:', s['status']); print('data preset:', s['data']['preset'] if s.get('data') else None); print('districts:', len(s['data']['dataset']['districts']) if s.get('data') else 0)"
```

Expected:
- Directory exists with `pipeline-state.json` + `data.json`
- `status: data-ready`
- `data preset: leejaemyung-before-after`
- `districts: 25`

- [ ] **Step 6: Report result**

No commit. Paste the output above into the final handoff message. If any step fails, file a fix task for the offending step and re-run Task 11 after the fix.

---

### Task 12: AGENTS.md updates — §3 type table + §8 pipeline section

**Files:**
- Modify: `AGENTS.md` (append `pipeline` row to §3 table; add new §8)

- [ ] **Step 1: Add `pipeline` row to §3 table**

Find the type table in `AGENTS.md` §3 (around lines 66-76 of current file). Append new row after `misc`:

```markdown
| `pipeline` | 통합 산출물 bundle (data.json + carousel + reels + attachments + captions) | `zipsaja_pipeline_leejaemyung-seoul` |
```

- [ ] **Step 2: Add new §8 section**

After current §7 "참고 문서" section, insert:

```markdown
---

## 8. 콘텐츠 파이프라인 (`/pipeline`)

주제 입력 → 브랜드별 데이터 수집 → 통합 번들 생성.

### 브랜드 × 데이터 소스 매핑

| 브랜드 | 데이터 소스 | 상태 |
|---|---|---|
| **zipsaja** | SSH `hh-worker-2` → `proptech_db` (real_prices × complexes) | **필수** (Plan 1 MVP 구현) |
| **howzero** | 없음 (주제 텍스트만) | TBD — Plan 2+에서 데이터 소스 확정 시 매핑 추가 |
| **braveyong** | 없음 (주제 텍스트만) | TBD — 동일 |

### zipsaja SSH 접속 (고정)

- SSH alias: `hh-worker-2` (151.245.106.86, root) — **batch_server 아님**
- DB: `postgresql://proptech@localhost:5432/proptech_db`
- Password: `/opt/proptech/.env` 의 DATABASE_URL 참조
- 주요 테이블: `real_prices` (2.4M rows, trade_type A1 = 매매) × `complexes` (1377 rows, total_units + gu)
- 비밀번호 획득: `ssh hh-worker-2 'grep DATABASE_URL /opt/proptech/.env'`

### 사용

```bash
# zipsaja — 데이터 자동 페치
python3 -m scripts.pipeline zipsaja 이재명 당선후 서울 실거래 변화

# howzero/braveyong — 데이터 없이 state만
python3 -m scripts.pipeline howzero 1인 기업가 시간관리
```

### 산출물 위치

`brands/{brand}/{brand}_pipeline_{slug}/` — Plan 1 MVP는 `pipeline-state.json` + `data.json`까지. Plan 2+는 같은 번들에 carousel·reels·attachments·captions 추가.

### 관련 스킬

- `/pipeline` — 마스터 스킬 (`.claude/skills/pipeline/`)
- `/zipsaja-data-fetch` — zipsaja 데이터 페처 (`.claude/skills/zipsaja-data-fetch/`)

### 참고 문서

- 설계: [docs/superpowers/specs/2026-04-24-brand-content-pipeline-design.md](docs/superpowers/specs/2026-04-24-brand-content-pipeline-design.md)
- Plan 1 MVP: [docs/superpowers/plans/2026-04-24-pipeline-mvp.md](docs/superpowers/plans/2026-04-24-pipeline-mvp.md)
```

- [ ] **Step 3: Verify AGENTS.md still parses (pure markdown, just preview)**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
head -5 AGENTS.md
wc -l AGENTS.md
# Expected: ~200+ lines now (was 154)
```

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md
git commit -m "docs(agents): §3에 pipeline 타입 추가 + §8 브랜드×데이터 소스 매핑 추가"
```

---

## Self-Review Checklist (작성자 본인)

**Spec coverage:**
- ✅ §3 Skill Decomposition: Task 2-8 cover `pipeline` master + `zipsaja-data-fetch`. `content-carousel/reels/attachments/captions` 는 §9 Plan 2+ 로 분리 (명시).
- ✅ §4 Interactive Checkpoints: Plan 1은 batch-only (master CLI가 한 번에 실행). 대화형 체크포인트는 Plan 2+ (content-* 스킬이 생긴 뒤).
- ✅ §5 Pipeline State JSON: Task 2 PipelineState dataclass가 spec의 키 구조 (pipeline_id, brand, topic, slug, status, failed_at, data, artifacts) 구현.
- ✅ §6 Output File Convention: Task 3 bundle_path + Task 8 마스터가 직접 쓰기. `/brands-organize` 우회 (spec 지시대로).
- ✅ §7 AGENTS.md Additions: Task 12 에서 §3 + §8 추가.
- ✅ §8 Error Handling: Task 2 `mark_failed()` + Task 8 마스터의 subprocess 결과 체크.
- ✅ §9 Out of Scope: 그대로. Plan 1은 MVP만.
- ✅ §10 Skill Priority: Plan 1 = #1 + #2 (pipeline 마스터 + zipsaja-data-fetch). content-* 는 별도 plan.
- ✅ §11 Open Questions: failedAt 필드만 MVP에 구현, 추가 필드는 Plan 2+ 여부 판단 가능 상태 남김.

**Placeholder scan:** 없음. 모든 step에 완전 코드 제공.

**Type consistency:**
- `PipelineState.data` 블록 — Task 8에서 `{source, preset, dataset}` 저장. Task 11 통합 테스트가 이 구조 검증.
- `dataset.districts[].priceBefore/priceAfter/changePct` — Task 6 `rows_to_dataset` 가 생성, Task 8이 소비.
- `SEOUL_DISTRICTS_ORDER` — Task 6에 25개 정의, Task 11 smoke test 로 25개 확인.
- `get_preset()` / `extract_params()` 서명 — Task 5에서 정의, Task 7 CLI가 소비.

---

## Execution Handoff

Plan saved to `docs/superpowers/plans/2026-04-24-pipeline-mvp.md`.

**후속 Plan:**
- Plan 2: `content-carousel` + `/carousel` Text-mode 변환 레이어
- Plan 3: `content-reels` (기존 `/reels` 얇은 래퍼)
- Plan 4: `content-attachments` (Excel + PDF)
- Plan 5: `content-captions` (IG/Threads/LinkedIn 3종)

각 후속 plan은 이 MVP 완료 후 별도 brainstorm → spec → plan 사이클로 진행.
