import { getDb } from "@/lib/db";

// 고객 공유 뷰 전용 조회 — 인증 없이 share_token만으로 프로젝트를 찾는다.
export interface SharedProject {
  id: number;
  name: string;
  client_name: string | null;
  status: string;
}

export async function getProjectByToken(token: string): Promise<SharedProject | null> {
  if (!token) return null;
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT id, name, client_name, status FROM projects WHERE share_token = $1",
    [token]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: Number(row.id),
    name: String(row.name),
    client_name: row.client_name == null ? null : String(row.client_name),
    status: String(row.status),
  };
}
