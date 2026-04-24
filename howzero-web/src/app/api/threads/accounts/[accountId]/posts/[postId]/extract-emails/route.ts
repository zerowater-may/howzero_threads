import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { ThreadsClient } from "@/lib/threads/client";

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

export async function POST(
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

  let comments: Record<string, unknown>[];
  try {
    comments = await client.getComments(postId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch comments";
    return NextResponse.json(
      { error: `Threads API error: ${message}` },
      { status: 502 }
    );
  }

  // 이메일 추출 및 중복 제거 (대소문자 무시)
  const seenEmails = new Set<string>();
  const emails: Array<{
    username: string;
    email: string;
    text: string;
    timestamp: string;
  }> = [];

  for (const comment of comments) {
    const text = (comment.text as string) || "";
    const matches = text.match(EMAIL_REGEX);
    if (!matches) continue;

    for (const email of matches) {
      const normalizedEmail = email.toLowerCase();
      if (seenEmails.has(normalizedEmail)) continue;
      seenEmails.add(normalizedEmail);

      emails.push({
        username: (comment.username as string) || "",
        email,
        text,
        timestamp: (comment.timestamp as string) || "",
      });
    }
  }

  return NextResponse.json({
    emails,
    totalComments: comments.length,
    uniqueEmails: emails.length,
  });
}
