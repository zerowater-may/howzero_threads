"""Tests for slides.html assembly."""

from pathlib import Path

from scripts.nano_carousel.html_renderer import render_slide_html
from scripts.nano_carousel.types import MarkerBBox, SlideSpec


def _spec():
    return SlideSpec(
        idx=1, layout="apartment-card", mascot_pose="shining",
        headline="가양2단지성지 34A",
        body_lines=["5년 +136%", "현재 호가 7.16억"],
        checkpoint_lines=["9호선 급행역", "마곡지구"],
        whisper="시세 뽑아봤다구~",
    )


def test_html_contains_template_image():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("template.png"),
        mascot_bbox=MarkerBBox(x=100, y=1200, w=160, h=160, cx=180, cy=1280),
        mascot_asset_path=Path("mascot-shining.png"),
    )
    assert "template.png" in html
    assert "mascot-shining.png" in html


def test_html_contains_all_text_blocks():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("template.png"),
        mascot_bbox=MarkerBBox(x=100, y=1200, w=160, h=160, cx=180, cy=1280),
        mascot_asset_path=Path("mascot.png"),
    )
    assert "가양2단지성지 34A" in html
    assert "5년 +136%" in html
    assert "9호선 급행역" in html
    assert "시세 뽑아봤다구~" in html


def test_html_positions_mascot_at_bbox():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("template.png"),
        mascot_bbox=MarkerBBox(x=100, y=1200, w=160, h=160, cx=180, cy=1280),
        mascot_asset_path=Path("mascot.png"),
    )
    assert "left: 100px" in html or "left:100px" in html
    assert "top: 1200px" in html or "top:1200px" in html


def test_html_has_slide_id():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("t.png"),
        mascot_bbox=MarkerBBox(x=0, y=0, w=1, h=1, cx=0, cy=0),
        mascot_asset_path=Path("m.png"),
    )
    assert 'id="slide-1"' in html


def test_html_includes_fonts():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("t.png"),
        mascot_bbox=MarkerBBox(x=0, y=0, w=1, h=1, cx=0, cy=0),
        mascot_asset_path=Path("m.png"),
    )
    assert "Jua" in html
    assert "Gaegu" in html
    assert "Noto+Sans+KR" in html or "Noto Sans KR" in html
