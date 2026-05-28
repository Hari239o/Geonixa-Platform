import { NextResponse } from "next/server";
import { emailService } from "@/lib/emailService";
import { reportGeneratorService } from "@/lib/reportGenerator";
import { getCompleteStudentResults, isFirebaseConfigured } from "@/lib/firebase";
import { getFirestoreDb } from "@/lib/firestore";

export async function POST(req: Request) {
  try {
    const { type, candidateEmail, candidateName, status } = await req.json();

    let subject = "";
    let html = "";
    let attachments: any[] = [];
    let dispatchType: any = "COMPLETION";

    if (type === "COMPLETION") {
      dispatchType = "COMPLETION";
      subject = "Assessment Successfully Completed";
      html = emailService.getCompletionTemplate({
        name: candidateName || candidateEmail.split('@')[0],
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })
      });
    } else if (type === "ASSESSMENT_REPORT") {
      dispatchType = "ASSESSMENT_REPORT";
      subject = "Official Assessment Report: Geonixa Technical Evaluation";

      // 1. Fetch complete results and legacy fallback
      let completeResults: any = null;
      let legacyData: any = null;

      if (isFirebaseConfigured) {
        try {
          completeResults = await getCompleteStudentResults(candidateEmail);
          const adminDb = getFirestoreDb();
          const legacySnap = await adminDb.collection('exam_submissions').doc(candidateEmail).get();
          if (legacySnap.exists) {
            legacyData = legacySnap.data();
          }
        } catch (e) {
          console.error("Error fetching results for report:", e);
        }
      }

      // 2. Extract clean report data
      const reportData = await reportGeneratorService.extractReportData(candidateEmail, completeResults, legacyData);

      // 3. Save report to Firestore immutably
      await reportGeneratorService.saveReportToDatabase(reportData);

      // 4. Generate secure PDF report Uint8Array
      try {
        const pdfBytes = await reportGeneratorService.generateSecurePDFReport(reportData);
        attachments = [
          {
            filename: `Geonixa_Secure_Assessment_Report_${reportData.reportId}.pdf`,
            content: Buffer.from(pdfBytes),
            contentType: "application/pdf"
          }
        ];
      } catch (pdfErr) {
        console.error("PDF generation failed in route:", pdfErr);
      }

      // 5. Generate professional report HTML email
      html = emailService.getAssessmentReportTemplate({
        name: candidateName || reportData.studentName,
        reportId: reportData.reportId,
        date: new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
        domain: reportData.domain,
        score: reportData.totalScore,
        maxScore: reportData.maxTotalScore,
        percentage: reportData.percentage,
        status: reportData.qualificationStatus,
        verificationUrl: reportData.verificationUrl
      });

    } else if (type === "RESULT") {
      dispatchType = status === "SELECTED" ? "RESULT_SELECTED" : 
                     status === "INTERVIEW" ? "INTERVIEW_INVITATION" : "RESULT_REJECTED";
      subject = status === "SELECTED" ? "Congratulations: Geonixa Selection Status" : 
                status === "INTERVIEW" ? "Interview Invitation: Geonixa Assessment" :
                "Geonixa Assessment Status Update";
      html = emailService.getResultTemplate({
        name: candidateName,
        status: status
      });
    } else if (type === "TERMINATION") {
      dispatchType = "TERMINATION";
      subject = "Geonixa Assessment Termination Notice";
      html = emailService.getTerminationTemplate({
        name: candidateName,
        examId: "GEONIXA-EX-" + Math.random().toString(36).substring(7).toUpperCase(),
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }),
        reason: status || "Integrity Violation"
      });
    } else {
      return NextResponse.json({ success: false, error: "INVALID_EMAIL_TYPE" }, { status: 400 });
    }

    const result = await emailService.sendEmail({
      to: candidateEmail,
      subject,
      html,
      candidateEmail,
      type: dispatchType,
      attachments: attachments.length > 0 ? attachments : undefined
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: "Email and report dispatched successfully" });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Communication API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
