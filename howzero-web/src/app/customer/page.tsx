"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  TrendingDown,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  todayCompleted: Array<{
    id: string;
    identifier: string;
    title: string;
    completedAt: string;
    assigneeAgentName: string;
  }>;
  monthCompletedCount: number;
  upcomingTasks: Array<{
    id: string;
    identifier: string;
    title: string;
    status: string;
    priority: string;
    assigneeAgentName: string;
  }>;
  agents: Array<{
    id: string;
    name: string;
    status: string;
    lastHeartbeatAt: string | null;
  }>;
}

function formatKRW(amount: number): string {
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000)}만 ${amount % 10000 > 0 ? (amount % 10000).toLocaleString() : ""}원`.trim();
  }
  return `${amount.toLocaleString()}원`;
}

const COST_PER_TASK_KRW = 15000;

export default function CustomerDashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["customer-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/customer/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500">
        <AlertCircle className="h-8 w-8" />
        <p>데이터를 불러올 수 없습니다</p>
        <p className="text-xs text-gray-400">Paperclip 서버 연결을 확인해주세요</p>
      </div>
    );
  }

  const monthSavings = data.monthCompletedCount * COST_PER_TASK_KRW;

  return (
    <div className="space-y-6">
      {/* 상단 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 오늘 처리한 일 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="text-sm font-medium">오늘 처리한 일</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.todayCompleted.length}
            <span className="text-base font-normal text-gray-500">건</span>
          </p>
        </div>

        {/* 이번달 절감 비용 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600">
            <TrendingDown className="h-5 w-5" />
            <h3 className="text-sm font-medium">이번달 절감 비용</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₩{formatKRW(monthSavings)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {data.monthCompletedCount}건 처리 × ₩{COST_PER_TASK_KRW.toLocaleString()}/건
          </p>
        </div>

        {/* 다음 할 일 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-amber-600">
            <Clock className="h-5 w-5" />
            <h3 className="text-sm font-medium">다음 할 일</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.upcomingTasks.length}
            <span className="text-base font-normal text-gray-500">건 대기</span>
          </p>
        </div>
      </div>

      {/* AI 직원 상태 */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-gray-500">AI 직원 상태</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-3 rounded-lg border bg-white p-4"
            >
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  agent.status === "running"
                    ? "bg-emerald-500 animate-pulse"
                    : agent.status === "idle"
                      ? "bg-gray-300"
                      : "bg-amber-400"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {agent.name}
                </p>
                <p className="text-xs text-gray-400">
                  {agent.status === "running"
                    ? "업무 중"
                    : agent.status === "idle"
                      ? "대기 중"
                      : "일시정지"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 오늘 완료된 업무 */}
      {data.todayCompleted.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-500">
            오늘 완료된 업무
          </h3>
          <div className="space-y-2">
            {data.todayCompleted.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border bg-white p-3"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-400">
                    {task.assigneeAgentName} · {task.identifier}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 예정된 업무 */}
      {data.upcomingTasks.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">예정된 업무</h3>
            <a
              href="/customer/tasks"
              className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
            >
              전체 보기 <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <div className="space-y-2">
            {data.upcomingTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border bg-white p-3"
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    task.status === "in_progress"
                      ? "bg-blue-500"
                      : task.status === "blocked"
                        ? "bg-red-400"
                        : "bg-gray-300"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{task.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{task.assigneeAgentName}</span>
                    <span>·</span>
                    <span
                      className={
                        task.priority === "critical"
                          ? "text-red-500"
                          : task.priority === "high"
                            ? "text-amber-500"
                            : ""
                      }
                    >
                      {task.priority === "critical"
                        ? "긴급"
                        : task.priority === "high"
                          ? "높음"
                          : task.priority === "medium"
                            ? "보통"
                            : "낮음"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
