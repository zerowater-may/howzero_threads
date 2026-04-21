"""Assemble the final slides.html with image + mascot + text overlay."""

from pathlib import Path

from scripts.nano_carousel.layout_presets import apartment_card_text_blocks
from scripts.nano_carousel.types import MarkerBBox, SlideSpec, TextBlock


_FONT_MAP = {
    "jua": "'Jua', sans-serif",
    "gaegu": "'Gaegu', cursive",
    "noto": "'Noto Sans KR', sans-serif",
}

_FONT_WEIGHT = {"jua": "400", "gaegu": "700", "noto": "700"}


def _text_blocks_for(spec: SlideSpec) -> list[TextBlock]:
    if spec.layout == "apartment-card":
        return apartment_card_text_blocks(
            spec.headline, spec.body_lines, spec.checkpoint_lines, spec.whisper,
        )
    raise ValueError(f"layout not supported in MVP: {spec.layout}")


def _block_css(block: TextBlock) -> str:
    family = _FONT_MAP.get(block.font, _FONT_MAP["noto"])
    weight = _FONT_WEIGHT.get(block.font, "700")
    return (
        f"position:absolute; left:{block.x}px; top:{block.y}px; "
        f"width:{block.w}px; height:{block.h}px; "
        f"font-family:{family}; font-weight:{weight}; "
        f"font-size:{block.size}px; line-height:1.3; color:#1a1a1a; "
        f"white-space:pre-line;"
    )


def render_slide_html(
    *,
    spec: SlideSpec,
    template_image_path: Path,
    mascot_bbox: MarkerBBox,
    mascot_asset_path: Path,
) -> str:
    """Return a complete HTML document containing one slide."""
    blocks = _text_blocks_for(spec)
    text_html = "\n".join(
        f'<div style="{_block_css(b)}">{b.content}</div>' for b in blocks
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
.mascot {{ position:absolute; left:{mascot_bbox.x}px; top:{mascot_bbox.y}px;
  width:{mascot_bbox.w}px; height:{mascot_bbox.h}px; object-fit:contain; }}
</style>
</head>
<body>
<div class="slide" id="slide-{spec.idx}">
  <img class="mascot" src="{mascot_asset_path.name}" alt="mascot">
  {text_html}
</div>
</body>
</html>
"""
