import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pipelineId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pipelineId } = await params;

  // 파이프라인 소유자 확인 (comment_pipelines → threads_accounts → user_id)
  const [pipeline] = await sql`
    SELECT cp.id
    FROM comment_pipelines cp
    JOIN threads_accounts ta ON cp.account_id = ta.id
    WHERE cp.id = ${pipelineId} AND ta.user_id = ${userId}
  `;
  if (!pipeline) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const logs = await sql`
    SELECT
      id,
      status,
      comments_found,
      emails_extracted,
      emails_sent,
      error_message,
      created_at
    FROM pipeline_logs
    WHERE pipeline_id = ${pipelineId}
    ORDER BY created_at DESC
    LIMIT 50
  `;

  return NextResponse.json(logs);
}
