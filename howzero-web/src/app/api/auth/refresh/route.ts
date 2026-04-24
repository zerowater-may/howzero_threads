import { NextResponse } from "next/server";
import {
  refreshAccessToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@/lib/auth";

export async function POST(request: Request) {
  const refreshTokenValue = request.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("refresh_token="))
    ?.split("=")
    .slice(1)
    .join("=")
    ?.trim();

  if (!refreshTokenValue) {
    return NextResponse.json(
      { error: "No refresh token" },
      { status: 401 }
    );
  }

  try {
    const { accessToken, refreshToken } =
      await refreshAccessToken(refreshTokenValue);

    const response = NextResponse.json({ success: true });
    response.cookies.set(
      "access_token",
      accessToken,
      accessTokenCookieOptions()
    );
    response.cookies.set(
      "refresh_token",
      refreshToken,
      refreshTokenCookieOptions()
    );

    return response;
  } catch {
    const response = NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }
}
