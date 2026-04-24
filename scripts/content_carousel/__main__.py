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
