import { NextResponse } from "next/server";
import { revokeAllRefreshTokens } from "@/lib/auth";

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");

  if (userId) {
    await revokeAllRefreshTokens(userId);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}
