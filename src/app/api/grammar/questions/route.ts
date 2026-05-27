import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';

// GET: Fetch randomized grammar questions for a student
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const db = getFirestoreDb();
    const questionsSnapshot = await db.collection('grammarQuestions').where('difficulty', '==', 'very-hard').get();
    const questions = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 30);

    const randomizedQuestions = shuffled.map((question: any) => ({
      ...question,
      options: Array.isArray(question.options) ? [...question.options].sort(() => Math.random() - 0.5) : question.options,
    }));

    return NextResponse.json(randomizedQuestions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch questions' }, { status: 500 });
  }
}