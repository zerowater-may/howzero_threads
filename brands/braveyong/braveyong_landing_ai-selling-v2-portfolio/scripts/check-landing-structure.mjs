import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()
const page = readFileSync(resolve(root, "app/page.tsx"), "utf8")
const hero = readFileSync(resolve(root, "components/hero.tsx"), "utf8")

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
  if (index === -1) {
    throw new Error(`${component} is missing from app/page.tsx`)
  }
  if (index <= previousIndex) {
    throw new Error(`${component} is in the wrong landing-page order`)
  }
  previousIndex = index
}

const requiredHeroCopy = [
  "상품은 올리는데",
  "검색도 매출도",
  "내 상황에 맞는 시작점",
]

for (const copy of requiredHeroCopy) {
  if (!hero.includes(copy)) {
    throw new Error(`Hero is missing conversion copy: ${copy}`)
  }
}
