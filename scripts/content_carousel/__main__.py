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

from .render import DEFAULT_DATA_SLIDES, render_html

_CAPTURE_MJS = Path(__file__).parent / "capture.mjs"


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="content_carousel")
    p.add_argument("--data", type=Path, required=True, help="data.json input")
    p.add_argument("--out", type=Path, required=True, help="Carousel output directory")
    p.add_argument(
        "--data-slides",
        type=int,
        default=DEFAULT_DATA_SLIDES,
        help="Data table slide count (default 8; total carousel becomes 10 with cover and CTA)",
    )
    p.add_argument(
        "--per-slide",
        type=int,
        default=None,
        help="Legacy override: districts per slide. If set, overrides --data-slides.",
    )
    p.add_argument("--no-capture", action="store_true", help="Only write HTML, skip PNG")
    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.data_slides <= 0:
        parser.error("--data-slides must be greater than 0")
    if args.per_slide is not None and args.per_slide <= 0:
        parser.error("--per-slide must be greater than 0")

    dataset = json.loads(args.data.read_text(encoding="utf-8"))
    html = render_html(
        dataset,
        per_slide=args.per_slide,
        data_slide_count=args.data_slides,
    )

    args.out.mkdir(parents=True, exist_ok=True)
    html_path = args.out / "slides.html"
    html_path.write_text(html, encoding="utf-8")
    print(f"[content-carousel] wrote {html_path}", file=sys.stderr)

    if args.no_capture:
        return 0

    result = subprocess.run(
        ["node", str(_CAPTURE_MJS), str(html_path.resolve()), str(args.out.resolve())],
        cwd=str(Path(__file__).parent),
        check=False,
    )
    if result.returncode != 0:
        print(f"[content-carousel] capture FAILED ({result.returncode})", file=sys.stderr)
        return result.returncode

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
