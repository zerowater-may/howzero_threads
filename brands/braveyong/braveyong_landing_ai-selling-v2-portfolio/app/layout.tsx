import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,             // 사용자 줌 허용 (접근성)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://braveyong.example.com"),
  title: "6주 오프라인 AI 셀링 실전반 — 용감한 용팀장",
  description:
    "1000개를 무작정 올리는 셀러에서 효자상품 10개를 만드는 셀러로. 서울 강남 오프라인 6회 + 줌 보강 5회. 1기 모집 중 · 신청서 검토 후 안내.",
  keywords: [
    "용감한 용팀장",
    "AI 셀링",
    "스마트스토어",
    "구매대행",
    "효자상품",
    "오프라인 강의",
    "1인 셀러",
    "직장인 셀러",
    "육아아빠 셀러",
  ],
  authors: [{ name: "용감한 용팀장" }],
  creator: "용감한 용팀장",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "6주 오프라인 AI 셀링 실전반 — 용감한 용팀장",
    description:
      "1000개를 무작정 올리는 셀러에서 효자상품 10개를 만드는 셀러로. 서울 강남 오프라인 6회 + 줌 보강 5회.",
    siteName: "용감한 용팀장",
    images: [
      {
        url: "/assets/og-banner.png",
        width: 1200,
        height: 630,
        alt: "용감한 용팀장 — 6주 오프라인 AI 셀링 실전반",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "6주 오프라인 AI 셀링 실전반 — 용감한 용팀장",
    description: "효자상품 10개를 6주 동안 같이 만듭니다. 서울 강남 · 10~15명 소수정예.",
    images: ["/assets/og-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 한글 본문: Pretendard Variable */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        {/* 손글씨 액센트: Nanum Pen Script(서명·강조) + Gowun Dodum(메모) + Gaegu(보조) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Gowun+Dodum&family=Gaegu:wght@400;700&display=swap"
        />
        {/* JSON-LD: 한국어 강의 상품 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              name: "6주 오프라인 AI 셀링 실전반 (1기)",
              description:
                "1000개를 무작정 올리는 셀러에서 효자상품 10개를 만드는 셀러로. 오프라인 6회 + 줌 보강 5회, 서울 강남, 10~15명 소수정예.",
              provider: {
                "@type": "Person",
                name: "용감한 용팀장",
              },
              inLanguage: "ko",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <Suspense fallback={null}>
            {children}
            <Toaster />
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
