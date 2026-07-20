import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Nanum_Pen_Script, Gowun_Dodum, Gaegu } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { ClarityProvider } from "@/components/clarity"
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

/**
 * Pretendard Variable — self-host (jsdelivr CDN 의존 제거).
 * variable font 1개로 weight 45~920 전부 커버 (약 2MB).
 *
 * preload=false 의도: LCP 후보가 텍스트인데 2MB woff2를 preload하면 LCP를 늦춘다.
 * display=swap으로 fallback paint 후 폰트 도착 시 교체. fallback은 system-ui라 CLS 거의 0.
 */
const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
  weight: "45 920",
  preload: false,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
  adjustFontFallback: false,
})

/**
 * 손글씨 액센트 — next/font/google로 self-host (render-block 제거 + CDN 핸드셰이크 0).
 * 본문 가시 영역엔 안 쓰여 preload 끔(LCP에 영향 없음, 손글씨는 swap으로 충분).
 */
const nanumPenScript = Nanum_Pen_Script({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-nanum-pen",
  preload: false,
})

const gowunDodum = Gowun_Dodum({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-gowun-dodum",
  preload: false,
})

const gaegu = Gaegu({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-gaegu",
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.gigclass.kr"),
  title: "4주 오프라인 AI 셀링 실전반 — 용감한 용팀장",
  description:
    "물건 찾기부터 고객 응대까지, 나만의 AI 직원한테 시키는 셀러로. 4주 동안 AI 직원 세팅 + 효자상품 10개. 서울 강남 오프라인 4회 + 줌 보강 4회 · 2기 모집 중.",
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
    title: "4주 오프라인 AI 셀링 실전반 — 용감한 용팀장",
    description:
      "물건 찾기부터 고객 응대까지, 나만의 AI 직원한테 시키는 셀러로. 4주 동안 AI 직원 세팅 + 효자상품 10개를 같이 만듭니다.",
    siteName: "용감한 용팀장",
    images: [
      {
        url: "/assets/og-banner.png",
        width: 1200,
        height: 630,
        alt: "용감한 용팀장 — 4주 오프라인 AI 셀링 실전반",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "4주 오프라인 AI 셀링 실전반 — 용감한 용팀장",
    description: "나만의 AI 직원 세팅 + 효자상품 10개를 4주 동안 같이 만듭니다. 서울 강남 · 소수정예.",
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
        {/* 폰트는 next/font로 self-host (render-blocking CDN 폰트 제거).
            Pretendard/Geist/손글씨 4종 모두 _next/static/media/*.woff2 로 서빙. */}
        {/* JSON-LD: 한국어 강의 상품 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              name: "4주 오프라인 AI 셀링 실전반 (2기)",
              description:
                "나만의 AI 직원 세팅 + 효자상품 10개. 오프라인 4회 + 줌 보강 4회, 서울 강남, 소수정예.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${pretendard.variable} ${nanumPenScript.variable} ${gowunDodum.variable} ${gaegu.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <Suspense fallback={null}>
            {children}
            <Toaster />
          </Suspense>
        </ThemeProvider>
        <Analytics />
        <ClarityProvider />
      </body>
    </html>
  )
}
