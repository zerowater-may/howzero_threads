"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ListChecks, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/customer", icon: LayoutDashboard, label: "대시보드" },
  { href: "/customer/agents", icon: Users, label: "AI 직원" },
  { href: "/customer/tasks", icon: ListChecks, label: "업무 현황" },
  { href: "/customer/reports", icon: BarChart3, label: "리포트" },
];

export function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-bold text-emerald-600">AI 업무현황판</h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/customer" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-gray-400">Powered by HowZero AI</p>
      </div>
    </aside>
  );
}
