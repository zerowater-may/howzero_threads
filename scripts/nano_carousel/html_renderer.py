"""Assemble slides.html with text overlay on top of an AI-generated template.

V2: the mascot is drawn by Nano Banana as part of the template image
(using reference-image consistency). This renderer overlays only text.
"""

from pathlib import Path

from dataclasses import replace

from scripts.nano_carousel.layout_presets import (
    apartment_card_text_blocks,
    cover_text_blocks,
    cta_dark_text_blocks,
)
from scripts.nano_carousel.types import MarkerBBox, SlideSpec, TextBlock


_FONT_MAP = {
    "jua": "'Jua', sans-serif",
    "gaegu": "'Gaegu', cursive",
    "noto": "'Noto Sans KR', sans-serif",
}

_FONT_WEIGHT = {"jua": "400", "gaegu": "700", "noto": "700"}


def _text_color_for(spec: SlideSpec) -> str:
    return "#fff" if spec.layout == "cta-dark" else "#1a1a1a"


def _text_blocks_for(spec: SlideSpec) -> list[TextBlock]:
    if spec.layout == "apartment-card":
        return apartment_card_text_blocks(
            spec.headline, spec.body_lines, spec.checkpoint_lines, spec.whisper,
        )
    if spec.layout == "cover":
        return cover_text_blocks(
            spec.headline, spec.body_lines, spec.checkpoint_lines, spec.whisper,
        )
    if spec.layout == "cta-dark":
        return cta_dark_text_blocks(
            spec.headline, spec.body_lines, spec.checkpoint_lines, spec.whisper,
        )
    raise ValueError(f"layout not supported in MVP: {spec.layout}")


def _block_css(block: TextBlock, color: str = "#1a1a1a") -> str:
    family = _FONT_MAP.get(block.font, _FONT_MAP["noto"])
    weight = _FONT_WEIGHT.get(block.font, "700")
    # button label sits inside a yellow button on dark slide → keep dark text
    text_color = "#1a1a1a" if block.role == "button" else color
    # vertical centering via flex so text sits inside the detected box
    # instead of hugging the top edge. Whisper-like handwriting is left-
    # aligned; everything else center-aligned for visual balance.
    align = "flex-start" if block.role == "whisper" else "center"
    return (
        f"position:absolute; left:{block.x}px; top:{block.y}px; "
        f"width:{block.w}px; height:{block.h}px; "
        f"display:flex; align-items:center; justify-content:{align}; "
        f"text-align:center; "
        f"font-family:{family}; font-weight:{weight}; "
        f"font-size:{block.size}px; line-height:1.25; color:{text_color}; "
        f"white-space:pre-line;"
    )


_PAD_BY_ROLE = {
    "whisper": 32,   # 말풍선 tail 영역은 피하되 텍스트는 리드미컬하게
    "brand-tag": 18,
}
_CAP_BY_ROLE = {
    "whisper": 1.4,  # Gaegu 손글씨는 읽히려면 크게
}
_GLYPH_W_BY_ROLE = {
    # Korean glyph advance ≈ this ratio of font-size
    "whisper": 0.75,  # Gaegu 손글씨는 좁음 + 여유있게 width 활용
}


def _apply_detected_regions(
    blocks: list[TextBlock],
    regions: dict[str, MarkerBBox],
    padding: int = 28,
) -> list[TextBlock]:
    """Override block x/y/w/h with detected bbox coordinates when available.

    Auto-scales font size so content plausibly fits the detected box.
    Scale is bounded by both height AND width so long Korean strings don't
    overflow wobbly hand-drawn borders. Role-specific padding and cap
    handle edge cases (e.g. speech bubble tail area).
    """
    out: list[TextBlock] = []
    for b in blocks:
        bbox = regions.get(b.role)
        if bbox is None:
            out.append(b)
            continue
        pad = _PAD_BY_ROLE.get(b.role, padding)
        cap = _CAP_BY_ROLE.get(b.role, 1.1)
        glyph_w = _GLYPH_W_BY_ROLE.get(b.role, 0.95)

        new_x = bbox.x + pad
        new_y = bbox.y + pad
        new_w = max(bbox.w - 2 * pad, 80)
        new_h = max(bbox.h - 2 * pad, 40)
        # Height-based scale
        h_scale = new_h / max(b.h, 1)
        # Width-based scale — find longest line and approximate glyph advance
        longest = max(
            (len(line) for line in str(b.content).split("\n")), default=1
        )
        max_size_by_w = new_w / max(longest, 1) / glyph_w
        w_scale = max_size_by_w / max(b.size, 1)
        scale = min(h_scale, w_scale)
        scale = max(0.4, min(cap, scale))
        new_size = max(14, int(b.size * scale))
        out.append(
            replace(b, x=new_x, y=new_y, w=new_w, h=new_h, size=new_size)
        )
    return out


def _apply_overrides(
    blocks: list[TextBlock], overrides: dict | None
) -> list[TextBlock]:
    """Apply per-role manual overrides from SlideSpec.overrides.

    overrides = {"whisper": {"x": 520, "y": 1050, "w": 320, "h": 180, "size": 58}}
    Only provided keys are overridden; others stay as-is.
    """
    if not overrides:
        return blocks
    out: list[TextBlock] = []
    for b in blocks:
        ov = overrides.get(b.role)
        if not ov:
            out.append(b)
            continue
        out.append(replace(
            b,
            x=ov.get("x", b.x),
            y=ov.get("y", b.y),
            w=ov.get("w", b.w),
            h=ov.get("h", b.h),
            size=ov.get("size", b.size),
        ))
    return out


def render_slide_html(
    *,
    spec: SlideSpec,
    template_image_path: Path,
    detected_regions: dict[str, MarkerBBox] | None = None,
) -> str:
    """Return a complete HTML document with text overlay on the template.

    Priority: preset defaults → detected regions → manual overrides.
    Manual overrides (spec.overrides) win — allows pixel-perfect tuning
    when Gemini output drift or glyph-width estimation misses the mark.
    """
    blocks = _text_blocks_for(spec)
    if detected_regions:
        blocks = _apply_detected_regions(blocks, detected_regions)
    blocks = _apply_overrides(blocks, spec.overrides)
    color = _text_color_for(spec)
    text_html = "\n".join(
        f'<div style="{_block_css(b, color)}">{b.content}</div>' for b in blocks
    )
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Gaegu:wght@700&family=Noto+Sans+KR:wght@700&display=swap" rel="stylesheet">
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ background:#ddd; }}
.slide {{ width:1080px; height:1440px; position:relative; overflow:hidden;
  background:url('{template_image_path.name}') no-repeat top left / 1080px 1440px; }}
</style>
</head>
<body>
<div class="slide" id="slide-{spec.idx}">
  {text_html}
</div>
</body>
</html>
"""
