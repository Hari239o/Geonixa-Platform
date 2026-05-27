import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';

// GET: Fetch two randomized typing topics for a student
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const db = getFirestoreDb();
    const topicsCollection = db.collection('typingTopics');
    const snapshot = await topicsCollection.limit(100).get();
    const allTopics = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const shuffled = allTopics.sort(() => Math.random() - 0.5).slice(0, 2);

    return NextResponse.json(shuffled);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}