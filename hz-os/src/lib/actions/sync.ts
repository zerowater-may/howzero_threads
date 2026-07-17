"use server";

import { requireStaff } from "@/lib/guard";
import { revalidatePath } from "next/cache";
import { syncPhasesFromGithub } from "@/lib/github-sync";

// staff가 "GitHub 진행 동기화"를 누르면 레포 플랜 체크박스로 진행률 갱신.
export async function syncFromGithub(projectId: number): Promise<{ ok: boolean; updated: number; error?: string }> {
  await requireStaff();
  const res = await syncPhasesFromGithub(projectId);
  if (res.ok) revalidatePath(`/p/${projectId}`);
  return res;
}
