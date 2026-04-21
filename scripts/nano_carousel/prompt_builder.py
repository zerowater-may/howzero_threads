"""Assemble Nano Banana prompts for Jipsaja-branded blank slide templates.

Key principle: NEVER include user content (headline text, body) in the
prompt — that tempts the model to render Korean text in the image.
We only describe the LAYOUT STRUCTURE and brand style.
"""

from scripts.nano_carousel.types import SlideSpec


_BRAND_BASE = """A square Instagram carousel slide template, 1080x1440 pixels,
hand-drawn doodle illustration in the style of a Korean influencer's
iPad Procreate notebook. White background (#FFFFFF).

Color palette: only black outlines (#1a1a1a) and mustard yellow accent (#FACC15).
No gradients, no shading, solid flat colors only.

Line quality: hand-drawn, slightly wobbly, imperfect. Not math-perfect,
not vector-clean. Slightly asymmetric — amateur notebook doodle quality,
NOT a polished Canva sticker, NOT a kawaii mascot logo."""


_NEGATIVE = """CRITICAL RULES — violate these and the image is unusable:
- ABSOLUTELY NO text, letters, words, numbers, typography, fonts,
  Korean characters, English characters, or gibberish anywhere
- All yellow highlight patches, speech bubbles, and rectangular info boxes
  must be 100% completely empty and blank inside
- No watermark, no signature, no logo
- No 3D render, no glossy, no gradients
- No photorealistic elements"""


_MASCOT_MARKER = """Mascot placement: draw a single solid bright green circle
(#00FF00, approximately 200 pixels diameter) at the designated mascot slot
location. This circle is a placeholder marker — do NOT draw a lion, animal,
character, or any figure. Just a plain green circle."""


def _layout_instructions(layout: str) -> str:
    if layout == "apartment-card":
        return """LAYOUT: Apartment listing card.
- Top (y 80-220): wide mustard yellow marker highlight patch for the headline,
  wobbly hand-drawn brush stroke shape, empty interior.
- Upper-middle (y 260-640): one large rectangular info box with a
  thick wobbly black border, empty interior, occupying most of the width.
- Lower-middle (y 680-950): two side-by-side smaller info boxes.
  Left box: white background with black wobbly border.
  Right box: mustard yellow fill with black wobbly border.
- Bottom-left corner (x 80-280, y 1160-1360): a single solid bright
  green circle (#00FF00) for the mascot placeholder marker.
- Bottom-right area (x 300-1000, y 1160-1340): empty space,
  reserved for handwritten whisper text overlay (keep background white)."""

    if layout == "cover":
        return """LAYOUT: Cover slide.
- Top half (y 100-700): three stacked wobbly mustard yellow marker
  highlights, centered horizontally, empty interior.
- Bottom half: one large solid bright green circle (#00FF00) centered
  for the mascot placeholder marker, flanked by empty wobbly
  speech bubble shape on one side."""

    if layout == "cta-dark":
        return """LAYOUT: Dark CTA slide with inverted colors.
- Background: solid dark charcoal (#1a1a1a).
- Top-center: a large mustard yellow marker highlight, empty interior.
- Middle-center: solid bright green circle (#00FF00) for mascot marker.
- Bottom: one empty rectangular box with mustard yellow fill
  and black wobbly border."""

    return "LAYOUT: Generic — top yellow highlight, middle empty box, bottom green mascot circle."


def build_prompt(spec: SlideSpec) -> str:
    """Assemble the full Nano Banana prompt for a given slide spec.

    Deliberately excludes all user content (headline, body, whisper) —
    those are overlaid later via HTML. Nano Banana only gets structural
    instructions to prevent Korean text leakage into the image.
    """
    return "\n\n".join([
        _BRAND_BASE,
        _layout_instructions(spec.layout),
        _MASCOT_MARKER,
        _NEGATIVE,
    ])
