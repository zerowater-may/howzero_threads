"""SQL preset registry for zipsaja proptech_db queries.

Each preset bundles a SQL template + default parameters + a validator for
user-supplied overrides. The template uses psycopg2-compatible :named
placeholders.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any

_SQL_DIR = Path(__file__).parent / "presets_sql"


@dataclass(frozen=True)
class Preset:
    name: str
    sql_template: str
    default_params: dict[str, Any] = field(default_factory=dict)


def _load_sql(filename: str) -> str:
    return (_SQL_DIR / filename).read_text(encoding="utf-8")


PRESETS: dict[str, Preset] = {
    "leejaemyung-before-after": Preset(
        name="leejaemyung-before-after",
        sql_template=_load_sql("leejaemyung_before_after.sql"),
        default_params={
            "pivot_date": date(2025, 6, 4),
            "min_total_units": 300,
        },
    ),
}


def get_preset(name: str) -> Preset:
    if name not in PRESETS:
        raise KeyError(f"unknown preset '{name}' — known: {list(PRESETS)}")
    return PRESETS[name]


def extract_params(preset: Preset, *, user_overrides: dict[str, Any] | None = None) -> dict[str, Any]:
    """Merge user overrides onto preset defaults."""
    overrides = user_overrides or {}
    unknown = set(overrides) - set(preset.default_params)
    if unknown:
        raise ValueError(f"unknown parameter(s): {sorted(unknown)}")

    merged: dict[str, Any] = dict(preset.default_params)
    for key, value in overrides.items():
        if key == "pivot_date" and isinstance(value, str):
            merged[key] = date.fromisoformat(value)
        else:
            merged[key] = value
    return merged
