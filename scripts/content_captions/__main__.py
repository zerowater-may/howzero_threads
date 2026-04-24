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
