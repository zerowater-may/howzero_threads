import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { ThreadsClient } from "@/lib/threads/client";

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다" },
      { status: 500 }
    );
  }

  const { accountId, draft } = (await request.json()) as {
    accountId: string;
    draft: string;
  };

  if (!accountId || !draft?.trim()) {
    return NextResponse.json(
      { error: "계정과 대본 초안이 필요합니다" },
      { status: 400 }
    );
  }

  // 계정 조회 + 소유권 확인
  const [account] = await sql`
    SELECT id, threads_user_id, username, access_token
    FROM threads_accounts
    WHERE id = ${accountId} AND user_id = ${userId}
  `;
  if (!account) {
    return NextResponse.json({ error: "계정을 찾을 수 없습니다" }, { status: 404 });
  }

  // 최근 포스트 가져오기 (스타일 분석용)
  let recentPosts: string[] = [];
  try {
    const accessToken = decrypt(account.access_token);
    const client = new ThreadsClient(accessToken);
    const data = await client.getUserThreads(account.threads_user_id);
    const posts = (data.data || []) as Array<{ text?: string }>;
    recentPosts = posts
      .filter((p) => p.text)
      .slice(0, 20)
      .map((p) => p.text as string);
  } catch {
    // 포스트를 못 가져와도 대본 생성은 진행
  }

  const postsContext =
    recentPosts.length > 0
      ? `\n\n## @${account.username}의 최근 게시물 (스타일 참고용)\n${recentPosts.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
      : `\n\n(최근 게시물을 가져올 수 없어 일반적인 바이럴 스타일로 작성합니다)`;

  const systemPrompt = `당신은 Threads(스레드) 플랫폼 전문 카피라이터입니다.
사용자가 제공하는 초안을 바탕으로 조회수가 잘 터지는 바이럴 대본을 작성합니다.

## 규칙
1. 사용자 계정(@${account.username})의 기존 게시물 스타일, 톤, 페르소나를 분석하고 유지하세요
2. 첫 줄은 반드시 임팩트 있는 훅(hook)으로 시작 — 스크롤을 멈추게 만드세요
3. 멀티 파트 포스트로 작성: 1/, 2/, 3/ 형식으로 번호를 매기세요
4. 각 파트는 500자 이내로 작성하세요 (Threads 글자 제한)
5. 마지막 파트에는 CTA(Call to Action)를 넣으세요 (팔로우, 저장, 공유 유도)
6. 이모지를 적절히 활용하되 과하지 않게
7. 줄바꿈을 활용해 가독성을 높이세요
8. 대본만 출력하세요. 부연 설명이나 메타 코멘트는 넣지 마세요
${postsContext}`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\n---\n\n다음 초안을 바이럴 대본으로 리라이팅해줘:\n\n${draft}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2000,
      },
    });

    const text = result.response.text();

    return NextResponse.json({ script: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `AI 생성 실패: ${message}` },
      { status: 500 }
    );
  }
}
