import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { sql } from "@/lib/db";
import { createPostSchema } from "@/schemas/post";
import { enqueueScheduledPost } from "@/lib/queue/producers";

function cuid(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const accountId = url.searchParams.get("accountId");

  let posts;
  if (accountId) {
    posts = await sql`
      SELECT sp.* FROM scheduled_posts sp
      JOIN threads_accounts ta ON sp.account_id = ta.id
      WHERE ta.user_id = ${userId} AND sp.account_id = ${accountId}
      ORDER BY sp.scheduled_at DESC
    `;
  } else {
    posts = await sql`
      SELECT sp.* FROM scheduled_posts sp
      JOIN threads_accounts ta ON sp.account_id = ta.id
      WHERE ta.user_id = ${userId}
      ORDER BY sp.scheduled_at DESC
    `;
  }

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { accountId, text, mediaType, imageUrl, scheduledAt } = parsed.data;

  const [account] = await sql`
    SELECT id FROM threads_accounts
    WHERE id = ${accountId} AND user_id = ${userId}
  `;
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const postId = cuid();
  await sql`
    INSERT INTO scheduled_posts (id, account_id, text, media_type, image_url, scheduled_at)
    VALUES (${postId}, ${accountId}, ${text}, ${mediaType}, ${imageUrl || null}, ${scheduledAt})
  `;

  await enqueueScheduledPost(postId, new Date(scheduledAt));

  return NextResponse.json({ id: postId }, { status: 201 });
}
