import json
import subprocess
from pathlib import Path

from scripts.content_carousel import __main__ as content_carousel_cli


def test_capture_receives_absolute_paths(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    data_path = Path("data.json")
    data_path.write_text(
        json.dumps(
            {
                "title": "강남만 빼고 서울 집값 다 올랐다",
                "subtitle": "",
                "periodLabel": "",
                "source": "",
                "sizeLabel": "",
                "districts": [],
            }
        ),
        encoding="utf-8",
    )
    calls = []

    def fake_run(cmd, **kwargs):
        calls.append(cmd)
        return subprocess.CompletedProcess(cmd, 0)

    monkeypatch.setattr(content_carousel_cli.subprocess, "run", fake_run)

    rc = content_carousel_cli.main(["--data", str(data_path), "--out", "carousel"])

    assert rc == 0
    assert Path(calls[0][2]).is_absolute()
    assert Path(calls[0][3]).is_absolute()
