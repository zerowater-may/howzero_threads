import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()
const read = (p) => readFileSync(resolve(root, p), "utf8")

const page = read("app/815/page.tsx")
const ordered = [
  "<Hero815",
  "<WhyNow815",
  "<Cost815",
  "<SolutionTeaser815",
  "<Curriculum815",
  "<WhyYong815",
  "<Scarcity815",
  "<Price815",
  "<Flow815",
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

const hero = read("components/tonggwan/hero-815.tsx")
for (const copy of ["8월 15일", "통관에서 멈춥니다", "6/21"]) {
  if (!hero.includes(copy)) throw new Error(`hero 카피 누락: ${copy}`)
}

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
