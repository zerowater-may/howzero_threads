import { notFound } from "next/navigation";
import { getCompanyByToken } from "@/lib/client-portal";

// 고객 포털 미니 셸 — staff 네비(AppShell) 없음. client_token만으로 회사를 검증한다.
export default async function ClientPortalLayout({
  params,
  children,
}: {
  params: Promise<{ token: string }>;
  children: React.ReactNode;
}) {
  const { token } = await params;
  const company = await getCompanyByToken(token);
  if (!company) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <span className="display text-lg text-foreground">{company.name}</span>
          <span className="text-xs text-muted-foreground">howzero 고객 룸</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
