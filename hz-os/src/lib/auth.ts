import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// staff 단일 계정 MVP — HZOS_PASSWORD로 로그인, HMAC 서명 쿠키 세션 (스펙 §3)
const COOKIE = "hzos_session";

function secret(): string {
  const s = process.env.HZOS_SESSION_SECRET || process.env.HZOS_PASSWORD;
  if (!s) throw new Error("HZOS_PASSWORD env가 필요합니다");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeSessionValue(): string {
  const payload = `staff.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionValue(value: string | undefined): boolean {
  if (!value) return false;
  const i = value.lastIndexOf(".");
  if (i < 0) return false;
  const payload = value.slice(0, i);
  const sig = value.slice(i + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function isStaff(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionValue(jar.get(COOKIE)?.value);
}

export async function setStaffSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, makeSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearStaffSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function checkPassword(pw: string): boolean {
  const expected = process.env.HZOS_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(pw);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function newShareToken(): string {
  return randomBytes(24).toString("base64url");
}

export const SESSION_COOKIE = COOKIE;
