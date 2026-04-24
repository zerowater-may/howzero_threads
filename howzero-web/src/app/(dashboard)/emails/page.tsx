"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Mail } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EmailsPage() {
  const { data: emails, isLoading } = useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const res = await fetch("/api/emails");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">이메일 이력</h1>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !emails?.length ? (
        <EmptyState
          icon={Mail}
          title="발송된 이메일이 없습니다"
          description="파이프라인이 실행되면 이메일 이력이 표시됩니다"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>수신자</TableHead>
              <TableHead>댓글 수</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>발송 시간</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map(
              (e: {
                id: string;
                subject: string;
                recipient_email: string;
                comment_count: number;
                status: string;
                sent_at: string;
              }) => (
                <TableRow key={e.id}>
                  <TableCell>{e.subject}</TableCell>
                  <TableCell>{e.recipient_email}</TableCell>
                  <TableCell>{e.comment_count}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        e.status === "SENT" ? "default" : "destructive"
                      }
                    >
                      {e.status === "SENT" ? "발송됨" : "실패"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(e.sent_at).toLocaleString("ko")}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
