"""Frame extraction via ffmpeg. Picks scenes inside highlight spans,
crops to 3:4 for carousel use."""

import subprocess
from pathlib import Path

from .models import HighlightSpan, Scene


class FrameError(RuntimeError):
    pass


# Preserve source aspect ratio (usually 16:9). Carousel slides layer
# the frame on top of text — center-cropping to 3:4 destroys the composition
# and often clips news chyrons, interview subjects, or on-screen text.
# Pipeline:
#   1) scale to 1080 wide (keep aspect, even height)
#   2) light unsharp mask to restore detail lost in re-encoding
_CROP_FILTER = (
    "scale=1080:-2:flags=lanczos,"
    "unsharp=5:5:0.8:3:3:0.4"
)


def extract_frame(video_path: Path, timestamp: float, out_path: Path) -> Path:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg",
        "-ss", str(timestamp),
        "-i", str(video_path),
        "-frames:v", "1",
        "-q:v", "1",
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
        # Scene midpoint is more stable than scene-start+1s (which often
        # catches motion-blurred transitions or title cards).
        midpoint = (scene.start + scene.end) / 2.0
        ts = max(span.start, min(midpoint, span.end - 0.1))
        name = f"h{span.rank:02d}_f{i:02d}.jpg"
        try:
            frames.append(extract_frame(video_path, ts, out_dir / name))
        except FrameError:
            continue  # skip this scene, keep going
    return frames
