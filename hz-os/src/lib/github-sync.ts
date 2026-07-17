import { getDb } from "@/lib/db";

// hz-os 타임라인 진행률을 GitHub 레포의 superpowers 플랜 체크박스에서 라이브 동기화.
// "그 방식으로 이어지도록" — 하드코딩 스냅샷 대신 레포가 진짜 원천.
// ponytail: shco 전용 매핑(파일명→seq). 다른 고객사는 projects.github_repo + 매핑 확장 시 일반화.

const SHCO_REPO = "hedgehogcandy/shco-admin";
const PLANS_DIR = "docs/superpowers/plans";

// seq → 플랜 파일명 (master 'Plan set' 순서)
const SEQ_FILE: Record<number, string> = {
  1: "2026-07-17-shco-foundation-data-hosts.md",
  2: "2026-07-17-shco-public-frontend-wireframes.md",
  3: "2026-07-17-shco-kakao-free-applications.md",
  4: "2026-07-17-shco-toss-payments-enrollments.md",
  5: "2026-07-17-shco-notifications-solapi.md",
  6: "2026-07-17-shco-admin-operations.md",
  7: "2026-07-17-shco-migration-cutover.md",
  8: "2026-07-17-shco-integration-launch.md",
};

function countCheckboxes(md: string): { done: number; total: number } {
  const done = (md.match(/^\s*-\s*\[[xX]\]/gm) || []).length;
  const todo = (md.match(/^\s*-\s*\[ \]/gm) || []).length;
  return { done, total: done + todo };
}

async function fetchPlan(repo: string, file: string, token: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${repo}/contents/${PLANS_DIR}/${file}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.raw+json",
      "User-Agent": "hz-os",
    },
  });
  if (!res.ok) return null;
  return res.text();
}

// 프로젝트의 phases 진행률을 GitHub 플랜 체크박스로 갱신. summary_client(AI 캐시)는 건드리지 않는다.
export async function syncPhasesFromGithub(
  projectId: number,
  repo: string = SHCO_REPO
): Promise<{ ok: boolean; updated: number; error?: string }> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { ok: false, updated: 0, error: "GITHUB_TOKEN env가 없습니다" };

  const db = await getDb();
  const { rows } = await db.query("SELECT id, seq FROM phases WHERE project_id = $1 ORDER BY seq ASC", [projectId]);
  if (rows.length === 0) return { ok: false, updated: 0, error: "단계가 없습니다. 먼저 시드하세요." };

  let updated = 0;
  try {
    for (const r of rows) {
      const seq = Number(r.seq);
      const file = SEQ_FILE[seq];
      if (!file) continue;
      const md = await fetchPlan(repo, file, token);
      if (md == null) continue;
      const { done, total } = countCheckboxes(md);
      if (total === 0) continue;
      const status = done <= 0 ? "todo" : done >= total ? "done" : "active";
      await db.query("UPDATE phases SET tasks_done = $1, tasks_total = $2, status = $3, updated_at = now() WHERE id = $4", [
        done,
        total,
        status,
        Number(r.id),
      ]);
      updated++;
    }
  } catch (e) {
    return { ok: false, updated, error: String(e).slice(0, 300) };
  }
  return { ok: true, updated };
}
