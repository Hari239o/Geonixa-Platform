import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';

const validDifficulties = ['easy', 'medium', 'hard', 'very-hard'];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, options, correctAnswer, difficulty, category, marks } = body as any;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: 'Options must be an array with at least two values' }, { status: 400 });
    }

    if (!correctAnswer || typeof correctAnswer !== 'string' || !options.includes(correctAnswer)) {
      return NextResponse.json({ error: 'Correct answer must be one of the provided options' }, { status: 400 });
    }

    if (!difficulty || !validDifficulties.includes(difficulty)) {
      return NextResponse.json({ error: `Difficulty must be one of: ${validDifficulties.join(', ')}` }, { status: 400 });
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    if (typeof marks !== 'number' || marks < 0) {
      return NextResponse.json({ error: 'Marks must be a non-negative number' }, { status: 400 });
    }

    const questionId = body.questionId || `q_${Date.now()}`;
    const db = getFirestoreDb();
    const docRef = await db.collection('questions').add({
      questionId,
      question,
      options,
      correctAnswer,
      difficulty,
      category,
      marks,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id, questionId, question, options, correctAnswer, difficulty, category, marks }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to add question' }, { status: 500 });
  }
}
