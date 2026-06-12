import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // monorepo / 상위 lockfile 추론 경고 silence (Vercel 빌드 안정화)
  outputFileTracingRoot: __dirname,

  // Next 15.5 회귀: _document fallback prerender 오류 회피
  output: "standalone",

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Vercel Image Optimization 사용 — 후기 캡처 50장·photo 4장 자동 최적화
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // 8월 통관 특강 일시 중단 — /815를 HTTP 307로 메인(/)에 리다이렉트.
  // /815/complete(결제 완료자 입장)·/api/*는 source 정확매칭이라 영향 없음.
  // permanent:false(307) — 강의 재개 가능성 유지(308 영구 캐시 회피).
  async redirects() {
    return [{ source: "/815", destination: "/", permanent: false }]
  },
}

export default nextConfig
