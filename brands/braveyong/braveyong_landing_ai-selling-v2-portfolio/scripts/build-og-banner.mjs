#!/usr/bin/env node
/**
 * og:image(카톡·페북 공유 미리보기) 배너 생성 — public/assets/og-banner.png (1200x630).
 *
 * 왜 스크립트로 두는가: 2기 배너는 손으로 만들어져서 소스가 없었다. 3기 전환 때
 * "2기 · 7월 25일 개강 · 정원 20명"이 이미지에 박힌 채로 남아 있는 걸 뒤늦게 발견했다.
 * 기수가 바뀌면 아래 BANNER 상수만 고치고 이 스크립트를 다시 돌리면 된다.
 *
 * 값은 lib/config.ts(course)와 손으로 맞춘다 — .mjs에서 TS를 못 읽어서 자동 연결은 안 한다.
 * 어긋나면 페이지는 3기인데 카톡 미리보기만 2기가 되므로, 기수 전환 시 반드시 같이 고칠 것.
 *
 * 실행: node scripts/build-og-banner.mjs
 */
import { execFileSync } from "node:child_process"
import { mkdtempSync, writeFileSync, readdirSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/** ── 기수 전환 시 여기만 고친다 (lib/config.ts course와 일치시킬 것) ── */
const BANNER = {
  eyebrow: "4주 오프라인 AI 셀링 실전반 · 3기",
  line1: "혼자 다 하던 셀러에서",
  line2Accent: "AI 직원한테 시키는",
  line2Tail: " 셀러로.",
  sub: "소싱부터 고객 응대까지, 4주 동안 같이 세팅합니다.",
  pills: ["8월 22일 개강", "정원 20명", "서울 강남 오프라인"], // 첫 번째가 강조 pill
  brand: "용감한 용팀장",
}

/** 브랜드 컬러 — globals.css의 --brand(버건디)/--marker(노랑) 계열과 맞춘 hex */
const C = {
  bg: "#0a0a0b",
  burgundy: "#991b1b",
  orange: "#c2410c",
  marker: "#f5c518",
  white: "#ffffff",
  gray: "#a1a1aa",
}

const fontPath = path.join(ROOT, "public/fonts/PretendardVariable.woff2")
if (!existsSync(fontPath)) throw new Error(`폰트 없음: ${fontPath}`)

const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<style>
  @font-face {
    font-family: "Pretendard";
    src: url("file://${fontPath}") format("woff2-variations");
    font-weight: 100 900;
    font-display: block;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    font-family: "Pretendard", system-ui, sans-serif;
    background: ${C.bg};
    color: ${C.white};
    position: relative;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }
  /* 우측 하단 버건디 글로우 — 평평한 검정 판때기가 되지 않게 깊이만 준다 */
  .glow {
    position: absolute; right: -180px; bottom: -260px;
    width: 820px; height: 820px; border-radius: 50%;
    background: radial-gradient(circle, ${C.burgundy}66 0%, ${C.orange}1f 42%, transparent 68%);
  }
  .wrap { position: relative; height: 100%; padding: 62px 72px; display: flex; flex-direction: column; }

  .top { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
  .mark {
    width: 30px; height: 30px; border-radius: 50%;
    background: ${C.orange};
    box-shadow: inset 0 0 0 8px ${C.bg};
  }
  .brand { font-size: 25px; font-weight: 800; letter-spacing: -0.02em; }

  .body { margin-top: auto; }

  .eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 26px; }
  .eyebrow .dot { width: 11px; height: 11px; border-radius: 50%; background: ${C.burgundy}; }
  .eyebrow span { font-size: 22px; font-weight: 800; color: #e05252; letter-spacing: -0.01em; }

  h1 { font-size: 74px; font-weight: 800; line-height: 1.16; letter-spacing: -0.035em; }
  h1 .accent { color: ${C.marker}; }

  .sub { margin-top: 30px; font-size: 25px; font-weight: 500; color: ${C.gray}; letter-spacing: -0.02em; }

  .pills { margin-top: 44px; display: flex; gap: 14px; }
  .pill {
    padding: 13px 26px; border-radius: 999px;
    font-size: 21px; font-weight: 700; letter-spacing: -0.02em;
    border: 2px solid #3f3f46; color: #e4e4e7;
  }
  .pill.on { background: ${C.burgundy}; border-color: ${C.burgundy}; color: ${C.white}; }
</style></head>
<body>
  <div class="glow"></div>
  <div class="wrap">
    <div class="top"><div class="mark"></div><div class="brand">${BANNER.brand}</div></div>
    <div class="body">
      <div class="eyebrow"><div class="dot"></div><span>${BANNER.eyebrow}</span></div>
      <h1>${BANNER.line1}<br><span class="accent">${BANNER.line2Accent}</span>${BANNER.line2Tail}</h1>
      <div class="sub">${BANNER.sub}</div>
      <div class="pills">
        ${BANNER.pills.map((p, i) => `<div class="pill${i === 0 ? " on" : ""}">${p}</div>`).join("\n        ")}
      </div>
    </div>
  </div>
</body></html>`

/** puppeteer 캐시에 받아둔 chrome-headless-shell 중 가장 최신 버전을 쓴다 */
function findChrome() {
  const base = path.join(process.env.HOME, ".cache/puppeteer/chrome-headless-shell")
  if (!existsSync(base)) throw new Error(`chrome-headless-shell 없음: ${base}`)
  const versions = readdirSync(base)
    .filter((d) => d.startsWith("mac") || d.startsWith("linux") || d.startsWith("win"))
    .sort()
  for (const v of versions.reverse()) {
    for (const name of ["chrome-headless-shell-mac-arm64", "chrome-headless-shell-mac-x64", "chrome-headless-shell-linux64"]) {
      const bin = path.join(base, v, name, "chrome-headless-shell")
      if (existsSync(bin)) return bin
    }
  }
  throw new Error("chrome-headless-shell 실행 파일을 못 찾았다")
}

const tmp = mkdtempSync(path.join(tmpdir(), "og-banner-"))
const htmlPath = path.join(tmp, "banner.html")
writeFileSync(htmlPath, html)

const out = path.join(ROOT, "public/assets/og-banner.png")
execFileSync(findChrome(), [
  "--headless",
  "--disable-gpu",
  "--hide-scrollbars",
  "--force-device-scale-factor=1",
  "--window-size=1200,630",
  `--screenshot=${out}`,
  `file://${htmlPath}`,
], { stdio: "inherit" })

console.log(`og-banner 생성 완료 → ${out}`)
