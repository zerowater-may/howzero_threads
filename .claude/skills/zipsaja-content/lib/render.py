"""Spec.yaml → rendered HTML files. Auto-injects footer from live counts."""
import os, yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape
from lib.footer import build_footer_text
from lib.tone import check_tone

SKILL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMPONENTS_DIR = os.path.join(SKILL_ROOT, "components")
TOKENS_CSS = os.path.relpath(
    "/Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/zipsaja-design/colors_and_type.css",
    start=os.path.join(SKILL_ROOT, "output"),
)
MASCOTS_DIR = "/Users/zerowater/Dropbox/zerowater/howzero/.claude/skills/zipsaja-design/assets/mascots"


def render_carousel(spec_path: str, out_dir: str) -> list[str]:
    """Render slides from spec.yaml, write to out_dir/slides/. Returns list of HTML paths."""
    spec = yaml.safe_load(open(spec_path))
    slides = spec["slides"]
    total = len(slides)

    env = Environment(
        loader=FileSystemLoader(COMPONENTS_DIR),
        autoescape=select_autoescape(["html", "j2"]),
    )

    footer = build_footer_text()
    slides_dir = os.path.join(out_dir, "slides")
    os.makedirs(slides_dir, exist_ok=True)
    written = []

    for i, slide in enumerate(slides, start=1):
        kind = slide["type"]
        for f in ("headline", "sub", "title", "msg"):
            if slide.get(f):
                vs = check_tone(slide[f])
                if vs:
                    raise ValueError(f"slide {i} field '{f}' tone violations: {vs}")

        tpl = env.get_template(f"{kind}.j2")
        ctx = {
            **slide,
            "num": i,
            "total": total,
            "footer_text": footer,
            "tokens_css": TOKENS_CSS,
            "title": f"{spec['slug']} {i:02d}",
            "screen_label": f"{i:02d} {kind}",
        }
        if "mascot" in slide:
            ctx["mascot_path"] = os.path.join(MASCOTS_DIR, f"mascot-{slide['mascot']}.png")

        html = tpl.render(**ctx)
        out_path = os.path.join(slides_dir, f"{i:02d}-{kind}.html")
        with open(out_path, "w") as f:
            f.write(html)
        written.append(out_path)
    return written
