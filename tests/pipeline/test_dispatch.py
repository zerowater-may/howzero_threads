import pytest

from scripts.pipeline.dispatch import (
    SUPPORTED_BRANDS,
    brand_needs_data_fetch,
    validate_brand,
)


def test_supported_brands_exact():
    assert SUPPORTED_BRANDS == ("zipsaja", "howzero", "braveyong")


def test_validate_brand_passes_for_zipsaja():
    validate_brand("zipsaja")


def test_validate_brand_raises_for_unknown():
    with pytest.raises(ValueError, match="Unknown brand"):
        validate_brand("mkt")


def test_validate_brand_raises_for_empty():
    with pytest.raises(ValueError, match="Brand is required"):
        validate_brand("")


def test_zipsaja_needs_data_fetch():
    assert brand_needs_data_fetch("zipsaja") is True


def test_howzero_skips_data_fetch():
    assert brand_needs_data_fetch("howzero") is False


def test_braveyong_skips_data_fetch():
    assert brand_needs_data_fetch("braveyong") is False
