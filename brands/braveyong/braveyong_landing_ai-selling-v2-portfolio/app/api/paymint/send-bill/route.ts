import { NextResponse } from "next/server"
import { z } from "zod"
import { course } from "@/lib/config"
import { sendBill } from "@/lib/paymint/client"
import { sanitizePhone } from "@/lib/paymint/hash"

export const runtime = "nodejs"

const SendBillSchema = z.object({
  memberName: z.string().trim().min(2, "이름을 입력해주세요.").max(30, "이름은 30자 이하로 입력해주세요."),
  phoneNumber: z.string().trim().min(10, "연락처를 입력해주세요.").max(20, "연락처가 너무 깁니다."),
})

export async function POST(request: Request) {
  try {
    const body = SendBillSchema.parse(await request.json())
    const phoneNumber = sanitizePhone(body.phoneNumber)

    if (!/^01[0-9]{8,9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: "휴대폰 번호를 01012345678 형식으로 입력해주세요." },
        { status: 400 },
      )
    }

    const result = await sendBill({
      memberName: body.memberName,
      phoneNumber,
      amount: course.priceFirst,
      productName: `${course.name} ${course.cohort}`,
      message: `${course.name} ${course.cohort} 결제 청구서입니다. 신청/상담 후 결제 안내를 받으신 분만 진행해주세요.`,
    })

    return NextResponse.json({
      success: result.code === "0000",
      data: {
        billId: result.bill_id,
        shortURL: result.shortURL,
        code: result.code,
        message: result.msg,
        dryRun: Boolean(result.dryRun),
        amount: course.priceFirst,
      },
      error: result.code === "0000" ? undefined : result.msg,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || "입력값을 확인해주세요." }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "청구서 발송 중 오류가 발생했습니다." },
      { status: 500 },
    )
  }
}
