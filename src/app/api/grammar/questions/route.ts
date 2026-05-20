import { NextResponse } from 'next/server';
import GrammarQuestion from '@/lib/models/GrammarQuestion';
import dbConnect from '@/lib/db';

// GET: Fetch randomized grammar questions for a student
export async function GET(req: Request) {
  try {
    await dbConnect();

    // Parse query params
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Fetch 30 randomized questions
    const questions = await GrammarQuestion.aggregate([
      { $match: { difficulty: 'very-hard' } },
      { $sample: { size: 30 } },
    ]);

    // Shuffle options for each question
    const randomizedQuestions = questions.map((question) => {
      const shuffledOptions = question.options.sort(() => Math.random() - 0.5);
      return { ...question, options: shuffledOptions };
    });

    return NextResponse.json(randomizedQuestions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}