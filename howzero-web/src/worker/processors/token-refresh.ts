import { Job } from "bullmq";
import { sql } from "../db";
import { decrypt, encrypt } from "../../lib/crypto";
import { ThreadsClient } from "../../lib/threads/client";
import { sendEmail } from "../../lib/email/sender";

export async function processTokenRefresh(job: Job) {
  const accounts = await sql`
    SELECT ta.*, u.email as user_email,
           ss.host as smtp_host, ss.port as smtp_port,
           ss.username as smtp_username, ss.password as smtp_password,
           ss.recipient_email as smtp_recipient
    FROM threads_accounts ta
    JOIN users u ON ta.user_id = u.id
    LEFT JOIN smtp_settings ss ON ta.user_id = ss.user_id
    WHERE ta.is_active = TRUE
  `;

  for (const account of accounts) {
    const daysUntilExpiry = Math.floor(
      (new Date(account.token_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry > 7) continue;

    try {
      const currentToken = decrypt(account.access_token);
      const appId = decrypt(account.app_id);
      const appSecret = decrypt(account.app_secret);

      const client = new ThreadsClient(currentToken);
      const result = await client.refreshToken(appId, appSecret, currentToken);

      const newExpiresAt = new Date(Date.now() + result.expiresIn * 1000);

      await sql`
        UPDATE threads_accounts
        SET access_token = ${encrypt(result.accessToken)},
            token_expires_at = ${newExpiresAt},
            last_token_error = NULL,
            updated_at = NOW()
        WHERE id = ${account.id}
      `;

      job.log(`Token refreshed for @${account.username}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";

      await sql`
        UPDATE threads_accounts
        SET last_token_error = ${msg}, updated_at = NOW()
        WHERE id = ${account.id}
      `;

      if (account.smtp_host && account.smtp_username) {
        try {
          await sendEmail({
            to: account.user_email,
            subject: `[Howzero] 토큰 갱신 실패 - @${account.username}`,
            html: `
              <h2>Threads 토큰 갱신 실패</h2>
              <p>계정 <strong>@${account.username}</strong>의 토큰 갱신에 실패했습니다.</p>
              <p>오류: ${msg}</p>
              <p>만료까지 <strong>${daysUntilExpiry}일</strong> 남았습니다.</p>
              <p>대시보드에서 수동으로 재연결해주세요.</p>
            `,
            smtp: {
              host: account.smtp_host,
              port: account.smtp_port,
              username: decrypt(account.smtp_username),
              password: decrypt(account.smtp_password),
            },
          });
        } catch {
          job.log(`Failed to send alert email for @${account.username}`);
        }
      }

      job.log(`Token refresh FAILED for @${account.username}: ${msg}`);
    }
  }
}
