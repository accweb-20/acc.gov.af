// proxy.ts  (Next.js 16 "proxy", formerly middleware)
//
// admin.acc.gov.af  → serves the inquiries dashboard (app/(admin)/manage/*)
//                     e.g. admin.acc.gov.af/inquiry/123  →  /manage/inquiry/123
//                     Everything except /login requires a valid admin session.
// any other host    → /manage/* is hidden (404); the public site is untouched.

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isAdminHost, verifySessionToken } from "@/lib/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");

  // ---------- Public website ----------
  if (!isAdminHost(host)) {
    if (pathname === "/manage" || pathname.startsWith("/manage/")) {
      return new NextResponse("Not found", { status: 404 });
    }
    return NextResponse.next();
  }

  // ---------- Admin subdomain ----------
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const session = await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
  const isLogin = pathname === "/login";

  if (!session && !isLogin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (session && isLogin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? "/manage" : `/manage${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals and static files
  matcher: ["/((?!_next/|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map|woff2?|ttf|txt|xml)$).*)"],
};
