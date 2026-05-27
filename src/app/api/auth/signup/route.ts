import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser, emailExists } from '@/lib/services/userService';
import { signJwt } from '@/lib/jwt';
import { createAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, password } = body as any;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'name, email, and password are required' }, { status: 400 });
    }

    // Check if email already exists
    const exists = await emailExists(email);
    if (exists) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      name,
      email,
      passwordHash,
      role: 'student',
    });

    const token = signJwt({ sub: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
    response.cookies.set(createAuthCookie(token));
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
