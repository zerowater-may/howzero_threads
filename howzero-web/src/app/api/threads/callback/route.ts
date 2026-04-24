import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { sql } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { verifyAndConsumeOAuthState } from "@/lib/threads/oauth";
import { ThreadsClient } from "@/lib/threads/client";

function cuid(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3100";

  if (error) {
    return NextResponse.redirect(`${baseUrl}/accounts?error=oauth_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/accounts?error=invalid_request`);
  }

  // CSRF 검증: cookie의 state와 URL의 state 비교
  const cookieState = request.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("oauth_state="))
    ?.split("=")[1]
    ?.trim();

  if (cookieState !== state) {
    return NextResponse.redirect(`${baseUrl}/accounts?error=csrf_mismatch`);
  }

  // Redis에서 state 검증 및 소비 (atomic)
  const userId = await verifyAndConsumeOAuthState(state);
  if (!userId) {
    return NextResponse.redirect(`${baseUrl}/accounts?error=state_expired`);
  }

  const appId = process.env.THREADS_APP_ID!;
  const appSecret = process.env.THREADS_APP_SECRET!;
  const redirectUri = process.env.THREADS_REDIRECT_URI!;

  // 1. 단기 토큰 교환
  const tokenRes = await fetch(
    "https://graph.threads.net/oauth/access_token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    }
  );

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error("Token exchange failed:", tokenData);
    return NextResponse.redirect(`${baseUrl}/accounts?error=token_exchange`);
  }

  // 2. 장기 토큰 교환
  const longLivedRes = await fetch(
    `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${appSecret}&access_token=${tokenData.access_token}`,
  );

  const longLivedData = await longLivedRes.json();
  if (!longLivedRes.ok) {
    console.error("Long-lived token exchange failed:", longLivedData);
    return NextResponse.redirect(`${baseUrl}/accounts?error=long_lived_token`);
  }

  const accessToken = longLivedData.access_token as string;
  const expiresIn = (longLivedData.expires_in as number) || 5184000; // 60일

  // 3. 프로필 조회
  const client = new ThreadsClient(accessToken);
  const profile = await client.getUserProfile(tokenData.user_id);

  // 4. DB 저장 (ON CONFLICT으로 기존 계정 업데이트)
  const encryptedToken = encrypt(accessToken);
  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

  await sql`
    INSERT INTO threads_accounts (
      id, user_id, threads_user_id, username, profile_picture_url,
      access_token, token_expires_at, is_active
    ) VALUES (
      ${cuid()}, ${userId}, ${profile.id}, ${profile.username},
      ${profile.threads_profile_picture_url || null},
      ${encryptedToken}, ${tokenExpiresAt}, TRUE
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

  // 5. oauth_state 쿠키 제거 후 리다이렉트
  const response = NextResponse.redirect(`${baseUrl}/accounts?connected=true`);
  response.cookies.delete("oauth_state");

  return response;
}
