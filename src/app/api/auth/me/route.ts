import { NextResponse } from 'next/server';
import { getAuthPayload } from '@/lib/auth';
import { findUserById } from '@/lib/services/userService';

export async function GET(req: Request) {
  const payload = getAuthPayload(req);
  if (!payload) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await findUserById(payload.sub);

    if (user) {
      return NextResponse.json({
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.email,
        role: payload.role || 'student',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || 'Unable to fetch user' }, { status: 500 });
  }
}
