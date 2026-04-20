"""Wrapper around yt-dlp. Downloads video (≤480p for speed) + info.json."""

import re
import subprocess
from pathlib import Path
from typing import TypedDict


class DownloadError(RuntimeError):
    pass


class DownloadResult(TypedDict):
    video_id: str
    video_path: Path
    info_path: Path


_WATCH_RE = re.compile(r"[?&]v=([A-Za-z0-9_-]+)")
_SHORT_RE = re.compile(r"youtu\.be/([A-Za-z0-9_-]+)")


def extract_video_id(url: str) -> str:
    if "youtube.com" in url or "youtu.be" in url:
        m = _WATCH_RE.search(url) or _SHORT_RE.search(url)
        if m:
            return m.group(1)
    raise ValueError(f"Not a YouTube URL: {url}")


def download_video(url: str, out_dir: Path) -> DownloadResult:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    video_id = extract_video_id(url)

    video_path = out_dir / f"{video_id}.mp4"
    info_path = out_dir / f"{video_id}.info.json"

    # Idempotent: skip if already downloaded.
    if video_path.exists() and info_path.exists():
        return DownloadResult(
            video_id=video_id, video_path=video_path, info_path=info_path
        )

    cmd = [
        "yt-dlp",
        "-f", "bestvideo[height<=480]+bestaudio/best[height<=480]",
        "--merge-output-format", "mp4",
        "--write-info-json",
        "--no-playlist",
        "-o", str(out_dir / "%(id)s.%(ext)s"),
        url,
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        raise DownloadError(f"yt-dlp failed: {e.stderr or e}") from e

    if not video_path.exists() or not info_path.exists():
        raise DownloadError(
            f"yt-dlp did not produce expected files for {video_id}"
        )
    return DownloadResult(
        video_id=video_id, video_path=video_path, info_path=info_path
    )
