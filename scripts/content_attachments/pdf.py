"""PDF generator using Puppeteer (headless Chrome) — HTML + Jinja2 → A4 insight PDF.

weasyprint was the original plan but macOS libgobject loading issues make it
unreliable. Puppeteer (Node.js) reliably renders HTML → PDF and is already
installed as part of content_carousel.
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

_TEMPLATE_DIR = Path(__file__).parent / "templates"
_PDF_MJS = Path(__file__).parent / "pdf_render.mjs"


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


def _render_html(dataset: dict[str, Any]) -> str:
    env = Environment(
        loader=FileSystemLoader(str(_TEMPLATE_DIR)),
        autoescape=select_autoescape(["html"]),
    )
    template = env.get_template("insight_pdf.html.j2")
    return template.render(
        dataset=dataset,
        insights=compute_insights(dataset["districts"]),
    )


def write_pdf(dataset: dict[str, Any], out_path: Path) -> None:
    """Render HTML → invoke Puppeteer subprocess → PDF at out_path."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    html = _render_html(dataset)

    # Write HTML to temp file so Puppeteer can file:// load it
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".html", delete=False, encoding="utf-8"
    ) as tmp:
        tmp.write(html)
        tmp_path = Path(tmp.name)

    try:
        result = subprocess.run(
            ["node", str(_PDF_MJS), str(tmp_path), str(out_path)],
            check=False,
        )
        if result.returncode != 0:
            raise RuntimeError(f"puppeteer PDF render failed (exit {result.returncode})")
    finally:
        tmp_path.unlink(missing_ok=True)
