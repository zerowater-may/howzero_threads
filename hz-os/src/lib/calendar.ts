import { getDb } from "@/lib/db";

export interface CalendarEvent {
  date: string; // 'YYYY-MM-DD'
  type: "meeting" | "milestone";
  label: string;
  href: string;
  status?: string; // milestone 상태 (done이면 UI에서 흐리게)
}

// 해당 월(month=0-based) 이벤트 집계. 소스 2개: meetings.held_at, contracts.milestones[].due
// 날짜는 SQL에서 'YYYY-MM-DD' 문자열로 뽑아 타임존 이슈를 피한다.
export async function getMonthEvents(year: number, month: number): Promise<CalendarEvent[]> {
  const db = await getDb();
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`; // 'YYYY-MM'

  const [{ rows: meetingRows }, { rows: msRows }] = await Promise.all([
    db.query(
      `SELECT to_char(held_at, 'YYYY-MM-DD') AS date, title, project_id
       FROM meetings
       WHERE held_at IS NOT NULL AND to_char(held_at, 'YYYY-MM') = $1`,
      [prefix]
    ),
    // milestones는 JSONB 배열 → jsonb_array_elements로 펼친다. NULL/[]은 자동 제외.
    db.query(
      `SELECT c.id AS contract_id, m->>'label' AS label, m->>'due' AS due, m->>'status' AS status
       FROM contracts c, jsonb_array_elements(c.milestones) m
       WHERE m->>'due' IS NOT NULL AND left(m->>'due', 7) = $1`,
      [prefix]
    ),
  ]);

  const events: CalendarEvent[] = [];
  for (const r of meetingRows) {
    events.push({
      date: String(r.date),
      type: "meeting",
      label: String(r.title ?? "미팅"),
      href: `/p/${Number(r.project_id)}`,
    });
  }
  for (const r of msRows) {
    events.push({
      date: String(r.due).slice(0, 10),
      type: "milestone",
      label: String(r.label ?? "마일스톤"),
      href: `/contracts/${Number(r.contract_id)}`,
      status: r.status == null ? undefined : String(r.status),
    });
  }
  return events;
}
