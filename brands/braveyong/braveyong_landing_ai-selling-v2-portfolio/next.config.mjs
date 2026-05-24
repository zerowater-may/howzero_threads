import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // monorepo / 상위 lockfile 추론 경고 silence (Vercel 빌드 안정화)
  outputFileTracingRoot: __dirname,

  typescript: {
    ignoreBuildErrors: true,
  },

  // Vercel Image Optimization 사용 — 후기 캡처 50장·photo 4장 자동 최적화
  images: {
    formats: ["image/avif", "image/webp"],
  },
}

export default nextConfig
