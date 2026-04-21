"""CLI for nano_carousel MVP.

Usage:
    python -m scripts.nano_carousel --spec spec.json --out output-dir/

Requires GEMINI_API_KEY in env (load via .env.gemini).
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

from scripts.nano_carousel.gemini_client import generate_image, GeminiError
from scripts.nano_carousel.html_renderer import render_slide_html
from scripts.nano_carousel.marker_detector import detect_green_marker
from scripts.nano_carousel.prompt_builder import build_prompt
from scripts.nano_carousel.types import MarkerBBox, SlideSpec


_BRAND_ASSETS_DIR = Path(
    ".claude/skills/carousel/brands/jipsaja-assets"
).resolve()


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


def _copy_mascot(pose: str, out_dir: Path) -> Path:
    src = _BRAND_ASSETS_DIR / f"mascot-{pose}.png"
    if not src.exists():
        raise SystemExit(f"mascot asset not found: {src}")
    dst = out_dir / src.name
    shutil.copy(src, dst)
    return dst


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


def _default_mascot_bbox_for(layout: str) -> MarkerBBox:
    if layout == "apartment-card":
        return MarkerBBox(x=100, y=1200, w=180, h=180, cx=190, cy=1290)
    return MarkerBBox(x=420, y=620, w=240, h=240, cx=540, cy=740)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="nano_carousel")
    p.add_argument("--spec", required=True, type=Path)
    p.add_argument("--out", required=True, type=Path)
    p.add_argument(
        "--model", default="gemini-2.5-flash-image",
        help="Gemini image model id",
    )
    p.add_argument("--skip-capture", action="store_true",
                   help="render HTML only, skip Puppeteer")
    args = p.parse_args(argv)

    spec = _load_spec(args.spec)
    args.out.mkdir(parents=True, exist_ok=True)

    # Stage 1: build prompt
    prompt = build_prompt(spec)
    (args.out / "prompt.txt").write_text(prompt, encoding="utf-8")
    print(f"[1/5] prompt built ({len(prompt)} chars)")

    # Stage 2: generate template image
    template_path = args.out / "template.png"
    try:
        generate_image(
            prompt=prompt, api_key=_resolve_api_key(),
            out_path=template_path, model=args.model,
        )
    except GeminiError as e:
        print(f"[FAIL] image generation: {e}")
        return 1
    print(f"[2/5] template generated: {template_path}")

    # Stage 3: detect green marker
    bbox = detect_green_marker(template_path)
    if bbox is None:
        print("[WARN] no green marker detected — using default position")
        bbox = _default_mascot_bbox_for(spec.layout)
    (args.out / "markers.json").write_text(
        json.dumps({"mascot": bbox.__dict__}, indent=2),
        encoding="utf-8",
    )
    print(f"[3/5] mascot bbox: x={bbox.x} y={bbox.y} w={bbox.w} h={bbox.h}")

    # Stage 4: copy mascot asset + render HTML
    mascot_path = _copy_mascot(spec.mascot_pose, args.out)
    html = render_slide_html(
        spec=spec,
        template_image_path=template_path,
        mascot_bbox=bbox,
        mascot_asset_path=mascot_path,
    )
    html_path = args.out / "slides.html"
    html_path.write_text(html, encoding="utf-8")
    print(f"[4/5] html rendered: {html_path}")

    # Stage 5: Puppeteer capture
    if args.skip_capture:
        print("[5/5] capture skipped")
        return 0

    _write_capture_mjs(args.out)
    npm_ok = (args.out / "node_modules" / "puppeteer").exists()
    if not npm_ok:
        print("[5/5] puppeteer not installed in out dir. "
              "Run once:  cd <out> && npm init -y && npm install puppeteer")
        return 0
    subprocess.run(["node", "capture.mjs"], cwd=args.out, check=True)
    print(f"[5/5] PNG captured → {args.out}/slide-1.png")
    return 0


if __name__ == "__main__":
    sys.exit(main())
