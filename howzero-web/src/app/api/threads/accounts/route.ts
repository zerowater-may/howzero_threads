import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await sql`
    SELECT id, threads_user_id, username, profile_picture_url,
           token_expires_at, is_active, last_token_error,
           created_at, updated_at
    FROM threads_accounts
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return NextResponse.json(accounts);
}
