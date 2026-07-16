"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { analyzeMeeting, meetingToDocument } from "@/lib/actions/meetings";
import { importNeedsFromMeeting } from "@/lib/actions/ontology";

export function MeetingAnalyzePanel({
  meetingId,
  projectId,
  analyzed,
  hasNeeds,
}: {
  meetingId: number;
  projectId: number;
  analyzed: boolean;
  hasNeeds: boolean;
}) {
  const router = useRouter();
  const [analyzing, startAnalyze] = useTransition();
  const [converting, startConvert] = useTransition();
  const [importing, startImport] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function runAnalyze() {
    setError(null);
    startAnalyze(async () => {
      try {
        await analyzeMeeting(meetingId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "분석에 실패했습니다.");
      }
    });
  }

  function runConvert() {
    setError(null);
    startConvert(async () => {
      try {
        const docId = await meetingToDocument(meetingId);
        router.push(`/p/${projectId}/docs/${docId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "문서 변환에 실패했습니다.");
      }
    });
  }

  function runImport() {
    setError(null);
    startImport(async () => {
      try {
        const { companyId } = await importNeedsFromMeeting(meetingId);
        router.push(`/c/${companyId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "온톨로지 가져오기에 실패했습니다.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" disabled={analyzing} onClick={runAnalyze}>
          {analyzing ? "분석 중..." : analyzed ? "재분석" : "AI 분석"}
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!hasNeeds || importing} onClick={runImport}>
          {importing ? "가져오는 중..." : "온톨로지로 가져오기"}
        </Button>
        <Button type="button" size="sm" disabled={!analyzed || converting} onClick={runConvert}>
          {converting ? "변환 중..." : "문서로 변환"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
