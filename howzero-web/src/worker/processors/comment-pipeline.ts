import { Job } from "bullmq";
import crypto from "node:crypto";
import { sql } from "../db";
import { decrypt } from "../../lib/crypto";
import { ThreadsClient } from "../../lib/threads/client";
import { sendEmail } from "../../lib/email/sender";
import type { CommentPipelineJobData } from "../../lib/queue/types";

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

function cuid(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function processCommentPipeline(job: Job<CommentPipelineJobData>) {
  const { pipelineId } = job.data;

  const [pipeline] = await sql`
    SELECT cp.*, ta.access_token, ta.threads_user_id, ta.user_id
    FROM comment_pipelines cp
    JOIN threads_accounts ta ON cp.account_id = ta.id
    WHERE cp.id = ${pipelineId} AND cp.is_active = TRUE
  `;

  if (!pipeline) {
    job.log(`Pipeline ${pipelineId} not found or inactive`);
    return;
  }

  const token = decrypt(pipeline.access_token);
  const client = new ThreadsClient(token);

  const comments = await client.getComments(pipeline.media_id);

  // 새 댓글만 필터 (마지막 처리 시각 이후)
  const newComments = pipeline.last_processed_at
    ? comments.filter(
        (c) =>
          new Date(c.timestamp as string) > new Date(pipeline.last_processed_at)
      )
    : comments;

  if (newComments.length === 0) {
    job.log(`No new comments for pipeline ${pipelineId}`);
    await sql`
      UPDATE comment_pipelines SET last_processed_at = NOW(), updated_at = NOW()
      WHERE id = ${pipelineId}
    `;
    return;
  }

  // 이메일 추출
  const emailSet = new Set<string>();
  const rows: { username: string; email: string; text: string }[] = [];

  for (const c of newComments) {
    const text = (c.text as string) || "";
    const emails = text.match(EMAIL_RE);
    if (emails) {
      for (const email of emails) {
        const lower = email.toLowerCase();
        if (!emailSet.has(lower)) {
          emailSet.add(lower);
          rows.push({
            username: c.username as string,
            email: lower,
            text,
          });
        }
      }
    }
  }

  if (rows.length === 0) {
    job.log(`No emails found in ${newComments.length} new comments`);
    await sql`
      UPDATE comment_pipelines SET last_processed_at = NOW(), updated_at = NOW()
      WHERE id = ${pipelineId}
    `;
    return;
  }

  // SMTP 설정 조회
  const [smtp] = await sql`
    SELECT host, port, username, password, recipient_email
    FROM smtp_settings WHERE user_id = ${pipeline.user_id}
  `;

  if (!smtp) {
    job.log("No SMTP settings configured");
    return;
  }

  const subject = `[Threads] 새 댓글 이메일 ${rows.length}건 - ${pipeline.media_id}`;
  const html = `
    <h2>새 댓글에서 추출된 이메일 (${rows.length}건)</h2>
    <table border="1" cellpadding="8" cellspacing="0">
      <tr><th>#</th><th>Username</th><th>Email</th><th>Comment</th></tr>
      ${rows.map((r, i) => `<tr><td>${i + 1}</td><td>@${r.username}</td><td>${r.email}</td><td>${r.text}</td></tr>`).join("")}
    </table>
  `;

  try {
    await sendEmail({
      to: decrypt(smtp.recipient_email || smtp.recipient_email),
      subject,
      html,
      smtp: {
        host: smtp.host,
        port: smtp.port,
        username: decrypt(smtp.username),
        password: decrypt(smtp.password),
      },
    });

    await sql`
      INSERT INTO email_logs (id, user_id, pipeline_id, subject, recipient_email, comment_count, status)
      VALUES (${cuid()}, ${pipeline.user_id}, ${pipelineId}, ${subject}, ${smtp.recipient_email}, ${rows.length}, 'SENT')
    `;

    job.log(`Sent email with ${rows.length} extracted emails`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown";
    await sql`
      INSERT INTO email_logs (id, user_id, pipeline_id, subject, recipient_email, comment_count, status, error_message)
      VALUES (${cuid()}, ${pipeline.user_id}, ${pipelineId}, ${subject}, ${smtp.recipient_email}, ${rows.length}, 'FAILED', ${msg})
    `;
    job.log(`Email send FAILED: ${msg}`);
  }

  await sql`
    UPDATE comment_pipelines SET last_processed_at = NOW(), updated_at = NOW()
    WHERE id = ${pipelineId}
  `;
}
