import { NextResponse } from 'next/server';
import StudentTypingResponse from '@/lib/models/StudentTypingResponse';
import dbConnect from '@/lib/db';

// POST: Save student responses and calculate typing metrics
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { studentId, responses } = body;

    if (!studentId || !responses) {
      return NextResponse.json({ error: 'Student ID and responses are required' }, { status: 400 });
    }

    // Save responses and calculate metrics
    const savedResponses = await Promise.all(
      responses.map(async (response: any) => {
        const { topicId, typedText, backspaceCount } = response;

        // Calculate typing speed (words per minute)
        const words = typedText.trim().split(/\s+/).length;
        const typingSpeed = (words / 5) / (5 / 60); // 5 minutes

        // Calculate accuracy
        const originalText = response.originalText;
        const mistakes = [...typedText].reduce((count, char, index) => {
          return char !== originalText[index] ? count + 1 : count;
        }, 0);
        const accuracy = ((originalText.length - mistakes) / originalText.length) * 100;

        return StudentTypingResponse.create({
          studentId,
          topicId,
          typedText,
          typingSpeed,
          accuracy,
          mistakes,
          backspaceCount,
        });
      })
    );

    return NextResponse.json({ message: 'Responses saved successfully', savedResponses });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit responses' }, { status: 500 });
  }
}