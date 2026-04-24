import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { sql } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/schemas/auth";

const BCRYPT_ROUNDS = 12;

function cuid(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success } = await rateLimit.register.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name, inviteCode } = parsed.data;

  if (process.env.ALLOW_REGISTRATION !== "true") {
    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code required" }, { status: 403 });
    }

    const [invite] = await sql`
      SELECT id, code, max_uses, used_count, expires_at
      FROM invite_codes WHERE code = ${inviteCode}
    `;

    if (!invite || invite.used_count >= invite.max_uses ||
        (invite.expires_at && new Date(invite.expires_at) < new Date())) {
      return NextResponse.json({ error: "Invalid or expired invite code" }, { status: 403 });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const userId = cuid();

    await sql.begin(async (tx: any) => {
      await tx`
        INSERT INTO users (id, email, password_hash, name)
        VALUES (${userId}, ${email}, ${passwordHash}, ${name || null})
      `;
      await tx`
        UPDATE invite_codes SET used_count = used_count + 1 WHERE code = ${inviteCode}
      `;
    });

    return NextResponse.json({ id: userId, email }, { status: 201 });
  }

  const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing) {
    return NextResponse.json({ error: "이미 등록된 이메일입니다" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const userId = cuid();

  await sql`
    INSERT INTO users (id, email, password_hash, name)
    VALUES (${userId}, ${email}, ${passwordHash}, ${name || null})
  `;

  return NextResponse.json({ id: userId, email }, { status: 201 });
}
