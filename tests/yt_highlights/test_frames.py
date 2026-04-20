from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from scripts.yt_highlights.frames import (
    extract_frame,
    select_scenes_for_span,
    extract_frames_for_span,
    FrameError,
)
from scripts.yt_highlights.models import HighlightSpan, Scene


# --- extract_frame ---

def test_extract_frame_calls_ffmpeg_with_correct_args(tmp_path):
    video = tmp_path / "video.mp4"
    video.write_bytes(b"fake")
    out = tmp_path / "frame.jpg"

    with patch("scripts.yt_highlights.frames.subprocess.run") as mock_run:
        mock_run.return_value = MagicMock(returncode=0)
        out.write_bytes(b"jpg")  # simulate ffmpeg output
        result = extract_frame(video, 12.5, out)

    args = mock_run.call_args[0][0]
    assert args[0] == "ffmpeg"
    assert "-ss" in args and "12.5" in args
    assert str(video) in args
    assert str(out) in args
    assert result == out


def test_extract_frame_raises_when_output_missing(tmp_path):
    video = tmp_path / "video.mp4"
    video.write_bytes(b"fake")
    out = tmp_path / "frame.jpg"

    with patch("scripts.yt_highlights.frames.subprocess.run"):
        with pytest.raises(FrameError):
            extract_frame(video, 5.0, out)


# --- select_scenes_for_span ---

def test_select_scenes_picks_all_scenes_overlapping_span():
    span = HighlightSpan(rank=1, start=10.0, end=30.0, score=1.0, kind="heatmap_peak")
    scenes = [
        Scene(index=0, start=0.0,  end=5.0),    # outside
        Scene(index=1, start=5.0,  end=15.0),   # partial overlap start
        Scene(index=2, start=15.0, end=25.0),   # fully inside
        Scene(index=3, start=25.0, end=35.0),   # partial overlap end
        Scene(index=4, start=40.0, end=50.0),   # outside
    ]
    result = select_scenes_for_span(span, scenes)
    assert [s.index for s in result] == [1, 2, 3]


def test_select_scenes_returns_empty_when_no_overlap():
    span = HighlightSpan(rank=1, start=100.0, end=110.0, score=1.0, kind="heatmap_peak")
    scenes = [Scene(index=0, start=0.0, end=10.0)]
    assert select_scenes_for_span(span, scenes) == []


def test_select_scenes_falls_back_to_span_midpoint_when_no_scenes():
    # When scenes list is empty entirely, we want a synthetic fallback.
    span = HighlightSpan(rank=1, start=10.0, end=30.0, score=1.0, kind="heatmap_peak")
    result = select_scenes_for_span(span, [])
    assert len(result) == 1
    assert result[0].start == 10.0  # span start
    assert result[0].end == 30.0    # span end
    assert result[0].index == -1     # sentinel for "synthetic"


# --- extract_frames_for_span ---

def test_extract_frames_for_span_limits_to_max_frames(tmp_path):
    video = tmp_path / "video.mp4"; video.write_bytes(b"fake")
    span = HighlightSpan(rank=1, start=0.0, end=50.0, score=1.0, kind="heatmap_peak")
    scenes = [
        Scene(index=0, start=0.0,  end=10.0),
        Scene(index=1, start=10.0, end=20.0),
        Scene(index=2, start=20.0, end=30.0),
        Scene(index=3, start=30.0, end=40.0),
    ]

    created = []
    def fake_run(cmd, **kw):
        # parse -o path: it's the last positional non-flag
        path = Path(cmd[-1])
        path.write_bytes(b"jpg")
        created.append(path)
        return MagicMock(returncode=0)

    with patch("scripts.yt_highlights.frames.subprocess.run", side_effect=fake_run):
        frames = extract_frames_for_span(
            span, scenes, video, tmp_path, max_frames=2
        )

    assert len(frames) == 2
    # Filenames follow h{rank:02d}_f{i:02d}.jpg pattern
    assert all(p.name.startswith("h01_f") for p in frames)
    assert all(p.suffix == ".jpg" for p in frames)
