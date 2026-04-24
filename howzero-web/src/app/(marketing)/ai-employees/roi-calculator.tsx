"use client";

import { useState } from "react";
import Link from "next/link";

const MONTHLY_AI_COST = 590_000; // 월 59만원 (AI 직원 2명)

export function RoiCalculator() {
  const [staffCount, setStaffCount] = useState<string>("");
  const [monthlyCost, setMonthlyCost] = useState<string>("");
  const [monthlyTickets, setMonthlyTickets] = useState<string>("");
  const [result, setResult] = useState<{
    monthlySaving: number;
    paybackMonths: number;
    yearSaving: number;
    automationRate: number;
  } | null>(null);

  function calculate() {
    const staff = Number(staffCount) || 0;
    const cost = Number(monthlyCost) || 0;
    const tickets = Number(monthlyTickets) || 0;
    if (staff <= 0 || cost <= 0) return;

    // AI가 처리 가능한 비율 (직원 수에 따라 70~85%)
    const automationRate = Math.min(0.85, 0.60 + staff * 0.05);
    const reducibleCost = cost * automationRate;
    const monthlySaving = Math.max(0, reducibleCost - MONTHLY_AI_COST);
    const setupCost = 3_500_000; // 스탠다드 패키지 기준
    const paybackMonths =
      monthlySaving > 0 ? Math.ceil(setupCost / monthlySaving) : 99;
    const yearSaving = monthlySaving * 12;

    setResult({
      monthlySaving,
      paybackMonths,
      yearSaving,
      automationRate: Math.round(automationRate * 100),
    });
  }

  function formatWon(amount: number) {
    if (amount >= 10000_0000) {
      return `${(amount / 10000_0000).toFixed(1)}억`;
    }
    return `${Math.round(amount / 10000)}만`;
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-8 md:p-10">
      <h3 className="text-xl font-bold tracking-tight md:text-2xl">
        AI 직원 ROI 계산기
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        현재 인력 비용을 입력하면, AI 직원 전환 시 절감 효과를 바로
        확인할 수 있습니다.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">
            현재 CS 직원 수
          </label>
          <input
            type="number"
            min={1}
            placeholder="예: 3"
            value={staffCount}
            onChange={(e) => setStaffCount(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">
            월 인건비 총액 (만원)
          </label>
          <input
            type="number"
            min={0}
            placeholder="예: 900"
            value={monthlyCost}
            onChange={(e) => setMonthlyCost(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">
            월 처리 건수
          </label>
          <input
            type="number"
            min={0}
            placeholder="예: 3000"
            value={monthlyTickets}
            onChange={(e) => setMonthlyTickets(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="mt-6 w-full rounded-lg bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 md:w-auto"
      >
        절감 효과 계산하기
      </button>

      {result && (
        <div className="mt-8 rounded-xl border border-foreground/20 bg-foreground/[0.03] p-6 md:p-8">
          <p className="text-sm font-medium text-muted-foreground">
            AI 직원 전환 시 예상 효과
          </p>
          <div className="mt-4 grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-3xl font-extrabold">
                {result.automationRate}%
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                업무 자동화율
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-600">
                {formatWon(result.monthlySaving * 10000)}원
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                월 절감액
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-600">
                {formatWon(result.yearSaving * 10000)}원
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                연간 절감액
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">
                {result.paybackMonths}개월
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                투자 회수 기간
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-foreground p-6 text-center text-background">
            <p className="text-base font-semibold">
              지금 무료 AI 오딧을 신청하고 정확한 절감액을 확인하세요
            </p>
            <Link
              href="/audit"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-background px-8 py-3 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
            >
              무료 AI 오딧 30분 신청 →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
