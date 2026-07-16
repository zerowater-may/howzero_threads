import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MeetingAnalyzePanel } from "@/components/meetings/MeetingAnalyzePanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import type { NeedItem } from "@/lib/meeting-analysis";

const PRIORITY_STYLE: Record<string, string> = {
  높음: "bg-destructive/15 text-destructive",
  중간: "bg-primary/15 text-primary",
  낮음: "bg-secondary text-muted-foreground",
};

interface MeetingDetail {
  id: number;
  project_id: number;
  title: string;
  transcript: string | null;
  summary: string | null;
  needs: NeedItem[] | null;
}

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string; mid: string }>;
}) {
  await requireStaff();
  const { id, mid } = await params;
  const projectId = Number(id);
  const meetingId = Number(mid);

  const db = await getDb();
  const { rows } = await db.query(
    "SELECT id, project_id, title, transcript, summary, needs FROM meetings WHERE id = $1 AND project_id = $2",
    [meetingId, projectId]
  );
  const meeting = rows[0] as unknown as MeetingDetail | undefined;
  if (!meeting) notFound();

  const needs = meeting.needs ?? [];

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href={`/p/${projectId}`} className="text-sm text-muted-foreground hover:text-foreground">
              ← 프로젝트로
            </Link>
            <h1 className="display mt-1 text-2xl">{meeting.title}</h1>
          </div>
          <MeetingAnalyzePanel
            meetingId={meeting.id}
            projectId={projectId}
            analyzed={!!meeting.summary}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">전사</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[520px] rounded-md border border-border p-4">
                <p className="whitespace-pre-wrap text-sm text-foreground/90">
                  {meeting.transcript || "전사 내용이 없습니다."}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">요약</CardTitle>
              </CardHeader>
              <CardContent>
                {meeting.summary ? (
                  <p className="whitespace-pre-wrap text-sm text-foreground/90">{meeting.summary}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">아직 분석하지 않았습니다. &quot;AI 분석&quot;을 눌러보세요.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">니즈</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {needs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">추출된 니즈가 없습니다.</p>
                ) : (
                  needs.map((n, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-1 border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <Badge className={PRIORITY_STYLE[n.priority]}>{n.priority}</Badge>
                        <span className="text-sm font-medium text-foreground">{n.need}</span>
                      </div>
                      {n.context && <p className="text-sm text-muted-foreground">{n.context}</p>}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
