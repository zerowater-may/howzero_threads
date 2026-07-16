import { notFound } from "next/navigation";
import { getProjectByToken } from "@/lib/share";

// 고객 공유 뷰 미니 셸 — staff 네비 없음. 라우트별 검증(미들웨어 미사용)이라 페이지에서도 별도 확인한다.
export default async function ShareLayout({
  params,
  children,
}: {
  params: Promise<{ token: string }>;
  children: React.ReactNode;
}) {
  const { token } = await params;
  const project = await getProjectByToken(token);
  if (!project) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <span className="display text-lg text-foreground">{project.name}</span>
          <span className="text-xs text-muted-foreground">howzero 프로젝트 룸</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
