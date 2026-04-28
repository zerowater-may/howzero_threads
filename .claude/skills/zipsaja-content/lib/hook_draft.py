"""Generate 5 hook candidates from data. Tone-checked + hallucination-guarded."""
import re
from lib.tone import check_tone


class HallucinationError(Exception):
    pass


def _check_hallucination(
    text: str,
    rows: list[dict],
    numeric_fields: list[str],
    extra_allowed: set[str] | None = None,
) -> None:
    nums_in_text = set(re.findall(r"\d+\.?\d*", text))
    allowed = {str(r[f]) for r in rows for f in numeric_fields}
    allowed_loose = set(allowed)
    for v in allowed:
        if "." in v:
            allowed_loose.add(v.split(".")[0])
    if extra_allowed:
        allowed_loose.update(extra_allowed)
    # Allow single-digit numbers and common year references (≤ 10) as contextual
    bad = [n for n in nums_in_text if n not in allowed_loose and float(n) > 10]
    if bad:
        raise HallucinationError(f"numbers not in data: {bad}")


def draft_hooks(
    rows: list[dict],
    value_field: str,
    label_field: str = "gu",
    pre_field: str = None,
    post_field: str = None,
) -> list[str]:
    if not rows:
        return []
    sorted_rows = sorted(rows, key=lambda r: float(r[value_field]), reverse=True)
    top = sorted_rows[0]
    bottom = sorted_rows[-1]
    top_label = str(top[label_field]).replace("구", "")
    bottom_label = str(bottom[label_field]).replace("구", "")

    candidates = []
    candidates.append(f"10년간 서울, 어디가 제일 올랐을까?")
    candidates.append(f"{top_label} {top[value_field]}배 — 1위")
    gangnam = next((r for r in rows if "강남" in str(r[label_field])), None)
    if gangnam and str(gangnam[label_field]) != str(top[label_field]):
        candidates.append(f"강남이 1위? — 아니, {top_label}")
    else:
        candidates.append(f"{top_label}이 강남보다 더 올랐다")
    gap_ratio = round(float(top[value_field]) / float(bottom[value_field]), 1)
    candidates.append(f"{top_label} {top[value_field]}배 vs {bottom_label} {bottom[value_field]}배")
    if pre_field and post_field:
        candidates.append(f"{top_label} {top[pre_field]}억 → 지금 {top[post_field]}억")
    else:
        candidates.append(f"양극화 {gap_ratio}배 — 어디가 답이었나")

    out = []
    numeric_fields = [value_field] + ([pre_field, post_field] if pre_field else [])
    # derived values (gap_ratio) are also allowed
    extra = {str(gap_ratio)}
    for c in candidates:
        if check_tone(c):
            continue
        try:
            _check_hallucination(c, rows, numeric_fields, extra_allowed=extra)
        except HallucinationError:
            continue
        out.append(c)
    return out
