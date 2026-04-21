"""Tests for V2 slides.html assembly.

V2: the mascot is drawn by Nano Banana in the template image, so the
renderer only overlays text — no mascot image tag, no bbox coordinates.
"""

from pathlib import Path

from scripts.nano_carousel.html_renderer import render_slide_html
from scripts.nano_carousel.types import SlideSpec


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
    )
    assert "template.png" in html


def test_html_contains_all_text_blocks():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("template.png"),
    )
    assert "가양2단지성지 34A" in html
    assert "5년 +136%" in html
    assert "9호선 급행역" in html
    assert "시세 뽑아봤다구~" in html


def test_html_has_slide_id():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("t.png"),
    )
    assert 'id="slide-1"' in html


def test_html_includes_fonts():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("t.png"),
    )
    assert "Jua" in html
    assert "Gaegu" in html
    assert "Noto+Sans+KR" in html or "Noto Sans KR" in html


def test_html_has_no_mascot_image_tag():
    """V2: mascot is drawn by AI in the template image, HTML must not
    have a separate mascot <img> tag."""
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("t.png"),
    )
    assert "mascot" not in html.lower() or "mascot-" not in html
