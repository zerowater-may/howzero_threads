"use client";

import Link from "next/link";
import { useState } from "react";

const benefits = [
  "비즈니스 프로세스 전체 진단",
  "자동화 가능 영역 발굴",
  "난이도/가치 우선순위 매트릭스 제공",
  "즉시 실행 가능한 Quick Win 제안",
  "장기 AI 전환 로드맵 초안",
];

const faqs = [
  {
    q: "오딧 비용이 정말 무료인가요?",
    a: "네, 30분 화상 미팅은 완전 무료입니다. 비즈니스의 비효율 지점을 진단하고 자동화 방향을 제안해 드립니다.",
  },
  {
    q: "기술 지식이 없어도 괜찮나요?",
    a: "물론입니다. 코딩이나 AI에 대한 사전 지식이 전혀 필요 없습니다. 비즈니스 프로세스만 설명해 주시면 됩니다.",
  },
  {
    q: "어떤 업종이 대상인가요?",
    a: "이커머스, 법률, 마케팅, 교육 등 반복 업무가 있는 모든 업종이 대상입니다.",
  },
  {
    q: "오딧 후 반드시 계약해야 하나요?",
    a: "전혀 아닙니다. 오딧 결과만 받고 직접 실행하셔도 됩니다. 강매는 없습니다.",
  },
];

export default function AuditPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    industry: "",
    employees: "",
    challenge: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrate with backend API
    setSubmitted(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 md:pt-28">
        <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
          무료 AI 오딧
        </p>
        <h1 className="mt-2 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          30분 만에 비즈니스의
          <br />
          숨은 비효율을 찾아드립니다
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          코딩 몰라도 됩니다. 비즈니스 프로세스만 알려주세요.
          <br />
          AI가 해결할 수 있는 지점을 무료로 진단합니다.
        </p>
      </section>

      {/* Benefits + Form */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Benefits */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              오딧에서 받을 수 있는 것
            </h2>
            <ul className="mt-6 space-y-4">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                    ✓
                  </span>
                  <span className="text-base">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-xl border border-border/60 bg-muted/30 p-6">
              <p className="text-sm font-semibold">
                &ldquo;인터넷 시대에 웹사이트가 필요했던 것처럼,
                <br />
                지금은 AI 진단이 필수입니다.&rdquo;
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                — 하우제로
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-border/60 bg-card p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-2xl text-background">
                  ✓
                </div>
                <h3 className="mt-6 text-2xl font-bold">
                  신청이 완료되었습니다!
                </h3>
                <p className="mt-3 text-muted-foreground">
                  영업일 기준 1일 이내로 연락드리겠습니다.
                </p>
                <Link
                  href="/"
                  className="mt-8 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  ← 홈으로 돌아가기
                </Link>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold">무료 AI 오딧 신청</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  아래 정보를 입력해 주시면 빠르게 연락드립니다.
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        이름 *
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="홍길동"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        회사명 *
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="주식회사 하우제로"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        이메일 *
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="ceo@company.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        연락처
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="010-1234-5678"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        업종 *
                      </label>
                      <select
                        required
                        value={formData.industry}
                        onChange={(e) =>
                          setFormData({ ...formData, industry: e.target.value })
                        }
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">선택해 주세요</option>
                        <option value="이커머스">이커머스</option>
                        <option value="마케팅/광고">마케팅/광고</option>
                        <option value="법률/회계">법률/회계</option>
                        <option value="교육">교육</option>
                        <option value="IT/소프트웨어">IT/소프트웨어</option>
                        <option value="제조업">제조업</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        직원 수
                      </label>
                      <select
                        value={formData.employees}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employees: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">선택해 주세요</option>
                        <option value="1인">1인</option>
                        <option value="2-5명">2-5명</option>
                        <option value="6-20명">6-20명</option>
                        <option value="21-50명">21-50명</option>
                        <option value="51명 이상">51명 이상</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      현재 가장 큰 비효율은? *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.challenge}
                      onChange={(e) =>
                        setFormData({ ...formData, challenge: e.target.value })
                      }
                      className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="예: CS 응대에 하루 3시간 이상 소요, 수동 보고서 작성 등"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                  >
                    무료 AI 오딧 신청하기
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    영업일 기준 1일 이내 연락 · 강매 없음 · 완전 무료
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-2xl font-bold tracking-tight">
            자주 묻는 질문
          </h2>
          <div className="mt-8 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="text-base font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
