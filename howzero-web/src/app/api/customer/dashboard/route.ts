import { NextResponse } from "next/server";
import {
  getCompanyDashboard,
  getCompanyAgents,
  getCompanyIssues,
} from "@/lib/paperclip/client";

const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID || "";
const COST_PER_TASK = 15000;

export async function GET() {
  try {
    const [agents, allIssues] = await Promise.all([
      getCompanyAgents(COMPANY_ID),
      getCompanyIssues(COMPANY_ID, {
        status: "todo,in_progress,done,blocked",
      }),
    ]);

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 에이전트 이름 매핑
    const agentMap = new Map(
      (agents as Array<{ id: string; name: string }>).map((a) => [a.id, a.name])
    );

    const issues = allIssues as Array<{
      id: string;
      identifier: string;
      title: string;
      status: string;
      priority: string;
      assigneeAgentId: string | null;
      completedAt: string | null;
      createdAt: string;
    }>;

    // 오늘 완료된 업무
    const todayCompleted = issues
      .filter(
        (i) =>
          i.status === "done" &&
          i.completedAt &&
          new Date(i.completedAt) >= todayStart
      )
      .map((i) => ({
        id: i.id,
        identifier: i.identifier,
        title: i.title,
        completedAt: i.completedAt,
        assigneeAgentName: i.assigneeAgentId
          ? agentMap.get(i.assigneeAgentId) || "AI 직원"
          : "AI 직원",
      }));

    // 이번달 완료 건수
    const monthCompletedCount = issues.filter(
      (i) =>
        i.status === "done" &&
        i.completedAt &&
        new Date(i.completedAt) >= monthStart
    ).length;

    // 예정 업무 (todo, in_progress, blocked)
    const upcomingTasks = issues
      .filter((i) => ["todo", "in_progress", "blocked"].includes(i.status))
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = {
          critical: 0,
          high: 1,
          medium: 2,
          low: 3,
        };
        return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
      })
      .map((i) => ({
        id: i.id,
        identifier: i.identifier,
        title: i.title,
        status: i.status,
        priority: i.priority,
        assigneeAgentName: i.assigneeAgentId
          ? agentMap.get(i.assigneeAgentId) || "AI 직원"
          : "미배정",
      }));

    // 에이전트 상태
    const agentList = (
      agents as Array<{
        id: string;
        name: string;
        status: string;
        lastHeartbeatAt: string | null;
      }>
    ).map((a) => ({
      id: a.id,
      name: a.name,
      status: a.status,
      lastHeartbeatAt: a.lastHeartbeatAt,
    }));

    return NextResponse.json({
      todayCompleted,
      monthCompletedCount,
      upcomingTasks,
      agents: agentList,
    });
  } catch (error) {
    console.error("Customer dashboard error:", error);
    return NextResponse.json(
      { error: "Paperclip 서버에 연결할 수 없습니다" },
      { status: 502 }
    );
  }
}
