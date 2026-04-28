import os, json, subprocess, pytest
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_cli(*args):
    return subprocess.run(
        ["python3", "-m", "lib.cli", *args],
        cwd=ROOT, capture_output=True, text=True,
    )

def test_init_creates_folder_and_spec(tmp_path, monkeypatch):
    monkeypatch.chdir(ROOT)
    slug = f"test-{date.today().isoformat()}-init"
    res = run_cli("init", slug)
    assert res.returncode == 0, res.stderr
    out_dir = os.path.join(ROOT, "output", f"{date.today().isoformat()}-{slug}")
    assert os.path.isdir(out_dir)
    assert os.path.isfile(os.path.join(out_dir, "spec.yaml"))

def test_fetch_writes_data_json(tmp_path, monkeypatch):
    monkeypatch.chdir(ROOT)
    slug = f"test-{date.today().isoformat()}-fetch"
    run_cli("init", slug)
    out_dir = os.path.join(ROOT, "output", f"{date.today().isoformat()}-{slug}")
    res = run_cli("fetch", slug)
    assert res.returncode == 0, res.stderr
    data_json = os.path.join(out_dir, "data.json")
    assert os.path.isfile(data_json)
    data = json.load(open(data_json))
    assert "live_counts" in data
