import { NextResponse } from "next/server";
import { getCompanyAgents, getCompanyIssues } from "@/lib/paperclip/client";

const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID || "";
const COST_PER_TASK = 15000;

export async function GET() {
  try {
    const [agents, doneIssues] = await Promise.all([
      getCompanyAgents(COMPANY_ID),
      getCompanyIssues(COMPANY_ID, { status: "done" }),
    ]);

    const agentMap = new Map(
      (agents as Array<{ id: string; name: string }>).map((a) => [a.id, a.name])
    );

    const issues = doneIssues as Array<{
      id: string;
      assigneeAgentId: string | null;
      completedAt: string | null;
      createdAt: string;
    }>;

    // 월별 통계
    const monthlyMap = new Map<string, number>();
    for (const issue of issues) {
      if (issue.completedAt) {
        const d = new Date(issue.completedAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
      }
    }
    const monthlyStats = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, completed]) => ({
        month,
        completed,
        savings: completed * COST_PER_TASK,
      }));

    // 주별 통계 (최근 4주)
    const now = new Date();
    const weeklyBreakdown: { week: string; completed: number; avgPerDay: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (w + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - w * 7);

      const count = issues.filter((i) => {
        if (!i.completedAt) return false;
        const d = new Date(i.completedAt);
        return d >= weekStart && d < weekEnd;
      }).length;

      weeklyBreakdown.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}~${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`,
        completed: count,
        avgPerDay: Math.round((count / 7) * 10) / 10,
      });
    }

    // 에이전트별 성과
    const agentCounts = new Map<string, { count: number; totalTime: number }>();
    for (const issue of issues) {
      if (issue.assigneeAgentId && issue.completedAt) {
        const existing = agentCounts.get(issue.assigneeAgentId) || {
          count: 0,
          totalTime: 0,
        };
        const timeHours =
          (new Date(issue.completedAt).getTime() -
            new Date(issue.createdAt).getTime()) /
          3600000;
        existing.count++;
        existing.totalTime += timeHours;
        agentCounts.set(issue.assigneeAgentId, existing);
      }
    }

    const agentPerformance = Array.from(agentCounts.entries())
      .map(([agentId, stats]) => ({
        agentName: agentMap.get(agentId) || "AI 직원",
        completed: stats.count,
        avgTimeHours:
          Math.round((stats.totalTime / Math.max(stats.count, 1)) * 10) / 10,
      }))
      .sort((a, b) => b.completed - a.completed);

    const totalCompleted = issues.length;
    const totalSavings = totalCompleted * COST_PER_TASK;

    return NextResponse.json({
      monthlyStats,
      weeklyBreakdown,
      agentPerformance,
      totalSavings,
      totalCompleted,
    });
  } catch (error) {
    console.error("Customer reports error:", error);
    return NextResponse.json(
      { error: "Paperclip 서버에 연결할 수 없습니다" },
      { status: 502 }
    );
  }
}
