"use server";

import { requireStaff } from "@/lib/guard";
import { revalidatePath } from "next/cache";
import { localizeProjectPhases } from "@/lib/ai-localize";

// staff가 프로젝트 페이지에서 "AI 고객요약 생성/갱신"을 누르면 실행. 코어는 lib/ai-localize.
export async function localizePhases(projectId: number): Promise<{ ok: boolean; count: number; error?: string }> {
  await requireStaff();
  const res = await localizeProjectPhases(projectId);
  if (res.ok) revalidatePath(`/p/${projectId}`);
  return res;
}
