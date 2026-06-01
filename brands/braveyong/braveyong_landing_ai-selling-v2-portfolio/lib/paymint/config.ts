const defaultApiUrl = "https://erp-api.payssam.kr/"

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url
}

function readBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === "") return fallback
  return !["false", "0", "no", "off"].includes(value.toLowerCase())
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function getPaymintConfig() {
  const dryRun = readBool(process.env.PAYMINT_DRY_RUN, true)
  const apiUrl = trimTrailingSlash(process.env.PAYMINT_API_URL || defaultApiUrl)
  const baseUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3200")

  return {
    dryRun,
    apiUrl,
    apiVersion: process.env.PAYMINT_API_VERSION,
    apiKey: dryRun ? process.env.PAYMINT_API_KEY || "DRY_RUN_API_KEY" : requireEnv("PAYMINT_API_KEY"),
    memberId: dryRun ? process.env.PAYMINT_MEMBER_ID || "DRY_RUN_MEMBER" : requireEnv("PAYMINT_MEMBER_ID"),
    merchantId: dryRun ? process.env.PAYMINT_MERCHANT_ID || "DRY_RUN_MERCHANT" : requireEnv("PAYMINT_MERCHANT_ID"),
    callbackUrl: process.env.PAYMINT_CALLBACK_URL || `${baseUrl}/api/paymint/callback`,
    paymentRedirectUrl: process.env.PAYMINT_PAYMENT_REDIRECT_URL || `${baseUrl}/#apply`,
    defaultExpireDays: Number(process.env.PAYMINT_BILL_EXPIRE_DAYS || 3),
  }
}

export const paymintEndpoints = {
  sendBill: "/bill",
  resendBill: "/bill/resend",
  cancelBill: "/bill/cancel",
  destroyBill: "/bill/destroy",
  readBill: "/bill/read",
  legacySendBill: "/if/bill/send",
  legacyResendBill: "/if/bill/resend",
  legacyCancelBill: "/if/bill/cancel",
  legacyDestroyBill: "/if/bill/destroy",
  legacyReadBill: "/if/bill/read",
} as const
