"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Building2, CalendarDays, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "딜", icon: LayoutGrid, match: (p: string) => p === "/" },
  { href: "/companies", label: "회사", icon: Building2, match: (p: string) => p.startsWith("/companies") || p.startsWith("/c/") },
  { href: "/calendar", label: "캘린더", icon: CalendarDays, match: (p: string) => p.startsWith("/calendar") },
  { href: "/dashboard", label: "대시보드", icon: BarChart3, match: (p: string) => p.startsWith("/dashboard") },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* 데스크톱: 고정 좌측 사이드바 */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
        <Link href="/" className="flex h-14 items-center gap-2 px-5">
          <span aria-hidden className="inline-block size-2 rounded-full bg-primary" />
          <span className="display text-lg text-foreground">hz-os</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {NAV.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>
        <form action="/logout" method="POST" className="border-t border-border p-3">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
            로그아웃
          </button>
        </form>
      </aside>

      {/* 모바일: 상단 컴팩트 바 */}
      <header className="sticky top-0 z-20 flex items-center gap-1 overflow-x-auto border-b border-border bg-card/80 px-3 py-2 backdrop-blur md:hidden">
        <Link href="/" className="mr-2 flex shrink-0 items-center gap-2">
          <span aria-hidden className="inline-block size-2 rounded-full bg-primary" />
          <span className="display text-base text-foreground">hz-os</span>
        </Link>
        {NAV.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </header>
    </>
  );
}
