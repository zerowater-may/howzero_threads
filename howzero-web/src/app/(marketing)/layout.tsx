import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "하우제로(HowZero) — AI가 일하고, 당신은 성장한다",
  description:
    "2024년 GPT-3로 SaaS를 런칭해 1년 만에 연매출 10억을 달성한 실전형 AI 자동화 파트너. 무료 AI 오딧으로 비즈니스 비효율을 진단하세요.",
};

const navLinks = [
  { href: "/ai-employees", label: "AI 직원" },
  { href: "/services", label: "서비스" },
  { href: "/pricing", label: "가격표" },
  { href: "/ai-score", label: "AI 준비도 진단" },
  { href: "/about", label: "하우제로 스토리" },
];

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          HowZero
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/audit"
          className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          무료 AI 오딧 신청
        </Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold">HowZero</p>
            <p className="mt-2 text-sm text-muted-foreground">
              AI가 일하고, 당신은 성장한다.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">서비스</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/audit" className="hover:text-foreground">
                  무료 AI 오딧
                </Link>
              </li>
              <li>
                <Link href="/ai-score" className="hover:text-foreground">
                  AI 준비도 진단
                </Link>
              </li>
              <li>
                <Link href="/ai-employees" className="hover:text-foreground">
                  AI 직원 서비스
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-foreground">
                  상품 라인업
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">회사</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  하우제로 스토리
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} HowZero. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
