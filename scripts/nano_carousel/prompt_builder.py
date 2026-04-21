"""Assemble concise Nano Banana prompts for Jipsaja brand carousel templates.

V2 approach (tuned to avoid IMAGE_RECITATION rejection):
- Caller attaches a mascot reference image to the Gemini request.
- Prompts are kept short (~1800 chars) — long prompts trigger recitation
  rejection. One tight style block + layout + negatives.
- Never include Korean user content (headline/body) — HTML overlays text later.
"""

from scripts.nano_carousel.types import SlideSpec


_STYLE_AND_CHARACTER = """A single Instagram carousel slide, exactly 1080 x 1440 pixels, 3:4 portrait.
Informational card news style, 2D flat illustration in simple hand-drawn doodle
style, like an iPad Procreate sketch. Cute, casual layout. White background.

CHARACTER — USE THE ATTACHED REFERENCE IMAGE:
Keep the exact same lion character from the reference — same mane, eyes,
mouth, proportions, angel wings hint. Fill the character body in mustard
yellow. Place it at the bottom-left or bottom corner with an explaining
or curious expression.

COLORS: black outlines (#1a1a1a) + white background + single mustard
yellow accent (#FACC15). No gradients. Solid flat colors only.

LINES: imperfect hand-drawn black lines, slightly wobbly and uneven.
Yellow highlight patches look like real marker brush strokes with edges
that slightly overflow. Wobbly organic borders, NOT straight rulers."""


def _layout_instructions(layout: str) -> str:
    if layout == "apartment-card":
        return """LAYOUT (apartment card):
- TOP (y 100-240): wide wobbly mustard-yellow marker highlight, empty inside.
- MIDDLE (y 280-640): one large rectangular info box with thick wobbly
  black border, empty inside.
- LOWER (y 680-960): two side-by-side boxes. Left: white with black border.
  Right: solid mustard yellow with black border. Both empty inside.
- BOTTOM (y 1000-1360): the lion character at bottom-left, with an empty
  wobbly speech bubble on its right side."""

    if layout == "cover":
        return """LAYOUT (cover):
- TOP HALF: three stacked wobbly mustard yellow marker highlights, each
  at slightly different angles, empty inside.
- BOTTOM HALF: the lion character centered, with an empty wobbly speech
  bubble asking a question."""

    if layout == "cta-dark":
        return """LAYOUT (dark CTA):
- Dark charcoal (#1a1a1a) background instead of white.
- TOP: wobbly mustard yellow marker highlight, empty inside.
- MIDDLE: the lion character, excited or waving.
- BOTTOM: one large wobbly button shape filled mustard yellow with black
  border, empty inside."""

    return """LAYOUT (generic): top yellow highlight, middle empty box,
bottom lion character + empty speech bubble."""


_NEGATIVE = """CRITICAL — strictly forbidden:
NO text, letters, words, numbers, typography, fonts, gibberish.
NO placeholder text like "lorem ipsum", "title here", "whisper text".
Every banner, box, and speech bubble is 100% blank inside.
No 3D, no gradients, no glossy, no kawaii sticker style, no vector-clean.
Match the reference character exactly — do not redesign."""


def build_prompt(spec: SlideSpec) -> str:
    """Concise Nano Banana prompt. ~1800 chars to avoid recitation rejection."""
    return "\n\n".join([
        _STYLE_AND_CHARACTER,
        _layout_instructions(spec.layout),
        _NEGATIVE,
    ])
