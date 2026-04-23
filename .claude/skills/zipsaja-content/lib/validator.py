"""Sample-size outlier flag + multi-method (median/mean) consistency check."""

def flag_outliers(rows: list[dict], n_field: str = "n", threshold: int = 30) -> list[dict]:
    """Flag rows where sample count < threshold. If n_field missing, marks is_outlier=False."""
    result = []
    for r in rows:
        if n_field in r:
            # n_field may be "20/15" style — take first number
            raw = str(r[n_field]).split("/")[0].strip()
            is_outlier = int(raw) < threshold
        else:
            is_outlier = False
        result.append({**r, "is_outlier": is_outlier})
    return result


def multi_method_check(rows: list[dict]) -> list[dict]:
    out = []
    for r in rows:
        median = float(r.get("median", 0))
        mean = float(r.get("mean", 0))
        if median == 0:
            consistency = "unknown"
        else:
            ratio = abs(mean - median) / median
            consistency = "ok" if ratio < 0.15 else "skewed"
        out.append({**r, "consistency": consistency})
    return out
