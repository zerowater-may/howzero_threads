"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { smtpSettingsSchema, type SmtpSettingsInput } from "@/schemas/settings";
import { useAccounts } from "@/hooks/use-accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Key, Save, Eye, EyeOff, Loader2, Plug } from "lucide-react";
import { toast } from "sonner";

interface AccountApiKey {
  accountId: string;
  appId: string;
  appSecret: string;
}

export default function SettingsPage() {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const [apiKeys, setApiKeys] = useState<Record<string, AccountApiKey>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SmtpSettingsInput>({
    resolver: zodResolver(smtpSettingsSchema),
    defaultValues: {
      host: "smtp.gmail.com",
      port: 587,
    },
  });

  // 저장된 SMTP 설정 불러오기
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          reset({
            host: data.host || "smtp.gmail.com",
            port: data.port || 587,
            username: data.username || "",
            password: data.password || "",
          });
        }
      })
      .catch(() => {});
  }, [reset]);

  // 계정별 API Key 초기화
  useEffect(() => {
    if (accounts?.length) {
      const keys: Record<string, AccountApiKey> = {};
      for (const a of accounts as { id: string }[]) {
        if (!apiKeys[a.id]) {
          keys[a.id] = { accountId: a.id, appId: "", appSecret: "" };
        }
      }
      if (Object.keys(keys).length > 0) {
        setApiKeys((prev) => ({ ...keys, ...prev }));
      }
    }
  }, [accounts]);

  // 계정별 API Key 로드
  useEffect(() => {
    if (accounts?.length) {
      for (const a of accounts as { id: string }[]) {
        fetch(`/api/threads/accounts/${a.id}/api-key`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              setApiKeys((prev) => ({
                ...prev,
                [a.id]: {
                  accountId: a.id,
                  appId: data.app_id || "",
                  appSecret: data.app_secret_masked || "",
                },
              }));
            }
          })
          .catch(() => {});
      }
    }
  }, [accounts]);

  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);

  const onSmtpSubmit = async (data: SmtpSettingsInput) => {
    setSmtpSaving(true);
    try {
      // recipientEmail 없으면 보내는 이메일로 자동 설정
      const payload = { ...data, recipientEmail: data.username };
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("SMTP 설정이 저장되었습니다");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error ? JSON.stringify(err.error) : "저장에 실패했습니다");
      }
    } catch {
      toast.error("저장에 실패했습니다");
    } finally {
      setSmtpSaving(false);
    }
  };

  const handleSmtpTest = async () => {
    setSmtpTesting(true);
    try {
      const res = await fetch("/api/settings/test", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("연결 성공! 이메일 발송이 가능합니다");
      } else {
        toast.error(data.error || "연결 실패");
      }
    } catch {
      toast.error("연결 테스트에 실패했습니다");
    } finally {
      setSmtpTesting(false);
    }
  };

  const handleSaveApiKey = async (accountId: string) => {
    const key = apiKeys[accountId];
    if (!key?.appId || !key?.appSecret) {
      toast.error("App ID와 App Secret을 모두 입력해주세요");
      return;
    }

    setSavingKey(accountId);
    try {
      const res = await fetch(`/api/threads/accounts/${accountId}/api-key`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId: key.appId, appSecret: key.appSecret }),
      });
      if (res.ok) {
        toast.success("API Key가 저장되었습니다");
      } else {
        const data = await res.json();
        toast.error(data.error || "저장에 실패했습니다");
      }
    } catch {
      toast.error("저장에 실패했습니다");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">설정</h1>

      {/* 계정별 API Key 설정 */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5" />
            Threads API Key
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            계정별 Threads App ID와 App Secret을 관리합니다
          </p>
        </div>

        {accountsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : !accounts?.length ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                연결된 계정이 없습니다. 먼저 계정을 연결해주세요.
              </p>
            </CardContent>
          </Card>
        ) : (
          (
            accounts as {
              id: string;
              username: string;
              profile_picture_url: string | null;
              is_active: boolean;
            }[]
          ).map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {account.profile_picture_url ? (
                      <AvatarImage
                        src={account.profile_picture_url}
                        alt={account.username}
                      />
                    ) : null}
                    <AvatarFallback>
                      {account.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">@{account.username}</CardTitle>
                  </div>
                  <Badge
                    variant={account.is_active ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {account.is_active ? "활성" : "비활성"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`appId-${account.id}`}>App ID</Label>
                  <Input
                    id={`appId-${account.id}`}
                    placeholder="Threads App ID"
                    value={apiKeys[account.id]?.appId || ""}
                    onChange={(e) =>
                      setApiKeys((prev) => ({
                        ...prev,
                        [account.id]: {
                          ...prev[account.id],
                          accountId: account.id,
                          appId: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`appSecret-${account.id}`}>
                    App Secret
                  </Label>
                  <div className="relative">
                    <Input
                      id={`appSecret-${account.id}`}
                      type={showSecrets[account.id] ? "text" : "password"}
                      placeholder="Threads App Secret"
                      value={apiKeys[account.id]?.appSecret || ""}
                      onChange={(e) =>
                        setApiKeys((prev) => ({
                          ...prev,
                          [account.id]: {
                            ...prev[account.id],
                            accountId: account.id,
                            appSecret: e.target.value,
                          },
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() =>
                        setShowSecrets((prev) => ({
                          ...prev,
                          [account.id]: !prev[account.id],
                        }))
                      }
                    >
                      {showSecrets[account.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSaveApiKey(account.id)}
                  disabled={savingKey === account.id}
                >
                  <Save className="mr-2 h-3 w-3" />
                  {savingKey === account.id ? "저장 중..." : "저장"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* SMTP 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>이메일 발송 설정</CardTitle>
          <CardDescription>
            댓글에서 추출한 이메일 목록을 발송할 때 사용할 설정입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSmtpSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SMTP 호스트</Label>
                <Input {...register("host")} />
                {errors.host && (
                  <p className="text-sm text-destructive">
                    {errors.host.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>포트</Label>
                <Input
                  type="number"
                  {...register("port", { valueAsNumber: true })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>보내는 이메일 (Gmail 계정)</Label>
              <Input
                placeholder="myaccount@gmail.com"
                {...register("username")}
              />
              <p className="text-xs text-muted-foreground">
                이메일을 보낼 때 발신자로 사용되는 Gmail 주소
              </p>
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>앱 비밀번호</Label>
              <div className="relative">
                <Input
                  type={showSmtpPassword ? "text" : "password"}
                  placeholder="변경 시에만 입력"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowSmtpPassword((v) => !v)}
                >
                  {showSmtpPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                비워두면 기존 비밀번호가 유지됩니다
              </p>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={smtpSaving}>
                {smtpSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {smtpSaving ? "저장 중..." : "저장"}
              </Button>
              <Button type="button" variant="outline" onClick={handleSmtpTest} disabled={smtpTesting}>
                {smtpTesting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plug className="h-4 w-4 mr-1" />}
                {smtpTesting ? "테스트 중..." : "연동 테스트"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
