import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const emails = await sql`
    SELECT id, subject, recipient_email, comment_count, status, error_message, sent_at
    FROM email_logs
    WHERE user_id = ${userId}
    ORDER BY sent_at DESC
    LIMIT 100
  `;

  return NextResponse.json(emails);
}
