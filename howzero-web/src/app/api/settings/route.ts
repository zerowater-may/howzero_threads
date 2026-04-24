import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { sql } from "@/lib/db";
import { smtpSettingsSchema } from "@/schemas/settings";
import { encrypt, decrypt } from "@/lib/crypto";

function cuid(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [settings] = await sql`
    SELECT id, host, port, username, password, recipient_email, created_at, updated_at
    FROM smtp_settings WHERE user_id = ${userId}
  `;

  if (!settings) return NextResponse.json(null);

  return NextResponse.json({
    ...settings,
    username: decrypt(settings.username),
    password: decrypt(settings.password),
  });
}

export async function PUT(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = smtpSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { host, port, username, password, recipientEmail } = parsed.data;
  const encUsername = encrypt(username.trim());
  // 받는 이메일이 없으면 보내는 이메일(본인)으로 자동 설정
  const recipient = recipientEmail || username;

  const [existing] = await sql`SELECT id, password as existing_password FROM smtp_settings WHERE user_id = ${userId}`;

  // password가 비어있으면 기존 값 유지
  const encPassword = password?.trim()
    ? encrypt(password.replace(/\s/g, ""))
    : existing?.existing_password ?? null;

  if (!encPassword) {
    return NextResponse.json({ error: "비밀번호를 입력하세요" }, { status: 400 });
  }

  if (existing) {
    await sql`
      UPDATE smtp_settings
      SET host = ${host}, port = ${port}, username = ${encUsername},
          password = ${encPassword}, recipient_email = ${recipient},
          updated_at = NOW()
      WHERE user_id = ${userId}
    `;
  } else {
    await sql`
      INSERT INTO smtp_settings (id, user_id, host, port, username, password, recipient_email)
      VALUES (${cuid()}, ${userId}, ${host}, ${port}, ${encUsername}, ${encPassword}, ${recipient})
    `;
  }

  return NextResponse.json({ success: true });
}
