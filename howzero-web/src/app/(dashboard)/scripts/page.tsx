"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAccounts } from "@/hooks/use-accounts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check, Loader2, Sparkles } from "lucide-react";

function useGenerateScript() {
  return useMutation({
    mutationFn: async (data: { accountId: string; draft: string }) => {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "생성 실패");
      return json as { script: string };
    },
  });
}

export default function ScriptsPage() {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const generate = useGenerateScript();

  const [accountId, setAccountId] = useState("");
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!accountId || !draft.trim()) return;
    generate.mutate({ accountId, draft });
  };

  const handleCopy = async () => {
    if (!generate.data?.script) return;
    await navigator.clipboard.writeText(generate.data.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대본 생성기</h1>
        <p className="text-muted-foreground">
          초안을 입력하면 계정 스타일에 맞는 바이럴 대본으로 변환합니다
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 입력 영역 */}
        <Card>
          <CardHeader>
            <CardTitle>초안 입력</CardTitle>
            <CardDescription>
              대충 적은 아이디어나 초안을 넣어주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>계정 선택</Label>
              {accountsLoading ? (
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              ) : !accounts || accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  연결된 계정이 없습니다. 계정 관리에서 먼저 연결하세요.
                </p>
              ) : (
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="계정을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(
                      (acc: { id: string; username: string }) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          @{acc.username}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>초안</Label>
              <Textarea
                placeholder={`예시:\n\n요즘 쓰레드 알고리즘이 바뀌었는데\n첫 줄이 중요하고 저장수가 중요하다\n그래서 이런식으로 글을 써야된다\n팔로우하면 더 알려줌`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={12}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {draft.length}자
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={
                !accountId || !draft.trim() || generate.isPending
              }
              className="w-full"
            >
              {generate.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  대본 생성
                </>
              )}
            </Button>

            {generate.error && (
              <p className="text-sm text-destructive">
                {generate.error.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 결과 영역 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>생성된 대본</CardTitle>
                <CardDescription>
                  AI가 계정 스타일을 분석하여 작성한 바이럴 대본
                </CardDescription>
              </div>
              {generate.data?.script && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      복사
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generate.isPending ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>계정 스타일 분석 중...</p>
                <p className="text-xs mt-1">
                  최근 포스트를 기반으로 대본을 생성합니다
                </p>
              </div>
            ) : generate.data?.script ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed rounded-lg bg-muted/50 p-4 max-h-[500px] overflow-y-auto">
                {generate.data.script}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>초안을 입력하고 생성 버튼을 눌러주세요</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
