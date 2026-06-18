import { z } from "zod";

export const contentPublishTargetSchema = z.enum([
  "instagram_reel",
  "instagram_carousel",
  "threads_carousel",
]);

export const createContentPublishJobsSchema = z.object({
  bundlePath: z.string().min(1, "bundlePath is required"),
  targets: z.array(contentPublishTargetSchema).min(1, "target is required"),
  scheduledAt: z.string().refine(
    (value) => new Date(value) > new Date(),
    "미래 시간을 선택하세요"
  ),
});

export type ContentPublishTarget = z.infer<typeof contentPublishTargetSchema>;
export type CreateContentPublishJobsInput = z.infer<typeof createContentPublishJobsSchema>;
