import { z } from "zod";

export const createPostSchema = z.object({
  accountId: z.string().min(1),
  text: z.string().min(1, "내용을 입력하세요").max(500, "500자 이하로 입력하세요"),
  mediaType: z.enum(["TEXT", "IMAGE", "VIDEO", "CAROUSEL"]),
  imageUrl: z.string().url("올바른 URL을 입력하세요").optional().or(z.literal("")),
  scheduledAt: z.string().refine(
    (dt) => new Date(dt) > new Date(),
    "미래 시간을 선택하세요"
  ),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
