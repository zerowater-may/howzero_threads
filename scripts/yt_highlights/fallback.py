"""Heuristic highlight extraction from transcript when heatmap/chapters absent.

No LLM. Pure Korean-aware lexical scoring on sliding time windows.
"""

import re
from typing import Iterable

from .models import HighlightSpan, TranscriptSegment


_HOOK_WORDS = [
    "핵심", "결정적", "진짜", "사실", "반전", "문제",
    "중요", "반드시", "놀랍", "정답", "결론", "요약",
    "주목", "이유", "왜", "어떻게", "바로", "실제로",
    "드디어", "충격", "폭로", "고소", "경찰", "환불",
]
_NUMBER_RE = re.compile(r"\d+")
_AMOUNT_RE = re.compile(r"\d+\s*(?:만원|억|백만|천만|%|퍼센트|원|배|배수|명|건|개월|년|주)")


def score_window(texts: Iterable[str]) -> float:
    joined = " ".join(t.strip() for t in texts if t and t.strip())
    if not joined:
        return 0.0

    score = 0.0

    # Hook words
    hook_hits = sum(joined.count(w) for w in _HOOK_WORDS)
    score += hook_hits * 0.2

    # Raw numbers
    num_hits = len(_NUMBER_RE.findall(joined))
    score += min(num_hits * 0.15, 0.6)

    # Concrete amount / percentage patterns (stronger signal than bare numbers)
    amount_hits = len(_AMOUNT_RE.findall(joined))
    score += amount_hits * 0.3

    # Question / exclamation marks
    if "?" in joined:
        score += 0.15
    if "!" in joined:
        score += 0.1

    # Direct quote markers (Korean news often highlights quotes)
    if any(ch in joined for ch in ['"', '"', '"', '「', '」', '>>']):
        score += 0.1

    return score


def extract_from_transcript(
    transcript: list[TranscriptSegment],
    duration: float,
    top_n: int = 10,
    window_seconds: float = 15.0,
    intro_ratio: float = 0.1,
    outro_ratio: float = 0.9,
    min_gap: float = 20.0,
) -> list[HighlightSpan]:
    """Score sliding windows, pick top_n non-overlapping.

    Args:
      transcript:      segments from transcript.py
      duration:        video length in seconds
      top_n:           max highlights returned
      window_seconds:  size of each scoring window
      intro_ratio:     skip this fraction from the start (intro)
      outro_ratio:     cut off at this fraction from the start (outro)
      min_gap:         minimum gap between selected spans (seconds)
    """
    if not transcript or duration <= 0:
        return []

    cutoff_start = duration * intro_ratio
    cutoff_end = duration * outro_ratio

    # Build non-overlapping windows in the middle region.
    windows: list[tuple[float, float, list[str]]] = []
    t = cutoff_start
    while t < cutoff_end:
        w_start, w_end = t, min(t + window_seconds, cutoff_end)
        texts = [s.text for s in transcript
                 if s.end() > w_start and s.t < w_end]
        if texts:
            windows.append((w_start, w_end, texts))
        t += window_seconds

    # Score and sort
    scored = [(score_window(texts), start, end)
              for start, end, texts in windows]
    scored = [row for row in scored if row[0] > 0]
    scored.sort(key=lambda row: row[0], reverse=True)

    # Greedy pick with min_gap enforcement (on window start times)
    picked: list[tuple[float, float, float]] = []  # (score, start, end)
    for score, start, end in scored:
        if any(abs(start - ps) < min_gap for _, ps, _ in picked):
            continue
        picked.append((score, start, end))
        if len(picked) >= top_n:
            break

    # Build HighlightSpan with proper rank ordering
    picked.sort(key=lambda row: row[0], reverse=True)
    spans: list[HighlightSpan] = []
    for rank, (score, start, end) in enumerate(picked, start=1):
        spans.append(HighlightSpan(
            rank=rank,
            start=max(0.0, start),
            end=min(duration, end),
            score=round(score, 3),
            kind="transcript_fallback",
            chapter=None,
        ))
    return spans
