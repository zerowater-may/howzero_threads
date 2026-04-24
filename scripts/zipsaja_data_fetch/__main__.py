"""CLI for zipsaja_data_fetch.

Usage:
  python3 -m scripts.zipsaja_data_fetch \
    --title "이재명 대통령 당선후 서울 실거래 변화" \
    --subtitle "취임 전 12개월 vs 취임 후 ~ 현재" \
    --period "2024.6 ~ 2025.6 vs 2025.6 ~ 현재" \
    --source "국토부 실거래가 (매매)" \
    --out brands/zipsaja/zipsaja_pipeline_leejaemyung-seoul/data.json

Credentials:
  Read from env: PG_PASSWORD (required), or from /opt/proptech/.env on the SSH host.
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
        print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
