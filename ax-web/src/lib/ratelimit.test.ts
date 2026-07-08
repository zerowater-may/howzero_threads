import { describe, expect, it } from "vitest";
import { rateLimit } from "./ratelimit";

describe("rateLimit", () => {
  it("allows up to limit within window, then blocks", () => {
    const key = `t1:${Math.random()}`;
    for (let i = 0; i < 5; i++) expect(rateLimit(key, 5)).toBe(true);
    expect(rateLimit(key, 5)).toBe(false);
  });

  it("resets after window expires", () => {
    const key = `t2:${Math.random()}`;
    expect(rateLimit(key, 1, -1)).toBe(true); // 즉시 만료되는 창
    expect(rateLimit(key, 1, -1)).toBe(true); // 새 창으로 리셋
  });

  it("isolates keys", () => {
    const a = `t3a:${Math.random()}`;
    const b = `t3b:${Math.random()}`;
    expect(rateLimit(a, 1)).toBe(true);
    expect(rateLimit(a, 1)).toBe(false);
    expect(rateLimit(b, 1)).toBe(true);
  });
});
