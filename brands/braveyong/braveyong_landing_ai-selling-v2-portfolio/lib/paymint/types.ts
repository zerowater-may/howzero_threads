export type PaymintBillStatus = "F" | "W" | "C" | "D"

export type SendBillInput = {
  phoneNumber: string
  memberName: string
  amount: number
  productName: string
  message?: string
  expireDays?: number
  sendType?: "TALK" | "URL"
  pageRedirectUrl?: string
}

export type ResendBillInput = {
  billId: string
}

export type ReadBillInput = {
  billId: string
}

export type DestroyBillInput = {
  billId: string
  amount: number
}

export type CancelBillInput = {
  billId: string
  amount: number
}

export type PaymintApiResponse = {
  code: string
  msg?: string
  message?: string
  data?: Record<string, unknown>
  [key: string]: unknown
}

export type SendBillResponse = PaymintApiResponse & {
  apiKey?: string
  apikey?: string
  member?: string
  merchant?: string
  billId?: string
  bill_id?: string
  hash?: string
  shortUrl?: string
  shortURL?: string
  deliveryType?: "URL" | "TALK"
  fallbackReason?: string
  dryRun?: boolean
}

export type PaymentCallbackData = {
  apikey?: string
  apiKey?: string
  member?: string
  bill_id: string
  appr_pay_type?: string
  appr_card_type?: string | null
  appr_dt?: string
  appr_origin_dt?: string | null
  appr_price?: string
  appr_issuer?: string | null
  appr_issuer_cd?: string | null
  appr_issuer_num?: string | null
  appr_acquirer_cd?: string | null
  appr_acquirer_nm?: string | null
  appr_num?: string | null
  appr_origin_num?: string | null
  appr_res_cd?: string | null
  appr_monthly?: string | null
  appr_state?: PaymintBillStatus
  appr_cash_num?: string | null
  appr_cash_trader?: string | null
  appr_cash_issuance_number?: string | null
}
