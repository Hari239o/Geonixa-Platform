import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';
import { getPayloadFromCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    let payload: any = await getPayloadFromCookie(req);
    // Dev fallback: allow local testing by injecting a test payload when missing
    if (process.env.NODE_ENV !== 'production' && !payload?.email) {
      payload = { email: 'test.user@example.com' };
    }
    if (!payload?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { resultId } = await req.json();

    if (!resultId) {
      return NextResponse.json(
        { success: false, error: 'Result ID is required' },
        { status: 400 }
      );
    }
    // Development fallback: if running locally and a test resultId is provided,
    // return a synthetic result without querying Firestore so we can exercise
    // PDF generation during local testing.
    let result: any = null;
    if (process.env.NODE_ENV !== 'production' && resultId === 'test-result-123') {
      result = {
        id: 'test-result-123',
        userId: payload.email,
        score: 42,
        totalMarks: 50,
        answers: Array.from({ length: 20 }, (_, i) => ({ index: i + 1, correct: i % 2 === 0 })),
        submittedAt: new Date().toISOString(),
      };
    } else {
      const db = getFirestoreDb();
      const querySnapshot = await db.collection('studentResults').where('userId', '==', payload.email).get();

      const resultDoc = querySnapshot.docs.find((doc) => doc.id === resultId);

      if (!resultDoc) {
        return NextResponse.json(
          { success: false, error: 'Result not found' },
          { status: 404 }
        );
      }

      result = resultDoc.data() as any;
    }

    // Generate HTML for PDF
    const htmlContent = generatePDFHTML({
      userId: result.userId,
      score: result.score,
      totalMarks: result.totalMarks,
      answers: result.answers,
      submittedAt: result.submittedAt,
      percentage: ((result.score / result.totalMarks) * 100).toFixed(2),
    });

    return NextResponse.json({
      success: true,
      html: htmlContent,
      data: {
        score: result.score,
        totalMarks: result.totalMarks,
        percentage: ((result.score / result.totalMarks) * 100).toFixed(2),
        totalQuestions: result.answers.length,
        correctAnswers: result.answers.filter((a: any) => a.correct).length,
        submittedAt: result.submittedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function generatePDFHTML(data: any): string {
  const { userId, score, totalMarks, percentage, answers, submittedAt } = data;
  const correctAnswers = answers.filter((a: any) => a.correct).length;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Exam Result Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          color: #333;
          line-height: 1.6;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        header {
          text-align: center;
          border-bottom: 2px solid #FF5A1F;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #FF5A1F;
          margin-bottom: 10px;
        }
        
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin: 10px 0;
        }
        
        .subtitle {
          font-size: 14px;
          color: #666;
        }
        
        .content {
          margin-bottom: 30px;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #FF5A1F;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .stat-box {
          background: #f9f9f9;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #FF5A1F;
          margin: 5px 0;
        }
        
        .stat-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <div class="logo">Exam Platform</div>
          <div class="title">Exam Result Report</div>
          <div class="subtitle">Your Performance Summary</div>
        </header>
        
        <div class="content">
          <div class="section">
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Score</div>
                <div class="stat-value">${score}/${totalMarks}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Percentage</div>
                <div class="stat-value">${percentage}%</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Correct</div>
                <div class="stat-value">${correctAnswers}/${answers.length}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Wrong</div>
                <div class="stat-value">${answers.length - correctAnswers}/${answers.length}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Submission Details</div>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Submitted At:</strong> ${new Date(submittedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

        