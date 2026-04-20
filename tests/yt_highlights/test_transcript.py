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
    assert "용감한용팀장" in raw
