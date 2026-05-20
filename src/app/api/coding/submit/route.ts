import { NextResponse } from 'next/server';
import CodingQuestion from '@/lib/models/CodingQuestion';
import dbConnect from '@/lib/db';
import { exec } from 'child_process';

// POST: Validate code against test cases
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { questionId, code, language } = body;

    if (!questionId || !code || !language) {
      return NextResponse.json({ error: 'Question ID, code, and language are required' }, { status: 400 });
    }

    // Fetch question details
    const question = await CodingQuestion.findOne({ questionId });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const testCases = [...question.sampleTestCases, ...question.hiddenTestCases];

    // Validate code against test cases
    const results = await Promise.all(
      testCases.map(async (testCase) => {
        return new Promise<{ input: string; output: string; passed: boolean }>((resolve) => {
          const command = `docker run --rm -v $(pwd):/app -w /app ${language} ${code}`;
          exec(command, (error, stdout, stderr) => {
            if (error) {
              resolve({ input: testCase.input, output: stderr, passed: false });
            } else {
              const passed = stdout.trim() === testCase.output.trim();
              resolve({ input: testCase.input, output: stdout, passed });
            }
          });
        });
      })
    );

    const passedCount = results.filter((result) => result.passed).length;
    const totalCount = results.length;

    return NextResponse.json({
      results,
      score: `${passedCount}/${totalCount}`,
      success: passedCount === totalCount,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to validate code' }, { status: 500 });
  }
}