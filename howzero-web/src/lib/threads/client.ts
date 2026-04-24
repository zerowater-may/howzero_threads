const BASE_URL = "https://graph.threads.net/v1.0";

export class ThreadsClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request(
    method: string,
    endpoint: string,
    params?: Record<string, string>,
    body?: Record<string, string>
  ) {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    url.searchParams.set("access_token", this.accessToken);
    if (params) {
      Object.entries(params).forEach(([k, v]) =>
        url.searchParams.set(k, v)
      );
    }

    const options: RequestInit = { method };
    if (body) {
      const formData = new URLSearchParams(body);
      options.body = formData;
      options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
      };
    }

    const res = await fetch(url.toString(), options);
    const data = await res.json();

    if (!res.ok) {
      const msg =
        data?.error?.message || `Threads API error: ${res.status}`;
      throw new Error(msg);
    }

    return data;
  }

  async get(endpoint: string, params?: Record<string, string>) {
    return this.request("GET", endpoint, params);
  }

  async post(endpoint: string, body: Record<string, string>) {
    return this.request("POST", endpoint, undefined, body);
  }

  async getUserProfile(userId: string) {
    return this.get(userId, {
      fields: "id,username,name,threads_profile_picture_url",
    });
  }

  async getUserThreads(userId: string) {
    return this.get(`${userId}/threads`, {
      fields:
        "id,text,timestamp,media_type,permalink,is_quote_post",
    });
  }

  async getComments(mediaId: string) {
    const allComments: Record<string, unknown>[] = [];
    let endpoint = `${mediaId}/conversation`;
    let params: Record<string, string> = {
      fields: "id,permalink,username,timestamp,text,hidden",
    };

    while (true) {
      const data = await this.get(endpoint, params);
      const comments = (data.data || []).filter(
        (c: Record<string, unknown>) => !c.hidden
      );
      allComments.push(...comments);

      const after = data.paging?.cursors?.after;
      if (!after || !data.paging?.next) break;
      params = {
        fields: "id,permalink,username,timestamp,text,hidden",
        after,
      };
    }

    return allComments;
  }

  async createPost(
    userId: string,
    options: {
      text: string;
      mediaType?: string;
      imageUrl?: string;
      replyToId?: string;
    }
  ) {
    const body: Record<string, string> = {
      media_type: options.mediaType || "TEXT",
      text: options.text,
    };
    if (options.imageUrl) body.image_url = options.imageUrl;
    if (options.replyToId) body.reply_to_id = options.replyToId;

    const container = await this.post(`${userId}/threads`, body);

    await new Promise((r) => setTimeout(r, 2000));

    const published = await this.post(`${userId}/threads_publish`, {
      creation_id: container.id,
    });

    return published;
  }

  async refreshToken(appId: string, appSecret: string, token: string) {
    const url = new URL(`${BASE_URL}/access_token`);
    url.searchParams.set("grant_type", "th_refresh_token");
    url.searchParams.set("access_token", token);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.error?.message || "Token refresh failed"
      );
    }

    return {
      accessToken: data.access_token as string,
      expiresIn: data.expires_in as number,
    };
  }
}
