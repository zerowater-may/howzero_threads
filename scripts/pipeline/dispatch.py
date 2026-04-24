"""Brand → data-fetch routing.

MVP scope: zipsaja needs data fetch (SSH + proptech_db). howzero/braveyong
skip the data step and pass topic text through as-is (per spec §2 Step 2).
"""
from __future__ import annotations

SUPPORTED_BRANDS: tuple[str, ...] = ("zipsaja", "howzero", "braveyong")

_DATA_FETCH_BRANDS: frozenset[str] = frozenset({"zipsaja"})


def validate_brand(brand: str) -> None:
    if not brand:
        raise ValueError("Brand is required")
    if brand not in SUPPORTED_BRANDS:
        raise ValueError(
            f"Unknown brand '{brand}'. Supported: {', '.join(SUPPORTED_BRANDS)}"
        )


def brand_needs_data_fetch(brand: str) -> bool:
    return brand in _DATA_FETCH_BRANDS
