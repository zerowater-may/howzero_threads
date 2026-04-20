from scripts.yt_highlights.models import HighlightSpan, TranscriptSegment, Scene


def test_highlight_span_fields_and_duration():
    span = HighlightSpan(
        rank=1, start=10.0, end=25.5, score=0.9,
        kind="heatmap_peak", chapter="Intro"
    )
    assert span.duration() == 15.5
    assert span.kind == "heatmap_peak"


def test_transcript_segment_end_time():
    seg = TranscriptSegment(t=12.0, d=3.5, text="hello")
    assert seg.end() == 15.5


def test_scene_contains_timestamp():
    scene = Scene(index=0, start=0.0, end=10.0)
    assert scene.contains(5.0) is True
    assert scene.contains(10.0) is False  # half-open interval
    assert scene.contains(-1.0) is False
