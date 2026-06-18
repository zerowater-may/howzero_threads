from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Any, Iterable

import httpx

from .exceptions import TossInvestAPIError, TossInvestConfigError, TossInvestOAuthError

DEFAULT_BASE_URL = "https://openapi.tossinvest.com"


@dataclass
class AccessToken:
    value: str
    token_type: str
    expires_at: float

    def is_valid(self, skew_seconds: int) -> bool:
        return bool(self.value) and (time.time() + skew_seconds) < self.expires_at


class TossInvestClient:
    """Small synchronous client for TossInvest Open API.

    The client returns each endpoint's `result` payload directly. OAuth token
    responses and error envelopes are handled internally.
    """

    def __init__(
        self,
        client_id: str,
        client_secret: str,
        *,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 10.0,
        token_refresh_skew_seconds: int = 60,
        transport: httpx.BaseTransport | None = None,
        http_client: httpx.Client | None = None,
    ) -> None:
        if not client_id:
            raise TossInvestConfigError("TOSSINVEST_CLIENT_ID is required")
        if not client_secret:
            raise TossInvestConfigError("TOSSINVEST_CLIENT_SECRET is required")

        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = base_url.rstrip("/")
        self.token_refresh_skew_seconds = token_refresh_skew_seconds
        self._token: AccessToken | None = None
        self._owns_http_client = http_client is None
        self._http = http_client or httpx.Client(
            base_url=self.base_url,
            timeout=timeout,
            transport=transport,
        )

    @classmethod
    def from_env(cls, **kwargs: Any) -> "TossInvestClient":
        return cls(
            client_id=os.getenv("TOSSINVEST_CLIENT_ID", ""),
            client_secret=os.getenv("TOSSINVEST_CLIENT_SECRET", ""),
            base_url=os.getenv("TOSSINVEST_BASE_URL", DEFAULT_BASE_URL),
            **kwargs,
        )

    def close(self) -> None:
        if self._owns_http_client:
            self._http.close()

    def __enter__(self) -> "TossInvestClient":
        return self

    def __exit__(self, *exc_info: object) -> None:
        self.close()

    def issue_token(self, *, force: bool = False) -> str:
        if self._token and not force and self._token.is_valid(self.token_refresh_skew_seconds):
            return self._token.value

        response = self._http.post(
            "/oauth2/token",
            data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            },
        )
        if response.status_code >= 400:
            self._raise_oauth_error(response)

        payload = response.json()
        expires_in = int(payload["expires_in"])
        self._token = AccessToken(
            value=payload["access_token"],
            token_type=payload.get("token_type", "Bearer"),
            expires_at=time.time() + expires_in,
        )
        return self._token.value

    def get_orderbook(self, symbol: str) -> dict:
        return self._get("/api/v1/orderbook", params={"symbol": symbol})

    def get_prices(self, symbols: str | Iterable[str]) -> list[dict]:
        return self._get("/api/v1/prices", params={"symbols": self._join_symbols(symbols)})

    def get_trades(self, symbol: str, *, count: int | None = None) -> list[dict]:
        return self._get("/api/v1/trades", params={"symbol": symbol, "count": count})

    def get_price_limits(self, symbol: str) -> dict:
        return self._get("/api/v1/price-limits", params={"symbol": symbol})

    def get_candles(
        self,
        symbol: str,
        interval: str,
        *,
        count: int | None = None,
        before: str | None = None,
        adjusted: bool | None = None,
    ) -> dict:
        return self._get(
            "/api/v1/candles",
            params={
                "symbol": symbol,
                "interval": interval,
                "count": count,
                "before": before,
                "adjusted": adjusted,
            },
        )

    def get_stocks(self, symbols: str | Iterable[str]) -> list[dict]:
        return self._get("/api/v1/stocks", params={"symbols": self._join_symbols(symbols)})

    def get_stock_warnings(self, symbol: str) -> list[dict]:
        return self._get(f"/api/v1/stocks/{symbol}/warnings")

    def get_exchange_rate(
        self,
        *,
        base_currency: str,
        quote_currency: str,
        date_time: str | None = None,
    ) -> dict:
        return self._get(
            "/api/v1/exchange-rate",
            params={
                "dateTime": date_time,
                "baseCurrency": base_currency,
                "quoteCurrency": quote_currency,
            },
        )

    def get_kr_market_calendar(self, *, date: str | None = None) -> dict:
        return self._get("/api/v1/market-calendar/KR", params={"date": date})

    def get_us_market_calendar(self, *, date: str | None = None) -> dict:
        return self._get("/api/v1/market-calendar/US", params={"date": date})

    def get_accounts(self) -> list[dict]:
        return self._get("/api/v1/accounts")

    def get_holdings(self, account_seq: int, *, symbol: str | None = None) -> dict:
        return self._get(
            "/api/v1/holdings",
            account_seq=account_seq,
            params={"symbol": symbol},
        )

    def get_orders(
        self,
        account_seq: int,
        *,
        status: str,
        symbol: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
        cursor: str | None = None,
        limit: int | None = None,
    ) -> dict:
        return self._get(
            "/api/v1/orders",
            account_seq=account_seq,
            params={
                "status": status,
                "symbol": symbol,
                "from": from_date,
                "to": to_date,
                "cursor": cursor,
                "limit": limit,
            },
        )

    def create_order(
        self,
        account_seq: int,
        *,
        symbol: str,
        side: str,
        order_type: str,
        quantity: str | None = None,
        order_amount: str | None = None,
        price: str | None = None,
        time_in_force: str | None = None,
        client_order_id: str | None = None,
        confirm_high_value_order: bool | None = None,
    ) -> dict:
        return self._post(
            "/api/v1/orders",
            account_seq=account_seq,
            json_body={
                "clientOrderId": client_order_id,
                "symbol": symbol,
                "side": side,
                "orderType": order_type,
                "timeInForce": time_in_force,
                "quantity": quantity,
                "orderAmount": order_amount,
                "price": price,
                "confirmHighValueOrder": confirm_high_value_order,
            },
        )

    def get_order(self, account_seq: int, order_id: str) -> dict:
        return self._get(f"/api/v1/orders/{order_id}", account_seq=account_seq)

    def modify_order(
        self,
        account_seq: int,
        order_id: str,
        *,
        order_type: str,
        quantity: str | None = None,
        price: str | None = None,
        confirm_high_value_order: bool | None = None,
    ) -> dict:
        return self._post(
            f"/api/v1/orders/{order_id}/modify",
            account_seq=account_seq,
            json_body={
                "orderType": order_type,
                "quantity": quantity,
                "price": price,
                "confirmHighValueOrder": confirm_high_value_order,
            },
        )

    def cancel_order(self, account_seq: int, order_id: str) -> dict:
        return self._post(
            f"/api/v1/orders/{order_id}/cancel",
            account_seq=account_seq,
            json_body={},
        )

    def get_buying_power(self, account_seq: int, *, currency: str) -> dict:
        return self._get(
            "/api/v1/buying-power",
            account_seq=account_seq,
            params={"currency": currency},
        )

    def get_sellable_quantity(self, account_seq: int, *, symbol: str) -> dict:
        return self._get(
            "/api/v1/sellable-quantity",
            account_seq=account_seq,
            params={"symbol": symbol},
        )

    def get_commissions(self, account_seq: int) -> list[dict]:
        return self._get("/api/v1/commissions", account_seq=account_seq)

    def _get(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        account_seq: int | None = None,
    ) -> Any:
        return self._request("GET", path, params=params, account_seq=account_seq)

    def _post(
        self,
        path: str,
        *,
        json_body: dict[str, Any] | None = None,
        account_seq: int | None = None,
    ) -> Any:
        return self._request("POST", path, json_body=json_body, account_seq=account_seq)

    def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json_body: dict[str, Any] | None = None,
        account_seq: int | None = None,
        retry_on_unauthorized: bool = True,
    ) -> Any:
        response = self._http.request(
            method,
            path,
            params=self._clean(params),
            json=self._clean(json_body) if json_body is not None else None,
            headers=self._headers(account_seq=account_seq),
        )

        if response.status_code == 401 and retry_on_unauthorized:
            self._token = None
            response = self._http.request(
                method,
                path,
                params=self._clean(params),
                json=self._clean(json_body) if json_body is not None else None,
                headers=self._headers(account_seq=account_seq, force_token=True),
            )

        if response.status_code >= 400:
            self._raise_api_error(response)

        payload = response.json()
        if isinstance(payload, dict) and "result" in payload:
            return payload["result"]
        return payload

    def _headers(self, *, account_seq: int | None = None, force_token: bool = False) -> dict[str, str]:
        headers = {"Authorization": f"Bearer {self.issue_token(force=force_token)}"}
        if account_seq is not None:
            headers["X-Tossinvest-Account"] = str(account_seq)
        return headers

    def _raise_oauth_error(self, response: httpx.Response) -> None:
        try:
            payload = response.json()
        except ValueError:
            payload = {}
        raise TossInvestOAuthError(
            error=payload.get("error", "oauth-error"),
            error_description=payload.get("error_description"),
            status_code=response.status_code,
        )

    def _raise_api_error(self, response: httpx.Response) -> None:
        try:
            payload = response.json()
        except ValueError:
            payload = {}

        error = payload.get("error") if isinstance(payload, dict) else None
        if not isinstance(error, dict):
            error = {}

        request_id = error.get("requestId") or response.headers.get("X-Request-Id")
        raise TossInvestAPIError(
            status_code=response.status_code,
            code=error.get("code", "http-error"),
            message=error.get("message", response.text),
            request_id=request_id,
            data=error.get("data"),
            headers={key.lower(): value for key, value in response.headers.items()},
        )

    @staticmethod
    def _clean(payload: dict[str, Any] | None) -> dict[str, Any]:
        if not payload:
            return {}
        return {key: value for key, value in payload.items() if value is not None}

    @staticmethod
    def _join_symbols(symbols: str | Iterable[str]) -> str:
        if isinstance(symbols, str):
            return symbols
        return ",".join(symbols)
