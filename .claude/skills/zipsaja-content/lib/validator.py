"""Sample-size outlier flag + multi-method (median/mean) consistency check."""

def flag_outliers(rows: list[dict], n_field: str = "n", threshold: int = 30) -> list[dict]:
    return [{**r, "is_outlier": int(r[n_field]) < threshold} for r in rows]


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
