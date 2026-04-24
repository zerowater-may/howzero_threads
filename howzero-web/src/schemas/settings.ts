import { z } from "zod";

export const smtpSettingsSchema = z.object({
  host: z.string().min(1, "SMTP 호스트를 입력하세요"),
  port: z.number().min(1).max(65535),
  username: z.string().min(1, "사용자 이름을 입력하세요"),
  password: z.string().optional(),
  recipientEmail: z.string().email("올바른 이메일을 입력하세요").optional(),
});

export type SmtpSettingsInput = z.infer<typeof smtpSettingsSchema>;
