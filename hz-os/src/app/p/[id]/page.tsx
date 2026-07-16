import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StatusSelect } from "@/components/StatusSelect";
import { CopyButton } from "@/components/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { addComment, addUpdate, regenerateShareToken } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";

const STEPS = ["진단", "설계", "구축", "운영"] as const;

const KIND_LABEL: Record<string, string> = {
  progress: "진행",
  decision: "결정",
  ask: "질문",
};

const KIND_STYLE: Record<string, string> = {
  progress: "bg-secondary text-foreground",
  decision: "bg-primary/15 text-primary",
  ask: "bg-destructive/15 text-destructive",
};

interface ProjectDetail {
  id: number;
  name: string;
  client_name: string | null;
  status: string;
  share_token: string | null;
}

interface UpdateRow {
  id: number;
  kind: string;
  body: string;
  author_role: string;
  author_name: string | null;
  created_at: string;
}

interface CommentRow {
  id: number;
  target_id: number;
  author_role: string;
  author_name: string | null;
  body: string;
  created_at: string;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const projectId = Number(id);

  const db = await getDb();
  const { rows: projectRows } = await db.query(
    "SELECT id, name, client_name, status, share_token FROM projects WHERE id = $1",
    [projectId]
  );
  const project = projectRows[0] as unknown as ProjectDetail | undefined;
  if (!project) notFound();

  const { rows: updateRows } = await db.query(
    "SELECT id, kind, body, author_role, author_name, created_at FROM updates WHERE project_id = $1 ORDER BY created_at DESC",
    [projectId]
  );
  const updates = updateRows as unknown as UpdateRow[];

  const { rows: commentRows } = await db.query(
    "SELECT id, target_id, author_role, author_name, body, created_at FROM comments WHERE project_id = $1 AND target_type = 'update' ORDER BY created_at ASC",
    [projectId]
  );
  const comments = commentRows as unknown as CommentRow[];
  const commentsByUpdate = new Map<number, CommentRow[]>();
  for (const c of comments) {
    const list = commentsByUpdate.get(c.target_id) || [];
    list.push(c);
    commentsByUpdate.set(c.target_id, list);
  }

  async function addUpdateAction(formData: FormData): Promise<void> {
    "use server";
    const kind = String(formData.get("kind") || "progress");
    const body = String(formData.get("body") || "");
    await addUpdate(projectId, kind, body);
  }

  async function addCommentAction(formData: FormData): Promise<void> {
    "use server";
    const targetId = Number(formData.get("targetId"));
    const body = String(formData.get("body") || "");
    if (!targetId) return;
    await addComment(projectId, "update", targetId, body);
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="display text-2xl">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.client_name || "고객사 미지정"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/p/${project.id}/docs`}>문서</Link>
            </Button>
            <StatusSelect projectId={project.id} status={project.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-sm",
                  step === project.status
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {step}
              </span>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-border" />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">공유 링크</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            {project.share_token ? (
              <>
                <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
                  /share/{project.share_token}
                </code>
                <CopyButton text={`/share/${project.share_token}`} />
                <form action={regenerateShareToken.bind(null, project.id)}>
                  <Button type="submit" variant="outline" size="sm">
                    재발급
                  </Button>
                </form>
              </>
            ) : (
              <form action={regenerateShareToken.bind(null, project.id)}>
                <Button type="submit" size="sm">
                  링크 만들기
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <h2 className="display text-lg">업데이트</h2>

          <Card>
            <CardContent className="pt-6">
              <form action={addUpdateAction} className="flex flex-col gap-3">
                <select
                  name="kind"
                  defaultValue="progress"
                  className="h-9 w-32 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="progress">진행</option>
                  <option value="decision">결정</option>
                  <option value="ask">질문</option>
                </select>
                <Textarea name="body" placeholder="새 업데이트를 입력하세요." required />
                <div>
                  <Button type="submit" size="sm">
                    등록
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {updates.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 업데이트가 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {updates.map((u) => (
                <Card
                  key={u.id}
                  className={cn(
                    u.author_role === "client" && "border-l-4 border-l-[var(--ok)]"
                  )}
                >
                  <CardContent className="flex flex-col gap-3 pt-6">
                    <div className="flex items-center gap-2">
                      <Badge className={KIND_STYLE[u.kind]}>{KIND_LABEL[u.kind] || u.kind}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {u.author_name || (u.author_role === "client" ? "고객" : "담당자")}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-foreground">{u.body}</p>

                    <div className="flex flex-col gap-2 border-t border-border pt-3">
                      {(commentsByUpdate.get(u.id) || []).map((c) => (
                        <p key={c.id} className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {c.author_name || (c.author_role === "client" ? "고객" : "담당자")}
                          </span>{" "}
                          {c.body}
                        </p>
                      ))}
                      <form action={addCommentAction} className="flex gap-2">
                        <input type="hidden" name="targetId" value={u.id} />
                        <Textarea
                          name="body"
                          placeholder="댓글을 입력하세요."
                          className="min-h-9 text-sm"
                          required
                        />
                        <Button type="submit" size="sm" variant="outline">
                          등록
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
