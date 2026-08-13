import { readFileSync, readdirSync } from "node:fs"
import { resolve, join } from "node:path"

/**
 * 랜딩(/) 구조 가드.
 *
 * 2026-08-05 재작성 — 이 스크립트는 7/20 히어로 개편(가격·카운트다운을 히어로에서 뺀 변경)
 * 이후로 계속 실패하고 있었다. 사라진 카피 문자열 3개를 그대로 요구하고 있었기 때문이다.
 * 항상 빨간불인 가드는 아무것도 못 잡는다.
 *
 * 그래서 "특정 카피 문장"을 박아두는 방식을 버렸다. 카피는 자주 바뀌고, 바뀔 때마다
 * 이 파일을 같이 고치는 걸 잊으면 또 같은 상태가 된다. 대신 실제로 사고가 났던 것을 막는다:
 * 기수 전환 때 값이 컴포넌트에 하드코딩돼 있어서 config만 고치면 화면 곳곳이 옛 기수로
 * 남는 문제 (2기 → 3기 전환에서 13곳이 그랬다).
 */

const root = process.cwd()
const read = (p) => readFileSync(resolve(root, p), "utf8")

/* ── 1. 섹션 순서 ── */

const page = read("app/page.tsx")

const orderedComponents = [
  "<Hero",
  "<Strip",
  "<Problem",
  "<AIDefinition",
  "<Outcome",
  "<SituationChoice",
  "<TrustEvidence",
  "<TestimonialWall",
  "<OriginStory",
]

let previousIndex = -1
for (const component of orderedComponents) {
  const index = page.indexOf(component)
  if (index === -1) throw new Error(`${component} is missing from app/page.tsx`)
  if (index <= previousIndex) throw new Error(`${component} is in the wrong landing-page order`)
  previousIndex = index
}

/* ── 2. 히어로 필수 요소 ──
   카피 문장이 아니라 "히어로가 하는 일"을 검사한다. 문구는 바뀌어도 되지만
   포지셔닝(AI 직원) · 커리큘럼으로 내려보내는 CTA · 모집 상태 한 줄은 남아야 한다. */

const hero = read("components/hero.tsx")

const heroRequirements = [
  { label: "핵심 포지셔닝 (AI 직원)", test: (s) => s.includes("AI 직원") },
  { label: "커리큘럼 앵커 CTA", test: (s) => s.includes('href="#curriculum"') },
  {
    label: "모집 상태 한 줄 (기수·개강일·정원)",
    test: (s) =>
      /course\.cohort[\s\S]{0,200}course\.startDate[\s\S]{0,200}course\.capacityMax/.test(s),
  },
]

for (const r of heroRequirements) {
  if (!r.test(hero)) throw new Error(`Hero is missing: ${r.label}`)
}

/* ── 3. 기수 값 하드코딩 금지 ──
   이게 이 스크립트의 존재 이유다. lib/config.ts 의 현재 값이 컴포넌트에 문자열로
   박혀 있으면 다음 기수 전환 때 config만 고치고 화면은 옛 값으로 남는다.
   config.ts 자체와 주석은 예외. */

const config = read("lib/config.ts")

const pick = (re, name) => {
  const m = config.match(re)
  if (!m) {
    throw new Error(`lib/config.ts 에서 ${name} 를 파싱하지 못했다 — 이 스크립트를 같이 고쳐야 한다`)
  }
  return m[1]
}

const cohort = pick(/cohort:\s*"([^"]+)"/, "course.cohort") // "3기"
const startDate = pick(/startDate:\s*"([^"]+)"/, "course.startDate") // "8월 22일 토요일"
const endDate = pick(/endDate:\s*"([^"]+)"/, "course.endDate") // "9월 12일 토요일"
const priceFirst = pick(/priceFirst:\s*([\d_]+)/, "course.priceFirst")

const wan = (n) => `${(Number(String(n).replace(/_/g, "")) / 10000).toLocaleString()}만원`

/** 컴포넌트에 나타나면 안 되는 리터럴 — 전부 config를 거쳐야 한다 */
const forbidden = [
  { value: cohort, hint: "course.cohort 를 쓸 것" },
  { value: startDate, hint: "course.startDate 를 쓸 것" },
  { value: endDate, hint: "course.endDate 를 쓸 것" },
  { value: wan(priceFirst), hint: "priceText.total 을 쓸 것" },
]

/**
 * "부가세 별도" 는 화면에 남아 있으면 안 된다 (2026-08-13 가격 구조 변경).
 * priceFirst 가 부가세 포함 최종 결제액이 됐으므로, 이 문구가 살아 있으면
 * 페이지가 실제보다 10% 싼 것처럼 읽히고 결제창에서 금액이 달라 보인다.
 */
const forbiddenPhrases = [{ value: "부가세 별도", hint: "가격은 전부 부가세 포함이다 — '부가세 포함' 으로 쓸 것" }]

/** 주석을 지운 뒤 검사 — 주석 속 기수 표기는 화면에 안 나가므로 문제가 아니다 */
const stripComments = (s) =>
  s
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")

const walk = (dir) => {
  const out = []
  for (const e of readdirSync(resolve(root, dir), { withFileTypes: true })) {
    if (e.name === "ui" || e.name === "node_modules") continue
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(p))
    else if (e.name.endsWith(".tsx")) out.push(p)
  }
  return out
}

const violations = []
const phraseViolations = []
for (const file of [...walk("components"), ...walk("app")]) {
  const src = stripComments(read(file))
  for (const f of forbidden) {
    if (src.includes(f.value)) {
      violations.push(`${file}: "${f.value}" 하드코딩 — ${f.hint}`)
    }
  }
  for (const f of forbiddenPhrases) {
    if (src.includes(f.value)) {
      phraseViolations.push(`${file}: "${f.value}" — ${f.hint}`)
    }
  }
}

if (violations.length > 0) {
  throw new Error(
    "기수 값이 컴포넌트에 하드코딩돼 있다. 다음 기수 전환 때 화면이 옛 값으로 남는다:\n  " +
      violations.join("\n  ")
  )
}

if (phraseViolations.length > 0) {
  throw new Error(
    "가격 표기가 실제 청구 구조와 어긋난다:\n  " + phraseViolations.join("\n  ")
  )
}

/* ── 4. 캘린더 날짜 사본 금지 ──
   기수 값 가드(3번)는 "8월 22일 토요일" 형태만 잡는다. 캘린더는 같은 날짜를
   "8.22 · 8.29 · 9.5 · 9.12" 점 표기로 쓰기 때문에 3번을 통과해 버린다.
   실제로 2기 → 3기 전환에서 months 그리드만 바뀌고 이 요약 줄은 7.25 그대로 남아,
   한 섹션 안에서 그리드와 요약이 다른 일정을 말하는 채로 배포됐다.
   요약 줄은 months 에서 파생시켰으므로, 점 표기 날짜 나열이 다시 나타나면 사본이 부활한 것이다. */

const calendar = stripComments(read("components/calendar.tsx"))
const dateSequence = />[^<>{}]*\d{1,2}\.\d{1,2}\s*·\s*\d{1,2}\.\d{1,2}/

if (dateSequence.test(calendar)) {
  throw new Error(
    "components/calendar.tsx 에 점 표기 날짜 나열(예: 8.22 · 8.29)이 하드코딩돼 있다. " +
      "months 배열에서 파생시키는 summaryDates() 를 쓸 것 — 사본을 두면 기수 전환 때 그리드와 어긋난다."
  )
}

/* ── 5. og 배너 소스가 config 와 어긋나지 않는지 ──
   og-banner.png 는 빌드 산출물이 아니라 커밋된 이미지다. 2기 배너는 소스 없이 손으로
   만들어져서 3기 전환 때 "2기 · 7월 25일 개강"이 박힌 채로 남아 있었다.
   scripts/build-og-banner.mjs 의 BANNER 상수가 config 와 맞는지만 확인한다.
   (이미지 픽셀은 검사하지 않는다 — BANNER 를 고치고 스크립트를 돌리는 게 절차다.) */

const banner = read("scripts/build-og-banner.mjs")

if (!banner.includes(cohort)) {
  throw new Error(
    `scripts/build-og-banner.mjs 의 BANNER 에 현재 기수(${cohort})가 없다. ` +
      "BANNER 를 고치고 'node scripts/build-og-banner.mjs' 로 og-banner.png 를 다시 만들 것."
  )
}

/** startDate "8월 22일 토요일" → 배너 표기 "8월 22일 개강" 과 대조할 날짜 부분만 */
const startDay = startDate.match(/^(\d+월\s*\d+일)/)
if (startDay && !banner.includes(startDay[1])) {
  throw new Error(
    `scripts/build-og-banner.mjs 의 BANNER 개강일이 config(${startDay[1]})와 다르다. ` +
      "카톡 공유 미리보기가 옛 날짜로 나간다."
  )
}

console.log("check-landing-structure OK")
