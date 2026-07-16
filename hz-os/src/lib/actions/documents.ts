"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";

// content 저장 포맷: {format:'md', text}. Plate 폴백으로 마크다운 에디터를 채택.
function mdContent(text: string) {
  return { format: "md", text };
}

function currentText(content: unknown): string {
  if (content && typeof content === "object" && "text" in content) {
    return String((content as { text?: unknown }).text ?? "");
  }
  return "";
}

export async function createDocument(projectId: number, parentId?: number): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(
    "INSERT INTO documents (project_id, parent_id, content) VALUES ($1, $2, $3) RETURNING id",
    [projectId, parentId ?? null, mdContent("")]
  );
  revalidatePath(`/p/${projectId}/docs`);
  redirect(`/p/${projectId}/docs/${rows[0].id}`);
}

export async function renameDocument(id: number, title: string): Promise<void> {
  await requireStaff();
  const clean = title.trim() || "제목 없음";
  const db = await getDb();
  const { rows } = await db.query(
    "UPDATE documents SET title = $1, updated_at = now() WHERE id = $2 RETURNING project_id",
    [clean, id]
  );
  if (rows[0]) revalidatePath(`/p/${rows[0].project_id}/docs`);
}

// 내용 저장 + 직전 content와 다르면 doc_versions에 스냅샷 INSERT.
export async function saveDocument(id: number, text: string): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT project_id, content FROM documents WHERE id = $1",
    [id]
  );
  if (!rows[0]) return;
  const projectId = rows[0].project_id;
  if (currentText(rows[0].content) === text) return; // 변경 없음 → 스킵

  const content = mdContent(text);
  await db.query("UPDATE documents SET content = $1, updated_at = now() WHERE id = $2", [content, id]);
  await db.query("INSERT INTO doc_versions (document_id, content) VALUES ($1, $2)", [id, content]);
  revalidatePath(`/p/${projectId}/docs/${id}`);
}

export async function setVisibility(id: number, visibility: string): Promise<void> {
  await requireStaff();
  if (visibility !== "internal" && visibility !== "shared") return;
  const db = await getDb();
  const { rows } = await db.query(
    "UPDATE documents SET visibility = $1, updated_at = now() WHERE id = $2 RETURNING project_id",
    [visibility, id]
  );
  if (rows[0]) {
    revalidatePath(`/p/${rows[0].project_id}/docs`);
    revalidatePath(`/p/${rows[0].project_id}/docs/${id}`);
  }
}

export async function deleteDocument(id: number): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(
    "DELETE FROM documents WHERE id = $1 RETURNING project_id",
    [id]
  );
  const projectId = rows[0]?.project_id;
  revalidatePath(`/p/${projectId}/docs`);
  if (projectId) redirect(`/p/${projectId}/docs`);
}

// 선택한 버전의 content로 되돌린다. 되돌린 상태도 새 스냅샷으로 기록된다.
export async function restoreVersion(docId: number, versionId: number): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT content FROM doc_versions WHERE id = $1 AND document_id = $2",
    [versionId, docId]
  );
  if (!rows[0]) return;
  await saveDocument(docId, currentText(rows[0].content));
}
