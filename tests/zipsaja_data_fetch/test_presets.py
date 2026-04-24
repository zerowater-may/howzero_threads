from datetime import date

import pytest

from scripts.zipsaja_data_fetch.presets import (
    PRESETS,
    Preset,
    extract_params,
    get_preset,
)


def test_leejaemyung_preset_exists():
    preset = get_preset("leejaemyung-before-after")
    assert isinstance(preset, Preset)
    assert preset.name == "leejaemyung-before-after"


def test_leejaemyung_preset_default_params():
    preset = get_preset("leejaemyung-before-after")
    params = preset.default_params
    assert params["pivot_date"] == date(2025, 6, 4)
    assert params["min_total_units"] == 300


def test_leejaemyung_sql_loads_from_file():
    preset = get_preset("leejaemyung-before-after")
    sql = preset.sql_template
    assert "real_prices" in sql
    assert "complexes" in sql
    assert ":pivot_date" in sql
    assert ":min_total_units" in sql
    assert sql.count("구'") >= 25


def test_unknown_preset_raises():
    with pytest.raises(KeyError, match="unknown preset"):
        get_preset("nope-preset")


def test_presets_registry_lists_all():
    assert "leejaemyung-before-after" in PRESETS
    assert len(PRESETS) == 1


def test_extract_params_override_pivot_date():
    preset = get_preset("leejaemyung-before-after")
    params = extract_params(preset, user_overrides={"pivot_date": "2024-01-01"})
    assert params["pivot_date"] == date(2024, 1, 1)
    assert params["min_total_units"] == 300


def test_extract_params_override_min_units():
    preset = get_preset("leejaemyung-before-after")
    params = extract_params(preset, user_overrides={"min_total_units": 500})
    assert params["min_total_units"] == 500
    assert params["pivot_date"] == date(2025, 6, 4)


def test_extract_params_rejects_unknown_override():
    preset = get_preset("leejaemyung-before-after")
    with pytest.raises(ValueError, match="unknown parameter"):
        extract_params(preset, user_overrides={"bogus_key": "x"})
