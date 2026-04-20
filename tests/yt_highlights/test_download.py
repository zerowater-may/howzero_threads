from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from scripts.yt_highlights.download import (
    download_video,
    extract_video_id,
    DownloadError,
)


# --- extract_video_id ---

def test_extract_video_id_from_watch_url():
    assert extract_video_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ") == "dQw4w9WgXcQ"


def test_extract_video_id_from_short_url():
    assert extract_video_id("https://youtu.be/dQw4w9WgXcQ") == "dQw4w9WgXcQ"


def test_extract_video_id_strips_query_params():
    assert extract_video_id("https://youtube.com/watch?v=dQw4w9WgXcQ&t=45") == "dQw4w9WgXcQ"


def test_extract_video_id_rejects_non_youtube():
    with pytest.raises(ValueError, match="Not a YouTube URL"):
        extract_video_id("https://vimeo.com/12345")


# --- download_video: success path ---

def test_download_video_invokes_yt_dlp_and_returns_paths(tmp_path):
    def fake_run(cmd, **kwargs):
        # yt-dlp is asked to write: <tmp>/VID.mp4 and <tmp>/VID.info.json
        out_template = [a for a in cmd if "%(id)s" in str(a)][0]
        prefix = out_template.split("/%(id)s")[0]
        (Path(prefix) / "dQw4w9WgXcQ.mp4").write_bytes(b"fake video")
        (Path(prefix) / "dQw4w9WgXcQ.info.json").write_text('{"id":"dQw4w9WgXcQ"}')
        return MagicMock(returncode=0)

    with patch("scripts.yt_highlights.download.subprocess.run", side_effect=fake_run):
        result = download_video("https://youtu.be/dQw4w9WgXcQ", tmp_path)

    assert result["video_id"] == "dQw4w9WgXcQ"
    assert result["video_path"] == tmp_path / "dQw4w9WgXcQ.mp4"
    assert result["info_path"] == tmp_path / "dQw4w9WgXcQ.info.json"
    assert result["video_path"].exists()


def test_download_video_raises_on_failure(tmp_path):
    import subprocess as sp
    with patch(
        "scripts.yt_highlights.download.subprocess.run",
        side_effect=sp.CalledProcessError(1, "yt-dlp"),
    ):
        with pytest.raises(DownloadError):
            download_video("https://youtu.be/dQw4w9WgXcQ", tmp_path)


def test_download_video_is_idempotent(tmp_path):
    # If the video and info already exist, do not re-run yt-dlp.
    (tmp_path / "dQw4w9WgXcQ.mp4").write_bytes(b"cached")
    (tmp_path / "dQw4w9WgXcQ.info.json").write_text('{"id":"dQw4w9WgXcQ"}')

    with patch("scripts.yt_highlights.download.subprocess.run") as mock_run:
        result = download_video("https://youtu.be/dQw4w9WgXcQ", tmp_path)

    mock_run.assert_not_called()
    assert result["video_id"] == "dQw4w9WgXcQ"
