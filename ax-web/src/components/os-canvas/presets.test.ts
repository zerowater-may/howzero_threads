import { describe, expect, it } from "vitest";
import { PRESETS, PRESET_ORDER } from "./presets";

describe("os-canvas presets", () => {
  it("4개 프리셋이 정의돼 있다", () => {
    expect(PRESET_ORDER).toEqual(["cs", "settle", "content", "order"]);
    for (const key of PRESET_ORDER) expect(PRESETS[key]).toBeDefined();
  });

  for (const key of ["cs", "settle", "content", "order"] as const) {
    describe(key, () => {
      it("노드 id가 유니크하다", () => {
        const ids = PRESETS[key].nodes.map((n) => n.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it("엣지 source/target이 존재하는 노드를 가리킨다", () => {
        const ids = new Set(PRESETS[key].nodes.map((n) => n.id));
        for (const e of PRESETS[key].edges) {
          expect(ids.has(e.source)).toBe(true);
          expect(ids.has(e.target)).toBe(true);
        }
      });

      it("첫 노드는 trigger, running 노드는 정확히 1개이고 마지막(나가는 엣지 없음)이다", () => {
        const { nodes, edges } = PRESETS[key];
        expect(nodes[0].data.kind).toBe("trigger");
        const running = nodes.filter((n) => n.data.kind === "running");
        expect(running).toHaveLength(1);
        const outgoing = edges.filter((e) => e.source === running[0].id);
        expect(outgoing).toHaveLength(0);
      });

      it("모든 노드에 label과 detail 설명이 있다", () => {
        for (const n of PRESETS[key].nodes) {
          expect(n.data.label.length).toBeGreaterThan(0);
          expect(n.data.detail.length).toBeGreaterThan(10);
        }
      });
    });
  }
});
