"""CLI for content-reels.

Usage:
  python3 -m scripts.content_reels \\
    --data brands/zipsaja/zipsaja_pipeline_.../data.json \\
    --out brands/zipsaja/zipsaja_pipeline_.../reels/
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .render import (
    REELS_DATA_TARGET,
    ffmpeg_trim_22s,
    map_to_remotion_schema,
    trigger_remotion_render,
)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="content_reels")
    p.add_argument("--data", type=Path, required=True, help="Pipeline data.json")
    p.add_argument("--out", type=Path, required=True, help="Reels output directory")
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    src = json.loads(args.data.read_text(encoding="utf-8"))
    remotion_data = map_to_remotion_schema(src)

    # Write mapped data into Remotion project's expected location
    REELS_DATA_TARGET.parent.mkdir(parents=True, exist_ok=True)
    REELS_DATA_TARGET.write_text(json.dumps(remotion_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[content-reels] wrote mapped data → {REELS_DATA_TARGET}", file=sys.stderr)

    # Render
    args.out.mkdir(parents=True, exist_ok=True)
    full_out = args.out / "full.mp4"
    rc = trigger_remotion_render(out_path=full_out)
    if rc != 0:
        return rc

    # Trim to 22s
    trimmed = args.out / "zipsaja-reel-22s.mp4"
    rc = ffmpeg_trim_22s(full_out, trimmed)
    if rc != 0:
        return rc

    print(f"[content-reels] final → {trimmed}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
