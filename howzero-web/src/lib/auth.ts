import { SignJWT, jwtVerify } from "jose";
import crypto from "node:crypto";
import { sql } from "./db";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

const ACCESS_TTL = "15m";
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function cuid(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function issueAccessToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(ACCESS_SECRET);
}

export async function issueRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

  await sql`
    INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
    VALUES (${cuid()}, ${userId}, ${tokenHash}, ${expiresAt})
  `;

  return token;
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, ACCESS_SECRET);
  return payload;
}

export async function refreshAccessToken(refreshToken: string) {
  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const [stored] = await sql`
    SELECT id, user_id, expires_at, revoked_at
    FROM refresh_tokens
    WHERE token_hash = ${tokenHash}
  `;

  if (!stored || stored.revoked_at || new Date(stored.expires_at) < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  await sql`
    UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ${stored.id}
  `;

  const newAccessToken = await issueAccessToken(stored.user_id);
  const newRefreshToken = await issueRefreshToken(stored.user_id);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function revokeAllRefreshTokens(userId: string) {
  await sql`
    UPDATE refresh_tokens SET revoked_at = NOW()
    WHERE user_id = ${userId} AND revoked_at IS NULL
  `;
}

export function accessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 15 * 60,
    path: "/",
  };
}

export function refreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60,
    path: "/api/auth/refresh",
  };
}
