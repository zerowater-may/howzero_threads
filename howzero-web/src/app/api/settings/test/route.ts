import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sql } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [settings] = await sql`
    SELECT host, port, username, password
    FROM smtp_settings WHERE user_id = ${userId}
  `;

  if (!settings) {
    return NextResponse.json({ error: "SMTP 설정을 먼저 저장해주세요" }, { status: 400 });
  }

  const smtpUser = decrypt(settings.username);
  const smtpPass = decrypt(settings.password);

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 10000,
  });

  try {
    await transporter.verify();
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "연결 실패";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
