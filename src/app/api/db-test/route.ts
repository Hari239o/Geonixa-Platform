import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';

export async function GET() {
  try {
    const db = getFirestoreDb();
    const collections = await db.listCollections();
    return NextResponse.json({ ok: true, connected: true, collections: collections.map((col) => col.id) });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
