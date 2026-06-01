import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()

function read(path) {
  return readFileSync(resolve(root, path), "utf8")
}

function assertIncludes(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`${label} is missing: ${expected}`)
  }
}

const client = read("lib/paymint/client.ts")
const config = read("lib/paymint/config.ts")
const sendRoute = read("app/api/paymint/send-bill/route.ts")
const dialog = read("components/payment-dialog.tsx")

assertIncludes(config, 'sendBill: "/bill"', "Paymint V2 bill endpoint")
assertIncludes(config, 'resendBill: "/bill/resend"', "Paymint V2 resend endpoint")
assertIncludes(client, 'params.sendType ?? "URL"', "URL-only bill creation")
assertIncludes(client, "pageRedirectUrl", "payment redirect URL")
assertIncludes(client, "resendBill", "resend bill client")
assertIncludes(sendRoute, "shortUrl", "send-bill API short URL response")
assertIncludes(dialog, "window.open", "blank payment window")
assertIncludes(dialog, "window.location.href", "same-window fallback")
assertIncludes(dialog, "/api/paymint/resend-bill", "Kakao resend fallback")
assertIncludes(dialog, "지금 바로 결제하기", "direct payment CTA")
