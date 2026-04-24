"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import {
  useLogin,
  getSavedAccounts,
  removeAccountSlot,
  type SavedAccount,
} from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, User, Plus } from "lucide-react";

export default function LoginPage() {
  const login = useLogin();
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const accounts = getSavedAccounts();
    setSavedAccounts(accounts);
    if (accounts.length === 0) {
      setShowForm(true);
    }
  }, []);

  const handleSelectAccount = (account: SavedAccount) => {
    setSelectedEmail(account.email);
    setValue("email", account.email);
    setShowForm(true);
  };

  const handleRemoveAccount = (e: React.MouseEvent | React.KeyboardEvent, accountId: string) => {
    e.stopPropagation();
    removeAccountSlot(accountId);
    const updated = getSavedAccounts();
    setSavedAccounts(updated);
    if (selectedEmail) {
      const removed = savedAccounts.find((a) => a.id === accountId);
      if (removed?.email === selectedEmail) {
        setSelectedEmail(null);
      }
    }
    if (updated.length === 0) {
      setShowForm(true);
    }
  };

  const handleNewAccount = () => {
    setSelectedEmail(null);
    setValue("email", "");
    setValue("password", "");
    setShowForm(true);
  };

  const handleBackToSlots = () => {
    setSelectedEmail(null);
    setShowForm(false);
    login.reset();
  };

  const onSubmit = (data: LoginInput) => {
    login.mutate(data);
  };

  // 저장된 계정이 있고 폼을 아직 안 열었을 때 → 슬롯 목록
  if (savedAccounts.length > 0 && !showForm) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">계정 선택</CardTitle>
            <CardDescription>로그인할 계정을 선택하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {savedAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => handleSelectAccount(account)}
                className="w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {account.name || account.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {account.email}
                  </p>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleRemoveAccount(e, account.id)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRemoveAccount(e, account.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={handleNewAccount}
              className="w-full flex items-center gap-3 rounded-lg border border-dashed p-3 text-left transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-dashed">
                <Plus className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">다른 계정으로 로그인</p>
            </button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              계정이 없으신가요?{" "}
              <Link href="/register" className="text-primary hover:underline">
                회원가입
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 로그인 폼
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            {selectedEmail
              ? `${selectedEmail} 계정으로 로그인`
              : "Howzero에 로그인하세요"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register("email")}
                disabled={!!selectedEmail}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                autoFocus={!!selectedEmail}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            {login.error && (
              <p className="text-sm text-destructive">
                {login.error.message}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? "로그인 중..." : "로그인"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              {savedAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={handleBackToSlots}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  계정 목록으로
                </button>
              )}
              <p className="text-muted-foreground ml-auto">
                계정이 없으신가요?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  회원가입
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
