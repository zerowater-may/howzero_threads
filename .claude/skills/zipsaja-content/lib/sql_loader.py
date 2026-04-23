"""Load SQL presets and substitute {param} placeholders safely."""
import os, re

SQL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "sql")
ALLOWED_PARAM = re.compile(r"^[A-Za-z0-9_%\.\-]+$")


def load(preset_name: str, **params) -> str:
    """Load <preset_name>.sql and format with params. Validates params for safety."""
    path = os.path.join(SQL_DIR, f"{preset_name}.sql")
    if not os.path.exists(path):
        raise FileNotFoundError(f"SQL preset not found: {preset_name}")
    with open(path) as f:
        sql = f.read()
    for k, v in params.items():
        s = str(v)
        if not ALLOWED_PARAM.match(s):
            raise ValueError(f"Unsafe param {k}={s!r}")
    return sql.format(**params)
