import pytest
from lib.colors import percentile_tiers, contrast_ratio, check_contrast_AA, ContrastFailure

def test_percentile_tiers_5_buckets():
    values = list(range(1, 101))
    tiers = percentile_tiers(values, n=5)
    assert len(tiers) == 4
    assert tiers[0] == pytest.approx(20.0, abs=1)
    assert tiers[-1] == pytest.approx(80.0, abs=1)

def test_contrast_ratio_known():
    assert contrast_ratio("#000000", "#FFFFFF") == pytest.approx(21.0, abs=0.1)
    assert contrast_ratio("#888888", "#888888") == pytest.approx(1.0, abs=0.01)

def test_check_contrast_AA_passes_black_white():
    check_contrast_AA(fg="#000000", bg="#FFFFFF")

def test_check_contrast_AA_fails_low():
    with pytest.raises(ContrastFailure):
        check_contrast_AA(fg="#FFFFFF", bg="#F0E7D6")
