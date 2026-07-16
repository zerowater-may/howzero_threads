import { notFound } from "next/navigation";
import { MarkdownView } from "@/components/docs/MarkdownView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDb } from "@/lib/db";
import { getProjectByToken } from "@/lib/share";
import { clientAddComment } from "@/lib/actions/share";

interface CommentRow {
  id: number;
  author_role: string;
  author_name: string | null;
  body: string;
  created_at: string;
}

function textOf(content: unknown): string {
  if (content && typeof content === "object" && "text" in content) {
    return String((content as { text?: unknown }).text ?? "");
  }
  return "";
}

export default async function ShareDocPage({
  params,
}: {
  params: Promise<{ token: string; docId: string }>;
}) {
  const { token, docId } = await params;
  const project = await getProjectByToken(token);
  if (!project) notFound();
  const documentId = Number(docId);

  const db = await getDb();
  // visibility='shared' 조건을 쿼리에 포함해 internal 문서는 애초에 조회되지 않게 한다.
  const { rows } = await db.query(
    "SELECT id, title, content FROM documents WHERE id = $1 AND project_id = $2 AND visibility = 'shared'",
    [documentId, project.id]
  );
  const doc = rows[0];
  if (!doc) notFound();

  const { rows: commentRows } = await db.query(
    "SELECT id, author_role, author_name, body, created_at FROM comments WHERE project_id = $1 AND target_type = 'document' AND target_id = $2 ORDER BY created_at ASC",
    [project.id, documentId]
  );
  const comments = commentRows as unknown as CommentRow[];

  async function addCommentAction(formData: FormData): Promise<void> {
    "use server";
    const body = String(formData.get("body") || "");
    const authorName = String(formData.get("authorName") || "");
    await clientAddComment(token, "document", documentId, body, authorName);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-2xl">{String(doc.title)}</h1>
      <MarkdownView text={textOf(doc.content)} />

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 className="display text-lg">코멘트</h2>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 코멘트가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {comments.map((c) => (
              <div key={c.id} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {c.author_name || (c.author_role === "client" ? "고객" : "담당자")}
                </span>{" "}
                {c.body}
              </div>
            ))}
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <form action={addCommentAction} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="authorName">이름</Label>
                <Input id="authorName" name="authorName" placeholder="이름을 입력하세요" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="body">코멘트</Label>
                <Textarea id="body" name="body" placeholder="코멘트를 남겨 주세요." required />
              </div>
              <div>
                <Button type="submit" size="sm">
                  등록
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
