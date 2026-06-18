import json
from pathlib import Path

from scripts.content_reels import __main__ as content_reels_cli


def test_cli_generates_audio_mapped_reels_after_trim(monkeypatch, tmp_path):
    data = {
        "generatedAt": "2026-04-30T00:00:00+09:00",
        "title": "강남만 빼고 서울 집값 다 올랐다",
        "subtitle": "",
        "periodLabel": "2025 평균 vs 2026 현재",
        "source": "국토부 실거래가",
        "sizeLabel": "300세대 이상 · 평형 무관",
        "districts": [],
    }
    data_path = tmp_path / "data.json"
    data_path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    out_dir = tmp_path / "reels"
    calls = []

    monkeypatch.setattr(
        content_reels_cli,
        "REELS_DATA_TARGET",
        tmp_path / "remotion-data" / "seoul-prices.json",
    )
    monkeypatch.setattr(
        content_reels_cli,
        "trigger_remotion_render",
        lambda **kwargs: calls.append(("render", kwargs)) or 0,
    )
    monkeypatch.setattr(
        content_reels_cli,
        "ffmpeg_export_reel",
        lambda *args, **kwargs: calls.append(("trim", args, kwargs)) or 0,
    )
    monkeypatch.setattr(
        content_reels_cli,
        "ffmpeg_make_audio_mapped_reels",
        lambda *args, **kwargs: calls.append(("audio", args, kwargs)) or 0,
    )

    rc = content_reels_cli.main(["--data", str(data_path), "--out", str(out_dir)])

    assert rc == 0
    assert [call[0] for call in calls] == ["render", "trim", "audio"]
    audio_args = calls[-1][1]
    assert audio_args[0] == out_dir / "zipsaja-reel-30s.mp4"
    assert audio_args[1] == out_dir / "zipsaja-reel-30s-audio-mapped.mp4"
    assert audio_args[2] == out_dir / "zipsaja-reel-30s-audio-mapped-ig-safe.mp4"
