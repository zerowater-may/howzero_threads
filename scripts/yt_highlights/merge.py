"""Pure assembly: combines info + transcript + spans + frame paths → dict."""

from pathlib import Path
from typing import Iterable

from .models import HighlightSpan, TranscriptSegment, SourceType

SCHEMA_VERSION = 1


def _transcript_in(
    span: HighlightSpan, transcript: Iterable[TranscriptSegment]
) -> list[dict]:
    out = []
    for s in transcript:
        if s.end() > span.start and s.t < span.end:
            out.append({"t": s.t, "d": s.d, "text": s.text})
    return out


def build_highlights(
    *,
    info: dict,
    source: SourceType,
    transcript: Iterable[TranscriptSegment],
    spans: Iterable[HighlightSpan],
    frames_by_rank: dict[int, list[Path]],
    frames_root: Path,
) -> dict:
    transcript = list(transcript)
    frames_root = Path(frames_root)

    highlights = []
    for span in spans:
        frame_paths = frames_by_rank.get(span.rank, [])
        rel = [str(Path(frames_root.name) / p.name) for p in frame_paths]
        highlights.append({
            "rank": span.rank,
            "start": span.start,
            "end": span.end,
            "score": span.score,
            "kind": span.kind,
            "chapter": span.chapter,
            "transcript": _transcript_in(span, transcript),
            "frames": rel,
        })

    return {
        "schema_version": SCHEMA_VERSION,
        "video_id": info.get("id"),
        "title": info.get("title"),
        "duration": info.get("duration"),
        "source": source,
        "highlights": highlights,
    }
