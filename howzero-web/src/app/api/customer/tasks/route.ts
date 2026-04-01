import { NextRequest, NextResponse } from "next/server";
import { getCompanyAgents, getCompanyIssues } from "@/lib/paperclip/client";

const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID || "";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");

    const [agents, issues] = await Promise.all([
      getCompanyAgents(COMPANY_ID),
      getCompanyIssues(COMPANY_ID, {
        status: status || "todo,in_progress,done,blocked,in_review",
      }),
    ]);

    const agentMap = new Map(
      (agents as Array<{ id: string; name: string }>).map((a) => [a.id, a.name])
    );

    const result = (
      issues as Array<{
        id: string;
        identifier: string;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        assigneeAgentId: string | null;
        completedAt: string | null;
        createdAt: string;
        updatedAt: string;
      }>
    )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map((i) => ({
        id: i.id,
        identifier: i.identifier,
        title: i.title,
        description: i.description,
        status: i.status,
        priority: i.priority,
        assigneeAgentName: i.assigneeAgentId
          ? agentMap.get(i.assigneeAgentId) || "AI 직원"
          : "미배정",
        completedAt: i.completedAt,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Customer tasks error:", error);
    return NextResponse.json(
      { error: "Paperclip 서버에 연결할 수 없습니다" },
      { status: 502 }
    );
  }
}
