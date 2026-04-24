import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { encrypt } from "@/lib/crypto";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountId } = await params;

  const [account] = await sql`
    SELECT app_id, app_secret
    FROM threads_accounts
    WHERE id = ${accountId} AND user_id = ${userId}
  `;

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // app_secret은 마스킹해서 반환
  const appSecret = account.app_secret as string;
  const masked = appSecret
    ? appSecret.startsWith("v1:")
      ? "••••••••" // 암호화된 값이면 마스킹
      : appSecret.slice(0, 4) + "••••" + appSecret.slice(-4)
    : "";

  return NextResponse.json({
    app_id: account.app_id,
    app_secret_masked: masked,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountId } = await params;

  const [account] = await sql`
    SELECT id FROM threads_accounts
    WHERE id = ${accountId} AND user_id = ${userId}
  `;

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const body = await request.json();
  const { appId, appSecret } = body as { appId: string; appSecret: string };

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: "appId와 appSecret을 모두 입력해주세요" },
      { status: 400 }
    );
  }

  const encryptedSecret = encrypt(appSecret);

  await sql`
    UPDATE threads_accounts
    SET app_id = ${appId}, app_secret = ${encryptedSecret}, updated_at = NOW()
    WHERE id = ${accountId}
  `;

  return NextResponse.json({ success: true });
}
