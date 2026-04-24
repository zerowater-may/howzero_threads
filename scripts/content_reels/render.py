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


def ffmpeg_trim_22s(src: Path, dst: Path) -> int:
    """Re-encode + trim to 22 seconds with CRF 18."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(src),
            "-t", "22",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            str(dst),
        ],
        check=False,
    )
    return result.returncode
