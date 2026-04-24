# Pipeline Full Orchestration (Plans 2-5 Combined) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/pipeline zipsaja <주제>` 실행 시 **data + carousel + reels + Excel + PDF + 캡션(IG/Threads/LinkedIn)** 까지 한번에 자동 생성하도록 파이프라인 확장.

**Architecture:** Plan 1 MVP(pipeline master + zipsaja-data-fetch) 위에 4개 content-* 모듈 추가. 캐러셀은 기존 `brands/zipsaja/` asset 재활용(Python Jinja2 템플릿 + Puppeteer), 릴스는 기존 `.claude/skills/carousel/brands/zipsaja/reels/` Remotion 프로젝트 재활용(필드 매핑 + `npm run build:seoul`). 첨부자료는 openpyxl + weasyprint. 캡션은 Anthropic API(3 플랫폼별 프롬프트).

**Tech Stack:** Python 3.11, Jinja2, openpyxl, weasyprint, anthropic SDK, Node.js (기존 Puppeteer/Remotion), pytest.

---

## File Structure

**Create:**
```
scripts/content_carousel/
├── __init__.py
├── __main__.py                        # CLI
├── render.py                          # Python: data.json → HTML → PNG (Puppeteer)
├── templates/
│   └── zipsaja_apartment_compare.html.j2   # Jinja2 template for 25-district compare
└── capture.mjs                        # Puppeteer script (adapted from existing brands/zipsaja/capture.mjs)

scripts/content_reels/
├── __init__.py
├── __main__.py                        # CLI
└── render.py                          # field-map data.json → seoul-prices.json + trigger npm run build:seoul + ffmpeg trim

scripts/content_attachments/
├── __init__.py
├── __main__.py                        # CLI (both formats)
├── excel.py                           # openpyxl Excel generator
└── pdf.py                             # weasyprint PDF generator (HTML → PDF)

scripts/content_captions/
├── __init__.py
├── __main__.py                        # CLI
├── prompts.py                         # Per-platform prompt templates (IG/Threads/LinkedIn)
└── generate.py                        # Claude API invocation + 3-variant output

tests/content_carousel/
├── __init__.py
└── test_render.py

tests/content_reels/
├── __init__.py
└── test_field_mapping.py

tests/content_attachments/
├── __init__.py
├── test_excel.py
└── test_pdf.py

tests/content_captions/
├── __init__.py
└── test_prompts.py

.claude/skills/content-carousel/SKILL.md
.claude/skills/content-reels/SKILL.md
.claude/skills/content-attachments/SKILL.md
.claude/skills/content-captions/SKILL.md
```

**Modify:**
- `scripts/pipeline/__main__.py` — after data fetch, chain 4 content steps (carousel → reels → attachments → captions)
- `scripts/pipeline/state.py` — extend `artifacts` handling (carousel path, reels path, excel, pdf, captions)
- `AGENTS.md` §8 — update deliverables status (Plan 2-5 → ✅)
- `pyproject.toml` — add `jinja2`, `openpyxl`, `weasyprint`, `anthropic` to optional group

---

## Scope Check

This plan touches 4 independent deliverables. Each could stand alone as its own plan. Combined here per user request for "all at once" orchestration. If implementation stalls, **split into 4 plans** post-hoc (content-carousel alone can validate the orchestration pattern).

---

### Task 1: Dependencies + pyproject

**Files:**
- Modify: `pyproject.toml`

- [ ] **Step 1: Add optional-dependencies group**

Edit `pyproject.toml`. Add new optional group after existing ones:

```toml
content = [
    "jinja2>=3.1",
    "openpyxl>=3.1",
    "weasyprint>=62.0",
    "anthropic>=0.69",
]
```

- [ ] **Step 2: Install**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
pip install 'jinja2>=3.1' 'openpyxl>=3.1' 'weasyprint>=62.0' 'anthropic>=0.69'
```

Expected: all four install without error. weasyprint may need `brew install pango` on macOS — if missing, run `brew install pango` first.

- [ ] **Step 3: Smoke test imports**

```bash
python3 -c "import jinja2, openpyxl, weasyprint, anthropic; print('OK')"
```

Expected: `OK`.

- [ ] **Step 4: Commit**

```bash
git add pyproject.toml
git commit -m "chore(pipeline): content 의존성 그룹 추가 (jinja2, openpyxl, weasyprint, anthropic)"
```

---

### Task 2: content-carousel — Jinja2 HTML template + render module

**Files:**
- Create: `scripts/content_carousel/__init__.py`
- Create: `scripts/content_carousel/templates/zipsaja_apartment_compare.html.j2`
- Create: `scripts/content_carousel/render.py`
- Create: `tests/content_carousel/__init__.py`
- Create: `tests/content_carousel/test_render.py`

- [ ] **Step 1: HTML Jinja2 template for 25-district comparison**

File: `scripts/content_carousel/templates/zipsaja_apartment_compare.html.j2`

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>{{ dataset.title }}</title>
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;700;900&family=Gaegu:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Noto Sans KR', sans-serif; color:#1a1a1a; background:#F0E7D6; }
  .slide {
    width:1080px; height:1440px; padding:80px 70px;
    display:flex; flex-direction:column; position:relative;
    page-break-after:always; background:#F0E7D6;
  }
  .cover h1 { font-family:'Jua'; font-size:96px; line-height:1.1; text-align:center; margin-top:120px; }
  .cover .pill {
    display:inline-block; background:#EA2E00; color:#fff;
    padding:14px 36px; border-radius:999px; font-family:'Jua'; font-size:56px;
  }
  .cover .subtitle { text-align:center; font-size:32px; margin-top:48px; color:#555; font-weight:500; }
  .cover .source { position:absolute; bottom:80px; left:0; right:0; text-align:center; font-family:'Gaegu'; font-size:28px; color:#EA2E00; }
  .data h2 { font-family:'Jua'; font-size:56px; margin-bottom:16px; }
  .data .meta { font-size:22px; color:#666; margin-bottom:28px; }
  table { width:100%; border-collapse:collapse; background:#F5EDE0; border:3px solid #1a1a1a; border-radius:16px; overflow:hidden; }
  th { background:#EA2E00; color:#fff; font-family:'Jua'; font-size:26px; padding:14px 12px; text-align:center; }
  td { font-family:'Noto Sans KR'; font-weight:700; font-size:24px; padding:10px 12px; border-bottom:1px solid rgba(0,0,0,0.08); }
  td.gu { color:#EA2E00; font-family:'Jua'; text-align:left; font-size:26px; }
  td.price { text-align:right; }
  td.pct { text-align:right; font-weight:900; }
  .pct.pos { color:#EA2E00; }
  .pct.neg { color:#1A4FA0; }
  .bar-cell { position:relative; height:22px; background:transparent; }
  .zero { position:absolute; left:50%; top:0; bottom:0; width:2px; background:#888; }
  .bar { position:absolute; top:2px; height:18px; }
  .bar.pos { left:50%; background:#EA2E00; }
  .bar.neg { background:#1A4FA0; }
  .footer-cta {
    background:#1a1a1a; color:#fff; border-radius:20px;
    padding:48px 40px; margin-top:auto; text-align:center;
  }
  .footer-cta .hook { font-family:'Gaegu'; font-size:36px; color:#EA2E00; margin-bottom:16px; }
  .footer-cta h3 { font-family:'Jua'; font-size:52px; color:#fff; line-height:1.15; }
</style>
</head>
<body>

<div class="slide cover">
  <h1><span class="pill">{{ dataset.title_short }}</span></h1>
  <h1 style="font-size:72px; margin-top:36px;">{{ dataset.title_rest }}</h1>
  <p class="subtitle">{{ dataset.subtitle }}<br>{{ dataset.periodLabel }}</p>
  <p class="source">{{ dataset.source }}</p>
</div>

{% for chunk in district_chunks %}
<div class="slide data">
  <h2>{{ chunk.header }}</h2>
  <p class="meta">{{ dataset.sizeLabel | default('300세대 이상 아파트 · 평형 무관') }}</p>
  <table>
    <thead>
      <tr>
        <th style="width:20%;">지역</th>
        <th style="width:25%;">취임 전</th>
        <th style="width:25%;">취임 후</th>
        <th style="width:20%;">바 차트</th>
        <th style="width:10%;">변동률</th>
      </tr>
    </thead>
    <tbody>
      {% for d in chunk.rows %}
      <tr>
        <td class="gu">{{ d.district }}</td>
        <td class="price">{{ d.priceBefore_display }}</td>
        <td class="price">{{ d.priceAfter_display }}</td>
        <td class="bar-cell">
          <div class="zero"></div>
          <div class="bar {% if d.changePct >= 0 %}pos{% else %}neg{% endif %}"
               style="width:{{ d.bar_width_px }}px; {% if d.changePct < 0 %}left:calc(50% - {{ d.bar_width_px }}px);{% endif %}"></div>
        </td>
        <td class="pct {% if d.changePct >= 0 %}pos{% else %}neg{% endif %}">
          {% if d.changePct >= 0 %}+{% endif %}{{ "%.1f"|format(d.changePct) }}%
        </td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</div>
{% endfor %}

<div class="slide cover">
  <h1 style="margin-top:200px;"><span class="pill">데이터 더</span></h1>
  <h1 style="font-size:72px; margin-top:36px;">궁금하지?</h1>
  <div class="footer-cta">
    <p class="hook">💬 댓글 달면 보내줄게</p>
    <h3>"엑셀" — 데이터 파일<br>"PDF" — 요약 리포트</h3>
  </div>
  <p class="source">{{ dataset.source }}</p>
</div>

</body>
</html>
```

- [ ] **Step 2: Write the failing test**

File: `tests/content_carousel/test_render.py`

```python
from pathlib import Path

from scripts.content_carousel.render import (
    build_context,
    format_price_display,
    chunk_districts,
)


def test_format_price_display_full_eok():
    assert format_price_display(50000) == "5억"


def test_format_price_display_with_remainder():
    assert format_price_display(31682) == "3억 1,682만원"


def test_format_price_display_small():
    assert format_price_display(500) == "500만원"


def test_chunk_districts_splits_evenly():
    rows = [{"district": f"{i}구"} for i in range(25)]
    chunks = chunk_districts(rows, per_slide=8)
    assert len(chunks) == 4  # 8+8+8+1
    assert len(chunks[0]["rows"]) == 8
    assert chunks[-1]["header"].endswith("25구")


def test_chunk_districts_headers():
    rows = [
        {"district": "서초구"},
        {"district": "강남구"},
        {"district": "도봉구"},
    ]
    chunks = chunk_districts(rows, per_slide=2)
    assert chunks[0]["header"] == "서초구 ~ 강남구"
    assert chunks[1]["header"] == "도봉구"


def test_build_context_adds_bar_widths():
    dataset = {
        "title": "이재명 대통령 당선후 서울 실거래 변화",
        "subtitle": "",
        "periodLabel": "",
        "source": "",
        "sizeLabel": "",
        "districts": [
            {"district": "광진구", "priceBefore": 14487, "priceAfter": 16997, "changePct": 17.3},
            {"district": "강남구", "priceBefore": 26318, "priceAfter": 26915, "changePct": 2.3},
        ],
    }
    ctx = build_context(dataset, max_bar_px=100, per_slide=2)
    # bar width for largest change = max_bar_px
    chunk0 = ctx["district_chunks"][0]
    row0 = chunk0["rows"][0]
    assert row0["bar_width_px"] == 100  # largest |changePct|
    assert row0["priceBefore_display"] == "1억 4,487만원"
    assert row0["priceAfter_display"] == "1억 6,997만원"


def test_build_context_title_split():
    dataset = {
        "title": "이재명 대통령 당선후 서울 실거래 변화",
        "subtitle": "",
        "periodLabel": "",
        "source": "",
        "sizeLabel": "",
        "districts": [],
    }
    ctx = build_context(dataset, max_bar_px=100, per_slide=8)
    # Title split: short (pill) + rest (large text)
    assert ctx["dataset"]["title_short"] == "이재명 대통령 당선후"
    assert ctx["dataset"]["title_rest"] == "서울 실거래 변화"
```

- [ ] **Step 3: Run — expect fail**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
mkdir -p tests/content_carousel
touch tests/content_carousel/__init__.py
python -m pytest tests/content_carousel/test_render.py -v
```

Expected: ModuleNotFoundError.

- [ ] **Step 4: Implement render.py**

File: `scripts/content_carousel/__init__.py`

```python
"""content-carousel — zipsaja dataset → HTML + PNG slides."""
```

File: `scripts/content_carousel/render.py`

```python
"""Render zipsaja dataset into HTML slides via Jinja2 template.

Used by the /pipeline master for the carousel step. Captures PNG slides
via Puppeteer (capture.mjs) after HTML is written.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

_TEMPLATE_DIR = Path(__file__).parent / "templates"


def format_price_display(manwon: int) -> str:
    """Format 만원 → '3억 1,682만원' or '5억' or '500만원'."""
    if manwon >= 10_000:
        eok = manwon // 10_000
        rest = manwon % 10_000
        if rest == 0:
            return f"{eok}억"
        return f"{eok}억 {rest:,}만원"
    return f"{manwon:,}만원"


def chunk_districts(districts: list[dict[str, Any]], *, per_slide: int) -> list[dict[str, Any]]:
    """Split districts into per-slide chunks with generated headers."""
    chunks: list[dict[str, Any]] = []
    for i in range(0, len(districts), per_slide):
        rows = districts[i : i + per_slide]
        if len(rows) == 1:
            header = rows[0]["district"]
        else:
            header = f"{rows[0]['district']} ~ {rows[-1]['district']}"
        chunks.append({"header": header, "rows": rows})
    return chunks


def _split_title(title: str) -> tuple[str, str]:
    """Split title into (short-for-pill, rest-for-large-text)."""
    # heuristic: split at 3rd space, else halfway
    parts = title.split(" ")
    if len(parts) >= 4:
        short = " ".join(parts[:3])
        rest = " ".join(parts[3:])
    else:
        mid = len(parts) // 2
        short = " ".join(parts[:mid]) if mid else title
        rest = " ".join(parts[mid:]) if mid else ""
    return short, rest


def build_context(
    dataset: dict[str, Any], *, max_bar_px: int = 100, per_slide: int = 8
) -> dict[str, Any]:
    """Prepare Jinja2 context from raw dataset."""
    max_abs = max((abs(d["changePct"]) for d in dataset["districts"]), default=1.0) or 1.0
    districts_prepared = []
    for d in dataset["districts"]:
        districts_prepared.append({
            **d,
            "priceBefore_display": format_price_display(d["priceBefore"]),
            "priceAfter_display": format_price_display(d["priceAfter"]),
            "bar_width_px": int(round(abs(d["changePct"]) / max_abs * max_bar_px)),
        })

    title_short, title_rest = _split_title(dataset["title"])
    enriched_dataset = {
        **dataset,
        "title_short": title_short,
        "title_rest": title_rest,
    }

    return {
        "dataset": enriched_dataset,
        "district_chunks": chunk_districts(districts_prepared, per_slide=per_slide),
    }


def render_html(dataset: dict[str, Any], *, per_slide: int = 8) -> str:
    env = Environment(
        loader=FileSystemLoader(str(_TEMPLATE_DIR)),
        autoescape=select_autoescape(["html"]),
    )
    template = env.get_template("zipsaja_apartment_compare.html.j2")
    ctx = build_context(dataset, per_slide=per_slide)
    return template.render(**ctx)
```

- [ ] **Step 5: Run — expect 6 passed**

```bash
python -m pytest tests/content_carousel/test_render.py -v
```

Expected: 6 passed.

- [ ] **Step 6: Commit**

```bash
git add scripts/content_carousel/__init__.py \
        scripts/content_carousel/render.py \
        scripts/content_carousel/templates/zipsaja_apartment_compare.html.j2 \
        tests/content_carousel/__init__.py \
        tests/content_carousel/test_render.py
git commit -m "feat(content-carousel): Jinja2 템플릿 + HTML 렌더 + 가격/바 포맷 유틸"
```

---

### Task 3: content-carousel — Puppeteer capture + CLI

**Files:**
- Create: `scripts/content_carousel/capture.mjs`
- Create: `scripts/content_carousel/__main__.py`

- [ ] **Step 1: Puppeteer capture script (Node.js)**

File: `scripts/content_carousel/capture.mjs`

```javascript
// Captures each .slide div inside the rendered HTML as a separate PNG.
// Usage: node capture.mjs <html-path> <out-dir>
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";

async function main() {
  const [, , htmlPath, outDir] = process.argv;
  if (!htmlPath || !outDir) {
    console.error("Usage: node capture.mjs <html-path> <out-dir>");
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });
  const absHtml = path.resolve(htmlPath);
  const url = `file://${absHtml}`;

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");

  const count = await page.evaluate(() => document.querySelectorAll(".slide").length);
  console.log(`found ${count} slides`);

  for (let i = 0; i < count; i++) {
    const handle = await page.evaluateHandle((idx) => document.querySelectorAll(".slide")[idx], i);
    const slide = handle.asElement();
    const file = path.join(outDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
    await slide.screenshot({ path: file });
    console.log(`captured ${file}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Python CLI**

File: `scripts/content_carousel/__main__.py`

```python
"""CLI for content-carousel.

Usage:
  python3 -m scripts.content_carousel \\
    --data brands/zipsaja/zipsaja_pipeline_.../data.json \\
    --out brands/zipsaja/zipsaja_pipeline_.../carousel/
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

from .render import render_html

_CAPTURE_MJS = Path(__file__).parent / "capture.mjs"


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="content_carousel")
    p.add_argument("--data", type=Path, required=True, help="data.json input")
    p.add_argument("--out", type=Path, required=True, help="Carousel output directory")
    p.add_argument("--per-slide", type=int, default=8, help="Districts per slide (default 8)")
    p.add_argument("--no-capture", action="store_true", help="Only write HTML, skip PNG")
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    dataset = json.loads(args.data.read_text(encoding="utf-8"))
    html = render_html(dataset, per_slide=args.per_slide)

    args.out.mkdir(parents=True, exist_ok=True)
    html_path = args.out / "slides.html"
    html_path.write_text(html, encoding="utf-8")
    print(f"[content-carousel] wrote {html_path}", file=sys.stderr)

    if args.no_capture:
        return 0

    # Run Puppeteer capture
    result = subprocess.run(
        ["node", str(_CAPTURE_MJS), str(html_path), str(args.out)],
        cwd=str(Path(__file__).parent),
        check=False,
    )
    if result.returncode != 0:
        print(f"[content-carousel] capture FAILED ({result.returncode})", file=sys.stderr)
        return result.returncode

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 3: Install puppeteer at content_carousel dir**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero/scripts/content_carousel
npm init -y > /dev/null 2>&1
npm install puppeteer 2>&1 | tail -3
# Verify
node -e "require('puppeteer')" && echo "OK"
```

Expected: `OK`.

- [ ] **Step 4: Gitignore content_carousel/node_modules**

Edit `/Users/zerowater/Dropbox/zerowater/howzero/.gitignore` — append:
```
scripts/content_carousel/node_modules/
scripts/content_carousel/package-lock.json
```

- [ ] **Step 5: Dry-run HTML only (no capture)**

```bash
# Reuse Plan 1's existing data.json
python3 -m scripts.content_carousel \
  --data "brands/zipsaja/zipsaja_pipeline_이재명-당선후-서울-실거래-변화/data.json" \
  --out /tmp/carousel-dry \
  --no-capture
ls -la /tmp/carousel-dry/slides.html
echo "--- slide count ---"
grep -c 'class="slide' /tmp/carousel-dry/slides.html
```

Expected: slides.html exists, 6 slides (cover + 4 data chunks of 25/8=3.125 → 4 chunks + cta = 6).

- [ ] **Step 6: Full capture test**

```bash
python3 -m scripts.content_carousel \
  --data "brands/zipsaja/zipsaja_pipeline_이재명-당선후-서울-실거래-변화/data.json" \
  --out /tmp/carousel-full
ls /tmp/carousel-full/*.png | head -10
```

Expected: 6 PNG files.

- [ ] **Step 7: Commit**

```bash
git add scripts/content_carousel/capture.mjs \
        scripts/content_carousel/__main__.py \
        scripts/content_carousel/package.json \
        .gitignore
git commit -m "feat(content-carousel): Puppeteer 캡처 + Python CLI — HTML → PNG 자동화"
```

---

### Task 4: content-reels — 필드 매핑 + Remotion 호출

Existing Remotion component `SeoulPriceReel.tsx` uses `priceLastYear`/`priceThisYear` but Plan 1's data.json uses `priceBefore`/`priceAfter`. Map before rendering.

**Files:**
- Create: `scripts/content_reels/__init__.py`
- Create: `scripts/content_reels/__main__.py`
- Create: `scripts/content_reels/render.py`
- Create: `tests/content_reels/__init__.py`
- Create: `tests/content_reels/test_field_mapping.py`

- [ ] **Step 1: Test for field mapping**

File: `tests/content_reels/test_field_mapping.py`

```python
from scripts.content_reels.render import map_to_remotion_schema


def test_maps_price_before_after_to_last_this_year():
    src = {
        "generatedAt": "2026-04-24T00:00:00+09:00",
        "title": "이재명 대통령 당선후 서울 실거래 변화",
        "subtitle": "취임 전 12개월 vs 취임 후",
        "periodLabel": "2024.6 ~ 2025.6 vs 2025.6 ~ 현재",
        "source": "국토부 실거래가 (매매)",
        "sizeLabel": "300세대 이상 · 평형 무관",
        "districts": [
            {"district": "광진구", "priceBefore": 14487, "priceAfter": 16997, "changePct": 17.3},
        ],
    }
    mapped = map_to_remotion_schema(src)
    assert "sizeLabel" in mapped
    assert mapped["sizeLabel"] == "300세대 이상 · 평형 무관"
    d = mapped["districts"][0]
    assert d["priceLastYear"] == 14487
    assert d["priceThisYear"] == 16997
    assert d["changePct"] == 17.3
    assert d["district"] == "광진구"
    # Remotion component doesn't expect priceBefore/priceAfter — check they're gone
    assert "priceBefore" not in d
    assert "priceAfter" not in d


def test_map_preserves_generated_at_and_source():
    src = {
        "generatedAt": "2026-04-24T00:00:00+09:00",
        "title": "",
        "subtitle": "",
        "periodLabel": "label",
        "source": "src",
        "sizeLabel": "",
        "districts": [],
    }
    mapped = map_to_remotion_schema(src)
    assert mapped["generatedAt"] == "2026-04-24T00:00:00+09:00"
    assert mapped["source"] == "src"
    assert mapped["periodLabel"] == "label"
```

- [ ] **Step 2: Run — expect fail**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
mkdir -p tests/content_reels
touch tests/content_reels/__init__.py
python -m pytest tests/content_reels/test_field_mapping.py -v
```

- [ ] **Step 3: Implement render.py**

File: `scripts/content_reels/__init__.py`
```python
"""content-reels — data.json → Remotion render trigger."""
```

File: `scripts/content_reels/render.py`

```python
"""Map Plan 1 data.json schema → existing Remotion component schema + trigger render."""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

# Existing Remotion project location (no duplication — reuse)
REELS_PROJECT = (
    Path(__file__).resolve().parents[2]
    / ".claude/skills/carousel/brands/zipsaja/reels"
)
REELS_DATA_TARGET = REELS_PROJECT / "public/data/seoul-prices.json"


def map_to_remotion_schema(src: dict[str, Any]) -> dict[str, Any]:
    """Convert pipeline data.json → SeoulPriceReel's expected shape.

    Field renames:
      priceBefore  → priceLastYear
      priceAfter   → priceThisYear
    """
    mapped_districts = []
    for d in src["districts"]:
        mapped_districts.append({
            "district": d["district"],
            "priceLastYear": d["priceBefore"],
            "priceThisYear": d["priceAfter"],
            "changePct": d["changePct"],
        })
    return {
        "generatedAt": src["generatedAt"],
        "title": src.get("title", ""),
        "subtitle": src.get("subtitle", ""),
        "periodLabel": src["periodLabel"],
        "sizeLabel": src.get("sizeLabel", ""),
        "source": src["source"],
        "districts": mapped_districts,
    }


def trigger_remotion_render(*, out_path: Path) -> int:
    """Run `npm run build:seoul` in the Remotion project.

    The project's `build:seoul` script renders SeoulPriceReel to
    `out/zipsaja-seoul-price.mp4`. We then copy the result to `out_path`.
    """
    result = subprocess.run(
        ["npm", "run", "build:seoul"],
        cwd=str(REELS_PROJECT),
        check=False,
    )
    if result.returncode != 0:
        return result.returncode

    remotion_out = REELS_PROJECT / "out" / "zipsaja-seoul-price.mp4"
    if not remotion_out.exists():
        print(f"[content-reels] ERROR: {remotion_out} not produced", file=sys.stderr)
        return 3

    out_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(remotion_out, out_path)
    print(f"[content-reels] copied → {out_path}", file=sys.stderr)
    return 0


def ffmpeg_trim_22s(src: Path, dst: Path) -> int:
    """Re-encode + trim to 22 seconds with CRF 18."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(src),
            "-t", "22",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            str(dst),
        ],
        check=False,
    )
    return result.returncode
```

- [ ] **Step 4: Run — expect 2 passed**

```bash
python -m pytest tests/content_reels/test_field_mapping.py -v
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/content_reels/__init__.py \
        scripts/content_reels/render.py \
        tests/content_reels/__init__.py \
        tests/content_reels/test_field_mapping.py
git commit -m "feat(content-reels): 필드 매핑(priceBefore/After → priceLastYear/ThisYear) + Remotion 호출 + ffmpeg 트림"
```

---

### Task 5: content-reels — CLI

**Files:**
- Create: `scripts/content_reels/__main__.py`

- [ ] **Step 1: Implement CLI**

File: `scripts/content_reels/__main__.py`

```python
"""CLI for content-reels.

Usage:
  python3 -m scripts.content_reels \\
    --data brands/zipsaja/zipsaja_pipeline_.../data.json \\
    --out brands/zipsaja/zipsaja_pipeline_.../reels/
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .render import (
    REELS_DATA_TARGET,
    ffmpeg_trim_22s,
    map_to_remotion_schema,
    trigger_remotion_render,
)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="content_reels")
    p.add_argument("--data", type=Path, required=True, help="Pipeline data.json")
    p.add_argument("--out", type=Path, required=True, help="Reels output directory")
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    src = json.loads(args.data.read_text(encoding="utf-8"))
    remotion_data = map_to_remotion_schema(src)

    # Write mapped data into Remotion project's expected location
    REELS_DATA_TARGET.parent.mkdir(parents=True, exist_ok=True)
    REELS_DATA_TARGET.write_text(json.dumps(remotion_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[content-reels] wrote mapped data → {REELS_DATA_TARGET}", file=sys.stderr)

    # Render
    args.out.mkdir(parents=True, exist_ok=True)
    full_out = args.out / "full.mp4"
    rc = trigger_remotion_render(out_path=full_out)
    if rc != 0:
        return rc

    # Trim to 22s
    trimmed = args.out / "zipsaja-reel-22s.mp4"
    rc = ffmpeg_trim_22s(full_out, trimmed)
    if rc != 0:
        return rc

    print(f"[content-reels] final → {trimmed}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 2: Verify dry-run (module imports)**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
python3 -m scripts.content_reels --help 2>&1 | head -10
```

Expected: argparse help output.

- [ ] **Step 3: Commit**

```bash
git add scripts/content_reels/__main__.py
git commit -m "feat(content-reels): CLI — data.json 매핑 → Remotion 렌더 → ffmpeg 트림"
```

---

### Task 6: content-attachments — Excel generator

**Files:**
- Create: `scripts/content_attachments/__init__.py`
- Create: `scripts/content_attachments/excel.py`
- Create: `tests/content_attachments/__init__.py`
- Create: `tests/content_attachments/test_excel.py`

- [ ] **Step 1: Write test**

File: `tests/content_attachments/test_excel.py`

```python
from pathlib import Path

from openpyxl import load_workbook

from scripts.content_attachments.excel import write_excel


def test_write_excel_produces_file(tmp_path: Path):
    dataset = {
        "title": "이재명 대통령 당선후 서울 실거래 변화",
        "periodLabel": "2024.6 ~ 2025.6 vs 2025.6 ~ 현재",
        "source": "국토부 실거래가 (매매)",
        "districts": [
            {"district": "광진구", "priceBefore": 14487, "priceAfter": 16997, "changePct": 17.3},
            {"district": "강남구", "priceBefore": 26318, "priceAfter": 26915, "changePct": 2.3},
        ],
    }
    out = tmp_path / "out.xlsx"
    write_excel(dataset, out)
    assert out.exists()

    wb = load_workbook(out)
    ws = wb.active
    # Row 1: title header
    assert ws["A1"].value == "이재명 대통령 당선후 서울 실거래 변화"
    # Row 3: column headers
    assert ws["A3"].value == "지역"
    assert ws["B3"].value == "취임 전 (만원)"
    assert ws["C3"].value == "취임 후 (만원)"
    assert ws["D3"].value == "변동률(%)"
    # Row 4: first data row
    assert ws["A4"].value == "광진구"
    assert ws["B4"].value == 14487
    assert ws["C4"].value == 16997
    assert ws["D4"].value == 17.3


def test_write_excel_25_districts(tmp_path: Path):
    dataset = {
        "title": "t",
        "periodLabel": "",
        "source": "",
        "districts": [
            {"district": f"{i}구", "priceBefore": 100, "priceAfter": 110, "changePct": 10.0}
            for i in range(25)
        ],
    }
    out = tmp_path / "out.xlsx"
    write_excel(dataset, out)
    wb = load_workbook(out)
    ws = wb.active
    # Last data row at A28 (3 header rows + 25 districts)
    assert ws["A28"].value == "24구"
```

- [ ] **Step 2: Run — expect fail**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
mkdir -p tests/content_attachments
touch tests/content_attachments/__init__.py
python -m pytest tests/content_attachments/test_excel.py -v
```

- [ ] **Step 3: Implement excel.py**

File: `scripts/content_attachments/__init__.py`
```python
"""content-attachments — Excel + PDF deliverables."""
```

File: `scripts/content_attachments/excel.py`

```python
"""Excel generator using openpyxl — outputs a styled .xlsx with dataset rows."""
from __future__ import annotations

from pathlib import Path
from typing import Any

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter


def write_excel(dataset: dict[str, Any], out_path: Path) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "서울 실거래"

    # A1: title (merged)
    ws["A1"] = dataset["title"]
    ws["A1"].font = Font(name="Malgun Gothic", size=16, bold=True, color="EA2E00")
    ws.merge_cells("A1:D1")
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")

    # A2: subtitle (period + source)
    ws["A2"] = f"{dataset['periodLabel']} · {dataset['source']}"
    ws["A2"].font = Font(name="Malgun Gothic", size=11, italic=True, color="555555")
    ws.merge_cells("A2:D2")
    ws["A2"].alignment = Alignment(horizontal="center")

    # Row 3: column headers
    headers = ["지역", "취임 전 (만원)", "취임 후 (만원)", "변동률(%)"]
    for col, name in enumerate(headers, start=1):
        cell = ws.cell(row=3, column=col, value=name)
        cell.font = Font(name="Malgun Gothic", size=12, bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color="EA2E00", end_color="EA2E00", fill_type="solid")
        cell.alignment = Alignment(horizontal="center")

    # Data rows
    for i, d in enumerate(dataset["districts"], start=4):
        ws.cell(row=i, column=1, value=d["district"]).font = Font(name="Malgun Gothic", bold=True)
        ws.cell(row=i, column=2, value=d["priceBefore"])
        ws.cell(row=i, column=3, value=d["priceAfter"])
        pct_cell = ws.cell(row=i, column=4, value=d["changePct"])
        pct_cell.font = Font(
            name="Malgun Gothic",
            color="EA2E00" if d["changePct"] >= 0 else "1A4FA0",
            bold=True,
        )

    # Column widths
    for col, width in enumerate([12, 18, 18, 14], start=1):
        ws.column_dimensions[get_column_letter(col)].width = width

    out_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(out_path)
```

- [ ] **Step 4: Run — expect 2 passed**

```bash
python -m pytest tests/content_attachments/test_excel.py -v
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/content_attachments/__init__.py \
        scripts/content_attachments/excel.py \
        tests/content_attachments/__init__.py \
        tests/content_attachments/test_excel.py
git commit -m "feat(content-attachments): openpyxl Excel 생성기 — 제목+헤더+25개 구 스타일링"
```

---

### Task 7: content-attachments — PDF generator (weasyprint)

Reuse carousel HTML but add a summary/insight layer. For MVP, PDF is a longer-form version of the data: title page + full table + 3-sentence insight summary.

**Files:**
- Create: `scripts/content_attachments/pdf.py`
- Create: `scripts/content_attachments/templates/insight_pdf.html.j2`
- Create: `tests/content_attachments/test_pdf.py`

- [ ] **Step 1: PDF template**

File: `scripts/content_attachments/templates/insight_pdf.html.j2`

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>{{ dataset.title }}</title>
<style>
  @page { size: A4; margin: 2cm; }
  body { font-family: 'Malgun Gothic', sans-serif; color:#1a1a1a; line-height:1.5; }
  h1 { color:#EA2E00; font-size:28px; border-bottom:3px solid #EA2E00; padding-bottom:8px; }
  h2 { color:#1a1a1a; font-size:18px; margin-top:24px; }
  .meta { color:#666; font-size:12px; margin:8px 0 24px; }
  table { width:100%; border-collapse:collapse; margin-top:12px; }
  th { background:#F5EDE0; color:#1a1a1a; padding:8px; border:1px solid #ccc; font-size:12px; }
  td { padding:6px 8px; border:1px solid #eee; font-size:12px; }
  td.gu { color:#EA2E00; font-weight:700; }
  td.price { text-align:right; }
  td.pct { text-align:right; font-weight:700; }
  td.pct.pos { color:#EA2E00; }
  td.pct.neg { color:#1A4FA0; }
  .summary { background:#F5EDE0; border-left:4px solid #EA2E00; padding:16px; margin-top:24px; }
  .summary p { margin:4px 0; }
  .footer { margin-top:32px; padding-top:12px; border-top:1px solid #ccc; color:#888; font-size:10px; }
</style>
</head>
<body>

<h1>{{ dataset.title }}</h1>
<p class="meta">{{ dataset.periodLabel }} · 출처 {{ dataset.source }}</p>

<h2>요약 인사이트</h2>
<div class="summary">
  <p><strong>최대 상승:</strong> {{ insights.top_gu }} {{ "%+.1f"|format(insights.top_pct) }}%</p>
  <p><strong>최대 하락:</strong> {{ insights.bottom_gu }} {{ "%+.1f"|format(insights.bottom_pct) }}%</p>
  <p><strong>전체 평균:</strong> {{ "%+.1f"|format(insights.avg_pct) }}%</p>
</div>

<h2>전체 25개 구 데이터</h2>
<table>
  <thead>
    <tr>
      <th>지역</th>
      <th>취임 전 (만원)</th>
      <th>취임 후 (만원)</th>
      <th>변동률</th>
    </tr>
  </thead>
  <tbody>
    {% for d in dataset.districts %}
    <tr>
      <td class="gu">{{ d.district }}</td>
      <td class="price">{{ "{:,}".format(d.priceBefore) }}</td>
      <td class="price">{{ "{:,}".format(d.priceAfter) }}</td>
      <td class="pct {% if d.changePct >= 0 %}pos{% else %}neg{% endif %}">
        {% if d.changePct >= 0 %}+{% endif %}{{ "%.1f"|format(d.changePct) }}%
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

<div class="footer">
  생성 시각 {{ dataset.generatedAt }} · 집사자 (zipsaja)
</div>

</body>
</html>
```

- [ ] **Step 2: Write test**

File: `tests/content_attachments/test_pdf.py`

```python
from pathlib import Path

from scripts.content_attachments.pdf import compute_insights, write_pdf


def test_compute_insights_top_and_bottom():
    districts = [
        {"district": "광진구", "changePct": 17.3},
        {"district": "종로구", "changePct": -6.9},
        {"district": "강남구", "changePct": 2.3},
    ]
    ins = compute_insights(districts)
    assert ins["top_gu"] == "광진구"
    assert ins["top_pct"] == 17.3
    assert ins["bottom_gu"] == "종로구"
    assert ins["bottom_pct"] == -6.9
    # avg = (17.3 - 6.9 + 2.3) / 3 ≈ 4.2
    assert round(ins["avg_pct"], 1) == 4.2


def test_write_pdf_produces_nonempty_file(tmp_path: Path):
    dataset = {
        "title": "이재명 대통령 당선후 서울 실거래 변화",
        "periodLabel": "2024.6 ~ 2025.6 vs 2025.6 ~ 현재",
        "source": "국토부",
        "generatedAt": "2026-04-24T00:00:00+09:00",
        "districts": [
            {"district": "광진구", "priceBefore": 14487, "priceAfter": 16997, "changePct": 17.3},
            {"district": "강남구", "priceBefore": 26318, "priceAfter": 26915, "changePct": 2.3},
        ],
    }
    out = tmp_path / "out.pdf"
    write_pdf(dataset, out)
    assert out.exists()
    assert out.stat().st_size > 1000  # Non-trivial PDF
    # Magic bytes
    assert out.read_bytes()[:4] == b"%PDF"
```

- [ ] **Step 3: Run — expect fail**

```bash
python -m pytest tests/content_attachments/test_pdf.py -v
```

- [ ] **Step 4: Implement pdf.py**

File: `scripts/content_attachments/pdf.py`

```python
"""PDF generator using weasyprint — HTML + Jinja2 → A4 insight PDF."""
from __future__ import annotations

from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML

_TEMPLATE_DIR = Path(__file__).parent / "templates"


def compute_insights(districts: list[dict[str, Any]]) -> dict[str, Any]:
    if not districts:
        return {"top_gu": "", "top_pct": 0.0, "bottom_gu": "", "bottom_pct": 0.0, "avg_pct": 0.0}
    top = max(districts, key=lambda d: d["changePct"])
    bottom = min(districts, key=lambda d: d["changePct"])
    avg = sum(d["changePct"] for d in districts) / len(districts)
    return {
        "top_gu": top["district"],
        "top_pct": top["changePct"],
        "bottom_gu": bottom["district"],
        "bottom_pct": bottom["changePct"],
        "avg_pct": round(avg, 1),
    }


def write_pdf(dataset: dict[str, Any], out_path: Path) -> None:
    env = Environment(
        loader=FileSystemLoader(str(_TEMPLATE_DIR)),
        autoescape=select_autoescape(["html"]),
    )
    template = env.get_template("insight_pdf.html.j2")
    html = template.render(
        dataset=dataset,
        insights=compute_insights(dataset["districts"]),
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    HTML(string=html).write_pdf(str(out_path))
```

- [ ] **Step 5: Run — expect 2 passed**

```bash
python -m pytest tests/content_attachments/test_pdf.py -v
```

Expected: 2 passed.

- [ ] **Step 6: Commit**

```bash
git add scripts/content_attachments/pdf.py \
        scripts/content_attachments/templates/insight_pdf.html.j2 \
        tests/content_attachments/test_pdf.py
git commit -m "feat(content-attachments): weasyprint PDF 생성기 — A4 인사이트 요약 + 전체 테이블"
```

---

### Task 8: content-attachments — CLI

**Files:**
- Create: `scripts/content_attachments/__main__.py`

- [ ] **Step 1: Implement CLI**

File: `scripts/content_attachments/__main__.py`

```python
"""CLI for content-attachments — writes both Excel and PDF.

Usage:
  python3 -m scripts.content_attachments \\
    --data brands/zipsaja/zipsaja_pipeline_.../data.json \\
    --out brands/zipsaja/zipsaja_pipeline_.../attachments/
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .excel import write_excel
from .pdf import write_pdf


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="content_attachments")
    p.add_argument("--data", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    dataset = json.loads(args.data.read_text(encoding="utf-8"))

    args.out.mkdir(parents=True, exist_ok=True)
    excel_path = args.out / "seoul-price-data.xlsx"
    pdf_path = args.out / "seoul-price-insights.pdf"

    write_excel(dataset, excel_path)
    print(f"[content-attachments] wrote {excel_path}", file=sys.stderr)

    write_pdf(dataset, pdf_path)
    print(f"[content-attachments] wrote {pdf_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 2: Smoke test**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
python3 -m scripts.content_attachments \
  --data "brands/zipsaja/zipsaja_pipeline_이재명-당선후-서울-실거래-변화/data.json" \
  --out /tmp/attachments/
ls -la /tmp/attachments/
```

Expected: `seoul-price-data.xlsx` + `seoul-price-insights.pdf` files.

- [ ] **Step 3: Commit**

```bash
git add scripts/content_attachments/__main__.py
git commit -m "feat(content-attachments): CLI — Excel + PDF 동시 생성"
```

---

### Task 9: content-captions — prompts + generator

**Files:**
- Create: `scripts/content_captions/__init__.py`
- Create: `scripts/content_captions/prompts.py`
- Create: `scripts/content_captions/generate.py`
- Create: `tests/content_captions/__init__.py`
- Create: `tests/content_captions/test_prompts.py`

- [ ] **Step 1: Test**

File: `tests/content_captions/test_prompts.py`

```python
from scripts.content_captions.prompts import (
    instagram_prompt,
    linkedin_prompt,
    threads_prompt,
)


def test_instagram_prompt_contains_lead_magnet_hook_front():
    prompt = instagram_prompt({"title": "t", "insights_text": "x"})
    # Lead-magnet CTA MUST be first-paragraph requirement
    assert "댓글" in prompt
    assert "엑셀" in prompt or "PDF" in prompt
    assert "앞쪽" in prompt or "첫" in prompt or "맨 앞" in prompt


def test_threads_prompt_is_short_conversational():
    prompt = threads_prompt({"title": "t", "insights_text": "x"})
    assert "500자" in prompt or "300자" in prompt or "짧" in prompt
    assert "Threads" in prompt or "대화" in prompt


def test_linkedin_prompt_insight_driven():
    prompt = linkedin_prompt({"title": "t", "insights_text": "x"})
    assert "LinkedIn" in prompt or "링크드인" in prompt
    assert "인사이트" in prompt or "분석" in prompt


def test_all_prompts_embed_context():
    ctx = {"title": "서울 실거래 변화", "insights_text": "광진 +17.3"}
    for fn in (instagram_prompt, threads_prompt, linkedin_prompt):
        p = fn(ctx)
        assert "서울 실거래 변화" in p
        assert "광진 +17.3" in p
```

- [ ] **Step 2: Run — expect fail**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
mkdir -p tests/content_captions
touch tests/content_captions/__init__.py
python -m pytest tests/content_captions/test_prompts.py -v
```

- [ ] **Step 3: Implement prompts.py**

File: `scripts/content_captions/__init__.py`
```python
"""content-captions — Instagram/Threads/LinkedIn 3-variant captions via Anthropic API."""
```

File: `scripts/content_captions/prompts.py`

```python
"""Platform-specific caption prompts.

Each prompt embeds dataset context and constrains the output shape per platform.
zipsaja brand rules: 반말 친구 톤, 오렌지 pill 단어 강조, 이모지 절제.
"""
from __future__ import annotations

from typing import Any

_BRAND_TONE = """브랜드: 집사자(zipsaja) — 친근한 반말 부동산 큐레이터.
- 반말 사용 (~해, ~야, ~다구). 존댓말 금지.
- 도발/위협 톤 금지. 친구가 정리해주는 느낌.
- 이모지 남발 금지 (1-2개만).
- 핵심 숫자를 오렌지색처럼 강조하되 캡션은 plain text."""


def instagram_prompt(ctx: dict[str, Any]) -> str:
    return f"""{_BRAND_TONE}

플랫폼: Instagram 릴스 캡션 (최대 2200자).

요구사항:
1. **첫 문단에 댓글 리드매그넷 훅을 맨 앞에 배치**: "댓글에 '엑셀' 쓰면 데이터 파일, 'PDF' 쓰면 리포트 보내줄게" 스타일.
2. 본문: 주제 요약 + 핵심 수치 3개 소개.
3. 마지막: 해시태그 5-7개 (#서울부동산 #실거래가 #집사자 계열).

데이터 컨텍스트:
- 주제: {ctx['title']}
- 요약: {ctx['insights_text']}

출력: 완성된 Instagram 캡션 하나만. 설명 텍스트 없음."""


def threads_prompt(ctx: dict[str, Any]) -> str:
    return f"""{_BRAND_TONE}

플랫폼: Threads 포스트 (500자 이내, 짧고 대화형).

요구사항:
1. 300~500자 범위의 짧은 호흡.
2. 1-2문장 훅 + 핵심 수치 한 줄 + 의견/질문.
3. 해시태그 2-3개만.

데이터 컨텍스트:
- 주제: {ctx['title']}
- 요약: {ctx['insights_text']}

출력: 완성된 Threads 포스트 하나만."""


def linkedin_prompt(ctx: dict[str, Any]) -> str:
    return f"""{_BRAND_TONE}

플랫폼: LinkedIn 포스트 (1500-2000자). 단, zipsaja 반말 톤 유지.

요구사항:
1. 인사이트 중심 — 수치 나열이 아닌 해석을 제시.
2. 3-4 문단 구성: 훅 → 데이터 → 인사이트(왜?) → 시사점.
3. 해시태그 3-5개 (#부동산 #서울 #실거래 등).

데이터 컨텍스트:
- 주제: {ctx['title']}
- 요약: {ctx['insights_text']}

출력: 완성된 LinkedIn 포스트 하나만."""
```

- [ ] **Step 4: Run — expect 4 passed**

```bash
python -m pytest tests/content_captions/test_prompts.py -v
```

Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/content_captions/__init__.py \
        scripts/content_captions/prompts.py \
        tests/content_captions/__init__.py \
        tests/content_captions/test_prompts.py
git commit -m "feat(content-captions): IG/Threads/LinkedIn 3 플랫폼 프롬프트 + zipsaja 톤 정의"
```

---

### Task 10: content-captions — Anthropic API 호출 + CLI

**Files:**
- Create: `scripts/content_captions/generate.py`
- Create: `scripts/content_captions/__main__.py`

- [ ] **Step 1: Implement generate.py**

File: `scripts/content_captions/generate.py`

```python
"""Call Anthropic API with platform-specific prompts, write 3 caption files."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import anthropic

from .prompts import instagram_prompt, linkedin_prompt, threads_prompt

_DEFAULT_MODEL = "claude-sonnet-4-6"
_MAX_TOKENS = 2048


def _summarize_insights(dataset: dict[str, Any]) -> str:
    """One-line summary text to embed in prompts."""
    districts = dataset.get("districts", [])
    if not districts:
        return "(데이터 없음)"
    top = max(districts, key=lambda d: d["changePct"])
    bottom = min(districts, key=lambda d: d["changePct"])
    avg = sum(d["changePct"] for d in districts) / len(districts)
    return (
        f"상위 {top['district']} {top['changePct']:+.1f}%, "
        f"하위 {bottom['district']} {bottom['changePct']:+.1f}%, "
        f"평균 {avg:+.1f}%"
    )


def _call_claude(client: anthropic.Anthropic, prompt: str) -> str:
    message = client.messages.create(
        model=_DEFAULT_MODEL,
        max_tokens=_MAX_TOKENS,
        messages=[{"role": "user", "content": prompt}],
    )
    return "".join(block.text for block in message.content if hasattr(block, "text")).strip()


def generate_captions(dataset: dict[str, Any], *, out_dir: Path) -> dict[str, Path]:
    """Call Anthropic 3 times, one per platform. Writes IG/Threads/LinkedIn .txt files.

    Returns {platform: path} map.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is required for content-captions")

    client = anthropic.Anthropic(api_key=api_key)

    ctx = {
        "title": dataset.get("title", ""),
        "insights_text": _summarize_insights(dataset),
    }

    results: dict[str, Path] = {}
    for platform, builder in (
        ("instagram", instagram_prompt),
        ("threads", threads_prompt),
        ("linkedin", linkedin_prompt),
    ):
        prompt = builder(ctx)
        text = _call_claude(client, prompt)
        out_path = out_dir / f"{platform}.txt"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(text, encoding="utf-8")
        results[platform] = out_path

    return results
```

- [ ] **Step 2: Implement CLI**

File: `scripts/content_captions/__main__.py`

```python
"""CLI for content-captions.

Requires env: ANTHROPIC_API_KEY

Usage:
  python3 -m scripts.content_captions \\
    --data brands/zipsaja/zipsaja_pipeline_.../data.json \\
    --out brands/zipsaja/zipsaja_pipeline_.../captions/
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .generate import generate_captions


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="content_captions")
    p.add_argument("--data", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    dataset = json.loads(args.data.read_text(encoding="utf-8"))
    args.out.mkdir(parents=True, exist_ok=True)
    results = generate_captions(dataset, out_dir=args.out)
    for platform, path in results.items():
        print(f"[content-captions] {platform} → {path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 3: Verify imports without API call**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
python3 -c "from scripts.content_captions.generate import generate_captions, _summarize_insights; print('OK')"
```

Expected: `OK`.

- [ ] **Step 4: Commit**

```bash
git add scripts/content_captions/generate.py scripts/content_captions/__main__.py
git commit -m "feat(content-captions): Anthropic API 호출 + 3 플랫폼별 캡션 파일 생성"
```

---

### Task 11: Pipeline master extension — chain all 4 content skills

**Files:**
- Modify: `scripts/pipeline/__main__.py`

- [ ] **Step 1: Add chain-step helper + call each content skill after data fetch**

Open `scripts/pipeline/__main__.py`. Locate the block after `state.status = "data-ready"` + `state.save(state_path)` (around the end of the `if brand_needs_data_fetch:` branch). Append these steps BEFORE `return 0`:

```python
        # Chain content steps (zipsaja MVP). Each content script reads data.json and writes into bundle.
        bundle = bundle_path(args.brand, slug)
        data_path = bundle / "data.json"

        content_steps = [
            ("content-carousel", "scripts.content_carousel", ["--data", str(data_path), "--out", str(bundle / "carousel")]),
            ("content-reels",    "scripts.content_reels",    ["--data", str(data_path), "--out", str(bundle / "reels")]),
            ("content-attachments", "scripts.content_attachments", ["--data", str(data_path), "--out", str(bundle / "attachments")]),
            ("content-captions", "scripts.content_captions", ["--data", str(data_path), "--out", str(bundle / "captions")]),
        ]

        for step_name, module, step_args in content_steps:
            print(f"[pipeline] running {step_name}...", file=sys.stderr)
            step_result = subprocess.run(
                [sys.executable, "-m", module, *step_args],
                check=False,
            )
            if step_result.returncode != 0:
                state.mark_failed(step_name, f"exit {step_result.returncode}")
                state.save(state_path)
                print(f"[pipeline] {step_name} FAILED ({step_result.returncode}) — other steps skipped", file=sys.stderr)
                return step_result.returncode
            state.artifacts[step_name] = {"path": str(bundle / step_name.split("-", 1)[1])}
            state.save(state_path)
            print(f"[pipeline] ✓ {step_name}", file=sys.stderr)

        state.status = "completed"
        state.save(state_path)
        print(f"[pipeline] 🎉 all steps completed → {bundle}", file=sys.stderr)
```

Replace the old lines `state.status = "data-ready"` + `state.save(state_path)` + `print("...")` that you're appending after — keep only ONE `state.save` at the end of the `if` branch AFTER the loop completes (the loop saves between each step too, which is correct for resume).

(If the branch still has duplicate `state.status = "data-ready"` at the top of your new block, leave the one before the loop — it marks data-ready before batch generation starts. The loop then upgrades to `completed`.)

- [ ] **Step 2: Verify still type-checks / imports (pure Python)**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
python3 -c "from scripts.pipeline.__main__ import main, compute_pipeline_id, build_parser; print('OK')"
```

Expected: `OK`.

- [ ] **Step 3: Existing pipeline tests still pass**

```bash
python -m pytest tests/pipeline -v
```

Expected: 23 passed.

- [ ] **Step 4: Commit**

```bash
git add scripts/pipeline/__main__.py
git commit -m "feat(pipeline): master에서 content-carousel/reels/attachments/captions 체인 호출 + 실패 시 mark_failed"
```

---

### Task 12: Create 4 SKILL.md files

**Files:**
- Create: `.claude/skills/content-carousel/SKILL.md`
- Create: `.claude/skills/content-reels/SKILL.md`
- Create: `.claude/skills/content-attachments/SKILL.md`
- Create: `.claude/skills/content-captions/SKILL.md`

- [ ] **Step 1: content-carousel SKILL.md**

File: `.claude/skills/content-carousel/SKILL.md`

````markdown
---
name: content-carousel
description: zipsaja 데이터셋 → Jinja2 템플릿 → 1080×1440 캐러셀 PNG. /pipeline의 zipsaja 분기에서 자동 호출되며 단독 실행도 가능.
---

# content-carousel 스킬

Pipeline data.json 을 입력받아 zipsaja 브랜드 스타일 캐러셀 HTML 을 Jinja2 템플릿으로 렌더링하고 Puppeteer 로 각 슬라이드를 PNG로 캡처.

## 사용

```bash
python3 -m scripts.content_carousel \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/carousel/
```

옵션:
- `--per-slide N` — 슬라이드당 행 개수 (default 8). 25개 구 / 8 → 4 데이터 슬라이드 + 커버 + CTA.
- `--no-capture` — HTML만 생성, PNG 캡처 스킵.

## 산출물

```
{out}/
├── slides.html
├── slide-01.png   # 커버
├── slide-02.png   # 데이터 1
├── ...
└── slide-06.png   # 다크 CTA (댓글 리드매그넷)
```

- 1080×1440 @2x (2160×2880 픽셀).
- zipsaja 브랜드 디자인: `#F0E7D6` 베이지 배경, `#EA2E00` 오렌지 pill, Jua 폰트.

## 요구사항

- Node.js (puppeteer 자동 설치). 초회 실행 시 Chromium 다운로드 약 200MB.
- Python: jinja2.
````

- [ ] **Step 2: content-reels SKILL.md**

File: `.claude/skills/content-reels/SKILL.md`

````markdown
---
name: content-reels
description: pipeline data.json → 기존 Remotion zipsaja/reels 프로젝트로 9:16 22초 mp4 렌더. 필드 매핑(priceBefore/After → priceLastYear/ThisYear) 자동 처리.
---

# content-reels 스킬

Pipeline 의 data.json 을 기존 `.claude/skills/carousel/brands/zipsaja/reels/` Remotion 프로젝트가 읽을 수 있는 `seoul-prices.json` 포맷으로 매핑한 후 `npm run build:seoul` 을 호출. 완료 후 ffmpeg 으로 22초 트림 + H.264 CRF 18 재인코딩.

## 사용

```bash
python3 -m scripts.content_reels \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/reels/
```

## 산출물

```
{out}/
├── full.mp4                  # Remotion 원본
└── zipsaja-reel-22s.mp4      # 22초 트림 재인코딩 (게시용)
```

1080×1920 (9:16), 30fps, H.264.

## 내부 동작

1. `data.json` 읽기
2. `priceBefore` → `priceLastYear`, `priceAfter` → `priceThisYear` 필드 매핑
3. `.claude/skills/carousel/brands/zipsaja/reels/public/data/seoul-prices.json` 에 저장
4. `cd .claude/skills/.../reels && npm run build:seoul`
5. 산출물 복사 + ffmpeg 트림

## 요구사항

- Node.js + Remotion (기존 프로젝트에 이미 설치됨)
- ffmpeg (brew install ffmpeg)
````

- [ ] **Step 3: content-attachments SKILL.md**

File: `.claude/skills/content-attachments/SKILL.md`

````markdown
---
name: content-attachments
description: pipeline data.json → Excel (.xlsx, raw 25개 구 데이터) + PDF (A4 인사이트 요약). 인스타 "댓글 달면 보내드려요" 리드매그넷 파일용.
---

# content-attachments 스킬

데이터 파일 러버용 Excel + 인사이트 요약 러버용 PDF 동시 생성.

## 사용

```bash
python3 -m scripts.content_attachments \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/attachments/
```

## 산출물

```
{out}/
├── seoul-price-data.xlsx       # openpyxl — 25개 구 전체 raw + 서식
└── seoul-price-insights.pdf    # weasyprint — A4, 상/하 변동률 요약 + 전체 테이블
```

## Excel 구조

| Row | Content |
|---|---|
| 1 | 제목 (merged A:D, 오렌지 굵은) |
| 2 | 기간·출처 (merged, 회색 이탤릭) |
| 3 | 헤더 (지역/취임 전/취임 후/변동률%) — 오렌지 배경 |
| 4-28 | 25개 구 데이터 — 양수 변동률 오렌지, 음수 파랑 |

## PDF 구조

1페이지 이내에 요약 박스(상/하 변동률, 평균) + 전체 25행 테이블.

## 요구사항

- openpyxl >= 3.1
- weasyprint >= 62 (macOS: `brew install pango` 필요할 수 있음)
````

- [ ] **Step 4: content-captions SKILL.md**

File: `.claude/skills/content-captions/SKILL.md`

````markdown
---
name: content-captions
description: pipeline data.json → Instagram/Threads/LinkedIn 3 플랫폼별 캡션 .txt 파일. Anthropic API 사용. zipsaja 반말 톤, 인스타 캡션은 댓글 리드매그넷 훅을 맨 앞에 배치.
---

# content-captions 스킬

Claude Sonnet 4.6 으로 3 플랫폼별 캡션을 생성. 각 플랫폼의 포맷·길이·톤을 프롬프트에서 강제.

## 사용

```bash
export ANTHROPIC_API_KEY=sk-...
python3 -m scripts.content_captions \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/captions/
```

## 산출물

```
{out}/
├── instagram.txt    # ~2200자, 댓글 리드매그넷 훅 맨 앞, 해시태그 5-7개
├── threads.txt      # 300-500자, 대화형, 해시태그 2-3개
└── linkedin.txt     # 1500-2000자, 인사이트 중심, 해시태그 3-5개
```

## 플랫폼별 규칙

- **Instagram**: "댓글에 '엑셀' 또는 'PDF' 쓰면 보내줄게" 훅을 첫 문단 맨 앞 배치.
- **Threads**: 짧은 호흡, 1-2문장 훅 + 수치 + 의견.
- **LinkedIn**: 해석·시사점 중심. 숫자 나열 금지.

모든 플랫폼 공통: zipsaja 반말 톤, 이모지 절제, 도발/위협 톤 금지.

## 요구사항

- `ANTHROPIC_API_KEY` 환경 변수
- `anthropic>=0.69` 패키지
- 1회 실행당 약 3회 API 호출 (각 플랫폼 별도)
````

- [ ] **Step 5: Commit all 4 SKILL.md at once**

```bash
git add .claude/skills/content-carousel/SKILL.md \
        .claude/skills/content-reels/SKILL.md \
        .claude/skills/content-attachments/SKILL.md \
        .claude/skills/content-captions/SKILL.md
git commit -m "docs(content-*): 4개 content 스킬 SKILL.md — 사용법·산출물·요구사항"
```

---

### Task 13: AGENTS.md §8 업데이트 — 구현 완료 상태 반영

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Update §8 status markers**

Edit `AGENTS.md` §8. Replace the current "지원 상태" column with actual implementation state.

Find the brand × data source table in §8 and update so the status column reads correctly for all brands. Then ADD a new subsection below the existing "산출물 위치" section:

Append this after "관련 스킬" subsection (before "참고 문서"):

```markdown
### 구현 상태 (Plan 1 + Plan 2-5 완료)

| 단계 | 상태 | 스킬 |
|---|---|---|
| 데이터 수집 (zipsaja) | ✅ | `/zipsaja-data-fetch` |
| 캐러셀 (Jinja2 + Puppeteer) | ✅ | `/content-carousel` |
| 릴스 (Remotion + ffmpeg) | ✅ | `/content-reels` |
| 첨부자료 (Excel + PDF) | ✅ | `/content-attachments` |
| 캡션 (IG/Threads/LinkedIn) | ✅ | `/content-captions` |

### 산출물 bundle 구조

```
brands/{brand}/{brand}_pipeline_{slug}/
├── pipeline-state.json
├── data.json                     # zipsaja: 25개 구 dataset
├── carousel/
│   ├── slides.html
│   └── slide-01.png ~ slide-NN.png
├── reels/
│   ├── full.mp4
│   └── zipsaja-reel-22s.mp4
├── attachments/
│   ├── seoul-price-data.xlsx
│   └── seoul-price-insights.pdf
└── captions/
    ├── instagram.txt
    ├── threads.txt
    └── linkedin.txt
```

### 환경 변수 (zipsaja 기준)

- `PG_PASSWORD` — proptech_db (데이터 수집)
- `ANTHROPIC_API_KEY` — Claude API (캡션 생성)
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs(agents): §8 파이프라인 구현 완료 상태 + 번들 구조 + 환경 변수 반영"
```

---

### Task 14: E2E integration smoke test

**Files:** None (live run only)

- [ ] **Step 1: Pre-check credentials**

```bash
export PG_PASSWORD=$(ssh hh-worker-2 'grep DATABASE_URL /opt/proptech/.env' | sed -E 's|.*://proptech:([^@]+)@.*|\1|')
echo "PG ok: ${PG_PASSWORD:0:4}***"
# Confirm Anthropic key
echo "Anthropic key set: ${ANTHROPIC_API_KEY:+yes}"
```

Expected: PG prefix visible + "Anthropic key set: yes".

If ANTHROPIC_API_KEY missing:
```bash
# Use existing key from ~/.anthropic or user input
read -p "ANTHROPIC_API_KEY: " ANTHROPIC_API_KEY && export ANTHROPIC_API_KEY
```

- [ ] **Step 2: Full pipeline run with new slug**

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
python3 -m scripts.pipeline zipsaja 이재명 대통령 당선후 서울 실거래 E2E 검증 2>&1 | tail -20
```

Expected (final lines):
```
[pipeline] ✓ content-carousel
[pipeline] ✓ content-reels
[pipeline] ✓ content-attachments
[pipeline] ✓ content-captions
[pipeline] 🎉 all steps completed → brands/zipsaja/zipsaja_pipeline_이재명-대통령-당선후-서울-실거래-E2E-검증
```

- [ ] **Step 3: Verify bundle contents**

```bash
BUNDLE="brands/zipsaja/zipsaja_pipeline_이재명-대통령-당선후-서울-실거래-E2E-검증"
echo "=== pipeline-state.json ==="
python3 -c "
import json
s = json.load(open('$BUNDLE/pipeline-state.json'))
print('status:', s['status'])
print('artifacts:', list(s['artifacts'].keys()))
"
echo "=== carousel ==="
ls $BUNDLE/carousel/ | head -10
echo "=== reels ==="
ls $BUNDLE/reels/
echo "=== attachments ==="
ls $BUNDLE/attachments/
echo "=== captions ==="
ls $BUNDLE/captions/ && head -20 $BUNDLE/captions/instagram.txt
```

Expected:
- `status: completed`
- `artifacts: ['carousel', 'reels', 'attachments', 'captions']`
- carousel: 6+ PNG files + slides.html
- reels: full.mp4 + zipsaja-reel-22s.mp4
- attachments: seoul-price-data.xlsx + seoul-price-insights.pdf
- captions: 3 .txt files, instagram.txt starts with 댓글 hook

- [ ] **Step 4: Open final mp4 + verify Instagram caption lead-magnet**

```bash
open $BUNDLE/reels/zipsaja-reel-22s.mp4
cat $BUNDLE/captions/instagram.txt | head -5
```

Manual check:
- [ ] 비디오 22초, 1080×1920
- [ ] Instagram 캡션 첫 문단에 "댓글"과 "엑셀"/"PDF" 언급

- [ ] **Step 5: No commit** — E2E outputs are gitignored via bundle pattern. Task complete when all above pass.

If any step fails, capture error and create a fix task before claiming completion.

---

## Self-Review Checklist

**Spec coverage:**
- ✅ content-carousel: Task 2-3
- ✅ content-reels: Task 4-5
- ✅ content-attachments (Excel + PDF): Task 6-8
- ✅ content-captions (3 platforms, IG lead-magnet front): Task 9-10
- ✅ Pipeline master chain: Task 11
- ✅ 4 SKILL.md: Task 12
- ✅ AGENTS.md update: Task 13
- ✅ E2E verification: Task 14

**Placeholder scan:** 없음. 모든 step에 완전 코드 + 검증 명령어 제공.

**Type consistency:**
- `data.json` 스키마 (Plan 1이 생성): title, subtitle, periodLabel, source, sizeLabel, districts[{district, priceBefore, priceAfter, changePct}] — Task 2, 4, 6, 7, 9 모두 이 스키마에서 읽음.
- `state.artifacts[step_name]` 키 형식: Task 11 마스터에서 `{"path": str}` 로 저장 → Plan 1 `artifacts: dict[str, Any]` 타입 호환.
- Platform prompt 함수 이름: `instagram_prompt`, `threads_prompt`, `linkedin_prompt` — Task 9 선언, Task 10 generate.py 사용.

**Risks:**
- **weasyprint on macOS**: Pango/Cairo 설치 필요 — Task 1 Step 2에 언급.
- **Anthropic API 비용**: 1 E2E 실행당 3회 호출 ≈ $0.05-0.10. 개발용 예산 내.
- **Remotion render 시간**: 1-3분. 파이프라인 전체 시간 ~5-8분 예상 (ok).
- **Puppeteer Chromium 다운로드**: 초회만 ~200MB. 이후 캐시.

## Execution Handoff

Plan saved to `docs/superpowers/plans/2026-04-24-pipeline-full-orchestration.md`.

**실행 방식:**

1. **Subagent-Driven (Recommended)** — Task별 fresh subagent + 2단계 리뷰
2. **Inline Execution** — 이 세션에서 batch

어느 방식?
