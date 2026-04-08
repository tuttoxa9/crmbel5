import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');

  // If user is on /login and is logged in, redirect to /leads
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (session) {
      return NextResponse.redirect(new URL('/leads', request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!session) {
    // If trying to access the root '/', redirect to /leads (which will then redirect to /login)
    // or just directly redirect to /login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Root redirect
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/leads', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
