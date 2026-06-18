import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Jessin Sam - AI Innovation & Creative Technology | jess.vc",
  description:
    "Passionate about AI innovation and creative technology. Founder of Eqqal and 1UI. Building tools that bridge the gap between imagination and creation.",
  keywords: [
    "Jessin Sam",
    "AI Innovation",
    "Creative Technology",
    "Eqqal",
    "1UI",
    "Computer Vision",
    "Design",
    "Product Design",
    "AI Tools",
  ],
  authors: [{ name: "Jessin Sam", url: "https://jessinsam.com" }],
  creator: "Jessin Sam",
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: "https://jess.vc",
    title: "Jessin Sam - AI Innovation & Creative Technology",
    description:
      "Passionate about AI innovation and creative technology. Founder of Eqqal and 1UI. Building tools that bridge the gap between imagination and creation.",
    siteName: "jess.vc",
    images: [
      {
        url: "https://jess.vc/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Jessin Sam - AI Innovation & Creative Technology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jessin Sam - AI Innovation & Creative Technology",
    description: "Passionate about AI innovation and creative technology. Founder of Eqqal and 1UI.",
    creator: "@jessinvibe",
    images: ["https://jess.vc/og-image.jpg"],
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
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Jessin Sam",
              url: "https://jess.vc",
              image: "https://jess.vc/profile.jpg",
              sameAs: [
                "https://x.com/jessinvibe",
                "https://jessinsam.com",
                "https://www.eqqal.com",
                "https://www.1ui.dev",
              ],
              jobTitle: "Founder & AI Innovator",
              worksFor: [
                {
                  "@type": "Organization",
                  name: "Eqqal",
                  url: "https://www.eqqal.com",
                },
                {
                  "@type": "Organization",
                  name: "1UI",
                  url: "https://www.1ui.dev",
                },
              ],
              description:
                "Passionate about AI innovation and creative technology. With a background in computer vision and design, I'm committed to building tools that bridge the gap between imagination and creation.",
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Suspense fallback={null}>
          {children}
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
