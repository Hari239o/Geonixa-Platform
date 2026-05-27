import { NextResponse, type NextRequest } from 'next/server';
import { getAuthPayload, getAdminSessionPayload } from '@/lib/auth';

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/admin-login',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/me',
  '/api/auth/logout',
  '/api/auth/verify-firebase',
  '/api/auth/admin-session',
];

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const authPayload = getAuthPayload(req);
  const adminSessionPayload = getAdminSessionPayload(req);
  const isAdmin = authPayload?.role === 'admin' || Boolean(adminSessionPayload);
  const isAuthenticated = Boolean(authPayload);
  const isApiRequest = pathname.startsWith('/api/');

  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      return isApiRequest ? unauthorizedResponse() : NextResponse.redirect(new URL('/auth/login', req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/student') || pathname.startsWith('/exam') || pathname.startsWith('/api/questions') || pathname.startsWith('/api/results')) {
    if (!isAuthenticated) {
      return isApiRequest ? unauthorizedResponse() : NextResponse.redirect(new URL('/auth/login', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/exam/:path*',
    '/api/questions/:path*',
    '/api/results/:path*',
  ],
};
