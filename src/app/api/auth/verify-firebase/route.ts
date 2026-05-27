import { NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  const body = await req.json().catch(() => ({}));
  const { idToken } = body as any;
  if (!idToken) return NextResponse.json({ error: 'idToken required' }, { status: 400 });

  try {
    // Use Firebase Admin to verify the ID token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const res = NextResponse.json({ ok: true, decoded });
    res.headers.set('Access-Control-Allow-Origin', origin);
    return res;
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'invalid token' }, { status: 401 });
  }
}
