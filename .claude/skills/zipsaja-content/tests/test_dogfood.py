"""Dogfood acceptance — verify the spec.acceptance criteria are all met."""
import os, glob
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SLUG = "seoul-10y"

def _folder():
    return os.path.join(ROOT, "output", f"{date.today().isoformat()}-{SLUG}")

def test_dogfood_slides_built():
    htmls = glob.glob(os.path.join(_folder(), "slides", "*.html"))
    assert len(htmls) >= 7

def test_dogfood_pngs_built():
    pngs = glob.glob(os.path.join(_folder(), "exports", "*.png"))
    assert len(pngs) >= 7
    for p in pngs:
        assert os.path.getsize(p) > 10000

def test_dogfood_footer_in_every_slide():
    for h in glob.glob(os.path.join(_folder(), "slides", "*.html")):
        text = open(h).read()
        assert "@zipsaja" in text
        assert "300세대+" in text
