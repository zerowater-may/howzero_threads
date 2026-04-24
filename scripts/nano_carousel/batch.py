"""Batch runner for nano_carousel pipeline.

Takes a specs.json array and produces per-slide templates + a merged
slides.html (Nano Banana generated slides only; HTML-only slides should
be inserted manually later in a unified slides.html).

Usage:
    python -m scripts.nano_carousel.batch \
        --specs docs/content/<dir>/specs.json \
        --out docs/content/<dir>/

specs.json format:
    [
      {"idx": 1, "layout": "cover", "mascot_pose": "hero",
       "headline": "...", "body_lines": [...],
       "checkpoint_lines": [...], "whisper": "..."},
      ...
    ]
"""

import argparse
import json
import sys
from pathlib import Path

from PIL import Image

from scripts.nano_carousel.gemini_client import generate_image, GeminiError
from scripts.nano_carousel.html_renderer import render_slide_html
from scripts.nano_carousel.marker_detector import detect_regions
from scripts.nano_carousel.prompt_builder import build_prompt
from scripts.nano_carousel.types import SlideSpec
from scripts.nano_carousel.__main__ import (
    _BRAND_ASSETS_DIR,
    _TARGET_SIZE,
    _resolve_api_key,
    _resolve_reference_image,
    _resize_to_target,
)


def _merged_slides_html(
    specs: list[SlideSpec],
    template_paths: dict[int, Path],
) -> str:
    """Build a single slides.html with one div.slide per spec."""
    font_link = (
        '<link href="https://fonts.googleapis.com/css2?'
        'family=Jua&family=Gaegu:wght@400;700&'
        'family=Noto+Sans+KR:wght@400;700;900&display=swap" '
        'rel="stylesheet">'
    )
    head = f"""<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8">{font_link}
<style>
* {{margin:0; padding:0; box-sizing:border-box;}}
body {{background:#ddd; padding:40px 0;
  display:flex; flex-direction:column; align-items:center; gap:40px;}}
.slide {{width:1080px; height:1440px; position:relative; overflow:hidden;
  background-size: 1080px 1440px; background-repeat: no-repeat;}}
</style></head><body>"""

    from scripts.nano_carousel.html_renderer import (
        _apply_detected_regions, _apply_overrides, _block_css,
        _text_blocks_for, _text_color_for,
    )

    body_parts: list[str] = []
    for spec in specs:
        tpath = template_paths[spec.idx]
        # Dynamic coordinates from the actual template
        try:
            regions = detect_regions(tpath, spec.layout)
        except Exception as e:
            print(f"  [warn] detect_regions failed for slide {spec.idx}: {e}")
            regions = {}
        blocks = _text_blocks_for(spec)
        if regions:
            blocks = _apply_detected_regions(blocks, regions)
        # Manual pixel-perfect tuning wins over auto detection
        blocks = _apply_overrides(blocks, spec.overrides)
        color = _text_color_for(spec)
        text_html = "\n".join(
            f'<div style="{_block_css(b, color)}">{b.content}</div>'
            for b in blocks
        )
        body_parts.append(
            f'<div class="slide" id="slide-{spec.idx}" '
            f'style="background-image:url(\'{tpath.name}\');">\n'
            f'  {text_html}\n</div>'
        )

    return head + "\n".join(body_parts) + "\n</body></html>"


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="nano_carousel.batch")
    p.add_argument("--specs", required=True, type=Path,
                   help="JSON array of SlideSpec objects")
    p.add_argument("--out", required=True, type=Path)
    p.add_argument("--model", default="gemini-3.1-flash-image-preview")
    p.add_argument("--aspect-ratio", default="3:4")
    p.add_argument("--only", type=int, nargs="+",
                   help="Only render specs with these idx values (pilot mode)")
    p.add_argument("--skip-existing", action="store_true",
                   help="Skip slides whose template_N.png already exists")
    args = p.parse_args(argv)

    raw = json.loads(args.specs.read_text(encoding="utf-8"))
    specs = [SlideSpec(**s) for s in raw]
    if args.only:
        specs = [s for s in specs if s.idx in set(args.only)]

    args.out.mkdir(parents=True, exist_ok=True)
    api_key = _resolve_api_key()
    reference = _resolve_reference_image()

    template_paths: dict[int, Path] = {}
    for spec in specs:
        tpath = args.out / f"template_{spec.idx:02d}.png"
        template_paths[spec.idx] = tpath

        if args.skip_existing and tpath.exists():
            print(f"[skip] template_{spec.idx:02d}.png exists")
            continue

        prompt = build_prompt(spec)
        print(f"[{spec.idx:02d}] {spec.layout} · prompt {len(prompt)} chars")
        try:
            generate_image(
                prompt=prompt, api_key=api_key, out_path=tpath,
                model=args.model,
                reference_image_paths=[reference],
                aspect_ratio=args.aspect_ratio,
            )
        except GeminiError as e:
            print(f"  [FAIL] {e}")
            return 1
        _resize_to_target(tpath)
        print(f"  → saved {tpath.name}")

    # Merged HTML (only specs that were requested; HTML-only slides are
    # merged separately by the caller if needed)
    if specs:
        merged = _merged_slides_html(specs, template_paths)
        merged_path = args.out / "nano_slides.html"
        merged_path.write_text(merged, encoding="utf-8")
        print(f"\nnano_slides.html written: {merged_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
