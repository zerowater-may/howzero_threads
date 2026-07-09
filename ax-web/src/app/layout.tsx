import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "howzero — 당신 회사만의 AI 운영 OS",
  description:
    "반복업무 시간, 어떻게 0으로 만드나. 연매출 10억 이커머스 SaaS를 직접 자동화해본 운영자가 프로세스 정립부터 자동화까지 — 회사만의 AI 운영 OS를 만듭니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
