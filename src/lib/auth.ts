import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export const AUTH_TOKEN_NAME = 'exam_auth_token';
export const ADMIN_SESSION_COOKIE_NAME = 'admin_session';

export interface AuthPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

function parseCookieHeader(cookieHeader: string) {
  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, cookie) => {
    const [name, ...rest] = cookie.split('=');
    if (!name) return cookies;
    cookies[name.trim()] = decodeURIComponent(rest.join('=').trim());
    return cookies;
  }, {});
}

export function getAuthToken(req: Request | NextRequest): string | null {
  if ('cookies' in req) {
    return req.cookies.get(AUTH_TOKEN_NAME)?.value ?? null;
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[AUTH_TOKEN_NAME] || null;
}

export function getAuthPayload(req: Request | NextRequest): AuthPayload | null {
  const token = getAuthToken(req);
  if (!token) return null;
  return verifyJwt<AuthPayload>(token);
}

export function createAuthCookie(token: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  return {
    name: AUTH_TOKEN_NAME,
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAgeSeconds,
  };
}

export function clearAuthCookie() {
  return {
    name: AUTH_TOKEN_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  };
}

export function getAdminSessionPayload(req: Request | NextRequest) {
  let token: string | null = null;
  if ('cookies' in req) {
    token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null;
  } else {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = parseCookieHeader(cookieHeader);
    token = cookies[ADMIN_SESSION_COOKIE_NAME] || null;
  }

  if (!token) return null;
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8')) as any;
    if (!decoded?.isAdmin || !decoded?.email || !decoded?.expiresAt) return null;
    if (Date.now() > decoded.expiresAt) return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Compatibility helper used by some API routes to read JWT payload from cookies.
 */
export function getPayloadFromCookie(req: Request | NextRequest) {
  return getAuthPayload(req);
}
