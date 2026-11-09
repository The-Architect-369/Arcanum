import { NextRequest, NextResponse } from "next/server";
import { handlers, architectAuthReady } from "@/auth";
import { architectOrigin } from "@/lib/architect-access";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(request: NextRequest) {
  if (!architectAuthReady())
    return NextResponse.json(
      { error: "Sign-in is not configured." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  const origin = architectOrigin(process.env.AUTH_URL);
  if (!origin || request.headers.get("host") !== new URL(origin).host)
    return NextResponse.json(
      { error: "Use the Architect sign-in address." },
      { status: 403, headers: { "Cache-Control": "private, no-store" } },
    );
  // Reverse proxies may supply an internal request URL. Never trust a forwarded
  // host to construct the OAuth callback; pin it to the configured origin.
  const canonicalHeaders = new Headers(request.headers);
  canonicalHeaders.set("host", new URL(origin).host);
  canonicalHeaders.set("x-forwarded-host", new URL(origin).host);
  canonicalHeaders.set(
    "x-forwarded-proto",
    new URL(origin).protocol.slice(0, -1),
  );
  const canonicalRequest = new NextRequest(
    new URL(request.nextUrl.pathname + request.nextUrl.search, origin),
    {
      method: request.method,
      headers: canonicalHeaders,
      body: request.method === "POST" ? await request.arrayBuffer() : undefined,
    },
  );
  return request.method === "POST"
    ? handlers.POST(canonicalRequest)
    : handlers.GET(canonicalRequest);
}
export { handle as GET, handle as POST };
