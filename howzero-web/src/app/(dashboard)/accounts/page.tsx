"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccounts, useDeleteAccount } from "@/hooks/use-accounts";
import { useConnectAccount } from "@/hooks/use-threads";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { Users, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const deleteMutation = useDeleteAccount();
  const connectMutation = useConnectAccount();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [threadsUserId, setThreadsUserId] = useState("");

  const handleConnect = () => {
    if (!accessToken.trim() || !threadsUserId.trim()) {
      toast.error("Access Token과 Threads User ID를 모두 입력해주세요");
      return;
    }

    connectMutation.mutate(
      { accessToken: accessToken.trim(), threadsUserId: threadsUserId.trim() },
      {
        onSuccess: (data) => {
          toast.success(`@${data.username} 계정이 연결되었습니다`);
          setDialogOpen(false);
          setAccessToken("");
          setThreadsUserId("");
        },
        onError: (error) => {
          toast.error(error.message || "계정 연결에 실패했습니다");
        },
      }
    );
  };

  const handleDelete = (accountId: string, username: string) => {
    if (confirm(`@${username} 계정을 연결 해제하시겠습니까?`)) {
      deleteMutation.mutate(accountId, {
        onSuccess: () => toast.success("계정이 연결 해제되었습니다"),
        onError: () => toast.error("연결 해제에 실패했습니다"),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">계정 관리</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              계정 연결
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Threads 계정 연결</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Textarea
                  id="accessToken"
                  placeholder="Threads API Access Token을 입력하세요"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threadsUserId">Threads User ID</Label>
                <Input
                  id="threadsUserId"
                  placeholder="Threads User ID를 입력하세요"
                  value={threadsUserId}
                  onChange={(e) => setThreadsUserId(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleConnect}
                disabled={connectMutation.isPending}
              >
                {connectMutation.isPending ? "연결 중..." : "연결하기"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !accounts?.length ? (
        <EmptyState
          icon={Users}
          title="연결된 계정이 없습니다"
          description="Threads 계정을 연결하여 시작하세요"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              계정 연결
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map(
            (account: {
              id: string;
              username: string;
              profile_picture_url: string | null;
              is_active: boolean;
              token_expires_at: string;
              last_token_error: string | null;
            }) => (
              <Card key={account.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <Link
                    href={`/accounts/${account.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
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
                    <div className="min-w-0">
                      <CardTitle className="text-base">
                        @{account.username}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        토큰 만료:{" "}
                        {new Date(account.token_expires_at).toLocaleDateString(
                          "ko-KR"
                        )}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={account.is_active ? "default" : "destructive"}
                    >
                      {account.is_active ? "활성" : "비활성"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(account.id, account.username);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {account.last_token_error && (
                  <CardContent>
                    <p className="text-sm text-destructive">
                      {account.last_token_error}
                    </p>
                  </CardContent>
                )}
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
