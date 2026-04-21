"""CLI for nano_carousel V2 pipeline.

Usage:
    python -m scripts.nano_carousel --spec spec.json --out output-dir/

V2 flow:
1. Build rich text prompt (layout + brand style + negative)
2. Attach mascot-hero.png as reference image
3. Call Nano Banana 2 (gemini-3.1-flash-image-preview) with aspectRatio 3:4
4. Pillow resize to exactly 1080x1440
5. Render HTML with text overlay (no mascot overlay — AI drew it)
6. Puppeteer capture

Requires GEMINI_API_KEY in env or .env.gemini.
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image

from scripts.nano_carousel.gemini_client import generate_image, GeminiError
from scripts.nano_carousel.html_renderer import render_slide_html
from scripts.nano_carousel.prompt_builder import build_prompt
from scripts.nano_carousel.types import SlideSpec


_BRAND_ASSETS_DIR = Path(
    ".claude/skills/carousel/brands/jipsaja/assets"
).resolve()

_TARGET_SIZE = (1080, 1440)


def _load_spec(path: Path) -> SlideSpec:
    raw = json.loads(path.read_text(encoding="utf-8"))
    return SlideSpec(**raw)


def _resolve_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    env_file = Path(".env.gemini")
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip()
    raise SystemExit("GEMINI_API_KEY not found (env or .env.gemini)")


def _resolve_reference_image() -> Path:
    """Pick the reference mascot image for character consistency.

    Prefer mascot-hero.png (larger, cleaner) over the smaller pose icons,
    since Gemini reference-image binding works best with a clear canonical
    sample rather than a cropped low-res tile.
    """
    candidate = _BRAND_ASSETS_DIR / "mascot-hero.png"
    if not candidate.exists():
        raise SystemExit(f"reference mascot not found: {candidate}")
    return candidate


def _resize_to_target(path: Path) -> None:
    """Force the generated template to exactly 1080x1440.

    Nano Banana may return a 3:4 image that is not exactly 1080x1440
    (e.g. 896x1200). We resize to match the HTML canvas.
    """
    im = Image.open(path)
    if im.size != _TARGET_SIZE:
        im = im.convert("RGB").resize(_TARGET_SIZE, Image.LANCZOS)
        im.save(path, "PNG")


def _write_capture_mjs(out_dir: Path) -> Path:
    mjs = out_dir / "capture.mjs"
    mjs.write_text("""import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });
await page.goto(`file://${resolve(__dirname, 'slides.html')}`, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
const n = await page.$$eval('[id^="slide-"]', els => els.length);
for (let i = 1; i <= n; i++) {
  const el = await page.$(`#slide-${i}`);
  await el.screenshot({ path: resolve(__dirname, `slide-${i}.png`), type: 'png' });
  console.log(`slide-${i}.png`);
}
await browser.close();
""")
    return mjs


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="nano_carousel")
    p.add_argument("--spec", required=True, type=Path)
    p.add_argument("--out", required=True, type=Path)
    p.add_argument(
        "--model", default="gemini-3.1-flash-image-preview",
        help="Gemini image model id (Nano Banana 2 is preview)",
    )
    p.add_argument(
        "--aspect-ratio", default="3:4",
        help="Aspect ratio hint passed to generationConfig.imageConfig",
    )
    p.add_argument("--skip-capture", action="store_true",
                   help="render HTML only, skip Puppeteer")
    args = p.parse_args(argv)

    spec = _load_spec(args.spec)
    args.out.mkdir(parents=True, exist_ok=True)

    # Stage 1: build prompt
    prompt = build_prompt(spec)
    (args.out / "prompt.txt").write_text(prompt, encoding="utf-8")
    print(f"[1/4] prompt built ({len(prompt)} chars)")

    # Stage 2: generate template with reference image
    reference = _resolve_reference_image()
    template_path = args.out / "template.png"
    try:
        generate_image(
            prompt=prompt,
            api_key=_resolve_api_key(),
            out_path=template_path,
            model=args.model,
            reference_image_paths=[reference],
            aspect_ratio=args.aspect_ratio,
        )
    except GeminiError as e:
        print(f"[FAIL] image generation: {e}")
        return 1
    _resize_to_target(template_path)
    print(f"[2/4] template generated + resized to 1080x1440: {template_path}")

    # Stage 3: render HTML with text overlay
    html = render_slide_html(spec=spec, template_image_path=template_path)
    html_path = args.out / "slides.html"
    html_path.write_text(html, encoding="utf-8")
    print(f"[3/4] html rendered: {html_path}")

    # Stage 4: Puppeteer capture
    if args.skip_capture:
        print("[4/4] capture skipped")
        return 0

    _write_capture_mjs(args.out)
    npm_ok = (args.out / "node_modules" / "puppeteer").exists()
    if not npm_ok:
        print("[4/4] puppeteer not installed in out dir. "
              "Run once:  cd <out> && npm init -y && npm install puppeteer")
        return 0
    subprocess.run(["node", "capture.mjs"], cwd=args.out, check=True)
    print(f"[4/4] PNG captured → {args.out}/slide-{spec.idx}.png")
    return 0


if __name__ == "__main__":
    sys.exit(main())
