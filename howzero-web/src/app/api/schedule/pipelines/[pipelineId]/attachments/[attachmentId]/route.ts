import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ pipelineId: string; attachmentId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pipelineId, attachmentId } = await params;

  // 소유권 확인
  const [pipeline] = await sql`
    SELECT cp.id FROM comment_pipelines cp
    JOIN threads_accounts ta ON cp.account_id = ta.id
    WHERE cp.id = ${pipelineId} AND ta.user_id = ${userId}
  `;
  if (!pipeline) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await sql`
    DELETE FROM pipeline_attachments
    WHERE id = ${attachmentId} AND pipeline_id = ${pipelineId}
  `;

  return NextResponse.json({ success: true });
}
