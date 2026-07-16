# hz-os 사내 MCP 서버

hz-os 딜 파이프라인을 Claude(및 다른 stdio MCP 클라이언트)에서 직접 다루는 stdio MCP 서버입니다.
각 tool 호출은 hz-os Next 앱의 내부 API(`POST /api/mcp`, Bearer 시크릿)로 프록시됩니다.

이 패키지는 hz-os Next 앱과 **별도 패키지**입니다. `@modelcontextprotocol/sdk`를 메인 `hz-os/package.json`에 넣지 마세요.

## 설치

```bash
cd hz-os/mcp
npm i
```

## 환경변수

| 변수 | 기본값 | 설명 |
|---|---|---|
| `HZOS_BASE_URL` | `http://localhost:3400` | hz-os Next 앱 주소 |
| `HZOS_MCP_SECRET` | (필수) | `/api/mcp` Bearer 시크릿. hz-os 쪽 `HZOS_MCP_SECRET`(없으면 `HZOS_INBOUND_SECRET`)와 동일해야 함 |

hz-os 앱은 `HZOS_MCP_SECRET` 또는 `HZOS_INBOUND_SECRET` 중 하나로 인증합니다. MCP 서버에는 그 값과 같은 시크릿을 `HZOS_MCP_SECRET`으로 넣으세요.

## 실행

```bash
HZOS_MCP_SECRET=<secret> node server.mjs
# 또는
HZOS_MCP_SECRET=<secret> npm start
```

## Claude Desktop 등록

`claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "hz-os": {
      "command": "node",
      "args": ["/절대경로/hz-os/mcp/server.mjs"],
      "env": {
        "HZOS_BASE_URL": "http://localhost:3400",
        "HZOS_MCP_SECRET": "여기에_시크릿"
      }
    }
  }
}
```

## 노출 tool

| tool | 입력 | 설명 |
|---|---|---|
| `list_deals` | `{ stage? }` | 아카이브 제외 딜(리드) 목록. stage로 필터 |
| `get_company` | `{ id }` | 고객사 + 그 회사의 딜·제안·계약 요약 |
| `move_deal` | `{ id, stage }` | 딜 단계 이동 + activity_log 기록. stage는 상담신청/진단/제안/계약/구축/운영 |
| `create_proposal` | `{ companyId, dealId?, lineItems }` | 라인아이템으로 mm_total·amount 서버 계산 후 제안 생성 |
| `dashboard_metrics` | `{}` | 단계별 딜 수·계약 총액·진행중 마진 합·상담→계약 전환율 |
| `low_margin_contracts` | `{}` | 진행중 계약 중 마진율 < 회사 임계치인 것 |

`lineItems` 형식: `[{ label, role?, manMonths, unitPrice }]`. `amount`는 서버가 `manMonths × unitPrice`로 재계산합니다.
