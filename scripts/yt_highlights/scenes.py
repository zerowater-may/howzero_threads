"""PySceneDetect wrapper. Returns Scene dataclasses, saves JSON."""

import json
from pathlib import Path
from typing import Iterable

from scenedetect import detect, ContentDetector

from .models import Scene


def detect_scenes(video_path: Path, threshold: float = 27.0) -> list[Scene]:
    raw = detect(str(video_path), ContentDetector(threshold=threshold))
    return [
        Scene(index=i, start=start.get_seconds(), end=end.get_seconds())
        for i, (start, end) in enumerate(raw)
    ]


def save_scenes(scenes: Iterable[Scene], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    data = [{"index": s.index, "start": s.start, "end": s.end} for s in scenes]
    out_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
