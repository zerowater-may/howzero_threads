import { getDb } from "@/lib/db";

// 프로젝트 진행 단계(타임라인/간트 원천). 개발 플랜의 단계별 진행률.
export interface Phase {
  id: number;
  company_id: number | null;
  project_id: number | null;
  seq: number;
  name: string;
  deliverable: string | null;
  detail: string | null;
  tasks_total: number;
  tasks_done: number;
  status: "todo" | "active" | "done";
  progress: number; // 0~100
  start_at: string | null;
  target_at: string | null;
  summary_client: string | null;
  client_lang: string | null;
}

export interface TimelineRollup {
  phases: Phase[];
  totalTasks: number;
  doneTasks: number;
  progress: number; // 전체 %
  currentPhase: Phase | null; // 진행 중(active) 중 seq가 가장 앞
}

function toPhase(r: Record<string, unknown>): Phase {
  const total = Number(r.tasks_total ?? 0);
  const done = Number(r.tasks_done ?? 0);
  const status = done <= 0 ? "todo" : done >= total ? "done" : "active";
  const progress = total > 0 ? Math.round((done / total) * 100) : status === "done" ? 100 : 0;
  return {
    id: Number(r.id),
    company_id: r.company_id == null ? null : Number(r.company_id),
    project_id: r.project_id == null ? null : Number(r.project_id),
    seq: Number(r.seq ?? 0),
    name: String(r.name ?? ""),
    deliverable: r.deliverable == null ? null : String(r.deliverable),
    detail: r.detail == null ? null : String(r.detail),
    tasks_total: total,
    tasks_done: done,
    status,
    progress,
    start_at: r.start_at == null ? null : String(r.start_at).slice(0, 10),
    target_at: r.target_at == null ? null : String(r.target_at).slice(0, 10),
    summary_client: r.summary_client == null ? null : String(r.summary_client),
    client_lang: r.client_lang == null ? null : String(r.client_lang),
  };
}

function rollup(phases: Phase[]): TimelineRollup {
  const totalTasks = phases.reduce((s, p) => s + p.tasks_total, 0);
  const doneTasks = phases.reduce((s, p) => s + p.tasks_done, 0);
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const currentPhase = phases.filter((p) => p.status === "active").sort((a, b) => a.seq - b.seq)[0] ?? null;
  return { phases, totalTasks, doneTasks, progress, currentPhase };
}

export async function getPhases(projectId: number): Promise<TimelineRollup> {
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT * FROM phases WHERE project_id = $1 ORDER BY seq ASC",
    [projectId]
  );
  return rollup(rows.map(toPhase));
}

export async function getPhasesByCompany(companyId: number): Promise<TimelineRollup> {
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT * FROM phases WHERE company_id = $1 ORDER BY seq ASC",
    [companyId]
  );
  return rollup(rows.map(toPhase));
}
