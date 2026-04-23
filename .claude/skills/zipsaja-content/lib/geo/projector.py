"""GeoJSON → SVG path strings with cosine-corrected projection."""
import json, math


def project_seoul(geojson_path: str, viewbox_w: int = 1000) -> dict:
    """Return {viewbox, paths{name: d}, centroids{name: (cx, cy)}}."""
    data = json.load(open(geojson_path))

    xs, ys = [], []
    def walk(coords):
        for c in coords:
            if isinstance(c[0], (int, float)):
                xs.append(c[0]); ys.append(c[1])
            else:
                walk(c)
    for f in data["features"]:
        walk(f["geometry"]["coordinates"])

    minx, maxx = min(xs), max(xs)
    miny, maxy = min(ys), max(ys)
    mid_lat = (miny + maxy) / 2
    cos_corr = math.cos(math.radians(mid_lat))
    aspect = ((maxx - minx) * cos_corr) / (maxy - miny)
    H = round(viewbox_w / aspect)

    def project(lon, lat):
        x = (lon - minx) / (maxx - minx) * viewbox_w
        y = (maxy - lat) / (maxy - miny) * H
        return x, y

    def ring_to_d(ring):
        pts = [project(lo, la) for lo, la in ring]
        return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"

    def coords_to_path(coords):
        return " ".join(ring_to_d(r) for r in coords)

    paths, centroids = {}, {}
    for f in data["features"]:
        name = f["properties"]["name"]
        geom = f["geometry"]
        if geom["type"] == "Polygon":
            paths[name] = coords_to_path(geom["coordinates"])
            ring = geom["coordinates"][0]
        else:
            paths[name] = " ".join(coords_to_path(p) for p in geom["coordinates"])
            ring = max(geom["coordinates"], key=lambda p: len(p[0]))[0]
        ps = [project(lo, la) for lo, la in ring]
        cx = sum(x for x, _ in ps) / len(ps)
        cy = sum(y for _, y in ps) / len(ps)
        centroids[name] = (round(cx, 1), round(cy, 1))

    return {
        "viewbox": f"0 0 {viewbox_w} {H}",
        "paths": paths,
        "centroids": centroids,
    }
