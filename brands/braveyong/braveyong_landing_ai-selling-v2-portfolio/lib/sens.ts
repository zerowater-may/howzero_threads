import { createHmac } from "node:crypto"

/**
 * NCP SENS SMS v2 클라이언트 — bulsa_server/Libs/SendSMS.ts 이식판.
 * crypto-js 대신 Node 내장 crypto 사용 (서명 알고리즘 동일: HMAC-SHA256 → Base64).
 * env 4종이 모두 있어야 활성화되고, 없으면 호출부가 조용히 스킵한다 (결제 흐름 무영향).
 */
export type SensConfig = {
  accessKey: string
  secretKey: string
  serviceId: string
  callNumber: string
}

export function getSensConfig(): SensConfig | null {
  const accessKey = process.env.NCP_SENS_ACCESS || ""
  const secretKey = process.env.NCP_SENS_SECRET || ""
  const serviceId = process.env.NCP_SENS_ID || ""
  const callNumber = process.env.NCP_SENS_NUMBER || ""
  if (!accessKey || !secretKey || !serviceId || !callNumber) return null
  return { accessKey, secretKey, serviceId, callNumber }
}

export type SendSmsInput = {
  to: string
  content: string
  /** LMS(장문) 기본 — 오픈채팅 링크 안내문은 90바이트를 넘는다 */
  type?: "SMS" | "LMS"
  title?: string
}

export type SendSmsResult =
  | { ok: true; statusCode: string }
  | { ok: false; error: string }

export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const config = getSensConfig()
  if (!config) return { ok: false, error: "SENS env 미설정 (NCP_SENS_*)" }

  const to = input.to.replace(/[^0-9]/g, "")
  if (!/^01[016789][0-9]{7,8}$/.test(to)) {
    return { ok: false, error: `수신번호 형식 오류: ${input.to}` }
  }

  const timestamp = Date.now().toString()
  const uri = `/sms/v2/services/${config.serviceId}/messages`
  const signature = createHmac("sha256", config.secretKey)
    .update(`POST ${uri}\n${timestamp}\n${config.accessKey}`)
    .digest("base64")

  const type = input.type ?? "LMS"
  const body: Record<string, unknown> = {
    type,
    contentType: "COMM",
    countryCode: "82",
    from: config.callNumber,
    content: input.content,
    messages: [{ to, content: input.content }],
  }
  if (type === "LMS" && input.title) {
    body.subject = input.title
    ;(body.messages as Array<Record<string, unknown>>)[0].subject = input.title
  }

  try {
    const response = await fetch(`https://sens.apigw.ntruss.com${uri}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-ncp-apigw-timestamp": timestamp,
        "x-ncp-iam-access-key": config.accessKey,
        "x-ncp-apigw-signature-v2": signature,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const value = (await response.json().catch(() => ({}))) as { statusCode?: string; statusName?: string }
    if (value.statusCode !== "202") {
      return { ok: false, error: `SENS 응답 ${response.status} / ${value.statusCode ?? "?"} ${value.statusName ?? ""}` }
    }
    return { ok: true, statusCode: value.statusCode }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "SENS 호출 실패" }
  }
}
