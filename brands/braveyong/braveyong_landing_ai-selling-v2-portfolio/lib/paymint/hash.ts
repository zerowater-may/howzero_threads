import { createHash, randomBytes } from "crypto"

type HashParams = {
  billId: string
  phone?: string
  price: number | string
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "")
}

export function generateBillId(prefix = "BY"): string {
  const timePart = Date.now().toString(36).toUpperCase()
  const randomPart = randomBytes(8).toString("hex").toUpperCase()
  return `${prefix}${timePart}${randomPart}`.replace(/[^A-Z0-9]/g, "").slice(0, 20)
}

export function generateHash({ billId, phone, price }: HashParams): string {
  const parts = phone ? [billId, sanitizePhone(phone), String(price)] : [billId, String(price)]
  return createHash("sha256").update(parts.join(",")).digest("hex")
}

export function getExpireDate(daysFromNow: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
