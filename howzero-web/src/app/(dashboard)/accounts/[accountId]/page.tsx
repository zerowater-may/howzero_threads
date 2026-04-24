"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccounts } from "@/hooks/use-accounts";
import { useAccountPosts } from "@/hooks/use-threads";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";

export default function AccountDetailPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: posts, isLoading: postsLoading } = useAccountPosts(accountId);

  const account = accounts?.find(
    (a: { id: string }) => a.id === accountId
  ) as
    | {
        id: string;
        username: string;
        profile_picture_url: string | null;
        is_active: boolean;
        token_expires_at: string;
      }
    | undefined;

  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <Link href="/accounts">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          계정 목록
        </Button>
      </Link>

      {/* 프로필 헤더 */}
      {accountsLoading ? (
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ) : account ? (
        <div className="flex items-center gap-4">
          <Avatar size="lg">
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
          <div>
            <h1 className="text-2xl font-bold">@{account.username}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={account.is_active ? "default" : "destructive"}>
                {account.is_active ? "활성" : "비활성"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                토큰 만료:{" "}
                {new Date(account.token_expires_at).toLocaleDateString("ko-KR")}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">계정을 찾을 수 없습니다</p>
      )}

      {/* 포스트 섹션 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">내 포스트</h2>

        {postsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !posts?.length ? (
          <EmptyState
            icon={FileText}
            title="포스트가 없습니다"
            description="이 계정에 아직 포스트가 없습니다"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(
              (post: {
                id: string;
                text: string;
                timestamp: string;
                media_type: string;
                permalink: string;
              }) => (
                <Link
                  key={post.id}
                  href={`/accounts/${accountId}/posts/${post.id}`}
                >
                  <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{post.media_type}</Badge>
                        {post.permalink && (
                          <a
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <CardTitle className="text-sm font-normal leading-relaxed">
                        {post.text
                          ? post.text.length > 100
                            ? post.text.slice(0, 100) + "..."
                            : post.text
                          : "(텍스트 없음)"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.timestamp).toLocaleString("ko")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
