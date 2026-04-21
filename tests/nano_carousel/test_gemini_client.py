"""Tests for Nano Banana HTTP wrapper using requests mocking."""

import base64
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

from scripts.nano_carousel.gemini_client import generate_image, GeminiError


# Fake 1x1 red PNG
_FAKE_PNG_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5"
    "+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
)


def _fake_response(status=200, parts=None):
    m = MagicMock()
    m.status_code = status
    m.json.return_value = {
        "candidates": [{"content": {"parts": parts or []}}]
    }
    m.text = ""
    return m


def test_generate_image_saves_png(tmp_path):
    out = tmp_path / "out.png"
    with patch("scripts.nano_carousel.gemini_client.requests.post") as mock_post:
        mock_post.return_value = _fake_response(200, parts=[
            {"inlineData": {"mimeType": "image/png", "data": _FAKE_PNG_B64}},
        ])
        result = generate_image(
            prompt="test prompt",
            api_key="fake-key",
            out_path=out,
            model="gemini-2.5-flash-image",
        )
    assert result == out
    assert out.exists()
    assert out.read_bytes()[:8] == b"\x89PNG\r\n\x1a\n"  # PNG signature


def test_generate_image_retries_on_rate_limit(tmp_path):
    out = tmp_path / "out.png"
    calls = []
    def side_effect(*args, **kwargs):
        calls.append(1)
        if len(calls) == 1:
            return _fake_response(429, parts=[])
        return _fake_response(200, parts=[
            {"inlineData": {"mimeType": "image/png", "data": _FAKE_PNG_B64}},
        ])
    with patch("scripts.nano_carousel.gemini_client.requests.post",
               side_effect=side_effect):
        with patch("scripts.nano_carousel.gemini_client.time.sleep"):
            result = generate_image(
                prompt="p", api_key="k", out_path=out,
                model="m", max_retries=2,
            )
    assert result == out
    assert len(calls) == 2


def test_generate_image_raises_after_max_retries(tmp_path):
    out = tmp_path / "out.png"
    with patch("scripts.nano_carousel.gemini_client.requests.post") as mock_post:
        mock_post.return_value = _fake_response(500, parts=[])
        with patch("scripts.nano_carousel.gemini_client.time.sleep"):
            with pytest.raises(GeminiError):
                generate_image(
                    prompt="p", api_key="k", out_path=out,
                    model="m", max_retries=2,
                )


def test_generate_image_raises_when_no_image_in_response(tmp_path):
    out = tmp_path / "out.png"
    with patch("scripts.nano_carousel.gemini_client.requests.post") as mock_post:
        mock_post.return_value = _fake_response(200, parts=[{"text": "sorry"}])
        with pytest.raises(GeminiError, match="no image"):
            generate_image(
                prompt="p", api_key="k", out_path=out, model="m",
            )
