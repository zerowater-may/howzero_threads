"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { newShareToken } from "@/lib/auth";

export async function createProject(name: string, clientName: string): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(
    "INSERT INTO projects (name, client_name) VALUES ($1, $2) RETURNING id",
    [name, clientName || null]
  );
  revalidatePath("/");
  redirect(`/p/${rows[0].id}`);
}

export async function updateStatus(id: number, status: string): Promise<void> {
  await requireStaff();
  const db = await getDb();
  await db.query("UPDATE projects SET status = $1 WHERE id = $2", [status, id]);
  revalidatePath(`/p/${id}`);
  revalidatePath("/");
}

export async function regenerateShareToken(id: number): Promise<void> {
  await requireStaff();
  const db = await getDb();
  await db.query("UPDATE projects SET share_token = $1 WHERE id = $2", [newShareToken(), id]);
  revalidatePath(`/p/${id}`);
}

export async function addUpdate(projectId: number, kind: string, body: string): Promise<void> {
  await requireStaff();
  if (!body.trim()) return;
  const db = await getDb();
  await db.query(
    "INSERT INTO updates (project_id, kind, body, author_role) VALUES ($1, $2, $3, 'staff')",
    [projectId, kind, body.trim()]
  );
  revalidatePath(`/p/${projectId}`);
}

export async function addComment(
  projectId: number,
  targetType: string,
  targetId: number,
  body: string
): Promise<void> {
  await requireStaff();
  if (!body.trim()) return;
  const db = await getDb();
  await db.query(
    "INSERT INTO comments (project_id, target_type, target_id, author_role, body) VALUES ($1, $2, $3, 'staff', $4)",
    [projectId, targetType, targetId, body.trim()]
  );
  revalidatePath(`/p/${projectId}`);
}
