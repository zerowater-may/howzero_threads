import HeroChat from "@/components/HeroChat";
import ContactForm from "@/components/ContactForm";
import MicroCta from "@/components/MicroCta";
import ProcessTimeline from "@/components/ProcessTimeline";
import OsCanvas from "@/components/os-canvas/OsCanvas";
import LanyardBadge from "@/components/hero/LanyardBadge";
import Reveal from "@/components/Reveal";

// 카피 원천: docs/ax-business/04(서사)·06(메시지 뱅크)·07(차별점)·10(오퍼·가격)
// v2 스펙: docs/superpowers/specs/2026-07-09-ax-web-landing-v2-design.md
export default function Home() {
  return (
    <main className="relative">
      <LanyardBadge />

      {/* ── 네비: 플로팅 필 ── */}
      <header className="fixed inset-x-0 top-4 z-50 px-4">
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-white/10 bg-[#0c0c0e]/75 py-1.5 pl-5 pr-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <span className="display text-base">
            howzero<span className="text-[var(--cobalt)]">.</span>
          </span>
          <nav className="flex items-center gap-0.5 text-sm font-medium text-[var(--dim)]">
            <a href="#os" className="hidden rounded-full px-3 py-1.5 transition-colors hover:bg-white/5 hover:text-[var(--ink)] sm:block">
              OS 설계도
            </a>
            <a href="#process" className="hidden rounded-full px-3 py-1.5 transition-colors hover:bg-white/5 hover:text-[var(--ink)] sm:block">
              진행 방식
            </a>
            <a href="#pricing" className="hidden rounded-full px-3 py-1.5 transition-colors hover:bg-white/5 hover:text-[var(--ink)] sm:block">
              가격
            </a>
            <a href="#contact" className="btn-primary ml-1 !px-4 !py-2 text-sm">
              무료 진단
            </a>
          </nav>
        </div>
      </header>

      {/* ── 1. 히어로: 채팅 센터 (C안) ── */}
      <section className="relative overflow-hidden">
        {/* 앰비언트 글로우 — 코발트 라디얼, 히어로에만 */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[760px]">
          <div className="absolute left-1/2 top-[-340px] h-[680px] w-[980px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(77,107,255,0.16),transparent_70%)] blur-2xl" />
        </div>
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 pb-28 pt-32 text-center lg:pt-40">
          <p className="eyebrow rise rise-1">AX EXECUTION PARTNER — howzero</p>
          <h1 className="display rise rise-2 mt-4 text-4xl sm:text-5xl lg:text-6xl">
            반복업무 시간,
            <br />
            어떻게 0으로 만드나
          </h1>
          <p className="rise rise-3 mt-6 max-w-2xl text-lg leading-relaxed text-[var(--dim)]">
            단건 자동화가 아니라, 당신 회사만의 AI 운영 OS를 만듭니다.
            <br />
            연매출 <span className="num">10억</span> 이커머스 SaaS를 직접 운영하며 우리 회사부터 자동화했습니다.
            <br />
            검증한 것만 팝니다.
          </p>
          <div className="rise rise-4 mt-12 w-full max-w-3xl text-left">
            <HeroChat />
            <p className="mt-3 text-center text-xs text-[var(--dim)]">
              대화 내용은 진단 준비에만 사용됩니다. 폼이 편하시면{" "}
              <a href="#contact" className="text-[var(--cobalt)] underline">여기로</a>.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. 시간이 새는 곳 — 에디토리얼 인용 ── */}
      <section className="border-y border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto max-w-6xl px-5 py-24 md:py-28">
          <Reveal>
            <p className="eyebrow">WHERE TIME LEAKS</p>
            <h2 className="display mt-3 max-w-2xl text-3xl sm:text-4xl">
              대표님 회사에서 시간이 새는 곳, 대부분 여기입니다
            </h2>
          </Reveal>
          {/* 수치는 현장 증언 — blockquote 인용 맥락 유지, 독립 스탯 타일 금지 (스펙 §2) */}
          <Reveal delay={100}>
            <blockquote className="mt-14 max-w-4xl">
              <p className="display text-3xl leading-[1.3] text-[var(--ink)] sm:text-[2.75rem]">
                &ldquo;CS 티켓 하나에 <span className="num">8~12분</span>. 하루 30건이면{" "}
                <span className="num">5시간</span>이다.
                <br className="hidden sm:block" />
                대표가 그 5시간에 할 일이 정말 이건가.&rdquo;
              </p>
              <p className="mt-3 text-sm text-[var(--dim)]">현장 증언 — 반복 문의 · 주문/배송 확인 · 반품 응대</p>
            </blockquote>
          </Reveal>
          <div className="mt-14 grid gap-x-8 gap-y-10 md:grid-cols-3">
            <Reveal delay={0}>
              <blockquote className="border-l-2 border-[var(--line)] pl-5">
                <p className="font-semibold leading-relaxed">
                  &ldquo;사람을 줄이라는 게 아니다.{" "}
                  <span className="text-[var(--cobalt)]">다음 채용을 미루라는</span> 거다.&rdquo;
                </p>
                <p className="mt-2 text-sm text-[var(--dim)]">신입이 할 일의 몇 %가 반복업무인지부터 계산</p>
              </blockquote>
            </Reveal>
            <Reveal delay={120} className="md:translate-y-6">
              <blockquote className="border-l-2 border-[var(--line)] pl-5">
                <p className="font-semibold leading-relaxed">
                  &ldquo;재발송 한 번, 달래기 환불 한 번. 장부에는 한 줄도 안 잡히지만 마진은 알고 있다.&rdquo;
                </p>
                <p className="mt-2 text-sm text-[var(--dim)]">실수 비용 — 사람 문제가 아니라 구조 문제</p>
              </blockquote>
            </Reveal>
            <Reveal delay={240}>
              <blockquote className="border-l-2 border-[var(--line)] pl-5">
                <p className="font-semibold leading-relaxed">
                  &ldquo;매출이 2배가 되면 일도 2배가 되는 구조라면, 그 회사는{" "}
                  <span className="text-[var(--cobalt)]">2배 매출을 못 받는다</span>.&rdquo;
                </p>
                <p className="mt-2 text-sm text-[var(--dim)]">대표가 병목인 회사는 대표의 하루가 매출 상한선</p>
              </blockquote>
            </Reveal>
          </div>
          <MicroCta />
        </div>
      </section>

      {/* ── 3. ★ 당신 회사의 OS — 인터랙티브 노드 캔버스 ── */}
      <section id="os" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:py-28">
        <Reveal>
          <p className="eyebrow">YOUR COMPANY&apos;S OS</p>
          <h2 className="display mt-3 max-w-3xl text-3xl sm:text-4xl">
            단건 자동화는 금방 복제됩니다.
            <br />
            회사 프로세스에 맞춘 운영 OS는 복제가 어렵습니다
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--dim)]">
            프로세스와 데이터는 회사마다 다릅니다. 그걸 정립하는 과정 자체가 자산이 되고요. 그래서 순서가
            중요합니다:
          </p>
        </Reveal>
        <Reveal delay={100}>
          {/* 4단계 스텝퍼 */}
          <ol className="mt-8 flex flex-wrap items-center gap-2 font-[family-name:var(--font-mono)] text-sm">
            {["프로세스 정립", "플로우 정립", "잘게 쪼개기", "자동화"].map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                {i > 0 && <span className="text-[var(--dim)]">→</span>}
                <span
                  className={`rounded-full border border-[var(--line)] px-3.5 py-1.5 text-[var(--ink)] ${
                    i === 3 ? "font-bold" : ""
                  }`}
                >
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <OsCanvas />
          </div>
        </Reveal>
        <MicroCta label="→ 이 파이프라인을 우리 업무로 그려보기" />
      </section>

      {/* ── 4. 진행 방식 ── */}
      <section id="process" className="border-y border-[var(--line)] bg-[var(--panel)] scroll-mt-24">
        <div className="mx-auto max-w-6xl px-5 py-24 md:py-28">
          <Reveal>
            <p className="eyebrow">PROCESS</p>
            <h2 className="display mt-3 text-3xl sm:text-4xl">진단 없이 견적 없습니다</h2>
            <p className="mt-4 max-w-2xl text-[var(--dim)]">
              AI 도입을 팔지 않습니다. 진단에서 &lsquo;주당 몇 시간이 어느 업무에서 새는지&rsquo;부터 숫자로
              뽑아드립니다. 판단은 숫자 보고 하면 됩니다.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ProcessTimeline />
          </Reveal>
          <MicroCta label="→ 1단계 무료 진단부터 시작하기" />
        </div>
      </section>

      {/* ── 5. 창업자 + howzero 팀 ── */}
      <section id="founder" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:py-28">
        <Reveal>
          <p className="eyebrow">TRACK RECORD</p>
          <h2 className="display mt-3 text-4xl sm:text-5xl lg:text-6xl">팔기 전에, 내가 썼다</h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--dim)]">
            저는 AI 컨설턴트가 되려고 AI를 배운 게 아닙니다. 제 SaaS를{" "}
            <span className="num">연매출 10억</span> 규모로 직접 운영하면서, 반복업무에 갈리는 제 직원들의 일을
            먼저 자동화해야 했을 뿐입니다. 그 자동화가 실제로 굴러가는 걸 확인한 다음에야, 남의 회사에도 팔기
            시작했습니다.
          </p>
          <p className="mt-4 border-l-2 border-[var(--cobalt)] pl-4 font-[family-name:var(--font-mono)] text-sm text-[var(--dim)]">
            우리 첫 고객은 우리 회사였다 — 검증한 것만 판다.
          </p>
        </Reveal>
        {/* 프로필 카드 — 윤자동 벤치마킹: 경력 자랑이 아니라 "직접 운영해본 사람" 증명 */}
        <Reveal delay={120}>
          <div className="mt-12 grid gap-4 md:grid-cols-12">
            <div className="card-lift rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 md:col-span-7">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cobalt)]/15 font-[family-name:var(--font-mono)] text-xl font-bold text-[var(--cobalt)]">
                  h0
                </div>
                <div>
                  <p className="text-lg font-bold">howzero 파운더</p>
                  <p className="text-sm text-[var(--dim)]">직접 만들고, 직접 운영하는 AX 실행 파트너</p>
                </div>
              </div>
              <dl className="mt-8 grid gap-6 sm:grid-cols-3">
                <div>
                  <dt className="num text-2xl sm:text-3xl">연매출 10억</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[var(--dim)]">자체 SaaS를 이 규모로 직접 운영 (내부 실적)</dd>
                </div>
                <div>
                  <dt className="display text-2xl sm:text-3xl">복수 SaaS</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[var(--dim)]">불사자·하입덕 — 기획부터 개발·운영까지 외주 없이</dd>
                </div>
                <div>
                  <dt className="display text-2xl sm:text-3xl">사내 실전</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[var(--dim)]">내 직원들의 반복업무부터 자동화 — 실패도 우리 돈으로</dd>
                </div>
              </dl>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Python", "TypeScript · Next.js", "PostgreSQL", "Claude · GPT API", "크롤링 · RPA", "Remotion"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs text-[var(--dim)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="card-lift rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 md:col-span-5">
              <p className="text-sm font-bold text-[var(--dim)]">먼저 우리 회사에서 자동화한 것</p>
              <ul className="mt-5 space-y-4">
                {[
                  ["CS 응대", "반복 문의 분류·답변 초안·발송"],
                  ["정산·리포트", "채널 데이터 취합·대사·주간 보고"],
                  ["콘텐츠 제작", "소재 수집·초안·발행 파이프라인"],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cobalt)]" aria-hidden />
                    <div>
                      <p className="text-sm font-bold">{t}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-[var(--dim)]">{d}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-l-2 border-[var(--cobalt)] pl-3 text-sm leading-relaxed text-[var(--dim)]">
                여기서 굴러간 파이프라인이 위 OS 설계도의 원본입니다.
              </p>
            </div>
          </div>
        </Reveal>
        <MicroCta label="→ 우리 회사 업무도 이렇게 되는지 물어보기" />
      </section>

      {/* ── 6. 가격 ── */}
      <section id="pricing" className="border-y border-[var(--line)] bg-[var(--panel)] scroll-mt-24">
        <div className="mx-auto max-w-6xl px-5 py-24 md:py-28">
          <Reveal>
            <p className="eyebrow">PRICING</p>
            <h2 className="display mt-3 text-3xl sm:text-4xl">가격을 숨기지 않습니다</h2>
            <p className="mt-4 max-w-2xl text-[var(--dim)]">
              국내 AX 컨설팅 대부분이 &lsquo;상담 후 견적&rsquo;입니다. 우리는 기준가를 먼저 공개합니다. 아래는
              파일럿 기간 기준가이며, 진단 후 업무 범위에 따라 확정됩니다.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <div className="card-lift flex flex-col rounded-2xl bg-[var(--card)] p-7">
                <h3 className="display text-xl">무료 진단</h3>
                <p className="num mt-3 text-3xl">0원</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--dim)]">
                  30분 대화 + 업무 인벤토리 리포트. 어디서 몇 시간이 새는지 숫자로 받아보세요. 진단만 받고
                  끝내셔도 됩니다.
                </p>
                <a href="#contact" className="btn-primary mt-6 justify-center !bg-white/10 hover:!bg-white/15">
                  진단 신청
                </a>
              </div>
              <div className="card-lift relative flex flex-col rounded-2xl border border-[var(--cobalt)]/60 bg-[linear-gradient(180deg,rgba(77,107,255,0.14),rgba(77,107,255,0.03))] p-7">
                <span className="absolute -top-3 left-7 bg-[var(--cobalt)] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  대부분 여기서 시작
                </span>
                <h3 className="display text-xl">착수 — 오딧 + 구축</h3>
                <p className="num mt-3 text-3xl">300~700만원</p>
                <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--dim)]">
                  소규모 기준 · SMB 700~2,000만원
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--dim)]">
                  우선순위 1~2개 업무를 실제로 자동화해 인도. 결과는 시간·비용 before/after로 보고합니다.
                </p>
                <a href="#contact" className="btn-primary mt-6 justify-center">상담 신청</a>
              </div>
              <div className="card-lift flex flex-col rounded-2xl bg-[var(--card)] p-7">
                <h3 className="display text-xl">운영 리테이너</h3>
                <p className="num mt-3 text-3xl">월 50~150만원</p>
                <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--dim)]">
                  소규모 기준 · SMB 월 150~500만원
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--dim)]">
                  구축한 자동화의 모니터링·개선 + 새 업무 자동화 확장. 필요 없으면 언제든 종료.
                </p>
                <a href="#contact" className="btn-primary mt-6 justify-center !bg-white/10 hover:!bg-white/15">
                  상담 신청
                </a>
              </div>
            </div>
          </Reveal>
          <p className="mt-8 text-xs text-[var(--dim)]">
            GPT 구독료만 내는 회사와 업무 구조를 바꾼 회사 — 1년 뒤 차이는 급여 명세서에서 드러납니다.
          </p>
        </div>
      </section>

      {/* ── 7. CTA + 폼 ── */}
      <section id="contact" className="mx-auto max-w-3xl scroll-mt-24 px-5 py-24 md:py-28">
        <Reveal>
          <p className="eyebrow text-center">FREE DIAGNOSIS</p>
          <h2 className="display mt-3 text-center text-3xl sm:text-4xl">
            어디서 시간이 새는지,
            <br />
            숫자로 받아보세요
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-[var(--dim)]">
            남겨주시면 1영업일 내 연락드립니다. 진단은 무료고, 영업 전화로 괴롭히지 않습니다.
          </p>
          <div className="mt-10">
            <ContactForm />
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-10 text-xs text-[var(--dim)] sm:flex-row">
          <span className="font-[family-name:var(--font-mono)]">© 2026 howzero</span>
          <span>당신 회사만의 AI 운영 OS를 만드는 AX 실행 파트너</span>
        </div>
      </footer>
    </main>
  );
}
