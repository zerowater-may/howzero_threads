# YouTube Highlight Extraction Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Python pipeline that takes a YouTube URL and emits a `highlights.json` + extracted frame images — the "hot parts" of the video identified from YouTube's Most Replayed heatmap, chapter markers, and (fallback) transcript-only analysis — to feed the carousel skill.

**Architecture:** A 6-module library under `scripts/yt_highlights/` orchestrated by a CLI entrypoint. Each stage is independent, testable, and caches its output on disk so re-runs skip finished work. The pipeline is: `yt-dlp → info.json + video.mp4 → youtube-transcript-api → transcript.json` in parallel with `PySceneDetect → scenes.json`, then `heatmap.py` decides highlight spans from `info.json`, then `frames.py` uses ffmpeg to cut JPG frames at the intersection of spans × scenes, and `merge.py` stitches everything into a single `highlights.json`. The Claude/carousel integration is **out of scope** for this plan.

**Tech Stack:**
- Python 3.10+ (project already requires this via `pyproject.toml`)
- `yt-dlp` (CLI, already installed at `/opt/homebrew/bin/yt-dlp`)
- `ffmpeg` (CLI, already installed at `/opt/homebrew/bin/ffmpeg`)
- `youtube-transcript-api` ≥ 1.2.4 (PyPI) — transcript fetching
- `scenedetect[opencv]` (PyPI) — scene boundary detection
- `pytest` + `pytest-mock` (already in project dev deps) — testing
- **No new HTTP libraries, no new LLM calls, no Claude usage** in this plan. Pure deterministic pipeline.

---

## File Structure

### New files

```
scripts/yt_highlights/
├── __init__.py          # package marker, re-exports public API
├── __main__.py          # CLI entrypoint (python -m scripts.yt_highlights)
├── models.py            # dataclasses: HighlightSpan, TranscriptSegment, Scene
├── download.py          # yt-dlp wrapper → (info.json path, video.mp4 path)
├── transcript.py        # youtube-transcript-api wrapper → transcript.json
├── heatmap.py           # info.json → list[HighlightSpan] with source tagging
├── scenes.py            # PySceneDetect wrapper → scenes.json
├── frames.py            # ffmpeg wrapper: timecode → JPG frame
└── merge.py             # combine all artifacts → highlights.json
tests/yt_highlights/
├── __init__.py
├── fixtures/
│   ├── info_with_heatmap.json       # real yt-dlp dump, trimmed
│   ├── info_with_chapters_only.json # no heatmap, 3 chapters
│   ├── info_no_heatmap_no_chapters.json
│   └── transcript_ko.json           # 50 segments in Korean
├── test_models.py
├── test_heatmap.py
├── test_transcript.py
├── test_scenes.py
├── test_frames.py
├── test_merge.py
└── test_cli.py
```

### Modified files

- `pyproject.toml` — add `[project.optional-dependencies.yt]` group

### Responsibility boundaries

| Module | Responsibility | Does NOT |
|---|---|---|
| `download.py` | Run `yt-dlp`, verify files on disk | Parse info.json |
| `transcript.py` | Fetch transcript via API, save JSON | Read video file |
| `heatmap.py` | Pure function: info dict → spans | Touch disk or network |
| `scenes.py` | Run PySceneDetect on video file | Extract frames |
| `frames.py` | Run ffmpeg, crop to 4:3 for carousel | Decide which timestamps |
| `merge.py` | Pure function: combine 4 inputs → output dict | Touch network |
| `__main__.py` | Orchestrate, handle CLI args, print progress | Contain business logic |

---

## Output Schema

`highlights.json` (deterministic, versioned):

```json
{
  "schema_version": 1,
  "video_id": "dQw4w9WgXcQ",
  "title": "Sample Video Title",
  "duration": 720.5,
  "source": "heatmap",
  "highlights": [
    {
      "rank": 1,
      "start": 125.3,
      "end": 145.7,
      "score": 0.95,
      "kind": "heatmap_peak",
      "chapter": "1000개 정책이란",
      "transcript": [
        {"t": 126.0, "d": 2.1, "text": "핵심은 1000개 정책입니다"},
        {"t": 128.1, "d": 1.8, "text": "6월 2일부터 시행됩니다"}
      ],
      "frames": ["frames/h01_f01.jpg", "frames/h01_f02.jpg"]
    }
  ]
}
```

`source` is one of: `"heatmap"`, `"chapters"`, `"transcript_fallback"` — tells downstream consumers how the spans were derived.

---

## Task 1: Project scaffolding + dependency declaration

**Files:**
- Create: `scripts/yt_highlights/__init__.py`
- Create: `tests/yt_highlights/__init__.py`
- Modify: `pyproject.toml` (add optional dep group)

- [ ] **Step 1: Create package directories**

```bash
mkdir -p scripts/yt_highlights tests/yt_highlights/fixtures
touch scripts/yt_highlights/__init__.py tests/yt_highlights/__init__.py
```

- [ ] **Step 2: Write `scripts/yt_highlights/__init__.py`**

```python
"""YouTube highlight extraction pipeline.

Inputs:  YouTube URL
Outputs: highlights.json + frame JPGs in an output directory.
"""

__version__ = "0.1.0"
```

- [ ] **Step 3: Add optional dependency group to `pyproject.toml`**

Find the `[project.optional-dependencies]` block and add a `yt` entry. If the block does not exist, create it. Current file has `dev = [...]` under this section.

Add after the `dev` entry, inside the same `[project.optional-dependencies]` table:

```toml
yt = [
    "youtube-transcript-api>=1.2.4",
    "scenedetect[opencv]>=0.6.4",
]
```

- [ ] **Step 4: Install the new deps**

Run: `pip install -e '.[yt,dev]'`
Expected: `Successfully installed scenedetect-... youtube-transcript-api-...`

Verify: `python -c "import youtube_transcript_api, scenedetect; print('ok')"`
Expected: `ok`

- [ ] **Step 5: Commit**

```bash
git add scripts/yt_highlights tests/yt_highlights pyproject.toml
git commit -m "yt-highlights: 프로젝트 스캐폴딩 및 의존성 추가"
```

---

## Task 2: Dataclasses for typed interchange

**Files:**
- Create: `scripts/yt_highlights/models.py`
- Create: `tests/yt_highlights/test_models.py`

- [ ] **Step 1: Write the failing test at `tests/yt_highlights/test_models.py`**

```python
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pytest tests/yt_highlights/test_models.py -v`
Expected: `ModuleNotFoundError: No module named 'scripts.yt_highlights.models'`

- [ ] **Step 3: Implement `scripts/yt_highlights/models.py`**

```python
from dataclasses import dataclass, field
from typing import Literal, Optional

HighlightKind = Literal["heatmap_peak", "chapter", "transcript_fallback"]
SourceType = Literal["heatmap", "chapters", "transcript_fallback"]


@dataclass(frozen=True)
class TranscriptSegment:
    t: float  # start seconds
    d: float  # duration seconds
    text: str

    def end(self) -> float:
        return self.t + self.d


@dataclass(frozen=True)
class Scene:
    index: int
    start: float
    end: float

    def contains(self, ts: float) -> bool:
        return self.start <= ts < self.end


@dataclass
class HighlightSpan:
    rank: int
    start: float
    end: float
    score: float
    kind: HighlightKind
    chapter: Optional[str] = None
    transcript: list[TranscriptSegment] = field(default_factory=list)
    frames: list[str] = field(default_factory=list)

    def duration(self) -> float:
        return self.end - self.start
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pytest tests/yt_highlights/test_models.py -v`
Expected: `3 passed`

- [ ] **Step 5: Commit**

```bash
git add scripts/yt_highlights/models.py tests/yt_highlights/test_models.py
git commit -m "yt-highlights: 데이터 모델 정의"
```

---

## Task 3: Heatmap / chapter parser (pure function, no I/O)

**Files:**
- Create: `scripts/yt_highlights/heatmap.py`
- Create: `tests/yt_highlights/fixtures/info_with_heatmap.json`
- Create: `tests/yt_highlights/fixtures/info_with_chapters_only.json`
- Create: `tests/yt_highlights/fixtures/info_no_heatmap_no_chapters.json`
- Create: `tests/yt_highlights/test_heatmap.py`

This is the highest-risk module — it decides what counts as a highlight. TDD strictly.

- [ ] **Step 1: Create `tests/yt_highlights/fixtures/info_with_heatmap.json`**

Write this exact content:

```json
{
  "id": "vid_heatmap",
  "title": "Video With Heatmap",
  "duration": 60.0,
  "chapters": [
    {"start_time": 0, "end_time": 30, "title": "Intro"},
    {"start_time": 30, "end_time": 60, "title": "Main"}
  ],
  "heatmap": [
    {"start_time": 0.0,  "end_time": 10.0, "value": 0.20},
    {"start_time": 10.0, "end_time": 20.0, "value": 0.30},
    {"start_time": 20.0, "end_time": 30.0, "value": 0.95},
    {"start_time": 30.0, "end_time": 40.0, "value": 0.80},
    {"start_time": 40.0, "end_time": 50.0, "value": 0.60},
    {"start_time": 50.0, "end_time": 60.0, "value": 0.85}
  ]
}
```

- [ ] **Step 2: Create `tests/yt_highlights/fixtures/info_with_chapters_only.json`**

```json
{
  "id": "vid_chapters",
  "title": "Video With Only Chapters",
  "duration": 120.0,
  "chapters": [
    {"start_time": 0,   "end_time": 30,  "title": "Intro"},
    {"start_time": 30,  "end_time": 70,  "title": "Main Topic"},
    {"start_time": 70,  "end_time": 120, "title": "Outro"}
  ],
  "heatmap": null
}
```

- [ ] **Step 3: Create `tests/yt_highlights/fixtures/info_no_heatmap_no_chapters.json`**

```json
{
  "id": "vid_bare",
  "title": "Bare Video",
  "duration": 90.0,
  "chapters": null,
  "heatmap": null
}
```

- [ ] **Step 4: Write failing tests at `tests/yt_highlights/test_heatmap.py`**

```python
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
```

- [ ] **Step 5: Run the tests to verify they fail**

Run: `pytest tests/yt_highlights/test_heatmap.py -v`
Expected: All tests fail with `ModuleNotFoundError` on `scripts.yt_highlights.heatmap`.

- [ ] **Step 6: Implement `scripts/yt_highlights/heatmap.py`**

```python
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
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `pytest tests/yt_highlights/test_heatmap.py -v`
Expected: `8 passed`

- [ ] **Step 8: Commit**

```bash
git add scripts/yt_highlights/heatmap.py tests/yt_highlights/test_heatmap.py tests/yt_highlights/fixtures/
git commit -m "yt-highlights: heatmap/chapter 파서 구현"
```

---

## Task 4: Transcript fetcher (thin wrapper with mocking)

**Files:**
- Create: `scripts/yt_highlights/transcript.py`
- Create: `tests/yt_highlights/fixtures/transcript_ko.json`
- Create: `tests/yt_highlights/test_transcript.py`

- [ ] **Step 1: Create the fixture at `tests/yt_highlights/fixtures/transcript_ko.json`**

```json
[
  {"t": 0.0,  "d": 2.5, "text": "안녕하세요 용감한용팀장입니다"},
  {"t": 2.5,  "d": 3.1, "text": "오늘은 스마트스토어 1000개 정책을 설명합니다"},
  {"t": 5.6,  "d": 2.8, "text": "6월 2일부터 기본 한도가 바뀝니다"}
]
```

- [ ] **Step 2: Write the failing test at `tests/yt_highlights/test_transcript.py`**

```python
import json
from pathlib import Path
from unittest.mock import MagicMock, patch

from scripts.yt_highlights.transcript import fetch_transcript, save_transcript
from scripts.yt_highlights.models import TranscriptSegment

FIXTURES = Path(__file__).parent / "fixtures"


class _FakeSnippet:
    def __init__(self, t, d, text):
        self.start = t
        self.duration = d
        self.text = text


def test_fetch_transcript_prefers_korean(monkeypatch):
    fake = MagicMock()
    fake.fetch.return_value = [
        _FakeSnippet(0.0, 2.5, "안녕하세요"),
        _FakeSnippet(2.5, 3.0, "오늘은"),
    ]
    with patch("scripts.yt_highlights.transcript.YouTubeTranscriptApi", return_value=fake):
        segs = fetch_transcript("VIDEO_ID")

    fake.fetch.assert_called_once_with("VIDEO_ID", languages=["ko", "en"])
    assert len(segs) == 2
    assert isinstance(segs[0], TranscriptSegment)
    assert segs[0].text == "안녕하세요"
    assert segs[0].t == 0.0
    assert segs[0].d == 2.5


def test_save_transcript_writes_json(tmp_path):
    segs = [TranscriptSegment(t=0.0, d=2.5, text="안녕"),
            TranscriptSegment(t=2.5, d=3.0, text="오늘")]
    out = tmp_path / "transcript.json"
    save_transcript(segs, out)

    data = json.loads(out.read_text(encoding="utf-8"))
    assert data == [
        {"t": 0.0, "d": 2.5, "text": "안녕"},
        {"t": 2.5, "d": 3.0, "text": "오늘"},
    ]


def test_save_transcript_preserves_korean_unicode(tmp_path):
    segs = [TranscriptSegment(t=0.0, d=1.0, text="용감한용팀장")]
    out = tmp_path / "transcript.json"
    save_transcript(segs, out)

    raw = out.read_text(encoding="utf-8")
    # ensure_ascii=False must keep Hangul as-is, not \uXXXX
    assert "용감한용팀장" in raw
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pytest tests/yt_highlights/test_transcript.py -v`
Expected: `ModuleNotFoundError: No module named 'scripts.yt_highlights.transcript'`

- [ ] **Step 4: Implement `scripts/yt_highlights/transcript.py`**

```python
"""Thin wrapper around youtube-transcript-api with Korean preference."""

import json
from pathlib import Path
from typing import Iterable

from youtube_transcript_api import YouTubeTranscriptApi

from .models import TranscriptSegment


def fetch_transcript(
    video_id: str, languages: list[str] | None = None
) -> list[TranscriptSegment]:
    langs = languages or ["ko", "en"]
    api = YouTubeTranscriptApi()
    snippets = api.fetch(video_id, languages=langs)
    return [TranscriptSegment(t=float(s.start), d=float(s.duration), text=s.text)
            for s in snippets]


def save_transcript(segments: Iterable[TranscriptSegment], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    data = [{"t": s.t, "d": s.d, "text": s.text} for s in segments]
    out_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pytest tests/yt_highlights/test_transcript.py -v`
Expected: `3 passed`

- [ ] **Step 6: Commit**

```bash
git add scripts/yt_highlights/transcript.py tests/yt_highlights/test_transcript.py tests/yt_highlights/fixtures/transcript_ko.json
git commit -m "yt-highlights: 자막 추출 모듈 구현"
```

---

## Task 5: Download module (yt-dlp subprocess wrapper)

**Files:**
- Create: `scripts/yt_highlights/download.py`
- Create: `tests/yt_highlights/test_download.py`

This module runs `yt-dlp` as a subprocess. Tests mock `subprocess.run`.

- [ ] **Step 1: Write the failing test at `tests/yt_highlights/test_download.py`**

```python
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
    assert extract_video_id("https://www.youtube.com/watch?v=abc123") == "abc123"


def test_extract_video_id_from_short_url():
    assert extract_video_id("https://youtu.be/xyz789") == "xyz789"


def test_extract_video_id_strips_query_params():
    assert extract_video_id("https://youtube.com/watch?v=abc123&t=45") == "abc123"


def test_extract_video_id_rejects_non_youtube():
    with pytest.raises(ValueError, match="Not a YouTube URL"):
        extract_video_id("https://vimeo.com/12345")


# --- download_video: success path ---

def test_download_video_invokes_yt_dlp_and_returns_paths(tmp_path):
    def fake_run(cmd, **kwargs):
        # yt-dlp is asked to write: <tmp>/VID.mp4 and <tmp>/VID.info.json
        out_template = [a for a in cmd if "%(id)s" in str(a)][0]
        prefix = out_template.split("/%(id)s")[0]
        (Path(prefix) / "abc123.mp4").write_bytes(b"fake video")
        (Path(prefix) / "abc123.info.json").write_text('{"id":"abc123"}')
        return MagicMock(returncode=0)

    with patch("scripts.yt_highlights.download.subprocess.run", side_effect=fake_run):
        result = download_video("https://youtu.be/abc123", tmp_path)

    assert result["video_id"] == "abc123"
    assert result["video_path"] == tmp_path / "abc123.mp4"
    assert result["info_path"] == tmp_path / "abc123.info.json"
    assert result["video_path"].exists()


def test_download_video_raises_on_failure(tmp_path):
    import subprocess as sp
    with patch(
        "scripts.yt_highlights.download.subprocess.run",
        side_effect=sp.CalledProcessError(1, "yt-dlp"),
    ):
        with pytest.raises(DownloadError):
            download_video("https://youtu.be/abc123", tmp_path)


def test_download_video_is_idempotent(tmp_path):
    # If the video and info already exist, do not re-run yt-dlp.
    (tmp_path / "abc123.mp4").write_bytes(b"cached")
    (tmp_path / "abc123.info.json").write_text('{"id":"abc123"}')

    with patch("scripts.yt_highlights.download.subprocess.run") as mock_run:
        result = download_video("https://youtu.be/abc123", tmp_path)

    mock_run.assert_not_called()
    assert result["video_id"] == "abc123"
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pytest tests/yt_highlights/test_download.py -v`
Expected: `ModuleNotFoundError: No module named 'scripts.yt_highlights.download'`

- [ ] **Step 3: Implement `scripts/yt_highlights/download.py`**

```python
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


_WATCH_RE = re.compile(r"[?&]v=([A-Za-z0-9_-]{11})")
_SHORT_RE = re.compile(r"youtu\.be/([A-Za-z0-9_-]{11})")


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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/yt_highlights/test_download.py -v`
Expected: `7 passed`

- [ ] **Step 5: Commit**

```bash
git add scripts/yt_highlights/download.py tests/yt_highlights/test_download.py
git commit -m "yt-highlights: yt-dlp 다운로드 래퍼 구현"
```

---

## Task 6: Scene detection module

**Files:**
- Create: `scripts/yt_highlights/scenes.py`
- Create: `tests/yt_highlights/test_scenes.py`

- [ ] **Step 1: Write the failing test at `tests/yt_highlights/test_scenes.py`**

```python
from pathlib import Path
from unittest.mock import MagicMock, patch

from scripts.yt_highlights.scenes import detect_scenes, save_scenes
from scripts.yt_highlights.models import Scene


class _FakeFrameTimecode:
    def __init__(self, seconds: float):
        self._s = seconds
    def get_seconds(self) -> float:
        return self._s


def test_detect_scenes_converts_scene_list_to_dataclasses(tmp_path):
    video = tmp_path / "video.mp4"
    video.write_bytes(b"fake")

    fake_scene_list = [
        (_FakeFrameTimecode(0.0),  _FakeFrameTimecode(10.0)),
        (_FakeFrameTimecode(10.0), _FakeFrameTimecode(25.5)),
    ]
    with patch(
        "scripts.yt_highlights.scenes.detect",
        return_value=fake_scene_list,
    ) as mock_detect:
        scenes = detect_scenes(video, threshold=27.0)

    mock_detect.assert_called_once()
    assert len(scenes) == 2
    assert scenes[0] == Scene(index=0, start=0.0, end=10.0)
    assert scenes[1] == Scene(index=1, start=10.0, end=25.5)


def test_save_scenes_writes_json(tmp_path):
    scenes = [Scene(index=0, start=0.0, end=10.0),
              Scene(index=1, start=10.0, end=25.5)]
    out = tmp_path / "scenes.json"
    save_scenes(scenes, out)

    import json
    data = json.loads(out.read_text())
    assert data == [
        {"index": 0, "start": 0.0, "end": 10.0},
        {"index": 1, "start": 10.0, "end": 25.5},
    ]
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pytest tests/yt_highlights/test_scenes.py -v`
Expected: `ModuleNotFoundError: No module named 'scripts.yt_highlights.scenes'`

- [ ] **Step 3: Implement `scripts/yt_highlights/scenes.py`**

```python
"""PySceneDetect wrapper. Returns Scene dataclasses, saves JSON."""

import json
from pathlib import Path
from typing import Iterable

from scenedetect import detect, ContentDetector

from .models import Scene


def detect_scenes(video_path: Path, threshold: float = 27.0) -> list[Scene]:
    raw = detect(str(video_path), ContentDetector(threshold=threshold))
    return [
        Scene(index=i, start=start.get_seconds(), end=end.get_seconds())
        for i, (start, end) in enumerate(raw)
    ]


def save_scenes(scenes: Iterable[Scene], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    data = [{"index": s.index, "start": s.start, "end": s.end} for s in scenes]
    out_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/yt_highlights/test_scenes.py -v`
Expected: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add scripts/yt_highlights/scenes.py tests/yt_highlights/test_scenes.py
git commit -m "yt-highlights: 장면 감지 모듈 구현"
```

---

## Task 7: Frame extraction module (ffmpeg subprocess)

**Files:**
- Create: `scripts/yt_highlights/frames.py`
- Create: `tests/yt_highlights/test_frames.py`

This picks which scenes fall inside each highlight span and extracts up to 2 frames per span (mid-scene, 1 second into the scene for stability).

- [ ] **Step 1: Write the failing test at `tests/yt_highlights/test_frames.py`**

```python
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pytest tests/yt_highlights/test_frames.py -v`
Expected: `ModuleNotFoundError: No module named 'scripts.yt_highlights.frames'`

- [ ] **Step 3: Implement `scripts/yt_highlights/frames.py`**

```python
"""Frame extraction via ffmpeg. Picks scenes inside highlight spans,
crops to 4:3 for carousel use."""

import subprocess
from pathlib import Path

from .models import HighlightSpan, Scene


class FrameError(RuntimeError):
    pass


# 1080x1440 carousel is 3:4 portrait. Crop source (16:9) to 3:4 from center.
# vf: crop='min(iw, ih*3/4)':'min(ih, iw*4/3)'
_CROP_FILTER = "crop='min(iw,ih*3/4)':'min(ih,iw*4/3)'"


def extract_frame(video_path: Path, timestamp: float, out_path: Path) -> Path:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg",
        "-ss", str(timestamp),
        "-i", str(video_path),
        "-frames:v", "1",
        "-q:v", "2",
        "-vf", _CROP_FILTER,
        "-y",
        "-loglevel", "error",
        str(out_path),
    ]
    subprocess.run(cmd, check=False, capture_output=True, text=True)
    if not out_path.exists():
        raise FrameError(
            f"ffmpeg did not produce {out_path} (ts={timestamp})"
        )
    return out_path


def select_scenes_for_span(
    span: HighlightSpan, scenes: list[Scene]
) -> list[Scene]:
    overlapping = [
        s for s in scenes
        if s.end > span.start and s.start < span.end
    ]
    if overlapping:
        return overlapping
    # Synthetic fallback: treat whole span as one "scene"
    return [Scene(index=-1, start=span.start, end=span.end)]


def extract_frames_for_span(
    span: HighlightSpan,
    scenes: list[Scene],
    video_path: Path,
    out_dir: Path,
    max_frames: int = 2,
) -> list[Path]:
    out_dir = Path(out_dir)
    selected = select_scenes_for_span(span, scenes)[:max_frames]

    frames: list[Path] = []
    for i, scene in enumerate(selected, start=1):
        # Aim for 1s into the scene, but clamp to span bounds.
        ts = max(span.start, min(scene.start + 1.0, span.end - 0.1))
        name = f"h{span.rank:02d}_f{i:02d}.jpg"
        try:
            frames.append(extract_frame(video_path, ts, out_dir / name))
        except FrameError:
            continue  # skip this scene, keep going
    return frames
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/yt_highlights/test_frames.py -v`
Expected: `6 passed`

- [ ] **Step 5: Commit**

```bash
git add scripts/yt_highlights/frames.py tests/yt_highlights/test_frames.py
git commit -m "yt-highlights: 프레임 추출 모듈 구현"
```

---

## Task 8: Merge module (pure function, combines all artifacts)

**Files:**
- Create: `scripts/yt_highlights/merge.py`
- Create: `tests/yt_highlights/test_merge.py`

- [ ] **Step 1: Write the failing test at `tests/yt_highlights/test_merge.py`**

```python
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pytest tests/yt_highlights/test_merge.py -v`
Expected: `ModuleNotFoundError: No module named 'scripts.yt_highlights.merge'`

- [ ] **Step 3: Implement `scripts/yt_highlights/merge.py`**

```python
"""Pure assembly: combines info + transcript + spans + frame paths → dict."""

from pathlib import Path
from typing import Iterable

from .models import HighlightSpan, TranscriptSegment, SourceType

SCHEMA_VERSION = 1


def _transcript_in(
    span: HighlightSpan, transcript: Iterable[TranscriptSegment]
) -> list[dict]:
    out = []
    for s in transcript:
        if s.end() > span.start and s.t < span.end:
            out.append({"t": s.t, "d": s.d, "text": s.text})
    return out


def build_highlights(
    *,
    info: dict,
    source: SourceType,
    transcript: Iterable[TranscriptSegment],
    spans: Iterable[HighlightSpan],
    frames_by_rank: dict[int, list[Path]],
    frames_root: Path,
) -> dict:
    transcript = list(transcript)
    frames_root = Path(frames_root)

    highlights = []
    for span in spans:
        frame_paths = frames_by_rank.get(span.rank, [])
        rel = [str(Path(frames_root.name) / p.name) for p in frame_paths]
        highlights.append({
            "rank": span.rank,
            "start": span.start,
            "end": span.end,
            "score": span.score,
            "kind": span.kind,
            "chapter": span.chapter,
            "transcript": _transcript_in(span, transcript),
            "frames": rel,
        })

    return {
        "schema_version": SCHEMA_VERSION,
        "video_id": info.get("id"),
        "title": info.get("title"),
        "duration": info.get("duration"),
        "source": source,
        "highlights": highlights,
    }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/yt_highlights/test_merge.py -v`
Expected: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add scripts/yt_highlights/merge.py tests/yt_highlights/test_merge.py
git commit -m "yt-highlights: highlights.json merge 모듈 구현"
```

---

## Task 9: CLI entrypoint (orchestration)

**Files:**
- Create: `scripts/yt_highlights/__main__.py`
- Create: `tests/yt_highlights/test_cli.py`

- [ ] **Step 1: Write the failing test at `tests/yt_highlights/test_cli.py`**

```python
import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from scripts.yt_highlights.__main__ import main
from scripts.yt_highlights.models import (
    HighlightSpan, TranscriptSegment, Scene,
)


def test_main_orchestrates_all_stages_and_writes_highlights_json(tmp_path):
    url = "https://youtu.be/abc123"
    out = tmp_path / "out"

    info = {
        "id": "abc123", "title": "T", "duration": 30.0,
        "chapters": [{"start_time": 0, "end_time": 30, "title": "All"}],
        "heatmap": [
            {"start_time": 10.0, "end_time": 20.0, "value": 0.9},
        ],
    }
    (tmp_path / "abc123.mp4").write_bytes(b"fake")
    info_path = tmp_path / "abc123.info.json"
    info_path.write_text(json.dumps(info))

    with patch("scripts.yt_highlights.__main__.download_video") as mock_dl, \
         patch("scripts.yt_highlights.__main__.fetch_transcript") as mock_tr, \
         patch("scripts.yt_highlights.__main__.detect_scenes") as mock_sc, \
         patch("scripts.yt_highlights.__main__.extract_frames_for_span") as mock_fr:
        mock_dl.return_value = {
            "video_id": "abc123",
            "video_path": tmp_path / "abc123.mp4",
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
    assert data["video_id"] == "abc123"
    assert data["source"] == "heatmap"
    assert len(data["highlights"]) == 1
    assert data["highlights"][0]["frames"] == ["frames/h01_f01.jpg"]


def test_main_returns_nonzero_on_bad_url():
    exit_code = main(["https://vimeo.com/12345", "--out", "/tmp/unused"])
    assert exit_code != 0
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pytest tests/yt_highlights/test_cli.py -v`
Expected: `ModuleNotFoundError: No module named 'scripts.yt_highlights.__main__'`

- [ ] **Step 3: Implement `scripts/yt_highlights/__main__.py`**

```python
"""CLI: python -m scripts.yt_highlights <url> --out <path>"""

import argparse
import json
import sys
from pathlib import Path

from .download import download_video, DownloadError
from .transcript import fetch_transcript, save_transcript
from .scenes import detect_scenes, save_scenes
from .heatmap import extract_highlight_candidates, detect_source
from .frames import extract_frames_for_span
from .merge import build_highlights


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(
        prog="yt-highlights",
        description="Extract highlight spans + frames from a YouTube video.",
    )
    p.add_argument("url", help="YouTube video URL")
    p.add_argument("--out", required=True, help="Output directory")
    p.add_argument("--threshold", type=float, default=0.7,
                   help="Heatmap value threshold (default 0.7)")
    p.add_argument("--top-n", type=int, default=15,
                   help="Max number of highlight spans (default 15)")
    p.add_argument("--scene-threshold", type=float, default=27.0,
                   help="PySceneDetect content threshold (default 27.0)")
    p.add_argument("--max-frames", type=int, default=2,
                   help="Max frames per highlight (default 2)")
    args = p.parse_args(argv)

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    frames_dir = out / "frames"

    # 1. Download video + info.json
    try:
        dl = download_video(args.url, out)
    except (ValueError, DownloadError) as e:
        print(f"[error] download: {e}", file=sys.stderr)
        return 2

    print(f"[1/5] downloaded: {dl['video_id']}")

    # 2. Transcript
    try:
        transcript = fetch_transcript(dl["video_id"])
    except Exception as e:
        print(f"[warn] transcript unavailable: {e}", file=sys.stderr)
        transcript = []
    save_transcript(transcript, out / "transcript.json")
    print(f"[2/5] transcript: {len(transcript)} segments")

    # 3. Scenes
    try:
        scenes = detect_scenes(dl["video_path"], threshold=args.scene_threshold)
    except Exception as e:
        print(f"[warn] scene detection failed: {e}", file=sys.stderr)
        scenes = []
    save_scenes(scenes, out / "scenes.json")
    print(f"[3/5] scenes: {len(scenes)} detected")

    # 4. Highlight candidates
    info = json.loads(dl["info_path"].read_text(encoding="utf-8"))
    source = detect_source(info)
    spans = extract_highlight_candidates(
        info, threshold=args.threshold, top_n=args.top_n
    )
    print(f"[4/5] highlights: {len(spans)} spans from {source}")

    # 5. Frames per span
    frames_by_rank: dict[int, list[Path]] = {}
    for span in spans:
        paths = extract_frames_for_span(
            span, scenes, dl["video_path"], frames_dir,
            max_frames=args.max_frames,
        )
        if paths:
            frames_by_rank[span.rank] = paths

    # 6. Merge → highlights.json
    output = build_highlights(
        info=info, source=source,
        transcript=transcript, spans=spans,
        frames_by_rank=frames_by_rank,
        frames_root=frames_dir,
    )
    (out / "highlights.json").write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"[5/5] wrote {out/'highlights.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/yt_highlights/test_cli.py -v`
Expected: `2 passed`

- [ ] **Step 5: Run the full suite**

Run: `pytest tests/yt_highlights/ -v`
Expected: All tests pass (total across all modules).

- [ ] **Step 6: Commit**

```bash
git add scripts/yt_highlights/__main__.py tests/yt_highlights/test_cli.py
git commit -m "yt-highlights: CLI 오케스트레이션 및 end-to-end 테스트"
```

---

## Task 10: Smoke test against a real YouTube video (manual, documented)

**Files:**
- Create: `scripts/yt_highlights/README.md`

Automated tests used mocks. This task verifies the pipeline against a real URL once, then documents the procedure so future engineers can re-run it. No new code.

- [ ] **Step 1: Write `scripts/yt_highlights/README.md`**

```markdown
# yt_highlights

Extract highlight spans + frames from a YouTube video.

## Install

```bash
pip install -e '.[yt,dev]'
```

Requires `yt-dlp` and `ffmpeg` on PATH (both installed via Homebrew).

## Run

```bash
python -m scripts.yt_highlights "<YOUTUBE_URL>" --out ./out/<run_name>
```

Produces in `./out/<run_name>/`:
- `<video_id>.mp4` + `<video_id>.info.json` (yt-dlp artifacts)
- `transcript.json` — [{t, d, text}, ...]
- `scenes.json` — [{index, start, end}, ...]
- `frames/h01_f01.jpg`, ... — cropped 3:4 JPGs, ordered by highlight rank
- `highlights.json` — final assembled output

## Flags

| Flag | Default | Meaning |
|---|---:|---|
| `--threshold` | 0.7 | Heatmap value cutoff (0–1). Lower = more highlights. |
| `--top-n` | 15 | Max highlight spans returned. |
| `--scene-threshold` | 27.0 | PySceneDetect `ContentDetector` threshold. Lower = more sensitive. |
| `--max-frames` | 2 | Frames extracted per highlight span. |

## Source-detection logic

1. If `heatmap` field exists in info.json → rank by replay value (Most Replayed).
2. Else if `chapters` exist → each chapter = one highlight.
3. Else → empty highlight list; transcript-only downstream handling is needed.

## Smoke test

```bash
python -m scripts.yt_highlights \
  "https://www.youtube.com/watch?v=<any_popular_video>" \
  --out ./out/smoke
```

Expected: exit code 0, `./out/smoke/highlights.json` valid JSON, at least one frame file in `./out/smoke/frames/`.
```

- [ ] **Step 2: Run the smoke test manually**

Pick a popular Korean video (e.g. a recent 용팀장 YouTube upload) and run:

```bash
python -m scripts.yt_highlights \
  "<PASTE_URL>" \
  --out /tmp/yt-highlights-smoke
```

Expected stdout sequence:
```
[1/5] downloaded: <id>
[2/5] transcript: <N> segments
[3/5] scenes: <M> detected
[4/5] highlights: <K> spans from heatmap
[5/5] wrote /tmp/yt-highlights-smoke/highlights.json
```

Verify:
```bash
jq '.source, .highlights | length' /tmp/yt-highlights-smoke/highlights.json
ls /tmp/yt-highlights-smoke/frames/ | head
```

If `source` is `"heatmap"` and frames directory has files → ✅

If `source` is `"transcript_fallback"` → the video has no heatmap or chapters; pick a more popular video and retry.

- [ ] **Step 3: Commit the README**

```bash
git add scripts/yt_highlights/README.md
git commit -m "yt-highlights: 사용법 README 및 스모크 테스트 절차"
```

---

## Spec Coverage Check

| Requirement from discussion | Covered by |
|---|---|
| Download YouTube video with yt-dlp | Task 5 |
| Write `info.json` with heatmap field | Task 5 (yt-dlp `--write-info-json` flag) |
| Fetch Korean-first transcript | Task 4 |
| Parse heatmap into ranked highlight spans | Task 3 |
| Chapter fallback when no heatmap | Task 3 |
| Empty list when neither signal exists | Task 3 (caller decides fallback) |
| Scene detection via PySceneDetect | Task 6 |
| Extract frames at scene boundaries via ffmpeg | Task 7 |
| Crop frames to 3:4 carousel ratio | Task 7 (`_CROP_FILTER`) |
| Single `highlights.json` output | Task 8 + Task 9 |
| CLI entrypoint with tunable thresholds | Task 9 |
| Idempotent re-runs (skip download if cached) | Task 5 |
| Smoke-tested against real video | Task 10 |

## Out of Scope (explicit)

- Claude-based slide structure generation from `highlights.json`
- Integration with the `carousel` skill (HTML rendering)
- Fallback when neither heatmap nor chapters exist (returns empty; downstream handles)
- Face-centered cropping (plain center crop is good enough for v1)
- Whisper transcript fallback for videos without subtitles
- YouTube comment-based highlight mining
- Caching across runs beyond simple file-existence checks

These are the next plan(s) after this one lands.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-20-yt-highlight-extraction.md`. Two execution options:

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task (10 tasks), review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session with checkpoints for review.

Which approach?
