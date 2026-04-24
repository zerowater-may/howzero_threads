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
