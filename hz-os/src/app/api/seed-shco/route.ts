import { getDb } from "@/lib/db";
import { newShareToken } from "@/lib/auth";
import { localizeProjectPhases } from "@/lib/ai-localize";
import { syncPhasesFromGithub } from "@/lib/github-sync";
import { timingSafeEqual } from "crypto";

// SHCO 코스 플랫폼 프로젝트를 hz-os에 시드(멱등). 진행률은 shco/admin의 superpowers 플랜 체크박스 기준.
// PGlite 단일 라이터라 실행 중 서버가 DB를 소유 → 로컬/프로덕션 각각 이 route를 1회 호출해 시드한다.

function authorized(req: Request): boolean {
  const secret = process.env.HZOS_MCP_SECRET || process.env.HZOS_INBOUND_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

// 원문(개발 플랜 그대로). detail = 단계 태스크 목록. 진행률은 각 서브플랜 체크박스 done/total.
const PHASES = [
  {
    seq: 1,
    name: "Phase 1 · Foundation (호스트 분리·스키마·세션)",
    deliverable: "Host separation, schema, migrations, sessions, shared test harness",
    done: 41,
    total: 44,
    detail:
      "Host-classification tests and host rewrites; platform SQL schema + idempotent migration runner; typed platform DB helpers (legacy public tables untouched); revocable hashed DB sessions replacing reusable admin HMAC token; structured env validation (build/test/prod); unit tests + touched-file lint + production build.",
  },
  {
    seq: 2,
    name: "Phase 2 · 공개 프론트엔드 · 블루프린트",
    deliverable: "Permanent blueprint plus responsive public frontend using all supplied assets",
    done: 63,
    total: 67,
    detail:
      "Planning atlas → permanent /blueprint admin page; extract/normalize/optimize/manifest 76 PNGs; map every manifest ID to a visible public render consumer (76/76); course/instructor/site-copy content modules (no fabricated prices); bootstrap 10 course groups as truthful drafts; Pretendard Variable + license + system-font fallback; public shell + home in SHCO/Toss direction; free/regular/instructor/story/about/legal routes; modal/bottom-sheet/loading/empty/error/404 states; seven numeric 301 redirects; first-touch UTM/referrer + gated GA4/Clarity behind consent.",
  },
  {
    seq: 3,
    name: "Phase 3 · Kakao 회원 · 무료 신청",
    deliverable: "Kakao-only signup and all three free-application session flows",
    done: 50,
    total: 75,
    detail:
      "One-time conversion intents + safe return-path; Kakao OAuth start/callback/profile/terms/failure; name+phone fallback (E.164, no SMS verify); public member sessions + logout; guest/active/expired free-application flows; secure completion receipts for /30; verify duplicate application creation + notification dedupe inputs.",
  },
  {
    seq: 4,
    name: "Phase 4 · Toss 결제 · 수강 등록",
    deliverable: "Toss checkout, approval, webhook reconciliation, enrollment, refund state",
    done: 11,
    total: 39,
    detail:
      "Server-owned pending orders + immutable Toss order IDs; Toss payment window client boundary; amount-checked server approval + idempotent enrollment; webhook transmission IDs + reconcile by official API; partial/full cancellation transitions; secure payment completion receipts (no access URLs); verify approval retry, tampered amount, duplicate webhook, cancellation.",
  },
  {
    seq: 5,
    name: "Phase 5 · 알림 (Solapi)",
    deliverable: "Completion and reminder scheduling, retry, dedupe, SMS fallback",
    done: 0,
    total: 59,
    detail:
      "Completion + D-2/D-1/D-day jobs transactionally; skip past reminders + recalc after schedule change; Solapi Alimtalk via student-only Kakao profile; retry transient x3, stop permanent; SMS/long-SMS fallback by length; store every attempt + manual resend; verify dedupe across repeated applications.",
  },
  {
    seq: 6,
    name: "Phase 6 · 어드민 운영",
    deliverable: "Platform operations pages on admin.shco.co.kr",
    done: 0,
    total: 33,
    detail:
      "Public-platform summary cards (legacy dashboard intact); course/session publishing, schedule, access URL, sale status; applicant/member/order/enrollment/agreement views; notification queue/failure/resend controls; review moderation + legacy account linking; redacted admin audit logs; verify mobile/desktop admin states.",
  },
  {
    seq: 7,
    name: "Phase 7 · 마이그레이션 · 컷오버",
    deliverable: "Asset, review, legacy data import and old automation retirement",
    done: 0,
    total: 35,
    detail:
      "Deterministic Imweb review importer (dry-run + idempotent); preserve review media originals w/ checksum before apply; 006_import_archive.sql + immutable archive tables via snapshot; member/free-application/paid-order import w/ explicit course maps; dry-run/full/final-delta w/ conflict+count reports; legacy vs platform aggregate comparison; Make/GAS/Sheets/Cloudflare shutdown order; legacy read-only 7 days; verify counts/images/dates/redirects/rollback.",
  },
  {
    seq: 8,
    name: "Phase 8 · 통합 · 런칭",
    deliverable: "End-to-end, accessibility, security, performance, and launch verification",
    done: 0,
    total: 36,
    detail:
      "Recursive nested Node unit test discovery; E2E truncation guard (allowlisted TEST_DATABASE_URL); full test suite + touched-file lint; production build w/ test adapters; free+paid happy paths + every failure recovery; keyboard/focus/labels/contrast/reduced-motion/mobile sheets; no access-URL/token/phone/secret/key leaks; image LCP/CLS + route metadata; analytics consent + 5 events + attribution + 7 redirects + 76 asset consumers + catalog bootstrap; production credentials/provider approvals; launch + rollback checklist.",
  },
];

export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const db = await getDb();

    // 1) 회사 SHCO (멱등)
    const found = await db.query("SELECT id, client_token FROM companies WHERE name = $1 LIMIT 1", ["SHCO"]);
    let companyId: number;
    if (found.rows[0]) {
      companyId = Number(found.rows[0].id);
      if (!found.rows[0].client_token) {
        await db.query("UPDATE companies SET client_token = $1, client_lang = COALESCE(client_lang,'ko') WHERE id = $2", [newShareToken(), companyId]);
      }
    } else {
      const ins = await db.query(
        "INSERT INTO companies (name, industry, size, client_token, client_lang) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        ["SHCO", "온라인 교육", "코스 플랫폼", newShareToken(), "ko"]
      );
      companyId = Number(ins.rows[0].id);
    }

    // 2) 프로젝트 (멱등)
    const proj = await db.query(
      "SELECT id FROM projects WHERE company_id = $1 AND name = $2 LIMIT 1",
      [companyId, "SHCO 코스 플랫폼 리뉴얼"]
    );
    let projectId: number;
    if (proj.rows[0]) {
      projectId = Number(proj.rows[0].id);
    } else {
      const insP = await db.query(
        "INSERT INTO projects (name, client_name, status, company_id, share_token) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        ["SHCO 코스 플랫폼 리뉴얼", "SHCO", "구축", companyId, newShareToken()]
      );
      projectId = Number(insP.rows[0].id);
    }

    // 3) 단계 upsert by (project_id, seq) — 진행률/원문만 갱신, summary_client(AI 캐시)는 보존
    let inserted = 0;
    let updated = 0;
    for (const p of PHASES) {
      const status = p.done <= 0 ? "todo" : p.done >= p.total ? "done" : "active";
      const ex = await db.query("SELECT id FROM phases WHERE project_id = $1 AND seq = $2 LIMIT 1", [projectId, p.seq]);
      if (ex.rows[0]) {
        await db.query(
          "UPDATE phases SET name=$1, deliverable=$2, detail=$3, tasks_total=$4, tasks_done=$5, status=$6, company_id=$7, updated_at=now() WHERE id=$8",
          [p.name, p.deliverable, p.detail, p.total, p.done, status, companyId, Number(ex.rows[0].id)]
        );
        updated++;
      } else {
        await db.query(
          "INSERT INTO phases (company_id, project_id, seq, name, deliverable, detail, tasks_total, tasks_done, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
          [companyId, projectId, p.seq, p.name, p.deliverable, p.detail, p.total, p.done, status]
        );
        inserted++;
      }
    }

    const sp = new URL(req.url).searchParams;

    // ?source=github 이면 하드코딩 카운트 대신 레포 플랜 체크박스로 진행률 라이브 동기화.
    let github: { ok: boolean; updated: number; error?: string } | undefined;
    if (sp.get("source") === "github") {
      github = await syncPhasesFromGithub(projectId);
    }

    // ?localize=1 이면 AI 고객언어 요약도 한 번에 생성 (프로덕션 1회 curl로 완결).
    let localize: { ok: boolean; count: number; error?: string } | undefined;
    if (sp.get("localize") === "1") {
      localize = await localizeProjectPhases(projectId);
    }

    const tok = await db.query("SELECT client_token FROM companies WHERE id = $1", [companyId]);
    return Response.json({
      ok: true,
      companyId,
      projectId,
      phases: { inserted, updated },
      github,
      localize,
      clientPortal: `/client/${tok.rows[0]?.client_token ?? ""}`,
      staffProject: `/p/${projectId}`,
    });
  } catch (e) {
    console.error("[seed-shco]", e);
    return Response.json({ error: "seed_failed", detail: String(e) }, { status: 500 });
  }
}
