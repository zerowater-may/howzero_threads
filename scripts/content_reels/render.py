"""Map Plan 1 data.json schema → existing Remotion component schema + trigger render."""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

# Existing Remotion project location (no duplication — reuse)
REELS_PROJECT = (
    Path(__file__).resolve().parents[2]
    / ".claude/skills/carousel/brands/zipsaja/reels"
)
REELS_DATA_TARGET = REELS_PROJECT / "public/data/seoul-prices.json"
REEL_DURATION_SECONDS = 30
REEL_OUTPUT_NAME = "zipsaja-reel-30s.mp4"
REEL_AUDIO_MAPPED_OUTPUT_NAME = "zipsaja-reel-30s-audio-mapped.mp4"
REEL_AUDIO_MAPPED_IG_SAFE_OUTPUT_NAME = "zipsaja-reel-30s-audio-mapped-ig-safe.mp4"
DEFAULT_BGM_VOLUME = 0.22


def map_to_remotion_schema(src: dict[str, Any]) -> dict[str, Any]:
    """Convert pipeline data.json → SeoulPriceReel's expected shape.

    Field renames:
      priceBefore  → priceLastYear
      priceAfter   → priceThisYear
    """
    mapped_districts = []
    for d in src["districts"]:
        mapped_districts.append({
            "district": d["district"],
            "priceLastYear": d["priceBefore"],
            "priceThisYear": d["priceAfter"],
            "changePct": d["changePct"],
        })
    return {
        "generatedAt": src["generatedAt"],
        "title": src.get("title", ""),
        "subtitle": src.get("subtitle", ""),
        "periodLabel": src["periodLabel"],
        "sizeLabel": src.get("sizeLabel", ""),
        "source": src["source"],
        "districtLabel": src.get("districtLabel", "지역"),
        "beforeLabel": src.get("beforeLabel", "이전"),
        "afterLabel": src.get("afterLabel", "이후"),
        "changeLabel": src.get("changeLabel", "변동률"),
        "districts": mapped_districts,
    }


def trigger_remotion_render(*, out_path: Path) -> int:
    """Run `npm run build:seoul` in the Remotion project.

    The project's `build:seoul` script renders SeoulPriceReel to
    `out/zipsaja-seoul-price.mp4`. We then copy the result to `out_path`.
    """
    result = subprocess.run(
        ["npm", "run", "build:seoul"],
        cwd=str(REELS_PROJECT),
        check=False,
    )
    if result.returncode != 0:
        return result.returncode

    remotion_out = REELS_PROJECT / "out" / "zipsaja-seoul-price.mp4"
    if not remotion_out.exists():
        print(f"[content-reels] ERROR: {remotion_out} not produced", file=sys.stderr)
        return 3

    out_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(remotion_out, out_path)
    print(f"[content-reels] copied → {out_path}", file=sys.stderr)
    return 0


def ffmpeg_export_reel(
    src: Path,
    dst: Path,
    *,
    duration_seconds: int = REEL_DURATION_SECONDS,
) -> int:
    """Re-encode + trim to the standard zipsaja Reel duration."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(src),
            "-t", str(duration_seconds),
            "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            str(dst),
        ],
        check=False,
    )
    return result.returncode


def ffmpeg_add_background_music(
    src: Path,
    dst: Path,
    *,
    music_path: Path | None = None,
    duration_seconds: int = REEL_DURATION_SECONDS,
    volume: float = DEFAULT_BGM_VOLUME,
) -> int:
    """Bake background music into a Reel MP4 for API publishing.

    If a music_path is provided, it is looped and mixed as the only audio track.
    If not, ffmpeg generates a lightweight synthetic background bed so the
    standard workflow never emits a publishing Reel without baked audio.
    """
    dst.parent.mkdir(parents=True, exist_ok=True)
    fade_out_start = max(duration_seconds - 0.75, 0)

    if music_path is not None:
        cmd = [
            "ffmpeg", "-y",
            "-i", str(src),
            "-stream_loop", "-1", "-i", str(music_path),
            "-filter_complex",
            (
                f"[1:a]volume={volume},"
                "afade=t=in:st=0:d=0.35,"
                f"afade=t=out:st={fade_out_start:.2f}:d=0.75,"
                "aformat=sample_rates=44100:channel_layouts=stereo[bgm]"
            ),
            "-map", "0:v:0", "-map", "[bgm]",
            "-t", str(duration_seconds),
            "-c:v", "copy",
            "-c:a", "aac", "-b:a", "192k",
            "-shortest", "-movflags", "+faststart",
            str(dst),
        ]
    else:
        cmd = [
            "ffmpeg", "-y",
            "-i", str(src),
            "-f", "lavfi", "-t", str(duration_seconds),
            "-i", f"sine=frequency=110:sample_rate=44100:duration={duration_seconds}",
            "-f", "lavfi", "-t", str(duration_seconds),
            "-i", f"sine=frequency=220:sample_rate=44100:duration={duration_seconds}",
            "-f", "lavfi", "-t", str(duration_seconds),
            "-i", f"sine=frequency=440:sample_rate=44100:duration={duration_seconds}",
            "-filter_complex",
            (
                "[1:a]volume=0.060[bass];"
                "[2:a]volume=0.030[mid];"
                "[3:a]volume=0.018[high];"
                "[bass][mid][high]amix=inputs=3:duration=longest,"
                f"volume={volume},"
                "afade=t=in:st=0:d=0.35,"
                f"afade=t=out:st={fade_out_start:.2f}:d=0.75,"
                "aformat=sample_rates=44100:channel_layouts=stereo[bgm]"
            ),
            "-map", "0:v:0", "-map", "[bgm]",
            "-t", str(duration_seconds),
            "-c:v", "copy",
            "-c:a", "aac", "-b:a", "192k",
            "-shortest", "-movflags", "+faststart",
            str(dst),
        ]

    result = subprocess.run(cmd, check=False)
    return result.returncode


def ffmpeg_export_ig_safe_reel(
    src: Path,
    dst: Path,
    *,
    duration_seconds: int = REEL_DURATION_SECONDS,
) -> int:
    """Normalize the audio-mapped Reel to Instagram-safe 1080x1920/H.264/AAC."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(src),
            "-t", str(duration_seconds),
            "-map", "0:v:0", "-map", "0:a:0",
            "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1",
            "-r", "30",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k",
            "-movflags", "+faststart",
            str(dst),
        ],
        check=False,
    )
    return result.returncode


def ffmpeg_make_audio_mapped_reels(
    trimmed_reel: Path,
    audio_mapped_reel: Path,
    ig_safe_reel: Path,
    *,
    music_path: Path | None = None,
) -> int:
    rc = ffmpeg_add_background_music(trimmed_reel, audio_mapped_reel, music_path=music_path)
    if rc != 0:
        return rc
    return ffmpeg_export_ig_safe_reel(audio_mapped_reel, ig_safe_reel)
