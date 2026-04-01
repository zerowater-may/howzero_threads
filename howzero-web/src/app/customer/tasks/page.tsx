"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, CheckCircle2, Clock, AlertTriangle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigneeAgentName: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type FilterStatus = "all" | "in_progress" | "done" | "todo" | "blocked";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  done: { label: "완료", icon: CheckCircle2, color: "text-emerald-500" },
  in_progress: { label: "진행 중", icon: Clock, color: "text-blue-500" },
  todo: { label: "예정", icon: Circle, color: "text-gray-400" },
  blocked: { label: "차단됨", icon: AlertTriangle, color: "text-red-500" },
  in_review: { label: "검토 중", icon: Clock, color: "text-purple-500" },
  cancelled: { label: "취소", icon: Circle, color: "text-gray-300" },
};

const priorityLabels: Record<string, string> = {
  critical: "긴급",
  high: "높음",
  medium: "보통",
  low: "낮음",
};

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "in_progress", label: "진행 중" },
  { value: "done", label: "완료" },
  { value: "todo", label: "예정" },
  { value: "blocked", label: "차단" },
];

export default function TasksPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");

  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ["customer-tasks", filter],
    queryFn: async () => {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/customer/tasks${params}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500">
        <AlertCircle className="h-8 w-8" />
        <p>업무 목록을 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">업무 현황</h2>
        <p className="mt-1 text-sm text-gray-500">
          AI 직원들이 처리하는 업무 목록입니다
        </p>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
              filter === opt.value
                ? "bg-white font-medium text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 업무 목록 */}
      <div className="space-y-2">
        {!tasks || tasks.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center text-sm text-gray-400">
            해당하는 업무가 없습니다
          </div>
        ) : (
          tasks.map((task) => {
            const statusInfo = statusConfig[task.status] || statusConfig.todo;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={task.id}
                className="rounded-lg border bg-white p-4 transition-colors hover:border-gray-300"
              >
                <div className="flex items-start gap-3">
                  <StatusIcon
                    className={cn("mt-0.5 h-4 w-4 shrink-0", statusInfo.color)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {task.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span>{task.identifier}</span>
                      <span>{task.assigneeAgentName}</span>
                      <span
                        className={
                          task.priority === "critical"
                            ? "text-red-500 font-medium"
                            : task.priority === "high"
                              ? "text-amber-500"
                              : ""
                        }
                      >
                        {priorityLabels[task.priority] || task.priority}
                      </span>
                      <span>{statusInfo.label}</span>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-xs text-gray-400 line-clamp-2">
                        {task.description.replace(/[#*`]/g, "").slice(0, 120)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
