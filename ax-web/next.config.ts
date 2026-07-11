import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite는 wasm 자산을 런타임에 로드 — 번들링하면 서버리스에서 instantiateWasm 실패.
  // 외부 패키지로 두면 Vercel 파일 트레이싱이 node_modules의 wasm까지 포함한다.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
