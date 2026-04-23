"""zipsaja-content CLI — init / fetch / render / export / build."""
import argparse, json, os, sys, yaml
from datetime import date

SKILL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_ROOT = os.path.join(SKILL_ROOT, "output")

SPEC_TEMPLATE = """\
slug: {slug}
topic: "(설명)"
mascot_default: hero
data_queries:
  - name: live_counts
    sql: live-counts
slides:
  - type: cover
    headline: "(hook 한 줄)"
    sub: "(부 hook)"
    mascot: hero
"""


def cmd_init(slug: str) -> int:
    folder = os.path.join(OUTPUT_ROOT, f"{date.today().isoformat()}-{slug}")
    os.makedirs(folder, exist_ok=True)
    spec_path = os.path.join(folder, "spec.yaml")
    if not os.path.exists(spec_path):
        with open(spec_path, "w") as f:
            f.write(SPEC_TEMPLATE.format(slug=slug))
    print(f"created {folder}")
    return 0


def cmd_fetch(slug: str) -> int:
    from lib.db import query
    from lib.sql_loader import load
    folder = _find_folder(slug)
    spec = yaml.safe_load(open(os.path.join(folder, "spec.yaml")))
    data = {"live_counts": query(load("live-counts"))[0]}
    for q in spec.get("data_queries", []):
        if q["name"] == "live_counts":
            continue
        data[q["name"]] = query(load(q["sql"], **q.get("params", {})))
    with open(os.path.join(folder, "data.json"), "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)
    print(f"wrote {folder}/data.json")
    return 0


def cmd_render(slug: str) -> int:
    from lib.render import render_carousel
    folder = _find_folder(slug)
    paths = render_carousel(os.path.join(folder, "spec.yaml"), folder)
    print(f"rendered {len(paths)} slides")
    return 0


def cmd_export(slug: str) -> int:
    import subprocess
    folder = _find_folder(slug)
    res = subprocess.run(
        ["node", os.path.join(SKILL_ROOT, "lib/export_png.js"), folder],
        capture_output=True, text=True,
    )
    print(res.stdout)
    if res.returncode != 0:
        print(res.stderr, file=sys.stderr)
    return res.returncode


def cmd_build(slug: str) -> int:
    for fn in (cmd_fetch, cmd_render, cmd_export):
        rc = fn(slug)
        if rc != 0:
            return rc
    return 0


def _find_folder(slug: str) -> str:
    matches = [f for f in os.listdir(OUTPUT_ROOT) if f.endswith(slug)]
    if not matches:
        raise FileNotFoundError(f"no output folder for slug={slug}")
    return os.path.join(OUTPUT_ROOT, sorted(matches)[-1])


def main(argv=None):
    p = argparse.ArgumentParser(prog="zipsaja-content")
    sub = p.add_subparsers(dest="cmd", required=True)
    for name in ("init", "fetch", "render", "export", "build"):
        sp = sub.add_parser(name)
        sp.add_argument("slug")
    args = p.parse_args(argv)
    fn = {"init": cmd_init, "fetch": cmd_fetch, "render": cmd_render,
          "export": cmd_export, "build": cmd_build}[args.cmd]
    sys.exit(fn(args.slug))


if __name__ == "__main__":
    main()
