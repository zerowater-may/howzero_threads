import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDb } from "@/lib/db";
import { getProjectByToken } from "@/lib/share";
import { clientAddUpdate } from "@/lib/actions/share";
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

interface UpdateRow {
  id: number;
  kind: string;
  body: string;
  author_role: string;
  author_name: string | null;
  created_at: string;
}

interface DocRow {
  id: number;
  title: string;
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const project = await getProjectByToken(token);
  if (!project) notFound();

  const db = await getDb();
  const { rows: updateRows } = await db.query(
    "SELECT id, kind, body, author_role, author_name, created_at FROM updates WHERE project_id = $1 ORDER BY created_at DESC",
    [project.id]
  );
  const updates = updateRows as unknown as UpdateRow[];

  const { rows: docRows } = await db.query(
    "SELECT id, title FROM documents WHERE project_id = $1 AND visibility = 'shared' ORDER BY sort_order, id",
    [project.id]
  );
  const docs = docRows as unknown as DocRow[];

  async function addUpdateAction(formData: FormData): Promise<void> {
    "use server";
    const body = String(formData.get("body") || "");
    const authorName = String(formData.get("authorName") || "");
    await clientAddUpdate(token, body, authorName);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="display text-2xl">{project.name}</h1>
        {project.client_name && <p className="text-sm text-muted-foreground">{project.client_name}</p>}
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

      {docs.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="display text-lg">공유 문서</h2>
          <div className="flex flex-col gap-2">
            {docs.map((d) => (
              <Link
                key={d.id}
                href={`/share/${token}/docs/${d.id}`}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:border-primary/50"
              >
                <FileText className="size-4 text-muted-foreground" />
                {d.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="display text-lg">업데이트</h2>
        {updates.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 업데이트가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {updates.map((u) => (
              <Card
                key={u.id}
                className={cn(u.author_role === "client" && "border-l-4 border-l-[var(--ok)]")}
              >
                <CardContent className="flex flex-col gap-2 pt-6">
                  <div className="flex items-center gap-2">
                    <Badge className={KIND_STYLE[u.kind]}>{KIND_LABEL[u.kind] || u.kind}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {u.author_name || (u.author_role === "client" ? "고객" : "담당자")}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{u.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={addUpdateAction} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">질문/요청 남기기</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor="authorName">이름</Label>
              <Input id="authorName" name="authorName" placeholder="이름을 입력하세요" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="body">내용</Label>
              <Textarea id="body" name="body" placeholder="질문이나 요청 사항을 남겨 주세요." required />
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
  );
}
