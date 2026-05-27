import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';

// POST: Validate code against test cases using the /api/execute endpoint
export async function POST(req: Request) {
  try {
    const db = getFirestoreDb();
    const body = await req.json();

    const { questionId, code, language } = body;

    if (!questionId || !code || !language) {
      return NextResponse.json({ error: 'Question ID, code, and language are required' }, { status: 400 });
    }

    // Fetch question details from Firestore
    const querySnapshot = await db.collection('codingQuestions').where('questionId', '==', questionId).get();

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const question = querySnapshot.docs[0].data() as any;
    const testCases = [...(question.sampleTestCases || []), ...(question.hiddenTestCases || [])];

    if (!testCases || testCases.length === 0) {
      return NextResponse.json({ error: 'No test cases found for this question' }, { status: 400 });
    }

    // Validate code against test cases using /api/execute
    const results = await Promise.all(
      testCases.map(async (testCase) => {
        try {
          const executeRes = await fetch(new URL('/api/execute', req.url), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              language,
              input: testCase.input,
              timeLimit: testCase.timeLimit || 5000,
              memoryLimit: testCase.memoryLimit || 256
            })
          });

          if (!executeRes.ok) {
            const errorData = await executeRes.json().catch(() => ({}));
            return { 
              input: testCase.input, 
              output: errorData.error || 'Execution failed', 
              passed: false,
              expected: testCase.output
            };
          }

          const execResult = await executeRes.json();
          const passed = (execResult.stdout || '').trim() === (testCase.output || '').trim();
          
          return { 
            input: testCase.input, 
            output: execResult.stdout || '', 
            passed,
            expected: testCase.output
          };
        } catch (err: any) {
          return { 
            input: testCase.input, 
            output: err.message || 'Execution error', 
            passed: false,
            expected: testCase.output
          };
        }
      })
    );

    const passedCount = results.filter((result) => result.passed).length;
    const totalCount = results.length;

    // Save submission with proper timestamp
    try {
      await db.collection('codeSubmissions').add({
        questionId,
        code,
        language,
        passedTests: passedCount,
        totalTests: totalCount,
        results,
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      });
    } catch (saveErr: any) {
      console.error('Failed to save submission:', saveErr);
      // Continue - don't fail the response if save fails
    }

    return NextResponse.json({
      results,
      score: `${passedCount}/${totalCount}`,
      success: passedCount === totalCount,
      passedCount,
      totalCount
    });
  } catch (error: any) {
    console.error('Code submission error:', error);
    return NextResponse.json({ 
      error: 'Failed to validate code',
      details: error.message 
    }, { status: 500 });
  }
}
