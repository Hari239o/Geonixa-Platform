import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';

// POST: Save student responses and calculate scores
export async function POST(req: Request) {
  try {
    const db = getFirestoreDb();
    const body = await req.json();

    const { studentId, responses } = body;

    if (!studentId || !responses) {
      return NextResponse.json({ error: 'Student ID and responses are required' }, { status: 400 });
    }

    // Save responses
    const savedResponses = await Promise.all(
      responses.map(async (response: any) => {
        const isCorrect = response.selectedOption === response.correctAnswer;
        const docRef = await db.collection('studentAptitudeResponses').add({
          studentId,
          questionId: response.questionId,
          selectedOption: response.selectedOption,
          isCorrect,
          createdAt: new Date(),
        });
        return { id: docRef.id, isCorrect };
      })
    );

    // Calculate score
    const correctAnswers = savedResponses.filter((res) => res.isCorrect).length;
    const wrongAnswers = savedResponses.length - correctAnswers;
    const negativeMarks = Math.floor(wrongAnswers / 3);
    const finalScore = correctAnswers - negativeMarks;

    return NextResponse.json({ score: finalScore });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit responses' }, { status: 500 });
  }
}