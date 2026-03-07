import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip the admin-login page itself
  if (pathname === '/admin-login') {
    return NextResponse.next();
  }

  // Protect all /admin/* routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login'],
};
