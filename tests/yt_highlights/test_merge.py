from pathlib import Path

from scripts.yt_highlights.merge import build_highlights, SCHEMA_VERSION
from scripts.yt_highlights.models import HighlightSpan, TranscriptSegment


def test_build_highlights_assembles_full_structure():
    info = {"id": "vid123", "title": "Test Video", "duration": 60.0}
    transcript = [
        TranscriptSegment(t=0.0,  d=2.0, text="intro"),
        TranscriptSegment(t=12.0, d=3.0, text="핵심 포인트"),
        TranscriptSegment(t=15.0, d=2.0, text="설명 이어짐"),
        TranscriptSegment(t=50.0, d=3.0, text="마무리"),
    ]
    spans = [
        HighlightSpan(rank=1, start=10.0, end=20.0, score=0.95,
                      kind="heatmap_peak", chapter="Main"),
    ]
    frames_by_rank = {1: [Path("frames/h01_f01.jpg"), Path("frames/h01_f02.jpg")]}

    out = build_highlights(
        info=info, source="heatmap",
        transcript=transcript, spans=spans, frames_by_rank=frames_by_rank,
        frames_root=Path("frames"),
    )

    assert out["schema_version"] == SCHEMA_VERSION
    assert out["video_id"] == "vid123"
    assert out["title"] == "Test Video"
    assert out["duration"] == 60.0
    assert out["source"] == "heatmap"
    assert len(out["highlights"]) == 1

    h = out["highlights"][0]
    assert h["rank"] == 1
    assert h["start"] == 10.0
    assert h["end"] == 20.0
    assert h["score"] == 0.95
    assert h["kind"] == "heatmap_peak"
    assert h["chapter"] == "Main"
    # Transcript filtered to segments overlapping [10,20]: seg 12-15, seg 15-17
    assert [s["text"] for s in h["transcript"]] == ["핵심 포인트", "설명 이어짐"]
    # Frames stored as relative POSIX strings
    assert h["frames"] == ["frames/h01_f01.jpg", "frames/h01_f02.jpg"]


def test_build_highlights_empty_spans_produces_empty_highlights():
    info = {"id": "v", "title": "T", "duration": 10.0}
    out = build_highlights(
        info=info, source="transcript_fallback",
        transcript=[], spans=[], frames_by_rank={},
        frames_root=Path("frames"),
    )
    assert out["highlights"] == []
    assert out["source"] == "transcript_fallback"
