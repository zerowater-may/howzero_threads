import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";

interface CompanyRow {
  id: number;
  name: string;
  industry: string | null;
  size: string | null;
  deal_count: number;
  contract_count: number;
  has_client_token: boolean;
}

export default async function CompaniesPage() {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(`
    SELECT c.id, c.name, c.industry, c.size,
      (SELECT count(*) FROM leads l WHERE l.company_id = c.id AND l.status <> 'archived') AS deal_count,
      (SELECT count(*) FROM contracts ct WHERE ct.company_id = c.id) AS contract_count,
      (c.client_token IS NOT NULL) AS has_client_token
    FROM companies c
    ORDER BY c.created_at DESC
  `);
  const companies = (rows as unknown as CompanyRow[]).map((c) => ({
    ...c,
    deal_count: Number(c.deal_count),
    contract_count: Number(c.contract_count),
  }));

  return (
    <AppShell>
      <div className="mb-8 flex items-center gap-2">
        <h1 className="display text-2xl">회사</h1>
        <Badge variant="secondary">{companies.length}</Badge>
      </div>

      {companies.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          아직 등록된 고객사가 없습니다. 딜 파이프라인으로 문의가 들어오면 자동으로 생성됩니다.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">회사명</th>
                <th className="px-4 py-3 font-medium">업종</th>
                <th className="px-4 py-3 font-medium">규모</th>
                <th className="px-4 py-3 text-right font-medium">딜</th>
                <th className="px-4 py-3 text-right font-medium">계약</th>
                <th className="px-4 py-3 font-medium">고객 링크</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/c/${c.id}`} className="font-medium hover:text-primary">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.industry || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.size || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.deal_count}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.contract_count}</td>
                  <td className="px-4 py-3">
                    {c.has_client_token ? (
                      <Badge variant="outline" className="text-[10px]">발급됨</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">미발급</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
