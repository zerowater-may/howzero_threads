import crypto from "node:crypto";
import { redis } from "@/lib/redis";

const STATE_TTL = 300;

export async function createOAuthState(userId: string): Promise<string> {
  const state = crypto.randomBytes(32).toString("hex");
  await redis.set(`oauth_state:${state}`, userId, "EX", STATE_TTL);
  return state;
}

export async function verifyAndConsumeOAuthState(
  state: string
): Promise<string | null> {
  const key = `oauth_state:${state}`;
  const userId = await redis.getdel(key);
  return userId;
}

export function buildAuthorizationUrl(
  appId: string,
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope:
      "threads_basic,threads_content_publish,threads_manage_insights,threads_manage_replies,threads_read_replies",
    response_type: "code",
    state,
  });
  return `https://threads.net/oauth/authorize?${params.toString()}`;
}
