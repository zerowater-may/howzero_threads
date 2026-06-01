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

class PaymintHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "PaymintHttpError"
  }
}

function readApiMessage(parsed: unknown, fallback: string): string {
  if (typeof parsed === "object" && parsed) {
    if ("message" in parsed && typeof (parsed as { message?: unknown }).message === "string") {
      return (parsed as { message: string }).message
    }
    if ("msg" in parsed && typeof (parsed as { msg?: unknown }).msg === "string") {
      return (parsed as { msg: string }).msg
    }
  }
  return fallback
}

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
    const message = readApiMessage(parsed, response.statusText)
    throw new PaymintHttpError(`Paymint API failed: ${response.status} ${message}`, response.status)
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

function legacyAuthPayload() {
  const config = getPaymintConfig()
  return {
    apikey: config.apiKey,
    member: config.memberId,
    merchant: config.merchantId,
  }
}

function shouldUseLegacyPaymintApi(config: ReturnType<typeof getPaymintConfig>): boolean {
  const apiVersion = config.apiVersion?.toLowerCase()
  if (apiVersion === "v1" || apiVersion === "legacy") return true
  if (apiVersion === "v2") return false

  try {
    const apiUrl = new URL(config.apiUrl)
    return apiUrl.hostname === "erp-api.payssam.kr"
  } catch {
    return false
  }
}

function canFallbackToLegacyApi(config: ReturnType<typeof getPaymintConfig>, error: unknown): error is PaymintHttpError {
  const apiVersion = config.apiVersion?.toLowerCase()
  return apiVersion !== "v2" && error instanceof PaymintHttpError && [403, 404, 405].includes(error.status)
}

type BillRequestContext = {
  billId: string
  cleanPhone: string
  amount: string
  hash: string
  expireDate: string
}

function withBillData(response: SendBillResponse, billId: string, extra: Record<string, unknown>): SendBillResponse {
  return {
    ...response,
    data: {
      ...(response.data || {}),
      billId: response.data?.billId || response.billId || response.bill_id || billId,
      ...extra,
    },
  }
}

async function sendLegacyTalkBill(
  params: SendBillInput,
  context: BillRequestContext,
  fallbackReason: string,
): Promise<SendBillResponse> {
  const config = getPaymintConfig()
  const requestBody = {
    ...legacyAuthPayload(),
    bill: {
      bill_id: context.billId,
      product_nm: params.productName,
      message: params.message || params.productName,
      member_nm: params.memberName,
      phone: context.cleanPhone,
      price: context.amount,
      hash: context.hash,
      expire_dt: context.expireDate,
      callbackURL: config.callbackUrl,
    },
  }

  const response = await callPaymintApi<SendBillResponse>(paymintEndpoints.legacySendBill, requestBody)
  return {
    ...withBillData(response, context.billId, {
      deliveryType: "TALK",
      fallbackReason,
      shortUrl: response.shortUrl || response.shortURL,
    }),
    bill_id: response.bill_id || context.billId,
    dryRun: false,
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
        deliveryType: "URL",
      },
      dryRun: true,
    }
  }

  const requestContext = { billId, cleanPhone, amount, hash, expireDate }

  if (sendType === "URL" && shouldUseLegacyPaymintApi(config)) {
    return sendLegacyTalkBill(params, requestContext, "PAYMINT_API_URL is configured for legacy V1 Kakao bill API.")
  }

  try {
    const response = await callPaymintApi<SendBillResponse>(paymintEndpoints.sendBill, requestBody)
    return {
      ...withBillData(response, billId, {
        deliveryType: sendType,
      }),
      dryRun: false,
    }
  } catch (error) {
    if (sendType === "URL" && canFallbackToLegacyApi(config, error)) {
      try {
        return await sendLegacyTalkBill(
          params,
          requestContext,
          `Paymint V2 URL bill API rejected the request with HTTP ${error.status}.`,
        )
      } catch {
        throw error
      }
    }
    throw error
  }
}

export async function resendBill(params: ResendBillInput): Promise<PaymintApiResponse> {
  const config = getPaymintConfig()
  if (shouldUseLegacyPaymintApi(config)) {
    const requestBody = {
      ...legacyAuthPayload(),
      bill_id: params.billId,
    }

    if (config.dryRun) {
      return {
        code: "0000",
        message: "DRY_RUN: 카카오톡 청구서 재발송 요청이 정상 구성되었습니다.",
        data: {
          billId: params.billId,
          deliveryType: "TALK",
        },
        dryRun: true,
      }
    }

    return callPaymintApi(paymintEndpoints.legacyResendBill, requestBody)
  }

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
  if (shouldUseLegacyPaymintApi(config)) {
    const requestBody = {
      ...legacyAuthPayload(),
      bill_id: params.billId,
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

    return callPaymintApi(paymintEndpoints.legacyReadBill, requestBody)
  }

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
  if (shouldUseLegacyPaymintApi(config)) {
    const requestBody = {
      ...legacyAuthPayload(),
      bill_id: params.billId,
      price: amount,
      hash: generateHash({ billId: params.billId, price: amount }),
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

    return callPaymintApi(paymintEndpoints.legacyDestroyBill, requestBody)
  }

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
  if (shouldUseLegacyPaymintApi(config)) {
    const requestBody = {
      ...legacyAuthPayload(),
      bill_id: params.billId,
      price: amount,
      hash: generateHash({ billId: params.billId, price: amount }),
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

    return callPaymintApi(paymintEndpoints.legacyCancelBill, requestBody)
  }

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
