import { Job } from "bullmq";
import { sql } from "../db";
import { decrypt } from "../../lib/crypto";
import { ThreadsClient } from "../../lib/threads/client";
import type { ScheduledPostJobData } from "../../lib/queue/types";

export async function processScheduledPost(job: Job<ScheduledPostJobData>) {
  const { postId } = job.data;

  const [post] = await sql`
    SELECT sp.*, ta.access_token, ta.threads_user_id, ta.app_id
    FROM scheduled_posts sp
    JOIN threads_accounts ta ON sp.account_id = ta.id
    WHERE sp.id = ${postId}
  `;

  if (!post || post.status !== "PENDING") {
    job.log(`Post ${postId} not found or not PENDING, skipping`);
    return;
  }

  await sql`UPDATE scheduled_posts SET status = 'PROCESSING', updated_at = NOW() WHERE id = ${postId}`;

  try {
    const token = decrypt(post.access_token);
    const client = new ThreadsClient(token);

    const result = await client.createPost(post.threads_user_id, {
      text: post.text,
      mediaType: post.media_type,
      imageUrl: post.image_url || undefined,
    });

    await sql`
      UPDATE scheduled_posts
      SET status = 'PUBLISHED', threads_media_id = ${result.id}, updated_at = NOW()
      WHERE id = ${postId}
    `;

    job.log(`Published post ${postId} → media ${result.id}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    await sql`
      UPDATE scheduled_posts
      SET status = 'FAILED', error_message = ${msg}, updated_at = NOW()
      WHERE id = ${postId}
    `;
    job.log(`FAILED post ${postId}: ${msg}`);
    throw error;
  }
}
