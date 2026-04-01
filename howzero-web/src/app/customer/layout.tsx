export const dynamic = "force-dynamic";

import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { BottomNav } from "@/components/customer/bottom-nav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b bg-white px-4 md:px-6">
          <h2 className="text-lg font-bold text-emerald-600 md:hidden">
            AI 업무현황판
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
