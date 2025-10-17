import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["en", "es", "fr", "de"];
const DEFAULT_LOCALE = "en";

/**
 * Edge-safe locale redirect middleware.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore internal routes and assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathLocale = pathname.split("/")[1];
  if (SUPPORTED_LOCALES.includes(pathLocale)) {
    return NextResponse.next();
  }

  const acceptLang = request.headers.get("accept-language") || "";
  const detected = acceptLang.split(",")[0].split("-")[0].toLowerCase();
  const locale = SUPPORTED_LOCALES.includes(detected)
    ? detected
    : DEFAULT_LOCALE;

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    // All routes except static files and API
    "/((?!api|_next|.*\\..*).*)"
  ],
};
