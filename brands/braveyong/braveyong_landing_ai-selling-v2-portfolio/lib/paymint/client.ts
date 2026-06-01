import { getPaymintConfig, paymintEndpoints } from "./config"
import { generateBillId, generateHash, getExpireDate, sanitizePhone } from "./hash"
import type {
  CancelBillInput,
  DestroyBillInput,
  PaymintApiResponse,
  ReadBillInput,
  ResendBillInput,
  SendBillInput,
  SendBillResponse,
} from "./types"

async function callPaymintApi<T = PaymintApiResponse>(endpoint: string, body: object): Promise<T> {
  const config = getPaymintConfig()
  const response = await fetch(`${config.apiUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      charset: "UTF-8",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  const text = await response.text()
  let parsed: unknown

  try {
    parsed = text ? JSON.parse(text) : {}
  } catch {
    parsed = { code: "HTTP_ERROR", msg: text || `HTTP ${response.status}` }
  }

  if (!response.ok) {
    const message = typeof parsed === "object" && parsed && "msg" in parsed ? String((parsed as { msg?: unknown }).msg) : response.statusText
    throw new Error(`Paymint API failed: ${response.status} ${message}`)
  }

  return parsed as T
}

function baseAuthPayload() {
  const config = getPaymintConfig()
  return {
    apiKey: config.apiKey,
    member: config.memberId,
    merchant: config.merchantId,
  }
}

export async function sendBill(params: SendBillInput): Promise<SendBillResponse> {
  const config = getPaymintConfig()
  const cleanPhone = sanitizePhone(params.phoneNumber)
  const amount = String(params.amount)
  const billId = generateBillId()
  const hash = generateHash({ billId, phone: cleanPhone, price: amount })
  const expireDate = getExpireDate(params.expireDays ?? config.defaultExpireDays)
  const sendType = params.sendType ?? "URL"

  const requestBody = {
    ...baseAuthPayload(),
    bill: {
      billId,
      sendType,
      productName: params.productName,
      message: params.message || params.productName,
      memberName: params.memberName,
      phone: cleanPhone,
      price: amount,
      hash,
      expireDt: expireDate,
      callbackUrl: config.callbackUrl,
      pageRedirectUrl: params.pageRedirectUrl || config.paymentRedirectUrl,
    },
  }

  if (config.dryRun) {
    return {
      code: "0000",
      message: "DRY_RUN: 결제 URL 생성 요청이 정상 구성되었습니다.",
      data: {
        billId,
        hash,
        shortUrl: `https://bill.payssam.kr/dry-run/${billId}`,
      },
      dryRun: true,
    }
  }

  const response = await callPaymintApi<SendBillResponse>(paymintEndpoints.sendBill, requestBody)
  return {
    ...response,
    data: {
      ...(response.data || {}),
      billId: response.data?.billId || response.billId || response.bill_id || billId,
    },
    dryRun: false,
  }
}

export async function resendBill(params: ResendBillInput): Promise<PaymintApiResponse> {
  const config = getPaymintConfig()
  const requestBody = {
    ...baseAuthPayload(),
    bill: {
      billId: params.billId,
    },
  }

  if (config.dryRun) {
    return {
      code: "0000",
      message: "DRY_RUN: 카카오톡 청구서 재발송 요청이 정상 구성되었습니다.",
      data: {
        billId: params.billId,
      },
      dryRun: true,
    }
  }

  return callPaymintApi(paymintEndpoints.resendBill, requestBody)
}

export async function readBill(params: ReadBillInput): Promise<PaymintApiResponse> {
  const config = getPaymintConfig()
  const requestBody = {
    ...baseAuthPayload(),
    bill: {
      billId: params.billId,
    },
  }

  if (config.dryRun) {
    return {
      code: "0000",
      message: "DRY_RUN: 청구서 조회 요청이 정상 구성되었습니다.",
      data: {
        billId: params.billId,
        apprState: "W",
      },
      dryRun: true,
    }
  }

  return callPaymintApi(paymintEndpoints.readBill, requestBody)
}

export async function destroyBill(params: DestroyBillInput): Promise<PaymintApiResponse> {
  const config = getPaymintConfig()
  const amount = String(params.amount)
  const requestBody = {
    ...baseAuthPayload(),
    bill: {
      billId: params.billId,
      price: amount,
      hash: generateHash({ billId: params.billId, price: amount }),
    },
  }

  if (config.dryRun) {
    return {
      code: "0000",
      message: "DRY_RUN: 청구서 파기 요청이 정상 구성되었습니다.",
      data: {
        billId: params.billId,
      },
      dryRun: true,
    }
  }

  return callPaymintApi(paymintEndpoints.destroyBill, requestBody)
}

export async function cancelBill(params: CancelBillInput): Promise<PaymintApiResponse> {
  const config = getPaymintConfig()
  const amount = String(params.amount)
  const requestBody = {
    ...baseAuthPayload(),
    bill: {
      billId: params.billId,
      price: amount,
      hash: generateHash({ billId: params.billId, price: amount }),
    },
  }

  if (config.dryRun) {
    return {
      code: "0000",
      message: "DRY_RUN: 결제 취소 요청이 정상 구성되었습니다.",
      data: {
        billId: params.billId,
      },
      dryRun: true,
    }
  }

  return callPaymintApi(paymintEndpoints.cancelBill, requestBody)
}
