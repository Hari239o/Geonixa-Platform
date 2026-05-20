import { NextResponse } from 'next/server';
import CodingQuestion from '@/lib/models/CodingQuestion';
import dbConnect from '@/lib/db';

// GET: Fetch coding questions based on student domain
export async function GET(req: Request) {
  try {
    await dbConnect();

    // Parse query params
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Fetch 3 questions: 2 hard DSA + 1 domain-specific
    const dsaQuestions = await CodingQuestion.aggregate([
      { $match: { difficulty: 'hard', domain: 'general' } },
      { $sample: { size: 2 } },
    ]);

    const domainQuestion = await CodingQuestion.aggregate([
      { $match: { difficulty: 'hard', domain } },
      { $sample: { size: 1 } },
    ]);

    const questions = [...dsaQuestions, ...domainQuestion];

    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}