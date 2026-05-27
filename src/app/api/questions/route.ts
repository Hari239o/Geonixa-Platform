import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';

export async function GET() {
  try {
    const db = getFirestoreDb();
    const snapshot = await db.collection('questions').orderBy('category', 'asc').orderBy('difficulty', 'asc').get();
    const questions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch questions' }, { status: 500 });
  }
}
