import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { ThreadsClient } from "@/lib/threads/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ accountId: string; postId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountId, postId } = await params;

  // 계정 소유권 확인
  const [account] = await sql`
    SELECT id, access_token
    FROM threads_accounts
    WHERE id = ${accountId} AND user_id = ${userId}
  `;

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // 토큰 복호화
  const accessToken = decrypt(account.access_token);
  const client = new ThreadsClient(accessToken);

  try {
    const comments = await client.getComments(postId);
    return NextResponse.json(comments);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch comments";
    return NextResponse.json(
      { error: `Threads API error: ${message}` },
      { status: 502 }
    );
  }
}
