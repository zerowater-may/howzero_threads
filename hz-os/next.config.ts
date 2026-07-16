import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite는 WASM 자산을 fs로 직접 읽는다 — 번들링하면 URL 인자 에러가 나서 native require로 externalize.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
