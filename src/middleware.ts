import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAIL = 'talent@geonixa.com';
const ADMIN_PASSWORD = 'talent@9908';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Check for admin session token
    const adminToken = request.cookies.get('admin_session');
    
    if (!adminToken || !adminToken.value) {
      // Redirect to admin login
      return NextResponse.redirect(new URL('/auth/admin-login', request.url));
    }

    // Verify token validity (basic check - in production use JWT or session store)
    try {
      const decodedToken = JSON.parse(
        Buffer.from(adminToken.value, 'base64').toString('utf-8')
      );
      
      if (
        decodedToken.email !== ADMIN_EMAIL ||
        Date.now() > decodedToken.expiresAt
      ) {
        // Invalid or expired token
        return NextResponse.redirect(new URL('/auth/admin-login', request.url));
      }
    } catch (e) {
      // Invalid token format
      return NextResponse.redirect(new URL('/auth/admin-login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
