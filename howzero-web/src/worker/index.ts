import { Worker } from "bullmq";
import Redis from "ioredis";
import { processScheduledPost } from "./processors/scheduled-post";
import { processCommentPipeline } from "./processors/comment-pipeline";
import { processTokenRefresh } from "./processors/token-refresh";

const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6380",
  { maxRetriesPerRequest: null }
);

new Worker("scheduled-posts", processScheduledPost, {
  connection,
  concurrency: 5,
  limiter: { max: 10, duration: 60_000 },
});

new Worker("comment-pipelines", processCommentPipeline, {
  connection,
  concurrency: 3,
});

new Worker("token-refresh", processTokenRefresh, {
  connection,
  concurrency: 1,
});

console.log("Workers started on PID", process.pid);
