/**
 * NCP SENS 문자 발송 단건 테스트 — 운영 점검용.
 * 사용: node --env-file=.env.local scripts/test-sms.mjs 01012345678
 * lib/sens.ts와 동일한 서명/엔드포인트 (테스트 유틸이라 의도적으로 독립 구현).
 */
import { createHmac } from "node:crypto"

const to = (process.argv[2] || "").replace(/[^0-9]/g, "")
if (!/^01[016789][0-9]{7,8}$/.test(to)) {
  console.error("사용법: node --env-file=.env.local scripts/test-sms.mjs 010XXXXXXXX")
  process.exit(1)
}

const accessKey = process.env.NCP_SENS_ACCESS
const secretKey = process.env.NCP_SENS_SECRET
const serviceId = process.env.NCP_SENS_ID
const callNumber = process.env.NCP_SENS_NUMBER
const openchatUrl = process.env.NEXT_PUBLIC_TONGGWAN_OPENCHAT_URL
if (!accessKey || !secretKey || !serviceId || !callNumber) {
  console.error("NCP_SENS_* env 4종이 필요합니다 (.env.local 확인)")
  process.exit(1)
}

const timestamp = Date.now().toString()
const uri = `/sms/v2/services/${serviceId}/messages`
const signature = createHmac("sha256", secretKey)
  .update(`POST ${uri}\n${timestamp}\n${accessKey}`)
  .digest("base64")

const content = [
  "[용감한 용팀장] 8.15 통관특강 결제가 확인됐습니다. 감사합니다.",
  "",
  "카톡 오픈채팅방 입장:",
  openchatUrl || "(NEXT_PUBLIC_TONGGWAN_OPENCHAT_URL 미설정)",
  "",
  "6/21(일) 저녁 8시 라이브 안내를 방에서 드립니다.",
].join("\n")

const response = await fetch(`https://sens.apigw.ntruss.com${uri}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "x-ncp-apigw-timestamp": timestamp,
    "x-ncp-iam-access-key": accessKey,
    "x-ncp-apigw-signature-v2": signature,
  },
  body: JSON.stringify({
    type: "LMS",
    contentType: "COMM",
    countryCode: "82",
    from: callNumber,
    subject: "8.15 통관특강 입장 안내",
    content,
    messages: [{ to, subject: "8.15 통관특강 입장 안내", content }],
  }),
})

const result = await response.json().catch(() => ({}))
console.log("HTTP", response.status, JSON.stringify(result, null, 2))
process.exit(result.statusCode === "202" ? 0 : 1)
