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
