"""Pure functions. No I/O. Input = info dict from yt-dlp --write-info-json."""

from typing import Optional
from .models import HighlightSpan, SourceType


def detect_source(info: dict) -> SourceType:
    if info.get("heatmap"):
        return "heatmap"
    if info.get("chapters"):
        return "chapters"
    return "transcript_fallback"


def _chapter_at(info: dict, ts: float) -> Optional[str]:
    for ch in info.get("chapters") or []:
        if ch["start_time"] <= ts < ch["end_time"]:
            return ch.get("title")
    return None


def _from_heatmap(info: dict, threshold: float, top_n: int) -> list[HighlightSpan]:
    hot = [h for h in info["heatmap"] if h["value"] >= threshold]
    hot.sort(key=lambda h: h["value"], reverse=True)
    hot = hot[:top_n]
    spans: list[HighlightSpan] = []
    for rank, h in enumerate(hot, start=1):
        spans.append(HighlightSpan(
            rank=rank,
            start=float(h["start_time"]),
            end=float(h["end_time"]),
            score=float(h["value"]),
            kind="heatmap_peak",
            chapter=_chapter_at(info, float(h["start_time"])),
        ))
    return spans


def _from_chapters(info: dict) -> list[HighlightSpan]:
    spans: list[HighlightSpan] = []
    for rank, ch in enumerate(info["chapters"], start=1):
        spans.append(HighlightSpan(
            rank=rank,
            start=float(ch["start_time"]),
            end=float(ch["end_time"]),
            score=1.0,
            kind="chapter",
            chapter=ch.get("title"),
        ))
    return spans


def extract_highlight_candidates(
    info: dict, threshold: float = 0.7, top_n: int = 15
) -> list[HighlightSpan]:
    source = detect_source(info)
    if source == "heatmap":
        return _from_heatmap(info, threshold, top_n)
    if source == "chapters":
        return _from_chapters(info)
    return []
