import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MOBILE_REGEX = /(iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini)/i;

export function middleware(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  const url = new URL(req.url);

  // Allow if PWA installed (display-mode header set by browsers when launched from home screen)
  const displayMode = req.headers.get('sec-ch-ua-mobile') || '';
  const isMobileUA = MOBILE_REGEX.test(ua);

  // Whitelist internal/system routes
  const allowList = ['/mobile-only', '/_next', '/manifest.json', '/icons', '/favicon.ico'];

  if (allowList.some(p => url.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // If on mobile user agent OR running installed (heuristic via UA + path), allow
  if (isMobileUA) return NextResponse.next();

  // Permit direct install intents from landing (query ?install=1) to show minimal app page
  if (url.searchParams.get('install') === '1') return NextResponse.next();

  // Otherwise, block and send to info page
  url.pathname = '/mobile-only';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api).*)'],
};
