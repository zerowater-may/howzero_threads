"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  title: string | null;
  status: string;
  capabilities: string | null;
  lastHeartbeatAt: string | null;
  recentTaskCount: number;
}

const roleLabels: Record<string, string> = {
  ceo: "대표",
  cto: "기술 총괄",
  cmo: "마케팅 총괄",
  manager: "매니저",
  ic: "실무 담당",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  running: { label: "업무 중", color: "bg-emerald-500" },
  idle: { label: "대기 중", color: "bg-gray-300" },
  paused: { label: "일시정지", color: "bg-amber-400" },
  error: { label: "오류", color: "bg-red-500" },
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "활동 없음";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function AgentsPage() {
  const { data: agents, isLoading, error } = useQuery<Agent[]>({
    queryKey: ["customer-agents"],
    queryFn: async () => {
      const res = await fetch("/api/customer/agents");
      if (!res.ok) throw new Error("Failed to fetch agents");
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

  if (error || !agents) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500">
        <AlertCircle className="h-8 w-8" />
        <p>AI 직원 정보를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">AI 직원</h2>
        <p className="mt-1 text-sm text-gray-500">
          현재 {agents.length}명의 AI 직원이 근무 중입니다
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {agents.map((agent) => {
          const statusInfo = statusConfig[agent.status] || statusConfig.idle;

          return (
            <div
              key={agent.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {agent.title || roleLabels[agent.role] || agent.role}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-2 w-2 rounded-full ${statusInfo.color} ${
                      agent.status === "running" ? "animate-pulse" : ""
                    }`}
                  />
                  <span className="text-xs text-gray-500">
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {agent.capabilities && (
                <p className="mt-3 text-xs text-gray-400 line-clamp-2">
                  {agent.capabilities}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-gray-400">
                <span>최근 활동: {timeAgo(agent.lastHeartbeatAt)}</span>
                <span>처리: {agent.recentTaskCount}건</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
