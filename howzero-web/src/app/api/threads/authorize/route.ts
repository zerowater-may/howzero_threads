import { NextResponse } from "next/server";
import { createOAuthState, buildAuthorizationUrl } from "@/lib/threads/oauth";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appId = process.env.THREADS_APP_ID;
  const redirectUri = process.env.THREADS_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "Threads API가 설정되지 않았습니다" },
      { status: 500 }
    );
  }

  const state = await createOAuthState(userId);
  const authUrl = buildAuthorizationUrl(appId, redirectUri, state);

  const response = NextResponse.json({ url: authUrl });
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  return response;
}
