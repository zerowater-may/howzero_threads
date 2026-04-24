import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { sql } from "@/lib/db";
import { createPipelineSchema } from "@/schemas/pipeline";
import { registerCommentPipeline } from "@/lib/queue/producers";

function cuid(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pipelines = await sql`
    SELECT
      cp.*,
      ta.username,
      ta.profile_picture_url,
      ta.threads_user_id,
      COALESCE(
        (SELECT COUNT(*) FROM email_logs el WHERE el.pipeline_id = cp.id AND el.status = 'SENT'),
        0
      )::int as sent_email_count,
      COALESCE(
        (SELECT SUM(el.comment_count) FROM email_logs el WHERE el.pipeline_id = cp.id AND el.status = 'SENT'),
        0
      )::int as total_extracted_emails
    FROM comment_pipelines cp
    JOIN threads_accounts ta ON cp.account_id = ta.id
    WHERE ta.user_id = ${userId}
    ORDER BY cp.created_at DESC
  `;

  return NextResponse.json(pipelines);
}

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createPipelineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { accountId, mediaId, intervalMinutes } = parsed.data;

  // Also accept optional fields from body directly
  const postText = (body.postText as string) || null;
  const keyword = (body.keyword as string) || null;
  const startAt = body.startAt ? new Date(body.startAt as string) : null;
  const endAt = body.endAt ? new Date(body.endAt as string) : null;

  const [account] = await sql`
    SELECT id FROM threads_accounts
    WHERE id = ${accountId} AND user_id = ${userId}
  `;
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const pipelineId = cuid();
  await sql`
    INSERT INTO comment_pipelines (id, account_id, media_id, interval_minutes, post_text, keyword, start_at, end_at)
    VALUES (${pipelineId}, ${accountId}, ${mediaId}, ${intervalMinutes}, ${postText}, ${keyword}, ${startAt}, ${endAt})
    ON CONFLICT (account_id, media_id) DO UPDATE
    SET interval_minutes = ${intervalMinutes},
        post_text = COALESCE(${postText}, comment_pipelines.post_text),
        keyword = ${keyword},
        start_at = ${startAt},
        end_at = ${endAt},
        is_active = TRUE,
        updated_at = NOW()
    RETURNING id
  `;

  await registerCommentPipeline(pipelineId, intervalMinutes);

  return NextResponse.json({ id: pipelineId }, { status: 201 });
}
