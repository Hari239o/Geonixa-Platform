import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/lib/services/userService';
import { signJwt } from '@/lib/jwt';
import { createAuthCookie } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}

export async function POST(req: Request) {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown');
  const rl = rateLimit(`login:${ip}`);
  if (!rl.ok) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const { email, password } = body as any;
  if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 });

  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = signJwt({ sub: user.id, email: user.email, role: user.role });
  const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  response.cookies.set(createAuthCookie(token));
  response.headers.set('Access-Control-Allow-Origin', origin);
  return response;
}
