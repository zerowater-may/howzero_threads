"""proptech_db read wrapper. SSH + psql, parse pipe-separated to list[dict]."""
import os, subprocess

DEFAULT_HOST = "151.245.106.86"
DEFAULT_USER = "proptech"
DEFAULT_DB = "proptech_db"


def query(sql: str, host: str = DEFAULT_HOST, user: str = DEFAULT_USER, db: str = DEFAULT_DB) -> list[dict]:
    """Execute SELECT and return list of dicts. Headers from psql -A (no -t)."""
    pwd = os.environ.get("PROPTECH_PG_PASSWORD", "proptech2026")
    inner = f'PGPASSWORD={pwd} psql -h 127.0.0.1 -U {user} -d {db} -A -F"|" -c "{sql}"'
    out = subprocess.run(
        ["ssh", f"root@{host}", inner],
        capture_output=True, text=True, check=True,
    ).stdout
    lines = [l for l in out.strip().split("\n") if l and not l.startswith("(")]
    if not lines:
        return []
    headers = lines[0].split("|")
    return [dict(zip(headers, line.split("|"))) for line in lines[1:]]
