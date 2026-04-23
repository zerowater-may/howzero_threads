import os
from lib.geo.projector import project_seoul

GEOJSON = os.path.join(os.path.dirname(__file__), "..", "lib", "geo", "seoul.geojson")

def test_project_returns_25_paths():
    res = project_seoul(GEOJSON, viewbox_w=1000)
    assert len(res["paths"]) == 25
    assert "강남구" in res["paths"]
    assert "도봉구" in res["paths"]

def test_aspect_corrected():
    res = project_seoul(GEOJSON, viewbox_w=1000)
    vb = res["viewbox"].split()
    h = float(vb[3])
    assert 800 < h < 900

def test_centroids_inside_viewbox():
    res = project_seoul(GEOJSON, viewbox_w=1000)
    h = float(res["viewbox"].split()[3])
    for gu, (cx, cy) in res["centroids"].items():
        assert 0 <= cx <= 1000
        assert 0 <= cy <= h

def test_paths_start_with_M():
    res = project_seoul(GEOJSON, viewbox_w=1000)
    for d in res["paths"].values():
        assert d.startswith("M")
        assert d.rstrip().endswith("Z")
