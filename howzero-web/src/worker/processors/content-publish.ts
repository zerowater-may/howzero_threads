import { Job } from "bullmq";
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { sql } from "../db";
import type { ContentPublishJobData } from "../../lib/queue/types";
import type { ContentPublishTarget } from "../../schemas/content-publish";

const execFileAsync = promisify(execFile);

export type { ContentPublishTarget };

export function buildZernioArgs(
  bundlePath: string,
  target: ContentPublishTarget
): string[] {
  const base = ["-m", "scripts.zernio_publish", bundlePath];
  if (target === "instagram_reel") {
    return [...base, "--platform", "instagram", "--instagram-media", "reel", "--now"];
  }
  if (target === "instagram_carousel") {
    return [...base, "--platform", "instagram", "--instagram-media", "carousel", "--now"];
  }
  return [...base, "--platform", "threads", "--threads-media", "carousel", "--now"];
}

export function parseZernioPostId(
  output: string
): { postId: string | null; duplicate: boolean } {
  const submitted = output.match(/submitted postId=([A-Za-z0-9_-]+)/);
  if (submitted) return { postId: submitted[1], duplicate: false };

  const duplicate = output.match(/"existingPostId"\s*:\s*"([^"]+)"/);
  if (duplicate) return { postId: duplicate[1], duplicate: true };

  return { postId: null, duplicate: false };
}

function loadEnvFile(filePath = process.env.HOWZERO_ENV_FILE || "/etc/howzero/howzero.env") {
  if (!fs.existsSync(filePath)) return;

  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function contentRoot() {
  return process.env.HOWZERO_CONTENT_ROOT || path.resolve(process.cwd(), "..");
}

async function runZernioPublish(bundlePath: string, target: ContentPublishTarget) {
  loadEnvFile();
  const root = contentRoot();
  const args = buildZernioArgs(bundlePath, target);

  try {
    const { stdout, stderr } = await execFileAsync("python3", args, {
      cwd: root,
      env: process.env,
      timeout: 15 * 60 * 1000,
      maxBuffer: 20 * 1024 * 1024,
    });
    const combined = `${stdout}\n${stderr}`;
    return {
      stdout,
      stderr,
      ...parseZernioPostId(combined),
    };
  } catch (error) {
    const err = error as Error & { stdout?: string; stderr?: string };
    const stdout = err.stdout ?? "";
    const stderr = err.stderr ?? err.message;
    const parsed = parseZernioPostId(`${stdout}\n${stderr}`);
    if (parsed.postId && parsed.duplicate) {
      return { stdout, stderr, ...parsed };
    }
    throw error;
  }
}

export async function processContentPublish(job: Job<ContentPublishJobData>) {
  const { publishJobId } = job.data;

  const [publishJob] = await sql`
    SELECT * FROM content_publish_jobs
    WHERE id = ${publishJobId}
  `;

  if (!publishJob || publishJob.status !== "PENDING") {
    job.log(`Content publish job ${publishJobId} not found or not PENDING, skipping`);
    return;
  }

  await sql`
    UPDATE content_publish_jobs
    SET status = 'PROCESSING', updated_at = NOW()
    WHERE id = ${publishJobId}
  `;

  try {
    const result = await runZernioPublish(
      publishJob.bundle_path,
      publishJob.target as ContentPublishTarget
    );

    await sql`
      UPDATE content_publish_jobs
      SET status = 'PUBLISHED',
          zernio_post_id = ${result.postId},
          duplicate_of_existing = ${result.duplicate},
          result = ${sql.json({
            target: publishJob.target,
            stdout: result.stdout,
            stderr: result.stderr,
          })},
          updated_at = NOW()
      WHERE id = ${publishJobId}
    `;
    job.log(`Content publish ${publishJobId} submitted postId=${result.postId}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    await sql`
      UPDATE content_publish_jobs
      SET status = 'FAILED', error_message = ${msg}, updated_at = NOW()
      WHERE id = ${publishJobId}
    `;
    job.log(`Content publish ${publishJobId} FAILED: ${msg}`);
    throw error;
  }
}
