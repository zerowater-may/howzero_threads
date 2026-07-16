import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hz-os · howzero 프로젝트 포털",
  description: "howzero AX 프로젝트 진행 현황과 문서를 고객과 함께 봅니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
