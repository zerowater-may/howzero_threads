import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()
const read = (p) => readFileSync(resolve(root, p), "utf8")
const must = (src, needle, label) => {
  if (!src.includes(needle)) throw new Error(`${label} is missing: ${needle}`)
}

const products = read("lib/products.ts")
must(products, '"tonggwan-815"', "products: 통관 특강 key")
must(products, "resolveProduct", "products: resolveProduct()")
must(products, "209_000", "products: 통관 특강 가격 209,000")
must(products, "tonggwan815", "products: 통관 운영 상수")

const sendRoute = read("app/api/paymint/send-bill/route.ts")
must(sendRoute, "resolveProduct", "send-bill: resolveProduct 사용")
must(sendRoute, "productKey", "send-bill: productKey 입력")

const dialog = read("components/payment-dialog.tsx")
must(dialog, "productKey", "payment-dialog: productKey prop")
must(dialog, "completePathPrefix", "payment-dialog: 완료 페이지 링크")

const complete = read("app/815/complete/page.tsx")
must(complete, "read-bill", "complete: read-bill 검증")
must(complete, "openchatUrl", "complete: 오픈채팅 링크 노출")
must(complete, "apprState", "complete: 결제상태 fail-closed 판정")

console.log("check-815-payment OK")
