import pytest
from lib.tone import check_tone, ToneViolation

def test_pass_friendly_text():
    assert check_tone("내가 봐봤는데 진짜 괜찮아") == []

def test_block_polite_form():
    violations = check_tone("안녕하세요 여러분")
    assert any(v.kind == "polite" for v in violations)

def test_block_provocation():
    violations = check_tone("강남 끝났다 90%가 모른다")
    kinds = {v.kind for v in violations}
    assert "provocation" in kinds

def test_block_emoji():
    violations = check_tone("진짜 좋아 🔥")
    assert any(v.kind == "emoji" for v in violations)

def test_block_with_strict_raises():
    from lib.tone import check_tone_strict
    with pytest.raises(ToneViolation):
        check_tone_strict("여러분 안녕하세요")
