import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export const config = {
  matcher: [
    "/accounts/:path*",
    "/posts/:path*",
    "/pipelines/:path*",
    "/emails/:path*",
    "/scripts/:path*",
    "/settings/:path*",
    "/customer/:path*",
    "/api/threads/:path*",
    "/api/scripts/:path*",
    "/api/schedule/:path*",
    "/api/emails/:path*",
    "/api/settings/:path*",
    "/api/admin/:path*",
    "/api/dashboard/:path*",
    "/api/customer/:path*",
  ],
};

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.sub as string);
    return response;
  } catch {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
