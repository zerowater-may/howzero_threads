import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { removeCommentPipeline, registerCommentPipeline } from "@/lib/queue/producers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ pipelineId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pipelineId } = await params;

  // Verify ownership
  const [pipeline] = await sql`
    SELECT cp.id, cp.is_active, cp.interval_minutes
    FROM comment_pipelines cp
    JOIN threads_accounts ta ON cp.account_id = ta.id
    WHERE cp.id = ${pipelineId} AND ta.user_id = ${userId}
  `;
  if (!pipeline) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();

  // Toggle is_active
  if (typeof body.isActive === "boolean") {
    await sql`
      UPDATE comment_pipelines SET is_active = ${body.isActive}, updated_at = NOW()
      WHERE id = ${pipelineId}
    `;
    if (body.isActive) {
      await registerCommentPipeline(pipelineId, pipeline.interval_minutes);
    } else {
      try { await removeCommentPipeline(pipelineId); } catch {}
    }
  }

  // Update interval
  if (typeof body.intervalMinutes === "number" && body.intervalMinutes >= 5) {
    await sql`
      UPDATE comment_pipelines SET interval_minutes = ${body.intervalMinutes}, updated_at = NOW()
      WHERE id = ${pipelineId}
    `;
    // Re-register with new interval
    try { await removeCommentPipeline(pipelineId); } catch {}
    await registerCommentPipeline(pipelineId, body.intervalMinutes);
  }

  // Update keyword
  if (body.keyword !== undefined) {
    await sql`
      UPDATE comment_pipelines SET keyword = ${body.keyword || null}, updated_at = NOW()
      WHERE id = ${pipelineId}
    `;
  }

  // Update email config
  if (body.emailSubject !== undefined || body.emailBody !== undefined) {
    await sql`
      UPDATE comment_pipelines
      SET email_subject = ${body.emailSubject ?? null},
          email_body = ${body.emailBody ?? null},
          updated_at = NOW()
      WHERE id = ${pipelineId}
    `;
  }

  // Update schedule range
  if (body.startAt !== undefined || body.endAt !== undefined) {
    const startAt = body.startAt ? new Date(body.startAt as string) : null;
    const endAt = body.endAt ? new Date(body.endAt as string) : null;
    await sql`
      UPDATE comment_pipelines SET start_at = ${startAt}, end_at = ${endAt}, updated_at = NOW()
      WHERE id = ${pipelineId}
    `;
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ pipelineId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pipelineId } = await params;

  const [pipeline] = await sql`
    SELECT cp.id FROM comment_pipelines cp
    JOIN threads_accounts ta ON cp.account_id = ta.id
    WHERE cp.id = ${pipelineId} AND ta.user_id = ${userId}
  `;
  if (!pipeline) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try { await removeCommentPipeline(pipelineId); } catch {}

  await sql`DELETE FROM comment_pipelines WHERE id = ${pipelineId}`;

  return NextResponse.json({ success: true });
}
