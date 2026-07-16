"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");

// year/month(0-based)의 월간 그리드. 이벤트는 서버에서 받은 현재월 것만 렌더하고,
// 월 이동은 router.push로 서버 재조회한다. URL의 m은 사람 친화적 1-based.
export function MonthCalendar({
  events,
  year,
  month,
}: {
  events: CalendarEvent[];
  year: number;
  month: number; // 0-based
}) {
  const router = useRouter();

  const byDate = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const list = byDate.get(e.date);
    if (list) list.push(e);
    else byDate.set(e.date, [e]);
  }

  const firstWeekday = new Date(year, month, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const go = (y: number, m0: number) => router.push(`/calendar?y=${y}&m=${m0 + 1}`);
  const prev = () => (month === 0 ? go(year - 1, 11) : go(year, month - 1));
  const next = () => (month === 11 ? go(year + 1, 0) : go(year, month + 1));
  const goToday = () => go(today.getFullYear(), today.getMonth());

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더: 월 표시 + 이동 */}
      <div className="flex items-center justify-between">
        <h2 className="display text-lg tabular-nums">
          {year}년 {month + 1}월
        </h2>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon-sm" onClick={prev} aria-label="이전 달">
            <ChevronLeft strokeWidth={1.75} />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>
            오늘
          </Button>
          <Button variant="outline" size="icon-sm" onClick={next} aria-label="다음 달">
            <ChevronRight strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      {/* 좁은 화면에서는 가로 스크롤로 격자 유지 */}
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={cn(
                  "px-2 pb-2 text-center text-xs font-medium",
                  i === 0 ? "text-destructive/80" : i === 6 ? "text-primary/80" : "text-muted-foreground"
                )}
              >
                {w}
              </div>
            ))}
          </div>

          {/* 날짜 격자 — 셀 경계는 bg-border 위 1px gap로 표현 */}
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
            {cells.map((d, idx) => {
              if (d === null) return <div key={idx} className="min-h-24 bg-card/40" />;
              const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
              const dayEvents = byDate.get(dateStr) ?? [];
              const isToday = dateStr === todayStr;
              const weekday = (firstWeekday + d - 1) % 7;
              return (
                <div key={idx} className="flex min-h-24 flex-col gap-1 bg-card p-1.5">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md text-xs tabular-nums",
                      isToday
                        ? "bg-primary font-semibold text-primary-foreground"
                        : weekday === 0
                          ? "text-destructive/80"
                          : weekday === 6
                            ? "text-primary/80"
                            : "text-muted-foreground"
                    )}
                  >
                    {d}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.map((e, i) => (
                      <EventChip key={i} event={e} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-secondary" /> 미팅
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-primary" /> 마일스톤
        </span>
      </div>
    </div>
  );
}

function EventChip({ event }: { event: CalendarEvent }) {
  const done = event.type === "milestone" && event.status === "done";
  return (
    <Link
      href={event.href}
      title={event.label}
      className={cn(
        "block truncate rounded px-1.5 py-0.5 text-[11px] leading-tight transition-opacity hover:opacity-80",
        event.type === "meeting"
          ? "bg-secondary text-secondary-foreground"
          : "bg-primary/15 text-primary",
        done && "opacity-45 line-through"
      )}
    >
      {event.label}
    </Link>
  );
}
