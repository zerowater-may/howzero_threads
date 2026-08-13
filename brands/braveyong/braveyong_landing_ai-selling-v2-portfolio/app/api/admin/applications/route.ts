import { NextResponse } from "next/server"
import { listApplications } from "@/lib/application-registry"
import { applicationFields } from "@/lib/application-form"

export const runtime = "nodejs"

/**
 * 신청서 응답 조회 (운영자 전용).
 *
 *   GET /api/admin/applications?key=$ADMIN_SECRET          → JSON
 *   GET /api/admin/applications?key=$ADMIN_SECRET&format=csv → 엑셀에서 바로 열리는 CSV
 *
 * 리컨사일 크론의 RECONCILE_SECRET 을 재사용하지 않는 이유: 그 키는 서버 crontab env 와
 * /var/log 에 URL 로 남는다. 여기에는 이름·전화·매출 구간이 들어 있어 같은 키를 쓰면 안 된다.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const key = url.searchParams.get("key") || request.headers.get("x-admin-key") || ""
  const secret = process.env.ADMIN_SECRET || ""

  if (!secret || key !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const applications = await listApplications(500)

  if (url.searchParams.get("format") === "csv") {
    const headers = ["제출시각", "이름", "연락처", ...applicationFields.map((f) => f.label)]
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    const rows = applications.map((app) =>
      [
        app.submittedAt,
        app.memberName,
        app.phone,
        ...applicationFields.map((f) => {
          const value = app.answers?.[f.key]
          return Array.isArray(value) ? value.join(" / ") : (value ?? "")
        }),
      ]
        .map((v) => escape(String(v)))
        .join(","),
    )
    // BOM — 없으면 엑셀이 한글을 깨서 연다
    const csv = "﻿" + [headers.map(escape).join(","), ...rows].join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="applications.csv"`,
        "Cache-Control": "no-store",
      },
    })
  }

  return NextResponse.json({ count: applications.length, applications }, { headers: { "Cache-Control": "no-store" } })
}
