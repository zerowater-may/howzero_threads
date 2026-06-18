import json

from toss.report import build_account_report, render_markdown_report


class FakeReportClient:
    def __init__(self):
        self.calls = []

    def get_accounts(self):
        self.calls.append(("get_accounts",))
        return [
            {
                "accountNo": "12345678901",
                "accountSeq": 7,
                "accountType": "BROKERAGE",
            }
        ]

    def get_holdings(self, account_seq):
        self.calls.append(("get_holdings", account_seq))
        return {
            "totalPurchaseAmount": {"krw": "6500000", "usd": "1553"},
            "marketValue": {
                "amount": {"krw": "7200000", "usd": "1785"},
                "amountAfterCost": {"krw": "7050000", "usd": "1771.43"},
            },
            "profitLoss": {
                "amount": {"krw": "700000", "usd": "232"},
                "amountAfterCost": {"krw": "550000", "usd": "218.43"},
                "rate": "0.1179",
                "rateAfterCost": "0.0983",
            },
            "dailyProfitLoss": {
                "amount": {"krw": "100000", "usd": "25"},
                "rate": "0.0141",
            },
            "items": [
                {
                    "symbol": "005930",
                    "name": "삼성전자",
                    "marketCountry": "KR",
                    "currency": "KRW",
                    "quantity": "100",
                    "lastPrice": "72000",
                    "averagePurchasePrice": "65000",
                    "marketValue": {"amount": "7200000"},
                    "profitLoss": {"amount": "700000", "rate": "0.1077"},
                    "dailyProfitLoss": {"amount": "100000", "rate": "0.0141"},
                },
                {
                    "symbol": "AAPL",
                    "name": "Apple Inc.",
                    "marketCountry": "US",
                    "currency": "USD",
                    "quantity": "10",
                    "lastPrice": "178.5",
                    "averagePurchasePrice": "155.3",
                    "marketValue": {"amount": "1785"},
                    "profitLoss": {"amount": "232", "rate": "0.1494"},
                    "dailyProfitLoss": {"amount": "25", "rate": "0.0142"},
                },
            ],
        }

    def get_buying_power(self, account_seq, *, currency):
        self.calls.append(("get_buying_power", account_seq, currency))
        return {"currency": currency, "cashBuyingPower": "5000000" if currency == "KRW" else "3500.5"}

    def get_commissions(self, account_seq):
        self.calls.append(("get_commissions", account_seq))
        return [
            {"marketCountry": "KR", "commissionRate": "0.015", "startDate": "2026-01-01", "endDate": None},
            {"marketCountry": "US", "commissionRate": "0.1", "startDate": None, "endDate": "2026-06-30"},
        ]

    def get_orders(self, account_seq, *, status):
        self.calls.append(("get_orders", account_seq, status))
        return {
            "orders": [
                {
                    "orderId": "opaque-order-id",
                    "symbol": "005930",
                    "side": "BUY",
                    "orderType": "LIMIT",
                    "status": "PENDING",
                    "price": "70000",
                    "quantity": "10",
                    "currency": "KRW",
                    "orderedAt": "2026-06-10T09:30:00+09:00",
                }
            ],
            "nextCursor": None,
            "hasNext": False,
        }


def test_build_account_report_collects_read_only_sections_and_masks_account_number():
    client = FakeReportClient()

    report = build_account_report(
        client,
        generated_at="2026-06-10T18:30:00+09:00",
    )

    assert client.calls == [
        ("get_accounts",),
        ("get_holdings", 7),
        ("get_buying_power", 7, "KRW"),
        ("get_buying_power", 7, "USD"),
        ("get_commissions", 7),
        ("get_orders", 7, "OPEN"),
    ]
    assert report["generatedAt"] == "2026-06-10T18:30:00+09:00"
    assert report["accounts"][0]["accountNoMasked"] == "*******8901"
    assert report["accounts"][0]["holdings"]["itemCount"] == 2
    assert report["accounts"][0]["buyingPower"]["KRW"]["cashBuyingPower"] == "5000000"
    assert report["accounts"][0]["openOrders"]["count"] == 1
    assert "12345678901" not in json.dumps(report, ensure_ascii=False)


def test_render_markdown_report_is_human_readable_and_keeps_sensitive_fields_masked():
    report = build_account_report(
        FakeReportClient(),
        generated_at="2026-06-10T18:30:00+09:00",
    )

    markdown = render_markdown_report(report)

    assert "# TossInvest 계좌 리포트" in markdown
    assert "*******8901" in markdown
    assert "12345678901" not in markdown
    assert "보유 종목 2개" in markdown
    assert "삼성전자" in markdown
    assert "매수가능금액" in markdown
    assert "미체결 주문 1개" in markdown


def test_empty_account_report_renders_clear_empty_state():
    class EmptyClient:
        def get_accounts(self):
            return []

    report = build_account_report(
        EmptyClient(),
        generated_at="2026-06-10T18:30:00+09:00",
    )
    markdown = render_markdown_report(report)

    assert report["accounts"] == []
    assert "조회 가능한 계좌가 없습니다." in markdown
