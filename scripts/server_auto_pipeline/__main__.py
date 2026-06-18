from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import anthropic

from scripts.pipeline.paths import bundle_path
from scripts.pipeline.paths import make_slug

from .planner import (
    DEFAULT_DATA_PERIOD,
    DEFAULT_DATA_SOURCE,
    DEFAULT_DATA_SUBTITLE,
    DEFAULT_PIVOT_DATE,
    build_topic_prompt,
    extract_json_object,
    normalize_topic_plan,
    topic_plan_to_json,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="server_auto_pipeline")
    parser.add_argument("brand", nargs="?", default="zipsaja")
    parser.add_argument("--pivot-date", default=DEFAULT_PIVOT_DATE)
    parser.add_argument("--min-total-units", type=int, default=None)
    parser.add_argument("--scout-out", type=Path, default=None)
    return parser


def read_env(*names: str) -> str | None:
    for name in names:
        value = os.environ.get(name)
        if value and value.strip():
            return value.strip()
    return None


def run_checked(command: list[str]) -> None:
    print("[server-auto-pipeline] $ " + " ".join(command), file=sys.stderr)
    result = subprocess.run(command, check=False)
    if result.returncode != 0:
        raise SystemExit(result.returncode)


def fetch_scout_dataset(args: argparse.Namespace) -> Path:
    scout_dir = Path(".tmp/server-auto-pipeline")
    scout_dir.mkdir(parents=True, exist_ok=True)
    scout_out = args.scout_out or scout_dir / "latest-zipsaja-scout-data.json"

    command = [
        sys.executable,
        "-m",
        "scripts.zipsaja_data_fetch",
        "--preset",
        "leejaemyung-before-after",
        "--pivot-date",
        args.pivot_date,
        "--title",
        "Kimi 주제 선정용 서울 실거래 스카우팅",
        "--subtitle",
        DEFAULT_DATA_SUBTITLE,
        "--period",
        DEFAULT_DATA_PERIOD,
        "--source",
        DEFAULT_DATA_SOURCE,
        "--out",
        str(scout_out),
    ]
    if args.min_total_units is not None:
        command += ["--min-total-units", str(args.min_total_units)]
    run_checked(command)
    return scout_out


def call_kimi_topic_planner(*, brand: str, dataset: dict[str, Any]) -> Any:
    api_key = read_env("KIMI_CODE_API_KEY", "KIMI_API_KEY", "MOONSHOT_API_KEY")
    if not api_key:
        raise RuntimeError("KIMI_CODE_API_KEY, KIMI_API_KEY, or MOONSHOT_API_KEY is required")

    client = anthropic.Anthropic(
        auth_token=api_key,
        base_url=read_env("CONTENT_CAPTIONS_BASE_URL", "KIMI_CODE_BASE_URL")
        or "https://api.kimi.com/coding/",
    )
    message = client.messages.create(
        model=read_env("KIMI_CODE_MODEL", "KIMI_MODEL") or "kimi-for-coding",
        max_tokens=1200,
        messages=[{"role": "user", "content": build_topic_prompt(brand=brand, dataset=dataset)}],
    )
    text = "".join(block.text for block in message.content if hasattr(block, "text")).strip()
    return normalize_topic_plan(
        extract_json_object(text),
        fallback_topic="대출규제 이후 서울 현금격차",
    )


def write_topic_artifacts(*, root: Path, plan: Any, scout_data_path: Path) -> None:
    root.mkdir(parents=True, exist_ok=True)
    (root / "server-auto-topic.json").write_text(topic_plan_to_json(plan) + "\n", encoding="utf-8")
    (root / "brief.md").write_text(
        "\n".join(
            [
                f"# {plan.data_title}",
                "",
                "## 서버 자동 기획",
                "",
                f"- 생성 시각: {datetime.now(ZoneInfo('Asia/Seoul')).isoformat()}",
                "- 실행 위치: SSH server `/opt/howzero`",
                "- 주제 선정: Kimi Code",
                f"- 스카우팅 데이터: `{scout_data_path}`",
                "- 업로드: 실행하지 않음",
                "",
                "## Kimi 선택",
                "",
                f"- topic: {plan.topic}",
                f"- data_title: {plan.data_title}",
                f"- rationale: {plan.rationale}",
                "",
            ]
        ),
        encoding="utf-8",
    )


def run_pipeline(*, brand: str, plan: Any, min_total_units: int | None) -> Path:
    slug = make_slug(plan.topic)
    root = bundle_path(brand, slug)
    command = [
        sys.executable,
        "-m",
        "scripts.pipeline",
        brand,
        plan.topic,
        "--pivot-date",
        plan.pivot_date,
        "--data-title",
        plan.data_title,
        "--data-subtitle",
        plan.data_subtitle,
        "--data-period",
        plan.data_period,
        "--data-source",
        plan.data_source,
    ]
    if min_total_units is not None:
        command += ["--min-total-units", str(min_total_units)]
    run_checked(command)
    return root


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.brand != "zipsaja":
        print("ERROR: server auto topic selection currently supports zipsaja only", file=sys.stderr)
        return 2

    scout_data_path = fetch_scout_dataset(args)
    dataset = json.loads(scout_data_path.read_text(encoding="utf-8"))
    plan = call_kimi_topic_planner(brand=args.brand, dataset=dataset)
    print("[server-auto-pipeline] Kimi topic plan:", file=sys.stderr)
    print(topic_plan_to_json(plan), file=sys.stderr)

    root = run_pipeline(brand=args.brand, plan=plan, min_total_units=args.min_total_units)
    write_topic_artifacts(root=root, plan=plan, scout_data_path=scout_data_path)
    print(f"[server-auto-pipeline] bundle → {root}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
