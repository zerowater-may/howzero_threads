"""Tests for green marker bbox detection."""

from pathlib import Path

import pytest

from scripts.nano_carousel.marker_detector import detect_green_marker
from scripts.nano_carousel.types import MarkerBBox


FIXTURES = Path(__file__).parent / "fixtures"


def test_detects_green_circle():
    bbox = detect_green_marker(FIXTURES / "marker_green_center.png")
    assert isinstance(bbox, MarkerBBox)
    # Circle drawn at ellipse [100, 1200, 260, 1360] → center (180, 1280)
    assert 170 <= bbox.cx <= 190
    assert 1270 <= bbox.cy <= 1290
    # Width/height ~160
    assert 150 <= bbox.w <= 170
    assert 150 <= bbox.h <= 170


def test_returns_none_when_no_green():
    bbox = detect_green_marker(FIXTURES / "marker_no_green.png")
    assert bbox is None


def test_raises_on_missing_file(tmp_path):
    with pytest.raises(FileNotFoundError):
        detect_green_marker(tmp_path / "does_not_exist.png")
