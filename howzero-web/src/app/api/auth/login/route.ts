import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/schemas/auth";
import {
  issueAccessToken,
  issueRefreshToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@/lib/auth";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success } = await rateLimit.login.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const [user] = await sql`
    SELECT id, email, password_hash, name FROM users WHERE email = ${email}
  `;
  if (!user) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다" }, { status: 401 });
  }

  const accessToken = await issueAccessToken(user.id);
  const refreshToken = await issueRefreshToken(user.id);

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });

  response.cookies.set("access_token", accessToken, accessTokenCookieOptions());
  response.cookies.set("refresh_token", refreshToken, refreshTokenCookieOptions());

  return response;
}
