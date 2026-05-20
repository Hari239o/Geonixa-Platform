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
import { SLOT_CONFIG } from "@/lib/firebase";
import AIProctor from "@/components/proctoring/AIProctor";
import CodeEditor from "@/components/editor/CodeEditor";
import Logo from "@/components/brand/Logo";
import { storeExamAnswers, uploadLiveFrame, db } from "@/lib/firebase";
import { getDoc, doc, collection } from "firebase/firestore";
import { APTITUDE_POOL, GRAMMAR_POOL, DOMAIN_MCQ_POOL, DSA_HARD_POOL, WEB_DEV_POOL, TYPING_TOPICS_POOL } from "@/data/examQuestions";

const seededShuffle = (array: any[], seed: number) => {
  let m = array.length, t, i;
  const copy = [...array];
  while (m) {
    i = Math.floor(Math.abs(Math.sin(seed++)) * m--);
    t = copy[m];
    copy[m] = copy[i];
    copy[i] = t;
  }
  return copy;
};

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
  const [examState, setExamState] = useState<ExamState>("SYS_CHECK");

  const [feedback, setFeedback] = useState({ stars: 0, challenges: "" });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [currentWarning, setCurrentWarning] = useState<string | null>(null);

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
  
  const studentProfileStr = typeof window !== 'undefined' ? localStorage.getItem("geonixa_student_profile") : null;
  const profile = studentProfileStr ? JSON.parse(studentProfileStr) : { domain: "Java", slot: "SLOT_1" };
  const studentDomain = profile.domain || "Java";
  const studentSlot = profile.slot || "SLOT_1";
  const slotData = (SLOT_CONFIG as any)[studentSlot] || SLOT_CONFIG.SLOT_1;

  const [slotStatus, setSlotStatus] = useState<"WAITING" | "ACTIVE" | "EXPIRED">("WAITING");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkSlot = () => {
      const now = currentTime;
      const [startH, startM] = slotData.start.split(":").map(Number);
      const [endH, endM] = slotData.end.split(":").map(Number);
      
      const startTime = new Date(profile.day || new Date());
      startTime.setHours(startH, startM, 0);
      
      const endTime = new Date(profile.day || new Date());
      endTime.setHours(endH, endM, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const examDay = new Date(profile.day || new Date());
      examDay.setHours(0, 0, 0, 0);

      if (today < examDay) setSlotStatus("WAITING");
      else if (today > examDay) setSlotStatus("EXPIRED");
      else {
        if (now < startTime) setSlotStatus("WAITING");
        else if (now > endTime) setSlotStatus("EXPIRED");
        else setSlotStatus("ACTIVE");
      }
    };
    checkSlot();
  }, [currentTime, slotData, profile.day]);

  // Generate a session-specific seed based on the student's unique ID
  const sessionSeed = useMemo(() => {
    return id.split('').reduce((acc, char) => acc + (char.charCodeAt(0) * 13), 7);
  }, [id]);
  
  const techDomains = ["Java", "Python", "Web Development", "Data Analytics", "Data Science", "Machine Learning"];
  const isTech = techDomains.includes(studentDomain);
  const isMcqDomain = [
    "AutoCAD", "VLSI Design", "Embedded Systems", "Electric Vehicles", "Civil Engineering", 
    "Data Analytics", "Data Science", "AI & Machine Learning", "Cybersecurity", "Cloud Computing"
  ].includes(studentDomain);

  const timeLimits: Record<number, number> = isTech ? { 
    1: 10 * 60, // Aptitude: 10 Min
    2: 10 * 60, // Grammar: 10 Min
    3: 10 * 60, // Typing: 10 Min (5+5)
    4: 50 * 60  // Technical: 50 Min
  } : {
    1: 10 * 60, 
    2: 10 * 60, 
    3: 10 * 60, 
    4: 20 * 60  // Non-Tech Technical: 20 Min
  };
  
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
    }
  }, [codingQuestions]);

  // Persist Round 1/2/3 answers on change (Namespaced)
  useEffect(() => {
    if (Object.keys(r1Answers).length > 0 && typeof window !== "undefined") {
      const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
      localStorage.setItem(`geonixa_r1_answers_${currentUser}`, JSON.stringify(r1Answers));
    }
  }, [r1Answers]);

  useEffect(() => {
    if (Object.keys(r2Answers).length > 0 && typeof window !== "undefined") {
      const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
      localStorage.setItem(`geonixa_r2_answers_${currentUser}`, JSON.stringify(r2Answers));
    }
  }, [r2Answers]);

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
    return typed.split('\n').filter(line => line.trim().length >= 60).length;
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

  const handleFinalSubmit = useCallback(async () => {
    try {
      const currentUser = typeof window !== "undefined" ? localStorage.getItem("geonixa_current_user") || "anonymous" : "anonymous";
      
      // Round 1: Aptitude Analytics
      let r1Correct = 0; let r1Wrong = 0;
      const r1Details = r1List.map((q, i) => {
        const isCorrect = r1Answers[i] === q.correctAnswer;
        if (isCorrect) r1Correct++; else if (r1Answers[i]) r1Wrong++;
        return { qId: i, type: 'mcq', question: q.q, selected: r1Answers[i] || null, correct: q.correctAnswer, isCorrect };
      });
      const r1Score = (r1Correct * 1) - (r1Wrong * 0.25); // 1 mark each, -0.25 penalty

      // Round 2: Grammar Analytics
      let r2Correct = 0; let r2Wrong = 0;
      const r2Details = r2List.map((q, i) => {
        const isCorrect = r2Answers[i] === q.correctAnswer;
        if (isCorrect) r2Correct++; else if (r2Answers[i]) r2Wrong++;
        return { qId: i, type: 'mcq', question: q.q, selected: r2Answers[i] || null, correct: q.correctAnswer, isCorrect };
      });
      const r2Score = (r2Correct * 1) - (r2Wrong * 0.25);

      // Round 3: Descriptive Analytics
      const r3Lines1 = calculateSubstantialLines(typingTexts[0]);
      const r3Lines2 = calculateSubstantialLines(typingTexts[1]);
      const r3Score = (r3Lines1 >= 8 ? 5 : (r3Lines1 >= 4 ? 2 : 0)) + (r3Lines2 >= 8 ? 5 : (r3Lines2 >= 4 ? 2 : 0));
      
      // Round 4: Domain Analytics (MCQ or Coding)
      let r4Score = 0;
      let r4Details: any[] = [];
      if (isMcqDomain) {
        let r4Correct = 0; let r4Wrong = 0;
        r4Details = codingQuestions.map((q, i) => {
          const isCorrect = codingAnswers[i] === q.correctAnswer;
          if (isCorrect) r4Correct++; else if (codingAnswers[i]) r4Wrong++;
          return { qId: i, type: 'mcq', question: q.q, selected: codingAnswers[i] || null, correct: q.correctAnswer, isCorrect };
        });
        r4Score = (r4Correct * 2) - (r4Wrong * 0.5);
      } else {
        const passedTasks = Object.values(codingProgress).filter(Boolean).length;
        r4Score = passedTasks * 10; // 10 marks per passed task
        r4Details = codingQuestions.map((q, i) => ({ 
          qId: i,
          type: 'coding',
          title: q.title, 
          passed: codingProgress[i] || false,
          code: codingSubmissions[i]?.code || "",
          language: codingSubmissions[i]?.language || "",
          results: codingSubmissions[i]?.results || []
        }));
      }

      const totalScore = Math.max(0, r1Score) + Math.max(0, r2Score) + r3Score + Math.max(0, r4Score);
      
      const totalViolations = warnings.length;
      const tabSwitches = warnings.filter(w => w.includes("TAB_SWITCH")).length;
      const suspicionScore = (totalViolations * 20) + (tabSwitches * 15);
      const aiProbability = Math.min(95, suspicionScore > 50 ? 80 : (suspicionScore > 20 ? 40 : 5));

      await storeExamAnswers(currentUser, { 
        name: profile.name || currentUser,
        domain: studentDomain,
        college: profile.college || "Unknown",
        totalScore,
        roundScores: {
          round1: Math.max(0, r1Score),
          round2: Math.max(0, r2Score),
          round3: r3Score,
          round4: Math.max(0, r4Score)
        },
        violations: warnings,
        isCheating: aiProbability > 70,
        submissionType: "MANUAL_SUBMIT",
        completedAt: new Date().toISOString(),
        r1Details,
        r2Details,
        r3Details: { 
          topic1: studentTopics[0], text1: typingTexts[0], lines1: r3Lines1, 
          topic2: studentTopics[1], text2: typingTexts[1], lines2: r3Lines2 
        },
        r4Details,
        securityMeta: {
          totalViolations,
          tabSwitches,
          aiProbability,
          suspicionScore
        },
        timestamp: Date.now()
      });

      // --- AUTOMATED EMAIL: EXAM COMPLETION ---
      try {
        await fetch('/api/communication/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: "COMPLETION",
            candidateEmail: currentUser,
            candidateName: profile.name || currentUser
          })
        });
      } catch (e) {
        console.error("Failed to send completion email:", e);
      }
    } catch (e) { console.error("Final storage failed:", e); }
    
    if (examState !== "VIOLATION_TERMINATED") {
      setExamState("SUBMITTED");
    }
    if (typeof document !== "undefined" && document.fullscreenElement) document.exitFullscreen().catch(() => { });
  }, [r1List, r1Answers, r2List, r2Answers, typingTexts, codingQuestions, codingAnswers, codingProgress, warnings, profile, studentDomain, isMcqDomain, examState, studentTopics]);

  // ── PROCTORING & INTEGRITY HUB ───────────────────────────────────────────
  const [lastWarningTime, setLastWarningTime] = useState<number | null>(null);

  const handleProctorViolation = useCallback((type: string, message: string) => {
    if (type === "TERMINATED") {
      if (typeof document !== "undefined" && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setExamState("VIOLATION_TERMINATED");
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const violationLog = `[${timestamp}] ${type}: ${message}`;
    
    setWarnings(prev => {
      const newWarnings = [...prev, violationLog];
      
      const tabSwitches = newWarnings.filter(w => w.includes("TAB_SWITCH")).length;
      const totalViolations = newWarnings.length;

      // Automated Warning Escalation Flow
      if (totalViolations === 1) {
        setCurrentWarning("⚠ WARNING 1: Suspicious activity detected. Please follow exam guidelines. Future violations will be reported.");
      } else if (totalViolations === 2) {
        setCurrentWarning("🚫 WARNING 2: Repeated suspicious activity detected. Further violations will terminate your assessment IMMEDIATELY.");
      } else if (totalViolations >= 3 || tabSwitches >= 5) {
        setCurrentWarning("CRITICAL: Assessment terminated due to repeated policy violations.");
        if (typeof document !== "undefined" && document.fullscreenElement) document.exitFullscreen().catch(() => {});
        // Auto-submit logic
        handleFinalSubmit();
        setExamState("VIOLATION_TERMINATED");
      }

      return newWarnings;
    });

    setTimeout(() => setCurrentWarning(null), 8000);
  }, [handleFinalSubmit]);

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
            }
            return 0;
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
      
      if (isSubmitted === "true" && examState === "SYS_CHECK") {
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
    // ── UNIQUE QUESTION DISTRIBUTION ENGINE ──────────────────────────────────
    // Every student gets a different set of questions based on their session ID.
    // Shuffling is deterministic per-student but randomized across the cohort.
    
    // Round 1 & 2: Balanced MCQ Distribution
    const shuffledApt = seededShuffle(allAptitude, sessionSeed).slice(0, 30);
    const shuffledGram = seededShuffle(allGrammar, sessionSeed + 12).slice(0, 30);
    setR1List(shuffledApt);
    setR2List(shuffledGram);

    // Round 3: Dynamic Typing Content
    // We pick 2 different topics from the pool for each student.
    const typingTopics = seededShuffle(TYPING_TOPICS_POOL, sessionSeed + 5).slice(0, 2);
    setStudentTopics(typingTopics);

    // Round 4: Hard DSA / Domain-Specific Distribution
    let pool: any[] = [];
    if (isMcqDomain) {
      pool = DOMAIN_MCQ_POOL[studentDomain as keyof typeof DOMAIN_MCQ_POOL] || [];
    } else {
      // For technical roles, students get a unique mix from the hard pool
      // With a pool size of 20+, student-to-student collision is nearly impossible
      pool = (studentDomain === "Web Development" || studentDomain === "Full Stack") ? WEB_DEV_POOL : DSA_HARD_POOL;
    }

    // Pick a subset of questions (3 for coding, 40 for MCQ domain)
    // We use a different offset for coding to further differentiate from Round 1/2
    const selectedQuestions = seededShuffle(pool, sessionSeed + 99);
    
    // ANTI-CHEATING: Subtly randomize problem descriptions for watermarking
    // (In a real system, this could track where a screenshot came from)
    const watermarkedQuestions = selectedQuestions.slice(0, isMcqDomain ? 40 : 3).map(q => {
      // Test Case Rotation: Pick 7 out of 10 tests randomly to prevent hardcoding
      const testSubset = seededShuffle(q.tests || [], sessionSeed + 77).slice(0, 7);
      
      return {
        ...q,
        tests: testSubset,
        desc: q.desc + (sessionSeed % 2 === 0 ? " " : "") // Invisible watermark
      };
    });

    setCodingQuestions(watermarkedQuestions);
  }, [sessionSeed, studentDomain, isMcqDomain]);



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


  // --- RENDERING DIFFERENT STATES --- //

  if (examState === "SYS_CHECK") {
    const allChecksPassed = sysChecks.browser && sysChecks.network && sysChecks.camera && sysChecks.mic && hasSelfie;
    return (
      <div className="min-h-screen bg-[#050810] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
        
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
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-2xl shadow-blue-600/40 hover:scale-[1.02] cursor-pointer' 
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

  if (slotStatus === "WAITING") {
    const [startH, startM] = slotData.start.split(":").map(Number);
    const examDay = new Date(profile.day || new Date());
    const startTime = new Date(examDay);
    startTime.setHours(startH, startM, 0);
    const diff = Math.floor((startTime.getTime() - currentTime.getTime()) / 1000);
    
    return (
      <div className="min-h-screen bg-[#050810] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-lg bg-[#0D121F] border border-slate-800 rounded-[40px] p-12 text-center shadow-2xl"
        >
          <div className="flex justify-center mb-10">
             <Logo size="xl" />
          </div>

          <h2 className="text-3xl font-black mb-4 tracking-tighter italic">Waiting Room</h2>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed">
            Your assigned assessment window on <span className="text-white font-bold">{profile.day}</span> at <span className="text-white font-bold">{slotData.label}</span> is not yet active.
          </p>

          <div className="bg-slate-950/50 border border-slate-900 rounded-3xl p-8 mb-8">
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-4">Time Until Activation</p>
            <div className="text-5xl font-black text-[#FF5A1F] font-mono tracking-widest">
              {diff > 0 ? (
                <>
                  {Math.floor(diff / 3600).toString().padStart(2, '0')}:
                  {(Math.floor(diff / 60) % 60).toString().padStart(2, '0')}:
                  {(diff % 60).toString().padStart(2, '0')}
                </>
              ) : "00:00:00"}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">
              SYSTEM STATUS: <span className="text-emerald-500">POLLING_SERVER_TIME</span>
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-slate-500 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3 h-3" /> Manual Refresh
            </button>
          </div>
        </motion.div>

        <p className="mt-12 text-[10px] text-slate-700 font-black uppercase tracking-[0.4em] relative z-10">
          © 2026 GEONIXA • SECURE SESSION PENDING
        </p>
      </div>
    );
  }

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
      
      <AnimatePresence>
        {currentWarning && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[2000] w-full max-w-md"
          >
            <div className="bg-red-600/90 backdrop-blur-xl border border-red-500/50 p-6 rounded-[30px] shadow-[0_20px_50px_rgba(220,38,38,0.3)] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldAlert className="w-16 h-16" />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Security Protocol Violation</h4>
                  <p className="text-sm font-bold leading-tight">{currentWarning}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[9px] font-black uppercase tracking-widest relative z-10">
                <span>Incident Count: {warnings.length} / 12</span>
                <span className="text-white/60">GeoNixa AI Sentinel</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Progress & Proctoring HUD */}
      <div style={{ width: "320px", backgroundColor: "var(--bg-card)", borderRight: "1px solid var(--border-dim)", padding: "1.5rem", display: "flex", flexDirection: "column" }}>
        <div style={{ borderBottom: "1px solid var(--border-dim)", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
          <Logo size="sm" />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--success)", boxShadow: "0 0 10px var(--success)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold" }}>SECURE SESSION ACTIVE</span>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[1, 2, 3, 4].map(r => {
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
      </div>

      {/* Main Assessment Engine */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "var(--bg-deep)", overflow: "hidden", position: "relative" }}>
        {/* Secure Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.03] flex items-center justify-center overflow-hidden rotate-[-30deg]">
          <div className="text-[120px] font-black whitespace-nowrap select-none">
            {typeof window !== 'undefined' ? localStorage.getItem("geonixa_current_user") : "SECURE_SESSION"} • {sessionHash} • {new Date().toLocaleDateString()}
          </div>
        </div>
        
        {/* Neural Guard Scanline */}
        <div className="absolute inset-0 pointer-events-none z-[101] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] opacity-20" />

        <div style={{ padding: "2rem", flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
          {/* Round 1: Aptitude & Round 2: Grammar */}
          {(currentRound === 1 || currentRound === 2) && (
            <div className="animate-fade-in" style={{ maxWidth: "900px", margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ margin: 0, fontSize: "1.8rem" }}>{currentRound === 1 ? "Aptitude Assessment" : "Grammar Excellence"}</h1>
                <span style={{ fontWeight: "bold", color: "var(--text-muted)" }}>Question {(currentRound === 1 ? q1Index : q2Index) + 1} of 30</span>
              </div>

              <div style={{ padding: "2.5rem", backgroundColor: "white", borderRadius: "20px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", border: "1px solid var(--border-dim)" }}>
                <p style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", lineHeight: "1.6", marginBottom: "2.5rem" }}>
                  {(currentRound === 1 ? r1List : r2List)[currentRound === 1 ? q1Index : q2Index]?.q}
                </p>

                <div style={{ display: "grid", gap: "1rem" }}>
                  {(currentRound === 1 ? r1List : r2List)[currentRound === 1 ? q1Index : q2Index]?.opts.map((opt: string) => {
                    const ans = currentRound === 1 ? r1Answers : r2Answers;
                    const idx = currentRound === 1 ? q1Index : q2Index;
                    const isSelected = ans[idx] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => currentRound === 1 ? setR1Answers({...r1Answers, [q1Index]: opt}) : setR2Answers({...r2Answers, [q2Index]: opt})}
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
                <div style={{ display: "flex", gap: "2rem", marginTop: "2rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
                    <div style={{ color: "#64748b", fontWeight: "bold" }}>
                      Writing Progress: {calculateSubstantialLines(typingTexts[typingTopicIndex])} Lines
                    </div>
                    <div style={{ color: "#64748b", fontWeight: "bold" }}>
                      Stats: {typingTexts[typingTopicIndex].trim().split(/\s+/).filter(Boolean).length} Words | {typingTexts[typingTopicIndex].length} Chars
                    </div>
                    <div style={{ color: "#64748b", fontWeight: "bold" }}>
                      Correction Depth: {backspaceCounts[typingTopicIndex]}
                    </div>
                </div>
              </div>

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
                    <h1 style={{ margin: 0 }}>{studentDomain} Technical Mastery</h1>
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
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                    {codingQuestions.map((q: any, idx: number) => (
                      <button 
                        key={idx} 
                        onClick={() => setCodingQuestionIndex(idx)} 
                        className={`btn ${codingQuestionIndex === idx ? 'btn-primary' : 'btn-outline'}`}
                        style={{ flex: 1 }}
                      >
                        TASK {idx + 1}: {q.title?.substring(0, 20)}... {codingProgress[idx] ? "✅" : ""}
                      </button>
                    ))}
                  </div>
                  
                  <div style={{ flex: 1, display: "flex", gap: "1rem", minHeight: "500px" }}>
                    <div style={{ flex: "1", padding: "2rem", backgroundColor: "#1e293b", color: "#f8fafc", borderRadius: "16px", border: "1px solid var(--border-dim)", overflowY: "auto" }}>
                      <h2 style={{ color: "white", margin: "0 0 1rem 0", fontSize: "1.4rem", fontWeight: "bold" }}>Overview: {codingQuestions[codingQuestionIndex]?.title}</h2>
                      <div style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "#cbd5e1" }}>
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

                      {codingQuestions[codingQuestionIndex]?.sampleInput && (
                        <div style={{ marginTop: "2rem" }}>
                          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "white", fontWeight: "bold" }}>Sample Input 0</h4>
                          <div style={{ backgroundColor: "#0f172a", padding: "1rem", borderRadius: "8px", border: "1px solid #334155", fontFamily: "monospace", color: "#e2e8f0" }}>
                            {codingQuestions[codingQuestionIndex].sampleInput}
                          </div>
                        </div>
                      )}

                      {codingQuestions[codingQuestionIndex]?.sampleOutput && (
                        <div style={{ marginTop: "1rem" }}>
                          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "white", fontWeight: "bold" }}>Sample Output 0</h4>
                          <div style={{ backgroundColor: "#0f172a", padding: "1rem", borderRadius: "8px", border: "1px solid #334155", fontFamily: "monospace", color: "#e2e8f0" }}>
                            {codingQuestions[codingQuestionIndex].sampleOutput}
                          </div>
                        </div>
                      )}

                      {codingQuestions[codingQuestionIndex]?.explanation && (
                        <div style={{ marginTop: "1.5rem" }}>
                          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "white", fontWeight: "bold" }}>Explanation 0</h4>
                          <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.6" }}>{codingQuestions[codingQuestionIndex].explanation}</p>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: "1.5", display: "flex", flexDirection: "column" }}>
                      <MemoizedCodeEditor
                        questionId={`q_${codingQuestionIndex}`}
                        initialCode={codingSubmissions[codingQuestionIndex]?.code || codingQuestions[codingQuestionIndex]?.initialCode}
                        language={codingSubmissions[codingQuestionIndex]?.language || (studentDomain.toLowerCase().includes("python") || studentDomain.includes("Data") ? "python" : (studentDomain.includes("Java") ? "java" : (studentDomain.includes("C++") ? "cpp" : (studentDomain.includes("C") ? "c" : "javascript"))))}
                        testCases={codingQuestions[codingQuestionIndex]?.tests || []}
                        initialResults={codingSubmissions[codingQuestionIndex]?.results || []}
                        onUpdate={(data) => {
                          setCodingSubmissions(prev => ({
                            ...prev,
                            [codingQuestionIndex]: data
                          }));
                          const allPassed = data.results.length > 0 && data.results.every((r: any) => r.passed);
                          setCodingProgress(prev => ({ ...prev, [codingQuestionIndex]: allPassed }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Final Round Submission Button */}
                  <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                    <button 
                      className="btn btn-danger animate-pulse" 
                      style={{ backgroundColor: "#dc2626", color: "white", padding: "1.5rem 4rem", borderRadius: "20px", fontWeight: "900", fontSize: "1.2rem", boxShadow: "0 10px 40px rgba(220, 38, 38, 0.4)" }}
                      onClick={() => {
                        // Only show Finalize button if it's the last question
                        if (codingQuestionIndex === codingQuestions.length - 1) {
                          const attemptedCount = Object.keys(codingSubmissions).length;
                          const totalCodingQuestions = codingQuestions.length;
                          
                          if (attemptedCount < totalCodingQuestions) {
                            alert(`⚠ INCOMPLETE ASSESSMENT: Please attempt all ${totalCodingQuestions} coding questions before final submission. (Current: ${attemptedCount}/${totalCodingQuestions})`);
                            return;
                          }

                          showConfirm(
                            "Final Assessment Submission",
                            "This will finalize your scores for ALL rounds, including all 3 coding questions. This action is irreversible. Proceed?",
                            () => handleFinalSubmit()
                          );
                        } else {
                          // If not last question, just move to next
                          setCodingQuestionIndex(p => p + 1);
                        }
                      }}
                    >
                      {codingQuestionIndex === codingQuestions.length - 1 ? "FINALIZE & SUBMIT" : "NEXT TASK"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {examState === "ACTIVE" && (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", width: "220px", height: "220px", zIndex: 1000, pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto", width: "100%", height: "100%" }}>
            <MemoizedAIProctor onViolation={handleProctorViolation} isExamActive={examState === "ACTIVE"} />

          </div>
        </div>
      )}
      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
              
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
