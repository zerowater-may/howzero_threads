"""SSH tunnel + psycopg2 PG execution + row → dataset transform.

Network boundary is isolated from pure transforms so unit tests cover
row shaping without needing a live DB.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import psycopg2
from sshtunnel import SSHTunnelForwarder

# 25 Seoul 자치구 — ordered for consistent rendering
SEOUL_DISTRICTS_ORDER: tuple[str, ...] = (
    "서초구", "강남구", "용산구", "송파구", "성동구", "마포구", "동작구", "강동구",
    "광진구", "중구", "영등포구", "종로구", "동대문구", "서대문구", "양천구", "강서구",
    "성북구", "은평구", "관악구", "구로구", "강북구", "금천구", "노원구", "중랑구", "도봉구",
)


def compute_change_pct(price_before: int, price_after: int) -> float:
    if price_before <= 0:
        return 0.0
    return round((price_after - price_before) / price_before * 100, 1)


def _won_to_manwon(won: int) -> int:
    """Convert won → 만원 (truncated). 100,000,000원 (1억) → 10,000만원."""
    return won // 10_000


def rows_to_dataset(
    rows: list[tuple[str, int, int, int, int]],
    *,
    title: str,
    subtitle: str,
    period_label: str,
    source: str,
) -> dict[str, Any]:
    """Shape DB rows into the SeoulPriceDataset contract.

    Rows: (district, price_before_won, price_after_won, trades_before, trades_after)
    """
    by_district = {r[0]: r for r in rows}
    districts: list[dict[str, Any]] = []
    for gu in SEOUL_DISTRICTS_ORDER:
        if gu not in by_district:
            continue
        _, price_before, price_after, _, _ = by_district[gu]
        districts.append({
            "district": gu,
            "priceBefore": _won_to_manwon(price_before),
            "priceAfter": _won_to_manwon(price_after),
            "changePct": compute_change_pct(price_before, price_after),
        })

    return {
        "generatedAt": datetime.now(timezone.utc).astimezone().isoformat(),
        "title": title,
        "subtitle": subtitle,
        "periodLabel": period_label,
        "source": source,
        "districts": districts,
    }


def fetch_via_tunnel(
    *,
    ssh_host: str,
    ssh_user: str,
    pg_host: str,
    pg_port: int,
    pg_user: str,
    pg_pass: str,
    pg_db: str,
    sql: str,
    params: dict[str, Any],
) -> list[tuple]:
    """Open SSH tunnel, run SQL with params, return all rows."""
    with SSHTunnelForwarder(
        (ssh_host, 22),
        ssh_username=ssh_user,
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
                cur.execute(sql, params)
                return cur.fetchall()
        finally:
            conn.close()
