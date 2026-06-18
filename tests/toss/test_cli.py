from toss.cli import main


class FakeCliClient:
    def __enter__(self):
        return self

    def __exit__(self, *exc_info):
        return None

    def get_accounts(self):
        return [
            {
                "accountNo": "12345678901",
                "accountSeq": 7,
                "accountType": "BROKERAGE",
            }
        ]

    def get_holdings(self, account_seq):
        return {
            "totalPurchaseAmount": {"krw": "1000", "usd": None},
            "marketValue": {
                "amount": {"krw": "1200", "usd": None},
                "amountAfterCost": {"krw": "1190", "usd": None},
            },
            "profitLoss": {
                "amount": {"krw": "200", "usd": None},
                "amountAfterCost": {"krw": "190", "usd": None},
                "rate": "0.2",
                "rateAfterCost": "0.19",
            },
            "dailyProfitLoss": {
                "amount": {"krw": "10", "usd": None},
                "rate": "0.01",
            },
            "items": [],
        }

    def get_buying_power(self, account_seq, *, currency):
        return {"currency": currency, "cashBuyingPower": "1000"}

    def get_commissions(self, account_seq):
        return []

    def get_orders(self, account_seq, *, status):
        return {"orders": [], "nextCursor": None, "hasNext": False}


def test_report_cli_writes_markdown_file(tmp_path):
    output_path = tmp_path / "account-report.md"
    messages = []

    exit_code = main(
        ["report", "--out", str(output_path), "--format", "markdown"],
        client_factory=lambda: FakeCliClient(),
        print_fn=messages.append,
    )

    assert exit_code == 0
    assert output_path.exists()
    assert "*******8901" in output_path.read_text()
    assert "12345678901" not in output_path.read_text()
    assert messages == [f"wrote {output_path}"]
