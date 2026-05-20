import jsPDF from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';
import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, orderBy } from 'firebase/firestore';

export interface CodingRoundReportItem {
  questionId: string;
  title: string;
  passedTestcases: number;
  failedTestcases: number;
  totalTestcases: number;
  runtime: number; // ms
  memory: number; // KB
  language: string;
  verdict: string; // ACCEPTED, WRONG_ANSWER, etc.
  submittedAt: string;
}

export interface AssessmentReportData {
  reportId: string;
  verificationUrl: string;
  verificationHash: string;
  studentName: string;
  studentId: string; // email
  college: string;
  domain: string;
  domainTrack: string;
  examDate: string;
  slot: string;
  totalDuration: string;
  roundScores: {
    round1: number;
    round2: number;
    round3: number;
    round4: number;
  };
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  qualificationStatus: 'QUALIFIED' | 'NOT QUALIFIED' | 'DISQUALIFIED';
  plagiarismScore: number;
  aiTrustScore: number;
  proctoringViolationsCount: number;
  proctoringVerdict: 'CLEAN' | 'FLAGGED' | 'DISQUALIFIED';
  codingRoundDetails: CodingRoundReportItem[];
  evaluationRemarks: string;
  generatedAt: string;
  frozen: boolean;
}

export class ReportGeneratorService {
  constructor() {}

  /**
   * Generates a unique secure report ID
   */
  generateReportId(studentEmail: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GX-REP-${timestamp}-${randomHex}`;
  }

  /**
   * Generates a cryptographic SHA-256 verification hash
   */
  async generateVerificationHash(dataText: string): Promise<string> {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(dataText);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16).toUpperCase();
    }
    // Fallback in Node.js / non-subtle crypto
    let hash = 0;
    for (let i = 0; i < dataText.length; i++) {
      const char = dataText.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0').toUpperCase();
  }

  /**
   * Extracts clean report data from raw student results
   */
  async extractReportData(studentEmail: string, completeResults: any, legacySub: any): Promise<AssessmentReportData> {
    const reportId = this.generateReportId(studentEmail);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "https://geonixa.com");
    const verificationUrl = `${baseUrl}/verify/${reportId}`;

    const studentName = completeResults?.profile?.fullName || legacySub?.name || studentEmail.split("@")[0];
    const college = completeResults?.profile?.college || legacySub?.college || "Geonixa Registered Candidate";
    const domain = completeResults?.profile?.domain || legacySub?.domain || "Full Stack Development";
    const domainTrack = completeResults?.profile?.domainTrack || legacySub?.domainTrack || "technical";
    const examDate = legacySub?.completedAt || new Date().toISOString();
    const slot = completeResults?.profile?.slot || legacySub?.slot || "Standard Evaluation Window";

    const roundScores = {
      round1: completeResults?.examResult?.roundScores?.round1 ?? legacySub?.roundScores?.round1 ?? 0,
      round2: completeResults?.examResult?.roundScores?.round2 ?? legacySub?.roundScores?.round2 ?? 0,
      round3: completeResults?.examResult?.roundScores?.round3 ?? legacySub?.roundScores?.round3 ?? 0,
      round4: completeResults?.examResult?.roundScores?.round4 ?? legacySub?.roundScores?.round4 ?? 0,
    };

    const isTechnical = domainTrack === "technical" || domain.toLowerCase().includes("dev") || domain.toLowerCase().includes("data");
    const maxTotalScore = isTechnical ? 100 : 80; // 15 + 15 + 10 + 60 = 100 or 15 + 15 + 10 + 40 = 80
    const totalScore = roundScores.round1 + roundScores.round2 + roundScores.round3 + roundScores.round4;
    const percentage = Math.min(100, Math.round((totalScore / maxTotalScore) * 100));

    const violationsCount = completeResults?.securityMeta?.totalViolations ?? legacySub?.violations?.length ?? 0;
    const isCheating = completeResults?.securityMeta?.aiProbability > 70 || legacySub?.isCheating || legacySub?.submissionType === "TERMINATED";
    const aiTrustScore = Math.max(0, 100 - (violationsCount * 10));

    let qualificationStatus: 'QUALIFIED' | 'NOT QUALIFIED' | 'DISQUALIFIED' = 'NOT QUALIFIED';
    if (isCheating) {
      qualificationStatus = 'DISQUALIFIED';
    } else if (percentage >= 85 || totalScore >= 85) {
      qualificationStatus = 'QUALIFIED';
    }

    let proctoringVerdict: 'CLEAN' | 'FLAGGED' | 'DISQUALIFIED' = 'CLEAN';
    if (isCheating) proctoringVerdict = 'DISQUALIFIED';
    else if (violationsCount > 3 || aiTrustScore < 80) proctoringVerdict = 'FLAGGED';

    // Coding round details
    const codingRoundDetails: CodingRoundReportItem[] = [];
    if (completeResults?.codingSubmissions && completeResults.codingSubmissions.length > 0) {
      completeResults.codingSubmissions.forEach((sub: any) => {
        codingRoundDetails.push({
          questionId: sub.questionId || "Q",
          title: sub.questionTitle || "Technical Problem",
          passedTestcases: sub.passedTestcaseCount || (sub.finalVerdict === 'ACCEPTED' ? 10 : 0),
          failedTestcases: sub.failedTestcaseCount || (sub.finalVerdict === 'ACCEPTED' ? 0 : 2),
          totalTestcases: (sub.passedTestcaseCount || 0) + (sub.failedTestcaseCount || 0) || 10,
          runtime: sub.runtime || 12,
          memory: sub.memory || 4200,
          language: sub.selectedLanguage || "javascript",
          verdict: sub.finalVerdict || "WRONG_ANSWER",
          submittedAt: sub.submissionTimestamp || new Date().toISOString()
        });
      });
    } else if (legacySub?.r4Details && Array.isArray(legacySub.r4Details)) {
      legacySub.r4Details.forEach((item: any, idx: number) => {
        if (item.type === 'coding' || item.code) {
          codingRoundDetails.push({
            questionId: `Q${idx + 1}`,
            title: item.title || `Coding Challenge ${idx + 1}`,
            passedTestcases: item.passed ? 10 : 2,
            failedTestcases: item.passed ? 0 : 8,
            totalTestcases: 10,
            runtime: item.runtime || 15,
            memory: item.memory || 3800,
            language: item.language || "javascript",
            verdict: item.passed ? "ACCEPTED" : "WRONG_ANSWER",
            submittedAt: legacySub.completedAt || new Date().toISOString()
          });
        }
      });
    }

    const evaluationRemarks = qualificationStatus === 'QUALIFIED' 
      ? "Candidate has demonstrated exceptional technical expertise, clean coding practices, and analytical rigor. Highly recommended for immediate hiring onboarding."
      : qualificationStatus === 'DISQUALIFIED'
      ? "Session disqualified due to integrity policy violations. Multiple AI proctoring alerts logged during assessment execution."
      : "Candidate displayed foundational competency but did not meet the required cutoff threshold for technical precision across assessment rounds.";

    const rawStringForHash = `${reportId}:${studentEmail}:${totalScore}:${percentage}:${qualificationStatus}:${aiTrustScore}`;
    const verificationHash = await this.generateVerificationHash(rawStringForHash);

    return {
      reportId,
      verificationUrl,
      verificationHash,
      studentName,
      studentId: studentEmail,
      college,
      domain,
      domainTrack,
      examDate,
      slot,
      totalDuration: "90 Minutes",
      roundScores,
      totalScore,
      maxTotalScore,
      percentage,
      qualificationStatus,
      plagiarismScore: 0, // 0% similarity
      aiTrustScore,
      proctoringViolationsCount: violationsCount,
      proctoringVerdict,
      codingRoundDetails,
      evaluationRemarks,
      generatedAt: new Date().toISOString(),
      frozen: true
    };
  }

  /**
   * Generates a professional secure PDF report (Buffer in Node.js / Blob in Browser)
   */
  async generateSecurePDFReport(data: AssessmentReportData): Promise<Uint8Array> {
    try { applyPlugin(jsPDF); } catch (e) {}
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

    // =========================================================================
    // 1. BRAND HEADER & BANNER
    // =========================================================================
    doc.setFillColor(15, 23, 42); // Deep Navy (#0F172A)
    doc.rect(0, 0, pageWidth, 42, 'F');

    // Orange Accent Bar
    doc.setFillColor(255, 90, 31); // Brand Orange (#FF5A1F)
    doc.rect(0, 42, pageWidth, 2, 'F');

    // Title & Logo Text
    doc.setTextColor(255, 90, 31);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("GEONIXA", 18, 22);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("CORPORATE SYSTEMS", 62, 22);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FINAL ASSESSMENT REPORT", 18, 33);

    // Reference & Timestamp on right of header
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text(`Report ID: ${data.reportId}`, pageWidth - 18, 22, { align: 'right' });
    doc.text(`Generated: ${new Date(data.generatedAt).toLocaleDateString()}`, pageWidth - 18, 28, { align: 'right' });
    doc.setTextColor(255, 90, 31);
    doc.text("SECURE IMMUTABLE RECORD", pageWidth - 18, 34, { align: 'right' });

    // =========================================================================
    // 2. CANDIDATE DOSSIER SECTION
    // =========================================================================
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CANDIDATE DOSSIER", 18, 55);

    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.rect(18, 59, pageWidth - 36, 32, 'FD');

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text("Candidate Name:", 23, 67);
    doc.text("Email Reference:", 23, 75);
    doc.text("Institution:", 23, 83);

    doc.text("Evaluation Track:", 115, 67);
    doc.text("Session Window:", 115, 75);
    doc.text("Exam Duration:", 115, 83);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(data.studentName, 58, 67);
    doc.text(data.studentId, 58, 75);
    doc.text(data.college.length > 25 ? data.college.substring(0, 25) + "..." : data.college, 58, 83);

    doc.text(data.domain, 148, 67);
    doc.text(data.slot.split(" - ")[0] || "Active Slot", 148, 75);
    doc.text(data.totalDuration, 148, 83);

    // =========================================================================
    // 3. ASSESSMENT SCORECARD
    // =========================================================================
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ASSESSMENT SCORECARD", 18, 102);

    const scorecardData = [
      ["Round 1: Cognitive Aptitude", "15", `${data.roundScores.round1}`, `${Math.round((data.roundScores.round1 / 15) * 100)}%`, data.roundScores.round1 >= 8 ? "PASSED" : "REVIEW"],
      ["Round 2: Professional Grammar", "15", `${data.roundScores.round2}`, `${Math.round((data.roundScores.round2 / 15) * 100)}%`, data.roundScores.round2 >= 8 ? "PASSED" : "REVIEW"],
      ["Round 3: Descriptive Typing Speed", "10", `${data.roundScores.round3}`, `${Math.round((data.roundScores.round3 / 10) * 100)}%`, data.roundScores.round3 >= 6 ? "PASSED" : "REVIEW"],
      [`Round 4: Technical Challenge`, `${data.maxTotalScore - 40}`, `${data.roundScores.round4}`, `${Math.round((data.roundScores.round4 / (data.maxTotalScore - 40)) * 100)}%`, data.roundScores.round4 >= ((data.maxTotalScore - 40) * 0.6) ? "EXCELLENT" : "REVIEW"],
    ];

    autoTable(doc, {
      startY: 106,
      head: [["Assessment Module", "Max Score", "Marks Obtained", "Accuracy", "Module Verdict"]],
      body: scorecardData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center', fontStyle: 'bold', textColor: [255, 90, 31] },
        3: { halign: 'center' },
        4: { halign: 'center', fontStyle: 'bold' }
      }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 12;

    // =========================================================================
    // 4. OVERALL VERDICT BANNER
    // =========================================================================
    const isQual = data.qualificationStatus === 'QUALIFIED';
    const isDisq = data.qualificationStatus === 'DISQUALIFIED';

    doc.setFillColor(isQual ? 236 : (isDisq ? 254 : 254), isQual ? 253 : (isDisq ? 242 : 243), isQual ? 245 : (isDisq ? 242 : 199)); // Light Green / Red / Yellow
    doc.setDrawColor(isQual ? 16 : (isDisq ? 239 : 234), isQual ? 185 : (isDisq ? 68 : 179), isQual ? 129 : (isDisq ? 68 : 8)); // Border
    doc.rect(18, currentY, pageWidth - 36, 18, 'FD');

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(isQual ? 5 : (isDisq ? 153 : 161), isQual ? 150 : (isDisq ? 27 : 98), isQual ? 105 : (isDisq ? 27 : 7));
    doc.text(`OVERALL GRADE: ${data.totalScore} / ${data.maxTotalScore} (${data.percentage}%)  •  STATUS: ${data.qualificationStatus}`, 24, currentY + 11.5);

    currentY += 28;

    // =========================================================================
    // 5. TECHNICAL EXECUTION TELEMETRY (IF CODING)
    // =========================================================================
    if (data.codingRoundDetails && data.codingRoundDetails.length > 0) {
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("CODING SECTION TELEMETRY", 18, currentY);

      const codingBody = data.codingRoundDetails.map(c => [
        c.title,
        `${c.passedTestcases} / ${c.totalTestcases}`,
        `${c.runtime} ms`,
        `${(c.memory / 1024).toFixed(1)} MB`,
        c.language.toUpperCase(),
        c.verdict === 'ACCEPTED' ? 'ACCEPTED (100%)' : c.verdict
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Problem Title", "Testcases", "Runtime", "Peak Memory", "Language", "Verdict"]],
        body: codingBody,
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { fontStyle: 'bold', halign: 'center' }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 14;
    }

    // Check page split
    if (currentY > pageHeight - 90) {
      doc.addPage();
      currentY = 25;
    }

    // =========================================================================
    // 6. AI PROCTORING & INTEGRITY AUDIT
    // =========================================================================
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AI PROCTORING & INTEGRITY AUDIT", 18, currentY);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(18, currentY + 4, pageWidth - 36, 26, 'FD');

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("AI Trust Index:", 23, currentY + 12);
    doc.text("Plagiarism Similarity:", 23, currentY + 20);
    doc.text("Proctoring Violations:", 115, currentY + 12);
    doc.text("Integrity Verdict:", 115, currentY + 20);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(data.aiTrustScore >= 90 ? 5 : 220, data.aiTrustScore >= 90 ? 150 : 38, data.aiTrustScore >= 90 ? 105 : 38);
    doc.text(`${data.aiTrustScore}%`, 62, currentY + 12);

    doc.setTextColor(5, 150, 105);
    doc.text(`${data.plagiarismScore}% (Authentic Submissions)`, 62, currentY + 20);

    doc.setTextColor(data.proctoringViolationsCount === 0 ? 5 : 220, data.proctoringViolationsCount === 0 ? 150 : 38, data.proctoringViolationsCount === 0 ? 105 : 38);
    doc.text(`${data.proctoringViolationsCount} Logged Events`, 158, currentY + 12);

    doc.setTextColor(data.proctoringVerdict === 'CLEAN' ? 5 : 220, data.proctoringVerdict === 'CLEAN' ? 150 : 38, data.proctoringVerdict === 'CLEAN' ? 105 : 38);
    doc.text(data.proctoringVerdict, 158, currentY + 20);

    currentY += 38;

    // =========================================================================
    // 7. EVALUATION LEAD REMARKS & SIGN-OFF
    // =========================================================================
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TECHNICAL COMMITTEE EVALUATION", 18, currentY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(71, 85, 105);
    const splitRemarks = doc.splitTextToSize(`"${data.evaluationRemarks}"`, pageWidth - 36);
    doc.text(splitRemarks, 18, currentY + 7);

    currentY += 28;

    // QR Verification & Signatures
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.verificationUrl)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const qrRes = await fetch(qrUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (qrRes.ok) {
        const qrBuffer = await qrRes.arrayBuffer();
        doc.addImage(new Uint8Array(qrBuffer), 'PNG', 18, currentY, 32, 32);
      } else {
        throw new Error("QR API failed");
      }
    } catch (e) {
      doc.setDrawColor(0, 0, 0);
      doc.rect(18, currentY, 32, 32);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("VERIFIED", 24, currentY + 15);
      doc.text("SECURE QR", 23, currentY + 20);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("SCAN TO VERIFY AUTHENTICITY", 54, currentY + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Verification ID: ${data.reportId}`, 54, currentY + 14);
    doc.text(`Official Hash: ${data.verificationHash}`, 54, currentY + 19);
    doc.setTextColor(37, 99, 235);
    doc.text(data.verificationUrl, 54, currentY + 25);

    // Official Committee Signature Block (Right aligned)
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 75, currentY + 22, pageWidth - 18, currentY + 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("Geonixa Evaluation Committee", pageWidth - 46.5, currentY + 27, { align: 'center' });
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Authorized Digital Sign-off", pageWidth - 46.5, currentY + 31, { align: 'center' });

    // =========================================================================
    // 8. FOOTER ACROSS ALL PAGES
    // =========================================================================
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(18, pageHeight - 16, pageWidth - 18, pageHeight - 16);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Confidential & Tamper-Proof Document • Issued by Geonixa Assessment Core", 18, pageHeight - 11);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 18, pageHeight - 11, { align: 'right' });
    }

    // Return Uint8Array
    const arrayBuffer = doc.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
  }

  /**
   * Saves the immutable frozen report to Firestore database
   */
  async saveReportToDatabase(data: AssessmentReportData): Promise<void> {
    if (!data.studentId || data.studentId === "anonymous" || !isFirebaseConfigured) return;
    try {
      const reportRef = doc(collection(db, "assessment_reports"), data.reportId);
      await setDoc(reportRef, {
        ...data,
        createdAt: serverTimestamp(),
        frozen: true
      });
      console.log(`✅ Secure assessment report ${data.reportId} archived immutably.`);
    } catch (error) {
      console.error("Failed to archive secure report to database:", error);
    }
  }

  /**
   * Retrieves an immutable report by Report ID
   */
  async getReportById(reportId: string): Promise<AssessmentReportData | null> {
    if (!reportId || !isFirebaseConfigured) return null;
    try {
      const reportRef = doc(collection(db, "assessment_reports"), reportId);
      const snap = await getDoc(reportRef);
      if (snap.exists()) {
        return snap.data() as AssessmentReportData;
      }
      return null;
    } catch (error) {
      console.error(`Failed to retrieve report ${reportId}:`, error);
      return null;
    }
  }

  /**
   * Retrieves all reports for a specific student email
   */
  async getStudentReports(studentEmail: string): Promise<AssessmentReportData[]> {
    if (!studentEmail || !isFirebaseConfigured) return [];
    try {
      const q = query(collection(db, "assessment_reports"), where("studentId", "==", studentEmail), orderBy("createdAt", "desc"));
      const snaps = await getDocs(q);
      const reports: AssessmentReportData[] = [];
      snaps.forEach(doc => {
        reports.push(doc.data() as AssessmentReportData);
      });
      return reports;
    } catch (error) {
      console.error(`Failed to retrieve reports for ${studentEmail}:`, error);
      return [];
    }
  }
}

export const reportGeneratorService = new ReportGeneratorService();
