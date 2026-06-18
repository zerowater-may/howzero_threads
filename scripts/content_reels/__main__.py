"""CLI for content-reels.

Usage:
  python3 -m scripts.content_reels \\
    --data brands/zipsaja/zipsaja_pipeline_.../data.json \\
    --out brands/zipsaja/zipsaja_pipeline_.../reels/
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from .render import (
    REELS_DATA_TARGET,
    REEL_AUDIO_MAPPED_IG_SAFE_OUTPUT_NAME,
    REEL_AUDIO_MAPPED_OUTPUT_NAME,
    REEL_OUTPUT_NAME,
    ffmpeg_export_reel,
    ffmpeg_make_audio_mapped_reels,
    map_to_remotion_schema,
    trigger_remotion_render,
)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="content_reels")
    p.add_argument("--data", type=Path, required=True, help="Pipeline data.json")
    p.add_argument("--out", type=Path, required=True, help="Reels output directory")
    p.add_argument(
        "--bgm",
        type=Path,
        default=None,
        help="Optional background music file. Defaults to HOWZERO_REELS_BGM_PATH, then synthetic BGM.",
    )
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    env_bgm_path = os.environ.get("HOWZERO_REELS_BGM_PATH")
    bgm_path = args.bgm or (Path(env_bgm_path) if env_bgm_path else None)
    if bgm_path is not None and not bgm_path.exists():
        print(f"[content-reels] background music not found: {bgm_path}", file=sys.stderr)
        return 4

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

    # Export the publishing reel from the full Remotion render.
    trimmed = args.out / REEL_OUTPUT_NAME
    rc = ffmpeg_export_reel(full_out, trimmed)
    if rc != 0:
        return rc

    audio_mapped = args.out / REEL_AUDIO_MAPPED_OUTPUT_NAME
    ig_safe = args.out / REEL_AUDIO_MAPPED_IG_SAFE_OUTPUT_NAME
    rc = ffmpeg_make_audio_mapped_reels(trimmed, audio_mapped, ig_safe, music_path=bgm_path)
    if rc != 0:
        return rc

    print(f"[content-reels] final → {trimmed}", file=sys.stderr)
    print(f"[content-reels] audio mapped → {audio_mapped}", file=sys.stderr)
    print(f"[content-reels] instagram safe → {ig_safe}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
