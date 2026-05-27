import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';
import { getPayloadFromCookie } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const payload = await getPayloadFromCookie(req);
    if (!payload?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = payload.email;
    const db = getFirestoreDb();

    // Fetch all results for the user
    const resultsCollection = db.collection('studentResults');
    const snapshot = await resultsCollection.where('userId', '==', userId).orderBy('submittedAt', 'desc').get();

    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (!results || results.length === 0) {
      return NextResponse.json({
        success: true,
        exams: [],
        stats: {
          totalExams: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          totalMarks: 0,
          averagePercentage: 0,
        },
        recentActivity: [],
      });
    }

    // Calculate statistics
    const scores = results.map((r: any) => r.score);
    const percentages = results.map((r: any) => (r.score / r.totalMarks) * 100);
    const totalMarks = results.reduce((sum: number, r: any) => sum + r.totalMarks, 0);

    const stats = {
      totalExams: results.length,
      averageScore: (scores.reduce((a: number, b: number) => a + b, 0) / results.length).toFixed(2),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      totalMarks,
      averagePercentage: (percentages.reduce((a: number, b: number) => a + b, 0) / results.length).toFixed(2),
    };

    // Format exams data
    const exams = results.map((result: any, index: number) => ({
      id: result.id,
      name: `Exam ${results.length - index}`,
      score: result.score,
      totalMarks: result.totalMarks,
      percentage: ((result.score / result.totalMarks) * 100).toFixed(2),
      submittedAt: result.submittedAt,
      correctAnswers: result.answers.filter((a: any) => a.correct).length,
      totalQuestions: result.answers.length,
    }));

    // Recent activity (last 5)
    const recentActivity = exams.slice(0, 5).map((exam: any) => ({
      type: 'exam_completed',
      title: `Completed ${exam.name}`,
      description: `Scored ${exam.score}/${exam.totalMarks} (${exam.percentage}%)`,
      timestamp: exam.submittedAt,
      icon: 'CheckCircle',
    }));

    return NextResponse.json({
      success: true,
      exams,
      stats,
      recentActivity,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
