import { NextResponse } from "next/server";
import { getCompanyAgents, getCompanyIssues } from "@/lib/paperclip/client";

const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID || "";

export async function GET() {
  try {
    const [agents, doneIssues] = await Promise.all([
      getCompanyAgents(COMPANY_ID),
      getCompanyIssues(COMPANY_ID, { status: "done" }),
    ]);

    // 에이전트별 완료 건수 집계
    const completedByAgent = new Map<string, number>();
    for (const issue of doneIssues as Array<{ assigneeAgentId: string | null }>) {
      if (issue.assigneeAgentId) {
        completedByAgent.set(
          issue.assigneeAgentId,
          (completedByAgent.get(issue.assigneeAgentId) || 0) + 1
        );
      }
    }

    const result = (
      agents as Array<{
        id: string;
        name: string;
        role: string;
        title: string | null;
        status: string;
        capabilities: string | null;
        lastHeartbeatAt: string | null;
      }>
    ).map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      title: a.title,
      status: a.status,
      capabilities: a.capabilities,
      lastHeartbeatAt: a.lastHeartbeatAt,
      recentTaskCount: completedByAgent.get(a.id) || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Customer agents error:", error);
    return NextResponse.json(
      { error: "Paperclip 서버에 연결할 수 없습니다" },
      { status: 502 }
    );
  }
}
