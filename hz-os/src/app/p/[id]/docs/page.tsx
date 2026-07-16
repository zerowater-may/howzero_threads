import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { createDocument } from "@/lib/actions/documents";

export default async function DocsIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const projectId = Number(id);

  const db = await getDb();
  const { rows } = await db.query(
    "SELECT id FROM documents WHERE project_id = $1 ORDER BY sort_order, id LIMIT 1",
    [projectId]
  );
  if (rows[0]) redirect(`/p/${projectId}/docs/${rows[0].id}`);

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
      <FileText className="size-8 text-muted-foreground" />
      <div>
        <p className="text-sm text-foreground">아직 문서가 없습니다.</p>
        <p className="text-sm text-muted-foreground">첫 문서를 만들어 프로젝트 자료를 정리해 보세요.</p>
      </div>
      <form action={createDocument.bind(null, projectId, undefined)}>
        <Button type="submit">첫 문서 만들기</Button>
      </form>
    </div>
  );
}
