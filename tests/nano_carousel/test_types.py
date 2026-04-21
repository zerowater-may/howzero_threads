"""Contract tests for nano_carousel dataclasses."""

import pytest
from scripts.nano_carousel.types import SlideSpec, MarkerBBox, TextBlock


def test_slide_spec_construction():
    spec = SlideSpec(
        idx=1,
        layout="apartment-card",
        mascot_pose="shining",
        headline="가양2단지성지 34A",
        body_lines=["5년 +136%", "현재 호가 7.16억"],
        checkpoint_lines=["9호선 급행역", "마곡지구 접근성"],
        whisper="5년 시세 다 뽑아봤다구~",
    )
    assert spec.idx == 1
    assert spec.layout == "apartment-card"
    assert spec.mascot_pose == "shining"


def test_slide_spec_frozen():
    spec = SlideSpec(
        idx=1, layout="apartment-card", mascot_pose="default",
        headline="t", body_lines=[], checkpoint_lines=[], whisper="",
    )
    with pytest.raises(AttributeError):
        spec.idx = 2  # frozen


def test_marker_bbox_construction():
    bbox = MarkerBBox(x=100, y=200, w=160, h=160, cx=180, cy=280)
    assert bbox.cx == 180
    assert bbox.cy == 280


def test_text_block_construction():
    tb = TextBlock(role="headline", content="abc", x=80, y=100, w=800, h=120,
                   font="jua", size=72)
    assert tb.role == "headline"
    assert tb.size == 72
