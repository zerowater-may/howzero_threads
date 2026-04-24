import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { sql } from "@/lib/db";

function cuid(): string {
  return crypto.randomBytes(16).toString("hex");
}

// 첨부파일 목록
export async function GET(
  request: Request,
  { params }: { params: Promise<{ pipelineId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pipelineId } = await params;

  // 소유권 확인
  const [pipeline] = await sql`
    SELECT cp.id FROM comment_pipelines cp
    JOIN threads_accounts ta ON cp.account_id = ta.id
    WHERE cp.id = ${pipelineId} AND ta.user_id = ${userId}
  `;
  if (!pipeline) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const attachments = await sql`
    SELECT id, filename, content_type, size_bytes, created_at
    FROM pipeline_attachments
    WHERE pipeline_id = ${pipelineId}
    ORDER BY created_at ASC
  `;

  return NextResponse.json(attachments);
}

// 첨부파일 추가
export async function POST(
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

  const body = await request.json();
  const { filename, data, contentType } = body as {
    filename: string;
    data: string; // base64
    contentType?: string;
  };

  if (!filename || !data) {
    return NextResponse.json({ error: "filename과 data가 필요합니다" }, { status: 400 });
  }

  const sizeBytes = Math.ceil((data.length * 3) / 4);
  if (sizeBytes > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "10MB 이하만 가능합니다" }, { status: 400 });
  }

  const id = cuid();
  await sql`
    INSERT INTO pipeline_attachments (id, pipeline_id, filename, content_type, data, size_bytes)
    VALUES (${id}, ${pipelineId}, ${filename}, ${contentType ?? null}, ${data}, ${sizeBytes})
  `;

  return NextResponse.json({ id, filename, size_bytes: sizeBytes }, { status: 201 });
}
