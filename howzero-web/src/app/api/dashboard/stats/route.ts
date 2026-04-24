import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 4개 쿼리 병렬 실행
  const [accountsResult, postsResult, pipelinesResult, emailsResult] =
    await Promise.all([
      sql`
        SELECT COUNT(*) as count
        FROM threads_accounts
        WHERE user_id = ${userId} AND is_active = TRUE
      `,
      sql`
        SELECT COUNT(*) as count
        FROM scheduled_posts sp
        JOIN threads_accounts ta ON sp.account_id = ta.id
        WHERE ta.user_id = ${userId}
      `,
      sql`
        SELECT COUNT(*) as count
        FROM comment_pipelines cp
        JOIN threads_accounts ta ON cp.account_id = ta.id
        WHERE ta.user_id = ${userId} AND cp.is_active = TRUE
      `,
      sql`
        SELECT COUNT(*) as count
        FROM email_logs
        WHERE user_id = ${userId} AND status = 'SENT'
      `,
    ]);

  return NextResponse.json({
    accounts: Number(accountsResult[0].count),
    posts: Number(postsResult[0].count),
    pipelines: Number(pipelinesResult[0].count),
    emails: Number(emailsResult[0].count),
  });
}
