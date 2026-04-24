"""Fixed text-overlay coordinates per slide layout type.

These are measured from the Nano Banana prompt's layout spec — as long as
the prompt asks for consistent regions, the text overlay coordinates stay
stable. If Nano Banana drifts, re-tune these values.
"""

from scripts.nano_carousel.types import TextBlock


def cover_text_blocks(
    headline: str,
    body_lines: list[str],
    checkpoint_lines: list[str],
    whisper: str,
) -> list[TextBlock]:
    """Cover slide: three stacked yellow highlights + mascot + speech bubble.

    Uses body_lines for the 3 stacked highlights (max 3 lines recommended).
    headline is the overall brand/sub-title shown small at the top.
    whisper goes into the speech bubble near the mascot.
    """
    # Three stacked highlights from body_lines (pad if missing)
    lines = list(body_lines) + [""] * 3
    blocks: list[TextBlock] = [
        TextBlock(
            role="brand-tag", content=headline,
            x=110, y=50, w=860, h=70,
            font="jua", size=36,
        ),
        TextBlock(
            role="hl-1", content=lines[0],
            x=130, y=220, w=820, h=160,
            font="jua", size=72,
        ),
        TextBlock(
            role="hl-2", content=lines[1],
            x=130, y=400, w=820, h=160,
            font="jua", size=72,
        ),
        TextBlock(
            role="hl-3", content=lines[2],
            x=130, y=580, w=820, h=160,
            font="jua", size=72,
        ),
        # speech bubble text (mascot is drawn bottom-center by AI)
        TextBlock(
            role="whisper", content=whisper,
            x=110, y=1140, w=500, h=180,
            font="gaegu", size=42,
        ),
    ]
    return blocks


def cta_dark_text_blocks(
    headline: str,
    body_lines: list[str],
    checkpoint_lines: list[str],
    whisper: str,
) -> list[TextBlock]:
    """Dark CTA slide: top highlight + mascot middle + bottom yellow button.

    body_lines: 2 lines of sub-copy rendered in white
    checkpoint_lines[0]: button label rendered inside the yellow button
    whisper: small hand-written text near bottom
    """
    body_text = "\n".join(body_lines[:2])
    button_text = checkpoint_lines[0] if checkpoint_lines else ""
    return [
        TextBlock(
            role="headline", content=headline,
            x=110, y=160, w=860, h=180,
            font="jua", size=110,
        ),
        TextBlock(
            role="body", content=body_text,
            x=130, y=460, w=820, h=220,
            font="noto", size=42,
        ),
        TextBlock(
            role="button", content=button_text,
            x=200, y=1060, w=700, h=140,
            font="jua", size=60,
        ),
        TextBlock(
            role="whisper", content=whisper,
            x=110, y=1300, w=860, h=80,
            font="gaegu", size=34,
        ),
    ]


def apartment_card_text_blocks(
    headline: str,
    body_lines: list[str],
    checkpoint_lines: list[str],
    whisper: str,
) -> list[TextBlock]:
    """Return text blocks for apartment-card layout.

    Coordinates match the prompt regions:
    - headline: yellow highlight strip (y 80-220)
    - body box: large rectangle (y 260-640)
    - checkpoint: right yellow box (y 680-950)
    - whisper: lower right area (y 1160-1340)
    """
    body_text = "\n".join(body_lines)
    check_text = "\n".join(f"· {line}" for line in checkpoint_lines)
    return [
        TextBlock(
            role="headline", content=headline,
            x=110, y=95, w=860, h=120,
            font="jua", size=72,
        ),
        TextBlock(
            role="body", content=body_text,
            x=130, y=290, w=820, h=320,
            font="noto", size=36,
        ),
        TextBlock(
            role="checkpoint", content=check_text,
            x=580, y=710, w=400, h=220,
            font="noto", size=26,
        ),
        TextBlock(
            role="whisper", content=whisper,
            x=340, y=1190, w=660, h=140,
            font="gaegu", size=40,
        ),
    ]
