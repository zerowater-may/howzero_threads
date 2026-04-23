from scripts.zipsaja_seoul_prices.__main__ import compute_change_pct, to_dataset_dict


def test_compute_change_pct_positive():
    assert compute_change_pct(100_000, 120_000) == 20.0


def test_compute_change_pct_negative():
    assert compute_change_pct(100_000, 80_000) == -20.0


def test_compute_change_pct_zero_base_returns_zero():
    assert compute_change_pct(0, 10_000) == 0.0


def test_to_dataset_dict_rounds_to_one_decimal():
    rows = [("서초구", 226798, 235528)]
    ds = to_dataset_dict(rows, period="25 vs 26", size="24평대", source="국토부")
    assert ds["districts"][0]["changePct"] == 3.8
    assert ds["periodLabel"] == "25 vs 26"
    assert len(ds["districts"]) == 1
