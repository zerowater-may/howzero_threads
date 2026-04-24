from pathlib import Path

import pytest

from scripts.content_attachments.pdf import compute_insights, write_pdf


def test_compute_insights_top_and_bottom():
    districts = [
        {"district": "광진구", "changePct": 17.3},
        {"district": "종로구", "changePct": -6.9},
        {"district": "강남구", "changePct": 2.3},
    ]
    ins = compute_insights(districts)
    assert ins["top_gu"] == "광진구"
    assert ins["top_pct"] == 17.3
    assert ins["bottom_gu"] == "종로구"
    assert ins["bottom_pct"] == -6.9
    assert round(ins["avg_pct"], 1) == 4.2


def test_write_pdf_produces_nonempty_file(tmp_path: Path):
    """Live test — actually invokes Puppeteer. Skip if node/puppeteer unavailable."""
    import shutil
    if not shutil.which("node"):
        pytest.skip("node not installed")

    dataset = {
        "title": "이재명 대통령 당선후 서울 실거래 변화",
        "periodLabel": "2024.6 ~ 2025.6 vs 2025.6 ~ 현재",
        "source": "국토부",
        "generatedAt": "2026-04-24T00:00:00+09:00",
        "districts": [
            {"district": "광진구", "priceBefore": 14487, "priceAfter": 16997, "changePct": 17.3},
            {"district": "강남구", "priceBefore": 26318, "priceAfter": 26915, "changePct": 2.3},
        ],
    }
    out = tmp_path / "out.pdf"
    write_pdf(dataset, out)
    assert out.exists()
    assert out.stat().st_size > 1000
    assert out.read_bytes()[:4] == b"%PDF"
