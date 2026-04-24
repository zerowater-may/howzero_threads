"""Bundle path + slug computation for pipeline outputs.

BUNDLE_ROOT is resolved relative to the repo (scripts/pipeline/paths.py → .. → ..)
so invocation from any CWD produces correct paths.
"""
from __future__ import annotations

import re
from pathlib import Path

# repo_root/brands/
BUNDLE_ROOT = Path(__file__).resolve().parents[2] / "brands"


def make_slug(topic: str) -> str:
    """Topic → URL-safe slug.

    Rules:
    - Strip punctuation (Korean: 。,!?/ etc; ASCII: .,!?/ etc)
    - Collapse whitespace to single hyphens
    - Preserve Korean characters, ASCII letters, digits
    """
    cleaned = re.sub(r"[^\w\s]", " ", topic, flags=re.UNICODE)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned.replace(" ", "-")


def bundle_path(brand: str, slug: str) -> Path:
    return BUNDLE_ROOT / brand / f"{brand}_pipeline_{slug}"


def state_file_path(brand: str, slug: str) -> Path:
    return bundle_path(brand, slug) / "pipeline-state.json"
