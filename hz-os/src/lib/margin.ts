// 계약 손익 파생 순수 함수 (A2Z Step5). 저장 컬럼이 아니라 timelog·expense에서 계산한다.
// 서버컴포넌트(계약 통합페이지·대시보드)에서 재사용한다.

export interface MarginTimelog {
  man_days: number;
  day_rate: number;
}
export interface MarginExpense {
  amount: number;
}
export interface MarginInput {
  amount: number; // 계약 금액
  timelogs: MarginTimelog[];
  expenses: MarginExpense[];
}
export interface MarginResult {
  cost: number;
  margin: number;
  marginPct: number;
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

// cost = Σ(투입일수 × 일단가) + Σ(지출). margin = 금액 − cost. marginPct = margin / 금액 × 100.
export function contractMargin({ amount, timelogs, expenses }: MarginInput): MarginResult {
  const labor = timelogs.reduce((s, t) => s + num(t.man_days) * num(t.day_rate), 0);
  const spend = expenses.reduce((s, e) => s + num(e.amount), 0);
  const cost = labor + spend;
  const amt = num(amount);
  const margin = amt - cost;
  const marginPct = amt > 0 ? (margin / amt) * 100 : 0; // 금액 0이면 0으로 (0 나눗셈 방지)
  return { cost, margin, marginPct };
}

// 마진율이 임계 미만이면 저마진.
export function isLowMargin(marginPct: number, threshold: number): boolean {
  return marginPct < threshold;
}
