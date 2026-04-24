import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "node:crypto";
import { sql } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

function cuid(): string {
  return crypto.randomBytes(16).toString("hex");
}

interface EmailEntry {
  username: string;
  email: string;
  text: string;
}

interface Attachment {
  filename: string;
  content: string; // base64
  contentType?: string;
}

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    pipelineId,
    accountId,
    postId,
    emails,
    subject: customSubject,
    attachments: rawAttachments,
    isTest,
  }: {
    pipelineId?: string;
    accountId?: string;
    postId?: string;
    emails: EmailEntry[];
    subject?: string;
    attachments?: Attachment[];
    isTest?: boolean;
  } = body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json(
      { error: "emails 배열이 필요합니다" },
      { status: 400 }
    );
  }

  // SMTP 설정 조회
  const [smtpSettings] = await sql`
    SELECT host, port, username, password, recipient_email
    FROM smtp_settings
    WHERE user_id = ${userId}
  `;

  if (!smtpSettings) {
    return NextResponse.json(
      { error: "SMTP 설정을 먼저 해주세요" },
      { status: 400 }
    );
  }

  const decryptedUsername = decrypt(smtpSettings.username);
  const decryptedPassword = decrypt(smtpSettings.password);

  const testPrefix = isTest ? "[테스트] " : "";

  // 요청에 포함된 첨부파일
  const inlineAttachments = rawAttachments?.map((a) => ({
    filename: a.filename,
    content: Buffer.from(a.content, "base64"),
    contentType: a.contentType,
  })) ?? [];

  // 파이프라인 설정 (첨부파일 + 이메일 제목/본문)
  let pipelineAttachments: typeof inlineAttachments = [];
  let pipelineEmailSubject: string | null = null;
  let pipelineEmailBody: string | null = null;
  if (pipelineId) {
    const dbAttachments = await sql`
      SELECT filename, content_type, data FROM pipeline_attachments
      WHERE pipeline_id = ${pipelineId}
    `;
    pipelineAttachments = dbAttachments.map((a) => ({
      filename: a.filename,
      content: Buffer.from(a.data, "base64"),
      contentType: a.content_type,
    }));

    const [pipelineConfig] = await sql`
      SELECT email_subject, email_body FROM comment_pipelines WHERE id = ${pipelineId}
    `;
    pipelineEmailSubject = pipelineConfig?.email_subject ?? null;
    pipelineEmailBody = pipelineConfig?.email_body ?? null;
  }

  const mailAttachments = [...pipelineAttachments, ...inlineAttachments];

  // 제목 우선순위: 요청 > 파이프라인 설정 > 기본값
  const subject = testPrefix + (customSubject ?? pipelineEmailSubject ?? `[Howzero] ${postId} 포스트 댓글 이메일 수집 결과`);

  const recipientEmail = smtpSettings.recipient_email;
  const commentCount = emails.length;

  const emailRows = emails
    .map(
      (entry, index) => `
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: center;">${index + 1}</td>
      <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${entry.username}</td>
      <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${entry.email}</td>
      <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${entry.text}</td>
    </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a202c; padding: 24px; max-width: 800px; margin: 0 auto;">
  <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">${subject}</h2>
  ${pipelineEmailBody ? `<div style="color: #2d3748; margin-bottom: 16px; white-space: pre-wrap; line-height: 1.6;">${pipelineEmailBody}</div>` : ""}
  <p style="color: #718096; margin-bottom: 24px;">총 ${commentCount}개의 이메일이 추출되었습니다.</p>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <thead>
      <tr style="background-color: #f7fafc;">
        <th style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">번호</th>
        <th style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: left; font-weight: 600;">유저명</th>
        <th style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: left; font-weight: 600;">이메일</th>
        <th style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: left; font-weight: 600;">댓글내용</th>
      </tr>
    </thead>
    <tbody>
      ${emailRows}
    </tbody>
  </table>
</body>
</html>
`;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.port === 465,
      auth: {
        user: decryptedUsername,
        pass: decryptedPassword,
      },
    });

    const info = await transporter.sendMail({
      from: decryptedUsername,
      to: recipientEmail,
      subject,
      html,
      ...(mailAttachments.length > 0 ? { attachments: mailAttachments } : {}),
    });

    // 이메일 로그 - 성공
    await sql`
      INSERT INTO email_logs (id, user_id, pipeline_id, subject, recipient_email, comment_count, status, sent_at)
      VALUES (
        ${cuid()},
        ${userId},
        ${pipelineId ?? null},
        ${subject},
        ${recipientEmail},
        ${commentCount},
        'SENT',
        NOW()
      )
    `;

    // 파이프라인 로그 - 성공
    if (pipelineId) {
      await sql`
        INSERT INTO pipeline_logs (id, pipeline_id, status, comments_found, emails_extracted, emails_sent, created_at)
        VALUES (
          ${cuid()},
          ${pipelineId},
          'SUCCESS',
          ${commentCount},
          ${commentCount},
          ${commentCount},
          NOW()
        )
      `;
    }

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    // 이메일 로그 - 실패
    await sql`
      INSERT INTO email_logs (id, user_id, pipeline_id, subject, recipient_email, comment_count, status, error_message, sent_at)
      VALUES (
        ${cuid()},
        ${userId},
        ${pipelineId ?? null},
        ${subject},
        ${recipientEmail},
        ${commentCount},
        'FAILED',
        ${errorMessage},
        NOW()
      )
    `;

    // 파이프라인 로그 - 실패
    if (pipelineId) {
      await sql`
        INSERT INTO pipeline_logs (id, pipeline_id, status, comments_found, emails_extracted, emails_sent, error_message, created_at)
        VALUES (
          ${cuid()},
          ${pipelineId},
          'FAILED',
          ${commentCount},
          ${commentCount},
          0,
          ${errorMessage},
          NOW()
        )
      `;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
