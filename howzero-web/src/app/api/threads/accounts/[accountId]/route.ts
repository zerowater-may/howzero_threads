import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { accountId } = await params;

  const [account] = await sql`
    SELECT id FROM threads_accounts
    WHERE id = ${accountId} AND user_id = ${userId}
  `;

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  await sql`DELETE FROM threads_accounts WHERE id = ${accountId}`;

  return NextResponse.json({ success: true });
}
