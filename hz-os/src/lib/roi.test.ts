import { describe, expect, it } from "vitest";
import { roiScore, annualHoursSaved, priorityRank, type OntObject } from "./roi";

describe("roiScore", () => {
  it("연간 절감시간 / 구축공수", () => {
    // 30분 × 5회/주 × 52 / 60 = 130시간, ÷ 2맨데이 = 65
    expect(annualHoursSaved(30, 5)).toBe(130);
    expect(roiScore({ timeSavedMinPerRun: 30, runsPerWeek: 5, buildCostManDays: 2 })).toBe(65);
  });

  it("구축공수 0은 0.5로 바닥 처리", () => {
    expect(roiScore({ timeSavedMinPerRun: 30, runsPerWeek: 5, buildCostManDays: 0 })).toBe(260);
  });
});

describe("priorityRank", () => {
  const est = (id: number, t: number, r: number, b: number): OntObject => ({
    id,
    type: "bottleneck",
    label: `est${id}`,
    props: { timeSavedMinPerRun: t, runsPerWeek: r, buildCostManDays: b },
  });
  const pri = (id: number, p: string): OntObject => ({ id, type: "bottleneck", label: `pri${id}`, props: { priority: p } });

  it("추정치 병목이 priority-only 병목보다 위, 각 그룹 내 정렬", () => {
    const objects: OntObject[] = [
      pri(1, "낮음"),
      est(2, 10, 1, 5), // roi 낮음
      pri(3, "높음"),
      est(4, 60, 10, 1), // roi 높음
      { id: 5, type: "task", label: "업무", props: null }, // 병목 아님 → 제외
    ];
    const ranked = priorityRank(objects);
    expect(ranked.map((o) => o.id)).toEqual([4, 2, 3, 1]);
  });

  it("추정치 없으면 priority fallback (높음>중간>낮음)", () => {
    const ranked = priorityRank([pri(1, "낮음"), pri(2, "높음"), pri(3, "중간")]);
    expect(ranked.map((o) => o.id)).toEqual([2, 3, 1]);
  });
});
