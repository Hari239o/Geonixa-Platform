import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, collection, setDoc, doc, runTransaction, getDoc, getDocs, deleteDoc, updateDoc, writeBatch, onSnapshot, query, orderBy, limit, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { enrichProfileWithDomainPlan } from "@/data/domainConfig";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "dummy",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "dummy",
};

export const isFirebaseConfigured = firebaseConfig.projectId !== "dummy";

// Start safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Firebase Auth for client-side auth flows
export const auth = getAuth(app);

// Set realistic timeout/retry limits to ensure reliability on varying network conditions
storage.maxOperationRetryTime = 5000; // 5 seconds
storage.maxUploadRetryTime = 5000; // 5 seconds

// =============================================================================
// ENTERPRISE RESULT STORAGE ARCHITECTURE
// =============================================================================

// PROFESSIONAL FIREBASE COLLECTIONS STRUCTURE:
// students/ - Basic student info
// examResults/ - Overall exam results
// roundResults/ - Detailed round-wise results
// codingSubmissions/ - Individual coding question submissions
// mcqResponses/ - Individual MCQ responses
// proctoringLogs/ - AI proctoring events

export interface StudentProfile {
  studentId: string;
  fullName: string;
  email: string;
  college: string;
  slot: string;
  domain: string;
  domainId?: string;
  domainTrack?: "technical" | "non-technical";
  round4Mode?: "coding" | "domain-mcq";
  reportGroup?: string;
  examPattern?: any;
  questionAllocation?: any[];
  registrationTimestamp: string;
}

export interface RoundResult {
  roundNumber: number;
  roundName?: string;
  roundType?: string;
  domain?: string;
  course?: string;
  scoringRule?: string;
  negativePenalty?: number;
  attemptedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattemptedQuestions: number;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  startTime: string;
  endTime: string;
  timeSpent: number;
  submissionTimestamp: string;
  details: any[];
}

export interface CodingSubmission {
  questionId: string;
  questionTitle: string;
  questionDifficulty: string;
  studentCode: string;
  selectedLanguage: string;
  visibleTestcaseResults: TestResult[];
  hiddenTestcaseResults: TestResult[];
  passedTestcaseCount: number;
  failedTestcaseCount: number;
  runtime: number;
  memory: number;
  submissionTimestamp: string;
  finalVerdict: 'ACCEPTED' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR' | 'TIME_LIMIT_EXCEEDED';
  domain?: string;
  course?: string;
}

export interface TestResult {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
  memoryUsed: number;
  isHidden: boolean;
}

export interface MCQResponse {
  questionId: string;
  roundNumber?: number;
  domain?: string;
  course?: string;
  questionText?: string;
  questionCode?: string;
  patternKey?: string;
  selectedOption: string;
  correctOption: string;
  marksAwarded: number;
  timeSpent: number;
  questionStatus: 'CORRECT' | 'WRONG' | 'UNATTEMPTED';
  submissionTimestamp: string;
}

export interface ProctoringLog {
  eventType: string;
  message: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: any;
}

export interface ExamResult {
  examId: string;
  studentId: string;
  domain?: string;
  domainTrack?: "technical" | "non-technical";
  round4Mode?: "coding" | "domain-mcq";
  reportGroup?: string;
  examPattern?: any;
  totalScore: number;
  qualificationStatus: 'QUALIFIED' | 'FAILED' | 'TERMINATED';
  submissionType: 'MANUAL' | 'AUTO_TIMEUP' | 'TERMINATED';
  completedAt: string;
  roundScores: {
    round1: number;
    round2: number;
    round3: number;
    round4: number;
  };
  analytics: {
    totalQuestionsAttempted: number;
    codingAccuracy: number;
    testcasePassPercentage: number;
    runtimePerformance: number;
    memoryPerformance: number;
  };
  securityMeta: {
    totalViolations: number;
    tabSwitches: number;
    aiProbability: number;
    suspicionScore: number;
    humanConfidence: number;
  };
}

export type SlotValidationStatus = "ACTIVE" | "PENDING" | "EXPIRED" | "INVALID" | "MISSING";

export interface SlotValidationResult {
  status: SlotValidationStatus;
  message: string;
  slotStart?: Date;
  slotEnd?: Date;
}

export const parseSlotWindow = (day: string, slotLabel: string) => {
  if (!day || !slotLabel) throw new Error("DAY_OR_SLOT_REQUIRED");

  let normalizedLabel = slotLabel.trim();
  if ((SLOT_CONFIG as any)[normalizedLabel]) {
    normalizedLabel = (SLOT_CONFIG as any)[normalizedLabel].label;
  }

  const parts = normalizedLabel.split(" - ");
  if (parts.length !== 2) throw new Error("INVALID_SLOT_FORMAT");

  const parseTimePart = (part: string) => {
    const [time, modifier] = part.trim().split(" ");
    if (!time || !modifier) throw new Error("INVALID_SLOT_PART");

    const [hours, minutes] = time.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) throw new Error("INVALID_SLOT_TIME");

    let normalizedHours = hours;
    const uppercaseModifier = modifier.toUpperCase();
    if (uppercaseModifier === "PM" && normalizedHours !== 12) normalizedHours += 12;
    if (uppercaseModifier === "AM" && normalizedHours === 12) normalizedHours = 0;

    return { hours: normalizedHours, minutes };
  };

  const [startPart, endPart] = parts;
  const startTime = parseTimePart(startPart);
  const endTime = parseTimePart(endPart);

  const [year, month, date] = day.split("-").map(Number);
  if ([year, month, date].some(Number.isNaN)) throw new Error("INVALID_DAY_FORMAT");

  const isoStart = `${day}T${String(startTime.hours).padStart(2, '0')}:${String(startTime.minutes).padStart(2, '0')}:00+05:30`;
  const isoEnd = `${day}T${String(endTime.hours).padStart(2, '0')}:${String(endTime.minutes).padStart(2, '0')}:00+05:30`;

  const slotStart = new Date(isoStart);
  const slotEnd = new Date(isoEnd);

  return { slotStart, slotEnd };
};

export const validateExamSlot = (profile: any): SlotValidationResult => {
  if (!profile || !profile.day || !profile.slot) {
    return {
      status: "MISSING",
      message: "Exam slot or day information is missing. Contact administration.",
    };
  }

  try {
    const { slotStart, slotEnd } = parseSlotWindow(profile.day, profile.slot);
    const now = new Date();

    if (now > slotEnd) {
      return {
        status: "EXPIRED",
        message: `Scheduled slot expired on ${slotEnd.toLocaleString()}. Access is revoked and passkey is invalidated.`,
        slotStart,
        slotEnd,
      };
    }

    if (now < slotStart) {
      return {
        status: "PENDING",
        message: `Scheduled slot begins at ${slotStart.toLocaleString()}. Access is locked until the official slot window.`,
        slotStart,
        slotEnd,
      };
    }

    return {
      status: "ACTIVE",
      message: "Scheduled slot is currently active. Exam access is permitted.",
      slotStart,
      slotEnd,
    };
  } catch (error) {
    console.error("Slot validation parse error:", error);
    return {
      status: "INVALID",
      message: "Slot metadata is invalid or malformed. Contact administration.",
    };
  }
};

export const expireCandidatePassKey = async (email: string, reason = "SLOT_EXPIRED") => {
  if (!email) return;

  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    localStorage.setItem(`geonixa_passkey_expired_${email}`, "true");
    return;
  }

  try {
    const loginRef = doc(collection(db, "valid_logins"), email);
    await updateDoc(loginRef, {
      passKeyExpired: true,
      passKeyExpiryReason: reason,
      passKeyExpiredAt: new Date().toISOString(),
    }).catch(() => {});
  } catch (error) {
    console.error("Failed to expire passkey:", error);
  }
};

const retryAsyncOperation = async <T>(operation: () => Promise<T>, retries = 2, initialBackoff = 250): Promise<T> => {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt += 1;
      if (attempt > retries) {
        throw error;
      }
      const backoff = initialBackoff * attempt;
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
};

// =============================================================================
// ENTERPRISE RESULT STORAGE FUNCTIONS
// =============================================================================

/**
 * Store complete exam results with atomic transactions
 * Ensures no partial writes and maintains data integrity
 */
export const storeCompleteExamResults = async (
  studentEmail: string,
  examData: {
    profile: StudentProfile;
    roundResults: RoundResult[];
    codingSubmissions: CodingSubmission[];
    mcqResponses: MCQResponse[];
    proctoringLogs: ProctoringLog[];
    examResult: ExamResult;
  }
) => {
  if (!studentEmail || firebaseConfig.projectId === "dummy") {
    console.warn("Firebase not configured or invalid email");
    return;
  }

  try {
    const batch = writeBatch(db);

    // 1. Store/Update Student Profile
    const studentRef = doc(collection(db, "students"), studentEmail);
    batch.set(studentRef, examData.profile, { merge: true });

    // 2. Store Overall Exam Result
    const examResultRef = doc(collection(db, "examResults"), `${studentEmail}_${examData.examResult.examId}`);
    batch.set(examResultRef, examData.examResult);

    // 3. Store Round-wise Results
    examData.roundResults.forEach(roundResult => {
      const roundRef = doc(collection(db, "roundResults"), `${studentEmail}_${examData.examResult.examId}_round${roundResult.roundNumber}`);
      batch.set(roundRef, roundResult);
    });

    // 4. Store Coding Submissions
    examData.codingSubmissions.forEach(submission => {
      const codingRef = doc(collection(db, "codingSubmissions"), `${studentEmail}_${examData.examResult.examId}_${submission.questionId}`);
      batch.set(codingRef, submission);
    });

    // 5. Store MCQ Responses
    examData.mcqResponses.forEach(response => {
      const mcqRef = doc(collection(db, "mcqResponses"), `${studentEmail}_${examData.examResult.examId}_${response.questionId}`);
      batch.set(mcqRef, response);
    });

    // 6. Store Proctoring Logs
    examData.proctoringLogs.forEach(log => {
      const logRef = doc(collection(db, "proctoringLogs"), `${studentEmail}_${examData.examResult.examId}_${Date.now()}_${Math.random()}`);
      batch.set(logRef, log);
    });

    await retryAsyncOperation(async () => {
      await batch.commit();
    }, 3, 300);

    console.log("✅ Complete exam results stored successfully");
  } catch (error) {
    console.error("❌ Failed to store complete exam results:", error);
    throw error;
  }
};

/**
 * Store individual coding submission with testcase results
 */
export const storeCodingSubmission = async (
  studentEmail: string,
  examId: string,
  submission: CodingSubmission
) => {
  if (!studentEmail || firebaseConfig.projectId === "dummy") return;

  try {
    const submissionRef = doc(collection(db, "codingSubmissions"), `${studentEmail}_${examId}_${submission.questionId}`);
    await setDoc(submissionRef, {
      ...submission,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error("Failed to store coding submission:", error);
  }
};

/**
 * Store MCQ response
 */
export const storeMCQResponse = async (
  studentEmail: string,
  examId: string,
  response: MCQResponse
) => {
  if (!studentEmail || firebaseConfig.projectId === "dummy") return;

  try {
    const responseRef = doc(collection(db, "mcqResponses"), `${studentEmail}_${examId}_${response.questionId}`);
    await setDoc(responseRef, response);
  } catch (error) {
    console.error("Failed to store MCQ response:", error);
  }
};

/**
 * Store proctoring event
 */
export const storeProctoringLog = async (
  studentEmail: string,
  examId: string,
  log: ProctoringLog
) => {
  if (!studentEmail || firebaseConfig.projectId === "dummy") return;

  try {
    const logRef = doc(collection(db, "proctoringLogs"), `${studentEmail}_${examId}_${Date.now()}_${Math.random()}`);
    await setDoc(logRef, log);
  } catch (error) {
    console.error("Failed to store proctoring log:", error);
  }
};

/**
 * Get complete student results for admin dashboard
 */
export const getCompleteStudentResults = async (studentEmail: string, examId?: string) => {
  if (!studentEmail || firebaseConfig.projectId === "dummy") return null;

  try {
    const results: any = {
      profile: null,
      examResult: null,
      roundResults: [],
      codingSubmissions: [],
      mcqResponses: [],
      proctoringLogs: []
    };

    // Get student profile
    const profileDoc = await getDoc(doc(collection(db, "students"), studentEmail));
    if (profileDoc.exists()) {
      results.profile = profileDoc.data();
    }

    // Get exam results
    const examQuery = examId
      ? query(collection(db, "examResults"), where("studentId", "==", studentEmail), where("examId", "==", examId))
      : query(collection(db, "examResults"), where("studentId", "==", studentEmail));

    const examSnapshot = await getDocs(examQuery);
    examSnapshot.forEach(doc => {
      results.examResult = doc.data();
    });

    // Get round results
    const roundQuery = examId
      ? query(collection(db, "roundResults"), where("studentId", "==", studentEmail), where("examId", "==", examId))
      : query(collection(db, "roundResults"), where("studentId", "==", studentEmail));

    const roundSnapshot = await getDocs(roundQuery);
    roundSnapshot.forEach(doc => {
      results.roundResults.push(doc.data());
    });

    // Get coding submissions
    const codingQuery = examId
      ? query(collection(db, "codingSubmissions"), where("studentId", "==", studentEmail), where("examId", "==", examId))
      : query(collection(db, "codingSubmissions"), where("studentId", "==", studentEmail));

    const codingSnapshot = await getDocs(codingQuery);
    codingSnapshot.forEach(doc => {
      results.codingSubmissions.push(doc.data());
    });

    // Get MCQ responses
    const mcqQuery = examId
      ? query(collection(db, "mcqResponses"), where("studentId", "==", studentEmail), where("examId", "==", examId))
      : query(collection(db, "mcqResponses"), where("studentId", "==", studentEmail));

    const mcqSnapshot = await getDocs(mcqQuery);
    mcqSnapshot.forEach(doc => {
      results.mcqResponses.push(doc.data());
    });

    // Get proctoring logs
    const proctoringQuery = examId
      ? query(collection(db, "proctoringLogs"), where("studentId", "==", studentEmail), where("examId", "==", examId))
      : query(collection(db, "proctoringLogs"), where("studentId", "==", studentEmail));

    const proctoringSnapshot = await getDocs(proctoringQuery);
    proctoringSnapshot.forEach(doc => {
      results.proctoringLogs.push(doc.data());
    });

    return results;
  } catch (error) {
    console.error("Failed to get complete student results:", error);
    return null;
  }
};

/**
 * Get all students' results for admin analytics
 */
export const getAllStudentsResults = async () => {
  if (firebaseConfig.projectId === "dummy") return [];

  try {
    const results: any[] = [];

    // Get all exam results
    const examSnapshot = await getDocs(collection(db, "examResults"));
    const examResults: any[] = [];
    examSnapshot.forEach(doc => {
      examResults.push(doc.data());
    });

    // Get all student profiles
    const profileSnapshot = await getDocs(collection(db, "students"));
    const profiles: Record<string, any> = {};
    profileSnapshot.forEach(doc => {
      profiles[doc.id] = doc.data();
    });

    // Combine data
    for (const examResult of examResults) {
      const profile = profiles[examResult.studentId];
      if (profile) {
        results.push({
          ...examResult,
          ...profile,
          // Get additional details from other collections as needed
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Failed to get all students results:", error);
    return [];
  }
};

// =============================================================================
// LEGACY COMPATIBILITY FUNCTIONS (DEPRECATED)
// =============================================================================

export const storeExamAnswers = async (email: string, examData: any) => {
  if (!email || email === "anonymous") return;
  if (firebaseConfig.projectId === "dummy") {
    console.warn("No Firebase Config! Mock processing the save instead.");
    if (typeof window !== "undefined") {
      const key = "geonixa_submissions";
      const prev = JSON.parse(localStorage.getItem(key) || "{}");
      prev[email] = { ...examData, timestamp: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(prev));
    }
    return;
  }

  // For backward compatibility, still store in old format
  // But also trigger the new comprehensive storage
  try {
    const examDoc = doc(collection(db, "exam_submissions"), email);
    await setDoc(examDoc, {
      ...examData,
      timestamp: new Date().toISOString()
    });

    // If this is a complete exam submission, also store in new format
    if (examData.roundScores && examData.r1Details) {
      await migrateToNewStorageFormat(email, examData);
    }
  } catch (error) {
    console.error("Firebase store failed:", error);
  }
};

/**
 * Migrate legacy data to new professional storage format
 */
const migrateToNewStorageFormat = async (email: string, legacyData: any) => {
  try {
    const examId = legacyData.examId || "legacy";
    const studentProfile: StudentProfile = {
      studentId: email,
      fullName: legacyData.name || email,
      email: email,
      college: legacyData.college || "Unknown",
      slot: legacyData.slot || "Unknown",
      domain: legacyData.domain || "Unknown",
      registrationTimestamp: legacyData.timestamp || new Date().toISOString()
    };

    // Convert round results
    const roundResults: RoundResult[] = [];
    const mcqResponses: MCQResponse[] = [];
    const codingSubmissions: CodingSubmission[] = [];

    // Round 1
    if (legacyData.r1Details) {
      roundResults.push({
        roundNumber: 1,
        attemptedQuestions: legacyData.r1Details.filter((d: any) => d.selected).length,
        correctAnswers: legacyData.r1Details.filter((d: any) => d.isCorrect).length,
        wrongAnswers: legacyData.r1Details.filter((d: any) => d.selected && !d.isCorrect).length,
        unattemptedQuestions: legacyData.r1Details.filter((d: any) => !d.selected).length,
        marksObtained: legacyData.roundScores?.round1 || 0,
        totalMarks: 15,
        percentage: ((legacyData.roundScores?.round1 || 0) / 15) * 100,
        startTime: legacyData.timestamp,
        endTime: legacyData.completedAt,
        timeSpent: 10 * 60, // 10 minutes
        submissionTimestamp: legacyData.completedAt,
        details: legacyData.r1Details
      });

      // Add MCQ responses
      legacyData.r1Details.forEach((detail: any, index: number) => {
        mcqResponses.push({
          questionId: `r1_${index}`,
          selectedOption: detail.selected || "",
          correctOption: detail.correct,
          marksAwarded: detail.isCorrect ? 1 : (detail.selected ? -0.25 : 0),
          timeSpent: 0, // Not tracked in legacy
          questionStatus: detail.isCorrect ? 'CORRECT' : (detail.selected ? 'WRONG' : 'UNATTEMPTED'),
          submissionTimestamp: legacyData.completedAt
        });
      });
    }

    // Round 2
    if (legacyData.r2Details) {
      roundResults.push({
        roundNumber: 2,
        attemptedQuestions: legacyData.r2Details.filter((d: any) => d.selected).length,
        correctAnswers: legacyData.r2Details.filter((d: any) => d.isCorrect).length,
        wrongAnswers: legacyData.r2Details.filter((d: any) => d.selected && !d.isCorrect).length,
        unattemptedQuestions: legacyData.r2Details.filter((d: any) => !d.selected).length,
        marksObtained: legacyData.roundScores?.round2 || 0,
        totalMarks: 15,
        percentage: ((legacyData.roundScores?.round2 || 0) / 15) * 100,
        startTime: legacyData.timestamp,
        endTime: legacyData.completedAt,
        timeSpent: 10 * 60,
        submissionTimestamp: legacyData.completedAt,
        details: legacyData.r2Details
      });

      legacyData.r2Details.forEach((detail: any, index: number) => {
        mcqResponses.push({
          questionId: `r2_${index}`,
          selectedOption: detail.selected || "",
          correctOption: detail.correct,
          marksAwarded: detail.isCorrect ? 1 : (detail.selected ? -0.25 : 0),
          timeSpent: 0,
          questionStatus: detail.isCorrect ? 'CORRECT' : (detail.selected ? 'WRONG' : 'UNATTEMPTED'),
          submissionTimestamp: legacyData.completedAt
        });
      });
    }

    // Round 3
    roundResults.push({
      roundNumber: 3,
      attemptedQuestions: 2,
      correctAnswers: 0, // Descriptive, no correct/wrong
      wrongAnswers: 0,
      unattemptedQuestions: 0,
      marksObtained: legacyData.roundScores?.round3 || 0,
      totalMarks: 10,
      percentage: ((legacyData.roundScores?.round3 || 0) / 10) * 100,
      startTime: legacyData.timestamp,
      endTime: legacyData.completedAt,
      timeSpent: 10 * 60,
      submissionTimestamp: legacyData.completedAt,
      details: legacyData.r3Details
    });

    // Round 4
    if (legacyData.r4Details) {
      const isCoding = legacyData.r4Details.some((d: any) => d.type === 'coding');
      roundResults.push({
        roundNumber: 4,
        attemptedQuestions: legacyData.r4Details.length,
        correctAnswers: isCoding ? legacyData.r4Details.filter((d: any) => d.passed).length : legacyData.r4Details.filter((d: any) => d.isCorrect).length,
        wrongAnswers: isCoding ? 0 : legacyData.r4Details.filter((d: any) => d.selected && !d.isCorrect).length,
        unattemptedQuestions: isCoding ? 0 : legacyData.r4Details.filter((d: any) => !d.selected).length,
        marksObtained: legacyData.roundScores?.round4 || 0,
        totalMarks: isCoding ? 60 : 40,
        percentage: ((legacyData.roundScores?.round4 || 0) / (isCoding ? 60 : 40)) * 100,
        startTime: legacyData.timestamp,
        endTime: legacyData.completedAt,
        timeSpent: isCoding ? 45 * 60 : 20 * 60,
        submissionTimestamp: legacyData.completedAt,
        details: legacyData.r4Details
      });

      if (isCoding) {
        legacyData.r4Details.forEach((detail: any, index: number) => {
          codingSubmissions.push({
            questionId: `r4_${index}`,
            questionTitle: detail.title,
            questionDifficulty: "HARD",
            studentCode: detail.code || "",
            selectedLanguage: detail.language || "",
            visibleTestcaseResults: [],
            hiddenTestcaseResults: detail.results || [],
            passedTestcaseCount: detail.passed ? 1 : 0,
            failedTestcaseCount: detail.passed ? 0 : 1,
            runtime: 0,
            memory: 0,
            submissionTimestamp: legacyData.completedAt,
            finalVerdict: detail.passed ? 'ACCEPTED' : 'WRONG_ANSWER'
          });
        });
      } else {
        legacyData.r4Details.forEach((detail: any, index: number) => {
          mcqResponses.push({
            questionId: `r4_${index}`,
            selectedOption: detail.selected || "",
            correctOption: detail.correct,
            marksAwarded: detail.isCorrect ? 2 : (detail.selected ? -0.5 : 0),
            timeSpent: 0,
            questionStatus: detail.isCorrect ? 'CORRECT' : (detail.selected ? 'WRONG' : 'UNATTEMPTED'),
            submissionTimestamp: legacyData.completedAt
          });
        });
      }
    }

    // Proctoring logs
    const proctoringLogs: ProctoringLog[] = (legacyData.violations || []).map((violation: string) => ({
      eventType: "VIOLATION",
      message: violation,
      timestamp: legacyData.completedAt,
      severity: violation.includes("TERMINATED") ? 'CRITICAL' : 'MEDIUM'
    }));

    // Exam result
    const examResult: ExamResult = {
      examId: examId,
      studentId: email,
      totalScore: legacyData.totalScore || 0,
      qualificationStatus: (legacyData.totalScore || 0) >= 85 ? 'QUALIFIED' : (legacyData.isCheating ? 'TERMINATED' : 'FAILED'),
      submissionType: legacyData.submissionType === "TERMINATED" ? 'TERMINATED' : 'MANUAL',
      completedAt: legacyData.completedAt,
      roundScores: legacyData.roundScores || { round1: 0, round2: 0, round3: 0, round4: 0 },
      analytics: {
        totalQuestionsAttempted: roundResults.reduce((sum, r) => sum + r.attemptedQuestions, 0),
        codingAccuracy: codingSubmissions.length > 0 ? (codingSubmissions.filter(s => s.finalVerdict === 'ACCEPTED').length / codingSubmissions.length) * 100 : 0,
        testcasePassPercentage: 0, // Not available in legacy
        runtimePerformance: 0,
        memoryPerformance: 0
      },
      securityMeta: legacyData.securityMeta || {
        totalViolations: legacyData.violations?.length || 0,
        tabSwitches: 0,
        aiProbability: 0,
        suspicionScore: 0,
        humanConfidence: 100
      }
    };

    await storeCompleteExamResults(email, {
      profile: studentProfile,
      roundResults,
      codingSubmissions,
      mcqResponses,
      proctoringLogs,
      examResult
    });

  } catch (error) {
    console.error("Migration to new storage format failed:", error);
  }
}; 

let isUploadingFrame = false;
export const uploadLiveFrame = async (email: string, blob: Blob) => {
  if (firebaseConfig.projectId === "dummy" || isUploadingFrame) return;
  
  isUploadingFrame = true;
  try {
    const storageRef = ref(storage, `live_frames/${email}.jpg`);
    await retryAsyncOperation(async () => {
      await uploadBytes(storageRef, blob);
    }, 1, 200);
  } catch (error: any) {
    console.warn("Firebase Storage live frame upload failed gracefully:", error?.message || error);
  } finally {
    isUploadingFrame = false;
  }
};



export const registerCandidateFirebase = async (email: string, passKey: string, profile: any) => {
  if (!email) throw new Error("CANDIDATE_EMAIL_REQUIRED");
  const profileWithDomainPlan = enrichProfileWithDomainPlan(profile);
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    const validLogins = JSON.parse(localStorage.getItem("geonixa_valid_logins") || "{}");
    const profileData = JSON.parse(localStorage.getItem("geonixa_student_profiles") || "{}");
    validLogins[email] = passKey;
    profileData[email] = profileWithDomainPlan;
    localStorage.setItem("geonixa_valid_logins", JSON.stringify(validLogins));
    localStorage.setItem("geonixa_student_profiles", JSON.stringify(profileData));
    return;
  }
  try {
    await setDoc(doc(collection(db, "valid_logins"), email), { passKey });
    await setDoc(doc(collection(db, "student_profiles"), email), { ...profileWithDomainPlan, isRegistered: true }, { merge: true });
  } catch (error) {
    console.error("Firebase register failed:", error);
  }
};

export const verifyCandidateFirebase = async (email: string, passKey: string) => {
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    const validLogins = JSON.parse(localStorage.getItem("geonixa_valid_logins") || "{}");
    const submissions = JSON.parse(localStorage.getItem("geonixa_submissions") || "{}");
    const profiles = JSON.parse(localStorage.getItem("geonixa_student_profiles") || "{}");

    if (!validLogins[email]) return "NOT_FOUND";
    if (submissions[email]) return "COMPLETED"; // Lockout if already submitted
    if (validLogins[email] !== passKey) return "INVALID_PASS";
    if (localStorage.getItem(`geonixa_passkey_expired_${email}`) === "true") return "SLOT_EXPIRED";

    const profile = profiles[email];
    const slotValidation = validateExamSlot(profile);
    if (slotValidation.status === "EXPIRED") {
      localStorage.setItem(`geonixa_passkey_expired_${email}`, "true");
      return "SLOT_EXPIRED";
    }
    if (slotValidation.status === "PENDING") return "SLOT_PENDING";
    if (slotValidation.status !== "ACTIVE") return "SLOT_INVALID";

    return "SUCCESS";
  }

  try {
    // 1. Check if they have already submitted
    const subDoc = await getDoc(doc(collection(db, "exam_submissions"), email));
    if (subDoc.exists()) return "COMPLETED";

    // 2. Verify credentials
    const d = await getDoc(doc(collection(db, "valid_logins"), email));
    if (!d.exists()) return "NOT_FOUND";
    if (d.data().passKey !== passKey) return "INVALID_PASS";
    if (d.data().passKeyExpired) return "SLOT_EXPIRED";

    const profileDoc = await getDoc(doc(collection(db, "student_profiles"), email));
    if (!profileDoc.exists()) return "PROFILE_MISSING";

    const profile = profileDoc.data();
    const slotValidation = validateExamSlot(profile);

    if (slotValidation.status === "EXPIRED") {
      await expireCandidatePassKey(email, "SLOT_EXPIRED");
      return "SLOT_EXPIRED";
    }
    if (slotValidation.status === "PENDING") return "SLOT_PENDING";
    if (slotValidation.status !== "ACTIVE") return "SLOT_INVALID";

    return "SUCCESS";
  } catch (e) {
    console.error("Verification error:", e);
    return "ERROR";
  }
};

export const getCandidateProfile = async (email: string) => {
  if (!email) return null;
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    const profiles = JSON.parse(localStorage.getItem("geonixa_student_profiles") || "{}");
    return profiles[email] || null;
  }
  try {
    const d = await getDoc(doc(collection(db, "student_profiles"), email));
    return d.exists() ? d.data() : null;
  } catch (e) {
    return null;
  }
};

export const deleteCandidateData = async (email: string) => {
  if (!email) return;

  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    const profiles = JSON.parse(localStorage.getItem("geonixa_student_profiles") || "{}");
    const submissions = JSON.parse(localStorage.getItem("geonixa_submissions") || "{}");
    const logins = JSON.parse(localStorage.getItem("geonixa_valid_logins") || "{}");
    
    delete profiles[email];
    delete submissions[email];
    delete logins[email];

    localStorage.setItem("geonixa_student_profiles", JSON.stringify(profiles));
    localStorage.setItem("geonixa_submissions", JSON.stringify(submissions));
    localStorage.setItem("geonixa_valid_logins", JSON.stringify(logins));
    return;
  }

  try {
    const { deleteDoc, doc, collection, query, where, getDocs, writeBatch } = await import("firebase/firestore");
    
    // 1. Direct ID based deletions
    const basicDeletes = [
      deleteDoc(doc(db, "student_profiles", email)),
      deleteDoc(doc(db, "exam_submissions", email)),
      deleteDoc(doc(db, "valid_logins", email)),
      deleteDoc(doc(db, "students", email))
    ];

    // 2. Query based deletions for all related collections
    const collectionsToPurge = [
      "examResults",
      "mcqResponses",
      "codingSubmissions",
      "roundResults",
      "proctoringLogs"
    ];

    const purgePromises = collectionsToPurge.map(async (colName) => {
      const q = query(collection(db, colName), where("studentId", "==", email));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return;
      
      const batch = writeBatch(db);
      snapshot.forEach((d) => {
        batch.delete(d.ref);
      });
      return batch.commit();
    });

    await Promise.all([...basicDeletes, ...purgePromises]);
    console.log(`Successfully purged all data for ${email}`);
  } catch (e) {
    console.error("Purge Error:", e);
    throw e;
  }
};

export const fetchAllDashboardData = async () => {
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    return {
      submissions: JSON.parse(localStorage.getItem("geonixa_submissions") || "{}"),
      logins: JSON.parse(localStorage.getItem("geonixa_valid_logins") || "{}"),
      profiles: JSON.parse(localStorage.getItem("geonixa_student_profiles") || "{}")
    };
  }

  let submissions: Record<string, any> = {};
  let logins: Record<string, string> = {};
  let profiles: Record<string, any> = {};

  try {
    const subSnap = await getDocs(collection(db, "exam_submissions"));
    subSnap.forEach(doc => submissions[doc.id] = doc.data());

    const logSnap = await getDocs(collection(db, "valid_logins"));
    logSnap.forEach(doc => logins[doc.id] = doc.data().passKey);

    const profSnap = await getDocs(collection(db, "student_profiles"));
    profSnap.forEach(doc => profiles[doc.id] = doc.data());
  } catch (e) {
    console.error("Dashboard fetch error:", e);
  }

  return { submissions, logins, profiles };
};

export const deleteCandidateFirebase = async (email: string) => {
  if (!email) return;
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    const newSubs = JSON.parse(localStorage.getItem("geonixa_submissions") || "{}");
    delete newSubs[email];
    localStorage.setItem("geonixa_submissions", JSON.stringify(newSubs));

    const newRegs = JSON.parse(localStorage.getItem("geonixa_valid_logins") || "{}");
    delete newRegs[email];
    localStorage.setItem("geonixa_valid_logins", JSON.stringify(newRegs));

    const oldProfs = JSON.parse(localStorage.getItem("geonixa_student_profiles") || "{}");
    delete oldProfs[email];
    localStorage.setItem("geonixa_student_profiles", JSON.stringify(oldProfs));
    return;
  }

  try {
    const profileRef = doc(collection(db, "student_profiles"), email);
    const profileDoc = await getDoc(profileRef);
    
    if (profileDoc.exists()) {
      const slotLabel = profileDoc.data().slot;
      const slotMap: Record<string, string> = {
        "10:00 AM - 11:15 AM": "SLOT_1",
        "11:45 AM - 01:00 PM": "SLOT_2",
        "02:45 PM - 04:00 PM": "SLOT_3",
        "05:30 PM - 06:45 PM": "SLOT_4",
        "07:00 PM - 08:15 PM": "SLOT_5",
        "08:30 PM - 10:00 PM": "SLOT_6"
      };
      
      const internalSlotId = slotMap[slotLabel] || "SLOT_1";
      const slotDocRef = doc(db, "meta", "slots");
      
      // Use Transaction to safely restore slot capacity
      await runTransaction(db, async (transaction) => {
        const slotDoc = await transaction.get(slotDocRef);
        if (slotDoc.exists()) {
          const currentData = slotDoc.data();
          const currentCount = currentData[internalSlotId] || 0;
          if (currentCount > 0) {
            transaction.set(slotDocRef, { ...currentData, [internalSlotId]: currentCount - 1 }, { merge: true });
          }
        }
        
        // Purge identity records inside the transaction
        transaction.delete(doc(collection(db, "exam_submissions"), email));
        transaction.delete(doc(collection(db, "valid_logins"), email));
        transaction.delete(profileRef);
      });
    } else {
      // Fallback purge if profile doesn't exist
      await deleteDoc(doc(collection(db, "exam_submissions"), email));
      await deleteDoc(doc(collection(db, "valid_logins"), email));
    }
  } catch (e) {
    console.error("Delete & Slot Restore failed:", e);
  }
};
export const SLOT_CONFIG = {
  "SLOT_1": { id: "SLOT_1", label: "10:00 AM - 11:15 AM", start: "10:00", end: "11:15" },
  "SLOT_2": { id: "SLOT_2", label: "11:45 AM - 01:00 PM", start: "11:45", end: "13:00" },
  "SLOT_3": { id: "SLOT_3", label: "02:45 PM - 04:00 PM", start: "14:45", end: "16:00" },
  "SLOT_4": { id: "SLOT_4", label: "05:30 PM - 06:45 PM", start: "17:30", end: "18:45" },
  "SLOT_5": { id: "SLOT_5", label: "07:00 PM - 08:15 PM", start: "19:00", end: "20:15" },
  "SLOT_6": { id: "SLOT_6", label: "08:30 PM - 10:00 PM", start: "20:30", end: "22:00" },
};

export const getSlotAvailability = async () => {
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("geonixa_slots") || JSON.stringify({
      "SLOT_1": 0, "SLOT_2": 0, "SLOT_3": 0, "SLOT_4": 0, "SLOT_5": 0, "SLOT_6": 0
    }));
  }
  try {
    const d = await getDoc(doc(db, "meta", "slots"));
    if (!d.exists()) return { "SLOT_1": 0, "SLOT_2": 0, "SLOT_3": 0, "SLOT_4": 0, "SLOT_5": 0, "SLOT_6": 0 };
    return d.data();
  } catch (e) {
    return { "SLOT_1": 0, "SLOT_2": 0, "SLOT_3": 0, "SLOT_4": 0, "SLOT_5": 0, "SLOT_6": 0 };
  }
};

export const allocateSlotWithTransaction = async (
  slotId: string, 
  email: string, 
  profileData: any, 
  passKey: string
) => {
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    const slots = JSON.parse(localStorage.getItem("geonixa_slots") || JSON.stringify({
      "SLOT_1": 0, "SLOT_2": 0, "SLOT_3": 0, "SLOT_4": 0, "SLOT_5": 0, "SLOT_6": 0
    }));
    if (slots[slotId] >= 25) throw new Error("SLOT_FULL");
    slots[slotId]++;
    localStorage.setItem("geonixa_slots", JSON.stringify(slots));
    await registerCandidateFirebase(email, passKey, { ...profileData, slot: slotId });
    return true;
  }

  const slotRef = doc(db, "meta", "slots");
  const validLoginsRef = doc(db, "valid_logins", email);
  const profileRef = doc(db, "student_profiles", email);
  const plannedProfileData = enrichProfileWithDomainPlan({ ...profileData, slot: slotId });

  await runTransaction(db, async (transaction) => {
    const slotDoc = await transaction.get(slotRef);
    if (!slotDoc.exists()) {
      throw new Error("Slot meta document does not exist!");
    }

    const currentData = slotDoc.data();
    const currentCount = currentData[slotId] || 0;

    if (currentCount >= 25) {
      throw new Error("SLOT_FULL");
    }

    transaction.set(slotRef, { ...currentData, [slotId]: currentCount + 1 }, { merge: true });

    transaction.set(validLoginsRef, {
      email,
      passKey,
      role: "student",
      isActive: true,
      lastLogin: null
    });

    transaction.set(profileRef, plannedProfileData, { merge: true });
  });
};

export const updateSlotTransferTransaction = async (oldSlotLabel: string, newSlotLabel: string) => {
  if (firebaseConfig.projectId === "dummy") return;
  
  const slotMap: Record<string, string> = {
    "10:00 AM - 11:15 AM": "SLOT_1",
    "11:45 AM - 01:00 PM": "SLOT_2",
    "02:45 PM - 04:00 PM": "SLOT_3",
    "05:30 PM - 06:45 PM": "SLOT_4",
    "07:00 PM - 08:15 PM": "SLOT_5",
    "08:30 PM - 10:00 PM": "SLOT_6"
  };
  
  const oldId = slotMap[oldSlotLabel];
  const newId = slotMap[newSlotLabel];
  
  if (!oldId || !newId || oldId === newId) return;

  const slotRef = doc(db, "meta", "slots");
  
  await runTransaction(db, async (transaction) => {
    const slotDoc = await transaction.get(slotRef);
    if (slotDoc.exists()) {
      const currentData = slotDoc.data();
      const oldVal = currentData[oldId] || 0;
      const newVal = currentData[newId] || 0;
      
      if (newVal >= 25) {
        throw new Error("NEW_SLOT_FULL");
      }
      
      transaction.set(slotRef, {
        ...currentData,
        [oldId]: Math.max(0, oldVal - 1),
        [newId]: newVal + 1
      }, { merge: true });
    }
  });
};

export const recalibrateSlotCapacities = async () => {
  if (firebaseConfig.projectId === "dummy") return;
  
  console.log("[SYSTEM] Starting Deep Data Recalibration...");
  
  const profilesSnap = await getDocs(collection(db, "student_profiles"));
  const counts: Record<string, number> = { "SLOT_1": 0, "SLOT_2": 0, "SLOT_3": 0, "SLOT_4": 0, "SLOT_5": 0, "SLOT_6": 0 };
  
  const slotMap: Record<string, string> = {
    "10:00 AM - 11:15 AM": "SLOT_1",
    "11:45 AM - 01:00 PM": "SLOT_2",
    "02:45 PM - 04:00 PM": "SLOT_3",
    "05:30 PM - 06:45 PM": "SLOT_4",
    "07:00 PM - 08:15 PM": "SLOT_5",
    "08:30 PM - 10:00 PM": "SLOT_6"
  };

  profilesSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.slot) {
      if (counts[data.slot] !== undefined) {
        counts[data.slot]++;
      } else if (slotMap[data.slot]) {
        counts[slotMap[data.slot]]++;
      }
    }
  });

  // Update the master slot document
  await setDoc(doc(db, "meta", "slots"), counts);
  
  console.log("[SYSTEM] Recalibration complete. New counts:", counts);
  return counts;
};
