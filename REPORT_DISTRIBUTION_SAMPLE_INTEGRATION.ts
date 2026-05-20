/**
 * SAMPLE INTEGRATION: Report Distribution in Exam Submission Flow
 * 
 * This file demonstrates how to integrate the ReportDistributionService
 * into your existing exam submission endpoints.
 * 
 * Copy patterns from this file to update:
 * - src/app/api/aptitude/submit/route.ts
 * - src/app/api/grammar/submit/route.ts
 * - src/app/api/coding/submit/route.ts
 * - src/app/api/typing/submit/route.ts
 */

import { NextResponse } from 'next/server';
import StudentResponse from '@/lib/models/StudentResponse';
import dbConnect from '@/lib/db';
import ReportDistributionService from '@/lib/ReportDistributionService';
import { getServerSession } from 'next-auth/next';

/**
 * SAMPLE 1: Auto-send report after exam submission
 * When student submits their exam, immediately send them a notification
 */
export async function sampleSubmitWithAutoReport(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession();
    const body = await req.json();

    const { examId, roundNumber, responses, scores } = body;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = session.user.email;

    // Save responses to MongoDB
    const studentResponse = new StudentResponse({
      studentId,
      examId,
      roundNumber,
      responses,
      scores,
      submittedAt: new Date(),
    });

    await studentResponse.save();

    // ✅ NEW: Send report to student after submission
    const reportSent = await ReportDistributionService.sendExamResultNotification(
      studentId,
      examId
    );

    if (!reportSent) {
      console.warn(`Failed to send report to ${studentId}, but submission was saved`);
    }

    return NextResponse.json({
      success: true,
      message: 'Exam submitted successfully. Report sent to your email.',
      reportSent,
    });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Submission failed' },
      { status: 500 }
    );
  }
}

/**
 * SAMPLE 2: Conditional report based on real-time scoring
 * Send different reports based on immediate scoring results
 */
export async function sampleSubmitWithConditionalReport(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession();
    const body = await req.json();

    const { examId, roundNumber, responses, scores } = body;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = session.user.email;

    // Calculate score
    const totalScore = Object.values(scores).reduce((a: number, b: any) => a + (b || 0), 0);
    const percentage = (totalScore / 100) * 100;

    // Save responses
    const studentResponse = new StudentResponse({
      studentId,
      examId,
      roundNumber,
      responses,
      scores,
      submittedAt: new Date(),
      roundScore: totalScore,
    });

    await studentResponse.save();

    // ✅ NEW: Determine qualification and send appropriate report
    let reportSent = false;

    if (percentage >= 60) {
      // Send qualified notification (green theme)
      reportSent = await ReportDistributionService.sendQualificationResult(
        studentId,
        examId,
        'QUALIFIED'
      );
    } else if (percentage >= 40) {
      // Send full report for borderline cases
      reportSent = await ReportDistributionService.sendFullAssessmentReport(
        studentId,
        examId
      );
    } else {
      // Send rejection notification with feedback
      reportSent = await ReportDistributionService.sendQualificationResult(
        studentId,
        examId,
        'NOT QUALIFIED'
      );
    }

    return NextResponse.json({
      success: true,
      score: totalScore,
      percentage: percentage.toFixed(1),
      reportSent,
    });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Submission failed' },
      { status: 500 }
    );
  }
}

/**
 * SAMPLE 3: Error-safe report sending (doesn't break on email failure)
 * Sends report asynchronously without blocking response
 */
export async function sampleSubmitWithAsyncReport(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession();
    const body = await req.json();

    const { examId, roundNumber, responses, scores } = body;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = session.user.email;

    // Save responses (blocking - critical path)
    const studentResponse = new StudentResponse({
      studentId,
      examId,
      roundNumber,
      responses,
      scores,
      submittedAt: new Date(),
    });

    await studentResponse.save();

    // ✅ NEW: Send report asynchronously (non-blocking)
    // Fire and forget - don't wait for email to complete
    ReportDistributionService.sendExamResultNotification(studentId, examId)
      .then(() => console.log(`Report sent to ${studentId}`))
      .catch((err) => console.error(`Report delivery failed for ${studentId}:`, err));

    // Return immediately without waiting for email
    return NextResponse.json({
      success: true,
      message: 'Exam submitted successfully. You will receive a report email shortly.',
    });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Submission failed' },
      { status: 500 }
    );
  }
}

/**
 * SAMPLE 4: Report distribution with retry logic
 * Retries report sending if initial attempt fails
 */
export async function sampleSubmitWithRetry(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession();
    const body = await req.json();

    const { examId, roundNumber, responses, scores } = body;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = session.user.email;

    // Save responses
    const studentResponse = new StudentResponse({
      studentId,
      examId,
      roundNumber,
      responses,
      scores,
      submittedAt: new Date(),
    });

    await studentResponse.save();

    // ✅ NEW: Send report with retry logic
    let reportSent = false;
    let retries = 0;
    const maxRetries = 3;

    while (!reportSent && retries < maxRetries) {
      try {
        reportSent = await ReportDistributionService.sendExamResultNotification(
          studentId,
          examId
        );

        if (reportSent) {
          console.log(`Report sent to ${studentId} on attempt ${retries + 1}`);
          break;
        }
      } catch (error) {
        retries++;
        if (retries < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, retries) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return NextResponse.json({
      success: true,
      reportSent,
      reportRetries: retries,
    });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Submission failed' },
      { status: 500 }
    );
  }
}

/**
 * SAMPLE 5: Integration with existing exam completion logic
 * Shows how to integrate with your current submission endpoint
 */
export async function sampleExistingEndpointIntegration(req: Request) {
  try {
    // ... existing submission logic ...

    await dbConnect();
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = session.user.email;
    const body = await req.json();
    const { examId, roundNumber, responses, scores } = body;

    // EXISTING: Validate responses
    if (!examId || !roundNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // EXISTING: Save to database
    const studentResponse = await StudentResponse.updateOne(
      { studentId, examId, roundNumber },
      {
        responses,
        scores,
        submittedAt: new Date(),
      },
      { upsert: true }
    );

    // ✅ NEW: Add report distribution
    try {
      await ReportDistributionService.sendExamResultNotification(studentId, examId);
    } catch (reportError) {
      // Log but don't fail the submission
      console.error('Report distribution failed:', reportError);
    }

    // EXISTING: Return success response
    return NextResponse.json({
      success: true,
      data: studentResponse,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * SAMPLE 6: Admin endpoint for manual report distribution
 * Add this to your admin panel to manually trigger report sending
 */
export async function sampleAdminDistributionEndpoint(req: Request) {
  try {
    const adminKey = req.headers.get('X-Admin-Key');

    // ✅ Verify admin authorization
    if (adminKey !== process.env.ADMIN_REPORT_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { examId, filterCriteria, reportType } = body;

    if (!examId) {
      return NextResponse.json({ error: 'examId required' }, { status: 400 });
    }

    // ✅ Trigger bulk distribution
    const result = await ReportDistributionService.bulkSendReports({
      examId,
      adminKey: process.env.ADMIN_REPORT_KEY!,
      filterCriteria,
    });

    return NextResponse.json({
      success: true,
      distributionResult: result,
    });
  } catch (error: any) {
    console.error('Admin distribution error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * USAGE GUIDE:
 * 
 * 1. COPY ONE OF THE PATTERNS ABOVE
 * 2. Paste into your submission endpoint (e.g., src/app/api/aptitude/submit/route.ts)
 * 3. Replace placeholder variables with actual field names from your code
 * 4. Add the import at the top:
 *    import ReportDistributionService from '@/lib/ReportDistributionService';
 * 5. Test with: curl -X POST http://localhost:3000/api/your-endpoint -d '...'
 * 
 * TESTING:
 * - Use Ethereal (test email service) in development
 * - Check console for "Report sent to..." messages
 * - Verify emails in Ethereal dashboard
 * - Switch to Gmail SMTP in production
 * 
 * MONITORING:
 * - Check Firebase > Firestore > email_logs collection
 * - Filter by type, status, or date
 * - View preview URLs for test emails
 */
