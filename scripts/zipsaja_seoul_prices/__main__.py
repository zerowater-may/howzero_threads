"""Fetch Seoul district price comparison from batch_server PG → JSON."""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import psycopg2
from sshtunnel import SSHTunnelForwarder

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUT = REPO_ROOT / ".claude/skills/carousel/brands/zipsaja/reels/public/data/seoul-prices.json"

# 서울 25개 자치구 정렬 순서 (스크린샷 기준)
DISTRICT_ORDER = [
    "서초구", "강남구", "용산구", "송파구", "성동구", "마포구", "동작구",
    "강동구", "광진구", "중구", "영등포구", "종로구", "동대문구",
    "서대문구", "양천구", "강서구", "성북구", "은평구", "관악구",
    "구로구", "강북구", "금천구", "노원구", "중랑구", "도봉구",
]


def compute_change_pct(last_year: float, this_year: float) -> float:
    if last_year <= 0:
        return 0.0
    return round((this_year - last_year) / last_year * 100, 1)


def to_dataset_dict(
    rows: list[tuple[str, int, int]],
    *,
    period: str,
    size: str,
    source: str,
) -> dict:
    by_dist = {d: (ly, ty) for d, ly, ty in rows}
    districts = []
    for d in DISTRICT_ORDER:
        if d in by_dist:
            ly, ty = by_dist[d]
            districts.append({
                "district": d,
                "priceLastYear": int(ly),
                "priceThisYear": int(ty),
                "changePct": compute_change_pct(ly, ty),
            })
    return {
        "generatedAt": datetime.now(timezone.utc).astimezone().isoformat(),
        "periodLabel": period,
        "sizeLabel": size,
        "source": source,
        "districts": districts,
    }


SQL = """
SELECT gu AS district,
       ROUND(AVG(price_last_year))::int AS ly,
       ROUND(AVG(price_this_year))::int AS ty
FROM zipsaja_seoul_gu_price_compare
WHERE area_pyeong = 24
GROUP BY gu
"""
# 주의: 테이블/컬럼 이름은 Task 7에서 실제 DB 스키마 확인 후 조정.


def fetch_via_tunnel(
    *, ssh_host: str, pg_host: str, pg_port: int, pg_user: str, pg_pass: str, pg_db: str
) -> list[tuple[str, int, int]]:
    with SSHTunnelForwarder(
        (ssh_host, 22),
        ssh_username="root",
        remote_bind_address=(pg_host, pg_port),
    ) as tunnel:
        conn = psycopg2.connect(
            host="127.0.0.1",
            port=tunnel.local_bind_port,
            user=pg_user,
            password=pg_pass,
            dbname=pg_db,
        )
        try:
            with conn.cursor() as cur:
                cur.execute(SQL)
                return cur.fetchall()
        finally:
            conn.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Fetch zipsaja Seoul price JSON")
    parser.add_argument("--ssh-host", default="batch_server")
    parser.add_argument("--pg-host", default="10.10.0.2")
    parser.add_argument("--pg-port", type=int, default=5432)
    parser.add_argument("--pg-user", default=os.environ.get("PG_USER", "bulsaja"))
    parser.add_argument("--pg-pass", default=os.environ.get("PG_PASSWORD", "bulsaja2026"))
    parser.add_argument("--pg-db", default=os.environ.get("PG_DATABASE", "bulsaja_analytics"))
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--period", default="25.1.1 ~ 4.18 vs 26.1.1 ~ 4.18")
    parser.add_argument("--size", default="24평대 / 전용 55㎡ ~ 60㎡")
    parser.add_argument("--source", default="국토부 실거래가")
    args = parser.parse_args(argv)

    rows = fetch_via_tunnel(
        ssh_host=args.ssh_host,
        pg_host=args.pg_host,
        pg_port=args.pg_port,
        pg_user=args.pg_user,
        pg_pass=args.pg_pass,
        pg_db=args.pg_db,
    )

    dataset = to_dataset_dict(rows, period=args.period, size=args.size, source=args.source)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(dataset, ensure_ascii=False, indent=2))
    print(f"Wrote {len(dataset['districts'])} districts → {args.out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
