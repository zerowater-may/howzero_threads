import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { PGlite } from "@electric-sql/pglite";
import type { Db } from "./db";
import { ensureCompany } from "./migrate";
import { logActivity } from "./activity";

async function freshDb(): Promise<Db> {
  const lite = new PGlite();
  await lite.exec(readFileSync(join(process.cwd(), "sql/schema.sql"), "utf8"));
  return {
    query: async (q, params = []) => (await lite.query(q, params as unknown[])) as { rows: Record<string, unknown>[] },
    exec: (q) => lite.exec(q),
  };
}

// moveDealStage의 DB 시퀀스를 실제 모듈(ensureCompany + logActivity)로 그대로 재현해 검증한다.
async function moveStage(db: Db, leadId: number, stage: string) {
  const { rows } = await db.query("SELECT stage, company_id, company FROM leads WHERE id = $1 AND status <> 'archived'", [leadId]);
  const from = rows[0].stage ? String(rows[0].stage) : null;
  let companyId = rows[0].company_id ? Number(rows[0].company_id) : null;
  if (!companyId && rows[0].company) {
    companyId = await ensureCompany(db, String(rows[0].company));
    await db.query("UPDATE leads SET company_id = $1 WHERE id = $2", [companyId, leadId]);
  }
  await db.query("UPDATE leads SET stage = $1 WHERE id = $2", [stage, leadId]);
  await logActivity(db, {
    companyId,
    objectType: "lead",
    objectId: leadId,
    verb: "stage_change",
    fromState: from,
    toState: stage,
  });
}

describe("deal flow (moveDealStage)", () => {
  it("단계 이동 시 회사 자동생성·연결 + activity_log stage_change 기록", async () => {
    const db = await freshDb();
    await db.query("INSERT INTO leads (source, name, company) VALUES ('landing', '김대표', $1)", ["에이비씨"]);
    const leadRow = await db.query("SELECT id, stage, company_id FROM leads WHERE company = '에이비씨'");
    const leadId = Number(leadRow.rows[0].id);
    // ADD COLUMN DEFAULT 백필 확인 — 신규 stage 기본값
    expect(leadRow.rows[0].stage).toBe("상담신청");
    expect(leadRow.rows[0].company_id).toBeNull();

    await moveStage(db, leadId, "진단");

    // 회사 자동 생성 + 연결
    const lead = await db.query("SELECT stage, company_id FROM leads WHERE id = $1", [leadId]);
    expect(lead.rows[0].stage).toBe("진단");
    const companyId = Number(lead.rows[0].company_id);
    expect(companyId).toBeGreaterThan(0);
    const company = await db.query("SELECT name FROM companies WHERE id = $1", [companyId]);
    expect(company.rows[0].name).toBe("에이비씨");

    // activity_log 기록 — from/to/company_id
    const acts = await db.query("SELECT company_id, object_type, verb, from_state, to_state FROM activity_log WHERE object_id = $1", [leadId]);
    expect(acts.rows).toHaveLength(1);
    expect(acts.rows[0]).toMatchObject({
      object_type: "lead",
      verb: "stage_change",
      from_state: "상담신청",
      to_state: "진단",
    });
    expect(Number(acts.rows[0].company_id)).toBe(companyId);

    // 두 번째 이동 — 이미 연결된 회사 재사용(중복 생성 없음)
    await moveStage(db, leadId, "제안");
    const cnt = await db.query("SELECT count(*)::int AS n FROM companies WHERE name = '에이비씨'");
    expect(Number(cnt.rows[0].n)).toBe(1);
    const acts2 = await db.query("SELECT count(*)::int AS n FROM activity_log WHERE object_id = $1", [leadId]);
    expect(Number(acts2.rows[0].n)).toBe(2);
  });
});
