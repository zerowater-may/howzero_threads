import { createHash, randomBytes } from "crypto"

type HashParams = {
  billId: string
  phone?: string
  price: number | string
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "")
}

/**
 * billId 생성 — phone을 주면 번호와 상품 마커를 billId에 인코딩한다.
 * 이유: 결제선생 V1 read-bill 응답에 전화번호·상품명이 없어서, 결제완료 콜백이
 * 자동 입장문자를 보낼 번호를 billId에서 복원해야 한다 (서버 저장소 없는 구조).
 * 형식: B + [T|C](통관|강의) + packed8(base36, '1'+번호로 leading 0 보존) + time + rand
 */
export function generateBillId(opts?: { phone?: string; tonggwan?: boolean }): string {
  const timePart = Date.now().toString(36).toUpperCase()
  const phoneDigits = opts?.phone ? sanitizePhone(opts.phone) : ""

  if (phoneDigits && phoneDigits.length <= 11) {
    const marker = opts?.tonggwan ? "T" : "C"
    const packed = Number(`1${phoneDigits}`).toString(36).toUpperCase().padStart(8, "0")
    const randomPart = randomBytes(3).toString("hex").toUpperCase()
    return `B${marker}${packed}${timePart}${randomPart}`.replace(/[^A-Z0-9]/g, "").slice(0, 28)
  }

  const randomPart = randomBytes(8).toString("hex").toUpperCase()
  return `BY${timePart}${randomPart}`.replace(/[^A-Z0-9]/g, "").slice(0, 20)
}

/** generateBillId가 인코딩한 번호·상품 마커 복원. 구형식(BY...)이면 null. */
export function decodeBillId(billId: string): { phone: string; isTonggwan: boolean } | null {
  const match = /^B([TC])([0-9A-Z]{8})/.exec(billId)
  if (!match) return null
  const unpacked = String(parseInt(match[2], 36))
  if (!unpacked.startsWith("1") || unpacked.length < 11) return null
  const phone = unpacked.slice(1)
  if (!/^01[0-9]{8,9}$/.test(phone)) return null
  return { phone, isTonggwan: match[1] === "T" }
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
