import { Queue } from "bullmq";
import { connection } from "./connection";
import type {
  ScheduledPostJobData,
  CommentPipelineJobData,
} from "./types";

const postQueue = new Queue<ScheduledPostJobData>("scheduled-posts", {
  connection,
});
const pipelineQueue = new Queue<CommentPipelineJobData>("comment-pipelines", {
  connection,
});
const tokenQueue = new Queue("token-refresh", { connection });

export async function enqueueScheduledPost(
  postId: string,
  scheduledAt: Date
) {
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());
  await postQueue.add(
    "publish",
    { postId },
    {
      delay,
      attempts: 3,
      backoff: { type: "exponential", delay: 60_000 },
      removeOnComplete: true,
      removeOnFail: { age: 7 * 24 * 3600 },
    }
  );
}

export async function registerCommentPipeline(
  pipelineId: string,
  intervalMinutes: number
) {
  await pipelineQueue.add(
    "run-pipeline",
    { pipelineId },
    {
      repeat: { every: intervalMinutes * 60 * 1000 },
      jobId: `pipeline-${pipelineId}`,
      removeOnComplete: true,
    }
  );
}

export async function removeCommentPipeline(pipelineId: string) {
  await pipelineQueue.removeRepeatableByKey(`pipeline-${pipelineId}`);
}

export async function registerTokenRefresh() {
  await tokenQueue.add(
    "refresh-all",
    {},
    {
      repeat: { pattern: "0 3 * * *" },
      jobId: "token-refresh-daily",
    }
  );
}
