import { AppShell } from "@/components/AppShell";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { getMonthEvents } from "@/lib/calendar";
import { requireStaff } from "@/lib/guard";

// URL 정수 파싱 — 비정상 입력(NaN 등)은 fallback으로.
function toInt(v: string | undefined, fallback: number): number {
  const n = Number(v);
  return Number.isInteger(n) ? n : fallback;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const now = new Date();

  const year = toInt(sp.y, now.getFullYear());
  // URL m은 1-based(1~12). 내부/getMonthEvents는 0-based. 범위 밖 입력은 클램프.
  const month = Math.min(11, Math.max(0, toInt(sp.m, now.getMonth() + 1) - 1));

  const events = await getMonthEvents(year, month);

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="display text-2xl">캘린더</h1>
          <p className="mt-1 text-sm text-muted-foreground">미팅과 계약 마일스톤을 한눈에.</p>
        </div>
        <MonthCalendar events={events} year={year} month={month} />
      </div>
    </AppShell>
  );
}
