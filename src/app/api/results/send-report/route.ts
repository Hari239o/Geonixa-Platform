import { NextResponse } from 'next/server';
import { isFirebaseConfigured } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { emailService } from '@/lib/emailService';
import { ReportGeneratorService } from '@/lib/reportGenerator';
import { getFirestoreDb } from '@/lib/firestore';

const reportGenerator = new ReportGeneratorService();

interface SendReportRequest {
  studentId: string;
  examId: string;
  reportType: 'RESULT_QUALIFIED' | 'RESULT_REJECTED' | 'INTERVIEW_INVITATION' | 'FULL_REPORT';
}

export async function POST(req: Request) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const body: SendReportRequest = await req.json();
    const { studentId, examId, reportType } = body;

    if (!studentId || !examId || !reportType) {
      return NextResponse.json(
        { error: 'studentId, examId, and reportType are required' },
        { status: 400 }
      );
    }

    const adminDb = getFirestoreDb();
    const studentDocRef = adminDb.collection('students').doc(studentId);
    const studentDoc = await studentDocRef.get();

    if (!studentDoc.exists) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    const studentData = (studentDoc.data() || {}) as Record<string, any>;
    const studentName = studentData.name || 'Candidate';
    const registeredEmail = studentData.email || studentId;
    const domain = studentData.domain || 'Technical';

    const responsesCollection = adminDb.collection('studentResults');
    const querySnapshot = await responsesCollection
      .where('userId', '==', studentId)
      .where('examId', '==', examId)
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Exam response not found' },
        { status: 404 }
      );
    }

    const studentResponse = querySnapshot.docs[0].data() as any;
    const totalScore = studentResponse.score || 0;
    const maxTotalScore = studentResponse.totalMarks || 100;
    const percentage = (totalScore / maxTotalScore) * 100;

    let qualificationStatus: 'QUALIFIED' | 'NOT QUALIFIED' = 'NOT QUALIFIED';
    if (percentage >= 50) {
      qualificationStatus = 'QUALIFIED';
    }

    const reportId = reportGenerator.generateReportId(studentId);
    const reportDataForHash = `${reportId}-${studentName}-${totalScore}-${new Date().toISOString()}`;
    const verificationHash = await reportGenerator.generateVerificationHash(reportDataForHash);

    let emailSubject = '';
    let emailHtml = '';

    if (reportType === 'RESULT_QUALIFIED') {
      emailSubject = `🎉 Assessment Result: QUALIFIED - ${studentName}`;
      emailHtml = `<h1>Congratulations!</h1><p>You have qualified the assessment with a score of ${totalScore}/${maxTotalScore} (${percentage.toFixed(2)}%)</p>`;
    } else if (reportType === 'RESULT_REJECTED') {
      emailSubject = `Assessment Result: Not Qualified - ${studentName}`;
      emailHtml = `<h1>Assessment Result</h1><p>You scored ${totalScore}/${maxTotalScore} (${percentage.toFixed(2)}%). Unfortunately, this does not meet the qualification threshold.</p>`;
    } else {
      emailSubject = `Assessment Report: Complete Evaluation - ${studentName}`;
      emailHtml = `<h1>Assessment Report</h1><p>Your assessment result: ${totalScore}/${maxTotalScore} (${percentage.toFixed(2)}%)</p><p>Status: ${qualificationStatus}</p>`;
    }

    const emailResult = await emailService.sendEmail({
      to: registeredEmail,
      subject: emailSubject,
      html: emailHtml,
      candidateEmail: studentId,
      type: reportType as any,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    await adminDb.collection('students').doc(studentId).update({
      lastReportSentAt: FieldValue.serverTimestamp(),
      lastReportType: reportType,
      reportId,
      verificationHash,
    });

    return NextResponse.json({
      success: true,
      message: `${reportType} report sent to ${registeredEmail}`,
      reportId,
      messageId: emailResult.messageId,
    });
  } catch (error: any) {
    console.error('Error sending report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send assessment report' },
      { status: 500 }
    );
  }
}
