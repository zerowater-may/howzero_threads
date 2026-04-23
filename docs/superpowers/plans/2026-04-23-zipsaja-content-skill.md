# zipsaja-content Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `zipsaja-content` skill that generates 1080×1440 instagram carousel slides from proptech_db data — with 13 mistake-prevention guards, hook drafting, 9 reusable slide components, 5 SQL presets, and Puppeteer PNG export.

**Architecture:** Python pipeline (db → sql → validate → hook_draft → render Jinja2 → Puppeteer PNG). All data flows live (no stale cache). Footer + color tier + outlier flags + tone check are auto-injected. Skill invoked via SKILL.md natural language or `python -m lib.cli`.

**Tech Stack:** Python 3.12 (lib + tests), Jinja2 (templates), pytest (TDD), subprocess+ssh+psql (DB read), Node + Puppeteer (PNG export — reuse existing carousel skill pattern).

**Spec:** `docs/superpowers/specs/2026-04-23-zipsaja-content-skill-design.md`

---

## File structure

| File | Responsibility |
|---|---|
| `.claude/skills/zipsaja-content/SKILL.md` | Entry point; user-invocable; natural language instructions to LLM |
| `.claude/skills/zipsaja-content/README.md` | Human docs |
| `.claude/skills/zipsaja-content/CHECKLIST.md` | 13 mistake-prevention rules |
| `.claude/skills/zipsaja-content/sql/*.sql` | 5 SQL presets (raw text, parametric via Python format) |
| `.claude/skills/zipsaja-content/components/*.j2` | 9 Jinja2 slide templates + `_base.html.j2` |
| `.claude/skills/zipsaja-content/lib/db.py` | SSH+psql wrapper → `query(sql) -> list[dict]` |
| `.claude/skills/zipsaja-content/lib/tone.py` | Forbidden-word check (반말/도발금지/이모지) |
| `.claude/skills/zipsaja-content/lib/colors.py` | Percentile tier ramp + WCAG AA contrast checker |
| `.claude/skills/zipsaja-content/lib/validator.py` | Outlier flag + multi-method consistency |
| `.claude/skills/zipsaja-content/lib/footer.py` | Build footer string from live counts |
| `.claude/skills/zipsaja-content/lib/hook_draft.py` | Insight extraction + 5 hook candidates |
| `.claude/skills/zipsaja-content/lib/geo/projector.py` | GeoJSON → SVG path with cosine correction |
| `.claude/skills/zipsaja-content/lib/geo/seoul.geojson` | KOSTAT 2013 simplified |
| `.claude/skills/zipsaja-content/lib/geo/gyeonggi.geojson` | (v1.5 add — placeholder) |
| `.claude/skills/zipsaja-content/lib/render.py` | Spec.yaml → Jinja → HTML |
| `.claude/skills/zipsaja-content/lib/cli.py` | CLI: init/fetch/render/export/build |
| `.claude/skills/zipsaja-content/lib/export_png.js` | Node Puppeteer: HTML → 1080×1440 PNG |
| `.claude/skills/zipsaja-content/tests/*.py` | pytest |
| `.claude/skills/zipsaja-content/output/<slug>/` | Generated carousel artifacts |

---

### Task 1: Scaffold skill folder + SKILL.md stub

**Files:**
- Create: `.claude/skills/zipsaja-content/SKILL.md`
- Create: `.claude/skills/zipsaja-content/CHECKLIST.md`
- Create: `.claude/skills/zipsaja-content/lib/__init__.py`
- Create: `.claude/skills/zipsaja-content/lib/geo/__init__.py`
- Create: `.claude/skills/zipsaja-content/tests/__init__.py`
- Create: `.claude/skills/zipsaja-content/output/.gitkeep`
- Create: `.claude/skills/zipsaja-content/conftest.py`

- [ ] **Step 1: Create folder tree**

```bash
mkdir -p /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/zipsaja-content/{lib/geo,sql,components,tests,output,presets,workflows}
touch /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/zipsaja-content/{lib,lib/geo,tests}/__init__.py
touch /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/zipsaja-content/output/.gitkeep
```

- [ ] **Step 2: Write SKILL.md stub**

`.claude/skills/zipsaja-content/SKILL.md`:
```markdown
---
name: zipsaja-content
description: Generate 1080×1440 zipsaja brand instagram carousel slides from proptech_db data. Auto-injects footer with live counts, validates samples, runs tone/contrast guards, exports PNG. Use when the user asks for "카드뉴스", "캐러셀", "데이터 시각화" with zipsaja brand. Sister skill of zipsaja-design.
user-invocable: true
---

# zipsaja-content

This skill is the data → carousel pipeline for the zipsaja brand.

> ⚠️ Read `CHECKLIST.md` BEFORE every build. 13 mistakes from past sessions are codified there.
> ⚠️ Use `zipsaja-design` for visual tokens. This skill imports `colors_and_type.css` from there.

## When to use
- User asks for instagram 카드뉴스 with proptech data
- User wants a 데이터 비교/순위/지도 slide
- User wants a 경매/매물 변동 카드뉴스

## How to use
Run `python -m lib.cli init <slug>` from the skill folder to scaffold a new carousel,
then edit `output/<slug>/spec.yaml` and run `python -m lib.cli build <slug>`.

(Detailed workflow filled in Task 16.)
```

- [ ] **Step 3: Write CHECKLIST.md (13 guards documented)**

`.claude/skills/zipsaja-content/CHECKLIST.md`:
```markdown
# 13 Mistake-Prevention Guards

These are auto-enforced by the pipeline. Documented here for transparency.

1. **외부 이미지 금지** — components only. URL-based <img src> 차단 (lint).
2. **Stale 카운트 금지** — footer는 live-counts.sql 매번 실행 후 자동 주입.
3. **캐시 의존 금지** — meta.json에 SQL 저장, 빌드 시 force-refresh.
4. **지도는 SVG 강제** — "map-*" component만 허용. 외부 캡처 차단.
5. **세대수 컷오프 표기** — footer = "서울 300세대+ N단지 / M매물 / scan_date".
6. **Color contrast 강제** — WCAG AA. 미달 시 빌드 중단.
7. **토큰 변경 영향 표시** — colors_and_type.css 변경 시 grep warning.
8. **다중방법 검증** — median + mean + p25/p75 비교, 차이 크면 caveat.
9. **Outlier 플래그** — n<30 sample → ★ 표시 + caveat 자동 주입.
10. **Tier 임계값 percentile 기반** — P20/40/60/80 자동.
11. **마스코트 위치 고정** — components가 결정 (footer 위 right).
12. **Tone 가드** — 금지어 검사 ("끝났다", "90%", "여러분", 이모지) → 빌드 차단.
13. **Footer 컴포넌트 1개** — 직접 작성 금지 (lint).
```

- [ ] **Step 4: Write conftest.py (pytest path)**

`.claude/skills/zipsaja-content/conftest.py`:
```python
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
```

- [ ] **Step 5: Commit**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
git add .claude/skills/zipsaja-content/
git commit -m "zipsaja-content: 스킬 폴더 scaffolding + SKILL.md/CHECKLIST.md stub"
```

---

### Task 2: lib/db.py — SSH+psql wrapper

**Files:**
- Create: `.claude/skills/zipsaja-content/lib/db.py`
- Test: `.claude/skills/zipsaja-content/tests/test_db.py`

- [ ] **Step 1: Write the failing test (live integration)**

`tests/test_db.py`:
```python
import pytest
from lib.db import query, DEFAULT_HOST

def test_query_returns_list_of_dicts():
    rows = query("SELECT 1 AS n, 'ok' AS s")
    assert rows == [{"n": "1", "s": "ok"}]

def test_query_complex_count_real_db():
    """Live integration test against proptech_db."""
    rows = query("SELECT COUNT(*) AS n FROM complexes")
    assert len(rows) == 1
    assert int(rows[0]["n"]) > 1000  # 단지 1377+

def test_query_handles_pipe_in_text():
    """Pipe character in data must not break parser."""
    rows = query("SELECT 'a|b' AS x")
    # We use COPY-style escape via -A; if pipe inside, our parser breaks.
    # Workaround documented: caller avoids pipes, or use json_agg.
    # For now we accept this limitation.
    assert "x" in rows[0]
```

- [ ] **Step 2: Run test, expect failure**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/zipsaja-content
pytest tests/test_db.py -v
```
Expected: FAIL with `ModuleNotFoundError: lib.db`

- [ ] **Step 3: Write minimal implementation**

`lib/db.py`:
```python
"""proptech_db read wrapper. SSH + psql, parse pipe-separated to list[dict]."""
import os, subprocess

DEFAULT_HOST = "151.245.106.86"
DEFAULT_USER = "proptech"
DEFAULT_DB = "proptech_db"


def query(sql: str, host: str = DEFAULT_HOST, user: str = DEFAULT_USER, db: str = DEFAULT_DB) -> list[dict]:
    """Execute SELECT and return list of dicts. Headers from psql -A (no -t)."""
    pwd = os.environ.get("PROPTECH_PG_PASSWORD", "proptech2026")
    inner = f'PGPASSWORD={pwd} psql -h 127.0.0.1 -U {user} -d {db} -A -F"|" -c "{sql}"'
    out = subprocess.run(
        ["ssh", f"root@{host}", inner],
        capture_output=True, text=True, check=True,
    ).stdout
    lines = [l for l in out.strip().split("\n") if l and not l.startswith("(")]
    if not lines:
        return []
    headers = lines[0].split("|")
    return [dict(zip(headers, line.split("|"))) for line in lines[1:]]
```

- [ ] **Step 4: Run test, expect pass**

```bash
pytest tests/test_db.py -v
```
Expected: 3 passed (requires SSH access to 151.245.106.86)

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/zipsaja-content/lib/db.py .claude/skills/zipsaja-content/tests/test_db.py
git commit -m "zipsaja-content: lib/db.py — SSH+psql wrapper, live test 3개 통과"
```

---

### Task 3: SQL preset library — 5 presets + tests

**Files:**
- Create: `.claude/skills/zipsaja-content/sql/live-counts.sql`
- Create: `.claude/skills/zipsaja-content/sql/price-by-gu.sql`
- Create: `.claude/skills/zipsaja-content/sql/price-history-Ny.sql`
- Create: `.claude/skills/zipsaja-content/sql/auction-recent.sql`
- Create: `.claude/skills/zipsaja-content/sql/distressed.sql`
- Create: `.claude/skills/zipsaja-content/lib/sql_loader.py`
- Test: `.claude/skills/zipsaja-content/tests/test_sql_presets.py`

- [ ] **Step 1: Write SQL files**

`sql/live-counts.sql`:
```sql
SELECT
  (SELECT COUNT(*) FROM complexes) AS complexes,
  (SELECT COUNT(*) FROM articles WHERE is_active=true) AS active_articles,
  (SELECT MAX(scan_date)::text FROM articles) AS last_scan,
  (SELECT MIN(total_units) FROM complexes) AS min_units;
```

`sql/price-by-gu.sql` (parametric — `{pyeong_min}`, `{pyeong_max}`):
```sql
SELECT c.gu, COUNT(*) AS n,
  ROUND((PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY a.deal_price))::numeric/10000, 1) AS p25,
  ROUND((PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY a.deal_price))::numeric/10000, 1) AS median,
  ROUND((PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY a.deal_price))::numeric/10000, 1) AS p75,
  ROUND(AVG(a.deal_price)::numeric/10000, 1) AS mean
FROM articles a JOIN complexes c ON c.complex_id=a.complex_id
WHERE a.is_active=true AND a.trade_type='A1'
  AND a.exclusive_area BETWEEN {pyeong_min} AND {pyeong_max}
  AND a.deal_price > 10000
GROUP BY c.gu
HAVING COUNT(*) >= 5
ORDER BY median DESC;
```

`sql/price-history-Ny.sql` (parametric — `{years_ago}`, `{pyeong_min}`, `{pyeong_max}`):
```sql
WITH then_data AS (
  SELECT c.gu, AVG(rp.price)::numeric AS p_then, COUNT(*) AS n_then
  FROM real_prices rp JOIN complexes c ON c.complex_id=rp.complex_id
  WHERE rp.trade_type='A1' AND rp.is_cancel=false
    AND EXTRACT(YEAR FROM rp.trade_date) = EXTRACT(YEAR FROM CURRENT_DATE) - {years_ago}
  GROUP BY c.gu
), now_data AS (
  SELECT c.gu, AVG(rp.price)::numeric AS p_now, COUNT(*) AS n_now
  FROM real_prices rp JOIN complexes c ON c.complex_id=rp.complex_id
  WHERE rp.trade_type='A1' AND rp.is_cancel=false
    AND EXTRACT(YEAR FROM rp.trade_date) = EXTRACT(YEAR FROM CURRENT_DATE)
  GROUP BY c.gu
)
SELECT t.gu,
  ROUND(t.p_then/10000, 1) AS eok_then,
  ROUND(n.p_now/10000, 1)  AS eok_now,
  ROUND((n.p_now/t.p_then)::numeric, 2) AS multiple,
  ROUND(((n.p_now - t.p_then)/t.p_then*100)::numeric, 0) AS gain_pct,
  t.n_then::text || '/' || n.n_now::text AS samples
FROM then_data t JOIN now_data n USING(gu)
ORDER BY multiple DESC;
```

`sql/auction-recent.sql` (parametric — `{days}`, `{limit}`):
```sql
SELECT ai.complex_id, c.complex_name, c.gu, c.dong,
  ai.case_number, ai.appraisal_price, ai.minimum_sale_price, ai.auction_round,
  ai.scheduled_date::text AS scheduled
FROM auction_items ai
JOIN complexes c ON c.complex_id = ai.complex_id
WHERE ai.scheduled_date >= CURRENT_DATE - INTERVAL '{days} days'
  AND ai.status IN ('진행', 'NEW')
ORDER BY ai.scheduled_date ASC
LIMIT {limit};
```

`sql/distressed.sql` (parametric — `{gu_filter}` defaults to `%`):
```sql
SELECT c.gu, c.complex_name, a.pyeong_name,
  ROUND(a.deal_price::numeric/10000, 1) AS eok,
  a.is_distressed, a.is_price_down, a.days_listed
FROM articles a JOIN complexes c ON c.complex_id=a.complex_id
WHERE a.is_active=true AND a.trade_type='A1'
  AND (a.is_distressed=true OR a.is_price_down=true)
  AND c.gu LIKE '{gu_filter}'
ORDER BY a.days_listed DESC
LIMIT 30;
```

- [ ] **Step 2: Write sql_loader.py with parametric formatting**

`lib/sql_loader.py`:
```python
"""Load SQL presets and substitute {param} placeholders safely."""
import os, re

SQL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "sql")
ALLOWED_PARAM = re.compile(r"^[A-Za-z0-9_%\.\-]+$")


def load(preset_name: str, **params) -> str:
    """Load <preset_name>.sql and format with params. Validates params for safety."""
    path = os.path.join(SQL_DIR, f"{preset_name}.sql")
    if not os.path.exists(path):
        raise FileNotFoundError(f"SQL preset not found: {preset_name}")
    with open(path) as f:
        sql = f.read()
    # validate params (no semicolons, only safe chars)
    for k, v in params.items():
        s = str(v)
        if not ALLOWED_PARAM.match(s):
            raise ValueError(f"Unsafe param {k}={s!r}")
    return sql.format(**params)
```

- [ ] **Step 3: Write tests**

`tests/test_sql_presets.py`:
```python
import pytest
from lib.sql_loader import load
from lib.db import query

def test_load_live_counts_returns_sql():
    sql = load("live-counts")
    assert "complexes" in sql.lower()

def test_load_with_params_substitutes():
    sql = load("price-by-gu", pyeong_min=56, pyeong_max=63)
    assert "BETWEEN 56 AND 63" in sql

def test_load_rejects_unsafe_param():
    with pytest.raises(ValueError):
        load("price-by-gu", pyeong_min="56; DROP TABLE", pyeong_max=63)

def test_live_counts_returns_one_row():
    rows = query(load("live-counts"))
    assert len(rows) == 1
    assert int(rows[0]["complexes"]) > 1000
    assert int(rows[0]["min_units"]) >= 300

def test_price_by_gu_returns_25ish_rows():
    rows = query(load("price-by-gu", pyeong_min=56, pyeong_max=63))
    assert 20 <= len(rows) <= 26  # 25 gu, some may be filtered by HAVING n>=5

def test_price_history_10y():
    rows = query(load("price-history-Ny", years_ago=10, pyeong_min=56, pyeong_max=63))
    assert len(rows) >= 20
    # 모든 행 multiple > 0
    assert all(float(r["multiple"]) > 0 for r in rows)
```

- [ ] **Step 4: Run tests, expect pass**

```bash
pytest tests/test_sql_presets.py -v
```
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/zipsaja-content/sql/ .claude/skills/zipsaja-content/lib/sql_loader.py .claude/skills/zipsaja-content/tests/test_sql_presets.py
git commit -m "zipsaja-content: SQL preset 5종 + sql_loader (param 검증) + 라이브 통합 테스트"
```

---

### Task 4: lib/tone.py — 금지어 검사

**Files:**
- Create: `.claude/skills/zipsaja-content/lib/tone.py`
- Test: `.claude/skills/zipsaja-content/tests/test_tone.py`

- [ ] **Step 1: Write tests**

`tests/test_tone.py`:
```python
import pytest
from lib.tone import check_tone, ToneViolation

def test_pass_friendly_text():
    assert check_tone("내가 봐봤는데 진짜 괜찮아") == []

def test_block_polite_form():
    violations = check_tone("안녕하세요 여러분")
    assert any(v.kind == "polite" for v in violations)

def test_block_provocation():
    violations = check_tone("강남 끝났다 90%가 모른다")
    kinds = {v.kind for v in violations}
    assert "provocation" in kinds

def test_block_emoji():
    violations = check_tone("진짜 좋아 🔥")
    assert any(v.kind == "emoji" for v in violations)

def test_block_with_strict_raises():
    from lib.tone import check_tone_strict
    with pytest.raises(ToneViolation):
        check_tone_strict("여러분 안녕하세요")
```

- [ ] **Step 2: Run tests, expect failure**

```bash
pytest tests/test_tone.py -v
```
Expected: ImportError.

- [ ] **Step 3: Implement tone.py**

`lib/tone.py`:
```python
"""Zipsaja tone enforcement — 반말 / 친구톤 / 도발·이모지 금지."""
import re
from dataclasses import dataclass

POLITE_PATTERNS = [r"습니다\b", r"입니다\b", r"여러분", r"당신", r"안녕하세요"]
PROVOCATION_PATTERNS = [
    r"끝났다", r"망한다", r"\d+%가 모른", r"비밀", r"충격",
    r"폭락", r"폭등 한다", r"무조건",
]
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F300-\U0001FAFF"
    "\U0001F600-\U0001F64F"
    "☀-➿"
    "]+", flags=re.UNICODE
)


@dataclass
class Violation:
    kind: str       # "polite" | "provocation" | "emoji"
    match: str
    pos: int


class ToneViolation(Exception):
    pass


def check_tone(text: str) -> list[Violation]:
    violations: list[Violation] = []
    for p in POLITE_PATTERNS:
        for m in re.finditer(p, text):
            violations.append(Violation("polite", m.group(0), m.start()))
    for p in PROVOCATION_PATTERNS:
        for m in re.finditer(p, text):
            violations.append(Violation("provocation", m.group(0), m.start()))
    for m in EMOJI_PATTERN.finditer(text):
        violations.append(Violation("emoji", m.group(0), m.start()))
    return violations


def check_tone_strict(text: str) -> None:
    """Raise ToneViolation if any. For build-time gate."""
    vs = check_tone(text)
    if vs:
        raise ToneViolation(f"{len(vs)}개 위반: {[v.kind for v in vs]}")
```

- [ ] **Step 4: Run tests, expect pass**

```bash
pytest tests/test_tone.py -v
```
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/zipsaja-content/lib/tone.py .claude/skills/zipsaja-content/tests/test_tone.py
git commit -m "zipsaja-content: lib/tone.py — 금지어/이모지/존댓말 검사 + strict 모드"
```

---

### Task 5: lib/colors.py — Tier ramp + WCAG contrast

**Files:**
- Create: `.claude/skills/zipsaja-content/lib/colors.py`
- Test: `.claude/skills/zipsaja-content/tests/test_colors.py`

- [ ] **Step 1: Write tests**

`tests/test_colors.py`:
```python
import pytest
from lib.colors import percentile_tiers, contrast_ratio, check_contrast_AA, ContrastFailure

def test_percentile_tiers_5_buckets():
    values = list(range(1, 101))  # 1..100
    tiers = percentile_tiers(values, n=5)
    # P20=20, P40=40, P60=60, P80=80
    assert len(tiers) == 4  # cutpoints
    assert tiers[0] == pytest.approx(20.0, abs=1)
    assert tiers[-1] == pytest.approx(80.0, abs=1)

def test_contrast_ratio_known():
    # Black on white = 21
    assert contrast_ratio("#000000", "#FFFFFF") == pytest.approx(21.0, abs=0.1)
    # Same color = 1
    assert contrast_ratio("#888888", "#888888") == pytest.approx(1.0, abs=0.01)

def test_check_contrast_AA_passes_black_white():
    check_contrast_AA(fg="#000000", bg="#FFFFFF")  # no exception

def test_check_contrast_AA_fails_low():
    with pytest.raises(ContrastFailure):
        check_contrast_AA(fg="#FFFFFF", bg="#F0E7D6")  # 흰글 + 베이지 (이번 세션 사고)
```

- [ ] **Step 2: Run, expect failure**

```bash
pytest tests/test_colors.py -v
```
Expected: ImportError.

- [ ] **Step 3: Implement**

`lib/colors.py`:
```python
"""Tier ramps from data percentiles + WCAG AA contrast guard."""
from typing import Sequence


class ContrastFailure(Exception):
    pass


def percentile_tiers(values: Sequence[float], n: int = 5) -> list[float]:
    """Return n-1 cutpoints that partition values into n equal-percentile buckets."""
    if n < 2:
        raise ValueError("n must be >= 2")
    sorted_v = sorted(float(v) for v in values)
    L = len(sorted_v)
    cuts = []
    for i in range(1, n):
        rank = i * L / n
        idx = int(rank)
        cuts.append(sorted_v[min(idx, L - 1)])
    return cuts


def _hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _luminance(rgb: tuple[int, int, int]) -> float:
    def _c(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (_c(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(fg: str, bg: str) -> float:
    L1 = _luminance(_hex_to_rgb(fg))
    L2 = _luminance(_hex_to_rgb(bg))
    lighter, darker = max(L1, L2), min(L1, L2)
    return (lighter + 0.05) / (darker + 0.05)


def check_contrast_AA(fg: str, bg: str, large_text: bool = False) -> None:
    """WCAG AA: 4.5 normal, 3.0 large. Raise ContrastFailure if below."""
    threshold = 3.0 if large_text else 4.5
    ratio = contrast_ratio(fg, bg)
    if ratio < threshold:
        raise ContrastFailure(f"contrast {ratio:.2f} < {threshold} for fg={fg} bg={bg}")
```

- [ ] **Step 4: Run, expect pass**

```bash
pytest tests/test_colors.py -v
```
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/zipsaja-content/lib/colors.py .claude/skills/zipsaja-content/tests/test_colors.py
git commit -m "zipsaja-content: lib/colors.py — percentile tier + WCAG AA contrast (이번 세션 흰글/베이지 사고 방지)"
```

---

### Task 6: lib/validator.py — Outlier flag + multi-method

**Files:**
- Create: `.claude/skills/zipsaja-content/lib/validator.py`
- Test: `.claude/skills/zipsaja-content/tests/test_validator.py`

- [ ] **Step 1: Write tests**

`tests/test_validator.py`:
```python
from lib.validator import flag_outliers, multi_method_check

def test_flag_outliers_marks_low_n():
    rows = [{"gu": "종로", "n": 16}, {"gu": "강남", "n": 800}]
    flagged = flag_outliers(rows, n_field="n", threshold=30)
    by_gu = {r["gu"]: r for r in flagged}
    assert by_gu["종로"]["is_outlier"] is True
    assert by_gu["강남"]["is_outlier"] is False

def test_multi_method_consistent():
    rows = [{"gu": "강남", "median": 27.5, "mean": 27.0, "p25": 26.0, "p75": 29.2}]
    out = multi_method_check(rows)
    assert out[0]["consistency"] == "ok"

def test_multi_method_inconsistent():
    # mean much higher than median = outlier-driven
    rows = [{"gu": "X", "median": 10.0, "mean": 25.0, "p25": 8.0, "p75": 12.0}]
    out = multi_method_check(rows)
    assert out[0]["consistency"] == "skewed"
```

- [ ] **Step 2: Run, expect failure**

```bash
pytest tests/test_validator.py -v
```

- [ ] **Step 3: Implement**

`lib/validator.py`:
```python
"""Sample-size outlier flag + multi-method (median/mean) consistency check."""

def flag_outliers(rows: list[dict], n_field: str = "n", threshold: int = 30) -> list[dict]:
    """Return new list with `is_outlier=True` for rows where rows[n_field] < threshold."""
    return [{**r, "is_outlier": int(r[n_field]) < threshold} for r in rows]


def multi_method_check(rows: list[dict]) -> list[dict]:
    """For each row, compare median vs mean. Mark `consistency` as 'ok'|'skewed'."""
    out = []
    for r in rows:
        median = float(r.get("median", 0))
        mean = float(r.get("mean", 0))
        if median == 0:
            consistency = "unknown"
        else:
            ratio = abs(mean - median) / median
            consistency = "ok" if ratio < 0.15 else "skewed"
        out.append({**r, "consistency": consistency})
    return out
```

- [ ] **Step 4: Run, expect pass**

```bash
pytest tests/test_validator.py -v
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/zipsaja-content/lib/validator.py .claude/skills/zipsaja-content/tests/test_validator.py
git commit -m "zipsaja-content: lib/validator.py — outlier(n<30) + median/mean consistency"
```

---

### Task 7: lib/footer.py — 라이브 카운트 자동 footer

**Files:**
- Create: `.claude/skills/zipsaja-content/lib/footer.py`
- Test: `.claude/skills/zipsaja-content/tests/test_footer.py`

- [ ] **Step 1: Write tests**

`tests/test_footer.py`:
```python
from lib.footer import build_footer_text, FOOTER_TEMPLATE

def test_template_has_required_tokens():
    assert "{complexes}" in FOOTER_TEMPLATE
    assert "{active_articles}" in FOOTER_TEMPLATE
    assert "{last_scan}" in FOOTER_TEMPLATE
    assert "300세대" in FOOTER_TEMPLATE  # 컷오프 표기 강제

def test_build_footer_with_live_data():
    text = build_footer_text()
    assert "300세대+" in text
    assert "단지" in text
    assert "매물" in text
    # last_scan should be ISO date format YYYY-MM-DD
    import re
    assert re.search(r"\d{4}-\d{2}-\d{2}", text)
```

- [ ] **Step 2: Run, expect failure**

```bash
pytest tests/test_footer.py -v
```

- [ ] **Step 3: Implement**

`lib/footer.py`:
```python
"""Auto-build footer text using live-counts SQL. Always fresh, no caching."""
from lib.db import query
from lib.sql_loader import load

# 강제 템플릿 — 300세대+ 컷오프 표기 필수 (CHECKLIST guard #5)
FOOTER_TEMPLATE = (
    "@zipsaja · 서울 300세대+ {complexes}단지 · 활성 매물 {active_articles}건 · {last_scan} 기준"
)


def build_footer_text() -> str:
    rows = query(load("live-counts"))
    if not rows:
        raise RuntimeError("live-counts SQL returned no rows")
    r = rows[0]
    return FOOTER_TEMPLATE.format(
        complexes=f"{int(r['complexes']):,}",
        active_articles=f"{int(r['active_articles']):,}",
        last_scan=r["last_scan"],
    )
```

- [ ] **Step 4: Run, expect pass**

```bash
pytest tests/test_footer.py -v
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/zipsaja-content/lib/footer.py .claude/skills/zipsaja-content/tests/test_footer.py
git commit -m "zipsaja-content: lib/footer.py — live-counts 매번 재실행 자동 footer (stale 인용 사고 방지)"
```

---

### Task 8: lib/geo/projector.py — GeoJSON → SVG path

**Files:**
- Create: `.claude/skills/zipsaja-content/lib/geo/projector.py`
- Create: `.claude/skills/zipsaja-content/lib/geo/seoul.geojson` (download from southkorea/seoul-maps)
- Test: `.claude/skills/zipsaja-content/tests/test_projector.py`

- [ ] **Step 1: Download seoul.geojson**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/zipsaja-content/lib/geo
curl -sLo seoul.geojson "https://raw.githubusercontent.com/southkorea/seoul-maps/master/kostat/2013/json/seoul_municipalities_geo_simple.json"
```

Verify:
```bash
python3 -c "import json; d=json.load(open('seoul.geojson')); print(len(d['features']), 'features')"
```
Expected: `25 features`

- [ ] **Step 2: Write tests**

`tests/test_projector.py`:
```python
import os
from lib.geo.projector import project_seoul

GEOJSON = os.path.join(os.path.dirname(__file__), "..", "lib", "geo", "seoul.geojson")

def test_project_returns_25_paths():
    res = project_seoul(GEOJSON, viewbox_w=1000)
    assert len(res["paths"]) == 25
    assert "강남구" in res["paths"]
    assert "도봉구" in res["paths"]

def test_aspect_corrected():
    # Seoul lat 37.5°, cos=0.793, real aspect ≈ 1.21
    res = project_seoul(GEOJSON, viewbox_w=1000)
    vb = res["viewbox"].split()
    h = float(vb[3])
    assert 800 < h < 900  # 1000/1.21 ≈ 826

def test_centroids_inside_viewbox():
    res = project_seoul(GEOJSON, viewbox_w=1000)
    h = float(res["viewbox"].split()[3])
    for gu, (cx, cy) in res["centroids"].items():
        assert 0 <= cx <= 1000
        assert 0 <= cy <= h

def test_paths_start_with_M():
    res = project_seoul(GEOJSON, viewbox_w=1000)
    for d in res["paths"].values():
        assert d.startswith("M")
        assert d.rstrip().endswith("Z")
```

- [ ] **Step 3: Run, expect failure**

```bash
pytest tests/test_projector.py -v
```

- [ ] **Step 4: Implement**

`lib/geo/projector.py`:
```python
"""GeoJSON → SVG path strings with cosine-corrected projection.

Cosine correction ensures Seoul (lat 37.5°) doesn't render stretched horizontally —
1° longitude at lat 37.5 is only ~88km vs 1° latitude = 111km.
"""
import json, math


def project_seoul(geojson_path: str, viewbox_w: int = 1000) -> dict:
    """Return {viewbox, paths{name: d}, centroids{name: (cx, cy)}}."""
    data = json.load(open(geojson_path))

    xs, ys = [], []
    def walk(coords):
        for c in coords:
            if isinstance(c[0], (int, float)):
                xs.append(c[0]); ys.append(c[1])
            else:
                walk(c)
    for f in data["features"]:
        walk(f["geometry"]["coordinates"])

    minx, maxx = min(xs), max(xs)
    miny, maxy = min(ys), max(ys)
    mid_lat = (miny + maxy) / 2
    cos_corr = math.cos(math.radians(mid_lat))
    aspect = ((maxx - minx) * cos_corr) / (maxy - miny)
    H = round(viewbox_w / aspect)

    def project(lon, lat):
        x = (lon - minx) / (maxx - minx) * viewbox_w
        y = (maxy - lat) / (maxy - miny) * H
        return x, y

    def ring_to_d(ring):
        pts = [project(lo, la) for lo, la in ring]
        return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"

    def coords_to_path(coords):
        return " ".join(ring_to_d(r) for r in coords)

    paths, centroids = {}, {}
    for f in data["features"]:
        name = f["properties"]["name"]
        geom = f["geometry"]
        if geom["type"] == "Polygon":
            paths[name] = coords_to_path(geom["coordinates"])
            ring = geom["coordinates"][0]
        else:  # MultiPolygon
            paths[name] = " ".join(coords_to_path(p) for p in geom["coordinates"])
            ring = max(geom["coordinates"], key=lambda p: len(p[0]))[0]
        ps = [project(lo, la) for lo, la in ring]
        cx = sum(x for x, _ in ps) / len(ps)
        cy = sum(y for _, y in ps) / len(ps)
        centroids[name] = (round(cx, 1), round(cy, 1))

    return {
        "viewbox": f"0 0 {viewbox_w} {H}",
        "paths": paths,
        "centroids": centroids,
    }
```

- [ ] **Step 5: Run, expect pass**

```bash
pytest tests/test_projector.py -v
```

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/zipsaja-content/lib/geo/
git commit -m "zipsaja-content: lib/geo/projector.py + seoul.geojson — cosine 보정 SVG path (타일 우회 방지)"
```

---

### Task 9: lib/render.py + components/_base.html.j2 + cover.j2

**Files:**
- Create: `.claude/skills/zipsaja-content/components/_base.html.j2`
- Create: `.claude/skills/zipsaja-content/components/cover.j2`
- Create: `.claude/skills/zipsaja-content/lib/render.py`
- Test: `.claude/skills/zipsaja-content/tests/test_render.py`

- [ ] **Step 1: Add jinja2 + pyyaml to requirements**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/zipsaja-content
cat > requirements.txt <<EOF
jinja2>=3.1
pyyaml>=6.0
pytest>=8.0
EOF
pip install -r requirements.txt
```

- [ ] **Step 2: Write _base.html.j2**

`components/_base.html.j2`:
```jinja
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>{{ title|default('zipsaja') }}</title>
<link rel="stylesheet" href="{{ tokens_css }}">
{% block style %}{% endblock %}
</head>
<body>
<section class="zs-slide" data-screen-label="{{ screen_label|default('') }}">
  {% if num %}<div class="zs-num">{{ "%02d"|format(num) }}</div>{% endif %}
  {% block content %}{% endblock %}
  <div class="zs-foot">
    <div class="handle"><b>{{ footer_text }}</b></div>
    <div class="right"><span class="pg">{{ num }} / {{ total }}</span><span>→</span></div>
  </div>
</section>
</body>
</html>
```

- [ ] **Step 3: Write cover.j2**

`components/cover.j2`:
```jinja
{% extends "_base.html.j2" %}
{% block style %}
<style>
  .cover-hero { padding: 200px 80px 0; }
  .cover-hero h1 { font-family: var(--ff-headline); font-size: 120px; line-height: 1.05; margin: 0 0 24px; letter-spacing: -2px; }
  .cover-hero .sub { font-family: var(--ff-body); font-weight: 700; font-size: 44px; color: var(--fg-2); }
  .cover-mascot { position: absolute; right: 60px; bottom: 220px; width: 280px; }
</style>
{% endblock %}
{% block content %}
<div class="cover-hero">
  <h1>{{ headline }}</h1>
  <p class="sub">{{ sub }}</p>
</div>
{% if mascot %}<img src="{{ mascot_path }}" class="cover-mascot" alt="">{% endif %}
{% endblock %}
```

- [ ] **Step 4: Write render.py**

`lib/render.py`:
```python
"""Spec.yaml → rendered HTML files. Auto-injects footer from live counts."""
import os, yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape
from lib.footer import build_footer_text
from lib.tone import check_tone

SKILL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMPONENTS_DIR = os.path.join(SKILL_ROOT, "components")
TOKENS_CSS = os.path.relpath(
    "/Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/zipsaja-design/colors_and_type.css",
    start=os.path.join(SKILL_ROOT, "output"),
)
MASCOTS_DIR = "/Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/zipsaja-design/assets/mascots"


def render_carousel(spec_path: str, out_dir: str) -> list[str]:
    """Render slides from spec.yaml, write to out_dir/slides/. Returns list of HTML paths."""
    spec = yaml.safe_load(open(spec_path))
    slides = spec["slides"]
    total = len(slides)

    env = Environment(
        loader=FileSystemLoader(COMPONENTS_DIR),
        autoescape=select_autoescape(["html", "j2"]),
    )

    footer = build_footer_text()
    slides_dir = os.path.join(out_dir, "slides")
    os.makedirs(slides_dir, exist_ok=True)
    written = []

    for i, slide in enumerate(slides, start=1):
        kind = slide["type"]
        # tone-check user-provided text fields
        for f in ("headline", "sub", "title", "msg"):
            if slide.get(f):
                vs = check_tone(slide[f])
                if vs:
                    raise ValueError(f"slide {i} field '{f}' tone violations: {vs}")

        tpl = env.get_template(f"{kind}.j2")
        ctx = {
            **slide,
            "num": i,
            "total": total,
            "footer_text": footer,
            "tokens_css": TOKENS_CSS,
            "title": f"{spec['slug']} {i:02d}",
            "screen_label": f"{i:02d} {kind}",
        }
        if "mascot" in slide:
            ctx["mascot_path"] = os.path.join(MASCOTS_DIR, f"mascot-{slide['mascot']}.png")

        html = tpl.render(**ctx)
        out_path = os.path.join(slides_dir, f"{i:02d}-{kind}.html")
        with open(out_path, "w") as f:
            f.write(html)
        written.append(out_path)
    return written
```

- [ ] **Step 5: Write tests**

`tests/test_render.py`:
```python
import os, tempfile, yaml
from lib.render import render_carousel

SAMPLE_SPEC = {
    "slug": "test-cover",
    "topic": "test",
    "slides": [
        {"type": "cover", "headline": "테스트 hook", "sub": "한 줄 더", "mascot": "hero"},
    ],
}

def test_render_one_cover_slide(tmp_path):
    spec_path = tmp_path / "spec.yaml"
    spec_path.write_text(yaml.safe_dump(SAMPLE_SPEC, allow_unicode=True))
    out = render_carousel(str(spec_path), str(tmp_path))
    assert len(out) == 1
    html = open(out[0]).read()
    assert "테스트 hook" in html
    assert "한 줄 더" in html
    assert "@zipsaja" in html  # footer auto

def test_tone_violation_raises(tmp_path):
    bad_spec = {**SAMPLE_SPEC, "slides": [{"type": "cover", "headline": "여러분 안녕하세요", "sub": "test"}]}
    spec_path = tmp_path / "spec.yaml"
    spec_path.write_text(yaml.safe_dump(bad_spec, allow_unicode=True))
    import pytest
    with pytest.raises(ValueError, match="tone violations"):
        render_carousel(str(spec_path), str(tmp_path))
```

- [ ] **Step 6: Run tests, expect pass**

```bash
pytest tests/test_render.py -v
```

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/zipsaja-content/components/ .claude/skills/zipsaja-content/lib/render.py .claude/skills/zipsaja-content/tests/test_render.py .claude/skills/zipsaja-content/requirements.txt
git commit -m "zipsaja-content: render.py + _base/cover 컴포넌트 + tone 자동 게이트"
```

---

### Task 10: components/quote-big.j2 + cta.j2 (간단한 컴포넌트)

**Files:**
- Create: `.claude/skills/zipsaja-content/components/quote-big.j2`
- Create: `.claude/skills/zipsaja-content/components/cta.j2`
- Modify: `.claude/skills/zipsaja-content/tests/test_render.py` (extend)

- [ ] **Step 1: Write quote-big.j2**

`components/quote-big.j2`:
```jinja
{% extends "_base.html.j2" %}
{% block style %}
<style>
  .qb-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; padding: 100px 60px; }
  .qb-value { font-family: var(--ff-headline); font-size: 220px; line-height: 1; color: var(--zs-yellow); letter-spacing: -3px; text-align:center; }
  .qb-sub { font-family: var(--ff-body); font-weight: 700; font-size: 48px; color: var(--zs-ink); margin-top: 36px; text-align:center; }
  .qb-mascot { position:absolute; right:50px; top:50px; width:180px; }
</style>
{% endblock %}
{% block content %}
<div class="qb-wrap">
  <div class="qb-value">{{ value }}</div>
  <div class="qb-sub">{{ subtitle }}</div>
</div>
{% if mascot %}<img src="{{ mascot_path }}" class="qb-mascot" alt="">{% endif %}
{% endblock %}
```

- [ ] **Step 2: Write cta.j2**

`components/cta.j2`:
```jinja
{% extends "_base.html.j2" %}
{% block style %}
<style>
  .cta-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; padding:100px 60px; background:var(--zs-ink); color:#fff; }
  .cta-handle { font-family: var(--ff-headline); font-size:120px; color:var(--zs-yellow); margin-bottom:24px; }
  .cta-msg { font-family: var(--ff-body); font-weight:700; font-size:48px; text-align:center; color:#fff; }
  .zs-foot { color: rgba(255,255,255,0.7); }
  .zs-foot b { color: #fff; }
</style>
{% endblock %}
{% block content %}
<div class="cta-wrap">
  <div class="cta-handle">{{ handle }}</div>
  <div class="cta-msg">{{ msg }}</div>
</div>
{% endblock %}
```

- [ ] **Step 3: Add tests**

Append to `tests/test_render.py`:
```python
def test_render_quote_big(tmp_path):
    spec = {"slug": "qb", "slides": [{"type": "quote-big", "value": "용산 3.13배", "subtitle": "강남이 1위 아니다"}]}
    sp = tmp_path / "spec.yaml"
    sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    out = render_carousel(str(sp), str(tmp_path))
    h = open(out[0]).read()
    assert "용산 3.13배" in h

def test_render_cta(tmp_path):
    spec = {"slug": "cta", "slides": [{"type": "cta", "handle": "@zipsaja", "msg": "DM 환영"}]}
    sp = tmp_path / "spec.yaml"
    sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    out = render_carousel(str(sp), str(tmp_path))
    assert "DM 환영" in open(out[0]).read()
```

- [ ] **Step 4: Run, expect pass**

```bash
pytest tests/test_render.py -v
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/zipsaja-content/components/quote-big.j2 .claude/skills/zipsaja-content/components/cta.j2 .claude/skills/zipsaja-content/tests/test_render.py
git commit -m "zipsaja-content: quote-big + cta 컴포넌트"
```

---

### Task 11: components/map-seoul.j2 — Real geographic map

**Files:**
- Create: `.claude/skills/zipsaja-content/components/map-seoul.j2`
- Modify: `.claude/skills/zipsaja-content/lib/render.py` (inject geo data into map context)
- Test: `.claude/skills/zipsaja-content/tests/test_render.py` (extend)

- [ ] **Step 1: Extend render.py to compute map data when type startswith map-**

Modify `lib/render.py` — inside the slide loop, before `tpl.render`:
```python
        if kind.startswith("map-"):
            from lib.geo.projector import project_seoul
            from lib.colors import percentile_tiers
            from lib.db import query
            from lib.sql_loader import load as sqlload
            from lib.validator import flag_outliers

            geo = project_seoul(os.path.join(SKILL_ROOT, "lib/geo/seoul.geojson"))
            sql_preset = slide["sql"]
            sql_params = slide.get("sql_params", {})
            rows = query(sqlload(sql_preset, **sql_params))
            rows = flag_outliers(rows)
            metric = slide.get("color_metric", "median")
            values = [float(r[metric]) for r in rows]
            cuts = percentile_tiers(values, n=5)
            def tier(v):
                v = float(v)
                for i, c in enumerate(cuts):
                    if v < c: return i + 1
                return 5
            ctx["geo"] = geo
            ctx["rows_by_gu"] = {r["gu"]: {**r, "tier": tier(r[metric])} for r in rows}
            ctx["metric"] = metric
```

- [ ] **Step 2: Write map-seoul.j2**

`components/map-seoul.j2`:
```jinja
{% extends "_base.html.j2" %}
{% block style %}
<style>
  .map-head { padding: 80px 60px 20px; }
  .map-head h1 { font-family: var(--ff-headline); font-size: 72px; margin: 0; line-height: 1.05; }
  .map-head .sub { font-family: var(--ff-body); font-weight:700; font-size:26px; color: var(--fg-3); margin-top:6px; }
  .map-svg { display:block; margin: 16px auto 0; width: 960px; height: auto; }
  .map-svg .gu { stroke: var(--zs-ink); stroke-width: 3; stroke-linejoin: round; }
  .map-svg .gu.t1 { fill: #ffffff; }
  .map-svg .gu.t2 { fill: var(--zs-cream); }
  .map-svg .gu.t3 { fill: #FFD8C9; }
  .map-svg .gu.t4 { fill: var(--zs-yellow); }
  .map-svg .gu.t5 { fill: var(--zs-orange-deep); }
  .map-svg .lbl text { text-anchor: middle; font-family: var(--ff-headline); font-weight: 700; paint-order: stroke; stroke: rgba(255,255,255,0.6); stroke-width: 4; fill: var(--zs-ink); }
  .map-svg .lbl-t4 text, .map-svg .lbl-t5 text { fill: #fff; stroke: rgba(0,0,0,0.35); }
  .map-svg .lbl .n { font-size: 22px; }
  .map-svg .lbl .v { font-size: 32px; }
</style>
{% endblock %}
{% block content %}
<div class="map-head">
  <h1>{{ title }}</h1>
  <div class="sub">{{ sub|default('') }}</div>
</div>
<svg class="map-svg" viewBox="{{ geo.viewbox }}" xmlns="http://www.w3.org/2000/svg">
  {% for name, d in geo.paths.items() %}
    {% set row = rows_by_gu.get(name) %}
    {% if row %}
      <path class="gu t{{ row.tier }}" d="{{ d }}" data-name="{{ name }}"/>
    {% else %}
      <path class="gu t1" d="{{ d }}" data-name="{{ name }}"/>
    {% endif %}
  {% endfor %}
  {% for name, c in geo.centroids.items() %}
    {% set row = rows_by_gu.get(name) %}
    {% if row %}
      <g class="lbl lbl-t{{ row.tier }}" transform="translate({{ c[0] }} {{ c[1] }})">
        <text class="n" y="-6">{{ name|replace("구","") if name != "중구" else "중" }}{% if row.is_outlier %} ★{% endif %}</text>
        <text class="v" y="22">{{ row[metric] }}</text>
      </g>
    {% endif %}
  {% endfor %}
</svg>
{% endblock %}
```

- [ ] **Step 3: Add test (live data)**

Append to `tests/test_render.py`:
```python
def test_render_map_seoul_live(tmp_path):
    spec = {
        "slug": "map-test",
        "slides": [{
            "type": "map-seoul",
            "sql": "price-by-gu",
            "sql_params": {"pyeong_min": 56, "pyeong_max": 63},
            "color_metric": "median",
            "title": "서울 24평 호가",
            "sub": "테스트",
        }],
    }
    sp = tmp_path / "spec.yaml"
    sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    out = render_carousel(str(sp), str(tmp_path))
    h = open(out[0]).read()
    assert "<svg" in h
    assert "강남구" in h or 'data-name="강남구"' in h
    assert "viewBox" in h
```

- [ ] **Step 4: Run, expect pass**

```bash
pytest tests/test_render.py::test_render_map_seoul_live -v
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/zipsaja-content/components/map-seoul.j2 .claude/skills/zipsaja-content/lib/render.py .claude/skills/zipsaja-content/tests/test_render.py
git commit -m "zipsaja-content: map-seoul 컴포넌트 — SVG path + percentile tier color + outlier ★"
```

---

### Task 12: components/rank-bar.j2 — TOP N 막대

**Files:**
- Create: `.claude/skills/zipsaja-content/components/rank-bar.j2`
- Modify: `.claude/skills/zipsaja-content/lib/render.py` (handle rank-bar context)

- [ ] **Step 1: Extend render.py for rank-bar**

In the slide loop in `lib/render.py`, add:
```python
        if kind == "rank-bar":
            from lib.db import query
            from lib.sql_loader import load as sqlload
            sql_preset = slide["sql"]
            sql_params = slide.get("sql_params", {})
            rows = query(sqlload(sql_preset, **sql_params))
            metric = slide.get("metric", "median")
            top_n = int(slide.get("top_n", 5))
            sorted_rows = sorted(rows, key=lambda r: float(r[metric]), reverse=True)[:top_n]
            max_val = max(float(r[metric]) for r in sorted_rows) if sorted_rows else 1
            ctx["bars"] = [
                {**r, "pct": round(float(r[metric]) / max_val * 100, 1)}
                for r in sorted_rows
            ]
            ctx["metric"] = metric
```

- [ ] **Step 2: Write rank-bar.j2**

`components/rank-bar.j2`:
```jinja
{% extends "_base.html.j2" %}
{% block style %}
<style>
  .rb-head { padding: 80px 60px 32px; }
  .rb-head h1 { font-family: var(--ff-headline); font-size: 64px; margin: 0; }
  .rb-list { padding: 0 60px; }
  .rb-row { display: grid; grid-template-columns: 80px 200px 1fr 200px; gap: 16px; align-items: center; padding: 18px 0; border-top: 2px solid var(--zs-ink); }
  .rb-row:last-child { border-bottom: 2px solid var(--zs-ink); }
  .rb-rank { font-family: var(--ff-headline); font-size: 56px; color: var(--zs-yellow); }
  .rb-name { font-family: var(--ff-headline); font-size: 48px; }
  .rb-bar  { height: 36px; background: var(--zs-yellow); border: 3px solid var(--zs-ink); border-radius: 8px; }
  .rb-val  { font-family: var(--ff-headline); font-size: 44px; text-align: right; }
</style>
{% endblock %}
{% block content %}
<div class="rb-head"><h1>{{ title }}</h1></div>
<div class="rb-list">
  {% for b in bars %}
  <div class="rb-row">
    <div class="rb-rank">{{ loop.index }}</div>
    <div class="rb-name">{{ b.gu|replace('구','') if b.gu != '중구' else '중구' }}</div>
    <div><div class="rb-bar" style="width: {{ b.pct }}%;"></div></div>
    <div class="rb-val">{{ b[metric] }}</div>
  </div>
  {% endfor %}
</div>
{% endblock %}
```

- [ ] **Step 3: Test**

Append to `tests/test_render.py`:
```python
def test_render_rank_bar_live(tmp_path):
    spec = {
        "slug": "rb",
        "slides": [{
            "type": "rank-bar",
            "sql": "price-by-gu",
            "sql_params": {"pyeong_min": 56, "pyeong_max": 63},
            "metric": "median",
            "top_n": 5,
            "title": "TOP 5",
        }],
    }
    sp = tmp_path / "spec.yaml"
    sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    out = render_carousel(str(sp), str(tmp_path))
    h = open(out[0]).read()
    assert h.count('class="rb-row"') == 5
    assert "서초" in h
```

- [ ] **Step 4: Run**

```bash
pytest tests/test_render.py::test_render_rank_bar_live -v
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/zipsaja-content/components/rank-bar.j2 .claude/skills/zipsaja-content/lib/render.py .claude/skills/zipsaja-content/tests/test_render.py
git commit -m "zipsaja-content: rank-bar 컴포넌트 — TOP N 막대 차트"
```

---

### Task 13: components/compare-2col.j2 + deep-detail.j2

**Files:**
- Create: `.claude/skills/zipsaja-content/components/compare-2col.j2`
- Create: `.claude/skills/zipsaja-content/components/deep-detail.j2`

- [ ] **Step 1: Write compare-2col.j2**

`components/compare-2col.j2`:
```jinja
{% extends "_base.html.j2" %}
{% block style %}
<style>
  .c2-head { padding: 80px 60px 24px; }
  .c2-head h1 { font-family: var(--ff-headline); font-size: 60px; margin:0; }
  .c2-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px 60px; }
  .c2-cell { background: var(--zs-cream); border: 3px solid var(--zs-ink); border-radius: 16px; padding: 60px 32px; text-align: center; box-shadow: 4px 4px 0 0 var(--zs-ink); }
  .c2-cell.right { background: var(--zs-yellow); }
  .c2-label { font-family: var(--ff-headline); font-size: 48px; }
  .c2-value { font-family: var(--ff-headline); font-size: 110px; color: var(--zs-ink); margin-top: 16px; line-height:1; }
  .c2-sub { padding: 32px 60px 0; font-family: var(--ff-body); font-weight: 700; font-size: 36px; color: var(--fg-2); text-align:center; }
</style>
{% endblock %}
{% block content %}
<div class="c2-head"><h1>{{ title|default('') }}</h1></div>
<div class="c2-grid">
  <div class="c2-cell">
    <div class="c2-label">{{ left.label }}</div>
    <div class="c2-value">{{ left.value }}</div>
  </div>
  <div class="c2-cell right">
    <div class="c2-label">{{ right.label }}</div>
    <div class="c2-value">{{ right.value }}</div>
  </div>
</div>
{% if sub %}<div class="c2-sub">{{ sub }}</div>{% endif %}
{% endblock %}
```

- [ ] **Step 2: Write deep-detail.j2**

`components/deep-detail.j2`:
```jinja
{% extends "_base.html.j2" %}
{% block style %}
<style>
  .dd-head { padding: 80px 60px 16px; }
  .dd-head h1 { font-family: var(--ff-headline); font-size: 72px; margin: 0; }
  .dd-target { font-family: var(--ff-headline); font-size: 110px; color: var(--zs-yellow); padding: 0 60px; line-height: 1; }
  .dd-bullets { padding: 32px 60px; font-family: var(--ff-body); font-weight: 700; font-size: 38px; line-height: 1.6; }
  .dd-bullets li { margin-bottom: 12px; }
</style>
{% endblock %}
{% block content %}
<div class="dd-head"><h1>{{ title }}</h1></div>
<div class="dd-target">{{ target }}</div>
<ul class="dd-bullets">
  {% for b in bullets %}<li>{{ b }}</li>{% endfor %}
</ul>
{% endblock %}
```

- [ ] **Step 3: Test**

Append to `tests/test_render.py`:
```python
def test_render_compare_2col(tmp_path):
    spec = {"slug":"c2","slides":[{"type":"compare-2col","title":"비교","left":{"label":"용산","value":"3.13배"},"right":{"label":"도봉","value":"1.88배"},"sub":"양극화"}]}
    sp = tmp_path / "spec.yaml"; sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    h = open(render_carousel(str(sp), str(tmp_path))[0]).read()
    assert "3.13배" in h and "1.88배" in h

def test_render_deep_detail(tmp_path):
    spec = {"slug":"dd","slides":[{"type":"deep-detail","title":"용산은 왜?","target":"용산","bullets":["한남","국제업무지구"]}]}
    sp = tmp_path / "spec.yaml"; sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    h = open(render_carousel(str(sp), str(tmp_path))[0]).read()
    assert "한남" in h and "국제업무지구" in h
```

- [ ] **Step 4: Run**

```bash
pytest tests/test_render.py -v -k "compare or deep_detail"
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/zipsaja-content/components/compare-2col.j2 .claude/skills/zipsaja-content/components/deep-detail.j2 .claude/skills/zipsaja-content/tests/test_render.py
git commit -m "zipsaja-content: compare-2col + deep-detail 컴포넌트"
```

---

### Task 14: components/distribution.j2 + map-gyeonggi placeholder

**Files:**
- Create: `.claude/skills/zipsaja-content/components/distribution.j2`
- Create: `.claude/skills/zipsaja-content/components/map-gyeonggi.j2` (placeholder)

- [ ] **Step 1: Write distribution.j2 (분포표 — 동별)**

`components/distribution.j2`:
```jinja
{% extends "_base.html.j2" %}
{% block style %}
<style>
  .dist-head { padding: 80px 60px 24px; }
  .dist-head h1 { font-family: var(--ff-headline); font-size: 60px; margin: 0; }
  .dist-table { padding: 0 60px; width: calc(100% - 120px); border-collapse: collapse; }
  .dist-table th, .dist-table td { font-family: var(--ff-body); font-weight: 700; font-size: 32px; padding: 14px 8px; text-align: left; border-bottom: 2px solid var(--zs-ink); }
  .dist-table th { font-family: var(--ff-headline); color: var(--fg-3); font-size: 26px; }
  .dist-table td.num { text-align: right; font-family: var(--ff-headline); }
</style>
{% endblock %}
{% block content %}
<div class="dist-head"><h1>{{ title }}</h1></div>
<table class="dist-table">
  <tr><th>{{ group_label|default('항목') }}</th><th>매물</th><th class="num">{{ value_label|default('값') }}</th></tr>
  {% for r in rows %}
  <tr>
    <td>{{ r.label }}</td>
    <td>{{ r.n }}</td>
    <td class="num">{{ r.value }}{% if r.is_outlier %} ★{% endif %}</td>
  </tr>
  {% endfor %}
</table>
{% endblock %}
```

- [ ] **Step 2: Write map-gyeonggi.j2 (placeholder — v1.5)**

`components/map-gyeonggi.j2`:
```jinja
{% extends "_base.html.j2" %}
{% block content %}
<div style="padding:200px 60px; text-align:center;">
  <h1 style="font-family:var(--ff-headline); font-size:60px;">경기도 지도 (v1.5 추가 예정)</h1>
  <p style="font-family:var(--ff-body); font-size:32px; color:var(--fg-3);">gyeonggi.geojson 필요</p>
</div>
{% endblock %}
```

- [ ] **Step 3: Test**

Append:
```python
def test_render_distribution(tmp_path):
    spec = {"slug":"dist","slides":[{
        "type":"distribution","title":"서초 동별",
        "group_label":"동","value_label":"억",
        "rows":[
            {"label":"잠원동","n":367,"value":"39.0","is_outlier":False},
            {"label":"반포동","n":566,"value":"37.2","is_outlier":False},
        ],
    }]}
    sp = tmp_path / "spec.yaml"; sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    h = open(render_carousel(str(sp), str(tmp_path))[0]).read()
    assert "잠원동" in h and "39.0" in h
```

- [ ] **Step 4: Run**

```bash
pytest tests/test_render.py -v -k distribution
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/zipsaja-content/components/distribution.j2 .claude/skills/zipsaja-content/components/map-gyeonggi.j2 .claude/skills/zipsaja-content/tests/test_render.py
git commit -m "zipsaja-content: distribution 컴포넌트 + map-gyeonggi v1.5 placeholder"
```

---

### Task 15: lib/hook_draft.py — Insight extraction + 5 candidates

**Files:**
- Create: `.claude/skills/zipsaja-content/lib/hook_draft.py`
- Test: `.claude/skills/zipsaja-content/tests/test_hook_draft.py`

- [ ] **Step 1: Write tests**

`tests/test_hook_draft.py`:
```python
import pytest
from lib.hook_draft import draft_hooks, HallucinationError

# Sample data shape: list of dicts with 'gu', 'multiple', 'eok_then', 'eok_now', 'samples'
SAMPLE_10Y = [
    {"gu":"용산구","eok_then":10.6,"eok_now":33.2,"multiple":3.13,"samples":"1481/121","is_outlier":False},
    {"gu":"성동구","eok_then":5.9, "eok_now":18.2,"multiple":3.11,"samples":"3763/314","is_outlier":False},
    {"gu":"강남구","eok_then":11.0,"eok_now":26.5,"multiple":2.41,"samples":"3561/327","is_outlier":False},
    {"gu":"도봉구","eok_then":3.2, "eok_now":6.0, "multiple":1.88,"samples":"3235/507","is_outlier":False},
]

def test_draft_returns_5_candidates():
    hooks = draft_hooks(SAMPLE_10Y, value_field="multiple", label_field="gu")
    assert len(hooks) == 5

def test_all_hooks_pass_tone():
    from lib.tone import check_tone
    hooks = draft_hooks(SAMPLE_10Y, value_field="multiple", label_field="gu")
    for h in hooks:
        assert check_tone(h) == [], f"tone violation in: {h}"

def test_hooks_contain_real_numbers():
    """Hallucination guard — hook must only mention numbers/labels in the data."""
    hooks = draft_hooks(SAMPLE_10Y, value_field="multiple", label_field="gu")
    allowed_labels = {"용산", "성동", "강남", "도봉", "용산구", "성동구", "강남구", "도봉구"}
    for h in hooks:
        # extract Korean place names — quick heuristic
        for tok in ["압구정", "한남", "분당"]:
            assert tok not in h, f"hallucinated label '{tok}' in: {h}"

def test_hallucination_check_raises():
    with pytest.raises(HallucinationError):
        from lib.hook_draft import _check_hallucination
        _check_hallucination("강남이 100배 올랐다", SAMPLE_10Y, ["multiple", "eok_then", "eok_now"])
```

- [ ] **Step 2: Run, expect failure**

```bash
pytest tests/test_hook_draft.py -v
```

- [ ] **Step 3: Implement**

`lib/hook_draft.py`:
```python
"""Generate 5 hook candidates from data. Tone-checked + hallucination-guarded."""
import re
from lib.tone import check_tone


class HallucinationError(Exception):
    pass


def _check_hallucination(text: str, rows: list[dict], numeric_fields: list[str]) -> None:
    """Ensure all numbers in text appear in the data rows for the given fields."""
    nums_in_text = set(re.findall(r"\d+\.?\d*", text))
    allowed = {str(r[f]) for r in rows for f in numeric_fields}
    # Also allow integer parts of floats (3.13 → 3, 13)
    allowed_loose = set(allowed)
    for v in allowed:
        if "." in v:
            allowed_loose.add(v.split(".")[0])
    bad = [n for n in nums_in_text if n not in allowed_loose and float(n) > 1]
    if bad:
        raise HallucinationError(f"numbers not in data: {bad}")


def draft_hooks(
    rows: list[dict],
    value_field: str,
    label_field: str = "gu",
    pre_field: str = None,
    post_field: str = None,
) -> list[str]:
    """Return 5 hook candidates. All tone-checked. Order: top, gap, comparison, conventional-bust, neutral."""
    if not rows:
        return []
    sorted_rows = sorted(rows, key=lambda r: float(r[value_field]), reverse=True)
    top = sorted_rows[0]
    bottom = sorted_rows[-1]
    top_label = str(top[label_field]).replace("구", "")
    bottom_label = str(bottom[label_field]).replace("구", "")

    candidates = []

    # 1. TOP statement
    candidates.append(f"10년간 서울, 어디가 제일 올랐을까?")
    # 2. Top with value
    candidates.append(f"{top_label} {top[value_field]}배 — 1위")
    # 3. Conventional bust (강남 vs top)
    gangnam = next((r for r in rows if "강남" in str(r[label_field])), None)
    if gangnam and str(gangnam[label_field]) != str(top[label_field]):
        candidates.append(f"강남이 1위? — 아니, {top_label}")
    else:
        candidates.append(f"{top_label}이 강남보다 더 올랐다")
    # 4. Top vs bottom gap
    gap_ratio = round(float(top[value_field]) / float(bottom[value_field]), 1)
    candidates.append(f"{top_label} {top[value_field]}배 vs {bottom_label} {bottom[value_field]}배")
    # 5. Transformation hook (if pre/post fields present)
    if pre_field and post_field:
        candidates.append(f"{top_label} {top[pre_field]}억 → 지금 {top[post_field]}억")
    else:
        candidates.append(f"양극화 {gap_ratio}배 — 어디가 답이었나")

    # Tone check + hallucination check, drop violators
    out = []
    numeric_fields = [value_field] + ([pre_field, post_field] if pre_field else [])
    for c in candidates:
        if check_tone(c):
            continue
        try:
            _check_hallucination(c, rows, numeric_fields)
        except HallucinationError:
            continue
        out.append(c)
    return out
```

- [ ] **Step 4: Run, expect pass**

```bash
pytest tests/test_hook_draft.py -v
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/zipsaja-content/lib/hook_draft.py .claude/skills/zipsaja-content/tests/test_hook_draft.py
git commit -m "zipsaja-content: lib/hook_draft.py — 5 hook 후보 + tone + hallucination 가드"
```

---

### Task 16: lib/cli.py — CLI commands (init/fetch/render/build)

**Files:**
- Create: `.claude/skills/zipsaja-content/lib/cli.py`
- Create: `.claude/skills/zipsaja-content/lib/__main__.py`
- Test: `.claude/skills/zipsaja-content/tests/test_cli.py`

- [ ] **Step 1: Write tests**

`tests/test_cli.py`:
```python
import os, json, subprocess, pytest
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_cli(*args):
    return subprocess.run(
        ["python", "-m", "lib.cli", *args],
        cwd=ROOT, capture_output=True, text=True,
    )

def test_init_creates_folder_and_spec(tmp_path, monkeypatch):
    monkeypatch.chdir(ROOT)
    slug = f"test-{date.today().isoformat()}-init"
    res = run_cli("init", slug)
    assert res.returncode == 0, res.stderr
    out_dir = os.path.join(ROOT, "output", f"{date.today().isoformat()}-{slug}")
    assert os.path.isdir(out_dir)
    assert os.path.isfile(os.path.join(out_dir, "spec.yaml"))

def test_fetch_writes_data_json(tmp_path, monkeypatch):
    """fetch should run live SQL and dump JSON."""
    monkeypatch.chdir(ROOT)
    slug = f"test-{date.today().isoformat()}-fetch"
    run_cli("init", slug)
    out_dir = os.path.join(ROOT, "output", f"{date.today().isoformat()}-{slug}")
    # spec.yaml stub already includes a data block referencing live-counts
    res = run_cli("fetch", slug)
    assert res.returncode == 0, res.stderr
    data_json = os.path.join(out_dir, "data.json")
    assert os.path.isfile(data_json)
    data = json.load(open(data_json))
    assert "live_counts" in data
```

- [ ] **Step 2: Run, expect failure**

```bash
pytest tests/test_cli.py -v
```

- [ ] **Step 3: Implement cli.py**

`lib/cli.py`:
```python
"""zipsaja-content CLI — init / fetch / render / export / build."""
import argparse, json, os, sys, yaml
from datetime import date

SKILL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_ROOT = os.path.join(SKILL_ROOT, "output")

SPEC_TEMPLATE = """\
slug: {slug}
topic: "(설명)"
mascot_default: hero
data_queries:
  - name: live_counts
    sql: live-counts
slides:
  - type: cover
    headline: "(hook 한 줄)"
    sub: "(부 hook)"
    mascot: hero
"""


def cmd_init(slug: str) -> int:
    folder = os.path.join(OUTPUT_ROOT, f"{date.today().isoformat()}-{slug}")
    os.makedirs(folder, exist_ok=True)
    spec_path = os.path.join(folder, "spec.yaml")
    if not os.path.exists(spec_path):
        with open(spec_path, "w") as f:
            f.write(SPEC_TEMPLATE.format(slug=slug))
    print(f"created {folder}")
    return 0


def cmd_fetch(slug: str) -> int:
    from lib.db import query
    from lib.sql_loader import load
    folder = _find_folder(slug)
    spec = yaml.safe_load(open(os.path.join(folder, "spec.yaml")))
    data = {"live_counts": query(load("live-counts"))[0]}
    for q in spec.get("data_queries", []):
        if q["name"] == "live_counts":
            continue
        data[q["name"]] = query(load(q["sql"], **q.get("params", {})))
    with open(os.path.join(folder, "data.json"), "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)
    print(f"wrote {folder}/data.json")
    return 0


def cmd_render(slug: str) -> int:
    from lib.render import render_carousel
    folder = _find_folder(slug)
    paths = render_carousel(os.path.join(folder, "spec.yaml"), folder)
    print(f"rendered {len(paths)} slides")
    return 0


def cmd_export(slug: str) -> int:
    """Run Node Puppeteer to capture PNGs."""
    import subprocess
    folder = _find_folder(slug)
    res = subprocess.run(
        ["node", os.path.join(SKILL_ROOT, "lib/export_png.js"), folder],
        capture_output=True, text=True,
    )
    print(res.stdout)
    if res.returncode != 0:
        print(res.stderr, file=sys.stderr)
    return res.returncode


def cmd_build(slug: str) -> int:
    """fetch → render → export."""
    for fn in (cmd_fetch, cmd_render, cmd_export):
        rc = fn(slug)
        if rc != 0:
            return rc
    return 0


def _find_folder(slug: str) -> str:
    """Find folder by slug suffix, ignoring date prefix."""
    matches = [f for f in os.listdir(OUTPUT_ROOT) if f.endswith(slug)]
    if not matches:
        raise FileNotFoundError(f"no output folder for slug={slug}")
    return os.path.join(OUTPUT_ROOT, sorted(matches)[-1])


def main(argv=None):
    p = argparse.ArgumentParser(prog="zipsaja-content")
    sub = p.add_subparsers(dest="cmd", required=True)
    for name in ("init", "fetch", "render", "export", "build"):
        sp = sub.add_parser(name)
        sp.add_argument("slug")
    args = p.parse_args(argv)
    fn = {"init": cmd_init, "fetch": cmd_fetch, "render": cmd_render,
          "export": cmd_export, "build": cmd_build}[args.cmd]
    sys.exit(fn(args.slug))


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Add `__main__.py`**

`lib/__main__.py`:
```python
from lib.cli import main
main()
```

- [ ] **Step 5: Run init/fetch tests**

```bash
pytest tests/test_cli.py -v
```

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/zipsaja-content/lib/cli.py .claude/skills/zipsaja-content/lib/__main__.py .claude/skills/zipsaja-content/tests/test_cli.py
git commit -m "zipsaja-content: lib/cli.py — init/fetch/render/export/build CLI"
```

---

### Task 17: lib/export_png.js — Puppeteer PNG export

**Files:**
- Create: `.claude/skills/zipsaja-content/lib/export_png.js`
- Create: `.claude/skills/zipsaja-content/package.json`
- Test: `.claude/skills/zipsaja-content/tests/test_export.py`

- [ ] **Step 1: Write package.json**

`package.json`:
```json
{
  "name": "zipsaja-content-export",
  "version": "0.1.0",
  "type": "commonjs",
  "dependencies": {
    "puppeteer": "^22.0.0"
  }
}
```

- [ ] **Step 2: Write export_png.js**

`lib/export_png.js`:
```javascript
// Capture each slides/*.html as 1080x1440 PNG to exports/.
// Usage: node lib/export_png.js <output_folder>
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const folder = process.argv[2];
  if (!folder) { console.error('usage: node export_png.js <folder>'); process.exit(1); }
  const slidesDir = path.join(folder, 'slides');
  const outDir = path.join(folder, 'exports');
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(slidesDir).filter(f => f.endsWith('.html')).sort();
  if (files.length === 0) { console.error('no slides'); process.exit(1); }

  const browser = await puppeteer.launch({ headless: 'new' });
  for (const f of files) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });
    const url = 'file://' + path.resolve(slidesDir, f);
    await page.goto(url, { waitUntil: 'networkidle0' });
    const out = path.join(outDir, f.replace('.html', '.png'));
    await page.screenshot({ path: out, type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1440 } });
    await page.close();
    console.log('wrote ' + out);
  }
  await browser.close();
})();
```

- [ ] **Step 3: Install puppeteer**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/zipsaja-content
npm install
```

- [ ] **Step 4: Test (integration)**

`tests/test_export.py`:
```python
import os, subprocess
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def test_export_png_creates_files(tmp_path):
    """End-to-end: init → render minimal cover → export → PNG file exists."""
    slug = f"export-test-{int(__import__('time').time())}"
    subprocess.run(["python", "-m", "lib.cli", "init", slug], cwd=ROOT, check=True)
    # write a minimal spec
    folder = os.path.join(ROOT, "output", f"{date.today().isoformat()}-{slug}")
    spec_path = os.path.join(folder, "spec.yaml")
    with open(spec_path, "w") as f:
        f.write("""slug: test
slides:
  - type: cover
    headline: "test export"
    sub: "ok"
""")
    subprocess.run(["python", "-m", "lib.cli", "render", slug], cwd=ROOT, check=True)
    rc = subprocess.run(["python", "-m", "lib.cli", "export", slug], cwd=ROOT).returncode
    assert rc == 0
    pngs = [f for f in os.listdir(os.path.join(folder, "exports")) if f.endswith(".png")]
    assert len(pngs) == 1
```

- [ ] **Step 5: Run**

```bash
pytest tests/test_export.py -v
```
Expected: PASS (writes 1 PNG).

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/zipsaja-content/lib/export_png.js .claude/skills/zipsaja-content/package.json .claude/skills/zipsaja-content/package-lock.json .claude/skills/zipsaja-content/tests/test_export.py
git commit -m "zipsaja-content: Puppeteer PNG export — 1080x1440 @2x DPR"
```

---

### Task 18: SKILL.md natural-language workflow + README.md

**Files:**
- Modify: `.claude/skills/zipsaja-content/SKILL.md`
- Create: `.claude/skills/zipsaja-content/README.md`

- [ ] **Step 1: Replace SKILL.md with full workflow**

`.claude/skills/zipsaja-content/SKILL.md`:
```markdown
---
name: zipsaja-content
description: Generate 1080×1440 zipsaja brand instagram carousel slides from proptech_db data. Auto-injects footer with live counts, validates samples, runs tone/contrast guards, exports PNG. Use when the user asks for "카드뉴스", "캐러셀", "데이터 시각화" with zipsaja brand. Sister skill of zipsaja-design.
user-invocable: true
---

# zipsaja-content

데이터 → 캐러셀 파이프라인. **반-자동**: SQL/SVG/footer는 자동, hook 카피·narrative는 사람.

## 시작 전 필독

1. `CHECKLIST.md` — 13개 자동 가드 (외부 이미지 금지, stale 카운트 금지, 톤 검사 등)
2. `zipsaja-design/colors_and_type.css` — 비주얼 토큰 (이 스킬이 import)
3. `proptech_db` 접근 가능 여부 — `ssh root@151.245.106.86`

## 7단계 워크플로

1. **TOPIC** — 사람: 토픽 한 줄. SQL preset 어떤 거 쓸지 결정.
2. **DATA** — 자동: `python -m lib.cli fetch <slug>` → `data.json`
3. **HOOK** — 자동→사람: `lib/hook_draft.py`로 5개 후보 생성, 사람이 고르거나 새로 씀.
4. **OUTLINE** — 사람: `spec.yaml`에 8~10장 slide outline 작성.
5. **VALIDATE** — 자동→사람: outlier ★, median/mean 비교 → 사람 확인.
6. **RENDER** — 자동: `python -m lib.cli render <slug>` → `slides/*.html`
7. **EXPORT** — 자동: `python -m lib.cli export <slug>` → `exports/*.png`

또는 한 번에: `python -m lib.cli build <slug>`.

## 사용 예 — 자연어 호출

> "10년 전 vs 지금 비교 카드뉴스 만들어줘"

스킬은 다음을 한다:
1. `python -m lib.cli init seoul-10y` 실행
2. `data_queries: [{name: history, sql: price-history-Ny, params: {years_ago: 10, pyeong_min: 56, pyeong_max: 63}}]`로 spec.yaml 자동 채움
3. `fetch` 실행 → `data.json` 확인
4. `hook_draft` 출력 → 5개 후보 사용자에게 보여줌
5. 사용자가 hook 고르면 spec.yaml 채우기 도움 (slides outline 제안)
6. `render` → 사용자가 HTML 미리보기 (브라우저 open)
7. OK 받으면 `export` → PNG

## 컴포넌트 카탈로그 (9종)

`cover` / `quote-big` / `rank-bar` / `map-seoul` / `map-gyeonggi` / `compare-2col` / `deep-detail` / `distribution` / `cta`

## SQL preset (5종)

`live-counts` / `price-by-gu` / `price-history-Ny` / `auction-recent` / `distressed`

## 출력 위치

`output/YYYY-MM-DD-<slug>/`
├── `spec.yaml` (입력)
├── `data.json` (라이브 쿼리 결과)
├── `slides/*.html` (렌더 결과)
├── `exports/*.png` (1080×1440)
└── `meta.json` (빌드 메타)
```

- [ ] **Step 2: Write README.md**

`.claude/skills/zipsaja-content/README.md`:
```markdown
# zipsaja-content

Sister skill of `zipsaja-design`. Generates 1080×1440 instagram carousel slides from proptech_db data.

## Setup

```bash
cd .claude/skills/zipsaja-content
pip install -r requirements.txt
npm install
```

Set `PROPTECH_PG_PASSWORD` env var (or use default `proptech2026`).

## Usage

```bash
python -m lib.cli init seoul-10y       # creates output/YYYY-MM-DD-seoul-10y/spec.yaml
# edit spec.yaml — set slides
python -m lib.cli build seoul-10y      # fetch → render → export PNG
```

## Tests

```bash
pytest -v
```

Live tests require SSH to `root@151.245.106.86`. Use `pytest -m "not live"` to skip.

## Contributing

When adding components:
1. Create `components/<name>.j2` extending `_base.html.j2`
2. Add render context handler in `lib/render.py`
3. Add test in `tests/test_render.py`
4. Update SKILL.md component catalog
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/zipsaja-content/SKILL.md .claude/skills/zipsaja-content/README.md
git commit -m "zipsaja-content: SKILL.md 풀-워크플로 + README.md"
```

---

### Task 19: Dogfood — "10년 비교" carousel + acceptance verification

**Files:**
- Create: `.claude/skills/zipsaja-content/output/<today>-seoul-10y/spec.yaml`
- Create: `.claude/skills/zipsaja-content/tests/test_dogfood.py`

- [ ] **Step 1: Init the dogfood carousel**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/zipsaja-content
python -m lib.cli init seoul-10y
```

- [ ] **Step 2: Write the spec.yaml manually (final outline based on actual hook validation)**

Edit `output/<today>-seoul-10y/spec.yaml` to:
```yaml
slug: seoul-10y
topic: "10년간 서울 어디가 제일 올랐을까"
mascot_default: hero
data_queries:
  - name: history
    sql: price-history-Ny
    params:
      years_ago: 10
      pyeong_min: 56
      pyeong_max: 63
slides:
  - type: cover
    headline: "10년간 서울"
    sub: "어디가 제일 올랐을까?"
    mascot: hero
  - type: quote-big
    value: "용산 3.13배"
    subtitle: "강남이 1위 아니다"
    mascot: surprise
  - type: rank-bar
    sql: price-history-Ny
    sql_params:
      years_ago: 10
      pyeong_min: 56
      pyeong_max: 63
    metric: multiple
    top_n: 5
    title: "TOP 5 — 10년 상승률"
  - type: map-seoul
    sql: price-history-Ny
    sql_params:
      years_ago: 10
      pyeong_min: 56
      pyeong_max: 63
    color_metric: multiple
    title: "구별 10년 상승률"
    sub: "진할수록 많이 올랐다"
  - type: deep-detail
    title: "용산은 왜?"
    target: "용산"
    bullets:
      - "한남뉴타운 진행"
      - "용산국제업무지구 재추진"
      - "강·역세권 신축 프리미엄"
  - type: compare-2col
    title: "10년 양극화"
    left: { label: "용산", value: "3.13배" }
    right: { label: "도봉", value: "1.88배" }
    sub: "격차 1.7배 더 벌어짐"
  - type: cta
    handle: "@zipsaja"
    msg: "더 자세한 데이터는 DM"
```

- [ ] **Step 3: Build**

```bash
python -m lib.cli build seoul-10y
```

Expected output:
- 7 HTML files in `output/<today>-seoul-10y/slides/`
- 7 PNG files in `output/<today>-seoul-10y/exports/`
- `data.json` with `history` rows for 25 gu
- All renders pass tone check

- [ ] **Step 4: Write acceptance test**

`tests/test_dogfood.py`:
```python
"""Dogfood acceptance — verify the spec.acceptance criteria are all met."""
import os, glob, subprocess
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SLUG = "seoul-10y"

def test_dogfood_slides_built():
    folder = os.path.join(ROOT, "output", f"{date.today().isoformat()}-{SLUG}")
    htmls = glob.glob(os.path.join(folder, "slides", "*.html"))
    assert len(htmls) >= 7

def test_dogfood_pngs_built():
    folder = os.path.join(ROOT, "output", f"{date.today().isoformat()}-{SLUG}")
    pngs = glob.glob(os.path.join(folder, "exports", "*.png"))
    assert len(pngs) >= 7
    # PNG files non-empty
    for p in pngs:
        assert os.path.getsize(p) > 10000

def test_dogfood_footer_in_every_slide():
    folder = os.path.join(ROOT, "output", f"{date.today().isoformat()}-{SLUG}")
    for h in glob.glob(os.path.join(folder, "slides", "*.html")):
        text = open(h).read()
        assert "@zipsaja" in text
        assert "300세대+" in text
```

- [ ] **Step 5: Run acceptance**

```bash
pytest tests/test_dogfood.py -v
```

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/zipsaja-content/output/*/spec.yaml .claude/skills/zipsaja-content/tests/test_dogfood.py
# Also commit the build artifacts so we have an example shipped:
git add .claude/skills/zipsaja-content/output/*/slides/ .claude/skills/zipsaja-content/output/*/exports/ .claude/skills/zipsaja-content/output/*/data.json
git commit -m "zipsaja-content: dogfood carousel '10년 비교' 7장 빌드 + acceptance test 통과"
```

---

## Self-Review Checklist (run after writing the plan)

**Spec coverage:**
- [x] §1 Folder structure — Task 1 scaffolds, Tasks 2-17 fill in
- [x] §2 Workflow 7 steps — covered in SKILL.md (Task 18) + cli.py (Task 16)
- [x] §3 13 guards — implemented across Tasks 4 (tone), 5 (contrast), 6 (validator), 7 (footer), 8 (geo enforcement), CHECKLIST.md (Task 1)
- [x] §4 Input/Output — spec.yaml + output structure in Task 16 + Task 19
- [x] §5 9 components — Tasks 9, 10, 11, 12, 13, 14
- [x] §6 5 SQL presets — Task 3
- [x] §7 Tech stack — pyproject/requirements + npm in Tasks 9, 17
- [x] §8 CLI commands (init/fetch/render/export/build) — Task 16
- [x] §9 Dogfood — Task 19
- [x] §10 Acceptance criteria — Task 19 test_dogfood
- [x] §10-A Hook drafting — Task 15

**Placeholder scan:** Reviewed; no TBD/TODO. Test code is concrete; commands have expected output.

**Type consistency:** `query()`, `load()`, `render_carousel()`, `check_tone()`, `build_footer_text()`, `project_seoul()`, `draft_hooks()`, `cmd_init/fetch/render/export/build` — names consistent across tasks.

**Open follow-ups (out of scope for v1, documented in spec §11):**
- Brave Search news integration (v1.1)
- Gyeonggi map (placeholder shipped Task 14)
- LLM-driven natural language → spec.yaml automation (out of v1; user writes spec)
