import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()
const read = (p) => readFileSync(resolve(root, p), "utf8")

const page = read("app/815/page.tsx")
// 재설계 v2 — 11섹션 순서 (20% 이탈 방어: 섹션 3까지 신원+장면+자기판별. 후기 섹션은 2026-06-12 용팀장 지시로 제거)
const ordered = [
  "<Hero815",
  "<ChatFear815",
  "<SelfCheck815",
  "<DdayScene815",
  "<MythBuster815",
  "<Principle815",
  "<WhyYong815",
  "<Curriculum815",
  "<Scarcity815",
  "<PolicyWindow815",
  "<Price815",
  "<Faq815",
  "<FinalCta815",
]
let prev = -1
for (const c of ordered) {
  const i = page.indexOf(c)
  if (i === -1) throw new Error(`${c} 누락 (app/815/page.tsx)`)
  if (i <= prev) throw new Error(`${c} 순서 오류`)
  prev = i
}
if (!page.includes("<StickyCta815")) throw new Error("<StickyCta815 누락 (모바일 스티키 CTA)")

const hero = read("components/tonggwan/hero-815.tsx")
// 잠금판 히어로 — 인증서 통증 + 후킹 (How는 페이지 어디에도 안 푼다)
for (const copy of ["사업자 인증서", "못 만드시잖아요", "6/21"]) {
  if (!hero.includes(copy)) throw new Error(`hero 카피 누락: ${copy}`)
}

// How(방법) 유출 가드 — 잠금 원칙: 개인계좌 연결·우회로 정체는 렌더 표면에 금지
// (허용 예외: FAQ 질문 "법인사업자도 개인계좌로 되나요?"는 수정안 ⑪이 질문 유지 지시)
const LEAK_PATTERNS = ["기업인터넷뱅킹", "기업뱅킹", "금융인증서", "세관 직접"]
const surface = ["app/815/page.tsx"]
for (const f of readdirSync(resolve(root, "components/tonggwan"))) {
  if (f.endsWith(".tsx")) surface.push(`components/tonggwan/${f}`)
}
for (const f of surface) {
  const src = read(f)
  for (const p of LEAK_PATTERNS) {
    if (src.includes(p)) throw new Error(`How 유출 금지: "${p}" in ${f}`)
  }
}

// 마지막 섹션에 면책(성과 비보장) 보존
const finalCta = read("components/tonggwan/final-cta-815.tsx")
if (!finalCta.includes("성과를 보장하지 않습니다")) throw new Error("final-cta 면책 문구 누락")

// 오픈채팅 링크는 env(complete 페이지)에서만 — 본문 하드코딩 금지(유출 방지)
const dir = resolve(root, "components/tonggwan")
for (const f of readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue
  if (read(`components/tonggwan/${f}`).includes("open.kakao.com")) {
    throw new Error(`오픈채팅 링크 하드코딩 금지: components/tonggwan/${f}`)
  }
}
if (page.includes("open.kakao.com")) throw new Error("오픈채팅 링크 하드코딩 금지: app/815/page.tsx")

console.log("check-815-structure OK")
