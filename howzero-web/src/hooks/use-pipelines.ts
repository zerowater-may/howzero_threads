"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePipelineInput } from "@/schemas/pipeline";

async function fetchPipelines() {
  const res = await fetch("/api/schedule/pipelines");
  if (!res.ok) throw new Error("Failed to fetch pipelines");
  return res.json();
}

async function createPipeline(data: CreatePipelineInput) {
  const res = await fetch("/api/schedule/pipelines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create pipeline");
  return res.json();
}

export function usePipelines() {
  return useQuery({
    queryKey: ["pipelines"],
    queryFn: fetchPipelines,
  });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
    },
  });
}
