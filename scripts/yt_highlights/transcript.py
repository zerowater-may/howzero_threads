"""Thin wrapper around youtube-transcript-api with Korean preference."""

import json
from pathlib import Path
from typing import Iterable

from youtube_transcript_api import YouTubeTranscriptApi

from .models import TranscriptSegment


def fetch_transcript(
    video_id: str, languages: list[str] | None = None
) -> list[TranscriptSegment]:
    langs = languages or ["ko", "en"]
    api = YouTubeTranscriptApi()
    snippets = api.fetch(video_id, languages=langs)
    return [TranscriptSegment(t=float(s.start), d=float(s.duration), text=s.text)
            for s in snippets]


def save_transcript(segments: Iterable[TranscriptSegment], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    data = [{"t": s.t, "d": s.d, "text": s.text} for s in segments]
    out_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
