import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { PGlite } from "@electric-sql/pglite";
import type { Db } from "./db";
import { runBackfill, ensureCompany } from "./migrate";

async function freshDb(): Promise<Db> {
  const lite = new PGlite(); // in-memory
  await lite.exec(readFileSync(join(process.cwd(), "sql/schema.sql"), "utf8"));
  return {
    query: async (q, params = []) => (await lite.query(q, params as unknown[])) as { rows: Record<string, unknown>[] },
    exec: (q) => lite.exec(q),
  };
}

describe("runBackfill", () => {
  it("멱등: 두 번 돌려도 회사가 중복 생성되지 않고 company_id가 연결된다", async () => {
    const db = await freshDb();
    // 같은 회사명을 쓰는 프로젝트 + 리드
    await db.query("INSERT INTO projects (name, client_name) VALUES ($1, $2)", ["왕십리 OS", "왕십리상사"]);
    await db.query("INSERT INTO leads (source, name, company) VALUES ('landing', '김대표', $1)", ["왕십리상사"]);
    await db.query("INSERT INTO leads (source, name, company) VALUES ('landing', '박대표', $1)", ["다른회사"]);

    await runBackfill(db);
    await runBackfill(db); // 두 번째 호출은 no-op이어야 한다

    // 회사는 이름당 하나만
    const companies = await db.query("SELECT name FROM companies ORDER BY name");
    expect(companies.rows.map((r) => r.name)).toEqual(["다른회사", "왕십리상사"]);

    // 프로젝트/리드 모두 같은 왕십리상사 company_id로 연결
    const wang = await db.query("SELECT id FROM companies WHERE name = '왕십리상사'");
    const wangId = Number(wang.rows[0].id);
    const proj = await db.query("SELECT company_id FROM projects WHERE client_name = '왕십리상사'");
    const lead = await db.query("SELECT company_id FROM leads WHERE company = '왕십리상사'");
    expect(Number(proj.rows[0].company_id)).toBe(wangId);
    expect(Number(lead.rows[0].company_id)).toBe(wangId);
  });

  it("ensureCompany는 이름 기준으로 dedup한다", async () => {
    const db = await freshDb();
    const a = await ensureCompany(db, "테스트컴퍼니");
    const b = await ensureCompany(db, "테스트컴퍼니");
    expect(a).toBe(b);
    const count = await db.query("SELECT count(*)::int AS n FROM companies");
    expect(Number(count.rows[0].n)).toBe(1);
  });
});
