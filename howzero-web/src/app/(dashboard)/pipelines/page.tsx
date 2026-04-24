"use client";

import { useState, useEffect } from "react";
import { useAccounts } from "@/hooks/use-accounts";
import { useAccountPosts } from "@/hooks/use-threads";
import { usePipelines } from "@/hooks/use-pipelines";
import {
  useTogglePipeline,
  useDeletePipeline,
  useCreatePipelineFromPost,
  useUpdatePipeline,
  usePipelineLogs,
  useSendPipelineEmail,
  usePipelineAttachments,
  useAddPipelineAttachment,
  useDeletePipelineAttachment,
} from "@/hooks/use-pipeline-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Zap,
  Trash2,
  Clock,
  Mail,
  Play,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  ScrollText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarClock,
  Paperclip,
  Send,
  X,
} from "lucide-react";

// --- Types (snake_case matching API response) ---

interface Pipeline {
  id: string;
  account_id: string;
  media_id: string;
  interval_minutes: number;
  is_active: boolean;
  last_processed_at: string | null;
  post_text: string | null;
  keyword: string | null;
  start_at: string | null;
  end_at: string | null;
  email_subject: string | null;
  email_body: string | null;
  sent_email_count: number;
  total_extracted_emails: number;
  username: string;
  profile_picture_url: string | null;
  threads_user_id: string;
  created_at: string;
  run_count?: number;
}

interface PipelineLog {
  id: string;
  status: string; // SUCCESS, FAILED
  comments_found: number;
  emails_extracted: number;
  emails_sent: number;
  error_message: string | null;
  created_at: string;
}

interface Account {
  id: string;
  threads_user_id: string;
  username: string;
  profile_picture_url: string | null;
  is_active: boolean;
}

interface Post {
  id: string;
  text: string | null;
  timestamp: string;
  media_type: string;
  permalink: string;
  is_quote_post: boolean;
}

// --- Helper ---

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${day} ${h}:${min}`;
}

function truncateText(text: string | null, maxLen: number): string {
  if (!text) return "(내용 없음)";
  return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
}

// --- Step Indicator ---

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full transition-colors ${
            i === current
              ? "bg-primary"
              : i < current
                ? "bg-primary/40"
                : "bg-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

// --- Pipeline Card ---

function PipelineCard({
  pipeline,
  onToggle,
  onDelete,
  onEdit,
  onShowLogs,
  onExecute,
  onEmailConfig,
  isToggling,
  isDeleting,
}: {
  pipeline: Pipeline;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (pipeline: Pipeline) => void;
  onShowLogs: (pipeline: Pipeline) => void;
  onExecute: (pipeline: Pipeline) => void;
  onEmailConfig: (pipeline: Pipeline) => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  return (
    <Card
      className={`relative overflow-hidden transition-colors ${
        pipeline.is_active ? "border-l-4 border-l-green-500" : "border-l-4 border-l-muted-foreground/30"
      }`}
    >
      <CardContent className="space-y-4 pt-2">
        {/* Top row: avatar + username + toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar size="default">
              {pipeline.profile_picture_url ? (
                <AvatarImage src={pipeline.profile_picture_url} alt={pipeline.username} />
              ) : null}
              <AvatarFallback>
                {pipeline.username?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">@{pipeline.username}</span>
          </div>
          <Button
            variant={pipeline.is_active ? "default" : "secondary"}
            size="xs"
            disabled={isToggling}
            onClick={() => onToggle(pipeline.id, !pipeline.is_active)}
          >
            {isToggling ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : pipeline.is_active ? (
              "활성"
            ) : (
              "비활성"
            )}
          </Button>
        </div>

        {/* Post preview */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {truncateText(pipeline.post_text, 80)}
          </p>
          <p className="font-mono text-xs text-muted-foreground/60">
            {pipeline.media_id}
          </p>
        </div>

        {/* Keyword badge */}
        {pipeline.keyword && (
          <Badge variant="outline" className="text-xs">
            키워드: {pipeline.keyword}
          </Badge>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            수집 간격: {pipeline.interval_minutes}분
          </span>
          <span className="inline-flex items-center gap-1">
            <Mail className="h-3 w-3" />
            추출 이메일: {pipeline.total_extracted_emails}건
          </span>
          <span className="inline-flex items-center gap-1">
            <Play className="h-3 w-3" />
            발송 {pipeline.sent_email_count}회
          </span>
        </div>

        {/* Schedule range */}
        {(pipeline.start_at || pipeline.end_at) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="h-3 w-3" />
            {pipeline.start_at ? formatDate(pipeline.start_at) : "시작 없음"}
            {" ~ "}
            {pipeline.end_at ? formatDate(pipeline.end_at) : "종료 없음"}
          </div>
        )}

        <Separator />

        {/* Bottom row: last run + log/edit/delete buttons */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            마지막 실행: {formatDate(pipeline.last_processed_at)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onExecute(pipeline)}
              className="text-muted-foreground hover:text-foreground"
              title="실행"
            >
              <Play className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEmailConfig(pipeline)}
              className="text-muted-foreground hover:text-foreground"
              title="이메일 설정"
            >
              <Mail className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onShowLogs(pipeline)}
              className="text-muted-foreground hover:text-foreground"
              title="로그 보기"
            >
              <ScrollText className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(pipeline)}
              className="text-muted-foreground hover:text-foreground"
              title="수정"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={isDeleting}
              onClick={() => onDelete(pipeline.id)}
              className="text-muted-foreground hover:text-destructive"
              title="삭제"
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Edit Pipeline Dialog ---

function toLocalDatetime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EditPipelineDialog({
  pipeline,
  open,
  onOpenChange,
}: {
  pipeline: Pipeline | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [intervalMinutes, setIntervalMinutes] = useState(
    pipeline?.interval_minutes?.toString() ?? "30"
  );
  const [keyword, setKeyword] = useState(pipeline?.keyword ?? "");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const updatePipeline = useUpdatePipeline();

  useEffect(() => {
    if (pipeline) {
      setIntervalMinutes(pipeline.interval_minutes?.toString() ?? "30");
      setKeyword(pipeline.keyword ?? "");
      setStartAt(toLocalDatetime(pipeline.start_at));
      setEndAt(toLocalDatetime(pipeline.end_at));
    }
  }, [pipeline]);

  function handleSave() {
    if (!pipeline) return;
    updatePipeline.mutate(
      {
        pipelineId: pipeline.id,
        intervalMinutes: parseInt(intervalMinutes, 10),
        keyword: keyword.trim(),
        startAt: startAt ? new Date(startAt).toISOString() : null,
        endAt: endAt ? new Date(endAt).toISOString() : null,
      },
      {
        onSuccess: () => {
          toast.success("파이프라인이 수정되었습니다");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err.message || "수정에 실패했습니다");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>파이프라인 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>수집 간격</Label>
            <Select value={intervalMinutes} onValueChange={setIntervalMinutes}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="수집 간격 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5분</SelectItem>
                <SelectItem value="10">10분</SelectItem>
                <SelectItem value="15">15분</SelectItem>
                <SelectItem value="30">30분</SelectItem>
                <SelectItem value="60">60분</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>키워드 필터</Label>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="키워드 입력 (비우면 전체 수집)"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" />
              실행 기간
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">시작</span>
                <Input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">종료</span>
                <Input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              비워두면 기간 제한 없이 실행됩니다
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updatePipeline.isPending}
          >
            취소
          </Button>
          <Button onClick={handleSave} disabled={updatePipeline.isPending}>
            {updatePipeline.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Email Config Dialog ---

interface PipelineAttachment {
  id: string;
  filename: string;
  content_type: string | null;
  size_bytes: number;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function EmailConfigDialog({
  pipeline,
  open,
  onOpenChange,
}: {
  pipeline: Pipeline | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const updatePipeline = useUpdatePipeline();
  const sendEmail = useSendPipelineEmail();

  // 첨부파일
  const { data: attachmentsData } = usePipelineAttachments(pipeline?.id ?? "", open && !!pipeline);
  const attachments = attachmentsData as PipelineAttachment[] | undefined;
  const addAttachment = useAddPipelineAttachment();
  const deleteAttachment = useDeletePipelineAttachment();

  useEffect(() => {
    if (pipeline) {
      setEmailSubject(pipeline.email_subject ?? "");
      setEmailBody(pipeline.email_body ?? "");
    }
  }, [pipeline]);

  function handleSave() {
    if (!pipeline) return;
    updatePipeline.mutate(
      {
        pipelineId: pipeline.id,
        intervalMinutes: pipeline.interval_minutes,
        keyword: pipeline.keyword ?? "",
        emailSubject: emailSubject.trim() || null,
        emailBody: emailBody.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("이메일 설정이 저장되었습니다");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || "저장에 실패했습니다"),
      }
    );
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !pipeline) return;
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: 10MB 이하만 가능합니다`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        addAttachment.mutate(
          { pipelineId: pipeline.id, filename: file.name, data: base64, contentType: file.type },
          { onError: (err) => toast.error(err.message) }
        );
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  }

  function handleTestSend() {
    if (!pipeline) return;
    sendEmail.mutate(
      {
        pipelineId: pipeline.id,
        accountId: pipeline.account_id,
        postId: pipeline.media_id,
        emails: [{ username: "test_user", email: "test@example.com", text: "테스트 댓글입니다" }],
        subject: emailSubject || `[Howzero] 테스트 발송 - @${pipeline.username}`,
        isTest: true,
      },
      {
        onSuccess: () => toast.success("테스트 이메일이 발송되었습니다"),
        onError: (err) => toast.error(err.message || "테스트 발송 실패"),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            이메일 설정
          </DialogTitle>
          {pipeline && (
            <p className="text-sm text-muted-foreground">@{pipeline.username}</p>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-5 py-2 pr-1">
          {/* 제목 */}
          <div className="space-y-2">
            <Label>이메일 제목</Label>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="예: [Howzero] 댓글 이메일 수집 결과"
            />
            <p className="text-xs text-muted-foreground">
              비워두면 기본 제목이 사용됩니다
            </p>
          </div>

          {/* 본문 */}
          <div className="space-y-2">
            <Label>본문 메시지</Label>
            <Textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder={"이메일 본문에 추가할 메시지를 입력하세요\n추출된 이메일 표 위에 표시됩니다"}
              rows={4}
            />
          </div>

          <Separator />

          {/* 첨부파일 */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1.5">
              <Paperclip className="h-4 w-4" />
              첨부파일
            </Label>
            {attachments && attachments.length > 0 ? (
              <div className="space-y-1.5">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-sm truncate">{file.filename}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatFileSize(file.size_bytes)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAttachment.mutate({ pipelineId: pipeline!.id, attachmentId: file.id })}
                      className="ml-2 text-muted-foreground hover:text-destructive shrink-0"
                      disabled={deleteAttachment.isPending}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">첨부파일이 없습니다</p>
            )}
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors">
              <Paperclip className="h-3.5 w-3.5" />
              {addAttachment.isPending ? "업로드 중..." : "파일 추가"}
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={addAttachment.isPending}
              />
            </label>
            <p className="text-xs text-muted-foreground">최대 10MB / 발송 시 자동 첨부</p>
          </div>
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestSend}
            disabled={sendEmail.isPending || updatePipeline.isPending}
          >
            {sendEmail.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Send className="h-3 w-3 mr-1" />
            )}
            테스트 발송
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={updatePipeline.isPending}>
              {updatePipeline.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "저장"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Pipeline Logs Dialog ---

function PipelineLogsDialog({
  pipeline,
  open,
  onOpenChange,
}: {
  pipeline: Pipeline | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = usePipelineLogs(pipeline?.id ?? "", open && !!pipeline);
  const logs = data as PipelineLog[] | undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            실행 로그{pipeline ? ` - @${pipeline.username}` : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : !logs?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
              <ScrollText className="h-8 w-8 mb-3 text-muted-foreground/40" />
              아직 실행 로그가 없습니다
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">시간</th>
                  <th className="py-2 pr-4 font-medium">상태</th>
                  <th className="py-2 pr-4 font-medium text-right">댓글</th>
                  <th className="py-2 pr-4 font-medium text-right">이메일</th>
                  <th className="py-2 pr-4 font-medium text-right">발송</th>
                  <th className="py-2 font-medium">에러</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-2 pr-4">
                      <Badge
                        variant={log.status === "SUCCESS" ? "default" : "destructive"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {log.status === "SUCCESS" ? "성공" : "실패"}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {log.comments_found}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {log.emails_extracted}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {log.emails_sent}
                    </td>
                    <td className="py-2 text-xs text-muted-foreground max-w-[180px] truncate">
                      {log.error_message ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Execute Pipeline Dialog ---

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp?: string;
}

interface ExtractedEmail {
  username: string;
  email: string;
  text: string;
}

interface Settings {
  recipient_email?: string;
  smtp_host?: string;
}

const EXECUTE_STEP_TITLES = ["댓글 추출", "이메일 추출", "발송 승인", "결과"];

function ExecutePipelineDialog({
  pipeline,
  open,
  onOpenChange,
}: {
  pipeline: Pipeline | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState(0);

  // Step 1
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);

  // Step 2
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);
  const [emails, setEmails] = useState<ExtractedEmail[]>([]);

  // Step 3
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  // Step 4
  const sendEmail = useSendPipelineEmail();

  // 첨부파일
  const [attachments, setAttachments] = useState<Array<{ filename: string; content: string; contentType?: string }>>([]);

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: 10MB 이하만 첨부 가능합니다`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        setAttachments((prev) => [...prev, { filename: file.name, content: base64, contentType: file.type }]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function resetAll() {
    setStep(0);
    setCommentsLoading(false);
    setCommentsError(null);
    setComments([]);
    setFilteredComments([]);
    setEmailsLoading(false);
    setEmailsError(null);
    setEmails([]);
    setSettingsLoading(false);
    setSettingsError(null);
    setSettings(null);
    setAttachments([]);
    sendEmail.reset();
  }

  function handleClose() {
    resetAll();
    onOpenChange(false);
  }

  // Step 1: fetch comments when dialog opens
  useEffect(() => {
    if (!open || !pipeline) return;
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pipeline]);

  async function fetchComments() {
    if (!pipeline) return;
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const res = await fetch(
        `/api/threads/accounts/${pipeline.account_id}/posts/${pipeline.media_id}/comments`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "댓글 조회 실패");
      const allComments: Comment[] = json.comments ?? json ?? [];
      setComments(allComments);
      if (pipeline.keyword) {
        const kw = pipeline.keyword.toLowerCase();
        setFilteredComments(
          allComments.filter((c) => c.text?.toLowerCase().includes(kw))
        );
      } else {
        setFilteredComments(allComments);
      }
    } catch (err) {
      setCommentsError(err instanceof Error ? err.message : "댓글 조회 실패");
    } finally {
      setCommentsLoading(false);
    }
  }

  // Step 2: extract emails
  async function fetchEmails() {
    if (!pipeline) return;
    setEmailsLoading(true);
    setEmailsError(null);
    try {
      const res = await fetch(
        `/api/threads/accounts/${pipeline.account_id}/posts/${pipeline.media_id}/extract-emails`,
        { method: "POST" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "이메일 추출 실패");
      setEmails(json.emails ?? json ?? []);
    } catch (err) {
      setEmailsError(err instanceof Error ? err.message : "이메일 추출 실패");
    } finally {
      setEmailsLoading(false);
    }
  }

  // Step 3: fetch settings
  async function fetchSettings() {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "설정 조회 실패");
      setSettings(json);
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : "설정 조회 실패");
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleNext() {
    if (step === 0) {
      setStep(1);
      await fetchEmails();
    } else if (step === 1) {
      setStep(2);
      await fetchSettings();
    } else if (step === 2) {
      setStep(3);
      if (!pipeline) return;
      const subject = `[Howzero] ${pipeline.media_id} 포스트 댓글 이메일 수집 결과`;
      sendEmail.mutate({
        pipelineId: pipeline.id,
        accountId: pipeline.account_id,
        postId: pipeline.media_id,
        emails,
        subject,
        ...(attachments.length > 0 ? { attachments } : {}),
      });
    }
  }

  function handleBack() {
    if (step === 1) setStep(0);
    else if (step === 2) setStep(1);
  }

  const subject = pipeline
    ? `[Howzero] ${pipeline.media_id} 포스트 댓글 이메일 수집 결과`
    : "";

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : handleClose())}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <StepIndicator current={step} total={4} />
          <DialogTitle className="text-center mt-2">
            {EXECUTE_STEP_TITLES[step]}
          </DialogTitle>
        </DialogHeader>

        {/* Step 0: 댓글 추출 */}
        {step === 0 && (
          <div className="flex-1 overflow-y-auto py-2 min-h-0">
            {commentsLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">댓글을 가져오는 중...</p>
              </div>
            ) : commentsError ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <XCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{commentsError}</p>
                <Button variant="outline" size="sm" onClick={fetchComments}>
                  재시도
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  총 {comments.length}개 댓글을 가져왔습니다
                  {pipeline?.keyword && (
                    <span className="ml-1">
                      (키워드 &quot;{pipeline.keyword}&quot; 필터 적용: {filteredComments.length}개)
                    </span>
                  )}
                </p>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {filteredComments.slice(0, 5).map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-md border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-xs text-muted-foreground mb-0.5">
                        @{comment.username}
                      </p>
                      <p className="leading-relaxed">{comment.text}</p>
                    </div>
                  ))}
                  {filteredComments.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center py-1">
                      외 {filteredComments.length - 5}개 댓글
                    </p>
                  )}
                  {filteredComments.length === 0 && !commentsLoading && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      조건에 맞는 댓글이 없습니다
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: 이메일 추출 */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto py-2 min-h-0">
            {emailsLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">이메일을 추출하는 중...</p>
              </div>
            ) : emailsError ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <XCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{emailsError}</p>
                <Button variant="outline" size="sm" onClick={fetchEmails}>
                  재시도
                </Button>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Mail className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">추출된 이메일이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  총 {emails.length}개 이메일 추출
                </p>
                <div className="max-h-[40vh] overflow-y-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                        <th className="px-3 py-2 font-medium">유저명</th>
                        <th className="px-3 py-2 font-medium">이메일</th>
                        <th className="px-3 py-2 font-medium">댓글</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emails.map((e, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                            @{e.username}
                          </td>
                          <td className="px-3 py-2 text-xs font-mono">{e.email}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground max-w-[120px] truncate">
                            {e.text}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: 발송 승인 */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto py-2 min-h-0 space-y-4">
            <div className="flex items-center gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>실제로 이메일이 발송됩니다</span>
            </div>

            {settingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : settingsError ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <XCircle className="h-6 w-6 text-destructive" />
                <p className="text-sm text-destructive">{settingsError}</p>
                <Button variant="outline" size="sm" onClick={fetchSettings}>
                  재시도
                </Button>
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">수신자</span>
                  <span className="font-medium">{settings?.recipient_email ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">발송할 이메일 수</span>
                  <span className="font-medium">{emails.length}개</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">제목</span>
                  <span className="font-mono text-xs break-all">{subject}</span>
                </div>
                <Separator />
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs">추출된 이메일 목록</span>
                  <div className="space-y-1 max-h-[20vh] overflow-y-auto">
                    {emails.map((e, i) => (
                      <div key={i} className="text-xs font-mono text-foreground/80">
                        {e.email}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* 첨부파일 */}
                <div className="space-y-2">
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    첨부파일 (선택)
                  </span>
                  {attachments.length > 0 && (
                    <div className="space-y-1">
                      {attachments.map((file, i) => (
                        <div key={i} className="flex items-center justify-between rounded border px-2 py-1 text-xs">
                          <span className="truncate">{file.filename}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(i)}
                            className="ml-2 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-dashed px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors">
                    <Paperclip className="h-3 w-3" />
                    파일 추가
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileAdd}
                    />
                  </label>
                  <p className="text-[11px] text-muted-foreground/60">최대 10MB</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: 결과 */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center py-6 gap-4">
            {sendEmail.isPending ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">이메일 발송 중...</p>
              </>
            ) : sendEmail.isSuccess ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-lg font-semibold">발송 완료!</p>
                {sendEmail.data?.messageId && (
                  <p className="text-xs text-muted-foreground font-mono break-all text-center">
                    {sendEmail.data.messageId}
                  </p>
                )}
              </>
            ) : sendEmail.isError ? (
              <>
                <XCircle className="h-12 w-12 text-destructive" />
                <p className="text-lg font-semibold">발송 실패</p>
                <p className="text-sm text-destructive text-center">
                  {sendEmail.error?.message ?? "알 수 없는 오류"}
                </p>
              </>
            ) : null}

            {/* 통계 */}
            {(sendEmail.isSuccess || sendEmail.isError) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <span>댓글 {filteredComments.length}개</span>
                <ChevronRight className="h-3 w-3" />
                <span>이메일 {emails.length}개 추출</span>
                <ChevronRight className="h-3 w-3" />
                <span>{sendEmail.isSuccess ? "발송 성공" : "발송 실패"}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="flex-row justify-between sm:justify-between gap-2 pt-2">
          {/* 이전 버튼 */}
          {step === 1 && !emailsLoading ? (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
          ) : step === 2 && !settingsLoading ? (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
          ) : (
            <div />
          )}

          {/* 오른쪽 버튼 */}
          {step === 0 && (
            <Button
              onClick={handleNext}
              disabled={commentsLoading || !!commentsError}
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {step === 1 && (
            emails.length === 0 && !emailsLoading ? (
              <Button variant="outline" onClick={handleClose}>
                닫기
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={emailsLoading || !!emailsError || emails.length === 0}
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            )
          )}
          {step === 2 && (
            <Button
              variant="destructive"
              onClick={handleNext}
              disabled={settingsLoading || !!settingsError || sendEmail.isPending}
            >
              발송하기
            </Button>
          )}
          {step === 3 && (
            <Button variant="outline" onClick={handleClose}>
              닫기
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Add Automation Dialog ---

function AddAutomationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [intervalMinutes, setIntervalMinutes] = useState("30");
  const [keyword, setKeyword] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: posts, isLoading: postsLoading } = useAccountPosts(selectedAccountId);
  const createPipeline = useCreatePipelineFromPost();

  const selectedAccount = (accounts as Account[] | undefined)?.find(
    (a) => a.id === selectedAccountId
  );

  function resetAndClose() {
    setStep(0);
    setSelectedAccountId("");
    setSelectedPost(null);
    setIntervalMinutes("30");
    setKeyword("");
    setStartAt("");
    setEndAt("");
    onOpenChange(false);
  }

  function handleNext() {
    if (step === 0) {
      if (!selectedAccountId) {
        toast.error("계정을 선택하세요");
        return;
      }
      setStep(1);
    } else if (step === 1) {
      if (!selectedPost) {
        toast.error("게시물을 선택하세요");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      handleCreate();
    }
  }

  function handleBack() {
    if (step === 1) {
      setSelectedPost(null);
      setStep(0);
    } else if (step === 2) {
      setStep(1);
    }
  }

  function handleCreate() {
    if (!selectedAccountId || !selectedPost) return;

    createPipeline.mutate(
      {
        accountId: selectedAccountId,
        mediaId: selectedPost.id,
        intervalMinutes: parseInt(intervalMinutes, 10),
        postText: selectedPost.text || undefined,
        keyword: keyword.trim() || undefined,
        startAt: startAt ? new Date(startAt).toISOString() : null,
        endAt: endAt ? new Date(endAt).toISOString() : null,
      },
      {
        onSuccess: () => {
          toast.success("자동화가 생성되었습니다");
          resetAndClose();
        },
        onError: (err) => {
          toast.error(err.message || "자동화 생성에 실패했습니다");
        },
      }
    );
  }

  const stepTitles = ["계정 선택", "게시물 선택", "설정"];

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : resetAndClose())}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <StepIndicator current={step} total={3} />
          <DialogTitle className="text-center mt-2">{stepTitles[step]}</DialogTitle>
        </DialogHeader>

        {/* Step 0: Account Selection */}
        {step === 0 && (
          <div className="flex-1 overflow-y-auto space-y-2 py-2">
            {accountsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : !(accounts as Account[] | undefined)?.length ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                연결된 계정이 없습니다. 먼저 계정을 연결하세요.
              </div>
            ) : (
              (accounts as Account[]).map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setSelectedAccountId(account.id)}
                  className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
                    selectedAccountId === account.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border"
                  }`}
                >
                  <Avatar size="default">
                    {account.profile_picture_url ? (
                      <AvatarImage
                        src={account.profile_picture_url}
                        alt={account.username}
                      />
                    ) : null}
                    <AvatarFallback>
                      {account.username?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">@{account.username}</p>
                    {!account.is_active && (
                      <p className="text-xs text-destructive">비활성 계정</p>
                    )}
                  </div>
                  {selectedAccountId === account.id && (
                    <div className="ml-auto h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}

        {/* Step 1: Post Selection */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto space-y-2 py-2 min-h-0 max-h-[50vh]">
            {postsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2 rounded-lg border p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : !(posts as Post[] | undefined)?.length ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                게시물이 없습니다.
              </div>
            ) : (
              (posts as Post[]).map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className={`w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
                    selectedPost?.id === post.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border"
                  }`}
                >
                  <div
                    className={`mt-1 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      selectedPost?.id === post.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {selectedPost?.id === post.id && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm leading-relaxed">
                      {truncateText(post.text, 80)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.timestamp)}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {post.media_type}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Step 2: Settings */}
        {step === 2 && (
          <div className="space-y-6 py-2">
            {/* Selected summary */}
            <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">@{selectedAccount?.username}</span>
                {" "}계정의 게시물
              </p>
              <p className="text-xs text-muted-foreground">
                {truncateText(selectedPost?.text ?? null, 60)}
              </p>
            </div>

            {/* Interval select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">수집 간격</label>
              <Select value={intervalMinutes} onValueChange={setIntervalMinutes}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="수집 간격 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5분</SelectItem>
                  <SelectItem value="10">10분</SelectItem>
                  <SelectItem value="15">15분</SelectItem>
                  <SelectItem value="30">30분</SelectItem>
                  <SelectItem value="60">60분</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Keyword filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">키워드 필터 (선택)</label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="특정 키워드가 포함된 댓글만 수집"
              />
              <p className="text-xs text-muted-foreground">
                키워드를 비워두면 모든 댓글에서 이메일을 수집합니다
              </p>
            </div>

            <Separator />

            {/* 실행 기간 */}
            <div className="space-y-3">
              <Label className="flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" />
                실행 기간 (선택)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">시작</span>
                  <Input
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">종료</span>
                  <Input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                비워두면 기간 제한 없이 실행됩니다
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2 pt-2">
          {step > 0 ? (
            <Button variant="outline" onClick={handleBack} disabled={createPipeline.isPending}>
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
          ) : (
            <div />
          )}
          <Button
            onClick={handleNext}
            disabled={
              (step === 0 && !selectedAccountId) ||
              (step === 1 && !selectedPost) ||
              createPipeline.isPending
            }
          >
            {createPipeline.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : step === 2 ? (
              "생성"
            ) : (
              <>
                다음
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page ---

export default function PipelinesPage() {
  const { data: pipelines, isLoading } = usePipelines();
  const togglePipeline = useTogglePipeline();
  const deletePipeline = useDeletePipeline();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editPipeline, setEditPipeline] = useState<Pipeline | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [logsPipeline, setLogsPipeline] = useState<Pipeline | null>(null);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [executePipeline, setExecutePipeline] = useState<Pipeline | null>(null);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [emailConfigPipeline, setEmailConfigPipeline] = useState<Pipeline | null>(null);
  const [emailConfigOpen, setEmailConfigOpen] = useState(false);

  function handleEmailConfig(pipeline: Pipeline) {
    setEmailConfigPipeline(pipeline);
    setEmailConfigOpen(true);
  }

  function handleToggle(pipelineId: string, isActive: boolean) {
    setTogglingId(pipelineId);
    togglePipeline.mutate(
      { pipelineId, isActive },
      {
        onSuccess: () => {
          toast.success(isActive ? "자동화가 활성화되었습니다" : "자동화가 비활성화되었습니다");
          setTogglingId(null);
        },
        onError: (err) => {
          toast.error(err.message || "상태 변경에 실패했습니다");
          setTogglingId(null);
        },
      }
    );
  }

  function handleEdit(pipeline: Pipeline) {
    setEditPipeline(pipeline);
    setEditDialogOpen(true);
  }

  function handleShowLogs(pipeline: Pipeline) {
    setLogsPipeline(pipeline);
    setLogsDialogOpen(true);
  }

  function handleExecute(pipeline: Pipeline) {
    setExecutePipeline(pipeline);
    setExecuteDialogOpen(true);
  }

  function handleDelete(pipelineId: string) {
    if (!confirm("이 자동화를 삭제하시겠습니까?")) return;
    setDeletingId(pipelineId);
    deletePipeline.mutate(pipelineId, {
      onSuccess: () => {
        toast.success("자동화가 삭제되었습니다");
        setDeletingId(null);
      },
      onError: (err) => {
        toast.error(err.message || "삭제에 실패했습니다");
        setDeletingId(null);
      },
    });
  }

  const pipelineList = pipelines as Pipeline[] | undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">파이프라인</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Zap className="h-4 w-4" />
          자동화 추가
        </Button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-l-4 border-l-muted-foreground/20">
              <CardContent className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="ml-auto h-6 w-14 rounded-md" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !pipelineList?.length ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Zap className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">설정된 자동화가 없습니다</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            댓글에서 이메일을 자동으로 수집하는 파이프라인을 추가하세요
          </p>
          <Button className="mt-6" onClick={() => setDialogOpen(true)}>
            <Zap className="h-4 w-4" />
            자동화 추가
          </Button>
        </div>
      ) : (
        /* Pipeline cards grid */
        <div className="grid gap-4 md:grid-cols-2">
          {pipelineList.map((pipeline) => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onShowLogs={handleShowLogs}
              onExecute={handleExecute}
              onEmailConfig={handleEmailConfig}
              isToggling={togglingId === pipeline.id}
              isDeleting={deletingId === pipeline.id}
            />
          ))}
        </div>
      )}

      {/* Add Automation Dialog */}
      <AddAutomationDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Edit Pipeline Dialog */}
      <EditPipelineDialog
        pipeline={editPipeline}
        open={editDialogOpen}
        onOpenChange={(v) => {
          setEditDialogOpen(v);
          if (!v) setEditPipeline(null);
        }}
      />

      {/* Pipeline Logs Dialog */}
      <PipelineLogsDialog
        pipeline={logsPipeline}
        open={logsDialogOpen}
        onOpenChange={(v) => {
          setLogsDialogOpen(v);
          if (!v) setLogsPipeline(null);
        }}
      />

      {/* Execute Pipeline Dialog */}
      <ExecutePipelineDialog
        pipeline={executePipeline}
        open={executeDialogOpen}
        onOpenChange={(v) => {
          setExecuteDialogOpen(v);
          if (!v) setExecutePipeline(null);
        }}
      />

      {/* Email Config Dialog */}
      <EmailConfigDialog
        pipeline={emailConfigPipeline}
        open={emailConfigOpen}
        onOpenChange={(v) => {
          setEmailConfigOpen(v);
          if (!v) setEmailConfigPipeline(null);
        }}
      />
    </div>
  );
}
