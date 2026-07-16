import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="display flex items-center gap-2 text-lg text-foreground">
              <span aria-hidden className="inline-block size-2 rounded-full bg-primary" />
              hz-os
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                딜
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                대시보드
              </Link>
            </nav>
          </div>
          <form action="/logout" method="POST">
            <Button type="submit" variant="ghost" size="sm">
              로그아웃
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
