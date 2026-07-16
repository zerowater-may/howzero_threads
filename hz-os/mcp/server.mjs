#!/usr/bin/env node
// hz-os 사내 MCP (stdio) 서버.
// 6개 딜 파이프라인 툴을 노출하고, 각 호출을 hz-os Next 앱의 /api/mcp(Bearer)로 프록시한다.
// Claude Desktop 등 stdio MCP 클라이언트가 로컬에서 붙는다.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.HZOS_BASE_URL || "http://localhost:3400";
const SECRET = process.env.HZOS_MCP_SECRET;

// 내부 API 호출 — action/params를 그대로 전달하고 {ok,data|error}를 풀어 반환한다.
async function call(action, params) {
  if (!SECRET) throw new Error("HZOS_MCP_SECRET 환경변수가 설정되지 않았습니다.");
  const res = await fetch(`${BASE_URL}/api/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${SECRET}` },
    body: JSON.stringify({ action, params }),
  });
  const json = await res.json().catch(() => ({ ok: false, error: `non_json_response_${res.status}` }));
  if (!json.ok) throw new Error(json.error || `http_${res.status}`);
  return json.data;
}

// tool 핸들러: call 결과를 JSON 텍스트 content로 감싼다. 실패는 isError로 표기.
function tool(action) {
  return async (args) => {
    try {
      const data = await call(action, args ?? {});
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: String(e?.message ?? e) }], isError: true };
    }
  };
}

const server = new McpServer({ name: "hz-os-mcp", version: "0.1.0" });

server.registerTool(
  "list_deals",
  { title: "딜 목록", description: "아카이브 제외 딜(리드) 목록. stage로 필터 가능.", inputSchema: { stage: z.string().optional().describe("파이프라인 단계 필터 (상담신청/진단/제안/계약/구축/운영)") } },
  tool("list_deals")
);

server.registerTool(
  "get_company",
  { title: "고객사 요약", description: "고객사 + 그 회사의 딜·제안·계약 요약.", inputSchema: { id: z.number().int().describe("companies.id") } },
  tool("get_company")
);

server.registerTool(
  "move_deal",
  { title: "딜 단계 이동", description: "딜을 파이프라인 단계로 이동하고 activity_log에 기록.", inputSchema: { id: z.number().int().describe("leads.id"), stage: z.string().describe("이동할 단계 (상담신청/진단/제안/계약/구축/운영)") } },
  tool("move_deal")
);

server.registerTool(
  "create_proposal",
  {
    title: "제안 생성",
    description: "라인아이템으로 mm_total·amount를 서버 계산해 제안을 생성.",
    inputSchema: {
      companyId: z.number().int().describe("companies.id"),
      dealId: z.number().int().optional().describe("leads.id (선택)"),
      lineItems: z
        .array(z.object({ label: z.string(), role: z.string().optional(), manMonths: z.number(), unitPrice: z.number() }))
        .describe("[{label, role?, manMonths, unitPrice}] — amount는 서버가 manMonths×unitPrice로 계산"),
    },
  },
  tool("create_proposal")
);

server.registerTool(
  "dashboard_metrics",
  { title: "대시보드 지표", description: "단계별 딜 수·계약 총액·진행중 마진 합·상담→계약 전환율.", inputSchema: {} },
  tool("dashboard_metrics")
);

server.registerTool(
  "low_margin_contracts",
  { title: "저마진 계약", description: "진행중(active) 계약 중 마진율 < 회사 임계치인 것.", inputSchema: {} },
  tool("low_margin_contracts")
);

const transport = new StdioServerTransport();
await server.connect(transport);
