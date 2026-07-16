"use server";

import { revalidatePath } from "next/cache";
import type { Db } from "@/lib/db";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { logActivity } from "@/lib/activity";
import type { NeedItem } from "@/lib/meeting-analysis";

// 엔티티 INSERT + create 활동 기록. createObject·automate·import가 공유하는 내부 헬퍼.
async function insertObject(
  db: Db,
  companyId: number,
  type: string,
  label: string,
  props: Record<string, unknown> | null
): Promise<number> {
  const { rows } = await db.query(
    "INSERT INTO objects (company_id, type, label, props) VALUES ($1, $2, $3, $4::jsonb) RETURNING id",
    [companyId, type, label, props ? JSON.stringify(props) : null]
  );
  const id = Number(rows[0].id);
  await logActivity(db, { companyId, objectType: "object", objectId: id, verb: "create", payload: { type, label } });
  return id;
}

export async function createObject(
  companyId: number,
  type: string,
  label: string,
  props?: Record<string, unknown>
): Promise<number> {
  await requireStaff();
  const db = await getDb();
  const id = await insertObject(db, companyId, type, label.trim() || "이름 없음", props ?? null);
  revalidatePath(`/c/${companyId}`);
  return id;
}

export async function updateObjectState(objectId: number, state: string): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query("SELECT company_id, state FROM objects WHERE id = $1", [objectId]);
  if (rows.length === 0) return;
  const companyId = Number(rows[0].company_id);
  const from = rows[0].state ? String(rows[0].state) : null;
  if (from === state) return;
  await db.query("UPDATE objects SET state = $1 WHERE id = $2", [state, objectId]);
  await logActivity(db, {
    companyId,
    objectType: "object",
    objectId,
    verb: "state_change",
    fromState: from,
    toState: state,
  });
  revalidatePath(`/c/${companyId}`);
}

export async function linkObjects(
  companyId: number,
  srcId: number,
  dstId: number,
  relType: string,
  props?: Record<string, unknown>
): Promise<number> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(
    "INSERT INTO edges (company_id, src_id, dst_id, rel_type, props) VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING id",
    [companyId, srcId, dstId, relType, props ? JSON.stringify(props) : null]
  );
  const id = Number(rows[0].id);
  await logActivity(db, { companyId, objectType: "edge", objectId: id, verb: "link", payload: { srcId, dstId, relType } });
  revalidatePath(`/c/${companyId}`);
  return id;
}

export async function deleteObject(objectId: number): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query("SELECT company_id FROM objects WHERE id = $1", [objectId]);
  if (rows.length === 0) return;
  const companyId = Number(rows[0].company_id);
  await db.query("DELETE FROM edges WHERE src_id = $1 OR dst_id = $1", [objectId]);
  await db.query("DELETE FROM objects WHERE id = $1", [objectId]);
  await logActivity(db, { companyId, objectType: "object", objectId, verb: "delete" });
  revalidatePath(`/c/${companyId}`);
}

// 병목을 자동화한다: automation 엔티티 생성 + (automation)-replaces->(bottleneck) 엣지 + 병목 상태 전이.
export async function automateBottleneck(companyId: number, bottleneckId: number): Promise<number | null> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query("SELECT label FROM objects WHERE id = $1 AND company_id = $2", [bottleneckId, companyId]);
  if (rows.length === 0) return null;
  const autoId = await insertObject(db, companyId, "automation", `자동화: ${String(rows[0].label)}`, {
    for_bottleneck: bottleneckId,
  });
  await db.query("INSERT INTO edges (company_id, src_id, dst_id, rel_type) VALUES ($1, $2, $3, 'replaces')", [
    companyId,
    autoId,
    bottleneckId,
  ]);
  await db.query("UPDATE objects SET state = 'automating' WHERE id = $1", [bottleneckId]);
  await logActivity(db, {
    companyId,
    objectType: "edge",
    objectId: autoId,
    verb: "link",
    payload: { relType: "replaces", dstId: bottleneckId },
  });
  revalidatePath(`/c/${companyId}`);
  return autoId;
}

// 미팅 needs(JSONB)를 고객사의 병목 엔티티로 가져온다. company_id는 meeting→project→company로 해석.
// 같은 미팅에서 이미 가져온 need(props.meeting_id + props.need)는 중복 생성하지 않는다.
export async function importNeedsFromMeeting(
  meetingId: number
): Promise<{ companyId: number; imported: number }> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT m.needs AS needs, p.company_id AS company_id
     FROM meetings m JOIN projects p ON p.id = m.project_id
     WHERE m.id = $1`,
    [meetingId]
  );
  if (rows.length === 0) throw new Error("미팅을 찾을 수 없습니다");
  const companyId = rows[0].company_id ? Number(rows[0].company_id) : null;
  if (!companyId) {
    throw new Error("이 미팅의 프로젝트에 연결된 고객사가 없습니다. 먼저 딜/프로젝트를 고객사에 연결하세요.");
  }
  const needs = (rows[0].needs as NeedItem[] | null) ?? [];

  const existing = await db.query(
    "SELECT props->>'need' AS need FROM objects WHERE company_id = $1 AND type = 'bottleneck' AND props->>'meeting_id' = $2",
    [companyId, String(meetingId)]
  );
  const seen = new Set(existing.rows.map((r) => String(r.need)));

  let imported = 0;
  for (const n of needs) {
    if (!n || !n.need || seen.has(n.need)) continue;
    await insertObject(db, companyId, "bottleneck", n.need, {
      meeting_id: meetingId,
      need: n.need,
      context: n.context ?? "",
      priority: n.priority ?? "중간",
    });
    seen.add(n.need);
    imported++;
  }

  revalidatePath(`/c/${companyId}`);
  return { companyId, imported };
}
