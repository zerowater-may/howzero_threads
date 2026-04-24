"use client";

import Link from "next/link";
import { useScheduledPosts } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PROCESSING: "secondary",
  PUBLISHED: "default",
  FAILED: "destructive",
  CANCELLED: "secondary",
};

export default function PostsPage() {
  const { data: posts, isLoading } = useScheduledPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">포스트</h1>
        <Link href="/posts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 포스트
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !posts?.length ? (
        <EmptyState
          icon={FileText}
          title="예약된 포스트가 없습니다"
          description="새 포스트를 예약하세요"
          action={
            <Link href="/posts/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                새 포스트
              </Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>내용</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>예약 시간</TableHead>
              <TableHead>유형</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map(
              (post: {
                id: string;
                text: string;
                status: string;
                scheduledAt: string;
                mediaType: string;
              }) => (
                <TableRow key={post.id}>
                  <TableCell className="max-w-xs truncate">
                    {post.text}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[post.status] || "outline"}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(post.scheduledAt).toLocaleString("ko")}
                  </TableCell>
                  <TableCell>{post.mediaType}</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
