"""Render zipsaja dataset into HTML slides via Jinja2 template.

Used by the /pipeline master for the carousel step. Captures PNG slides
via Puppeteer (capture.mjs) after HTML is written.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

_TEMPLATE_DIR = Path(__file__).parent / "templates"
DEFAULT_DATA_SLIDES = 8


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
    if per_slide <= 0:
        raise ValueError("per_slide must be greater than 0")

    chunks: list[dict[str, Any]] = []
    for i in range(0, len(districts), per_slide):
        rows = districts[i : i + per_slide]
        chunks.append({"header": _chunk_header(rows), "rows": rows})
    return chunks


def chunk_districts_by_slide_count(
    districts: list[dict[str, Any]], *, slide_count: int
) -> list[dict[str, Any]]:
    """Split districts into exactly up to slide_count balanced data slides."""
    if slide_count <= 0:
        raise ValueError("slide_count must be greater than 0")
    if not districts:
        return []

    actual_slide_count = min(slide_count, len(districts))
    base_size, remainder = divmod(len(districts), actual_slide_count)
    chunks: list[dict[str, Any]] = []
    start = 0
    for index in range(actual_slide_count):
        size = base_size + (1 if index < remainder else 0)
        rows = districts[start : start + size]
        chunks.append({"header": _chunk_header(rows), "rows": rows})
        start += size
    return chunks


def _chunk_header(rows: list[dict[str, Any]]) -> str:
    if len(rows) == 1:
        return rows[0]["district"]
    return f"{rows[0]['district']} ~ {rows[-1]['district']}"


def _split_title(title: str) -> tuple[str, str]:
    """Split title into (short-for-pill, rest-for-large-text)."""
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
    dataset: dict[str, Any],
    *,
    max_bar_px: int = 100,
    per_slide: int | None = None,
    data_slide_count: int = DEFAULT_DATA_SLIDES,
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

    if per_slide is None:
        district_chunks = chunk_districts_by_slide_count(
            districts_prepared, slide_count=data_slide_count
        )
    else:
        district_chunks = chunk_districts(districts_prepared, per_slide=per_slide)

    return {
        "dataset": enriched_dataset,
        "district_chunks": district_chunks,
    }


def render_html(
    dataset: dict[str, Any],
    *,
    per_slide: int | None = None,
    data_slide_count: int = DEFAULT_DATA_SLIDES,
) -> str:
    env = Environment(
        loader=FileSystemLoader(str(_TEMPLATE_DIR)),
        autoescape=select_autoescape(["html"]),
    )
    template = env.get_template("zipsaja_apartment_compare.html.j2")
    ctx = build_context(
        dataset,
        per_slide=per_slide,
        data_slide_count=data_slide_count,
    )
    return template.render(**ctx)
