"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, TrendingUp, BarChart3, Calendar } from "lucide-react";

interface ReportData {
  monthlyStats: {
    month: string;
    completed: number;
    savings: number;
  }[];
  weeklyBreakdown: {
    week: string;
    completed: number;
    avgPerDay: number;
  }[];
  agentPerformance: {
    agentName: string;
    completed: number;
    avgTimeHours: number;
  }[];
  totalSavings: number;
  totalCompleted: number;
}

function formatKRW(amount: number): string {
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    return `${man}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export default function ReportsPage() {
  const { data, isLoading, error } = useQuery<ReportData>({
    queryKey: ["customer-reports"],
    queryFn: async () => {
      const res = await fetch("/api/customer/reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
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
        <p>리포트를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">성과 리포트</h2>
        <p className="mt-1 text-sm text-gray-500">
          AI 직원의 업무 성과와 비용 절감 현황
        </p>
      </div>

      {/* 종합 통계 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <TrendingUp className="h-5 w-5" />
            <h3 className="text-sm font-medium">총 절감 비용</h3>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            ₩{formatKRW(data.totalSavings)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600">
            <BarChart3 className="h-5 w-5" />
            <h3 className="text-sm font-medium">총 처리 업무</h3>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {data.totalCompleted}
            <span className="text-sm font-normal text-gray-500">건</span>
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600">
            <Calendar className="h-5 w-5" />
            <h3 className="text-sm font-medium">일 평균 처리</h3>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {data.weeklyBreakdown.length > 0
              ? Math.round(
                  data.weeklyBreakdown.reduce((s, w) => s + w.avgPerDay, 0) /
                    data.weeklyBreakdown.length
                )
              : 0}
            <span className="text-sm font-normal text-gray-500">건/일</span>
          </p>
        </div>
      </div>

      {/* 월별 추이 */}
      {data.monthlyStats.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-500">월별 추이</h3>
          <div className="rounded-xl border bg-white p-5">
            <div className="space-y-3">
              {data.monthlyStats.map((m) => (
                <div key={m.month} className="flex items-center gap-4">
                  <span className="w-16 text-sm text-gray-500">{m.month}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 rounded bg-emerald-100"
                        style={{
                          width: `${Math.max(
                            (m.completed /
                              Math.max(...data.monthlyStats.map((s) => s.completed), 1)) *
                              100,
                            4
                          )}%`,
                        }}
                      >
                        <div
                          className="h-full rounded bg-emerald-500"
                          style={{ width: "100%" }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {m.completed}건
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-20 text-right">
                    ₩{formatKRW(m.savings)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI 직원별 성과 */}
      {data.agentPerformance.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-500">
            AI 직원별 성과
          </h3>
          <div className="rounded-xl border bg-white">
            <div className="divide-y">
              {data.agentPerformance.map((agent) => (
                <div
                  key={agent.agentName}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {agent.agentName}
                    </p>
                    <p className="text-xs text-gray-400">
                      평균 {agent.avgTimeHours}시간/건
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {agent.completed}건
                    </p>
                    <p className="text-xs text-emerald-500">
                      ₩{formatKRW(agent.completed * 15000)} 절감
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
