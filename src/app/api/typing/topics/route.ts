import { NextResponse } from 'next/server';
import TypingTopic from '@/lib/models/TypingTopic';
import dbConnect from '@/lib/db';

// GET: Fetch two randomized typing topics for a student
export async function GET(req: Request) {
  try {
    await dbConnect();

    // Parse query params
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Fetch 2 randomized topics
    const topics = await TypingTopic.aggregate([{ $sample: { size: 2 } }]);

    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}