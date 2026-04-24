"use client";

import Link from "next/link";
import { useState } from "react";

interface Question {
  id: string;
  text: string;
  options: { label: string; score: number }[];
}

const questions: Question[] = [
  {
    id: "q1",
    text: "반복 업무(CS, 데이터 입력, 보고서 등)에 하루 몇 시간을 쓰나요?",
    options: [
      { label: "4시간 이상", score: 1 },
      { label: "2~4시간", score: 2 },
      { label: "1~2시간", score: 3 },
      { label: "1시간 미만 (이미 자동화됨)", score: 5 },
    ],
  },
  {
    id: "q2",
    text: "현재 사용 중인 업무 도구(CRM, ERP, 협업 도구 등)가 있나요?",
    options: [
      { label: "거의 없음 (엑셀/수기 위주)", score: 1 },
      { label: "1~2개 사용", score: 2 },
      { label: "3개 이상 체계적으로 사용", score: 4 },
      { label: "API 연동된 통합 시스템 운영 중", score: 5 },
    ],
  },
  {
    id: "q3",
    text: "데이터를 얼마나 체계적으로 관리하고 있나요?",
    options: [
      { label: "데이터 관리 체계 없음", score: 1 },
      { label: "엑셀/스프레드시트로 관리", score: 2 },
      { label: "DB 또는 CRM에 체계적 저장", score: 4 },
      { label: "데이터 파이프라인/대시보드 운영 중", score: 5 },
    ],
  },
  {
    id: "q4",
    text: "AI/자동화 도구를 업무에 사용해 본 적이 있나요?",
    options: [
      { label: "전혀 없음", score: 1 },
      { label: "ChatGPT 등 가끔 사용", score: 2 },
      { label: "특정 업무에 정기적으로 활용", score: 4 },
      { label: "자동화 워크플로우 구축 완료", score: 5 },
    ],
  },
  {
    id: "q5",
    text: "AI 도입에 대한 조직의 태도는 어떤가요?",
    options: [
      { label: "관심 없음 / 회의적", score: 1 },
      { label: "관심은 있지만 방법을 모름", score: 2 },
      { label: "적극 검토 중, 예산 확보 가능", score: 4 },
      { label: "이미 투자 진행 중", score: 5 },
    ],
  },
  {
    id: "q6",
    text: "IT/기술 담당자가 있나요?",
    options: [
      { label: "전혀 없음 (대표가 직접)", score: 1 },
      { label: "외부 업체에 위탁", score: 2 },
      { label: "내부 담당자 1~2명", score: 4 },
      { label: "개발팀 보유", score: 5 },
    ],
  },
];

function getResult(score: number) {
  if (score <= 10) {
    return {
      level: "시작 단계",
      color: "text-red-500",
      grade: "D",
      summary:
        "AI 도입 이전에 기본 프로세스 정리가 먼저 필요합니다. 하우제로의 무료 오딧으로 어디서부터 시작할지 로드맵을 받아보세요.",
      recommendation: "무료 AI 오딧 → 기본 프로세스 개선 → 단순 자동화 도입",
    };
  }
  if (score <= 17) {
    return {
      level: "준비 단계",
      color: "text-orange-500",
      grade: "C",
      summary:
        "기본적인 도구와 데이터는 있지만, AI를 효과적으로 활용하려면 추가 정비가 필요합니다. Quick Win을 먼저 찾아 빠른 성과를 내보세요.",
      recommendation: "무료 AI 오딧 → Quick Win 자동화 구축 → 확장",
    };
  }
  if (score <= 24) {
    return {
      level: "성장 단계",
      color: "text-blue-500",
      grade: "B",
      summary:
        "AI 도입을 위한 기반이 잘 갖춰져 있습니다. 본격적인 자동화 구축과 최적화로 큰 효과를 낼 수 있는 상태입니다.",
      recommendation: "심화 오딧 → 맞춤 자동화 구축 → 통합 시스템 전환",
    };
  }
  return {
    level: "선도 단계",
    color: "text-green-500",
    grade: "A",
    summary:
      "이미 높은 수준의 디지털 인프라를 갖추고 있습니다. 고급 AI 전략과 시스템 최적화로 경쟁 우위를 더욱 강화하세요.",
    recommendation: "전략 자문 → AI 전환 패키지 → 지속 최적화",
  };
}

export default function AiScorePage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const totalScore = Object.values(answers).reduce((s, v) => s + v, 0);
  const maxScore = questions.length * 5;
  const allAnswered = Object.keys(answers).length === questions.length;

  function handleSelect(questionId: string, score: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  }

  function handleSubmit() {
    if (allAnswered) setShowResult(true);
  }

  if (showResult) {
    const result = getResult(totalScore);
    const percentage = Math.round((totalScore / maxScore) * 100);

    return (
      <section className="mx-auto max-w-2xl px-6 py-20 md:py-28">
        <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
          진단 결과
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
          AI 준비도:{" "}
          <span className={result.color}>{result.level}</span>
        </h1>

        <div className="mt-8 rounded-xl border border-border/60 bg-card p-8">
          <div className="flex items-center gap-6">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full border-4 ${result.color} border-current text-3xl font-extrabold`}
            >
              {result.grade}
            </div>
            <div>
              <p className="text-4xl font-extrabold">
                {totalScore}
                <span className="text-lg text-muted-foreground">
                  /{maxScore}점
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                상위 {percentage}% 수준
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="h-3 w-full rounded-full bg-muted">
              <div
                className="h-3 rounded-full bg-foreground transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <p className="mt-6 text-base leading-relaxed">{result.summary}</p>

          <div className="mt-6 rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-semibold">추천 경로</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.recommendation}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/audit"
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-8 py-3.5 text-base font-semibold text-background transition-opacity hover:opacity-90"
          >
            무료 AI 오딧 신청 →
          </Link>
          <button
            onClick={() => {
              setAnswers({});
              setShowResult(false);
            }}
            className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3.5 text-base font-semibold transition-colors hover:bg-accent"
          >
            다시 진단하기
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-20 md:pt-28">
        <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
          AI 준비도 자가진단
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
          우리 비즈니스는 AI를
          <br />
          도입할 준비가 되었을까?
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          6개 질문에 답하면 AI 준비도 점수와 맞춤 추천을 받을 수 있습니다.
          <br />
          소요 시간: 약 2분
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="space-y-8">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-xl border border-border/60 bg-card p-6"
            >
              <p className="text-sm font-medium text-muted-foreground">
                질문 {idx + 1}/{questions.length}
              </p>
              <h3 className="mt-2 text-base font-semibold">{q.text}</h3>
              <div className="mt-4 space-y-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleSelect(q.id, opt.score)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                      answers[q.id] === opt.score
                        ? "border-foreground bg-foreground/5 font-medium"
                        : "border-border/60 hover:border-foreground/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="mt-8 w-full rounded-lg bg-foreground px-6 py-3.5 text-base font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {allAnswered
            ? "진단 결과 보기"
            : `${Object.keys(answers).length}/${questions.length}개 답변 완료`}
        </button>
      </section>
    </>
  );
}
