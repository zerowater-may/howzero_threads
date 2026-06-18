from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


DEFAULT_BUYING_POWER_CURRENCIES = ("KRW", "USD")


def build_account_report(
    client: Any,
    *,
    generated_at: str | None = None,
    include_open_orders: bool = True,
    buying_power_currencies: tuple[str, ...] = DEFAULT_BUYING_POWER_CURRENCIES,
) -> dict[str, Any]:
    generated_at = generated_at or datetime.now(ZoneInfo("Asia/Seoul")).isoformat(timespec="seconds")
    accounts = client.get_accounts()

    return {
        "generatedAt": generated_at,
        "accounts": [
            _build_single_account_report(
                client,
                account,
                include_open_orders=include_open_orders,
                buying_power_currencies=buying_power_currencies,
            )
            for account in accounts
        ],
    }


def render_markdown_report(report: dict[str, Any]) -> str:
    lines = [
        "# TossInvest 계좌 리포트",
        "",
        f"- 생성시각: {report['generatedAt']}",
        f"- 계좌 수: {len(report['accounts'])}",
        "",
    ]

    if not report["accounts"]:
        lines.append("조회 가능한 계좌가 없습니다.")
        return "\n".join(lines).rstrip() + "\n"

    for index, account in enumerate(report["accounts"], start=1):
        holdings = account["holdings"]
        summary = holdings["summary"]
        profit_loss = summary.get("profitLoss", {})
        daily_profit_loss = summary.get("dailyProfitLoss", {})

        lines.extend(
            [
                f"## 계좌 {index}: {account['accountType']} {account['accountNoMasked']}",
                "",
                "### 요약",
                "",
                f"- 보유 종목 {holdings['itemCount']}개",
                f"- 매입금액: {_money_map(summary.get('totalPurchaseAmount'))}",
                f"- 평가금액: {_money_map(summary.get('marketValue', {}).get('amount'))}",
                f"- 손익: {_money_map(profit_loss.get('amount'))} ({_rate(profit_loss.get('rate'))})",
                f"- 일간 손익: {_money_map(daily_profit_loss.get('amount'))} ({_rate(daily_profit_loss.get('rate'))})",
                "",
                "### 매수가능금액",
                "",
                "| 통화 | 금액 |",
                "|---|---:|",
            ]
        )

        for currency, buying_power in account["buyingPower"].items():
            lines.append(f"| {currency} | {buying_power.get('cashBuyingPower', '-')} |")

        lines.extend(["", "### 보유 종목", ""])
        if holdings["items"]:
            lines.extend(
                [
                    "| 종목 | 시장 | 수량 | 현재가 | 평가금액 | 손익 | 손익률 |",
                    "|---|---|---:|---:|---:|---:|---:|",
                ]
            )
            for item in holdings["items"]:
                lines.append(
                    "| {name} ({symbol}) | {market} | {quantity} | {last_price} {currency} | "
                    "{market_value} | {profit_loss} | {profit_rate} |".format(
                        name=item.get("name", "-"),
                        symbol=item.get("symbol", "-"),
                        market=item.get("marketCountry", "-"),
                        quantity=item.get("quantity", "-"),
                        last_price=item.get("lastPrice", "-"),
                        currency=item.get("currency", ""),
                        market_value=item.get("marketValue", {}).get("amount", "-"),
                        profit_loss=item.get("profitLoss", {}).get("amount", "-"),
                        profit_rate=_rate(item.get("profitLoss", {}).get("rate")),
                    )
                )
        else:
            lines.append("보유 종목이 없습니다.")

        lines.extend(["", "### 수수료", ""])
        if account["commissions"]:
            lines.extend(["| 시장 | 수수료율 | 시작일 | 종료일 |", "|---|---:|---|---|"])
            for commission in account["commissions"]:
                lines.append(
                    "| {market} | {rate}% | {start} | {end} |".format(
                        market=commission.get("marketCountry", "-"),
                        rate=commission.get("commissionRate", "-"),
                        start=commission.get("startDate") or "-",
                        end=commission.get("endDate") or "-",
                    )
                )
        else:
            lines.append("조회된 수수료 정보가 없습니다.")

        open_orders = account["openOrders"]
        lines.extend(["", f"### 미체결 주문 {open_orders['count']}개", ""])
        if open_orders["orders"]:
            lines.extend(
                [
                    "| 종목 | 방향 | 유형 | 상태 | 가격 | 수량 | 주문시각 |",
                    "|---|---|---|---|---:|---:|---|",
                ]
            )
            for order in open_orders["orders"]:
                lines.append(
                    "| {symbol} | {side} | {order_type} | {status} | {price} {currency} | {quantity} | {ordered_at} |".format(
                        symbol=order.get("symbol", "-"),
                        side=order.get("side", "-"),
                        order_type=order.get("orderType", "-"),
                        status=order.get("status", "-"),
                        price=order.get("price") or "-",
                        currency=order.get("currency", ""),
                        quantity=order.get("quantity", "-"),
                        ordered_at=order.get("orderedAt", "-"),
                    )
                )
        else:
            lines.append("미체결 주문이 없습니다.")

        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def write_report(report: dict[str, Any], output_path: str | Path, *, format: str = "markdown") -> Path:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if format == "markdown":
        path.write_text(render_markdown_report(report), encoding="utf-8")
    elif format == "json":
        import json

        path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    else:
        raise ValueError("format must be markdown or json")
    return path


def _build_single_account_report(
    client: Any,
    account: dict[str, Any],
    *,
    include_open_orders: bool,
    buying_power_currencies: tuple[str, ...],
) -> dict[str, Any]:
    account_seq = account["accountSeq"]
    holdings = client.get_holdings(account_seq)
    buying_power = {
        currency: client.get_buying_power(account_seq, currency=currency)
        for currency in buying_power_currencies
    }
    commissions = client.get_commissions(account_seq)
    open_orders = client.get_orders(account_seq, status="OPEN") if include_open_orders else {"orders": []}

    return {
        "accountSeq": account_seq,
        "accountNoMasked": _mask_account_no(account.get("accountNo", "")),
        "accountType": account.get("accountType"),
        "holdings": {
            "summary": {
                "totalPurchaseAmount": holdings.get("totalPurchaseAmount", {}),
                "marketValue": holdings.get("marketValue", {}),
                "profitLoss": holdings.get("profitLoss", {}),
                "dailyProfitLoss": holdings.get("dailyProfitLoss", {}),
            },
            "itemCount": len(holdings.get("items", [])),
            "items": holdings.get("items", []),
        },
        "buyingPower": buying_power,
        "commissions": commissions,
        "openOrders": {
            "count": len(open_orders.get("orders", [])),
            "orders": open_orders.get("orders", []),
            "hasNext": open_orders.get("hasNext", False),
        },
    }


def _mask_account_no(account_no: str) -> str:
    if len(account_no) <= 4:
        return "****"
    return "*" * (len(account_no) - 4) + account_no[-4:]


def _money_map(value: dict[str, Any] | None) -> str:
    if not value:
        return "-"
    parts = []
    for currency in ("krw", "usd"):
        amount = value.get(currency)
        if amount is not None:
            parts.append(f"{currency.upper()} {amount}")
    return " / ".join(parts) if parts else "-"


def _rate(value: str | None) -> str:
    if value is None:
        return "-"
    try:
        return f"{float(value) * 100:.2f}%"
    except ValueError:
        return value
