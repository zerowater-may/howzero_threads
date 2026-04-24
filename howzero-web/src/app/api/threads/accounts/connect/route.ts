import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { sql } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { ThreadsClient } from "@/lib/threads/client";

function cuid(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { accessToken?: string; threadsUserId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { accessToken, threadsUserId } = body;

  if (!accessToken || !threadsUserId) {
    return NextResponse.json(
      { error: "accessToken and threadsUserId are required" },
      { status: 400 }
    );
  }

  // 토큰 유효성 검증: Threads API로 프로필 조회
  const client = new ThreadsClient(accessToken);
  let profile: Record<string, unknown>;
  try {
    profile = await client.getUserProfile(threadsUserId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid access token";
    return NextResponse.json(
      { error: `Token validation failed: ${message}` },
      { status: 400 }
    );
  }

  // 토큰 암호화
  const encryptedToken = encrypt(accessToken);
  const appId = process.env.THREADS_APP_ID || "";
  const appSecret = encrypt(process.env.THREADS_APP_SECRET || "");

  // 60일 후 만료
  const tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  // DB 저장 (ON CONFLICT로 기존 계정 업데이트)
  await sql`
    INSERT INTO threads_accounts (
      id, user_id, threads_user_id, username, profile_picture_url,
      access_token, token_expires_at, app_id, app_secret, is_active
    ) VALUES (
      ${cuid()}, ${userId}, ${String(profile.id)}, ${String(profile.username)},
      ${(profile.threads_profile_picture_url as string) || null},
      ${encryptedToken}, ${tokenExpiresAt}, ${appId}, ${appSecret}, TRUE
    )
    ON CONFLICT (user_id, threads_user_id) DO UPDATE SET
      username = EXCLUDED.username,
      profile_picture_url = EXCLUDED.profile_picture_url,
      access_token = EXCLUDED.access_token,
      token_expires_at = EXCLUDED.token_expires_at,
      is_active = TRUE,
      last_token_error = NULL,
      updated_at = NOW()
  `;

  return NextResponse.json({
    success: true,
    username: profile.username,
    threadsUserId: profile.id,
  });
}
