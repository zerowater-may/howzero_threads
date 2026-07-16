import type { Db } from "@/lib/db";

// 회사명으로 company를 찾고 없으면 만든다. 이름 기준 SELECT를 먼저 해서 중복 생성을 막는다.
export async function ensureCompany(db: Db, name: string): Promise<number> {
  const trimmed = name.trim();
  const found = await db.query("SELECT id FROM companies WHERE name = $1 LIMIT 1", [trimmed]);
  if (found.rows.length > 0) return Number(found.rows[0].id);
  const created = await db.query("INSERT INTO companies (name) VALUES ($1) RETURNING id", [trimmed]);
  return Number(created.rows[0].id);
}

// getDb 스키마 적용 직후 1회 호출. 배포된 실데이터(왕십리 프로젝트·인바운드 리드)를 company 루트로 재배치.
// 멱등: company_id가 이미 있으면 건너뛰고, company는 name 기준으로만 만든다. 여러 번 돌려도 회사가 중복되지 않는다.
export async function runBackfill(db: Db): Promise<void> {
  // (a) client_name 있는 projects → company 생성/연결
  const projects = await db.query(
    "SELECT id, client_name FROM projects WHERE company_id IS NULL AND client_name IS NOT NULL AND client_name <> ''"
  );
  for (const p of projects.rows) {
    const companyId = await ensureCompany(db, String(p.client_name));
    await db.query("UPDATE projects SET company_id = $1 WHERE id = $2", [companyId, p.id]);
  }

  // (b) company(회사명) 있는 leads → company 생성/연결
  const leads = await db.query(
    "SELECT id, company FROM leads WHERE company_id IS NULL AND company IS NOT NULL AND company <> ''"
  );
  for (const l of leads.rows) {
    const companyId = await ensureCompany(db, String(l.company));
    await db.query("UPDATE leads SET company_id = $1 WHERE id = $2", [companyId, l.id]);
  }
}
