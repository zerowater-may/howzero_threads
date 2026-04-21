"""Fixed text-overlay coordinates per slide layout type.

These are measured from the Nano Banana prompt's layout spec — as long as
the prompt asks for consistent regions, the text overlay coordinates stay
stable. If Nano Banana drifts, re-tune these values.
"""

from scripts.nano_carousel.types import TextBlock


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
