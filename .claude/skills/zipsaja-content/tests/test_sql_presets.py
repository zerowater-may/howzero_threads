import pytest
from lib.sql_loader import load
from lib.db import query

def test_load_live_counts_returns_sql():
    sql = load("live-counts")
    assert "complexes" in sql.lower()

def test_load_with_params_substitutes():
    sql = load("price-by-gu", pyeong_min=56, pyeong_max=63)
    assert "BETWEEN 56 AND 63" in sql

def test_load_rejects_unsafe_param():
    with pytest.raises(ValueError):
        load("price-by-gu", pyeong_min="56; DROP TABLE", pyeong_max=63)

def test_live_counts_returns_one_row():
    rows = query(load("live-counts"))
    assert len(rows) == 1
    assert int(rows[0]["complexes"]) > 1000
    assert int(rows[0]["min_units"]) >= 300

def test_price_by_gu_returns_25ish_rows():
    rows = query(load("price-by-gu", pyeong_min=56, pyeong_max=63))
    assert 20 <= len(rows) <= 26

def test_price_history_10y():
    rows = query(load("price-history-Ny", years_ago=10, pyeong_min=56, pyeong_max=63))
    assert len(rows) >= 20
    assert all(float(r["multiple"]) > 0 for r in rows)
