import { NextResponse, type NextRequest } from "next/server";
import { isPublicSitePath } from "@/lib/public-routes";

export function middleware(req: NextRequest) {
  // ✅ Dev bypass: allow everything on localhost/dev so you can build on desktop
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const { pathname, searchParams } = req.nextUrl;

  // The public editorial pages are available on desktop and mobile. Existing
  // alpha routes retain their current device gate until separately reviewed.
  if (isPublicSitePath(pathname)) {
    return NextResponse.next();
  }

  // Allow Next internals + assets
  const allowList = [
    "/mobile-only",
    "/_next",
    "/manifest.json",
    "/icons",
    "/favicon.ico",
    "/logo-arcanum.svg",
    "/sw.js",
  ];

  if (allowList.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Optional: allow install-mode bypass in prod too
  if (searchParams.get("install") === "1") {
    return NextResponse.next();
  }

  const ua = req.headers.get("user-agent") || "";
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);

  if (isMobile) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/mobile-only";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api).*)"],
};
