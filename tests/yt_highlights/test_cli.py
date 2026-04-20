import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from scripts.yt_highlights.__main__ import main
from scripts.yt_highlights.models import (
    HighlightSpan, TranscriptSegment, Scene,
)


def test_main_orchestrates_all_stages_and_writes_highlights_json(tmp_path):
    url = "https://youtu.be/dQw4w9WgXcQ"
    out = tmp_path / "out"

    info = {
        "id": "dQw4w9WgXcQ", "title": "T", "duration": 30.0,
        "chapters": [{"start_time": 0, "end_time": 30, "title": "All"}],
        "heatmap": [
            {"start_time": 10.0, "end_time": 20.0, "value": 0.9},
        ],
    }
    (tmp_path / "dQw4w9WgXcQ.mp4").write_bytes(b"fake")
    info_path = tmp_path / "dQw4w9WgXcQ.info.json"
    info_path.write_text(json.dumps(info))

    with patch("scripts.yt_highlights.__main__.download_video") as mock_dl, \
         patch("scripts.yt_highlights.__main__.fetch_transcript") as mock_tr, \
         patch("scripts.yt_highlights.__main__.detect_scenes") as mock_sc, \
         patch("scripts.yt_highlights.__main__.extract_frames_for_span") as mock_fr:
        mock_dl.return_value = {
            "video_id": "dQw4w9WgXcQ",
            "video_path": tmp_path / "dQw4w9WgXcQ.mp4",
            "info_path": info_path,
        }
        mock_tr.return_value = [TranscriptSegment(t=12.0, d=2.0, text="핵심")]
        mock_sc.return_value = [Scene(index=0, start=0.0, end=30.0)]
        mock_fr.return_value = [out / "frames" / "h01_f01.jpg"]
        # Simulate frame file being created
        (out / "frames").mkdir(parents=True, exist_ok=True)
        (out / "frames" / "h01_f01.jpg").write_bytes(b"jpg")

        exit_code = main([url, "--out", str(out)])

    assert exit_code == 0
    highlights_path = out / "highlights.json"
    assert highlights_path.exists()

    data = json.loads(highlights_path.read_text())
    assert data["video_id"] == "dQw4w9WgXcQ"
    assert data["source"] == "heatmap"
    assert len(data["highlights"]) == 1
    assert data["highlights"][0]["frames"] == ["frames/h01_f01.jpg"]


def test_main_returns_nonzero_on_bad_url():
    exit_code = main(["https://vimeo.com/12345", "--out", "/tmp/unused"])
    assert exit_code != 0
