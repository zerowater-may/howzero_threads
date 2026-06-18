import json

import httpx
import pytest

from toss import TossInvestAPIError, TossInvestClient, TossInvestOAuthError


def make_transport(handler):
    return httpx.MockTransport(handler)


def json_response(status_code, payload, headers=None):
    return httpx.Response(
        status_code,
        json=payload,
        headers=headers or {},
    )


def test_get_prices_issues_oauth_token_and_sends_bearer_header():
    requests = []

    def handler(request):
        requests.append(request)
        if request.url.path == "/oauth2/token":
            assert request.method == "POST"
            assert request.headers["content-type"] == "application/x-www-form-urlencoded"
            assert request.content.decode() == (
                "grant_type=client_credentials&client_id=client-id&client_secret=client-secret"
            )
            return json_response(
                200,
                {"access_token": "token-1", "token_type": "Bearer", "expires_in": 86400},
            )

        assert request.url.path == "/api/v1/prices"
        assert request.headers["authorization"] == "Bearer token-1"
        assert request.url.params["symbols"] == "005930,AAPL"
        return json_response(
            200,
            {
                "result": [
                    {"symbol": "005930", "lastPrice": "72000", "currency": "KRW"},
                    {"symbol": "AAPL", "lastPrice": "185.70", "currency": "USD"},
                ]
            },
        )

    client = TossInvestClient(
        client_id="client-id",
        client_secret="client-secret",
        transport=make_transport(handler),
    )

    result = client.get_prices(["005930", "AAPL"])

    assert [item["symbol"] for item in result] == ["005930", "AAPL"]
    assert [request.url.path for request in requests] == ["/oauth2/token", "/api/v1/prices"]


def test_token_is_cached_until_it_needs_refresh():
    calls = {"token": 0}

    def handler(request):
        if request.url.path == "/oauth2/token":
            calls["token"] += 1
            return json_response(
                200,
                {"access_token": f"token-{calls['token']}", "token_type": "Bearer", "expires_in": 86400},
            )
        assert request.headers["authorization"] == "Bearer token-1"
        return json_response(200, {"result": []})

    client = TossInvestClient(
        client_id="client-id",
        client_secret="client-secret",
        transport=make_transport(handler),
    )

    client.get_accounts()
    client.get_accounts()

    assert calls["token"] == 1


def test_account_methods_send_account_header_and_order_json_without_none_values():
    seen = {}

    def handler(request):
        if request.url.path == "/oauth2/token":
            return json_response(
                200,
                {"access_token": "token-1", "token_type": "Bearer", "expires_in": 86400},
            )

        seen["path"] = request.url.path
        seen["account"] = request.headers["x-tossinvest-account"]
        seen["body"] = json.loads(request.content.decode())
        return json_response(200, {"result": {"orderId": "order-1", "clientOrderId": "cid-1"}})

    client = TossInvestClient(
        client_id="client-id",
        client_secret="client-secret",
        transport=make_transport(handler),
    )

    result = client.create_order(
        account_seq=7,
        symbol="AAPL",
        side="BUY",
        order_type="MARKET",
        order_amount="100.5",
        client_order_id="cid-1",
    )

    assert result == {"orderId": "order-1", "clientOrderId": "cid-1"}
    assert seen == {
        "path": "/api/v1/orders",
        "account": "7",
        "body": {
            "clientOrderId": "cid-1",
            "symbol": "AAPL",
            "side": "BUY",
            "orderType": "MARKET",
            "orderAmount": "100.5",
        },
    }


def test_all_documented_operations_are_exposed():
    expected_methods = {
        "issue_token",
        "get_orderbook",
        "get_prices",
        "get_trades",
        "get_price_limits",
        "get_candles",
        "get_stocks",
        "get_stock_warnings",
        "get_exchange_rate",
        "get_kr_market_calendar",
        "get_us_market_calendar",
        "get_accounts",
        "get_holdings",
        "get_orders",
        "create_order",
        "get_order",
        "modify_order",
        "cancel_order",
        "get_buying_power",
        "get_sellable_quantity",
        "get_commissions",
    }

    for method_name in expected_methods:
        assert hasattr(TossInvestClient, method_name), method_name


def test_bff_error_raises_structured_exception_without_leaking_client_secret():
    def handler(request):
        if request.url.path == "/oauth2/token":
            return json_response(
                200,
                {"access_token": "token-1", "token_type": "Bearer", "expires_in": 86400},
            )
        return json_response(
            429,
            {
                "error": {
                    "requestId": "01HXYZ",
                    "code": "rate-limit-exceeded",
                    "message": "요청 한도를 초과했습니다.",
                }
            },
            headers={"Retry-After": "1"},
        )

    client = TossInvestClient(
        client_id="client-id",
        client_secret="client-secret",
        transport=make_transport(handler),
    )

    with pytest.raises(TossInvestAPIError) as exc_info:
        client.get_orderbook("005930")

    error = exc_info.value
    assert error.status_code == 429
    assert error.code == "rate-limit-exceeded"
    assert error.request_id == "01HXYZ"
    assert error.headers["retry-after"] == "1"
    assert "client-secret" not in str(error)


def test_oauth_error_raises_oauth_exception_without_leaking_client_secret():
    def handler(request):
        return json_response(
            401,
            {
                "error": "invalid_client",
                "error_description": "Client authentication failed.",
            },
        )

    client = TossInvestClient(
        client_id="client-id",
        client_secret="client-secret",
        transport=make_transport(handler),
    )

    with pytest.raises(TossInvestOAuthError) as exc_info:
        client.get_accounts()

    error = exc_info.value
    assert error.error == "invalid_client"
    assert "Client authentication failed." in str(error)
    assert "client-secret" not in str(error)


def test_from_env_reads_standard_tossinvest_keys(monkeypatch):
    monkeypatch.setenv("TOSSINVEST_CLIENT_ID", "env-client")
    monkeypatch.setenv("TOSSINVEST_CLIENT_SECRET", "env-secret")

    client = TossInvestClient.from_env(transport=make_transport(lambda request: json_response(200, {})))

    assert client.client_id == "env-client"
    assert client.client_secret == "env-secret"
