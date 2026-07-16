import { describe, expect, it } from "vitest";
import { contractMargin, isLowMargin } from "./margin";

describe("contractMargin", () => {
  it("cost = 인건비 + 지출, margin·marginPct 파생", () => {
    const r = contractMargin({
      amount: 10_000_000,
      timelogs: [{ man_days: 10, day_rate: 400_000 }], // 400만
      expenses: [{ amount: 1_000_000 }], // 100만
    });
    expect(r.cost).toBe(5_000_000);
    expect(r.margin).toBe(5_000_000);
    expect(r.marginPct).toBe(50);
  });

  it("timelog 추가되면 마진 감소", () => {
    const base = contractMargin({ amount: 10_000_000, timelogs: [], expenses: [] });
    const after = contractMargin({ amount: 10_000_000, timelogs: [{ man_days: 5, day_rate: 500_000 }], expenses: [] });
    expect(base.margin).toBe(10_000_000);
    expect(after.margin).toBe(7_500_000);
    expect(after.margin).toBeLessThan(base.margin);
  });

  it("금액 0이면 marginPct 0 (0 나눗셈 방지)", () => {
    expect(contractMargin({ amount: 0, timelogs: [], expenses: [] }).marginPct).toBe(0);
  });
});

describe("isLowMargin", () => {
  it("마진율 < 임계 → 저마진", () => {
    expect(isLowMargin(20, 30)).toBe(true);
    expect(isLowMargin(30, 30)).toBe(false);
    expect(isLowMargin(45, 30)).toBe(false);
  });
});
