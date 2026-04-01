// Paperclip API 타입 정의 — 고객 대시보드용

export interface PaperclipAgent {
  id: string;
  name: string;
  role: string;
  title: string | null;
  icon: string | null;
  status: "idle" | "running" | "paused" | "error";
  capabilities: string | null;
  lastHeartbeatAt: string | null;
  metadata: Record<string, unknown> | null;
}

export interface PaperclipIssue {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  status: "backlog" | "todo" | "in_progress" | "in_review" | "done" | "blocked" | "cancelled";
  priority: "critical" | "high" | "medium" | "low";
  assigneeAgentId: string | null;
  projectId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaperclipComment {
  id: string;
  issueId: string;
  body: string;
  authorAgentId: string | null;
  authorUserId: string | null;
  createdAt: string;
}

export interface PaperclipDashboard {
  agents: {
    total: number;
    running: number;
    idle: number;
    paused: number;
  };
  issues: {
    total: number;
    done: number;
    inProgress: number;
    todo: number;
    blocked: number;
  };
  recentActivity: PaperclipComment[];
}

export interface PaperclipProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string | null;
}

// 고객 대시보드 전용 타입
export interface CustomerDashboardData {
  todayCompleted: PaperclipIssue[];
  monthSavings: number;
  upcomingTasks: PaperclipIssue[];
  agents: PaperclipAgent[];
  weeklyStats: {
    completed: number;
    inProgress: number;
    total: number;
  };
}

// 비용 절감 추정 (태스크 1건당 추정 인건비 절감)
export const COST_PER_TASK_KRW = 15000; // ₩15,000/건 (인건비 기준 추정)
