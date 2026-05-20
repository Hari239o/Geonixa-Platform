import { NextResponse } from 'next/server';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { emailService } from '@/lib/emailService';
import { ReportGeneratorService } from '@/lib/reportGenerator';
import StudentResponse from '@/lib/models/StudentResponse';
import Student from '@/lib/models/Student';
import dbConnect from '@/lib/db';

const reportGenerator = new ReportGeneratorService();

interface SendReportRequest {
  studentId: string; // student email
  examId: string;
  reportType: 'RESULT_QUALIFIED' | 'RESULT_REJECTED' | 'INTERVIEW_INVITATION' | 'FULL_REPORT';
}

// POST: Send assessment report/result to student's registered email
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

    // Fetch student from MongoDB for MongoDB-based data
    await dbConnect();
    const mongoStudent = await Student.findOne({ email: studentId });

    // Fetch student profile from Firestore
    const studentDocRef = doc(db, 'students', studentId);
    const studentDoc = await getDoc(studentDocRef);

    if (!studentDoc.exists() && !mongoStudent) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    const studentData = studentDoc.data() || {};
    const studentName = studentData.name || mongoStudent?.name || 'Candidate';
    const registeredEmail = studentData.email || studentId;
    const college = studentData.college || mongoStudent?.college || 'N/A';
    const domain = studentData.domain || mongoStudent?.domain || 'Technical';

    // Fetch exam responses from MongoDB
    const studentResponse = await StudentResponse.findOne({
      studentId,
      examId
    });

    if (!studentResponse) {
      return NextResponse.json(
        { error: 'Exam response not found' },
        { status: 404 }
      );
    }

    // Calculate scores and qualifications
    const roundScores = {
      round1: studentResponse.round1Score || 0,
      round2: studentResponse.round2Score || 0,
      round3: studentResponse.round3Score || 0,
      round4: studentResponse.round4Score || 0,
    };

    const totalScore = Object.values(roundScores).reduce((a, b) => a + b, 0);
    const maxTotalScore = 400; // 100 per round
    const percentage = (totalScore / maxTotalScore) * 100;

    // Determine qualification status
    const qualificationThreshold = 200; // 50% to qualify
    let qualificationStatus: 'QUALIFIED' | 'NOT QUALIFIED' | 'DISQUALIFIED' = 'NOT QUALIFIED';

    if (studentResponse.proctoringViolationsCount >= 5) {
      qualificationStatus = 'DISQUALIFIED';
    } else if (totalScore >= qualificationThreshold && studentResponse.plagiarismScore < 30) {
      qualificationStatus = 'QUALIFIED';
    }

    // Generate report ID and hash
    const reportId = reportGenerator.generateReportId(studentId);
    const reportDataForHash = `${reportId}-${studentName}-${totalScore}-${new Date().toISOString()}`;
    const verificationHash = await reportGenerator.generateVerificationHash(reportDataForHash);
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${reportId}`;

    // Prepare email based on report type
    let emailSubject = '';
    let emailHtml = '';

    if (reportType === 'RESULT_QUALIFIED') {
      emailSubject = `🎉 Assessment Result: QUALIFIED - ${studentName}`;
      emailHtml = getQualifiedResultTemplate({
        name: studentName,
        totalScore,
        percentage,
        domain,
        reportId,
        verificationUrl,
      });
    } else if (reportType === 'RESULT_REJECTED') {
      emailSubject = `Assessment Result: Not Qualified - ${studentName}`;
      emailHtml = getRejectedResultTemplate({
        name: studentName,
        totalScore,
        percentage,
        domain,
        roundScores,
      });
    } else if (reportType === 'INTERVIEW_INVITATION') {
      emailSubject = `🎯 Interview Invitation - ${studentName} | Geonixa`;
      emailHtml = getInterviewInvitationTemplate({
        name: studentName,
        domain,
        interviewDate: studentData.interviewDate || 'To be scheduled',
        interviewLink: studentData.interviewLink || '#',
        domain_track: studentData.domainTrack || domain,
      });
    } else if (reportType === 'FULL_REPORT') {
      emailSubject = `Assessment Report: Complete Evaluation - ${studentName}`;
      emailHtml = getFullAssessmentReportTemplate({
        name: studentName,
        studentId,
        college,
        domain,
        totalScore,
        percentage,
        roundScores,
        qualificationStatus,
        plagiarismScore: studentResponse.plagiarismScore || 0,
        proctoringViolationsCount: studentResponse.proctoringViolationsCount || 0,
        reportId,
        verificationUrl,
        generatedAt: new Date().toISOString(),
      });
    }

    // Send email
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

    // Update student record with report sent status
    await updateDoc(doc(db, 'students', studentId), {
      lastReportSentAt: serverTimestamp(),
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

// Email Templates

function getQualifiedResultTemplate(data: {
  name: string;
  totalScore: number;
  percentage: number;
  domain: string;
  reportId: string;
  verificationUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center; }
        .logo { color: #ffffff; font-weight: 800; font-size: 28px; letter-spacing: -1px; }
        .content { padding: 40px; }
        .result-box { background: linear-gradient(135deg, #f0fdf4 0%, #f0fdf4 100%); padding: 30px; border-radius: 12px; border-left: 4px solid #22c55e; margin: 30px 0; }
        .score-display { font-size: 48px; font-weight: 800; color: #22c55e; text-align: center; margin: 20px 0; }
        .percentage { font-size: 20px; color: #16a34a; font-weight: 700; text-align: center; }
        .btn { display: inline-block; background-color: #22c55e; color: #ffffff !important; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 14px; margin-top: 25px; text-align: center; width: 100%; box-sizing: border-box; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .verification-code { font-family: 'JetBrains Mono', monospace; background: #0f172a; color: #22c55e; padding: 10px; border-radius: 6px; font-weight: 700; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">✓ QUALIFIED</div>
        </div>
        <div class="content">
          <p style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Congratulations, ${data.name}!</p>
          <p style="color: #475569; font-size: 15px;">You have successfully qualified for the next phase of the Geonixa recruitment process. Your performance in the <strong>${data.domain}</strong> assessment was excellent.</p>
          
          <div class="result-box">
            <div style="font-weight: 700; color: #16a34a; font-size: 14px; text-transform: uppercase; margin-bottom: 15px;">Your Assessment Score</div>
            <div class="score-display">${data.totalScore}</div>
            <div class="percentage">${data.percentage.toFixed(1)}% Achievement</div>
          </div>

          <p style="color: #475569; margin-top: 30px;">Next Steps:</p>
          <ul style="color: #475569; margin: 15px 0;">
            <li>You will receive a follow-up communication regarding interview scheduling within 2-3 business days.</li>
            <li>Ensure your contact information and availability are up-to-date in your candidate profile.</li>
            <li>A dedicated recruitment specialist will guide you through the interview process.</li>
          </ul>

          <a href="${data.verificationUrl}" class="btn">View Full Assessment Report</a>

          <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <div style="font-weight: 700; color: #16a34a; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">Report Verification ID:</div>
            <div class="verification-code">${data.reportId}</div>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Geonixa Corporation. This is an automated message.
        </div>
      </div>
    </body>
    </html>
  `;
}

function getRejectedResultTemplate(data: {
  name: string;
  totalScore: number;
  percentage: number;
  domain: string;
  roundScores: Record<string, number>;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; }
        .logo { color: #ffffff; font-weight: 800; font-size: 28px; letter-spacing: -1px; }
        .content { padding: 40px; }
        .score-display { font-size: 36px; font-weight: 800; color: #d97706; text-align: center; margin: 20px 0; }
        .btn { display: inline-block; background-color: #3b82f6; color: #ffffff !important; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 14px; margin-top: 25px; text-align: center; width: 100%; box-sizing: border-box; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Assessment Result</div>
        </div>
        <div class="content">
          <p style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Thank you for participating, ${data.name}</p>
          <p style="color: #475569; font-size: 15px;">Thank you for taking the time to complete the Geonixa Technical Competency Assessment for the <strong>${data.domain}</strong> position. While your performance did not meet the qualification threshold this time, we appreciate your effort.</p>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 30px 0;">
            <div style="font-weight: 700; color: #92400e; font-size: 14px; margin-bottom: 10px;">Your Score</div>
            <div class="score-display">${data.totalScore} / 400</div>
            <div style="text-align: center; color: #d97706; font-weight: 600; font-size: 14px;">${data.percentage.toFixed(1)}% Achievement</div>
            <div style="text-align: center; color: #92400e; font-size: 13px; margin-top: 10px;">Qualification threshold: 50%</div>
          </div>

          <p style="color: #475569; margin: 25px 0; font-weight: 600;">We encourage you to:</p>
          <ul style="color: #475569; margin: 15px 0; font-size: 14px;">
            <li>Review the assessment topics and strengthen your technical foundation in weaker areas.</li>
            <li>Practice algorithmic problem-solving and coding challenges.</li>
            <li>Consider applying for future opportunities with improved preparation.</li>
          </ul>

          <a href="https://geonixa.com/careers" class="btn">Explore Other Opportunities</a>

          <p style="color: #94a3b8; font-size: 13px; margin-top: 30px; text-align: center;">You may reapply for this or similar positions after 90 days. We wish you the best in your career development.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Geonixa Corporation. This is an automated message.
        </div>
      </div>
    </body>
    </html>
  `;
}

function getInterviewInvitationTemplate(data: {
  name: string;
  domain: string;
  domain_track: string;
  interviewDate: string;
  interviewLink: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 40px 30px; text-align: center; }
        .logo { color: #ffffff; font-weight: 800; font-size: 28px; letter-spacing: -1px; }
        .content { padding: 40px; }
        .interview-box { background-color: #f5f3ff; padding: 25px; border-radius: 12px; border: 2px solid #7c3aed; margin: 30px 0; }
        .btn-primary { display: inline-block; background-color: #7c3aed; color: #ffffff !important; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 14px; margin-top: 25px; text-align: center; width: 100%; box-sizing: border-box; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎯 Interview Invitation</div>
        </div>
        <div class="content">
          <p style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Exciting News, ${data.name}!</p>
          <p style="color: #475569; font-size: 15px;">We are delighted to invite you to the next phase of our recruitment process for the <strong>${data.domain}</strong> role at Geonixa.</p>
          
          <div class="interview-box">
            <div style="font-weight: 700; color: #7c3aed; font-size: 14px; text-transform: uppercase; margin-bottom: 15px;">📅 Interview Details</div>
            <div style="font-size: 14px; color: #475569; margin: 15px 0;">
              <strong>Position:</strong> ${data.domain_track}<br>
              <strong>Scheduled Date:</strong> ${data.interviewDate}<br>
              <strong>Interview Type:</strong> Technical & Behavioral Evaluation (45-60 minutes)
            </div>
          </div>

          <p style="color: #475569; margin: 25px 0;">Interview Link & Details:</p>
          <a href="${data.interviewLink}" class="btn-primary">Join Interview</a>

          <p style="color: #475569; margin-top: 30px; font-weight: 600;">What to Expect:</p>
          <ul style="color: #475569; margin: 15px 0; font-size: 14px;">
            <li>Technical assessment based on your previous performance</li>
            <li>Discussion of your professional background and experience</li>
            <li>Questions about your interest in the Geonixa organization</li>
            <li>Opportunity to ask questions about the role and company</li>
          </ul>

          <div style="background-color: #ebf5ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-top: 30px;">
            <p style="color: #1e40af; font-weight: 700; margin-top: 0;">✓ Important Reminders:</p>
            <p style="color: #1e40af; font-size: 13px; margin: 10px 0;">Please join 5 minutes early. Test your audio and video before the interview.</p>
            <p style="color: #1e40af; font-size: 13px; margin: 10px 0;">Ensure a quiet, well-lit environment with minimal distractions.</p>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Geonixa Corporation. This is an automated message.
        </div>
      </div>
    </body>
    </html>
  `;
}

function getFullAssessmentReportTemplate(data: {
  name: string;
  studentId: string;
  college: string;
  domain: string;
  totalScore: number;
  percentage: number;
  roundScores: Record<string, number>;
  qualificationStatus: 'QUALIFIED' | 'NOT QUALIFIED' | 'DISQUALIFIED';
  plagiarismScore: number;
  proctoringViolationsCount: number;
  reportId: string;
  verificationUrl: string;
  generatedAt: string;
}) {
  const statusColor = data.qualificationStatus === 'QUALIFIED' ? '#22c55e' : '#ef4444';
  const statusBg = data.qualificationStatus === 'QUALIFIED' ? '#f0fdf4' : '#fef2f2';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 700px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .header { background: #0f172a; padding: 40px 30px; text-align: center; }
        .logo { color: #ff5a1f; font-weight: 800; font-size: 28px; letter-spacing: -1px; }
        .content { padding: 40px; }
        .status-box { background-color: ${statusBg}; padding: 25px; border-radius: 12px; border-left: 4px solid ${statusColor}; margin: 30px 0; }
        .score-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .score-card { background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; }
        .score-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; }
        .score-value { font-size: 24px; font-weight: 800; color: #0f172a; margin: 10px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background-color: #0f172a; color: #ffffff; padding: 12px; text-align: left; font-weight: 700; }
        .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .verification-code { font-family: 'JetBrains Mono', monospace; background: #0f172a; color: #22c55e; padding: 10px; border-radius: 6px; font-weight: 700; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">ASSESSMENT REPORT</div>
          <p style="color: #94a3b8; margin: 10px 0; font-size: 12px;">Official Evaluation Summary</p>
        </div>
        <div class="content">
          <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
            <p style="font-size: 14px; color: #64748b; margin: 0;"><strong>Candidate:</strong> ${data.name}</p>
            <p style="font-size: 14px; color: #64748b; margin: 5px 0;"><strong>Email ID:</strong> ${data.studentId}</p>
            <p style="font-size: 14px; color: #64748b; margin: 5px 0;"><strong>College:</strong> ${data.college}</p>
            <p style="font-size: 14px; color: #64748b; margin: 5px 0;"><strong>Domain Track:</strong> ${data.domain}</p>
            <p style="font-size: 14px; color: #64748b; margin: 5px 0;"><strong>Report ID:</strong> ${data.reportId}</p>
          </div>

          <div class="status-box">
            <div style="font-weight: 700; color: ${statusColor}; font-size: 16px; text-transform: uppercase;">Status: ${data.qualificationStatus}</div>
          </div>

          <div class="score-grid">
            <div class="score-card">
              <div class="score-label">Total Score</div>
              <div class="score-value">${data.totalScore}/400</div>
              <div style="color: #64748b; font-size: 14px;">${data.percentage.toFixed(1)}% Achievement</div>
            </div>
            <div class="score-card">
              <div class="score-label">Integrity Metrics</div>
              <div style="font-size: 14px; margin-top: 10px;">
                <p style="margin: 5px 0; color: #475569;"><strong>Plagiarism:</strong> ${data.plagiarismScore}%</p>
                <p style="margin: 5px 0; color: #475569;"><strong>Violations:</strong> ${data.proctoringViolationsCount}</p>
              </div>
            </div>
          </div>

          <div style="margin-top: 30px;">
            <div style="font-weight: 700; font-size: 14px; text-transform: uppercase; color: #0f172a; margin-bottom: 15px;">Round-Wise Breakdown:</div>
            <table class="table">
              <tr>
                <th>Round</th>
                <th>Score</th>
                <th>Percentage</th>
              </tr>
              <tr>
                <td>Round 1 (Aptitude)</td>
                <td style="font-weight: 700;">${data.roundScores.round1 || 0}</td>
                <td>${(((data.roundScores.round1 || 0) / 100) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Round 2 (Technical)</td>
                <td style="font-weight: 700;">${data.roundScores.round2 || 0}</td>
                <td>${(((data.roundScores.round2 || 0) / 100) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Round 3 (Communication)</td>
                <td style="font-weight: 700;">${data.roundScores.round3 || 0}</td>
                <td>${(((data.roundScores.round3 || 0) / 100) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Round 4 (Coding)</td>
                <td style="font-weight: 700;">${data.roundScores.round4 || 0}</td>
                <td>${(((data.roundScores.round4 || 0) / 100) * 100).toFixed(1)}%</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <div style="font-weight: 700; color: #16a34a; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">Report Verification ID:</div>
            <div class="verification-code">${data.reportId}</div>
            <p style="color: #16a34a; font-size: 12px; margin-top: 10px;">Generated: ${new Date(data.generatedAt).toLocaleString()}</p>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Geonixa Corporation. Unauthorized distribution of this document is prohibited.
        </div>
      </div>
    </body>
    </html>
  `;
}
