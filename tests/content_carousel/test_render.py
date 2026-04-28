from pathlib import Path

from scripts.content_carousel.render import (
    build_context,
    format_price_display,
    chunk_districts,
    render_html,
)


def test_format_price_display_full_eok():
    assert format_price_display(50000) == "5억"


def test_format_price_display_with_remainder():
    assert format_price_display(31682) == "3억 1,682만원"


def test_format_price_display_small():
    assert format_price_display(500) == "500만원"


def test_chunk_districts_splits_evenly():
    rows = [{"district": f"{i}구"} for i in range(25)]
    chunks = chunk_districts(rows, per_slide=8)
    assert len(chunks) == 4  # 8+8+8+1
    assert len(chunks[0]["rows"]) == 8
    assert chunks[-1]["header"].endswith("24구")


def test_chunk_districts_headers():
    rows = [
        {"district": "서초구"},
        {"district": "강남구"},
        {"district": "도봉구"},
    ]
    chunks = chunk_districts(rows, per_slide=2)
    assert chunks[0]["header"] == "서초구 ~ 강남구"
    assert chunks[1]["header"] == "도봉구"


def test_build_context_adds_bar_widths():
    dataset = {
        "title": "이재명 대통령 당선후 서울 실거래 변화",
        "subtitle": "",
        "periodLabel": "",
        "source": "",
        "sizeLabel": "",
        "districts": [
            {"district": "광진구", "priceBefore": 14487, "priceAfter": 16997, "changePct": 17.3},
            {"district": "강남구", "priceBefore": 26318, "priceAfter": 26915, "changePct": 2.3},
        ],
    }
    ctx = build_context(dataset, max_bar_px=100, per_slide=2)
    chunk0 = ctx["district_chunks"][0]
    row0 = chunk0["rows"][0]
    assert row0["bar_width_px"] == 100
    assert row0["priceBefore_display"] == "1억 4,487만원"
    assert row0["priceAfter_display"] == "1억 6,997만원"


def test_build_context_title_split():
    dataset = {
        "title": "이재명 대통령 당선후 서울 실거래 변화",
        "subtitle": "",
        "periodLabel": "",
        "source": "",
        "sizeLabel": "",
        "districts": [],
    }
    ctx = build_context(dataset, max_bar_px=100, per_slide=8)
    assert ctx["dataset"]["title_short"] == "이재명 대통령 당선후"
    assert ctx["dataset"]["title_rest"] == "서울 실거래 변화"


def test_render_html_uses_instagram_portrait_canvas():
    dataset = {
        "title": "이재명 대통령 당선후 서울 실거래 변화",
        "subtitle": "",
        "periodLabel": "",
        "source": "",
        "sizeLabel": "",
        "districts": [],
    }

    html = render_html(dataset, per_slide=8)

    assert "width:1080px; height:1350px;" in html
