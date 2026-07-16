import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DocTree, type DocNode } from "@/components/docs/DocTree";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";

export default async function DocsLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  await requireStaff();
  const { id } = await params;
  const projectId = Number(id);

  const db = await getDb();
  const { rows: projectRows } = await db.query("SELECT id FROM projects WHERE id = $1", [projectId]);
  if (!projectRows[0]) notFound();

  const { rows } = await db.query(
    "SELECT id, parent_id, title, visibility FROM documents WHERE project_id = $1 ORDER BY sort_order, id",
    [projectId]
  );
  const docs: DocNode[] = rows.map((r) => ({
    id: Number(r.id),
    parent_id: r.parent_id == null ? null : Number(r.parent_id),
    title: String(r.title),
    visibility: String(r.visibility),
  }));

  return (
    <AppShell>
      <div className="flex gap-6">
        <aside className="w-[260px] shrink-0 border-r border-border pr-4">
          <DocTree projectId={projectId} docs={docs} />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AppShell>
  );
}
