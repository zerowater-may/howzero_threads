"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { complete } from "@/lib/openrouter";
import { mdContent } from "@/lib/doc-content";
import { ANALYSIS_SYSTEM_PROMPT, buildMeetingMarkdown, parseAnalysis, type NeedItem } from "@/lib/meeting-analysis";

export async function createMeeting(
  projectId: number,
  title: string,
  heldAt: string,
  transcript: string
): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(
    "INSERT INTO meetings (project_id, title, held_at, transcript) VALUES ($1, $2, $3, $4) RETURNING id",
    [projectId, title.trim() || "제목 없음", heldAt || null, transcript.trim()]
  );
  revalidatePath(`/p/${projectId}`);
  redirect(`/p/${projectId}/meetings/${rows[0].id}`);
}

export async function analyzeMeeting(meetingId: number): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT project_id, transcript FROM meetings WHERE id = $1",
    [meetingId]
  );
  const meeting = rows[0];
  if (!meeting) throw new Error("미팅을 찾을 수 없습니다");
  const transcript = String(meeting.transcript || "").trim();
  if (!transcript) throw new Error("전사 내용이 없어 분석할 수 없습니다");

  const raw = await complete(ANALYSIS_SYSTEM_PROMPT, transcript);
  const { summary, needs } = parseAnalysis(raw);

  await db.query("UPDATE meetings SET summary = $1, needs = $2 WHERE id = $3", [
    summary,
    needs,
    meetingId,
  ]);
  revalidatePath(`/p/${meeting.project_id}/meetings/${meetingId}`);
  revalidatePath(`/p/${meeting.project_id}`);
}

// 분석된 요약+니즈를 마크다운 문서로 조립해 documents에 저장한다. 새 문서 id를 반환한다.
export async function meetingToDocument(meetingId: number): Promise<number> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT project_id, title, summary, needs FROM meetings WHERE id = $1",
    [meetingId]
  );
  const meeting = rows[0];
  if (!meeting) throw new Error("미팅을 찾을 수 없습니다");
  if (!meeting.summary) throw new Error("먼저 AI 분석을 실행하세요");

  const title = String(meeting.title);
  const needs = (meeting.needs as NeedItem[] | null) ?? [];
  const md = buildMeetingMarkdown(String(meeting.summary), needs);

  const { rows: docRows } = await db.query(
    "INSERT INTO documents (project_id, title, content, visibility) VALUES ($1, $2, $3, 'internal') RETURNING id",
    [meeting.project_id, `미팅 요약 — ${title}`, mdContent(md)]
  );
  revalidatePath(`/p/${meeting.project_id}/docs`);
  return Number(docRows[0].id);
}
