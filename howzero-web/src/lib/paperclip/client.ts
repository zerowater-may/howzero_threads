// Paperclip API 클라이언트 — 서버 사이드 전용

const PAPERCLIP_API_URL = process.env.PAPERCLIP_API_URL || "http://127.0.0.1:3100";
const PAPERCLIP_API_KEY = process.env.PAPERCLIP_API_KEY || "";

async function paperclipFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${PAPERCLIP_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PAPERCLIP_API_KEY}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Paperclip API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getCompanyDashboard(companyId: string) {
  return paperclipFetch<Record<string, unknown>>(`/api/companies/${companyId}/dashboard`);
}

export async function getCompanyAgents(companyId: string) {
  return paperclipFetch<Array<Record<string, unknown>>>(`/api/companies/${companyId}/agents`);
}

export async function getCompanyIssues(
  companyId: string,
  params?: { status?: string; assigneeAgentId?: string; projectId?: string }
) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.assigneeAgentId) searchParams.set("assigneeAgentId", params.assigneeAgentId);
  if (params?.projectId) searchParams.set("projectId", params.projectId);

  const query = searchParams.toString();
  return paperclipFetch<Array<Record<string, unknown>>>(
    `/api/companies/${companyId}/issues${query ? `?${query}` : ""}`
  );
}

export async function getIssueComments(issueId: string) {
  return paperclipFetch<Array<Record<string, unknown>>>(`/api/issues/${issueId}/comments`);
}

export async function getCompanyProjects(companyId: string) {
  return paperclipFetch<Array<Record<string, unknown>>>(`/api/companies/${companyId}/projects`);
}
