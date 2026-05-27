import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firestore';
import { getPayloadFromCookie } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const payload = await getPayloadFromCookie(req);
    if (!payload?.role || payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const db = getFirestoreDb();
    const resultsCollection = db.collection('studentResults');
    const snapshot = await resultsCollection.orderBy('submittedAt', 'desc').limit(1000).get();

    const allResults = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get unique users
    const uniqueUsers = new Set(allResults.map((r: any) => r.userId));
    const totalStudents = uniqueUsers.size;

    // Calculate statistics
    if (!allResults || allResults.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          totalStudents: 0,
          totalExams: 0,
          totalSubmissions: 0,
          averageScore: 0,
          averagePercentage: 0,
          highestScore: 0,
        },
        questionStats: {
          totalQuestions: 0,
          averageCorrect: 0,
          difficultQuestions: [],
        },
        recentSubmissions: [],
        scoreDistribution: [],
      });
    }

    const allScores = allResults.map((r: any) => r.score);
    const allPercentages = allResults.map((r: any) => (r.score / r.totalMarks) * 100);

    const stats = {
      totalStudents,
      totalExams: allResults.length,
      totalSubmissions: allResults.length,
      averageScore: (allScores.reduce((a: number, b: number) => a + b, 0) / allResults.length).toFixed(2),
      averagePercentage: (allPercentages.reduce((a: number, b: number) => a + b, 0) / allResults.length).toFixed(2),
      highestScore: Math.max(...allScores),
    };

    // Question statistics
    const questionStats: { [key: string]: { total: number; correct: number; difficulty: number } } = {};
    allResults.forEach((result: any) => {
      result.answers.forEach((answer: any) => {
        if (!questionStats[answer.questionId]) {
          questionStats[answer.questionId] = { total: 0, correct: 0, difficulty: 0 };
        }
        questionStats[answer.questionId].total++;
        if (answer.correct) questionStats[answer.questionId].correct++;
      });
    });

    const difficultQuestions = Object.entries(questionStats)
      .map(([qId, data]) => ({
        questionId: qId,
        successRate: ((data.correct / data.total) * 100).toFixed(2),
        totalAttempts: data.total,
      }))
      .sort((a, b) => parseFloat(a.successRate) - parseFloat(b.successRate))
      .slice(0, 5);

    const totalQuestionsCount = Object.keys(questionStats).length;

    // Recent submissions (last 10)
    const recentSubmissions = allResults.slice(0, 10).map((result: any) => ({
      id: result.id,
      userId: result.userId,
      score: result.score,
      totalMarks: result.totalMarks,
      percentage: ((result.score / result.totalMarks) * 100).toFixed(2),
      submittedAt: result.submittedAt,
      totalQuestions: result.answers.length,
      correctAnswers: result.answers.filter((a: any) => a.correct).length,
    }));

    // Score distribution (bins)
    const bins = [0, 20, 40, 60, 80, 100];
    const scoreDistribution = bins.map((bin, idx) => {
      const upper = bins[idx + 1] || 100;
      const count = allPercentages.filter((p) => p >= bin && p < upper).length;
      return {
        range: `${bin}-${upper}%`,
        count,
        label: `${bin}%`,
      };
    });

    return NextResponse.json({
      success: true,
      stats,
      questionStats: {
        totalQuestions: totalQuestionsCount,
        averageCorrect: (allResults.reduce((sum: number, r: any) => sum + r.answers.filter((a: any) => a.correct).length, 0) / allResults.length).toFixed(2),
        difficultQuestions,
      },
      recentSubmissions,
      scoreDistribution,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin dashboard data' },
      { status: 500 }
    );
  }
}
