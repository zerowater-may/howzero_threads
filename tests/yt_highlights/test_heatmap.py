import json
from pathlib import Path
from scripts.yt_highlights.heatmap import (
    extract_highlight_candidates,
    detect_source,
)

FIXTURES = Path(__file__).parent / "fixtures"


def load(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text())


# --- detect_source ---

def test_detect_source_prefers_heatmap():
    info = load("info_with_heatmap.json")
    assert detect_source(info) == "heatmap"


def test_detect_source_falls_back_to_chapters():
    info = load("info_with_chapters_only.json")
    assert detect_source(info) == "chapters"


def test_detect_source_returns_fallback_when_nothing():
    info = load("info_no_heatmap_no_chapters.json")
    assert detect_source(info) == "transcript_fallback"


# --- extract_highlight_candidates: heatmap path ---

def test_heatmap_returns_spans_above_threshold_sorted_by_score():
    info = load("info_with_heatmap.json")
    spans = extract_highlight_candidates(info, threshold=0.7, top_n=10)

    # Values above 0.7: segments with values 0.95, 0.80, 0.85 → 3 spans
    assert len(spans) == 3
    # Sorted by score descending
    assert [s.score for s in spans] == [0.95, 0.85, 0.80]
    # Ranks are 1,2,3
    assert [s.rank for s in spans] == [1, 2, 3]
    # All are heatmap_peak kind
    assert all(s.kind == "heatmap_peak" for s in spans)


def test_heatmap_respects_top_n_limit():
    info = load("info_with_heatmap.json")
    spans = extract_highlight_candidates(info, threshold=0.0, top_n=2)
    assert len(spans) == 2


def test_heatmap_attaches_chapter_title_when_overlap():
    info = load("info_with_heatmap.json")
    spans = extract_highlight_candidates(info, threshold=0.7, top_n=10)
    # span 20-30 falls in "Intro" (0-30)
    intro_span = next(s for s in spans if s.start == 20.0)
    assert intro_span.chapter == "Intro"
    # span 50-60 falls in "Main" (30-60)
    main_span = next(s for s in spans if s.start == 50.0)
    assert main_span.chapter == "Main"


# --- extract_highlight_candidates: chapters fallback ---

def test_chapters_become_spans_when_no_heatmap():
    info = load("info_with_chapters_only.json")
    spans = extract_highlight_candidates(info, threshold=0.7, top_n=10)
    assert len(spans) == 3
    assert all(s.kind == "chapter" for s in spans)
    # Equal score because we have no signal to rank them
    assert all(s.score == 1.0 for s in spans)
    # Preserve chapter order → ranks 1,2,3
    assert [s.chapter for s in spans] == ["Intro", "Main Topic", "Outro"]


# --- extract_highlight_candidates: nothing to work with ---

def test_returns_empty_when_no_signals():
    info = load("info_no_heatmap_no_chapters.json")
    spans = extract_highlight_candidates(info, threshold=0.7, top_n=10)
    assert spans == []
