from __future__ import annotations

import argparse
from datetime import datetime
from pathlib import Path
from typing import Callable, Sequence
from zoneinfo import ZoneInfo

from .client import TossInvestClient
from .report import build_account_report, write_report


def main(
    argv: Sequence[str] | None = None,
    *,
    client_factory: Callable[[], object] | None = None,
    print_fn: Callable[[str], None] = print,
) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if args.command == "report":
        factory = client_factory or TossInvestClient.from_env
        with factory() as client:
            report = build_account_report(
                client,
                include_open_orders=not args.no_open_orders,
            )
        output_path = write_report(report, args.out, format=args.format)
        print_fn(f"wrote {output_path}")
        return 0

    parser.print_help()
    return 2


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="python -m toss")
    subparsers = parser.add_subparsers(dest="command")

    report_parser = subparsers.add_parser("report", help="Generate a read-only account report")
    report_parser.add_argument(
        "--out",
        default=str(_default_report_path()),
        help="Output path. Defaults to toss/reports/account-report-YYYY-MM-DD.md",
    )
    report_parser.add_argument(
        "--format",
        choices=("markdown", "json"),
        default="markdown",
        help="Report output format",
    )
    report_parser.add_argument(
        "--no-open-orders",
        action="store_true",
        help="Skip OPEN order lookup",
    )
    return parser


def _default_report_path() -> Path:
    today = datetime.now(ZoneInfo("Asia/Seoul")).date().isoformat()
    return Path("toss") / "reports" / f"account-report-{today}.md"
