"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export interface SavedAccount {
  id: string;
  email: string;
  name: string | null;
  lastLogin: string;
}

function getSavedAccounts(): SavedAccount[] {
  try {
    return JSON.parse(localStorage.getItem("accounts") || "[]");
  } catch {
    return [];
  }
}

function saveAccountToSlot(user: { id: string; email: string; name: string | null }) {
  const accounts = getSavedAccounts();
  const existing = accounts.findIndex((a) => a.id === user.id);
  const entry: SavedAccount = {
    id: user.id,
    email: user.email,
    name: user.name,
    lastLogin: new Date().toISOString(),
  };
  if (existing >= 0) {
    accounts[existing] = entry;
  } else {
    accounts.push(entry);
  }
  localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.setItem("user", JSON.stringify(user));
}

export function removeAccountSlot(accountId: string) {
  const accounts = getSavedAccounts().filter((a) => a.id !== accountId);
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

export { getSavedAccounts };

async function loginFn(data: { email: string; password: string }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  return res.json();
}

async function registerFn(data: {
  email: string;
  password: string;
  name?: string;
  inviteCode?: string;
}) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }
  return res.json();
}

async function logoutFn() {
  await fetch("/api/auth/logout", { method: "POST" });
}

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: loginFn,
    onSuccess: (data) => {
      if (data.user) {
        saveAccountToSlot(data.user);
      }
      router.push("/");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: registerFn,
    onSuccess: () => router.push("/login"),
  });
}

export function useLogout() {
  const router = useRouter();
  return useMutation({
    mutationFn: logoutFn,
    onSuccess: () => {
      localStorage.removeItem("user");
      router.push("/login");
    },
  });
}
