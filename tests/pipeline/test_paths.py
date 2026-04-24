from pathlib import Path

from scripts.pipeline.paths import (
    BUNDLE_ROOT,
    bundle_path,
    make_slug,
    state_file_path,
)


def test_make_slug_korean_to_ascii():
    assert make_slug("이재명 당선후 서울 실거래 변화") == "이재명-당선후-서울-실거래-변화"


def test_make_slug_strips_punctuation():
    assert make_slug("2026년 6월! 아파트/주택 변화?") == "2026년-6월-아파트-주택-변화"


def test_make_slug_collapses_whitespace():
    assert make_slug("  서울   실거래   변화  ") == "서울-실거래-변화"


def test_make_slug_allows_ascii_mix():
    assert make_slug("SCHD 배당") == "SCHD-배당"


def test_bundle_path_structure():
    result = bundle_path("zipsaja", "leejaemyung-seoul")
    assert result == BUNDLE_ROOT / "zipsaja" / "zipsaja_pipeline_leejaemyung-seoul"


def test_state_file_path_uses_bundle():
    result = state_file_path("zipsaja", "test")
    assert result == BUNDLE_ROOT / "zipsaja" / "zipsaja_pipeline_test" / "pipeline-state.json"


def test_bundle_root_is_brands_dir():
    assert BUNDLE_ROOT.name == "brands"
    assert BUNDLE_ROOT.is_absolute()
