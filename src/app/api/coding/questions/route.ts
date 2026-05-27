import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';

// GET: Fetch coding questions based on student domain
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const db = getFirestoreDb();
    const dsaSnapshot = await db.collection('codingQuestions').where('difficulty', '==', 'hard').where('domain', '==', 'general').get();
    const domainSnapshot = await db.collection('codingQuestions').where('difficulty', '==', 'hard').where('domain', '==', domain).get();

    const dsaQuestions = dsaSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const domainQuestions = domainSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const selectedDsa = dsaQuestions.sort(() => Math.random() - 0.5).slice(0, 2);
    const selectedDomain = domainQuestions.sort(() => Math.random() - 0.5).slice(0, 1);

    const questions = [...selectedDsa, ...selectedDomain];

    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch questions' }, { status: 500 });
  }
}