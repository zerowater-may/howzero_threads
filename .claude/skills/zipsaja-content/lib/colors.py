"""Tier ramps from data percentiles + WCAG AA contrast guard."""
from typing import Sequence


class ContrastFailure(Exception):
    pass


def percentile_tiers(values: Sequence[float], n: int = 5) -> list[float]:
    """Return n-1 cutpoints that partition values into n equal-percentile buckets."""
    if n < 2:
        raise ValueError("n must be >= 2")
    sorted_v = sorted(float(v) for v in values)
    L = len(sorted_v)
    cuts = []
    for i in range(1, n):
        rank = i * L / n
        idx = int(rank)
        cuts.append(sorted_v[min(idx, L - 1)])
    return cuts


def _hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _luminance(rgb: tuple[int, int, int]) -> float:
    def _c(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (_c(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(fg: str, bg: str) -> float:
    L1 = _luminance(_hex_to_rgb(fg))
    L2 = _luminance(_hex_to_rgb(bg))
    lighter, darker = max(L1, L2), min(L1, L2)
    return (lighter + 0.05) / (darker + 0.05)


def check_contrast_AA(fg: str, bg: str, large_text: bool = False) -> None:
    threshold = 3.0 if large_text else 4.5
    ratio = contrast_ratio(fg, bg)
    if ratio < threshold:
        raise ContrastFailure(f"contrast {ratio:.2f} < {threshold} for fg={fg} bg={bg}")
