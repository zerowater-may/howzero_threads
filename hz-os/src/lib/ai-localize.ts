import { getDb } from "@/lib/db";
import { complete } from "@/lib/openrouter";

// 단계 원문(개발 용어) → 고객사 언어의 plain business 진행 요약. phases.summary_client에 캐시.
// 인증 없는 코어 — 서버 액션(requireStaff)과 시드 route(Bearer)가 공유.

const LANG_LABEL: Record<string, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};

function systemPrompt(langLabel: string): string {
  return [
    `You write progress updates for a NON-technical client executive in ${langLabel}.`,
    "Rules:",
    "- Remove all developer jargon (no OAuth, webhook, schema, migration, idempotent, HMAC, etc.). Translate into plain business outcomes.",
    "- 2-3 sentences. Say what this stage delivers for their business, and its current status (in progress / almost done / not started).",
    `- Write ONLY in ${langLabel}. No preamble, no markdown headers. Return just the summary text.`,
  ].join("\n");
}

function userPrompt(name: string, deliverable: string, detail: string, progress: number, status: string): string {
  return [
    `Stage: ${name}`,
    `Deliverable (technical): ${deliverable}`,
    `Tasks (technical): ${detail}`,
    `Progress: ${progress}% (${status})`,
    "",
    "Write the client-facing progress summary now.",
  ].join("\n");
}

export async function localizeProjectPhases(projectId: number): Promise<{ ok: boolean; count: number; error?: string }> {
  const db = await getDb();

  const comp = await db.query(
    "SELECT c.client_lang FROM projects p LEFT JOIN companies c ON c.id = p.company_id WHERE p.id = $1",
    [projectId]
  );
  const lang = String(comp.rows[0]?.client_lang || "ko");
  const langLabel = LANG_LABEL[lang] || lang;

  const { rows } = await db.query("SELECT * FROM phases WHERE project_id = $1 ORDER BY seq ASC", [projectId]);
  if (rows.length === 0) return { ok: false, count: 0, error: "단계가 없습니다. 먼저 프로젝트를 시드하세요." };

  const sys = systemPrompt(langLabel);
  try {
    const results = await Promise.all(
      rows.map(async (r) => {
        const total = Number(r.tasks_total ?? 0);
        const done = Number(r.tasks_done ?? 0);
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        const status = done <= 0 ? "not started" : done >= total ? "almost done" : "in progress";
        const summary = await complete(
          sys,
          userPrompt(String(r.name ?? ""), String(r.deliverable ?? ""), String(r.detail ?? ""), progress, status)
        );
        return { id: Number(r.id), summary: summary.trim() };
      })
    );
    for (const res of results) {
      await db.query("UPDATE phases SET summary_client = $1, client_lang = $2, updated_at = now() WHERE id = $3", [
        res.summary,
        lang,
        res.id,
      ]);
    }
    return { ok: true, count: results.length };
  } catch (e) {
    return { ok: false, count: 0, error: String(e).slice(0, 300) };
  }
}
