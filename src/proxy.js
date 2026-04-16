import { NextResponse } from 'next/server';

// This is the core function Next.js looks for
export function proxy(request) {
  const path = request.nextUrl.pathname;

  // ==========================================
  // FUTURE SECURITY LOGIC (Commented out for now)
  // ==========================================
  // When you build the login system, you will check for a cookie/token here.
  // Example: If they try to go to /account without a token, redirect to /home.
  /*
  const hasToken = request.cookies.has('auth_token');
  if (!hasToken && (path.startsWith('/account') || path.startsWith('/checkout'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  */

  // For now, let all requests pass through safely so you can keep building!
  return NextResponse.next();
}

// The Matcher tells Next.js which routes to run this security check on.
// This specific regex tells it to run on EVERYTHING except behind-the-scenes stuff (like images and CSS) so your site stays fast.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
};