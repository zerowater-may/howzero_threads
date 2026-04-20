"""Heuristic transcript-based highlight extraction tests."""

from scripts.yt_highlights.fallback import (
    score_window,
    extract_from_transcript,
)
from scripts.yt_highlights.models import TranscriptSegment


def _seg(t: float, d: float, text: str) -> TranscriptSegment:
    return TranscriptSegment(t=t, d=d, text=text)


# ---------------- score_window ----------------

def test_score_window_rewards_hook_words():
    low = score_window(["그냥 가는 길이었다"])
    high = score_window(["핵심은 이것이다", "결론적으로 중요하다"])
    assert high > low


def test_score_window_rewards_concrete_numbers():
    low = score_window(["많다"])
    high = score_window(["월 수익 200만원이 나왔다"])
    assert high > low


def test_score_window_rewards_question_and_exclamation():
    low = score_window(["평범했다"])
    high = score_window(["왜 이렇게 됐을까?", "놀라운 결과였다!"])
    assert high > low


def test_score_window_penalises_empty_text():
    assert score_window([]) == 0.0
    assert score_window(["", "   "]) == 0.0


# ---------------- extract_from_transcript ----------------

def test_returns_empty_on_empty_transcript():
    assert extract_from_transcript([], duration=600.0, top_n=10) == []


def test_picks_top_n_spans_ranked_by_score():
    # Three clearly different scoring regions
    transcript = [
        # Region A (around 100s): high — numbers + hook words
        _seg(100.0, 5.0, "핵심은 월 200만원 수익이다"),
        _seg(105.0, 5.0, "결론은 이렇다"),
        # Region B (around 300s): medium — one hook word
        _seg(300.0, 5.0, "이유가 있었다"),
        _seg(305.0, 5.0, "그래서 시작했다"),
        # Region C (around 500s): low — filler
        _seg(500.0, 5.0, "그런 일이 있었다"),
        _seg(505.0, 5.0, "그러다가 끝났다"),
    ]
    spans = extract_from_transcript(
        transcript, duration=600.0, top_n=3, window_seconds=15.0,
    )
    assert len(spans) <= 3
    assert len(spans) >= 1
    # Region A must be in output
    assert any(s.start <= 100.0 <= s.end for s in spans)
    # All spans labelled transcript_fallback
    assert all(s.kind == "transcript_fallback" for s in spans)
    # Ranks are 1..N
    assert [s.rank for s in spans] == list(range(1, len(spans) + 1))


def test_skips_intro_and_outro_regions():
    duration = 1000.0
    transcript = [
        # very early (in intro): high-scoring but should be skipped
        _seg(10.0, 3.0, "핵심! 수익 200만원 결론적으로 중요!"),
        # middle: also high-scoring
        _seg(500.0, 3.0, "핵심 수익 200만원 결론"),
        # very late (in outro): should be skipped
        _seg(990.0, 3.0, "핵심 수익 200만원 결론"),
    ]
    spans = extract_from_transcript(
        transcript, duration=duration, top_n=10, intro_ratio=0.1, outro_ratio=0.9,
    )
    # Only the middle one survives
    assert len(spans) == 1
    assert 400.0 < spans[0].start < 600.0


def test_spans_do_not_overlap():
    # Many high-scoring segments close together → only one should survive
    transcript = [
        _seg(100.0 + i * 2.0, 2.0, f"핵심 {i} 수익 100만원 결론")
        for i in range(10)
    ]
    spans = extract_from_transcript(
        transcript, duration=500.0, top_n=10, window_seconds=20.0,
        min_gap=30.0,
    )
    # Sort by start time and verify no overlap and gap ≥ min_gap
    sorted_spans = sorted(spans, key=lambda s: s.start)
    for a, b in zip(sorted_spans, sorted_spans[1:]):
        assert b.start - a.start >= 30.0, \
            f"overlap or too close: {a.start}..{a.end} then {b.start}..{b.end}"


def test_spans_clamped_to_video_duration():
    duration = 100.0
    transcript = [_seg(95.0, 2.0, "핵심 결론 수익 200만원")]
    spans = extract_from_transcript(
        transcript, duration=duration, top_n=10,
        intro_ratio=0.0, outro_ratio=1.0,
    )
    for s in spans:
        assert s.start >= 0.0
        assert s.end <= duration
