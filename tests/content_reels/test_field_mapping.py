from pathlib import Path

from scripts.content_reels.render import (
    REEL_DURATION_SECONDS,
    REEL_OUTPUT_NAME,
    map_to_remotion_schema,
)


def test_maps_price_before_after_to_last_this_year():
    src = {
        "generatedAt": "2026-04-24T00:00:00+09:00",
        "title": "이재명 대통령 당선후 서울 실거래 변화",
        "subtitle": "취임 전 12개월 vs 취임 후",
        "periodLabel": "2024.6 ~ 2025.6 vs 2025.6 ~ 현재",
        "source": "국토부 실거래가 (매매)",
        "sizeLabel": "300세대 이상 · 평형 무관",
        "districts": [
            {"district": "광진구", "priceBefore": 14487, "priceAfter": 16997, "changePct": 17.3},
        ],
    }
    mapped = map_to_remotion_schema(src)
    assert "sizeLabel" in mapped
    assert mapped["sizeLabel"] == "300세대 이상 · 평형 무관"
    d = mapped["districts"][0]
    assert d["priceLastYear"] == 14487
    assert d["priceThisYear"] == 16997
    assert d["changePct"] == 17.3
    assert d["district"] == "광진구"
    assert "priceBefore" not in d
    assert "priceAfter" not in d


def test_map_preserves_generated_at_and_source():
    src = {
        "generatedAt": "2026-04-24T00:00:00+09:00",
        "title": "",
        "subtitle": "",
        "periodLabel": "label",
        "source": "src",
        "sizeLabel": "",
        "districts": [],
    }
    mapped = map_to_remotion_schema(src)
    assert mapped["generatedAt"] == "2026-04-24T00:00:00+09:00"
    assert mapped["source"] == "src"
    assert mapped["periodLabel"] == "label"


def test_reels_standard_output_is_30_seconds():
    assert REEL_DURATION_SECONDS == 30
    assert REEL_OUTPUT_NAME == "zipsaja-reel-30s.mp4"


def test_seoul_price_reel_composition_duration_is_30_seconds():
    source = Path(".claude/skills/carousel/brands/zipsaja/reels/src/SeoulPriceReel.tsx").read_text(
        encoding="utf-8",
    )

    assert "export const SEOUL_PRICE_TOTAL_FRAMES = FPS * 30" in source
