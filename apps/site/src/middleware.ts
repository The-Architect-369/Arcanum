import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get("host") || "";
  if (host.toLowerCase() === "www.arcanum.io") {
    url.host = "arcanum.io";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}
