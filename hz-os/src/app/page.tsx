import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { createProject } from "@/lib/actions/projects";
import { InboundLeads, type LeadRow } from "@/components/InboundLeads";
import Link from "next/link";

interface ProjectRow {
  id: number;
  name: string;
  client_name: string | null;
  status: string;
  latest_update: string | null;
}

async function createProjectAction(formData: FormData): Promise<void> {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const clientName = String(formData.get("clientName") || "").trim();
  if (!name) return;
  await createProject(name, clientName);
}

export default async function Home() {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(`
    SELECT p.id, p.name, p.client_name, p.status,
      (SELECT body FROM updates u WHERE u.project_id = p.id ORDER BY u.created_at DESC LIMIT 1) AS latest_update
    FROM projects p
    ORDER BY p.created_at DESC
  `);
  const projects = rows as unknown as ProjectRow[];

  const { rows: leadRows } = await db.query(`
    SELECT id, source, name, company, contact, email, industry, budget, start_timing, pain_summary, created_at
    FROM leads WHERE status = 'new' ORDER BY created_at DESC
  `);
  const leads = leadRows as unknown as LeadRow[];

  return (
    <AppShell>
      <InboundLeads leads={leads} />
      <div className="mb-8 flex items-center justify-between">
        <h1 className="display text-2xl">프로젝트</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>+ 새 프로젝트</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 프로젝트</DialogTitle>
            </DialogHeader>
            <form action={createProjectAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">프로젝트명</Label>
                <Input id="name" name="name" required autoFocus />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="clientName">고객사</Label>
                <Input id="clientName" name="clientName" />
              </div>
              <DialogFooter>
                <Button type="submit">만들기</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          아직 프로젝트가 없습니다. 새 프로젝트를 만들어 시작하세요.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/p/${p.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{p.name}</CardTitle>
                    <StatusBadge status={p.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">{p.client_name || "고객사 미지정"}</p>
                  <p className="truncate text-sm text-foreground/80">
                    {p.latest_update || "아직 업데이트가 없습니다."}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
