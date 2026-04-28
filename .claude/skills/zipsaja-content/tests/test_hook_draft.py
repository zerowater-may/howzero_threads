import pytest
from lib.hook_draft import draft_hooks, HallucinationError

SAMPLE_10Y = [
    {"gu":"용산구","eok_then":10.6,"eok_now":33.2,"multiple":3.13,"samples":"1481/121","is_outlier":False},
    {"gu":"성동구","eok_then":5.9, "eok_now":18.2,"multiple":3.11,"samples":"3763/314","is_outlier":False},
    {"gu":"강남구","eok_then":11.0,"eok_now":26.5,"multiple":2.41,"samples":"3561/327","is_outlier":False},
    {"gu":"도봉구","eok_then":3.2, "eok_now":6.0, "multiple":1.88,"samples":"3235/507","is_outlier":False},
]

def test_draft_returns_5_candidates():
    hooks = draft_hooks(SAMPLE_10Y, value_field="multiple", label_field="gu")
    assert len(hooks) == 5

def test_all_hooks_pass_tone():
    from lib.tone import check_tone
    hooks = draft_hooks(SAMPLE_10Y, value_field="multiple", label_field="gu")
    for h in hooks:
        assert check_tone(h) == [], f"tone violation in: {h}"

def test_hooks_contain_real_numbers():
    hooks = draft_hooks(SAMPLE_10Y, value_field="multiple", label_field="gu")
    for h in hooks:
        for tok in ["압구정", "한남", "분당"]:
            assert tok not in h, f"hallucinated label '{tok}' in: {h}"

def test_hallucination_check_raises():
    with pytest.raises(HallucinationError):
        from lib.hook_draft import _check_hallucination
        _check_hallucination("강남이 100배 올랐다", SAMPLE_10Y, ["multiple", "eok_then", "eok_now"])
