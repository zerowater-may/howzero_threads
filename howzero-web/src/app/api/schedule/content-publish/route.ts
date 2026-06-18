import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { sql } from "@/lib/db";
import { enqueueContentPublishJob } from "@/lib/queue/producers";
import { createContentPublishJobsSchema } from "@/schemas/content-publish";

function cuid(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await sql`
    SELECT *
    FROM content_publish_jobs
    WHERE user_id = ${userId}
    ORDER BY scheduled_at DESC
  `;

  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createContentPublishJobsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { bundlePath, targets, scheduledAt } = parsed.data;
  const scheduledDate = new Date(scheduledAt);
  const ids: string[] = [];

  for (const target of targets) {
    const id = cuid();
    await sql`
      INSERT INTO content_publish_jobs (id, user_id, bundle_path, target, scheduled_at)
      VALUES (${id}, ${userId}, ${bundlePath}, ${target}, ${scheduledDate})
    `;
    await enqueueContentPublishJob(id, scheduledDate);
    ids.push(id);
  }

  return NextResponse.json({ ids }, { status: 201 });
}
