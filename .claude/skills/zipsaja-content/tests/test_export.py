import os, subprocess, time
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def test_export_png_creates_files(tmp_path):
    slug = f"export-test-{int(time.time())}"
    subprocess.run(["python3", "-m", "lib.cli", "init", slug], cwd=ROOT, check=True)
    folder = os.path.join(ROOT, "output", f"{date.today().isoformat()}-{slug}")
    spec_path = os.path.join(folder, "spec.yaml")
    with open(spec_path, "w") as f:
        f.write("""slug: test
slides:
  - type: cover
    headline: "test export"
    sub: "ok"
""")
    subprocess.run(["python3", "-m", "lib.cli", "render", slug], cwd=ROOT, check=True)
    rc = subprocess.run(["python3", "-m", "lib.cli", "export", slug], cwd=ROOT).returncode
    assert rc == 0
    pngs = [f for f in os.listdir(os.path.join(folder, "exports")) if f.endswith(".png")]
    assert len(pngs) == 1
