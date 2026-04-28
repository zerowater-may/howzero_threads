"""Pipeline master CLI.

Usage:
  python3 -m scripts.pipeline zipsaja 이재명 당선후 서울 실거래 변화

Flow:
  1. Parse brand + topic
  2. Validate brand
  3. Compute slug + bundle path + pipeline_id
  4. Create PipelineState
  5. If brand needs data fetch → invoke scripts.zipsaja_data_fetch, then content generators
     Otherwise skip (howzero/braveyong: Plan 2+ will add content generation from topic only)
  6. Save state → brands/{brand}/{brand}_pipeline_{slug}/pipeline-state.json
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from .dispatch import brand_needs_data_fetch, validate_brand
from .paths import bundle_path, make_slug, state_file_path
from .state import PipelineState


ZIPSAJA_REMOTION_STEPS = [
    "brief",
    "data",
    "storyboard",
    "carousel",
    "remotion",
    "attachments",
    "captions",
    "package-qa",
]


def build_parser() -> _TopicJoiningParser:
    parser = argparse.ArgumentParser(
        prog="pipeline",
        description="Brand content pipeline — Phase 1 MVP (master + zipsaja data fetch)",
    )
    parser.add_argument("brand", nargs="?", default=None, help="zipsaja / howzero / braveyong")
    parser.add_argument("topic", nargs="*", help="주제 (공백 허용)")
    parser.add_argument("--preset", default="leejaemyung-before-after")
    parser.add_argument("--pivot-date", default=None)
    parser.add_argument("--min-total-units", type=int, default=None)
    return _TopicJoiningParser(parser)


class _TopicJoiningParser:
    """Wrap argparse to join topic list into a single string."""

    def __init__(self, parser: argparse.ArgumentParser):
        self._parser = parser

    def parse_args(self, argv: list[str] | None = None):
        ns = self._parser.parse_args(argv)
        ns.topic = " ".join(ns.topic) if ns.topic else ""
        return ns


def compute_pipeline_id(brand: str, slug: str, *, now: Optional[datetime] = None) -> str:
    now = now or datetime.now(timezone.utc)
    return f"{brand}_{now.strftime('%Y%m%d')}_{slug}"


def configure_zipsaja_remotion_state(state: PipelineState) -> None:
    state.set_workflow(
        version="zipsaja-remotion-v1",
        steps=ZIPSAJA_REMOTION_STEPS,
        forbidden_tools=["hyperframes"],
    )


def zipsaja_content_step_for_artifact(artifact_key: str) -> str:
    return "remotion" if artifact_key == "reels" else artifact_key


def mark_zipsaja_automatic_placeholders_skipped(state: PipelineState) -> None:
    state.mark_step("brief", "skipped")
    state.mark_step("storyboard", "skipped")


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    if not args.brand:
        print("ERROR: brand required (zipsaja / howzero / braveyong)", file=sys.stderr)
        return 2

    validate_brand(args.brand)

    if not args.topic:
        print("ERROR: topic required", file=sys.stderr)
        return 2

    slug = make_slug(args.topic)
    pipeline_id = compute_pipeline_id(args.brand, slug)
    state = PipelineState(
        pipeline_id=pipeline_id,
        brand=args.brand,
        topic=args.topic,
        slug=slug,
        status="pending",
    )
    if args.brand == "zipsaja":
        configure_zipsaja_remotion_state(state)

    state_path = state_file_path(args.brand, slug)
    state.save(state_path)
    print(f"[pipeline] state initialized → {state_path}", file=sys.stderr)

    if brand_needs_data_fetch(args.brand):
        print(f"[pipeline] brand={args.brand} → invoking zipsaja_data_fetch", file=sys.stderr)
        data_out = bundle_path(args.brand, slug) / "data.json"
        cmd = [
            sys.executable, "-m", "scripts.zipsaja_data_fetch",
            "--preset", args.preset,
            "--out", str(data_out),
        ]
        if args.pivot_date:
            cmd += ["--pivot-date", args.pivot_date]
        if args.min_total_units is not None:
            cmd += ["--min-total-units", str(args.min_total_units)]

        result = subprocess.run(cmd, check=False)
        if result.returncode != 0:
            state.mark_failed("data", f"CLI exit {result.returncode}")
            state.save(state_path)
            print(f"[pipeline] zipsaja_data_fetch FAILED ({result.returncode})", file=sys.stderr)
            return result.returncode

        state.data = {
            "source": f"ssh:{os.environ.get('PIPELINE_SSH_HOST', 'hh-worker-2')}/proptech_db",
            "preset": args.preset,
            "dataset": json.loads(data_out.read_text(encoding="utf-8")),
        }
        state.status = "data-ready"
        state.mark_step("data", "done")
        state.record_artifact("data", str(data_out))
        state.save(state_path)
        print(f"[pipeline] data ready → {len(state.data['dataset']['districts'])} districts", file=sys.stderr)

        # Chain content steps (zipsaja only). Each content script reads data.json and writes into bundle.
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
                artifact_key = step_name.split("-", 1)[1]
                state.mark_failed(zipsaja_content_step_for_artifact(artifact_key), f"exit {step_result.returncode}")
                state.save(state_path)
                print(f"[pipeline] {step_name} FAILED ({step_result.returncode}) — remaining steps skipped", file=sys.stderr)
                return step_result.returncode
            # Record artifact path by stripping "content-" prefix
            artifact_key = step_name.split("-", 1)[1]
            state.record_artifact(artifact_key, str(bundle / artifact_key))
            state.mark_step(zipsaja_content_step_for_artifact(artifact_key), "done")
            state.save(state_path)
            print(f"[pipeline] ✓ {step_name}", file=sys.stderr)

        state.status = "qa-pending"
        mark_zipsaja_automatic_placeholders_skipped(state)
        state.save(state_path)
        print(f"[pipeline] content generated; package QA pending → {bundle}", file=sys.stderr)
    else:
        print(f"[pipeline] brand={args.brand} — no data fetch step (Plan 2+ will add content generation)", file=sys.stderr)
        state.status = "data-ready"
        state.save(state_path)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
