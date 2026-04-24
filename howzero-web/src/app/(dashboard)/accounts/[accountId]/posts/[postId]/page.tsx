"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { usePostComments, useExtractEmails } from "@/hooks/use-threads";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Copy,
  Loader2,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

function highlightEmails(text: string) {
  const parts = text.split(EMAIL_REGEX);
  const matches = text.match(EMAIL_REGEX);

  if (!matches) return <>{text}</>;

  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {matches[i] ? (
            <span className="text-primary font-medium">{matches[i]}</span>
          ) : null}
        </span>
      ))}
    </>
  );
}

export default function PostDetailPage() {
  const { accountId, postId } = useParams<{
    accountId: string;
    postId: string;
  }>();
  const { data: comments, isLoading: commentsLoading } = usePostComments(
    accountId,
    postId
  );
  const extractMutation = useExtractEmails();

  // 댓글 로드 완료 시 자동 추출
  useEffect(() => {
    if (comments?.length && !extractMutation.data && !extractMutation.isPending) {
      extractMutation.mutate({ accountId, postId });
    }
  }, [comments]);

  const handleExtract = () => {
    extractMutation.mutate(
      { accountId, postId },
      {
        onSuccess: () => toast.success("이메일 추출 완료"),
        onError: (error) =>
          toast.error(error.message || "이메일 추출 실패"),
      }
    );
  };

  const copyEmails = (sep: string, label: string) => {
    if (!extractMutation.data?.emails?.length) return;
    const emailList = extractMutation.data.emails
      .map((e: { email: string }) => e.email)
      .join(sep);
    navigator.clipboard.writeText(emailList);
    toast.success(`${extractMutation.data.emails.length}개 이메일 복사됨 (${label})`);
  };

  const handleCopyCSV = () => {
    if (!extractMutation.data?.emails?.length) return;
    const header = "유저명,이메일,댓글";
    const rows = extractMutation.data.emails
      .map(
        (e: { username: string; email: string; text: string }) =>
          `"@${e.username}","${e.email}","${(e.text || "").replace(/"/g, '""')}"`
      )
      .join("\n");
    navigator.clipboard.writeText(header + "\n" + rows);
    toast.success("CSV 형식으로 복사됨");
  };

  const extractedEmails = extractMutation.data?.emails as
    | { username: string; email: string; text: string; timestamp: string }[]
    | undefined;

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Link href={`/accounts/${accountId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            포스트 목록
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground font-mono">
          Post ID: {postId}
        </p>
      </div>

      {/* 반반 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 왼쪽: 댓글 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              댓글
              {comments && (
                <Badge variant="secondary">{comments.length}개</Badge>
              )}
            </h2>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            {commentsLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : !comments?.length ? (
              <EmptyState
                icon={MessageSquare}
                title="댓글이 없습니다"
                description="이 포스트에 아직 댓글이 없습니다"
              />
            ) : (
              comments.map(
                (comment: {
                  id: string;
                  username: string;
                  text: string;
                  timestamp: string;
                }) => (
                  <Card key={comment.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">
                            {comment.username?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-muted-foreground">
                            @{comment.username}
                          </p>
                          <p className="text-sm mt-0.5 break-words leading-relaxed">
                            {highlightEmails(comment.text || "")}
                          </p>
                          <p className="text-[11px] text-muted-foreground/60 mt-1">
                            {new Date(comment.timestamp).toLocaleString("ko")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )
            )}
          </div>
        </div>

        {/* 오른쪽: 추출 결과 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              추출 이메일
              {extractedEmails && (
                <Badge variant="secondary">{extractedEmails.length}개</Badge>
              )}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExtract}
              disabled={extractMutation.isPending}
            >
              {extractMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Mail className="h-3 w-3 mr-1" />
              )}
              {extractMutation.isPending ? "추출 중..." : "다시 추출"}
            </Button>
          </div>

          {/* 복사 버튼 */}
          {extractedEmails && extractedEmails.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Button variant="outline" size="sm" onClick={() => copyEmails(", ", "반점")}>
                <Copy className="h-3 w-3 mr-1" />
                반점 구분
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyEmails("\n", "줄바꿈")}>
                <Copy className="h-3 w-3 mr-1" />
                줄바꿈
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyEmails(" ", "스페이스")}>
                <Copy className="h-3 w-3 mr-1" />
                스페이스
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyEmails("; ", "BCC")}>
                <Copy className="h-3 w-3 mr-1" />
                BCC
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyCSV}>
                <List className="h-3 w-3 mr-1" />
                CSV
              </Button>
            </div>
          )}

          {/* 이메일 그리드 */}
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
            {extractMutation.isPending && !extractedEmails ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    댓글에서 이메일을 추출하는 중...
                  </p>
                </CardContent>
              </Card>
            ) : !extractedEmails ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    댓글이 로드되면 자동으로 이메일을 추출합니다
                  </p>
                </CardContent>
              </Card>
            ) : extractedEmails.length === 0 ? (
              <EmptyState
                icon={Mail}
                title="추출된 이메일 없음"
                description="댓글에서 이메일 주소를 찾을 수 없습니다"
              />
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {extractedEmails.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(item.email);
                      toast.success(`${item.email} 복사됨`);
                    }}
                    className="flex items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors hover:bg-accent group"
                  >
                    <span className="text-[11px] text-muted-foreground/40 w-4 text-right shrink-0 font-mono">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <span className="text-sm font-medium text-primary truncate">
                        {item.email}
                      </span>
                      <span className="text-[11px] text-muted-foreground/50 truncate shrink-0">
                        @{item.username}
                      </span>
                    </div>
                    <Copy className="h-3 w-3 text-muted-foreground/20 group-hover:text-muted-foreground shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 통계 요약 */}
          {extractedEmails && extractedEmails.length > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground border rounded-md px-3 py-2 bg-muted/30">
              <span>댓글 {extractMutation.data?.totalComments}개</span>
              <span>이메일 {extractedEmails.length}개</span>
              <span>
                추출률{" "}
                {Math.round(
                  (extractedEmails.length /
                    extractMutation.data?.totalComments) *
                    100
                )}
                %
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
