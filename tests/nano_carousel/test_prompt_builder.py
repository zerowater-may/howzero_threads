"""Tests for V2 prompt assembly.

V2 uses a reference image for character consistency, so the prompt should
REFER to the attached reference rather than describing a placeholder marker.
"""

from scripts.nano_carousel.prompt_builder import build_prompt
from scripts.nano_carousel.types import SlideSpec


def _spec(layout="apartment-card"):
    return SlideSpec(
        idx=1, layout=layout, mascot_pose="shining",
        headline="가양2단지성지 34A",
        body_lines=["5년 +136%", "현재 호가 7.16억"],
        checkpoint_lines=["9호선", "마곡지구"],
        whisper="시세 뽑아봤다구~",
    )


def test_prompt_contains_brand_identity():
    prompt = build_prompt(_spec())
    assert "hand-drawn" in prompt.lower()
    assert "lion" in prompt.lower() or "mascot" in prompt.lower()
    assert "#FACC15" in prompt or "mustard" in prompt.lower()


def test_prompt_forbids_text():
    prompt = build_prompt(_spec())
    lower = prompt.lower()
    assert "no text" in lower or "blank" in lower or "empty" in lower
    assert "letters" in lower or "typography" in lower or "characters" in lower


def test_prompt_references_attached_image():
    """V2: prompt must point to the attached reference image for character
    consistency (not a green circle marker)."""
    prompt = build_prompt(_spec())
    lower = prompt.lower()
    assert "reference" in lower
    assert "attached" in lower or "from the reference" in lower


def test_prompt_apartment_card_specifics():
    prompt = build_prompt(_spec(layout="apartment-card"))
    lower = prompt.lower()
    assert "headline" in lower or "title" in lower
    assert "box" in lower or "panel" in lower


def test_prompt_does_not_leak_headline_content():
    spec = _spec()
    prompt = build_prompt(spec)
    assert spec.headline not in prompt
    assert "가양" not in prompt


def test_prompt_mentions_target_dimensions():
    """V2: prompt should hint 1080x1440 so Nano Banana composes at the right scale."""
    prompt = build_prompt(_spec())
    assert "1080" in prompt and "1440" in prompt
