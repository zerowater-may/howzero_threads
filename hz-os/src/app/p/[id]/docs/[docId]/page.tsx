import { notFound } from "next/navigation";
import { DocHeader, type VersionItem } from "@/components/docs/DocHeader";
import { DocEditor } from "@/components/docs/DocEditor";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";

function textOf(content: unknown): string {
  if (content && typeof content === "object" && "text" in content) {
    return String((content as { text?: unknown }).text ?? "");
  }
  return "";
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  await requireStaff();
  const { id, docId } = await params;
  const projectId = Number(id);
  const documentId = Number(docId);

  const db = await getDb();
  const { rows } = await db.query(
    "SELECT id, title, content, visibility FROM documents WHERE id = $1 AND project_id = $2",
    [documentId, projectId]
  );
  const doc = rows[0];
  if (!doc) notFound();

  const { rows: versionRows } = await db.query(
    "SELECT id, content, saved_at FROM doc_versions WHERE document_id = $1 ORDER BY saved_at DESC LIMIT 10",
    [documentId]
  );
  const versions: VersionItem[] = versionRows.map((v) => ({
    id: Number(v.id),
    saved_at: new Date(v.saved_at as string).toISOString(),
    text: textOf(v.content),
  }));

  return (
    <div className="flex flex-col gap-6">
      <DocHeader
        docId={documentId}
        projectId={projectId}
        initialTitle={String(doc.title)}
        visibility={String(doc.visibility)}
        versions={versions}
      />
      <DocEditor docId={documentId} initialText={textOf(doc.content)} />
    </div>
  );
}
