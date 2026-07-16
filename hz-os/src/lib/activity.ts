import type { Db } from "@/lib/db";

export interface ActivityInput {
  companyId?: number | null;
  objectType: string;
  objectId: number;
  actor?: string;
  verb: string;
  fromState?: string | null;
  toState?: string | null;
  payload?: unknown;
}

// append-only 활동 로그 기록. 상태 전이·전환 이벤트의 단일 기록 지점.
export async function logActivity(db: Db, a: ActivityInput): Promise<void> {
  await db.query(
    `INSERT INTO activity_log (company_id, object_type, object_id, actor, verb, from_state, to_state, payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
    [
      a.companyId ?? null,
      a.objectType,
      a.objectId,
      a.actor ?? "staff",
      a.verb,
      a.fromState ?? null,
      a.toState ?? null,
      a.payload != null ? JSON.stringify(a.payload) : null,
    ]
  );
}
