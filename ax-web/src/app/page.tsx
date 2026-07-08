import HeroChat from "@/components/HeroChat";
import ContactForm from "@/components/ContactForm";

// 카피 원천: docs/ax-business/04(서사)·06(메시지 뱅크)·07(차별점)·10(오퍼·가격)
export default function Home() {
  return (
    <main>
      {/* ── 네비 ── */}
      <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <span className="display text-lg">
            하우제로<span className="text-[var(--cobalt)]">.</span>
          </span>
          <nav className="flex items-center gap-6 text-sm font-medium text-[var(--dim)]">
            <a href="#process" className="hidden hover:text-[var(--ink)] sm:block">진행 방식</a>
            <a href="#pricing" className="hidden hover:text-[var(--ink)] sm:block">가격</a>
            <a href="#contact" className="btn-primary !px-4 !py-2 text-sm">무료 진단</a>
          </nav>
        </div>
      </header>

      {/* ── 1. 히어로: 논지 + 진단 콘솔 ── */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div>
          <p className="eyebrow rise rise-1">AX EXECUTION PARTNER</p>
          <h1 className="display rise rise-2 mt-4 text-4xl sm:text-5xl lg:text-[3.4rem]">
            AI 도입이 아니라,
            <br />
            시간 회수를 팝니다.
          </h1>
          <p className="rise rise-3 mt-6 max-w-xl text-lg leading-relaxed text-[var(--dim)]">
            저는 AI 컨설턴트가 되려고 AI를 배운 게 아닙니다. 제 이커머스 SaaS를{" "}
            <span className="num">연매출 10억</span> 규모로 직접 운영하면서, 반복업무에 갈리는 제 직원들의
            일을 먼저 자동화해야 했을 뿐입니다. 그 자동화가 실제로 굴러가는 걸 확인한 다음에야, 남의
            회사에도 팔기 시작했습니다.
          </p>
          <p className="rise rise-4 mt-6 border-l-2 border-[var(--cobalt)] pl-4 font-[family-name:var(--font-mono)] text-sm text-[var(--dim)]">
            우리 첫 고객은 우리 회사였다 — 검증한 것만 판다.
          </p>
        </div>
        <div className="rise rise-4">
          <HeroChat />
          <p className="mt-3 text-center text-xs text-[var(--dim)]">
            대화 내용은 진단 준비에만 사용됩니다. 폼이 편하시면{" "}
            <a href="#contact" className="text-[var(--cobalt)] underline">여기로</a>.
          </p>
        </div>
      </section>

      {/* ── 2. 실적 ── */}
      <section className="border-y border-[var(--line)] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="eyebrow">TRACK RECORD</p>
          <h2 className="display mt-3 text-3xl sm:text-4xl">팔기 전에, 내가 썼다</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--line)] p-6">
              <p className="num text-2xl">연매출 10억</p>
              <h3 className="mt-2 font-bold">이커머스 셀러 SaaS 운영</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">
                4050 셀러를 위한 AI 도구 &lsquo;불사자&rsquo;를 직접 만들어 운영 중. 상품 데이터·크롤링·결제까지
                풀스택으로 굴리는 실제 사업.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--line)] p-6">
              <p className="font-[family-name:var(--font-mono)] text-2xl font-semibold">SaaS 연쇄 구축</p>
              <h3 className="mt-2 font-bold">하입덕 등 복수 제품 출시</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">
                기획부터 개발·운영까지 외주 없이 직접. 전략만 말하는 컨설팅이 아니라 만들 수 있는 손이
                있습니다.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--line)] p-6">
              <p className="font-[family-name:var(--font-mono)] text-2xl font-semibold">사내 자동화 실전</p>
              <h3 className="mt-2 font-bold">내 직원들의 반복업무부터 제거</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">
                CS·정산·콘텐츠 업무를 먼저 우리 회사에서 자동화. 실패도 우리 돈으로 먼저 해봤습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. pain 공감 ── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">WHERE TIME LEAKS</p>
        <h2 className="display mt-3 max-w-2xl text-3xl sm:text-4xl">
          대표님 회사에서 시간이 새는 곳, 대부분 여기입니다
        </h2>
        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          <blockquote className="border-l-2 border-[var(--line)] pl-5">
            <p className="text-lg font-semibold leading-relaxed">
              &ldquo;CS 티켓 하나에 <span className="num">8~12분</span>. 하루 30건이면{" "}
              <span className="num">5시간</span>이다. 대표가 그 5시간에 할 일이 정말 이건가.&rdquo;
            </p>
            <p className="mt-2 text-sm text-[var(--dim)]">반복 문의 · 주문/배송 확인 · 반품 응대</p>
          </blockquote>
          <blockquote className="border-l-2 border-[var(--line)] pl-5">
            <p className="text-lg font-semibold leading-relaxed">
              &ldquo;사람을 줄이라는 게 아니다. <span className="text-[var(--cobalt)]">다음 채용을 미루라는</span>{" "}
              거다.&rdquo;
            </p>
            <p className="mt-2 text-sm text-[var(--dim)]">신입이 할 일의 몇 %가 반복업무인지부터 계산</p>
          </blockquote>
          <blockquote className="border-l-2 border-[var(--line)] pl-5">
            <p className="text-lg font-semibold leading-relaxed">
              &ldquo;재발송 한 번, 달래기 환불 한 번. 장부에는 한 줄도 안 잡히지만 마진은 알고 있다.&rdquo;
            </p>
            <p className="mt-2 text-sm text-[var(--dim)]">실수 비용 — 사람 문제가 아니라 구조 문제</p>
          </blockquote>
          <blockquote className="border-l-2 border-[var(--line)] pl-5">
            <p className="text-lg font-semibold leading-relaxed">
              &ldquo;매출이 2배가 되면 일도 2배가 되는 구조라면, 그 회사는{" "}
              <span className="text-[var(--cobalt)]">2배 매출을 못 받는다</span>.&rdquo;
            </p>
            <p className="mt-2 text-sm text-[var(--dim)]">대표가 병목인 회사는 대표의 하루가 매출 상한선</p>
          </blockquote>
        </div>
      </section>

      {/* ── 4. 프로세스 (실제 순서라 번호 사용) ── */}
      <section id="process" className="border-y border-[var(--line)] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="eyebrow">PROCESS</p>
          <h2 className="display mt-3 text-3xl sm:text-4xl">진단 없이 견적 없습니다</h2>
          <p className="mt-4 max-w-2xl text-[var(--dim)]">
            AI 도입을 팔지 않습니다. 진단에서 &lsquo;주당 몇 시간이 어느 업무에서 새는지&rsquo;부터 숫자로
            뽑아드립니다. 판단은 숫자 보고 하면 됩니다.
          </p>
          <ol className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              ["01", "진단", "업무 인벤토리 → 시간/빈도 → 오류 비용. 새는 곳을 숫자로 특정"],
              ["02", "설계", "자동화 적합성 판정과 우선순위. 효과 큰 것부터, 안 되는 건 안 된다고"],
              ["03", "구축", "직접 만듭니다. 기존 툴 연동부터 커스텀 개발까지 — 외주 하청 없음"],
              ["04", "운영", "굴러가는지까지 책임. 팀이 직접 쓰도록 정착시키고 유지보수"],
            ].map(([n, title, desc]) => (
              <li key={n} className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-6">
                <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--cobalt)]">
                  {n}
                </span>
                <h3 className="display mt-2 text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 5. 오퍼 + 공개 가격 ── */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">PRICING</p>
        <h2 className="display mt-3 text-3xl sm:text-4xl">가격을 숨기지 않습니다</h2>
        <p className="mt-4 max-w-2xl text-[var(--dim)]">
          국내 AX 컨설팅 대부분이 &lsquo;상담 후 견적&rsquo;입니다. 우리는 기준가를 먼저 공개합니다. 아래는
          파일럿 기간 기준가이며, 진단 후 업무 범위에 따라 확정됩니다.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="flex flex-col rounded-xl border border-[var(--line)] bg-white p-7">
            <h3 className="display text-xl">무료 진단</h3>
            <p className="num mt-3 text-3xl">0원</p>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--dim)]">
              30분 대화 + 업무 인벤토리 리포트. 어디서 몇 시간이 새는지 숫자로 받아보세요. 진단만 받고
              끝내셔도 됩니다.
            </p>
            <a href="#contact" className="btn-primary mt-6 justify-center">진단 신청</a>
          </div>
          <div className="flex flex-col rounded-xl border-2 border-[var(--cobalt)] bg-white p-7">
            <h3 className="display text-xl">착수 — 오딧 + 구축</h3>
            <p className="num mt-3 text-3xl">300~700만원</p>
            <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--dim)]">
              셀러/소규모 기준 · SMB 700~2,000만원
            </p>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--dim)]">
              우선순위 1~2개 업무를 실제로 자동화해 인도. 결과는 시간·비용 before/after로 보고합니다.
            </p>
            <a href="#contact" className="btn-primary mt-6 justify-center">상담 신청</a>
          </div>
          <div className="flex flex-col rounded-xl border border-[var(--line)] bg-white p-7">
            <h3 className="display text-xl">운영 리테이너</h3>
            <p className="num mt-3 text-3xl">월 50~150만원</p>
            <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[var(--dim)]">
              셀러/소규모 기준 · SMB 월 150~500만원
            </p>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--dim)]">
              구축한 자동화의 모니터링·개선 + 새 업무 자동화 확장. 필요 없으면 언제든 종료.
            </p>
            <a href="#contact" className="btn-primary mt-6 justify-center">상담 신청</a>
          </div>
        </div>
        <p className="mt-6 text-xs text-[var(--dim)]">
          GPT 구독료만 내는 회사와 업무 구조를 바꾼 회사 — 1년 뒤 차이는 급여 명세서에서 드러납니다.
        </p>
      </section>

      {/* ── 6. CTA + 폼 ── */}
      <section id="contact" className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <p className="eyebrow text-center">FREE DIAGNOSIS</p>
          <h2 className="display mt-3 text-center text-3xl sm:text-4xl">
            어디서 시간이 새는지,
            <br />
            숫자로 받아보세요
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-[var(--dim)]">
            연락처만 남기시면 1영업일 내 연락드립니다. 진단은 무료고, 영업 전화로 괴롭히지 않습니다.
          </p>
          <div className="mt-10">
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-8 text-xs text-[var(--dim)] sm:flex-row">
          <span className="font-[family-name:var(--font-mono)]">© 2026 HOWZERO</span>
          <span>기업의 반복업무를 AI로 자동화하는 AX 실행 파트너</span>
        </div>
      </footer>
    </main>
  );
}
