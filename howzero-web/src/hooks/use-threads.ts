"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// 계정 직접 연결
export function useConnectAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { accessToken: string; threadsUserId: string }) => {
      const res = await fetch("/api/threads/accounts/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || "연결 실패");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

// 계정의 포스트 목록
export function useAccountPosts(accountId: string) {
  return useQuery({
    queryKey: ["account-posts", accountId],
    queryFn: async () => {
      const res = await fetch(`/api/threads/accounts/${accountId}/posts`);
      if (!res.ok) throw new Error("포스트 조회 실패");
      return res.json();
    },
    enabled: !!accountId,
  });
}

// 포스트 댓글
export function usePostComments(accountId: string, postId: string) {
  return useQuery({
    queryKey: ["post-comments", accountId, postId],
    queryFn: async () => {
      const res = await fetch(`/api/threads/accounts/${accountId}/posts/${postId}/comments`);
      if (!res.ok) throw new Error("댓글 조회 실패");
      return res.json();
    },
    enabled: !!accountId && !!postId,
  });
}

// 이메일 추출
export function useExtractEmails() {
  return useMutation({
    mutationFn: async ({ accountId, postId }: { accountId: string; postId: string }) => {
      const res = await fetch(`/api/threads/accounts/${accountId}/posts/${postId}/extract-emails`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("이메일 추출 실패");
      return res.json();
    },
  });
}

// 대시보드 통계
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("통계 조회 실패");
      return res.json();
    },
  });
}
