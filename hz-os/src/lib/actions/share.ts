"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getProjectByToken } from "@/lib/share";

// 고객 공유 뷰 전용 서버 액션. requireStaff 호출 금지 — share_token 자체가 인가 수단이다.
// 둘 다 token으로 프로젝트를 먼저 검증하고, target이 그 프로젝트 소속인지 확인한 뒤에만 쓴다.

export async function clientAddUpdate(token: string, body: string, authorName: string): Promise<void> {
  const project = await getProjectByToken(token);
  if (!project) return;
  const clean = body.trim();
  if (!clean) return;

  const db = await getDb();
  await db.query(
    "INSERT INTO updates (project_id, kind, body, author_role, author_name) VALUES ($1, 'ask', $2, 'client', $3)",
    [project.id, clean, authorName.trim() || null]
  );
  revalidatePath(`/share/${token}`);
}

export async function clientAddComment(
  token: string,
  targetType: string,
  targetId: number,
  body: string,
  authorName: string
): Promise<void> {
  const project = await getProjectByToken(token);
  if (!project) return;
  const clean = body.trim();
  if (!clean) return;
  if (targetType !== "document") return; // shared 문서에만 코멘트 허용

  const db = await getDb();
  const { rows } = await db.query(
    "SELECT id FROM documents WHERE id = $1 AND project_id = $2 AND visibility = 'shared'",
    [targetId, project.id]
  );
  if (!rows[0]) return; // target이 이 프로젝트 소속 shared 문서가 아니면 무시

  await db.query(
    "INSERT INTO comments (project_id, target_type, target_id, author_role, author_name, body) VALUES ($1, $2, $3, 'client', $4, $5)",
    [project.id, targetType, targetId, authorName.trim() || null, clean]
  );
  revalidatePath(`/share/${token}/docs/${targetId}`);
}
