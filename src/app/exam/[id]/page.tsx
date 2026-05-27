"use client";

import React, { useEffect, useRef, useState, memo, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  ShieldAlert, 
  RotateCcw, 
  Globe, 
  Clock, 
  TrendingUp, 
  UserX, 
  Users, 
  X, 
  Keyboard, 
  CheckCircle2, 
  Settings, 
  Monitor,
  Eye,
  Mail,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle
} from "lucide-react";
import { SLOT_CONFIG, validateExamSlot, SlotValidationResult } from "@/lib/firebase";
import AIProctor from "@/components/proctoring/AIProctor";
import { AIProctorDebugPanel } from "@/components/proctoring/AIProctorDebugPanel";
import CodeEditor from "@/components/editor/CodeEditor";
import Logo from "@/components/brand/Logo";
import Link from 'next/link';
import { storeExamAnswers, uploadLiveFrame, db, storeCompleteExamResults, StudentProfile, RoundResult, CodingSubmission, MCQResponse, ProctoringLog, ExamResult, TestResult } from "@/lib/firebase";
import { getDoc, doc, collection, setDoc } from "firebase/firestore";
import { APTITUDE_POOL, GRAMMAR_POOL, DOMAIN_MCQ_POOL, DSA_HARD_POOL, WEB_DEV_POOL, JAVA_POOL, PYTHON_POOL, DATA_SCIENCE_POOL, TECHNICAL_ROUND_4_POOL, TYPING_TOPICS_POOL } from "@/data/examQuestions";
import { getDomainConfig, getExamPatternForDomain, isDomainMcqRound, isTechnicalDomain, normalizeDomainLabel } from "@/data/domainConfig";
import { buildUpscQuestionSet, calculateUpscNegativeScore, seededShuffle } from "@/lib/upscAssessmentEngine";

const allAptitude = APTITUDE_POOL;
const allGrammar = GRAMMAR_POOL;
const DEFAULT_SEED = 42; 

// Memoized components to prevent unnecessary re-renders on timer ticks
const MemoizedAIProctor = memo(AIProctor);
const MemoizedCodeEditor = memo(CodeEditor);

// Isolated Timer component to prevent full-page re-renders every second
const Timer = ({ initialTime, onExpiry, isActive }: { initialTime: number, onExpiry: () => void, isActive: boolean }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // Reset timer when initialTime changes (e.g. round change)
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, timeLeft <= 0]); // Add dependencies to ensure correct behavior

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return <span>{formatTime(timeLeft)}</span>;
};


type ExamState = "SYS_CHECK" | "INSTRUCTIONS" | "ACTIVE" | "SUBMITTED" | "VIOLATION_TERMINATED";

export default function ExamSession({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [warnings, setWarnings] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [examState, setExamState] = useState<ExamState>("INSTRUCTIONS");
  const hasSubmittedRef = useRef(false);
  const submitRef = useRef<any>(null);

  const [feedback, setFeedback] = useState({ stars: 0, challenges: "" });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [currentWarning, setCurrentWarning] = useState<string | null>(null);
  const [observationTimer, setObservationTimer] = useState<number | null>(null);

  useEffect(() => {
    if (observationTimer === null || observationTimer <= 0) return;
    const interval = setInterval(() => {
      setObservationTimer(prev => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [observationTimer]);


  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 4;

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: "", message: "", onConfirm: () => {} });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };
  
  const [profile, setProfile] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("geonixa_student_profile");
      if (local) return JSON.parse(local);
    }
    return { day: new Date().toISOString().split('T')[0], slot: "SLOT_1", domain: "Java" };
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Derived slot data (memoized)
  const slotData = useMemo(() => {
    if (!profile) return SLOT_CONFIG.SLOT_1;
    
    let slotKey = profile.slot;
    
    // Auto-heal legacy slot IDs or labels
    if (!SLOT_CONFIG[slotKey as keyof typeof SLOT_CONFIG]) {
       const labelMap: Record<string, string> = {
         "10:00 AM - 11:15 AM": "SLOT_1",
         "11:45 AM - 01:00 PM": "SLOT_2",
         "02:45 PM - 04:00 PM": "SLOT_3",
         "05:30 PM - 06:45 PM": "SLOT_4",
         "07:00 PM - 08:15 PM": "SLOT_5",
         "08:30 PM - 10:00 PM": "SLOT_6",
         "9-10 AM": "SLOT_1" // Legacy default
       };
       slotKey = labelMap[slotKey] || "SLOT_1";
    }

    return (SLOT_CONFIG as any)[slotKey] || SLOT_CONFIG.SLOT_1;
  }, [profile]);

  const studentDomain = normalizeDomainLabel(profile?.domain || "Java");
  const domainConfig = useMemo(() => getDomainConfig(studentDomain), [studentDomain]);
  const examPattern = useMemo(() => getExamPatternForDomain(studentDomain), [studentDomain]);
  const studentSlot = profile?.slot || "SLOT_1";

  const [slotStatus, setSlotStatus] = useState<"WAITING" | "ACTIVE" | "EXPIRED">("WAITING");
  const [slotValidation, setSlotValidation] = useState<SlotValidationResult>({ status: "MISSING", message: "Validating slot timing..." });
  const [currentTime, setCurrentTime] = useState(new Date());

  // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  // STRICT SLOT TIMING VALIDATION
  // Returns whether slot is: EXPIRED, PENDING (not yet started), or ACTIVE
  // ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!profile) return;

    const validation = validateExamSlot(profile);
    setSlotValidation(validation);

    const currentUser = typeof window !== "undefined" ? localStorage.getItem("geonixa_current_user") || "anonymous" : "anonymous";
    if (validation.status === "EXPIRED") {
      if (hasSubmittedRef.current) return;
      if (typeof window !== "undefined") {
        localStorage.setItem(`geonixa_passkey_expired_${currentUser}`, "true");
      }

      if (examState === "ACTIVE") {
        if (submitRef.current) submitRef.current("SLOT_EXPIRED");
        setExamState("VIOLATION_TERMINATED");
      } else if (examState !== "SUBMITTED" && examState !== "VIOLATION_TERMINATED") {
        setExamState("VIOLATION_TERMINATED");
      }
    }
  }, [profile, currentTime, examState]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate a session-specific seed based on the student's unique ID and Email
  const sessionSeed = useMemo(() => {
    if (profile && profile.sessionSeed) {
      return Number(profile.sessionSeed);
    }
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem("geonixa_current_user") || "" : "";
    const base = id + userEmail;
    return base.split('').reduce((acc, char) => acc + (char.charCodeAt(0) * 17), 13);
  }, [id, profile]);
  
  const isTech = isTechnicalDomain(studentDomain);
  const isMcqDomain = isDomainMcqRound(studentDomain);

  const timeLimits: Record<number, number> = useMemo(() => ({
    1: (examPattern.rounds[0].durationMinutes || 10) * 60,
    2: (examPattern.rounds[1].durationMinutes || 10) * 60,
    3: (examPattern.rounds[2].durationMinutes || 10) * 60,
    4: (examPattern.rounds[3].durationMinutes || (isTech ? 50 : 20)) * 60,
  }), [examPattern, isTech]);
  
  const [roundTimes, setRoundTimes] = useState(timeLimits);

  // Pagination States
  const [q1Index, setQ1Index] = useState(0);
  const [q2Index, setQ2Index] = useState(0);
  const [codingQuestionIndex, setCodingQuestionIndex] = useState(0);

  // MCQ Answers
  const [r1Answers, setR1Answers] = useState<Record<number, string>>({});
  const [r2Answers, setR2Answers] = useState<Record<number, string>>({});
  const [codingAnswers, setCodingAnswers] = useState<Record<number, string>>({});

  // Descriptive Writing Round States (Unique per student)
  const [studentTopics, setStudentTopics] = useState<string[]>([]);
  
  const [typingTopicIndex, setTypingTopicIndex] = useState(0);
  const [typingTexts, setTypingTexts] = useState(["", ""]);
  const [backspaceCounts, setBackspaceCounts] = useState([0, 0]);
  const [typingWarning, setTypingWarning] = useState("");

  // Coding/MCQ Round
  const [codingQuestions, setCodingQuestions] = useState<any[]>([]);
  const [r1List, setR1List] = useState<any[]>([]);
  const [r2List, setR2List] = useState<any[]>([]);
  const [codingProgress, setCodingProgress] = useState<Record<number, boolean>>({});
  const [codingSubmissions, setCodingSubmissions] = useState<Record<number, { code: string, language: string, results: any[] }>>({});

  // Recovery Hook: Restore coding submissions from localStorage for overall platform state
  useEffect(() => {
    if (codingQuestions.length > 0 && typeof window !== "undefined") {
      const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
      const restoredSubmissions: any = {};
      
      codingQuestions.forEach((_, idx) => {
        const lang = localStorage.getItem(`geonixa_judge_v3_${idx}_lang_${currentUser}`);
        if (lang) {
          const code = localStorage.getItem(`geonixa_judge_v3_${idx}_${lang}_code_${currentUser}`);
          if (code) {
            restoredSubmissions[idx] = { code, language: lang, results: [] };
          }
        }
      });
      
      if (Object.keys(restoredSubmissions).length > 0) {
        setCodingSubmissions(restoredSubmissions);
      }

      // Restore MCQ & Typing Answers (Namespaced to prevent bleeding)
      const r1Saved = localStorage.getItem(`geonixa_r1_answers_${currentUser}`);
      if (r1Saved) setR1Answers(JSON.parse(r1Saved));
      
      const r2Saved = localStorage.getItem(`geonixa_r2_answers_${currentUser}`);
      if (r2Saved) setR2Answers(JSON.parse(r2Saved));
      
      const r3Saved = localStorage.getItem(`geonixa_r3_texts_${currentUser}`);
      if (r3Saved) setTypingTexts(JSON.parse(r3Saved));

      const codingSaved = localStorage.getItem(`geonixa_coding_answers_${currentUser}`);
      if (codingSaved) setCodingAnswers(JSON.parse(codingSaved));
    }
  }, [codingQuestions, profile]);

  // ── REAL-TIME PERSISTENCE ENGINE ─────────────────────────────────────────
  const syncAnswers = useCallback(async (round: number, answers: Record<number, string>) => {
    if (typeof window === "undefined") return;
    const email = localStorage.getItem("geonixa_current_user");
    if (!email || !profile) return;

    try {
      const questionList = round === 1 ? r1List : r2List;
      await setDoc(doc(collection(db, "answerDrafts"), `${email}_${id}_round${round}`), {
        studentId: email,
        examId: id,
        round,
        domain: studentDomain,
        answers,
        answeredCount: Object.keys(answers).length,
        questionSet: questionList.map((question, index) => ({
          index,
          questionCode: question.questionCode || `${round}_${index}`,
          patternKey: question.patternKey || "standard",
          questionText: question.q,
        })),
        lastUpdated: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.error("Sync Error:", err);
    }
  }, [id, profile, r1List, r2List, studentDomain]);

  // Persist Round 1/2/3 answers on change (Namespaced & Synced)
  useEffect(() => {
    if (Object.keys(r1Answers).length > 0 && typeof window !== "undefined") {
      const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
      localStorage.setItem(`geonixa_r1_answers_${currentUser}`, JSON.stringify(r1Answers));
      syncAnswers(1, r1Answers);
    }
  }, [r1Answers, syncAnswers]);

  useEffect(() => {
    if (Object.keys(r2Answers).length > 0 && typeof window !== "undefined") {
      const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
      localStorage.setItem(`geonixa_r2_answers_${currentUser}`, JSON.stringify(r2Answers));
      syncAnswers(2, r2Answers);
    }
  }, [r2Answers, syncAnswers]);

  useEffect(() => {
    if (typingTexts.some(t => t.length > 0) && typeof window !== "undefined") {
      const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
      localStorage.setItem(`geonixa_r3_texts_${currentUser}`, JSON.stringify(typingTexts));
    }
  }, [typingTexts]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSelfie, setHasSelfie] = useState(false);
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [sysChecks, setSysChecks] = useState({
    browser: false,
    camera: false,
    mic: false,
    network: false,
  });
  const [latency, setLatency] = useState(24);
  const sessionHash = useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), []);

  const calculateSubstantialLines = (typed: string) => {
    const manualLines = typed.split('\n').filter(line => line.trim().length > 0).length;
    const charLines = Math.floor(typed.trim().length / 100);
    return Math.max(manualLines, charLines);
  };

  const calculateTypingProgress = (typed: string, source: string) => {
    const typedWords = typed.trim().split(/\s+/).filter(Boolean);
    const sourceWords = source.trim().split(/\s+/).filter(Boolean);
    let matchingWords = 0;
    for (let i = 0; i < typedWords.length; i++) {
      if (sourceWords[i] && typedWords[i].toLowerCase() === sourceWords[i].toLowerCase()) {
        matchingWords++;
      }
    }
    return matchingWords;
  };

  const handleFinalSubmit = useCallback(async (reason: string = "MANUAL_SUBMIT") => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    
    try {
      const currentUser = typeof window !== "undefined" ? localStorage.getItem("geonixa_current_user") || "anonymous" : "anonymous";
      const examId = id;
      const submissionTimestamp = new Date().toISOString();
      
      // =============================================================================
      // 1. STUDENT PROFILE
      // =============================================================================
      const studentProfile: StudentProfile = {
        studentId: currentUser,
        fullName: profile?.name || currentUser,
        email: currentUser,
        college: profile?.college || "Unknown",
        slot: slotData.label || "Unknown",
        domain: studentDomain,
        domainId: domainConfig.id,
        domainTrack: domainConfig.track,
        round4Mode: domainConfig.round4Mode,
        reportGroup: domainConfig.reportGroup,
        examPattern,
        questionAllocation: examPattern.rounds,
        registrationTimestamp: profile?.registrationTimestamp || submissionTimestamp
      };

      // =============================================================================
      // 2. ROUND-WISE RESULTS PROCESSING
      // =============================================================================
      const roundResults: RoundResult[] = [];
      const mcqResponses: MCQResponse[] = [];
      const finalCodingSubmissions: CodingSubmission[] = [];
      const proctoringLogs: ProctoringLog[] = [];

      const examStartTime = new Date(Date.now() - (45 * 60 * 1000)).toISOString(); // Approximate start time

      // ROUND 1: Aptitude Analytics
      let r1Correct = 0; let r1Wrong = 0; let r1Unattempted = 0;
      const r1Details = r1List.map((q, i) => {
        const selected = r1Answers[i];
        const isCorrect = selected === q.correctAnswer;
        const isAttempted = selected !== undefined && selected !== null && selected !== "";
        
        if (isAttempted) {
          if (isCorrect) r1Correct++; else r1Wrong++;
        } else {
          r1Unattempted++;
        }

        // Store MCQ Response
        mcqResponses.push({
          questionId: `r1_${i}`,
          roundNumber: 1,
          domain: studentDomain,
          course: studentDomain,
          questionText: q.q,
          questionCode: q.questionCode,
          patternKey: q.patternKey,
          selectedOption: selected || "",
          correctOption: q.correctAnswer,
          marksAwarded: isCorrect ? 0.5 : 0,
          timeSpent: 0, // Not tracked individually
          questionStatus: isCorrect ? 'CORRECT' : (isAttempted ? 'WRONG' : 'UNATTEMPTED'),
          submissionTimestamp
        });

        return { 
          qId: i, 
          type: 'mcq', 
          questionCode: q.questionCode,
          patternKey: q.patternKey,
          question: q.q, 
          selected: selected || null, 
          correct: q.correctAnswer, 
          isCorrect,
          isAttempted
        };
      });
      
      const r1Scoring = calculateUpscNegativeScore(r1Correct, r1Wrong);
      const r1Score = Math.max(0, r1Scoring.score * 0.5);
      roundResults.push({
        roundNumber: 1,
        roundName: "Aptitude",
        roundType: "mcq",
        domain: studentDomain,
        course: studentDomain,
        scoringRule: "Scaled scoring: 0.5 marks per correct, 3 wrong answers = -0.5 mark",
        negativePenalty: r1Scoring.penalty * 0.5,
        attemptedQuestions: r1Correct + r1Wrong,
        correctAnswers: r1Correct,
        wrongAnswers: r1Wrong,
        unattemptedQuestions: r1Unattempted,
        marksObtained: r1Score,
        totalMarks: 15,
        percentage: (r1Score / 15) * 100,
        startTime: examStartTime,
        endTime: submissionTimestamp,
        timeSpent: 10 * 60, // 10 minutes
        submissionTimestamp,
        details: r1Details
      });

      // ROUND 2: Grammar Analytics
      let r2Correct = 0; let r2Wrong = 0; let r2Unattempted = 0;
      const r2Details = r2List.map((q, i) => {
        const selected = r2Answers[i];
        const isCorrect = selected === q.correctAnswer;
        const isAttempted = selected !== undefined && selected !== null && selected !== "";
        
        if (isAttempted) {
          if (isCorrect) r2Correct++; else r2Wrong++;
        } else {
          r2Unattempted++;
        }

        // Store MCQ Response
        mcqResponses.push({
          questionId: `r2_${i}`,
          roundNumber: 2,
          domain: studentDomain,
          course: studentDomain,
          selectedOption: selected || "",
          correctOption: q.correctAnswer,
          marksAwarded: isCorrect ? 0.5 : (isAttempted ? -0.1667 : 0),
          timeSpent: 0,
          questionStatus: isCorrect ? 'CORRECT' : (isAttempted ? 'WRONG' : 'UNATTEMPTED'),
          submissionTimestamp
        });

        return { 
          qId: i, 
          type: 'mcq', 
          questionCode: q.questionCode,
          patternKey: q.patternKey,
          question: q.q, 
          selected: selected || null, 
          correct: q.correctAnswer, 
          isCorrect,
          isAttempted
        };
      });
      
      const r2Scoring = calculateUpscNegativeScore(r2Correct, r2Wrong);
      const r2Score = Math.max(0, r2Scoring.score * 0.5);
      roundResults.push({
        roundNumber: 2,
        roundName: "Grammar",
        roundType: "mcq",
        domain: studentDomain,
        course: studentDomain,
        scoringRule: "Scaled scoring: 0.5 marks per correct, 3 wrong answers = -0.5 mark",
        negativePenalty: r2Scoring.penalty * 0.5,
        attemptedQuestions: r2Correct + r2Wrong,
        correctAnswers: r2Correct,
        wrongAnswers: r2Wrong,
        unattemptedQuestions: r2Unattempted,
        marksObtained: r2Score,
        totalMarks: 15,
        percentage: (r2Score / 15) * 100,
        startTime: examStartTime,
        endTime: submissionTimestamp,
        timeSpent: 10 * 60,
        submissionTimestamp,
        details: r2Details
      });

      // ROUND 3: Descriptive Writing Analytics
      const calcTopicScore = (lines: number, bs: number) => {
        let base = lines >= 18 ? 5 : Math.floor((lines / 18) * 5);
        if (bs > 15) base -= Math.floor((bs - 15) * 0.2);
        return Math.max(0, Math.min(5, base));
      };
      const r3Lines1 = calculateSubstantialLines(typingTexts[0]);
      const r3Lines2 = calculateSubstantialLines(typingTexts[1]);
      const r3Score = calcTopicScore(r3Lines1, backspaceCounts[0]) + calcTopicScore(r3Lines2, backspaceCounts[1]);
      
      roundResults.push({
        roundNumber: 3,
        roundName: "Typing",
        roundType: "typing",
        domain: studentDomain,
        course: studentDomain,
        scoringRule: "Maximum 10 marks: 5 per typing prompt, no extra credit beyond 10",
        attemptedQuestions: 2,
        correctAnswers: 0,
        wrongAnswers: 0,
        unattemptedQuestions: 0,
        marksObtained: r3Score,
        totalMarks: 10,
        percentage: (r3Score / 10) * 100,
        startTime: examStartTime,
        endTime: submissionTimestamp,
        timeSpent: 10 * 60,
        submissionTimestamp,
        details: [
          {
            topic: studentTopics[0],
            text: typingTexts[0],
            lines: r3Lines1,
            marks: r3Lines1 >= 8 ? 5 : (r3Lines1 >= 4 ? 2 : 0)
          },
          {
            topic: studentTopics[1],
            text: typingTexts[1],
            lines: r3Lines2,
            marks: r3Lines2 >= 8 ? 5 : (r3Lines2 >= 4 ? 2 : 0)
          }
        ]
      });

      // ROUND 4: Domain Analytics (MCQ or Coding)
      let r4Score = 0;
      let r4Details: any[] = [];
      
      if (isMcqDomain) {
        // MCQ Domain Round 4
        let r4Correct = 0; let r4Wrong = 0; let r4Unattempted = 0;
        r4Details = codingQuestions.map((q, i) => {
          const selected = codingAnswers[i];
          const isCorrect = selected === q.correctAnswer;
          const isAttempted = selected !== undefined && selected !== null && selected !== "";
          
          if (isAttempted) {
            if (isCorrect) r4Correct++; else r4Wrong++;
          } else {
            r4Unattempted++;
          }

          // Store MCQ Response
          mcqResponses.push({
            questionId: `r4_${i}`,
            roundNumber: 4,
            domain: studentDomain,
            course: studentDomain,
            selectedOption: selected || "",
            correctOption: q.correctAnswer,
            marksAwarded: isCorrect ? 1.5 : (isAttempted ? -0.375 : 0),
            timeSpent: 0,
            questionStatus: isCorrect ? 'CORRECT' : (isAttempted ? 'WRONG' : 'UNATTEMPTED'),
            submissionTimestamp
          });

          return { 
            qId: i, 
            type: 'mcq', 
            question: q.q, 
            selected: selected || null, 
            correct: q.correctAnswer, 
            isCorrect,
            isAttempted
          };
        });
        r4Score = ((r4Correct * 1.5) - (r4Wrong * 0.375));
      } else {
        // Coding Domain Round 4
        r4Details = codingQuestions.map((q, i) => {
          const submission = codingSubmissions[i];
          const submissionResults = submission?.results || [];
          const allPassed = submissionResults.length > 0 && submissionResults.every((r: any) => r.passed);
          
          // Create detailed coding submission
          const codingSubmission: CodingSubmission = {
            questionId: `r4_${i}`,
            questionTitle: q.title,
            questionDifficulty: "HARD",
            domain: studentDomain,
            course: studentDomain,
            studentCode: submission?.code || "",
            selectedLanguage: submission?.language || "",
            visibleTestcaseResults: submissionResults.filter((r: any) => !r.isHidden).map((r: any) => ({
              id: r.id || `test_${Math.random()}`,
              input: r.input || "",
              expectedOutput: r.expected || "",
              actualOutput: r.actual || "",
              passed: r.passed || false,
              executionTime: r.time || 0,
              memoryUsed: r.memory || 0,
              isHidden: false
            })),
            hiddenTestcaseResults: submissionResults.filter((r: any) => r.isHidden).map((r: any) => ({
              id: r.id || `hidden_${Math.random()}`,
              input: r.input || "",
              expectedOutput: r.expected || "",
              actualOutput: r.actual || "",
              passed: r.passed || false,
              executionTime: r.time || 0,
              memoryUsed: r.memory || 0,
              isHidden: true
            })),
            passedTestcaseCount: submissionResults.filter((r: any) => r.passed).length,
            failedTestcaseCount: submissionResults.filter((r: any) => !r.passed).length,
            runtime: submission?.results?.[0]?.time || 0,
            memory: submission?.results?.[0]?.memory || 0,
            submissionTimestamp,
            finalVerdict: allPassed ? 'ACCEPTED' : 'WRONG_ANSWER'
          };
          
          finalCodingSubmissions.push(codingSubmission);
          
          return { 
            qId: i,
            type: 'coding',
            title: q.title, 
            passed: allPassed,
            code: submission?.code || "",
            language: submission?.language || "",
            results: submissionResults
          };
        });
        
        const passedTasks = r4Details.filter((d: any) => d.passed).length;
        r4Score = passedTasks * 20; // 20 marks per passed task to total 60 for 3 coding questions
      }

      roundResults.push({
        roundNumber: 4,
        roundName: isMcqDomain ? "Domain MCQ" : "Coding",
        roundType: isMcqDomain ? "domain-mcq" : "coding",
        domain: studentDomain,
        course: studentDomain,
        attemptedQuestions: isMcqDomain ? (r4Details.filter((d: any) => d.isAttempted).length) : codingQuestions.length,
        correctAnswers: isMcqDomain ? r4Details.filter((d: any) => d.isCorrect).length : r4Details.filter((d: any) => d.passed).length,
        wrongAnswers: isMcqDomain ? r4Details.filter((d: any) => d.isAttempted && !d.isCorrect).length : 0,
        unattemptedQuestions: isMcqDomain ? r4Details.filter((d: any) => !d.isAttempted).length : 0,
        marksObtained: Math.max(0, r4Score),
        totalMarks: isMcqDomain ? 40 : 60,
        percentage: (Math.max(0, r4Score) / (isMcqDomain ? 40 : 60)) * 100,
        startTime: examStartTime,
        endTime: submissionTimestamp,
        timeSpent: isMcqDomain ? 20 * 60 : 45 * 60,
        submissionTimestamp,
        details: r4Details
      });

      // =============================================================================
      // 3. PROCTORING LOGS
      // =============================================================================
      warnings.forEach(warning => {
        proctoringLogs.push({
          eventType: "VIOLATION",
          message: warning,
          timestamp: submissionTimestamp,
          severity: warning.includes("TERMINATED") ? 'CRITICAL' : (warning.includes("TAB_SWITCH") ? 'HIGH' : 'MEDIUM')
        });
      });

      // =============================================================================
      // 4. EXAM RESULT SUMMARY
      // =============================================================================
      const totalScore = r1Score + r2Score + r3Score + Math.max(0, r4Score);
      const totalViolations = warnings.length;
      const tabSwitches = warnings.filter(w => w.includes("TAB_SWITCH")).length;
      const suspicionScore = (totalViolations * 20) + (tabSwitches * 15);
      const aiProbability = Math.min(95, suspicionScore > 50 ? 80 : (suspicionScore > 20 ? 40 : 5));
      const humanConfidence = Math.max(5, 100 - aiProbability);

      const examResult: ExamResult = {
        examId,
        studentId: currentUser,
        domain: studentDomain,
        domainTrack: domainConfig.track,
        round4Mode: domainConfig.round4Mode,
        reportGroup: domainConfig.reportGroup,
        examPattern,
        totalScore,
        qualificationStatus: totalScore >= 85 ? 'QUALIFIED' : (reason === "TERMINATED" ? 'TERMINATED' : 'FAILED'),
        submissionType: reason === "TERMINATED" ? 'TERMINATED' : (reason === "AUTO_TIMEUP" ? 'AUTO_TIMEUP' : 'MANUAL'),
        completedAt: submissionTimestamp,
        roundScores: {
          round1: r1Score,
          round2: r2Score,
          round3: r3Score,
          round4: Math.max(0, r4Score)
        },
        analytics: {
          totalQuestionsAttempted: roundResults.reduce((sum, r) => sum + r.attemptedQuestions, 0),
          codingAccuracy: finalCodingSubmissions.length > 0 ? (finalCodingSubmissions.filter(s => s.finalVerdict === 'ACCEPTED').length / finalCodingSubmissions.length) * 100 : 0,
          testcasePassPercentage: finalCodingSubmissions.length > 0 ? (finalCodingSubmissions.reduce((sum, s) => sum + s.passedTestcaseCount, 0) / finalCodingSubmissions.reduce((sum, s) => sum + (s.passedTestcaseCount + s.failedTestcaseCount), 0)) * 100 : 0,
          runtimePerformance: finalCodingSubmissions.length > 0 ? finalCodingSubmissions.reduce((sum, s) => sum + s.runtime, 0) / finalCodingSubmissions.length : 0,
          memoryPerformance: finalCodingSubmissions.length > 0 ? finalCodingSubmissions.reduce((sum, s) => sum + s.memory, 0) / finalCodingSubmissions.length : 0
        },
        securityMeta: {
          totalViolations,
          tabSwitches,
          aiProbability,
          suspicionScore,
          humanConfidence
        }
      };

      // =============================================================================
      // 5. STORE COMPLETE RESULTS ATOMICALLY
      // =============================================================================
      await storeCompleteExamResults(currentUser, {
        profile: studentProfile,
        roundResults,
        codingSubmissions: finalCodingSubmissions,
        mcqResponses,
        proctoringLogs,
        examResult
      });

      // =============================================================================
      // 6. LEGACY COMPATIBILITY (for backward compatibility)
      // =============================================================================
      await storeExamAnswers(currentUser, { 
        name: profile?.name || currentUser,
        domain: studentDomain,
        domainTrack: domainConfig.track,
        round4Mode: domainConfig.round4Mode,
        reportGroup: domainConfig.reportGroup,
        examPattern,
        questionAllocation: examPattern.rounds,
        college: profile?.college || "Unknown",
        totalScore,
        roundScores: examResult.roundScores,
        violations: warnings,
        isCheating: aiProbability > 70 || reason === "TERMINATED",
        submissionType: reason,
        completedAt: submissionTimestamp,
        r1Details,
        r2Details,
        r3Details: { 
          topic1: studentTopics[0], text1: typingTexts[0], lines1: r3Lines1, 
          topic2: studentTopics[1], text2: typingTexts[1], lines2: r3Lines2 
        },
        r4Details,
        securityMeta: examResult.securityMeta,
        timestamp: Date.now()
      });

      // =============================================================================
      // 7. PREPARE & ARCHIVE ASSESSMENT REPORT (Admin will dispatch)
      // NOTE: Do NOT send the report email automatically. Archive the report
      // so admin can review and dispatch it manually from the Admin Portal.
      // =============================================================================
      try {
        await fetch('/api/results/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateEmail: currentUser,
            candidateName: profile?.name || currentUser
          })
        });
        
        // Send Completion Email
        await fetch('/api/communication/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'COMPLETION',
            candidateEmail: currentUser,
            candidateName: profile?.name || currentUser
          })
        });
      } catch (e) {
        console.error("Failed to archive assessment report or send completion email:", e);
      }

      console.log("✅ Exam results stored successfully with enterprise-grade architecture");
    } catch (e) { 
      console.error("❌ Final storage failed:", e);
      // Even if storage fails, mark as submitted to prevent re-submission
    }

    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
      localStorage.setItem(`geonixa_exam_status_${currentUser}`, "true");
      if (reason !== "TERMINATED") {
        localStorage.removeItem(`geonixa_terminated_${currentUser}`);
      }
    }

    if (reason !== "TERMINATED") {
      setCurrentWarning(null);
      setExamState("SUBMITTED");
    } else {
      setExamState("VIOLATION_TERMINATED");
    }

    if (typeof document !== "undefined" && document.fullscreenElement) document.exitFullscreen().catch(() => { });
  }, [r1List, r1Answers, r2List, r2Answers, typingTexts, codingQuestions, codingAnswers, codingSubmissions, codingProgress, warnings, profile, studentDomain, domainConfig, examPattern, isMcqDomain, examState, studentTopics, id, slotData]);

  // --- SECURITY SENSORS & SLOT WATCHDOG ---
  useEffect(() => {
    const checkPreviousSubmission = async () => {
      const email = typeof window !== 'undefined' ? localStorage.getItem("geonixa_current_user") : null;
      if (email && email !== "anonymous") {
        try {
          const { isFirebaseConfigured } = await import("@/lib/firebase");
          
          if (!isFirebaseConfigured) {
            // DUMMY MODE: Use localStorage exclusively
            const submissions = JSON.parse(localStorage.getItem("geonixa_submissions") || "{}");
            if (submissions[email]) {
              setExamState("SUBMITTED");
              setIsProfileLoading(false);
              return;
            }
            const local = localStorage.getItem("geonixa_student_profile");
            if (local) setProfile(JSON.parse(local));
            else setProfile({ day: new Date().toISOString().split('T')[0], slot: "SLOT_1", domain: "Java" });
            setIsProfileLoading(false);
            return;
          }

          // 1. Check if already submitted or terminated (Checking both legacy and professional collections)
          const subRef = doc(collection(db, "exam_submissions"), email);
          const resultsRef = doc(collection(db, "examResults"), `${email}_${id}`);
          const [subSnap, resultsSnap] = await Promise.all([
            getDoc(subRef),
            getDoc(resultsRef)
          ]);
          
          const localStatus = localStorage.getItem(`geonixa_exam_status_${email}`);
          const isTerminated = localStorage.getItem(`geonixa_terminated_${email}`);

          if (subSnap.exists() || resultsSnap.exists()) {
            let nextState: ExamState = "SUBMITTED";
            if (resultsSnap.exists()) {
              const resultData = resultsSnap.data();
              if (resultData?.submissionType === "TERMINATED") {
                nextState = "VIOLATION_TERMINATED";
              }
            }
            if (nextState === "SUBMITTED" && isTerminated === "true") {
              localStorage.removeItem(`geonixa_terminated_${email}`);
            }
            setExamState(nextState);
            setIsProfileLoading(false);
            return;
          } else {
            // BACKEND RECORD NOT FOUND: Unlock the exam if it was locked locally
            if (localStatus === "true" || isTerminated === "true") {
              console.log("Admin has purged previous records. Unlocking exam session...");
              localStorage.removeItem(`geonixa_exam_status_${email}`);
              localStorage.removeItem(`geonixa_terminated_${email}`);
              // Also clear old cached answers to ensure a fresh start
              localStorage.removeItem(`geonixa_r1_answers_${email}`);
              localStorage.removeItem(`geonixa_r2_answers_${email}`);
              localStorage.removeItem(`geonixa_r3_texts_${email}`);
              localStorage.removeItem(`geonixa_coding_answers_${email}`);
            }
          }

          // 2. Hydrate profile from Firestore (Primary Source)
          const profRef = doc(collection(db, "student_profiles"), email);
          const profSnap = await getDoc(profRef);
          if (profSnap.exists()) {
            const data = profSnap.data();
            if (!data.sessionSeed) {
              const newSeed = Math.floor(Math.random() * 1000000) + 1;
              data.sessionSeed = newSeed;
              const { updateDoc } = await import("firebase/firestore");
              await updateDoc(profRef, { sessionSeed: newSeed });
            }
            setProfile(data);
            localStorage.setItem("geonixa_student_profile", JSON.stringify(data));
          } else {
            // Fallback to localStorage if Firestore fails but data exists locally
            const local = localStorage.getItem("geonixa_student_profile");
            let data = local ? JSON.parse(local) : null;
            if (!data) {
              data = { day: new Date().toISOString().split('T')[0], slot: "SLOT_1", domain: "Java" };
            }
            if (!data.sessionSeed) {
              data.sessionSeed = Math.floor(Math.random() * 1000000) + 1;
            }
            setProfile(data);
            localStorage.setItem("geonixa_student_profile", JSON.stringify(data));
          }
        } catch (e) {
          console.error("Security check failure:", e);
          // Last resort fallback
          const local = localStorage.getItem("geonixa_student_profile");
          let data = local ? JSON.parse(local) : null;
          if (!data) {
            data = { day: new Date().toISOString().split('T')[0], slot: "SLOT_1", domain: "Java" };
          }
          if (!data.sessionSeed) {
            data.sessionSeed = Math.floor(Math.random() * 1000000) + 1;
          }
          setProfile(data);
          localStorage.setItem("geonixa_student_profile", JSON.stringify(data));
        } finally {
          setIsProfileLoading(false);
        }
      } else {
        setIsProfileLoading(false);
      }
    };
    checkPreviousSubmission();
  }, []);

  useEffect(() => {
    submitRef.current = handleFinalSubmit;
  }, [handleFinalSubmit]);

  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    hasAutoSubmitted.current = false;
  }, [currentRound]);

  // ── PROCTORING & INTEGRITY HUB ───────────────────────────────────────────
  const [lastWarningTime, setLastWarningTime] = useState<number | null>(null);

  const lastViolationTimeRef = useRef<number>(0);

  const handleProctorViolation = useCallback((type: string, message: string) => {
    if (hasSubmittedRef.current) return;
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 2000 && type !== "TERMINATED" && type !== "TAB_SWITCH" && type !== "SCREENSHOT") {
      return; 
    }
    lastViolationTimeRef.current = now;

    const currentUser = typeof window !== "undefined" ? (localStorage.getItem("geonixa_current_user") || "anonymous") : "anonymous";

    // INSTANT TERMINATION RULES (Severe Violations)
    if (type === "TERMINATED" || type === "TAB_SWITCH" || type === "FULLSCREEN_EXIT" || type === "WINDOW_MINIMIZE" || type === "SCREENSHOT" || type === "DEVTOOLS" || type === "EXTENSION_CHEAT") {
      setCurrentWarning(`🚫 INSTANT TERMINATION: ${message || "Critical integrity breach detected."}. Assessment auto-submitting...`);
      if (typeof document !== "undefined" && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (typeof window !== "undefined") {
        localStorage.setItem(`geonixa_exam_status_${currentUser}`, "true");
        localStorage.setItem(`geonixa_terminated_${currentUser}`, "true");
      }
      if (submitRef.current) submitRef.current("TERMINATED");
      setExamState("VIOLATION_TERMINATED");

      fetch('/api/communication/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TERMINATION',
          candidateEmail: currentUser,
          candidateName: profile?.name || "Candidate",
          status: `Instant Termination (${type}): ${message}`
        })
      }).catch(err => console.error("Failed to send termination email", err));
      return;
    }

    // FINAL WARNING 3 RULE
    if (type === "WARNING_3") {
      setCurrentWarning(`🚫 FINAL WARNING (3/3): ${message}. Assessment auto-submitting...`);
      if (typeof document !== "undefined" && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (typeof window !== "undefined") {
        localStorage.setItem(`geonixa_exam_status_${currentUser}`, "true");
        localStorage.setItem(`geonixa_terminated_${currentUser}`, "true");
      }
      if (submitRef.current) submitRef.current("TERMINATED");
      setExamState("VIOLATION_TERMINATED");
      // WARNING_3 triggers an auto-termination flow locally; external termination
      // notification/email should only be dispatched for explicit/official terminations.
      // Do not send an automated termination email here to avoid false positives.
      return;
    }

    // WARNING 1 & 2 PROTOCOL
    const timestamp = new Date().toLocaleTimeString();
    const violationLog = `[${timestamp}] ${type}: ${message}`;
    
    setWarnings(prev => [...prev, violationLog]);
    const wNum = type === 'WARNING_1' ? '1 of 3' : '2 of 3';
    setCurrentWarning(`⚠ INTEGRITY NOTICE (${wNum}): ${message}`);
    
    setTimeout(() => setCurrentWarning(null), 10000);
  }, [profile]);

  const performIntegrityCheck = useCallback((code: string, results: any[]) => {
    const hardcodePatterns = [
      /if\s*\(.*input.*==/i,
      /switch\s*\(.*input/i,
      /return\s*['"].*['"]\s*if/i
    ];
    
    const isHardcoded = hardcodePatterns.some(p => p.test(code));
    const allPassed = results.every(r => r.passed);
    
    if (isHardcoded && allPassed) {
      handleProctorViolation("INTEGRITY_RISK", "Heuristic analysis suggests potential hardcoded logic. Please use algorithmic solutions.");
    }
  }, [handleProctorViolation]);

  const submitSection = (round: number) => {
    if (round < totalRounds) {
      setCurrentRound(round + 1);
      // Reset indices for the next round
      if (round === 1) setQ2Index(0);
      if (round === 2) setTypingTopicIndex(0);
      if (round === 3) setCodingQuestionIndex(0);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinalSubmit();
    }
  };

  const handleRoundExpiry = () => {
    if (hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;

    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
      localStorage.setItem(`geonixa_round_${currentRound}_auto_submitted_${currentUser}`, new Date().toISOString());
    }

    submitSection(currentRound);
  };

  // Round 3 Auto-switch: Switch topics at exactly 5 minutes remaining
  const [r3SubTimer, setR3SubTimer] = useState(300); // 5 minutes for Topic 1
  
  useEffect(() => {
    if (currentRound === 3 && examState === "ACTIVE") {
      const interval = setInterval(() => {
        setR3SubTimer(prev => {
          if (prev <= 1) {
            if (typingTopicIndex === 0) {
              setTypingTopicIndex(1);
              setTypingWarning("TIME ALERT: Auto-switching to Topic 02 for the final 5 minutes!");
              setTimeout(() => setTypingWarning(""), 5000);
              return 300; // Reset for Topic 2
            } else {
              submitSection(3);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentRound, examState, typingTopicIndex]);



  // Auto-switch Topic in Round 3 at exactly 5 minutes (300 seconds) left
  // Round 3 Topic Auto-switch moved to Timer or simplified


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
      const isSubmitted = localStorage.getItem(`geonixa_exam_status_${currentUser}`);
      
      // Admin Bypass for repeat exams
      if (currentUser === "talent@geonixa.com") return;
      
      if (isSubmitted === "true" && examState === "INSTRUCTIONS") {
        // Backend Validation: Check if Admin deleted the submission
        const verifySubmission = async () => {
          try {
            const docSnap = await getDoc(doc(collection(db, "exam_submissions"), currentUser));
            if (!docSnap.exists()) {
              // Admin deleted the data! Unlock the exam.
              localStorage.removeItem(`geonixa_exam_status_${currentUser}`);
              // Clear previous cached answers just in case
              localStorage.removeItem(`geonixa_r1_answers_${currentUser}`);
              localStorage.removeItem(`geonixa_r2_answers_${currentUser}`);
              localStorage.removeItem(`geonixa_r3_texts_${currentUser}`);
            } else {
              setExamState("SUBMITTED");
            }
          } catch (e) {
            // Fallback to submitted if network fails
            setExamState("SUBMITTED");
          }
        };
        verifySubmission();
      }
    }
  }, [examState]);

  useEffect(() => {
    if (examState === "ACTIVE") {
      const interval = setInterval(() => {
        setLatency(Math.floor(Math.random() * (35 - 12) + 12));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [examState]);

  useEffect(() => {
    if (examState === "SUBMITTED" || examState === "VIOLATION_TERMINATED") {
      if (typeof window !== 'undefined') {
        const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
        localStorage.setItem(`geonixa_exam_status_${currentUser}`, "true");
      }
    }
  }, [examState]);

  useEffect(() => {
    if (isProfileLoading || !profile) return;
    
    // ── UNIQUE QUESTION DISTRIBUTION ENGINE ──────────────────────────────────
    // Every student gets a different set of questions based on their session ID.
    // Shuffling is deterministic per-student but randomized across the cohort.
    
    // Helper: Strict hard-question heuristic filter
    const hardQuestionFilter = (q: any) => {
      const text = (q.q || q.title || '').toString();
      const longEnough = text.length > 110; // longer prompts usually indicate complexity
      const hasHardKeywords = /advanced|complex|probability|proof|derive|design|architecture|optimization|algorithm|entropy|eigen|matrix|integration|regression|inversion|exploit|tuning|stability|asymptotic|amortized|concurrency|deadlock/i.test(text);
      return longEnough || hasHardKeywords;
    };

    // Round 1 & 2: Balanced MCQ Distribution (restrict to harder questions only)
    const hardAptitudePool = allAptitude.filter(hardQuestionFilter);
    const hardGrammarPool = allGrammar.filter(hardQuestionFilter);
    const shuffledApt = buildUpscQuestionSet(hardAptitudePool.length > 0 ? hardAptitudePool : allAptitude, sessionSeed, "aptitude", 30);
    const shuffledGram = buildUpscQuestionSet(hardGrammarPool.length > 0 ? hardGrammarPool : allGrammar, sessionSeed + 12, "grammar", 30);
    setR1List(shuffledApt);
    setR2List(shuffledGram);

    // Round 3: Dynamic Typing Content
    // We pick 2 different topics from the pool for each student.
    const typingTopics = seededShuffle(TYPING_TOPICS_POOL, sessionSeed + 5).slice(0, 2);
    setStudentTopics(typingTopics);

    // Round 4: Hard DSA / Domain-Specific Distribution
    if (isMcqDomain) {
      let pool = DOMAIN_MCQ_POOL[domainConfig.questionPoolKey as keyof typeof DOMAIN_MCQ_POOL] || [];
      // Filter domain MCQs to harder subset when possible
      const hardDomain = pool.filter(hardQuestionFilter);
      pool = hardDomain.length > 0 ? hardDomain : pool;
      const selectedQuestions = seededShuffle(pool, sessionSeed + 99);
      let finalSelection = [...selectedQuestions];
      const requiredCount = examPattern.rounds[3].questionCount || 40;

      if (finalSelection.length > 0 && finalSelection.length < requiredCount) {
        while (finalSelection.length < requiredCount) {
          finalSelection = [...finalSelection, ...selectedQuestions];
        }
      }
      setCodingQuestions(finalSelection.slice(0, requiredCount));
    } else {
      // Technical Domain: use the shared Round-4 technical coding pool for all domains
      const selectedPool = TECHNICAL_ROUND_4_POOL;
      const shuffledDsa = seededShuffle(selectedPool.filter(hardQuestionFilter), sessionSeed + 101);
      const fallbackDsa = seededShuffle(selectedPool, sessionSeed + 101);
      const topDsa = (shuffledDsa.length >= 3 ? shuffledDsa : fallbackDsa).slice(0, 3);

      const technicalSelection = topDsa;

      const watermarkedQuestions = technicalSelection.map((q) => {
        const inferredLanguage = (q as any).language || domainConfig.preferredLanguage || "javascript";
        const clientTests = (q.tests || []).map((t: any) => {
          if (t.isHidden) {
            return {
              id: t.id,
              isHidden: true,
              input: "[HIDDEN]",
              expectedOutput: "[HIDDEN]",
              category: t.category,
              description: t.description
            };
          }
          return t;
        });
        return {
          ...q,
          language: inferredLanguage,
          tests: clientTests,
          desc: (q.desc || '') + (sessionSeed % 2 === 0 ? " " : "")
        };
      });

      setCodingQuestions(watermarkedQuestions);
    }
  }, [sessionSeed, studentDomain, isMcqDomain, domainConfig, examPattern, profile, id]);



  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const disableContext = (e: MouseEvent) => e.preventDefault();
    const disableCopyPaste = (e: ClipboardEvent) => { 
      e.preventDefault(); 
      handleProctorViolation("COPY_PASTE_ATTEMPT", "External clipboard interaction blocked.");
    };
    
    const blockShortcuts = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;
      const isShift = e.shiftKey;
      
      // Strict Blocking: F12, Ctrl+Shift+I, Ctrl+U, Ctrl+C, Ctrl+V, Ctrl+S, Alt+Tab, Windows Key
      if (
        e.key === "F12" || 
        e.key === "Meta" || // Windows Key
        (isAlt && e.key === "Tab") || 
        (isCtrl && isShift && e.key === "I") || 
        (isCtrl && e.key === "u") || 
        (isCtrl && e.key === "c") || 
        (isCtrl && e.key === "v") || 
        (isCtrl && e.key === "s") ||
        (isCtrl && e.key === "p") ||
        (isCtrl && e.key === "r") || // Refresh
        (isCtrl && isShift && e.key === "C") // Inspect element
      ) {
        e.preventDefault();
        handleProctorViolation("UNAUTHORIZED_SHORTCUT", `Restricted key combination: ${e.key}`);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && examState === "ACTIVE") {
        handleProctorViolation("TAB_SWITCH", "Unauthorized focus switch detected.");
      }
    };

    const handleBlur = () => {
      if (examState === "ACTIVE") {
        handleProctorViolation("BROWSER_FOCUS_LOST", "Window focus lost. Stay within the exam environment.");
      }
    };

    if (examState === "ACTIVE") {
      document.addEventListener("contextmenu", disableContext);
      document.addEventListener("copy", disableCopyPaste);
      document.addEventListener("paste", disableCopyPaste);
      document.addEventListener("keydown", blockShortcuts);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
    }

    return () => {
      document.removeEventListener("contextmenu", disableContext);
      document.removeEventListener("copy", disableCopyPaste);
      document.removeEventListener("paste", disableCopyPaste);
      document.removeEventListener("keydown", blockShortcuts);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [examState, handleProctorViolation]);

  // Session Heartbeat & Remote Termination Listener
  useEffect(() => {
    if (examState === "ACTIVE") {
      let unsubscribe: () => void = () => {};

      const initSync = async () => {
        const { db } = await import("@/lib/firebase");
        const { updateDoc, doc, onSnapshot } = await import("firebase/firestore");
        const email = localStorage.getItem("geonixa_current_user") || "anonymous";
        
        if (email !== "anonymous") {
           const ref = doc(db, "student_profiles", email);
           
           // Heartbeat Update with Enhanced Analytics
           const interval = setInterval(async () => {
             await updateDoc(ref, {
               lastActive: new Date().toISOString(),
               currentRound,
               tabSwitches: warnings.filter(w => w.includes("TAB_SWITCH")).length,
               warningCount: warnings.length,
               examStatus: "ACTIVE",
               lastViolation: warnings.length > 0 ? warnings[warnings.length - 1] : "None",
               roundDurations: roundTimes // Track time spent
             }).catch(() => {});
           }, 20000); // 20s heartbeat for tighter monitoring

           // Listen for Admin Commands
           unsubscribe = onSnapshot(ref, (docSnap) => {
             const data = docSnap.data();
             if (data && data.examStatus === "TERMINATED_BY_ADMIN") {
               if (typeof document !== "undefined" && document.fullscreenElement) document.exitFullscreen().catch(() => {});
               setExamState("VIOLATION_TERMINATED");
             }
           });

           return () => {
             clearInterval(interval);
             unsubscribe();
           };
        }
      };

      const cleanupPromise = initSync();
      return () => {
        cleanupPromise.then(cleanup => cleanup && cleanup());
      };
    }
  }, [examState, currentRound, warnings]);

  useEffect(() => {
    if (examState === "SYS_CHECK") {
      setTimeout(() => setSysChecks(s => ({ ...s, browser: true })), 500);
      setTimeout(() => setSysChecks(s => ({ ...s, network: true })), 1000);
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setSysChecks(s => ({ ...s, camera: true, mic: true }));
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => alert("Camera/Mic access denied."));
    } else if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  }, [examState]);

  // handleProctorViolation is intentionally declared earlier in the file
  // (above the useEffects that depend on it) to avoid TDZ reference errors.

  // Removed Neural Link loading screen

  // --- RENDERING DIFFERENT STATES --- //

  if (!isProfileLoading && slotValidation.status === "PENDING") {
    return (
      <div className="min-h-screen bg-[#050810] text-white flex items-center justify-center p-6">
        <div className="max-w-3xl w-full rounded-4xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-2xl">
          <h1 className="text-4xl font-black mb-6 text-orange-400">Slot Locked</h1>
          <p className="text-slate-300 mb-4">Your assigned exam slot is not active yet.</p>
          <p className="text-slate-400 mb-2">{slotValidation.message}</p>
          <p className="text-slate-500 text-sm">You must start the assessment during the exact scheduled slot and day assigned to you.</p>
        </div>
      </div>
    );
  }

  if (!isProfileLoading && slotValidation.status === "EXPIRED") {
    return (
      <div className="min-h-screen bg-[#050810] text-white flex items-center justify-center p-6">
        <div className="max-w-3xl w-full rounded-4xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-2xl">
          <h1 className="text-4xl font-black mb-6 text-red-500">Slot Expired</h1>
          <p className="text-slate-300 mb-4">{slotValidation.message}</p>
          <p className="text-slate-400">Access has been revoked. Your passkey is now invalidated for this session.</p>
        </div>
      </div>
    );
  }

  if (!isProfileLoading && slotValidation.status === "INVALID") {
    return (
      <div className="min-h-screen bg-[#050810] text-white flex items-center justify-center p-6">
        <div className="max-w-3xl w-full rounded-4xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-2xl">
          <h1 className="text-4xl font-black mb-6 text-amber-400">Slot Data Invalid</h1>
          <p className="text-slate-300 mb-4">{slotValidation.message}</p>
          <p className="text-slate-400">Please contact the exam administrator before attempting access again.</p>
        </div>
      </div>
    );
  }

  if (!isProfileLoading && slotValidation.status === "MISSING") {
    return (
      <div className="min-h-screen bg-[#050810] text-white flex items-center justify-center p-6">
        <div className="max-w-3xl w-full rounded-4xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-2xl">
          <h1 className="text-4xl font-black mb-6 text-slate-200">Slot Information Unavailable</h1>
          <p className="text-slate-300 mb-4">Slot metadata is missing from your profile.</p>
          <p className="text-slate-400">Contact administration to restore your exam slot assignment.</p>
        </div>
      </div>
    );
  }

  if (examState === "SYS_CHECK") {
    const allChecksPassed = sysChecks.browser && sysChecks.network && sysChecks.camera && sysChecks.mic && hasSelfie;
    return (
      <div className="min-h-screen bg-[#050810] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-4xl bg-[#0D121F]/80 backdrop-blur-xl border border-slate-800 rounded-[40px] p-12 shadow-2xl"
        >
          <Logo size="xl" center className="mb-12" />
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black italic tracking-tighter mb-2">Secure Initialization</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verifying workstation integrity & candidate identity</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* System Metrics */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 border-b border-slate-800 pb-4">Hardware & Network</h3>
              <div className="space-y-4">
                {Object.entries(sysChecks).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">{key}</span>
                    <div className="flex items-center gap-2">
                       {val ? (
                         <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md uppercase">Verified</span>
                       ) : (
                         <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md uppercase animate-pulse">Pending</span>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Identity */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 border-b border-slate-800 pb-4">Identity Capture</h3>
              <div className="relative group">
                <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden border-2 border-slate-800 group-hover:border-blue-500 transition-all duration-500">
                  <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
                  <canvas ref={canvasRef} className="hidden" width={640} height={480} />
                  {isFlashing && (
                    <motion.div 
                      initial={{ opacity: 1 }} animate={{ opacity: 0 }}
                      className="absolute inset-0 bg-white z-50"
                    />
                  )}
                  {hasSelfie && selfieData && (
                    <div className="absolute inset-0">
                      <img src={selfieData} className="w-full h-full object-cover scale-x-[-1]" alt="Selfie" />
                      <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="bg-emerald-500 text-white p-4 rounded-full shadow-lg">
                            <CheckCircle2 size={32} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={async () => { 
                    if (sysChecks.camera && videoRef.current && canvasRef.current) {
                      setIsFlashing(true);
                      setTimeout(() => setIsFlashing(false), 300);

                      const video = videoRef.current;
                      const canvas = canvasRef.current;
                      const context = canvas.getContext('2d');
                      if (context) {
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const data = canvas.toDataURL('image/jpeg', 0.8);
                        setSelfieData(data);
                        setHasSelfie(true);

                        // Upload to Firebase
                        try {
                          const response = await fetch(data);
                          const blob = await response.blob();
                          const email = localStorage.getItem("geonixa_current_user") || "anonymous";
                          await uploadLiveFrame(email, blob);
                        } catch (e) { console.error("Selfie upload failed", e); }
                      }
                    }
                  }}
                  disabled={!sysChecks.camera || hasSelfie}
                  className={`w-full mt-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all ${
                    hasSelfie ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/20'
                  }`}
                >
                  {hasSelfie ? "Identity Locked" : "Capture Forensic Selfie"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center gap-6">
            <button 
              className={`w-full max-w-sm py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] transition-all duration-500 ${
                allChecksPassed 
                ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-2xl shadow-blue-600/40 hover:scale-[1.02] cursor-pointer' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
              disabled={!allChecksPassed} 
              onClick={() => setExamState("INSTRUCTIONS")}
            >
              {allChecksPassed ? "Proceed to Assessment Protocol" : "Complete Protocol Checklist"}
            </button>
            <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.4em]">GeoNixa SecureGuard v4.2.0 • 2048-bit Encrypted Session</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Removed Waiting and Expired rendering branches.

  if (examState === "INSTRUCTIONS") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", padding: "2rem", backgroundColor: "var(--bg-deep)" }}>
        <Logo size="xl" center className="mb-12" />
        <h1 style={{ color: "var(--primary)", fontSize: "2.5rem", marginBottom: "1rem", fontWeight: "900", letterSpacing: "-1px" }}>Secure Assessment Protocol</h1>
        <div style={{ maxWidth: '800px', backgroundColor: 'var(--bg-card)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-dim)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
           <h3 style={{ color: "var(--text-primary)", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem", marginBottom: "1rem" }}>Strict Examination Compliance Framework:</h3>
           <ul style={{ marginLeft: '1.5rem', color: "#b91c1c", marginTop: "1rem", lineHeight: "1.8", fontWeight: "500" }}>
             <li><strong>MANDATORY:</strong> A highly synchronized neural AI feed is monitoring visual metrics constantly.</li>
             <li><strong>AUTO-TERMINATION:</strong> Leaving the active browser boundary or alt-tabbing immediately terminates the session.</li>
             <li><strong>NO SECOND CHANCES:</strong> Attempting bypass by refreshing instances triggers instant blockade mechanisms.</li>
           </ul>
        </div>
        <button className="btn btn-primary" onClick={async () => { await document.documentElement.requestFullscreen(); setIsFullscreen(true); setExamState("ACTIVE"); }} style={{ marginTop: '3rem', padding: "1.2rem 4rem", borderRadius: "20px", fontSize: "1.1rem", fontWeight: "900", letterSpacing: "1px" }}>
          I ACKNOWLEDGE & INITIALIZE SESSION
        </button>
      </div>
    );
  }

  const handleFeedbackSubmit = async () => {
    setIsSendingEmail(true);
    const currentUser = typeof window !== "undefined" ? localStorage.getItem("geonixa_current_user") || "anonymous" : "anonymous";
    
    try {
      // 1. Send Email (Mocking API call)
      console.log(`Sending Exam Cleared Mail to: ${currentUser}`);
      // In a real app: await fetch('/api/send-completion-email', { method: 'POST', body: JSON.stringify({ email: currentUser }) });
      
      setFeedbackSubmitted(true);
      alert("Feedback Received! A confirmation email has been dispatched to your registered address.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (examState === "VIOLATION_TERMINATED" || examState === "SUBMITTED") {
    return (
      <div className="animate-fade-in" style={{ padding: "5rem", textAlign: "center", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "var(--bg-deep)", overflowY: "auto" }}>
        <h1 style={{ color: examState === "VIOLATION_TERMINATED" ? "var(--danger)" : "var(--success)", fontSize: "2.5rem" }}>
          {examState === "VIOLATION_TERMINATED" ? "EXAM TERMINATED" : "Exam Successfully Completed"}
        </h1>
        
        {examState === "SUBMITTED" && !feedbackSubmitted && (
           <div style={{ marginTop: "2rem", width: "100%", maxWidth: "600px", padding: "2.5rem", backgroundColor: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-dim)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
             <h2 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>Candidate Experience Review</h2>
             <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Your feedback helps us refine the Geonixa assessment environment.</p>
             
             <div style={{ marginBottom: "2.5rem" }}>
               <label style={{ display: "block", marginBottom: "1rem", fontWeight: "bold", color: "var(--primary)" }}>RATE YOUR EXPERIENCE</label>
               <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                 {[1, 2, 3, 4, 5].map(star => (
                   <span 
                    key={star} 
                    onClick={() => setFeedback(p => ({ ...p, stars: star }))} 
                    style={{ 
                      fontSize: "3rem", 
                      cursor: "pointer", 
                      color: feedback.stars >= star ? "#F97316" : "#E2E8F0",
                      transition: "all 0.2s"
                    }}
                   >
                    ★
                   </span>
                 ))}
               </div>
             </div>

             <div style={{ textAlign: "left", marginBottom: "2rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", fontSize: "0.9rem" }}>ANY CHALLENGES FACED?</label>
                <textarea 
                  value={feedback.challenges}
                  onChange={e => setFeedback(p => ({ ...p, challenges: e.target.value }))}
                  placeholder="Technical difficulties, question clarity, platform performance..."
                  style={{ width: "100%", height: "120px", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-dim)", fontSize: "1rem", backgroundColor: "white", resize: "none" }}
                />
             </div>

             <button 
              disabled={!feedback.stars || isSendingEmail} 
              onClick={handleFeedbackSubmit} 
              className="btn btn-primary" 
              style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem", fontWeight: "bold" }}
             >
               {isSendingEmail ? "Synchronizing Data..." : "Finalize & Submit Feedback"}
             </button>
           </div>
        )}

        {feedbackSubmitted && (
          <div className="animate-fade-in" style={{ marginTop: "3rem", padding: "2rem", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "16px", maxWidth: "600px" }}>
            <h3 style={{ color: "#166534", marginBottom: "1rem" }}>✓ Session Finalized</h3>
            <p style={{ color: "#166534", lineHeight: "1.6" }}>
              A confirmation email has been sent to your registered address.<br/>
              <strong>Notice:</strong> Results will be shared by the Geonixa team precisely 1 week after your exam completion date.
            </p>
            <button className="btn btn-outline" style={{ marginTop: "2rem" }} onClick={() => window.location.href = '/'}>Return to Home</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--bg-deep)", position: "relative" }}>
      <style>{`
        @keyframes timerGlow {
          0% { box-shadow: 0 0 5px rgba(249, 115, 22, 0.2); }
          50% { box-shadow: 0 0 15px rgba(249, 115, 22, 0.6); }
          100% { box-shadow: 0 0 5px rgba(249, 115, 22, 0.2); }
        }
        .timer-active {
          animation: timerGlow 2s infinite;
          border: 2px solid #f97316 !important;
        }
      `}</style>
      


      {/* Sidebar - Progress & Proctoring HUD - Hidden in Round 4 for maximum IDE space */}
      {currentRound !== 4 && (
        <div style={{ width: "320px", backgroundColor: "var(--bg-card)", borderRight: "1px solid var(--border-dim)", padding: "1.5rem", display: "flex", flexDirection: "column", transition: "width 0.3s", overflowY: "auto" }}>
        <div style={{ borderBottom: "1px solid var(--border-dim)", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
          <Logo size="sm" />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--success)", boxShadow: "0 0 10px var(--success)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold" }}>SECURE SESSION ACTIVE</span>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[1, 2, 3, 4].filter(r => currentRound === 4 ? r === 4 : true).map(r => {
            const isActive = currentRound === r;
            const isCompleted = currentRound > r;
            return (
              <div 
                key={r} 
                style={{ 
                  padding: "1rem", 
                  borderRadius: "12px", 
                  border: isActive ? "1.5px solid var(--primary)" : "1.5px solid transparent",
                  backgroundColor: isActive ? "#fff7ed" : (isCompleted ? "#f8fafc" : "transparent"),
                  opacity: isActive || isCompleted ? 1 : 0.4,
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "900", color: isActive ? "var(--primary)" : "var(--text-muted)" }}>ROUND 0{r}</span>
                  {isActive && (
                    <div className="timer-active" style={{ fontSize: "1.4rem", fontWeight: "900", color: "#f97316", fontFamily: "monospace", backgroundColor: "#fff7ed", padding: "0.4rem 0.8rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "#fb923c" }}>⏳</span>
                      <Timer 
                        initialTime={timeLimits[r]} 
                        isActive={isActive && examState === "ACTIVE"} 
                        onExpiry={handleRoundExpiry} 
                      />
                    </div>

                  )}
                </div>
                <div style={{ fontWeight: "bold", fontSize: "0.95rem", marginTop: "0.2rem", color: isActive ? "#1e293b" : "var(--text-primary)" }}>
                  {r === 1 ? "Aptitude Intelligence" : r === 2 ? "Grammar & Logic" : r === 3 ? "Typing Velocity" : (isMcqDomain ? "Technical MCQ" : "Domain Coding")}
                </div>
                {isActive && <div style={{ height: "3px", backgroundColor: "var(--primary)", width: "40%", marginTop: "0.8rem", borderRadius: "2px" }} />}
              </div>
            );
          })}
        </div>


        {/* Sidebar buttons hidden - main CTA in Round-4 content area */}
        {currentRound !== 4 && (
          <div style={{ marginTop: "1rem", padding: "0.6rem", display: "flex", gap: "0.6rem", alignItems: "center", justifyContent: "center" }}>
            {/* Non-Round-4 navigation handled in main content */}
          </div>
        )}

        {currentRound !== 4 && (
          <div style={{ marginTop: "auto", padding: "1.2rem", backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <span style={{ color: "#f97316", fontWeight: "900", fontSize: "0.75rem", letterSpacing: "1px" }}>SESSION PERFORMANCE</span>
              <span style={{ color: "var(--success)", fontWeight: "bold", fontSize: "0.7rem" }}>LIVE UPDATE</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
               <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8" }}>
                  <span>Integrity Rank:</span>
                  <span style={{ color: warnings.length > 0 ? "#ef4444" : "var(--success)" }}>{warnings.length > 0 ? "STRICT" : "EXCELLENT"}</span>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8" }}>
                  <span>Biometric Pulse:</span>
                  <span className="flex items-center gap-2 text-white">
                    NOMINAL <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  </span>
               </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8" }}>
                   <span>Accuracy Focus:</span>
                   <span style={{ color: "#fff" }}>HIGH</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8" }}>
                   <span>Network Latency:</span>
                   <span style={{ color: latency > 40 ? "#fb923c" : "var(--success)", fontFamily: "monospace" }}>{latency}ms</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8" }}>
                   <span>Session ID:</span>
                   <span style={{ color: "#fff", fontSize: "0.6rem", fontFamily: "monospace" }}>{sessionHash}</span>
                </div>
            </div>
          </div>
        )}
      </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "var(--bg-deep)", overflow: "hidden", position: "relative" }}>
        {/* Secure Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none z-100 opacity-[0.03] flex items-center justify-center overflow-hidden rotate-[-30deg]">
          <div className="text-[120px] font-black whitespace-nowrap select-none">
            {typeof window !== 'undefined' ? localStorage.getItem("geonixa_current_user") : "SECURE_SESSION"} • {sessionHash} • {new Date().toLocaleDateString()}
          </div>
        </div>
        
        {/* Neural Guard Scanline */}
        <div className="absolute inset-0 pointer-events-none z-101 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-size-[100%_4px,3px_100%] opacity-20" />

        <div style={{ padding: "2rem", flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
          {/* Round 1: Aptitude & Round 2: Grammar */}
          {(currentRound === 1 || currentRound === 2) && (
            <div className="animate-fade-in" style={{ maxWidth: "900px", margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: "1.8rem" }}>{currentRound === 1 ? "Aptitude Assessment" : "Grammar Assessment"}</h1>
                  {(currentRound === 1 || currentRound === 2) && (
                    <p style={{ margin: "0.5rem 0 0 0", color: "#64748b", fontSize: "0.82rem", fontWeight: 700 }}>
                      30 questions | 10 minutes | Auto-saved
                    </p>
                  )}
                </div>
                <span style={{ fontWeight: "bold", color: "var(--text-muted)" }}>Question {(currentRound === 1 ? q1Index : q2Index) + 1} of 30</span>
              </div>

              <div style={{ padding: "2.5rem", backgroundColor: "white", borderRadius: "20px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", border: "1px solid var(--border-dim)" }}>
                {(currentRound === 1 || currentRound === 2) && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", gap: "1rem" }}>
                    <span style={{ backgroundColor: "#fff7ed", color: "#f97316", border: "1px solid #fed7aa", borderRadius: "999px", padding: "0.35rem 0.8rem", fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.08em" }}>
                      {((currentRound === 1 ? r1List[q1Index] : r2List[q2Index])?.patternKey || "standard").toUpperCase()}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "0.72rem", fontFamily: "monospace", fontWeight: 800 }}>
                      SECURE CODE: {(currentRound === 1 ? r1List[q1Index] : r2List[q2Index])?.questionCode || "SECURE-0000"}
                    </span>
                  </div>
                )}
                <p style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", lineHeight: "1.6", marginBottom: "2.5rem" }}>
                  {(currentRound === 1 ? r1List : r2List)[currentRound === 1 ? q1Index : q2Index]?.q}
                </p>

                <div style={{ display: "grid", gap: "1rem" }}>
                  {(currentRound === 1 ? r1List : r2List)[currentRound === 1 ? q1Index : q2Index]?.opts.map((opt: string, optionIndex: number) => {
                    const ans = currentRound === 1 ? r1Answers : r2Answers;
                    const idx = currentRound === 1 ? q1Index : q2Index;
                    const isSelected = ans[idx] === opt;
                    return (
                      <button
                        key={`${idx}_${optionIndex}_${opt}`}
                        onClick={() => currentRound === 1 ? setR1Answers(prev => ({...prev, [q1Index]: opt})) : setR2Answers(prev => ({...prev, [q2Index]: opt}))}
                        style={{
                          padding: "1.2rem 1.5rem",
                          textAlign: "left",
                          borderRadius: "12px",
                          border: isSelected ? "2px solid var(--primary)" : "1px solid #e2e8f0",
                          backgroundColor: isSelected ? "#fff7ed" : "white",
                          color: isSelected ? "var(--primary)" : "#475569",
                          fontWeight: isSelected ? "bold" : "500",
                          transition: "all 0.2s",
                          cursor: "pointer"
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button 
                  className="btn btn-outline" 
                  disabled={(currentRound === 1 ? q1Index : q2Index) === 0}
                  onClick={() => currentRound === 1 ? setQ1Index(p => p - 1) : setQ2Index(p => p - 1)}
                >
                  Previous
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "0.5rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  {Array.from({ length: 30 }, (_, i) => {
                    const isAnswered = (currentRound === 1 ? r1Answers : r2Answers)[i];
                    const isCurrent = (currentRound === 1 ? q1Index : q2Index) === i;
                    return (
                      <button
                        key={i}
                        onClick={() => currentRound === 1 ? setQ1Index(i) : setQ2Index(i)}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          border: isCurrent ? "2px solid var(--primary)" : "1px solid #e2e8f0",
                          backgroundColor: isCurrent ? "var(--primary)" : (isAnswered ? "var(--success)" : "white"),
                          color: isCurrent || isAnswered ? "white" : "#64748b"
                        }}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    {((currentRound === 1 ? q1Index : q2Index) < 29) ? (
                      <button 
                        className="btn btn-primary"
                        style={{ padding: "1rem 3rem", borderRadius: "14px" }}
                        onClick={() => {
                          currentRound === 1 ? setQ1Index(p => p + 1) : setQ2Index(p => p + 1);
                        }}
                      >
                        SAVE & NEXT
                      </button>
                    ) : (
                      <button 
                        className="btn btn-danger"
                        style={{ padding: "1rem 3rem", borderRadius: "14px", backgroundColor: "#dc2626", color: "white" }}
                        onClick={() => {
                          showConfirm(
                            `Submit Round ${currentRound}`,
                            `Are you ready to submit Round ${currentRound} and proceed to the next section? You cannot return to this section once submitted.`,
                            () => submitSection(currentRound)
                          );
                        }}
                      >
                        SUBMIT ROUND 0{currentRound} & PROCEED
                      </button>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Round 3: Descriptive Writing */}
          {currentRound === 3 && (
            <div className="animate-fade-in" style={{ maxWidth: "1000px", margin: "0 auto" }}>
              <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h1 style={{ margin: 0 }}>Round 3: Descriptive Writing Assessment</h1>
                  <p style={{ color: "var(--text-muted)" }}>Write a detailed essay for each topic. Switch occurs auto at 5:00.</p>
                </div>
                <div style={{ backgroundColor: "#0f172a", color: "white", padding: "0.8rem 1.5rem", borderRadius: "12px", fontWeight: "900", fontFamily: "monospace", fontSize: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", border: "2px solid #334155" }}>
                   {Math.floor(r3SubTimer / 60)}:{(r3SubTimer % 60).toString().padStart(2, '0')}
                   <span style={{ fontSize: "0.7rem", display: "block", color: "#94a3b8", fontWeight: "bold", textAlign: "center" }}>TOPIC {typingTopicIndex + 1} TIME</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                <button onClick={() => setTypingTopicIndex(0)} className={`btn ${typingTopicIndex === 0 ? "btn-primary" : "btn-outline"}`} style={{ flex: 1 }}>TOPIC 01 {calculateSubstantialLines(typingTexts[0]) >= 8 ? "✅" : ""}</button>
                <button onClick={() => setTypingTopicIndex(1)} className={`btn ${typingTopicIndex === 1 ? "btn-primary" : "btn-outline"}`} style={{ flex: 1 }}>TOPIC 02 {calculateSubstantialLines(typingTexts[1]) >= 8 ? "✅" : ""}</button>
              </div>

              <div style={{ padding: "2.5rem", backgroundColor: "#f8fafc", borderRadius: "20px", border: "1px solid #e2e8f0", marginBottom: "2.5rem", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
                <h4 style={{ margin: "0 0 1rem 0", color: "#64748b", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "2px", fontWeight: "black" }}>Your Assigned Topic {typingTopicIndex + 1}</h4>
                <p style={{ fontSize: "1.4rem", fontWeight: "700", lineHeight: "1.5", color: "#1e293b", margin: 0 }}>"{studentTopics[typingTopicIndex]}"</p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-200">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Speed (WPM)</div>
                      <div className="text-2xl font-black text-slate-800">{Math.round((typingTexts[typingTopicIndex].trim().split(/\s+/).filter(Boolean).length) / Math.max(0.1, (300 - r3SubTimer) / 60))} WPM</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Accuracy</div>
                      <div className="text-2xl font-black text-emerald-600">{Math.max(0, Math.min(100, Math.round(100 - (backspaceCounts[typingTopicIndex] * 1.5))))}%</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Lines Progress</div>
                      <div className={`text-2xl font-black ${calculateSubstantialLines(typingTexts[typingTopicIndex]) >= 18 ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {calculateSubstantialLines(typingTexts[typingTopicIndex])} / 18
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Corrections Used</div>
                      <div className={`text-2xl font-black ${backspaceCounts[typingTopicIndex] >= 15 ? 'text-red-600' : 'text-slate-800'}`}>
                        {backspaceCounts[typingTopicIndex]} / 15
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Words / Chars</div>
                      <div className="text-xl font-bold text-slate-700">{typingTexts[typingTopicIndex].trim().split(/\s+/).filter(Boolean).length}w / {typingTexts[typingTopicIndex].length}c</div>
                    </div>
                </div>
              </div>

              {backspaceCounts[typingTopicIndex] >= 15 && (
                <div className="bg-red-50 border-2 border-red-500 text-red-700 p-4 rounded-xl mb-6 font-bold flex items-center gap-3 animate-pulse shadow-lg">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="uppercase tracking-wider text-xs font-extrabold">Correction Lock Enabled</div>
                    <div>Maximum allowed backspaces (15/15) consumed for Topic {typingTopicIndex + 1}. All further deletion actions have been electronically locked.</div>
                  </div>
                </div>
              )}
              {typingWarning && backspaceCounts[typingTopicIndex] < 15 && (
                <div className="bg-amber-50 border-2 border-amber-500 text-amber-700 p-4 rounded-xl mb-6 font-bold flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>{typingWarning}</div>
                </div>
              )}

              <textarea 
                style={{ width: "100%", height: "450px", padding: "2.5rem", fontSize: "1.15rem", fontFamily: "'Inter', sans-serif", borderRadius: "24px", border: "2px solid #e2e8f0", resize: "none", backgroundColor: "#fff", lineHeight: "1.8", color: "#334155", outline: "none", transition: "border-color 0.2s" }}
                value={typingTexts[typingTopicIndex]}
                onChange={e => {
                  const t = [...typingTexts];
                  t[typingTopicIndex] = e.target.value;
                  setTypingTexts(t);
                }}
                onKeyDown={e => {
                  if (e.key === "Backspace") {
                    if (backspaceCounts[typingTopicIndex] >= 15) {
                      e.preventDefault();
                      setTypingWarning(`⚠️ CRITICAL WARNING: Maximum backspace limit reached (15/15) for Topic ${typingTopicIndex + 1}. Further backspaces are disabled.`);
                      return;
                    }
                    const c = [...backspaceCounts];
                    c[typingTopicIndex]++;
                    setBackspaceCounts(c);
                  }
                }}
                className="focus:border-[#FF5A1F]"
                placeholder="Start writing your essay here. Focus on clarity, structure, and technical relevance..."
              />

              <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "flex-end" }}>
                  {typingTopicIndex === 0 ? (
                    <button className="btn btn-primary" onClick={() => { setTypingTopicIndex(1); setR3SubTimer(300); }}>Switch to Topic 2</button>
                  ) : (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: "1.2rem 4rem" }}
                        onClick={() => {
                          showConfirm(
                            "Submit Round 3",
                            "Are you ready to submit your Descriptive Writing responses and proceed to the Technical Round?",
                            () => submitSection(3)
                          );
                        }}
                      >
                        Finalize Round 3 & Start Technical
                      </button>
                  )}
              </div>
            </div>
          )}

          {/* Round 4: Technical (MCQ or Coding) */}
          {currentRound === 4 && (
            <div className="animate-fade-in" style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
              {isMcqDomain ? (
                <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <h1 style={{ margin: 0 }}>{studentDomain} {isMcqDomain ? "Domain MCQ" : "Coding"} Mastery</h1>
                    <span style={{ fontWeight: "bold", color: "var(--text-muted)" }}>Question {codingQuestionIndex + 1} of 40</span>
                  </div>

                  <div style={{ padding: "2.5rem", backgroundColor: "white", borderRadius: "20px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", border: "1px solid var(--border-dim)" }}>
                    <p style={{ fontSize: "1.3rem", fontWeight: "600", color: "#1e293b", lineHeight: "1.6", marginBottom: "2.5rem" }}>
                      {codingQuestions[codingQuestionIndex]?.q}
                    </p>
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {codingQuestions[codingQuestionIndex]?.opts.map((opt: string) => {
                        const isSelected = codingAnswers[codingQuestionIndex] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setCodingAnswers({...codingAnswers, [codingQuestionIndex]: opt})}
                            style={{
                              padding: "1.2rem 1.5rem",
                              textAlign: "left",
                              borderRadius: "12px",
                              border: isSelected ? "2px solid var(--primary)" : "1px solid #e2e8f0",
                              backgroundColor: isSelected ? "#fff7ed" : "white",
                              color: isSelected ? "var(--primary)" : "#475569",
                              fontWeight: isSelected ? "bold" : "500",
                              cursor: "pointer"
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "2rem" }}>
                    <button className="btn btn-outline" disabled={codingQuestionIndex === 0} onClick={() => setCodingQuestionIndex(p => p - 1)}>Previous</button>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "0.4rem", padding: "0.8rem", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                      {Array.from({ length: 40 }, (_, i) => {
                        const isAnswered = codingAnswers[i];
                        const isCurrent = codingQuestionIndex === i;
                        return (
                          <button
                            key={i}
                            onClick={() => setCodingQuestionIndex(i)}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.6rem",
                              fontWeight: "bold",
                              cursor: "pointer",
                              border: isCurrent ? "2px solid var(--primary)" : "1px solid #e2e8f0",
                              backgroundColor: isCurrent ? "var(--primary)" : (isAnswered ? "var(--success)" : "white"),
                              color: isCurrent || isAnswered ? "white" : "#64748b"
                            }}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>

                    {codingQuestionIndex < 39 ? (
                      <button className="btn btn-primary" onClick={() => setCodingQuestionIndex(p => p + 1)}>
                        NEXT QUESTION
                      </button>
                    ) : (
                      <button 
                        className="btn btn-danger" 
                        style={{ backgroundColor: "#dc2626", color: "white" }}
                        onClick={() => {
                          showConfirm(
                            "Final Submission",
                            "Are you sure you want to end the entire assessment? This will lock all sections and calculate your final score.",
                            () => handleFinalSubmit()
                          );
                        }}
                      >
                        SUBMIT TECHNICAL ROUND
                      </button>
                    )}
                </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "180px", flexShrink: 0 }}>
                      <Logo size="sm" />
                      <div className="timer-active" style={{ fontSize: "0.9rem", fontWeight: "900", color: "#f97316", fontFamily: "monospace", backgroundColor: "#fff7ed", padding: "0.2rem 0.5rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.5rem", width: "fit-content" }}>
                        <span style={{ fontSize: "0.8rem", color: "#fb923c" }}>⏳</span>
                        <Timer initialTime={timeLimits[4]} isActive={examState === "ACTIVE"} onExpiry={handleRoundExpiry} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
                      {codingQuestions.map((q: any, idx: number) => (
                        <button 
                          key={idx} 
                          onClick={() => setCodingQuestionIndex(idx)} 
                          className={`btn ${codingQuestionIndex === idx ? 'btn-primary' : 'btn-outline'}`}
                          style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          TASK {idx + 1}: {q.title?.substring(0, 20)}... {codingProgress[idx] ? "✅" : ""}
                        </button>
                      ))}
                    </div>
                    {codingQuestionIndex === codingQuestions.length - 1 && (
                      <button 
                        className="btn btn-danger animate-pulse" 
                        style={{ backgroundColor: "#dc2626", color: "white", padding: "0.8rem 2rem", borderRadius: "12px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(220, 38, 38, 0.4)", flexShrink: 0 }}
                        onClick={() => {
                          const attemptedCount = Object.keys(codingSubmissions).length;
                          const totalCodingQuestions = codingQuestions.length;
                          
                          if (attemptedCount < totalCodingQuestions) {
                            showConfirm(
                              "Incomplete Assessment",
                              `⚠ You have only attempted ${attemptedCount} out of ${totalCodingQuestions} coding questions. Do you want to proceed and leave the rest blank?`,
                              () => {
                                showConfirm(
                                  "Final Assessment Submission",
                                  "This will finalize your scores for ALL rounds, including all 3 coding questions. This action is irreversible. Proceed?",
                                  () => handleFinalSubmit()
                                );
                              }
                            );
                            return;
                          }

                          showConfirm(
                            "Final Assessment Submission",
                            "This will finalize your scores for ALL rounds, including all 3 coding questions. This action is irreversible. Proceed?",
                            () => handleFinalSubmit()
                          );
                        }}
                      >
                        FINALIZE EXAM
                      </button>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, display: "flex", gap: "1rem", overflow: "hidden" }}>
                    <div style={{ flex: "0 0 40%", padding: "1.5rem", backgroundColor: "#1e293b", color: "#f8fafc", borderRadius: "16px", border: "1px solid var(--border-dim)", overflowY: "auto", height: "100%" }}>
                      <h2 style={{ color: "white", margin: "0 0 1rem 0", fontSize: "1.4rem", fontWeight: "bold" }}>Overview: {codingQuestions[codingQuestionIndex]?.title}</h2>
                      <div style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "#cbd5e1", whiteSpace: "pre-wrap" }}>
                        {codingQuestions[codingQuestionIndex]?.desc}
                      </div>

                      {codingQuestions[codingQuestionIndex]?.objective && (
                        <div style={{ marginTop: "1.5rem" }}>
                          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "white", fontWeight: "bold" }}>Objective</h4>
                          <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.6" }}>{codingQuestions[codingQuestionIndex].objective}</p>
                        </div>
                      )}

                      {codingQuestions[codingQuestionIndex]?.task && (
                        <div style={{ marginTop: "1.5rem" }}>
                          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "white", fontWeight: "bold" }}>Task</h4>
                          <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.6" }}>{codingQuestions[codingQuestionIndex].task}</p>
                        </div>
                      )}

                      {(codingQuestions[codingQuestionIndex]?.inputFormat || codingQuestions[codingQuestionIndex]?.outputFormat) && (
                         <div style={{ marginTop: "2rem" }}>
                           <h4 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "white", fontWeight: "bold" }}>I/O Format</h4>
                           <div style={{ border: "1px solid #334155", borderRadius: "8px", overflow: "hidden" }}>
                             <div style={{ display: "flex", borderBottom: "1px solid #334155", backgroundColor: "#0f172a", padding: "1rem" }}>
                                <div style={{ flex: 1, fontWeight: "bold", color: "white" }}>Parameter</div>
                                <div style={{ flex: 2, fontWeight: "bold", color: "white" }}>Description</div>
                             </div>
                             {codingQuestions[codingQuestionIndex]?.inputFormat && (
                               <div style={{ display: "flex", borderBottom: "1px solid #334155", padding: "1rem" }}>
                                  <div style={{ flex: 1, color: "#94a3b8" }}>Input</div>
                                  <div style={{ flex: 2, color: "#cbd5e1" }}>{codingQuestions[codingQuestionIndex].inputFormat}</div>
                               </div>
                             )}
                             {codingQuestions[codingQuestionIndex]?.outputFormat && (
                               <div style={{ display: "flex", padding: "1rem" }}>
                                  <div style={{ flex: 1, color: "#94a3b8" }}>Output</div>
                                  <div style={{ flex: 2, color: "#cbd5e1" }}>{codingQuestions[codingQuestionIndex].outputFormat}</div>
                               </div>
                             )}
                           </div>
                         </div>
                      )}

                      {/* Sample Input/Output and Explanation hidden during exam - answers revealed only after submission */}
                      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#1e3a5f", border: "1px solid #3b82f6", borderRadius: "8px" }}>
                        <p style={{ color: "#93c5fd", fontSize: "0.85rem", margin: 0 }}>📝 Sample test cases and explanations are hidden during the exam. You will receive detailed feedback after submission.</p>
                      </div>
                    </div>
                    
                    <div style={{ flex: "0 0 calc(60% - 1rem)", display: "flex", flexDirection: "column", height: "100%" }}>
                      <MemoizedCodeEditor
                        questionId={`q_${codingQuestionIndex}`}
                        questionTitle={codingQuestions[codingQuestionIndex]?.title}
                        initialCode={codingSubmissions[codingQuestionIndex]?.code || codingQuestions[codingQuestionIndex]?.initialCode}
                        language={codingSubmissions[codingQuestionIndex]?.language || codingQuestions[codingQuestionIndex]?.language || domainConfig.preferredLanguage || "javascript"}
                        testCases={codingQuestions[codingQuestionIndex]?.tests || []}
                        initialResults={codingSubmissions[codingQuestionIndex]?.results || []}
                        isExamMode={true}
                        onUpdate={(data) => {
                          setCodingSubmissions(prev => ({
                            ...prev,
                            [codingQuestionIndex]: data
                          }));
                          const totalTestsCount = codingQuestions[codingQuestionIndex]?.tests?.length || 0;
                          const allPassed = data.results.length === totalTestsCount && totalTestsCount > 0 && data.results.every((r: any) => r.passed);
                          setCodingProgress(prev => ({ ...prev, [codingQuestionIndex]: allPassed }));
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                    {codingQuestionIndex < codingQuestions.length - 1 && (
                      <button 
                        className="btn" 
                        style={{ backgroundColor: "#64748b", color: "white", padding: "0.8rem 2.5rem", borderRadius: "12px", fontWeight: "800", fontSize: "0.9rem", transition: "all 0.2s" }}
                        onClick={() => setCodingQuestionIndex(p => p + 1)}
                      >
                        NEXT TASK
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {examState === "ACTIVE" && (
        <div className={`ai-camera-container ${currentRound === 4 ? "round-4-camera" : "default-camera"}`} style={{ 
          position: "fixed", 
          bottom: "30px", 
          ...(currentRound === 4 ? { left: "30px" } : { right: "30px" }),
          borderRadius: currentRound === 4 ? "50%" : "12px",
          overflow: "hidden",
          border: "none",
          boxShadow: currentRound === 4 ? "none" : "0 10px 25px rgba(0,0,0,0.5)",
          zIndex: 1000, 
          pointerEvents: "none",
          transition: "all 0.3s ease"
        }}>
          <style>{`
            .ai-camera-container.default-camera {
              width: 220px;
              height: auto;
            }
            .ai-camera-container.round-4-camera {
              width: 170px;
              height: 170px;
            }
            @media (max-width: 1024px) {
               .ai-camera-container.round-4-camera { width: 150px; height: 150px; }
            }
            @media (max-width: 768px) {
               .ai-camera-container.round-4-camera { width: 130px; height: 130px; }
            }
            @media (max-width: 640px) {
               .ai-camera-container.round-4-camera { width: 100px; height: 100px; }
            }
          `}</style>
          <div style={{ pointerEvents: "auto", width: "100%", height: "100%" }}>
            <MemoizedAIProctor 
              onViolation={handleProctorViolation} 
              isExamActive={examState === "ACTIVE"} 
              observationLevel={warnings.length}
              observationTimer={observationTimer}
              isRound4={currentRound === 4}
            />
          </div>
        </div>
      )}
      <AnimatePresence>
        {currentWarning && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-2000 w-full max-w-2xl px-4"
          >
            <div className="bg-[#ef4444] text-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(239,68,68,0.4)] border-2 border-white/20 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
                  <AlertTriangle size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Integrity Strike Detected</h3>
                  <p className="text-sm font-medium opacity-90 leading-relaxed">{currentWarning}</p>
                </div>
                <button 
                  onClick={() => setCurrentWarning(null)}
                  className="px-6 py-2 bg-black/20 hover:bg-black/30 rounded-xl font-bold transition-all text-xs border border-white/10"
                >
                  ACKNOWLEDGE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Observation Status Badge */}
      {warnings.length > 0 && examState === "ACTIVE" && (
        <div className="fixed top-24 right-8 z-1000 flex flex-col items-end gap-2 pointer-events-none">
          <motion.div 
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`px-4 py-2 border rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md ${
              warnings.length === 1 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${warnings.length === 1 ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' : 'bg-orange-500 shadow-[0_0_8px_#f97316]'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {warnings.length === 1 ? "Strict AI Observation" : "Critical AI Observation"} 
              {observationTimer !== null && ` (${Math.floor(observationTimer/60)}m ${observationTimer%60}s)`}
            </span>
          </motion.div>
          <div className="text-[8px] font-bold text-slate-500 uppercase bg-slate-900/50 px-2 py-1 rounded-md border border-white/5">
            Strikes: {warnings.length} / 3
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-cyan-500" />
              
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <ShieldCheck size={28} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{confirmModal.title}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security Verified</p>
                 </div>
              </div>

              <p className="text-slate-300 leading-relaxed mb-8">
                {confirmModal.message}
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-slate-400 font-bold hover:bg-white/10 transition-all border border-white/5"
                >
                  CANCEL
                </button>
                <button 
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, show: false }));
                  }}
                  className="flex-1 px-6 py-4 rounded-2xl bg-emerald-500 text-black font-black hover:bg-emerald-400 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                >
                  CONFIRM
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
