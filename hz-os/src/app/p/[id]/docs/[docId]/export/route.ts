import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isStaff } from "@/lib/auth";
import { toMarkdown, type DocContent } from "@/lib/md-export";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  if (!(await isStaff())) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { id, docId } = await params;
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT title, content FROM documents WHERE id = $1 AND project_id = $2",
    [Number(docId), Number(id)]
  );
  if (!rows[0]) return new NextResponse("Not found", { status: 404 });

  const title = String(rows[0].title || "문서");
  const md = toMarkdown(rows[0].content as DocContent);
  const filename = `${title}.md`;

  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
