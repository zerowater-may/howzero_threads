import { NextRequest, NextResponse } from "next/server";
import { clearStaffSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await clearStaffSession();
  return NextResponse.redirect(new URL("/login", request.url));
}
