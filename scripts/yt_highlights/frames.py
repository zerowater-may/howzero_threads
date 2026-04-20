"""Frame extraction via ffmpeg. Picks scenes inside highlight spans,
crops to 3:4 for carousel use."""

import subprocess
from pathlib import Path

from .models import HighlightSpan, Scene


class FrameError(RuntimeError):
    pass


# 1080x1440 carousel is 3:4 portrait. Crop source (16:9) to 3:4 from center.
_CROP_FILTER = "crop='min(iw,ih*3/4)':'min(ih,iw*4/3)'"


def extract_frame(video_path: Path, timestamp: float, out_path: Path) -> Path:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg",
        "-ss", str(timestamp),
        "-i", str(video_path),
        "-frames:v", "1",
        "-q:v", "2",
        "-vf", _CROP_FILTER,
        "-y",
        "-loglevel", "error",
        str(out_path),
    ]
    subprocess.run(cmd, check=False, capture_output=True, text=True)
    if not out_path.exists():
        raise FrameError(
            f"ffmpeg did not produce {out_path} (ts={timestamp})"
        )
    return out_path


def select_scenes_for_span(
    span: HighlightSpan, scenes: list[Scene]
) -> list[Scene]:
    if not scenes:
        return [Scene(index=-1, start=span.start, end=span.end)]
    return [
        s for s in scenes
        if s.end > span.start and s.start < span.end
    ]


def extract_frames_for_span(
    span: HighlightSpan,
    scenes: list[Scene],
    video_path: Path,
    out_dir: Path,
    max_frames: int = 2,
) -> list[Path]:
    out_dir = Path(out_dir)
    selected = select_scenes_for_span(span, scenes)[:max_frames]

    frames: list[Path] = []
    for i, scene in enumerate(selected, start=1):
        # Aim for 1s into the scene, but clamp to span bounds.
        ts = max(span.start, min(scene.start + 1.0, span.end - 0.1))
        name = f"h{span.rank:02d}_f{i:02d}.jpg"
        try:
            frames.append(extract_frame(video_path, ts, out_dir / name))
        except FrameError:
            continue  # skip this scene, keep going
    return frames
