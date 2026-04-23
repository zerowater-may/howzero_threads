from lib.validator import flag_outliers, multi_method_check

def test_flag_outliers_marks_low_n():
    rows = [{"gu": "종로", "n": 16}, {"gu": "강남", "n": 800}]
    flagged = flag_outliers(rows, n_field="n", threshold=30)
    by_gu = {r["gu"]: r for r in flagged}
    assert by_gu["종로"]["is_outlier"] is True
    assert by_gu["강남"]["is_outlier"] is False

def test_multi_method_consistent():
    rows = [{"gu": "강남", "median": 27.5, "mean": 27.0, "p25": 26.0, "p75": 29.2}]
    out = multi_method_check(rows)
    assert out[0]["consistency"] == "ok"

def test_multi_method_inconsistent():
    rows = [{"gu": "X", "median": 10.0, "mean": 25.0, "p25": 8.0, "p75": 12.0}]
    out = multi_method_check(rows)
    assert out[0]["consistency"] == "skewed"
