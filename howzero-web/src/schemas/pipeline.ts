import { z } from "zod";

export const createPipelineSchema = z.object({
  accountId: z.string().min(1),
  mediaId: z.string().min(1, "게시물 ID를 입력하세요"),
  intervalMinutes: z.number().min(5).max(1440).default(30),
});

export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;
