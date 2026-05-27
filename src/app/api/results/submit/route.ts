import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';
import { cleanupOldStudentAnswers } from '@/lib/services/studentAnswersService';

export async function POST(req: Request) {
  try {
    const db = getFirestoreDb();
    const body = await req.json();
    const { userId, score, totalMarks, answers, submittedAt } = body as any;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json({ error: 'score must be a non-negative number' }, { status: 400 });
    }

    if (typeof totalMarks !== 'number' || totalMarks < 0) {
      return NextResponse.json({ error: 'totalMarks must be a non-negative number' }, { status: 400 });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'answers must be a non-empty array' }, { status: 400 });
    }

    const validatedAnswers = answers.map((answer: any, index: number) => {
      if (!answer || typeof answer.questionId !== 'string') {
        throw new Error(`answers[${index}].questionId is required`);
      }
      if (typeof answer.selectedAnswer !== 'string') {
        throw new Error(`answers[${index}].selectedAnswer is required`);
      }
      if (typeof answer.correct !== 'boolean') {
        throw new Error(`answers[${index}].correct must be a boolean`);
      }
      if (typeof answer.marks !== 'number' || answer.marks < 0) {
        throw new Error(`answers[${index}].marks must be a non-negative number`);
      }

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        correct: answer.correct,
        marks: answer.marks,
      };
    });

const docRef = await db.collection('studentResults').add({
        userId,
        score,
        totalMarks,
        answers: validatedAnswers,
        submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
        createdAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    });

    // Trigger cleanup of old answers
    await cleanupOldStudentAnswers();

    return NextResponse.json({ id: docRef.id, userId, score, totalMarks }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit result' }, { status: 500 });
  }
}
