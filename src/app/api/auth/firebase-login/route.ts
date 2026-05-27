import { NextResponse } from 'next/server';
import { verifyCandidateFirebase, getCandidateProfile } from '@/lib/firebase';
import { signJwt } from '@/lib/jwt';
import { createAuthCookie } from '@/lib/auth';

const isDummyFirebase = (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy') === 'dummy';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, passKey } = body as any;
  if (!email || !passKey) {
    return NextResponse.json({ ok: false, error: 'email and passKey required' }, { status: 400 });
  }

  try {
    if (!isDummyFirebase) {
      const status = await verifyCandidateFirebase(email, passKey);
      if (status !== 'SUCCESS') {
        return NextResponse.json({ ok: false, error: status || 'Authentication failed' }, { status: 401 });
      }
    }

    const profile = await getCandidateProfile(email);
    const token = signJwt({ sub: email, email, role: 'student' });
    const response = NextResponse.json({ ok: true, profile });
    response.cookies.set(createAuthCookie(token));
    return response;
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || 'Unable to complete login' }, { status: 500 });
  }
}
