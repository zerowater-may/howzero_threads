# TossInvest Open API

토스증권 Open API를 하우제로 콘텐츠와 자동화 실험에 쓰기 위한 로컬 작업 폴더다.

- 실행 코드: [src/toss/](/Users/zerowater/Dropbox/zerowater/howzero/src/toss)
- 테스트: [tests/toss/test_client.py](/Users/zerowater/Dropbox/zerowater/howzero/tests/toss/test_client.py)
- API 요약: [openapi-summary.json](/Users/zerowater/Dropbox/zerowater/howzero/toss/openapi-summary.json)
- 콘텐츠 메모: [content-notes.md](/Users/zerowater/Dropbox/zerowater/howzero/toss/content-notes.md)

## Env

실제 키는 `.env.local`에만 둔다. 문서나 추적 파일에 복사하지 않는다.

```bash
set -a
source .env.local
set +a
```

필수 키:

```bash
TOSSINVEST_CLIENT_ID=...
TOSSINVEST_CLIENT_SECRET=...
```

선택 키:

```bash
TOSSINVEST_BASE_URL=https://openapi.tossinvest.com
```

## Quickstart

```python
from toss import TossInvestClient

with TossInvestClient.from_env() as client:
    prices = client.get_prices(["005930", "AAPL"])
    accounts = client.get_accounts()
```

계좌/주문 API는 `GET /api/v1/accounts`의 `accountSeq`를 `account_seq`로 넘긴다.

```python
from toss import TossInvestClient

with TossInvestClient.from_env() as client:
    account_seq = client.get_accounts()[0]["accountSeq"]
    holdings = client.get_holdings(account_seq)
```

주문 생성, 정정, 취소 메서드는 실제 계좌에 영향을 준다. 콘텐츠 촬영이나 테스트에서는 `httpx.MockTransport`를 사용하고, 실키로 라이브 호출하지 않는다.

## Account Report

읽기 전용 계좌 리포트 자동화:

```bash
set -a && source .env.local && set +a
python3 -m toss report --out toss/reports/account-report-$(date +%F).md
```

JSON으로 저장:

```bash
python3 -m toss report \
  --format json \
  --out toss/reports/account-report-$(date +%F).json
```

포함 항목:

- 계좌 목록 (`accountNo`는 마지막 4자리만 남기고 마스킹)
- 보유 종목/평가금액/손익
- KRW·USD 매수가능금액
- 시장별 수수료율
- 미체결 주문 `OPEN`

## Implemented Methods

| Group | Methods |
|---|---|
| Auth | `issue_token` |
| Market Data | `get_orderbook`, `get_prices`, `get_trades`, `get_price_limits`, `get_candles` |
| Stock Info | `get_stocks`, `get_stock_warnings` |
| Market Info | `get_exchange_rate`, `get_kr_market_calendar`, `get_us_market_calendar` |
| Account | `get_accounts` |
| Asset | `get_holdings` |
| Order History | `get_orders`, `get_order` |
| Order | `create_order`, `modify_order`, `cancel_order` |
| Order Info | `get_buying_power`, `get_sellable_quantity`, `get_commissions` |

## Behavior

- OAuth2 Client Credentials 토큰을 자동 발급하고 만료 전까지 캐시한다.
- 일반 API는 성공 응답 envelope의 `result`만 반환한다.
- OAuth 에러는 `TossInvestOAuthError`, BFF 에러 envelope은 `TossInvestAPIError`로 분리한다.
- `account_seq`가 필요한 메서드는 `X-Tossinvest-Account` 헤더를 자동으로 붙인다.
- `401` 응답은 토큰을 버리고 1회 재발급 후 재시도한다.
