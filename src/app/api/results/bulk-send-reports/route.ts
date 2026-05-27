import { NextResponse } from 'next/server';
import { isFirebaseConfigured } from '@/lib/firebase';
import { emailService } from '@/lib/emailService';
import { getFirestoreDb } from '@/lib/firestore';

interface BulkReportRequest {
  examId: string;
  filterCriteria?: {
    status?: 'QUALIFIED' | 'NOT QUALIFIED' | 'DISQUALIFIED';
    domain?: string;
  };
  adminKey: string;
}

/**
 * POST: Bulk send assessment reports to students after exam evaluation
 * This endpoint is intended for administrators to trigger report distribution
 * Usage: POST /api/results/bulk-send-reports
 * Body: { examId: "exam123", filterCriteria: { status: "QUALIFIED" }, adminKey: "secret" }
 */
export async function POST(req: Request) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    // Verify admin authorization
    const adminKey = process.env.ADMIN_REPORT_KEY;
    const body: BulkReportRequest = await req.json();

    if (!adminKey || body.adminKey !== adminKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin key' },
        { status: 401 }
      );
    }

    if (!body.examId) {
      return NextResponse.json(
        { error: 'examId is required' },
        { status: 400 }
      );
    }

    const adminDb = getFirestoreDb();
    const querySnapshot = await adminDb.collection('studentResults').where('examId', '==', body.examId).get();
    const studentResponses = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (!studentResponses.length) {
      return NextResponse.json(
        { error: 'No exam responses found for this exam' },
        { status: 404 }
      );
    }

    let successCount = 0;
    let failureCount = 0;
    const results: { email: string; status: string; error?: string }[] = [];

    // Send reports to each student
    for (const response of studentResponses) {
      try {
        const studentId = (response as any).userId;

        // Fetch student profile
        const studentDoc = await adminDb.collection('students').doc(studentId).get();

        if (!studentDoc.exists) {
          failureCount++;
          results.push({
            email: studentId,
            status: 'FAILED',
            error: 'Student profile not found',
          });
          continue;
        }

        // Determine qualification status
        const totalScore = (response as any).score || 0;
        const totalMarks = (response as any).totalMarks || 100;
        const percentage = (totalScore / totalMarks) * 100;

        let qualificationStatus: 'QUALIFIED' | 'NOT QUALIFIED' = 'NOT QUALIFIED';
        if (percentage >= 50) {
          qualificationStatus = 'QUALIFIED';
        }

        // Apply filter if specified
        if (body.filterCriteria?.status && qualificationStatus !== body.filterCriteria.status) {
          continue;
        }

        // Determine report type
        let reportType: 'RESULT_QUALIFIED' | 'RESULT_REJECTED' = 'RESULT_REJECTED';

        if (qualificationStatus === 'QUALIFIED') {
          reportType = 'RESULT_QUALIFIED';
        }

        // Send report via API call
        const reportResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/results/send-report`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId,
              examId: body.examId,
              reportType,
            }),
          }
        );

        if (reportResponse.ok) {
          successCount++;
          results.push({
            email: studentId,
            status: 'SENT',
          });

          // Update student's report sent status
          await adminDb.collection('students').doc(studentId).update({
            reportSentAt: new Date(),
            reportSentStatus: 'SENT',
            qualificationStatus,
          });
        } else {
          failureCount++;
          const errorData = await reportResponse.json();
          results.push({
            email: studentId,
            status: 'FAILED',
            error: errorData.error,
          });
        }
      } catch (error: any) {
        failureCount++;
        results.push({
          email: (response as any).userId,
          status: 'FAILED',
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalStudents: studentResponses.length,
        successCount,
        failureCount,
      },
      results: results.slice(0, 100), // Return first 100 for brevity
      message: `Reports sent to ${successCount}/${studentResponses.length} students`,
    });
  } catch (error: any) {
    console.error('Bulk report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send bulk reports' },
      { status: 500 }
    );
  }
}

/**
 * GET: Check status of report distribution for an exam
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');
    const adminKey = searchParams.get('adminKey');

    // Verify admin authorization
    if (!adminKey || adminKey !== process.env.ADMIN_REPORT_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!examId) {
      return NextResponse.json(
        { error: 'examId is required' },
        { status: 400 }
      );
    }

    if (!isFirebaseConfigured) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    // Count reports sent
    const adminDb = getFirestoreDb();
    const reportsSentSnapshot = await adminDb.collection('students').where('reportSentAt', '!=', null).get();
    const reportsSent = reportsSentSnapshot.size;

    // Count total students for exam
    const examSnapshot = await adminDb.collection('studentResults').where('examId', '==', examId).get();

    const totalStudents = examSnapshot.size;

    return NextResponse.json({
      examId,
      totalStudents,
      reportsSent,
      pendingReports: totalStudents - reportsSent,
      distributionPercentage: totalStudents > 0 ? ((reportsSent / totalStudents) * 100).toFixed(1) : '0',
    });
  } catch (error: any) {
    console.error('Error checking report status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check report status' },
      { status: 500 }
    );
  }
}
