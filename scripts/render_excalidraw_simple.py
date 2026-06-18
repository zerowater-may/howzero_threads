"""Minimal Excalidraw → PNG renderer (rectangle/ellipse/line/text only, roughness 0)."""
from __future__ import annotations
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

KOREAN_FONT_CANDIDATES = [
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    "/System/Library/Fonts/Supplemental/AppleSDGothicNeo.ttc",
    "/Library/Fonts/AppleSDGothicNeo.ttc",
]

def get_font(size: int):
    for path in KOREAN_FONT_CANDIDATES:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()

def render(in_path: str, out_path: str | None = None, scale: float = 1.0) -> str:
    data = json.loads(Path(in_path).read_text())
    els = data["elements"]

    pad = 60
    maxx = max(e.get("x", 0) + e.get("width", 0) for e in els) + pad
    maxy = max(e.get("y", 0) + e.get("height", 0) for e in els) + pad
    W, H = int(maxx * scale), int(maxy * scale)

    bg = data.get("appState", {}).get("viewBackgroundColor", "#ffffff")
    img = Image.new("RGB", (W, H), bg)
    draw = ImageDraw.Draw(img, "RGBA")

    def s(v): return int(v * scale)

    def color(c):
        if not c or c == "transparent":
            return None
        return c

    for e in els:
        t = e.get("type")
        x, y, w, h = s(e.get("x", 0)), s(e.get("y", 0)), s(e.get("width", 0)), s(e.get("height", 0))
        sc = color(e.get("strokeColor")) or "#1e1e1e"
        sw = max(1, int(e.get("strokeWidth", 1) * scale))
        opacity = int(e.get("opacity", 100))
        bgc = color(e.get("backgroundColor"))

        def with_op(c):
            if c is None: return None
            if opacity >= 100: return c
            if c.startswith("#"):
                r, g, b = int(c[1:3],16), int(c[3:5],16), int(c[5:7],16)
                return (r, g, b, int(255 * opacity/100))
            return c

        if t == "rectangle":
            r = e.get("roundness", {}).get("type") if isinstance(e.get("roundness"), dict) else None
            radius = 12 if r else 0
            if bgc:
                if radius:
                    draw.rounded_rectangle([x, y, x+w, y+h], radius=radius, fill=with_op(bgc), outline=sc if sc else None, width=sw)
                else:
                    draw.rectangle([x, y, x+w, y+h], fill=with_op(bgc), outline=sc, width=sw)
            else:
                if radius:
                    draw.rounded_rectangle([x, y, x+w, y+h], radius=radius, outline=sc, width=sw)
                else:
                    draw.rectangle([x, y, x+w, y+h], outline=sc, width=sw)
        elif t == "ellipse":
            if bgc:
                draw.ellipse([x, y, x+w, y+h], fill=with_op(bgc), outline=sc, width=sw)
            else:
                draw.ellipse([x, y, x+w, y+h], outline=sc, width=sw)
        elif t == "diamond":
            cx, cy = x + w/2, y + h/2
            pts = [(cx, y), (x+w, cy), (cx, y+h), (x, cy)]
            if bgc:
                draw.polygon(pts, fill=with_op(bgc), outline=sc)
            else:
                draw.polygon(pts, outline=sc)
        elif t == "line" or t == "arrow":
            pts = e.get("points", [[0,0]])
            poly = [(x + s(p[0])/scale*scale, y + s(p[1])/scale*scale) for p in pts]
            # Simpler: use absolute
            poly = [(x + int(p[0]*scale), y + int(p[1]*scale)) for p in pts]
            if len(poly) >= 2:
                for i in range(len(poly)-1):
                    draw.line([poly[i], poly[i+1]], fill=sc, width=sw)
                if t == "arrow" and e.get("endArrowhead") == "arrow":
                    p1, p2 = poly[-2], poly[-1]
                    import math
                    ang = math.atan2(p2[1]-p1[1], p2[0]-p1[0])
                    al = 10
                    draw.line([p2, (p2[0]-al*math.cos(ang-0.5), p2[1]-al*math.sin(ang-0.5))], fill=sc, width=sw)
                    draw.line([p2, (p2[0]-al*math.cos(ang+0.5), p2[1]-al*math.sin(ang+0.5))], fill=sc, width=sw)
        elif t == "text":
            fs = max(8, int(e.get("fontSize", 14) * scale))
            font = get_font(fs)
            text = e.get("text", "")
            align = e.get("textAlign", "left")
            lines = text.split("\n")
            line_h = int(fs * 1.25)
            for i, ln in enumerate(lines):
                ty = y + i * line_h
                if align == "center" and w > 0:
                    bbox = draw.textbbox((0,0), ln, font=font)
                    tw = bbox[2] - bbox[0]
                    tx = x + (w - tw) / 2
                else:
                    tx = x
                draw.text((tx, ty), ln, fill=sc, font=font)

    out = out_path or Path(in_path).with_suffix(".png").as_posix()
    img.save(out)
    return out

if __name__ == "__main__":
    in_path = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else None
    scale = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    p = render(in_path, out, scale)
    print(f"saved: {p}")
