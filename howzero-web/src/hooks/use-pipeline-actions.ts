"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTogglePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pipelineId, isActive }: { pipelineId: string; isActive: boolean }) => {
      const res = await fetch(`/api/schedule/pipelines/${pipelineId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("변경 실패");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipelines"] }),
  });
}

export function useDeletePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pipelineId: string) => {
      const res = await fetch(`/api/schedule/pipelines/${pipelineId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipelines"] }),
  });
}

export function useUpdatePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pipelineId,
      intervalMinutes,
      keyword,
      startAt,
      endAt,
      emailSubject,
      emailBody,
    }: {
      pipelineId: string;
      intervalMinutes: number;
      keyword: string;
      startAt?: string | null;
      endAt?: string | null;
      emailSubject?: string | null;
      emailBody?: string | null;
    }) => {
      const res = await fetch(`/api/schedule/pipelines/${pipelineId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intervalMinutes, keyword, startAt, endAt, emailSubject, emailBody }),
      });
      if (!res.ok) throw new Error("수정 실패");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipelines"] }),
  });
}

export function usePipelineLogs(pipelineId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["pipeline-logs", pipelineId],
    queryFn: async () => {
      const res = await fetch(`/api/schedule/pipelines/${pipelineId}/logs`);
      if (!res.ok) throw new Error("로그 조회 실패");
      return res.json();
    },
    enabled,
  });
}

export function useCreatePipelineFromPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      accountId: string;
      mediaId: string;
      intervalMinutes: number;
      postText?: string;
      keyword?: string;
      startAt?: string | null;
      endAt?: string | null;
    }) => {
      const res = await fetch("/api/schedule/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "생성 실패");
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipelines"] }),
  });
}

export function usePipelineAttachments(pipelineId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["pipeline-attachments", pipelineId],
    queryFn: async () => {
      const res = await fetch(`/api/schedule/pipelines/${pipelineId}/attachments`);
      if (!res.ok) throw new Error("첨부파일 조회 실패");
      return res.json();
    },
    enabled,
  });
}

export function useAddPipelineAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pipelineId, filename, data, contentType }: {
      pipelineId: string;
      filename: string;
      data: string;
      contentType?: string;
    }) => {
      const res = await fetch(`/api/schedule/pipelines/${pipelineId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, data, contentType }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "업로드 실패");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["pipeline-attachments", variables.pipelineId] });
    },
  });
}

export function useDeletePipelineAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pipelineId, attachmentId }: { pipelineId: string; attachmentId: string }) => {
      const res = await fetch(`/api/schedule/pipelines/${pipelineId}/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제 실패");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["pipeline-attachments", variables.pipelineId] });
    },
  });
}

export function useSendPipelineEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      pipelineId: string;
      accountId: string;
      postId: string;
      emails: Array<{ username: string; email: string; text: string }>;
      subject?: string;
      attachments?: Array<{ filename: string; content: string; contentType?: string }>;
      isTest?: boolean;
    }) => {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "발송 실패");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pipelines"] });
      qc.invalidateQueries({ queryKey: ["pipeline-logs"] });
    },
  });
}
