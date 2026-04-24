"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePostInput } from "@/schemas/post";

async function fetchScheduledPosts(accountId?: string) {
  const url = accountId
    ? `/api/schedule/posts?accountId=${accountId}`
    : "/api/schedule/posts";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

async function createScheduledPost(data: CreatePostInput) {
  const res = await fetch("/api/schedule/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
}

async function cancelPost(postId: string) {
  const res = await fetch(`/api/schedule/posts/${postId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "CANCELLED" }),
  });
  if (!res.ok) throw new Error("Failed to cancel post");
  return res.json();
}

export function useScheduledPosts(accountId?: string) {
  const query = useQuery({
    queryKey: ["scheduled-posts", accountId],
    queryFn: () => fetchScheduledPosts(accountId),
  });

  const hasProcessing = query.data?.some(
    (post: { status: string }) => post.status === "PROCESSING"
  );

  return useQuery({
    queryKey: ["scheduled-posts", accountId],
    queryFn: () => fetchScheduledPosts(accountId),
    refetchInterval: hasProcessing ? 3000 : false,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createScheduledPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
    },
  });
}

export function useCancelPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
    },
  });
}
