"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchAccounts() {
  const res = await fetch("/api/threads/accounts");
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return res.json();
}

async function deleteAccount(accountId: string) {
  const res = await fetch(`/api/threads/accounts/${accountId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete account");
  return res.json();
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
