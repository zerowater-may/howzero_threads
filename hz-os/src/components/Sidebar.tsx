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
      {/* 데스크톱: 고정 좌측 사이드바 (노션식 딥블랙) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/70 bg-sidebar md:flex">
        <Link href="/" className="flex h-14 items-center gap-2 px-4">
          <span aria-hidden className="inline-block size-2 rounded-full bg-primary" />
          <span className="display text-lg text-foreground">hz-os</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
          <p className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            워크스페이스
          </p>
          {NAV.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-white/[0.07] text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>
        <form action="/logout" method="POST" className="border-t border-border/70 p-2">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <LogOut className="size-4 shrink-0" strokeWidth={1.75} />
            로그아웃
          </button>
        </form>
      </aside>

      {/* 모바일: 상단 컴팩트 바 */}
      <header className="sticky top-0 z-20 flex items-center gap-1 overflow-x-auto border-b border-border/70 bg-sidebar/95 px-3 py-2 backdrop-blur md:hidden">
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
                active ? "bg-white/[0.07] text-foreground" : "text-muted-foreground hover:text-foreground"
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
