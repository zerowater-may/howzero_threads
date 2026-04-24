from scripts.zipsaja_data_fetch.fetch import (
    SEOUL_DISTRICTS_ORDER,
    compute_change_pct,
    rows_to_dataset,
)


def test_compute_change_pct_positive():
    assert compute_change_pct(100_000_000, 117_300_000) == 17.3


def test_compute_change_pct_negative():
    assert compute_change_pct(1_000_000_000, 931_000_000) == -6.9


def test_compute_change_pct_zero_base_returns_zero():
    assert compute_change_pct(0, 1_000_000) == 0.0


def test_rows_to_dataset_full_shape():
    rows = [
        ("광진구", 144_870_974_200, 169_973_622_400, 1242, 784),
        ("서초구", 316_824_955_600, 326_003_732_900, 2817, 951),
    ]
    dataset = rows_to_dataset(
        rows,
        title="이재명 대통령 당선후 서울 실거래 변화",
        subtitle="취임 전 12개월 vs 취임 후 ~ 현재",
        period_label="2024.6 ~ 2025.6 vs 2025.6 ~ 현재",
        source="국토부 실거래가 (매매)",
    )
    assert dataset["title"] == "이재명 대통령 당선후 서울 실거래 변화"
    assert len(dataset["districts"]) == 2
    assert dataset["districts"][0]["district"] == "서초구"
    assert dataset["districts"][1]["district"] == "광진구"
    assert dataset["districts"][0]["priceBefore"] == 31_682_495
    assert dataset["districts"][1]["priceAfter"] == 16_997_362
    assert dataset["districts"][1]["changePct"] == 17.3


def test_rows_to_dataset_empty_district_dropped():
    rows = [
        ("서초구", 100_000_000, 110_000_000, 10, 15),
        ("임의구", 200_000_000, 220_000_000, 20, 25),
    ]
    dataset = rows_to_dataset(
        rows, title="", subtitle="", period_label="", source=""
    )
    assert len(dataset["districts"]) == 1
    assert dataset["districts"][0]["district"] == "서초구"


def test_seoul_districts_order_has_25():
    assert len(SEOUL_DISTRICTS_ORDER) == 25
    assert "서초구" in SEOUL_DISTRICTS_ORDER
    assert "도봉구" in SEOUL_DISTRICTS_ORDER
