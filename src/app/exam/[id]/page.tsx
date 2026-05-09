"use client";

import { use, useEffect, useRef, useState, useCallback } from "react";
import AIProctor from "@/components/proctoring/AIProctor";
import CodeEditor from "@/components/editor/CodeEditor";
import { storeExamAnswers } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Timer, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronLeft,
  Lock,
  Keyboard,
  Code2,
  BrainCircuit,
  MessageSquare,
  FileText
} from "lucide-react";

// --- TYPES ---
type ExamState = "SYS_CHECK" | "INSTRUCTIONS" | "ACTIVE" | "SUBMITTED" | "CHEATING_TERMINATED";
type RoundType = "APTITUDE" | "GRAMMAR" | "TYPING" | "DOMAIN_SPECIAL" | "FEEDBACK";

interface Question {
  q: string;
  opts: string[];
  correctAnswer: string;
}

// --- CONSTANTS & POOLS ---
const TYPING_TOPICS = [
  { 
    id: 1, 
    title: "The Future of Artificial Intelligence", 
    text: "Artificial Intelligence is no longer a concept of the future; it is actively reshaping our world today. From autonomous vehicles navigating complex city streets to sophisticated algorithms predicting global market trends, AI is integrated into the fabric of modern society. However, this rapid advancement brings about significant ethical considerations that we must address. We must ensure that AI systems are developed with transparency, accountability, and a commitment to human values. The challenge lies in balancing innovation with security, ensuring that the benefits of AI are distributed equitably across all sectors of society while mitigating risks such as bias and job displacement. As we move forward, the collaboration between humans and machines will define the next era of progress, requiring a new set of skills and a robust regulatory framework to guide this powerful technology toward the betterment of humanity."
  },
  { 
    id: 2, 
    title: "Global Sustainability and Climate Action", 
    text: "The urgency of addressing climate change has never been more apparent than it is in the present decade. Rising global temperatures, melting polar ice caps, and an increase in extreme weather events are clear indicators that our planet is in a state of environmental crisis. Sustainable development is not just an option but a necessity for the survival of future generations. This requires a fundamental shift in how we produce and consume energy, moving away from fossil fuels toward renewable sources like solar and wind power. Additionally, we must adopt circular economy principles to reduce waste and preserve biodiversity. Every individual, corporation, and government has a role to play in this transition. Through collective action and technological innovation, we can build a resilient future that harmonizes economic growth with ecological preservation, ensuring a healthy planet for all."
  }
];

export default function ExamSession({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;
  
  // --- STATE ---
  const [examState, setExamState] = useState<ExamState>("SYS_CHECK");
  const [currentRound, setCurrentRound] = useState<RoundType>("APTITUDE");
  const [roundStep, setRoundStep] = useState(1); // For multi-step rounds like Typing
  const [userDomain, setUserDomain] = useState<string>("Java");
  const [isTech, setIsTech] = useState<boolean>(true);
  
  // Timers
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Questions
  const [aptQuestions, setAptQuestions] = useState<Question[]>([]);
  const [gramQuestions, setGramQuestions] = useState<Question[]>([]);
  const [domainQuestions, setDomainQuestions] = useState<Question[]>([]);
  const [codingQuestions, setCodingQuestions] = useState<any[]>([]);

  // Answers
  const [aptAnswers, setAptAnswers] = useState<Record<number, string>>({});
  const [gramAnswers, setGramAnswers] = useState<Record<number, string>>({});
  const [domainAnswers, setDomainAnswers] = useState<Record<number, string>>({});
  const [typingData, setTypingData] = useState({ round1: "", round2: "" });
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [codingResults, setCodingResults] = useState<any[]>([]);

  // Proctoring
  const [violationCount, setViolationCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);
  const blockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [proctorLogs, setProctorLogs] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Indexing for UI
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // System Checks
  const [sysChecks, setSysChecks] = useState({ browser: true, camera: false, mic: false, network: true });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasSelfie, setHasSelfie] = useState(false);

  // Feedback State
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    // Load User Data
    const email = typeof window !== 'undefined' ? localStorage.getItem("geonixa_current_user") : null;
    if (email) {
      // In a real app, fetch from Firebase. Here we simulate.
      const domain = localStorage.getItem(`geonixa_domain_${email}`) || "Java";
      setUserDomain(domain);
      setIsTech(["Java", "Python", "Web Development", "Data Science", "Data Analytics"].includes(domain));
      
      // Initialize Questions with Seed
      initializeQuestions(email, domain);
    }
  }, []);

  const initializeQuestions = async (email: string, domain: string) => {
    // Shuffling with seed
    const seed = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = (s: number) => {
      const x = Math.sin(s++) * 10000;
      return x - Math.floor(x);
    };

    const shuffle = (array: any[], s: number) => {
      let m = array.length, t, i;
      while (m) {
        i = Math.floor(seededRandom(s + m) * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }
      return array;
    };

    // Load from JSON files (Aptitude & Grammar)
    try {
      const aptRes = await fetch('/apt.json');
      const gramRes = await fetch('/gram.json');
      const aptData = await aptRes.json();
      const gramData = await gramRes.json();

      setAptQuestions(shuffle([...aptData], seed).slice(0, 30));
      setGramQuestions(shuffle([...gramData], seed).slice(0, 30));

      // Domain Questions (Non-Tech)
      if (!isTech) {
        // Sample domain questions generator
        const domainPool = [
          { q: `What is the primary objective of ${domain} in industrial applications?`, opts: ["Efficiency", "Decoration", "Storage", "None"], correctAnswer: "Efficiency" },
          // ... add more or fetch from a domain.json
        ];
        // Fill up to 40
        while(domainPool.length < 40) domainPool.push({ ...domainPool[0], q: `${domainPool.length + 1}. ` + domainPool[0].q });
        setDomainQuestions(shuffle(domainPool, seed));
      } else {
        // Coding Questions (Tech) - Step 3 Compulsory
        let domainQ3 = {
          title: `${domain} Architecture Challenge`,
          difficulty: "Expert",
          desc: `Write advanced implementation in ${domain}. Must handle high concurrency and optimal space complexity.`,
          initialCode: `// Use STRICTLY ${domain} language for this implementation\n`,
          tests: [{ input: "domain_init", output: "success" }]
        };
        
        if (domain.includes("Web")) {
          domainQ3 = {
            title: "Web Development: Landing Page",
            difficulty: "Medium",
            desc: "Create a modern landing page structure using HTML, CSS, and Javascript. Ensure DOM manipulation handles dynamic updates securely.",
            initialCode: "<!-- HTML & JS Code Here -->\n<html>\n<body>\n  <div id='app'></div>\n</body>\n</html>",
            tests: [{ input: "render()", output: "DOM_Attached" }]
          };
        } else if (domain.includes("Data")) {
          domainQ3 = {
            title: "Data Analytics / Science Modeling",
            difficulty: "Hard",
            desc: "Write Python code using Pandas/NumPy paradigms to cleanse the provided dataset matrix and execute linear regression projection.",
            initialCode: "import pandas as pd\nimport numpy as np\n\ndef analyze_data(matrix):\n    # Implement here",
            tests: [{ input: "[[1,2],[3,4]]", output: "regression_success" }]
          };
        }

        const codingPool = [
          { 
            title: "Q1. Median of Two Sorted Arrays (LeetCode Hard)", 
            difficulty: "Hard",
            desc: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)). Use C, C++, Java, Python, C#, or JS.",
            initialCode: "function findMedianSortedArrays(nums1, nums2) {\n  \n}",
            tests: [
              { input: "[1,3], [2]", output: "2.0" }, { input: "[1,2], [3,4]", output: "2.5" },
              { input: "[0,0], [0,0]", output: "0.0" }, { input: "[], [1]", output: "1.0" },
              { input: "[2], []", output: "2.0" }, { input: "[1,2,3,4], [5,6,7,8]", output: "4.5" },
              { input: "[10,20], [30]", output: "20.0" }, { input: "[-5,-3], [-2,-1]", output: "-2.5" },
              { input: "[1,10], [2,9,3,8]", output: "5.5" }, { input: "[1,5], [2,3,4,6]", output: "3.5" }
            ]
          },
          { 
            title: "Q2. Merge k Sorted Lists (LeetCode Hard)", 
            difficulty: "Hard",
            desc: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it. Write in your preferred language.",
            initialCode: "function mergeKLists(lists) {\n  \n}",
            tests: [
              { input: "[[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" },
              { input: "[]", output: "[]" }, { input: "[[]]", output: "[]" },
              { input: "[[1]]", output: "[1]" }, { input: "[[1,2],[3,4]]", output: "[1,2,3,4]" },
              { input: "[[-1,5,11],[-2,10],[0,1]]", output: "[-2,-1,0,1,5,10,11]" },
              { input: "[[2,6],[1,4],[3,5]]", output: "[1,2,3,4,5,6]" },
              { input: "[[0],[0],[0]]", output: "[0,0,0]" },
              { input: "[[1,3,5,7],[2,4,6,8]]", output: "[1,2,3,4,5,6,7,8]" },
              { input: "[[1,2,3],[4,5,6],[7,8,9]]", output: "[1,2,3,4,5,6,7,8,9]" }
            ]
          },
          domainQ3
        ];
        setCodingQuestions(codingPool);
      }
    } catch (e) {
      console.error("Failed to load questions", e);
    }
  };

  // --- TIMER LOGIC ---
  const startTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleRoundAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRoundAutoSubmit = () => {
    if (currentRound === "APTITUDE") advanceRound("GRAMMAR");
    else if (currentRound === "GRAMMAR") advanceRound("TYPING");
    else if (currentRound === "TYPING") {
      if (roundStep === 1) {
        setRoundStep(2);
        startTimer(5 * 60);
      } else {
        advanceRound("DOMAIN_SPECIAL");
      }
    }
    else if (currentRound === "DOMAIN_SPECIAL") finalizeExam();
  };

  const advanceRound = (next: RoundType) => {
    setCurrentRound(next);
    setCurrentQIndex(0);
    setRoundStep(1);
    
    if (next === "APTITUDE") startTimer(10 * 60);
    else if (next === "GRAMMAR") startTimer(10 * 60);
    else if (next === "TYPING") startTimer(5 * 60);
    else if (next === "DOMAIN_SPECIAL") startTimer(isTech ? 50 * 60 : 20 * 60);
  };

  // --- PROCTORING VIOLATIONS ---
  const handleViolation = useCallback((type: string, message: string) => {
    if (examState !== "ACTIVE" || isBlocked) return;

    setProctorLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${type}: ${message}`]);

    if (type === "TAB_SWITCH" || type === "SCREENSHOT") {
      terminateExamForCheating();
      return;
    }

    const nextCount = violationCount + 1;
    setViolationCount(nextCount);

    if (nextCount === 1) {
      triggerBlock(2 * 60); // 2 min wait
    } else if (nextCount === 2) {
      triggerBlock(5 * 60); // 5 min wait
    } else {
      finalizeExam(); // 3rd warning -> Auto Submit
    }
  }, [examState, violationCount, isBlocked]);

  const triggerBlock = (seconds: number) => {
    setIsBlocked(true);
    setBlockTime(seconds);
    if (blockTimerRef.current) clearInterval(blockTimerRef.current);
    blockTimerRef.current = setInterval(() => {
      setBlockTime(prev => {
        if (prev <= 1) {
          clearInterval(blockTimerRef.current!);
          setIsBlocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const terminateExamForCheating = () => {
    setExamState("CHEATING_TERMINATED");
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    finalizeExam(true);
  };

  const finalizeExam = async (isCheating = false) => {
    setExamState("SUBMITTED");
    if (timerRef.current) clearInterval(timerRef.current);
    if (blockTimerRef.current) clearInterval(blockTimerRef.current);
    
    // Calculate Scores (Round 1: 15, Round 2: 15, Round 3: 10, Round 4: 60)
    const calculateMCQScore = (questions: Question[], answers: Record<number, string>, marksPerQ: number) => {
      let correct = 0;
      let wrong = 0;
      questions.forEach((q, i) => {
        if (answers[i]) {
          if (answers[i] === q.correctAnswer) correct++;
          else wrong++;
        }
      });
      // Negative marking: 3 wrong = -1 mark (as requested)
      const negativeMarks = Math.floor(wrong / 3);
      const rawScore = (correct * marksPerQ) - negativeMarks;
      return { score: Math.max(0, rawScore), correct, wrong };
    };

    // Aptitude (30 Qs * 0.5 = 15 marks)
    const aptResult = calculateMCQScore(aptQuestions, aptAnswers, 0.5);
    // Grammar (30 Qs * 0.5 = 15 marks)
    const gramResult = calculateMCQScore(gramQuestions, gramAnswers, 0.5);
    // Domain MCQ (Non-Tech: 40 Qs * 1.5 = 60 marks)
    const domainResult = isTech ? {score:0, correct:0, wrong:0} : calculateMCQScore(domainQuestions, domainAnswers, 1.5);

    const email = localStorage.getItem("geonixa_current_user") || "anonymous";
    const payload = {
      examId,
      email,
      domain: userDomain,
      isTech,
      aptScore: aptResult.score,
      aptCorrect: aptResult.correct,
      aptWrong: aptResult.wrong,
      gramScore: gramResult.score,
      gramCorrect: gramResult.correct,
      gramWrong: gramResult.wrong,
      domainScore: domainResult.score,
      domainCorrect: domainResult.correct,
      domainWrong: domainResult.wrong,
      typingData,
      codingResults,
      violations: proctorLogs,
      isCheating,
      timestamp: Date.now()
    };

    await storeExamAnswers(email, payload);
    localStorage.setItem(`geonixa_status_${email}`, "SUBMITTED");
  };

  // --- UI COMPONENTS ---
  const renderProgressBar = () => {
    const rounds: RoundType[] = ["APTITUDE", "GRAMMAR", "TYPING", "DOMAIN_SPECIAL"];
    return (
      <div className="flex items-center gap-1 mb-8">
        {rounds.map((r, i) => (
          <div key={r} className="flex-1 flex flex-col gap-2">
            <div className={`h-1 rounded-full transition-all duration-500 ${
              rounds.indexOf(currentRound) >= i ? "bg-[#FF5A1F]" : "bg-slate-800"
            }`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${
              currentRound === r ? "text-[#FF5A1F]" : "text-slate-600"
            }`}>{r}</span>
          </div>
        ))}
      </div>
    );
  };

  // --- MAIN RENDER ---
  if (examState === "SYS_CHECK") {
    return (
      <div className="min-h-screen bg-[#050810] text-white flex flex-col items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl bg-[#0D121F] border border-slate-900 rounded-3xl p-12 shadow-2xl">
          <div className="flex items-center gap-3 mb-12">
            <Shield className="text-[#FF5A1F] w-10 h-10" />
            <h1 className="text-3xl font-black italic tracking-tighter">GEONIXA <span className="text-slate-500 font-normal text-sm not-italic uppercase tracking-widest ml-4">System Integrity Scan</span></h1>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-bold border-b border-slate-800 pb-4 mb-6">Hardware Status</h3>
              {[
                { label: "Browser Compatibility", status: sysChecks.browser },
                { label: "Network Latency Check", status: sysChecks.network },
                { label: "Webcam Discovery", status: sysChecks.camera },
                { label: "Microphone Discovery", status: sysChecks.mic },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-900">
                  <span className="text-slate-400 font-medium">{item.label}</span>
                  {item.status ? <CheckCircle2 className="text-emerald-500" /> : <div className="w-5 h-5 border-2 border-slate-800 border-t-[#FF5A1F] rounded-full animate-spin" />}
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold self-start border-b border-slate-800 pb-4 mb-6 w-full">Biometric Verification</h3>
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden mb-6 border-2 border-slate-800 relative">
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                {!sysChecks.camera && <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">Waiting for hardware access...</div>}
              </div>
              <button 
                onClick={() => {
                  setSysChecks(s => ({ ...s, camera: true, mic: true }));
                  setHasSelfie(true);
                  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                    if (videoRef.current) videoRef.current.srcObject = stream;
                  });
                }}
                className={`w-full py-4 rounded-xl font-bold transition-all ${hasSelfie ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : "bg-[#FF5A1F] text-white"}`}
              >
                {hasSelfie ? "IDENTITY VERIFIED ✓" : "CAPTURE BIOMETRIC KEY"}
              </button>
            </div>
          </div>

          <button 
            disabled={!hasSelfie}
            onClick={() => setExamState("INSTRUCTIONS")}
            className="w-full mt-12 py-5 bg-white text-black font-black text-xl rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
          >
            AUTHORIZE COMMENCEMENT
          </button>
        </motion.div>
      </div>
    );
  }

  if (examState === "INSTRUCTIONS") {
    return (
      <div className="min-h-screen bg-[#050810] text-white flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl w-full bg-[#0D121F] border border-slate-900 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#FF5A1F]" />
          <h1 className="text-4xl font-black mb-8 flex items-center gap-4">
            <AlertTriangle className="text-[#FF5A1F] w-10 h-10" /> PROCTORING PROTOCOL
          </h1>
          
          <div className="space-y-6 text-slate-400 mb-12">
            <p className="leading-relaxed">You are entering a high-security assessment environment. The following rules are enforced by GeoNixa AI Neural Guard:</p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-1"><XCircle className="w-4 h-4 text-red-500" /></div>
                <span><strong className="text-white">TAB SWITCHING:</strong> Any attempt to leave this tab will result in <strong className="text-red-500">IMMEDIATE DISQUALIFICATION</strong> and auto-submission.</span>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-[#FF5A1F]/10 flex items-center justify-center shrink-0 mt-1"><Timer className="w-4 h-4 text-[#FF5A1F]" /></div>
                <span><strong className="text-white">BEHAVIORAL WARNINGS:</strong> Suspicious movement or noise triggers a lockdown. (1st: 2m, 2nd: 5m, 3rd: TERMINATE).</span>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-1"><BrainCircuit className="w-4 h-4 text-blue-500" /></div>
                <span><strong className="text-white">EXAM STRUCTURE:</strong> Aptitude (10m), Grammar (10m), Typing (10m), and Domain Special (20-50m).</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={async () => {
              try {
                if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
                setExamState("ACTIVE");
                advanceRound("APTITUDE");
              } catch (e) {
                alert("Fullscreen authorization required.");
              }
            }}
            className="w-full py-5 bg-[#FF5A1F] text-white font-black text-xl rounded-2xl shadow-[0_10px_30px_rgba(255,90,31,0.3)] hover:translate-y-[-2px] transition-all"
          >
            START ASSESSMENT NOW
          </button>
        </motion.div>
      </div>
    );
  }

  if (examState === "SUBMITTED" || examState === "CHEATING_TERMINATED") {
    const submitFeedback = async () => {
      if (rating === 0) return alert("Please select a rating.");
      const email = localStorage.getItem("geonixa_current_user") || "anonymous";
      await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ email, rating, feedback: feedbackText })
      });
      setIsSubmitted(true);
    };

    return (
      <div className="min-h-screen bg-[#050810] text-white flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full bg-[#0D121F] border border-slate-900 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
          {examState === "CHEATING_TERMINATED" ? (
            <>
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-red-500/30">
                <Lock className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-4xl font-black text-red-500 mb-4 tracking-tighter italic">CHEATING DETECTED</h1>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Your session has been terminated by GeoNixa Neural Guard due to a critical security violation (Tab Switch / Screen Capture). 
                An incident report has been dispatched to corporate HQ.
              </p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-emerald-500/30">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h1 className="text-4xl font-black text-white mb-4 tracking-tighter italic">ASSESSMENT SECURED</h1>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Thank you for completing the GeoNixa Entrance Assessment. Your behavioral data and logical outputs are being processed by our evaluation engine.
              </p>
            </>
          )}
          
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 mb-8 text-left">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Post-Exam Feedback</h4>
            {isSubmitted ? (
              <div className="text-emerald-500 font-bold text-sm">Feedback secure. Results will be shared within 1 week.</div>
            ) : (
              <>
                <div className="flex gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setRating(s)} className={`w-10 h-10 rounded-lg border border-slate-800 flex items-center justify-center text-xl transition-colors ${rating >= s ? "bg-[#FF5A1F] text-white" : "bg-slate-900 text-slate-600"}`}>★</button>
                  ))}
                </div>
                <textarea 
                  className="w-full bg-transparent border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-[#FF5A1F]" 
                  placeholder="Tell us about your experience..." 
                  rows={3}
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                />
                <button onClick={submitFeedback} className="w-full mt-4 py-3 bg-[#FF5A1F] rounded-xl font-bold text-sm">Send Feedback</button>
              </>
            )}
          </div>

          <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">
            Exit Secure Environment
          </button>
        </motion.div>
      </div>
    );
  }

  // --- ACTIVE EXAM UI ---
  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col overflow-hidden select-none">
      {/* Header */}
      <header className="px-8 py-4 bg-[#080B14] border-b border-slate-900 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF5A1F] rounded flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter italic">GEONIXA</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${timeLeft < 60 ? "bg-red-500/10 border-red-500/50 text-red-500 animate-pulse" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
              <Timer className="w-4 h-4" />
              <span className="font-mono font-bold text-lg">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Candidate</p>
            <p className="text-sm font-bold">{userDomain} Domain</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-[#FF5A1F]/30 overflow-hidden bg-slate-900">
             {/* AI Proctor Mini-Preview could go here */}
             <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
             </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Block Overlay */}
        <AnimatePresence>
          {isBlocked && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-[#050810]/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border-2 border-red-500/30 animate-bounce">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-4xl font-black text-red-500 mb-4">LOCKDOWN ACTIVE</h2>
              <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
                System locked due to behavioral violation. Integrity cooling period in progress. 
                Do not attempt to refresh or bypass.
              </p>
              <div className="text-6xl font-black font-mono text-white">
                {Math.floor(blockTime / 60)}:{(blockTime % 60).toString().padStart(2, '0')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-8 overflow-y-auto">
          {renderProgressBar()}

          <div className="flex-1 max-w-4xl mx-auto w-full">
            {/* ROUND: APTITUDE / GRAMMAR */}
            {(currentRound === "APTITUDE" || currentRound === "GRAMMAR") && (
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black flex items-center gap-3 italic">
                    {currentRound === "APTITUDE" ? <BrainCircuit className="text-[#FF5A1F]" /> : <MessageSquare className="text-[#FF5A1F]" />}
                    {currentRound === "APTITUDE" ? "Logic & Quantitative Analysis" : "Linguistic Proficiency & Grammar"}
                  </h2>
                  <span className="text-slate-600 font-bold uppercase tracking-widest text-xs">Question {currentQIndex + 1} of 30</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentQIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="bg-[#0D121F] border border-slate-900 rounded-3xl p-10 shadow-xl">
                      <p className="text-xl font-medium leading-relaxed">
                        {(currentRound === "APTITUDE" ? aptQuestions : gramQuestions)[currentQIndex]?.q}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {(currentRound === "APTITUDE" ? aptQuestions : gramQuestions)[currentQIndex]?.opts.map((opt, i) => {
                        const ans = currentRound === "APTITUDE" ? aptAnswers : gramAnswers;
                        const setAns = currentRound === "APTITUDE" ? setAptAnswers : setGramAnswers;
                        const isSelected = ans[currentQIndex] === opt;
                        
                        return (
                          <button 
                            key={i}
                            onClick={() => setAns(prev => ({ ...prev, [currentQIndex]: opt }))}
                            className={`p-6 text-left rounded-2xl border transition-all flex items-center gap-4 group ${
                              isSelected ? "bg-[#FF5A1F] border-[#FF5A1F] text-white" : "bg-[#0D121F] border-slate-900 hover:border-slate-700"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black transition-colors ${
                              isSelected ? "bg-white text-[#FF5A1F]" : "bg-slate-950 text-slate-500 group-hover:text-white"
                            }`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="font-bold">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center justify-between pt-8 border-t border-slate-900">
                  <button 
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex(prev => prev - 1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-white disabled:opacity-0 transition-all font-bold"
                  >
                    <ChevronLeft /> Previous
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${
                        (currentRound === "APTITUDE" ? aptAnswers : gramAnswers)[i] ? "bg-[#FF5A1F]" : "bg-slate-800"
                      }`} />
                    ))}
                  </div>
                  {currentQIndex < 29 ? (
                    <button 
                      onClick={() => setCurrentQIndex(prev => prev + 1)}
                      className="flex items-center gap-2 text-[#FF5A1F] hover:translate-x-1 transition-all font-black"
                    >
                      Next <ChevronRight />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleRoundAutoSubmit()}
                      className="bg-[#FF5A1F] px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all"
                    >
                      Lock Section
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ROUND: TYPING */}
            {currentRound === "TYPING" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black flex items-center gap-3 italic text-blue-500">
                    <Keyboard /> Speed & Accuracy Analysis
                  </h2>
                  <span className="text-slate-600 font-bold uppercase tracking-widest text-xs">Topic {roundStep} of 2</span>
                </div>

                <div className="bg-[#0D121F] border border-slate-900 rounded-3xl p-10">
                  <p className="text-slate-400 leading-relaxed mb-8 italic select-none">
                    "{TYPING_TOPICS[roundStep-1].text}"
                  </p>
                  
                  <textarea 
                    className="w-full h-64 bg-slate-950 border border-slate-800 rounded-2xl p-8 text-xl leading-relaxed focus:outline-none focus:border-blue-500 transition-all font-mono"
                    placeholder="Begin typing the above passage..."
                    value={roundStep === 1 ? typingData.round1 : typingData.round2}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTypingData(prev => ({ ...prev, [roundStep === 1 ? "round1" : "round2"]: val }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        if (backspaceCount >= 15) {
                          e.preventDefault();
                          alert("BACKSPACE LIMIT REACHED: You have used all 15 allowed deletions.");
                        } else {
                          setBackspaceCount(prev => prev + 1);
                        }
                      }
                    }}
                  />

                  <div className="flex items-center justify-between mt-6 text-xs font-bold text-slate-600 uppercase tracking-widest">
                    <div className="flex gap-8">
                      <span>Backspaces: <span className={backspaceCount > 10 ? "text-red-500" : "text-emerald-500"}>{backspaceCount}/15</span></span>
                      <span>Lines: <span className="text-white">{(roundStep === 1 ? typingData.round1 : typingData.round2).split('\n').filter(l => l.trim()).length}/18</span></span>
                    </div>
                    <button 
                      onClick={() => handleRoundAutoSubmit()}
                      className="text-blue-500 hover:underline"
                    >
                      {roundStep === 1 ? "Next Topic" : "Finalize Typing"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ROUND: DOMAIN_SPECIAL */}
            {currentRound === "DOMAIN_SPECIAL" && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black flex items-center gap-3 italic text-emerald-500">
                    {isTech ? <Code2 /> : <FileText />}
                    {isTech ? `Full-Stack ${userDomain} Engineering` : `${userDomain} Specialization Assessment`}
                  </h2>
                </div>

                {isTech ? (
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-[#0D121F] border border-slate-900 rounded-3xl p-6 shadow-xl shrink-0">
                      <div className="flex items-center justify-between mb-3">
                         <h3 className="text-xl font-bold text-white flex items-center gap-2">
                           <span className="text-[#FF5A1F]">Q{currentQIndex + 1}.</span> {codingQuestions[currentQIndex]?.title}
                         </h3>
                         <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold uppercase tracking-widest">
                           {codingQuestions[currentQIndex]?.difficulty || "Hard"}
                         </span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {codingQuestions[currentQIndex]?.desc}
                      </p>
                    </div>
                    <div className="flex-1 overflow-hidden rounded-3xl border border-slate-900 bg-black min-h-[500px]">
                       <CodeEditor 
                          initialCode={codingQuestions[currentQIndex]?.initialCode || ""}
                          language="javascript"
                          testCases={codingQuestions[currentQIndex]?.tests.map((t: any, i: number) => ({ id: i, input: t.input, expectedOutput: t.output })) || []}
                          onRunMode={async (code: string, lang: string) => {
                            const res = await fetch("/api/execute", {
                              method: "POST",
                              body: JSON.stringify({ code, language: lang }),
                              headers: { "Content-Type": "application/json" }
                            });
                            const data = await res.json();
                            return data.output || data.error || "No Output";
                          }}
                          onTestsStatusChange={(passed) => {
                            setCodingResults(prev => [...prev, { qIndex: currentQIndex, passed }]);
                            if (currentQIndex < 2) setCurrentQIndex(prev => prev + 1);
                            else finalizeExam();
                          }}
                       />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-[#0D121F] border border-slate-900 rounded-3xl p-10 shadow-xl">
                      <p className="text-xl font-medium leading-relaxed">
                        {domainQuestions[currentQIndex]?.q}
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {domainQuestions[currentQIndex]?.opts.map((opt, i) => {
                        const isSelected = domainAnswers[currentQIndex] === opt;
                        return (
                          <button 
                            key={i}
                            onClick={() => setDomainAnswers(prev => ({ ...prev, [currentQIndex]: opt }))}
                            className={`p-6 text-left rounded-2xl border transition-all flex items-center gap-4 group ${
                              isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "bg-[#0D121F] border-slate-900"
                            }`}
                          >
                            <span className="font-bold">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center pt-8">
                       <button disabled={currentQIndex === 0} onClick={() => setCurrentQIndex(p => p - 1)}>Back</button>
                       <span className="text-xs font-bold text-slate-700">Q {currentQIndex + 1} / 40</span>
                       {currentQIndex < 39 ? (
                         <button onClick={() => setCurrentQIndex(p => p + 1)} className="text-emerald-500 font-bold">Next Question</button>
                       ) : (
                         <button onClick={() => finalizeExam()} className="bg-emerald-500 px-10 py-3 rounded-xl font-bold">Submit Assessment</button>
                       )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="w-[350px] bg-[#080B14] border-l border-slate-900 p-8 hidden lg:flex flex-col">
          <div className="mb-8 p-6 bg-slate-950 rounded-2xl border border-slate-900 text-center">
            <h3 className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-4">Neural Guard Status</h3>
            <div className="w-32 h-32 rounded-full border-4 border-slate-900 mx-auto mb-4 relative flex items-center justify-center overflow-hidden">
                {/* Real-time AI Proctoring Component */}
                <AIProctor 
                  onViolation={handleViolation} 
                  isExamActive={examState === "ACTIVE"} 
                />
            </div>
            <div className="flex items-center justify-center gap-2 text-emerald-500 text-xs font-bold">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               LIVE FEED ACTIVE
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
             <h4 className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Incident Log</h4>
             {proctorLogs.length === 0 ? (
               <div className="text-xs text-slate-700 italic">No anomalies detected. Integrity verified.</div>
             ) : (
               proctorLogs.map((log, i) => (
                 <div key={i} className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-[10px] text-red-400 font-mono">
                   {log}
                 </div>
               ))
             )}
          </div>

          <div className="mt-auto pt-8 border-t border-slate-900">
             <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                <Lock className="w-4 h-4" />
                ENCRYPTED_STREAM_ID: {examId.slice(0, 8)}
             </div>
          </div>
        </div>
      </main>

      {/* Tab Switch Listener */}
      <TabSwitchHandler onViolation={() => handleViolation("TAB_SWITCH", "User left the assessment boundary.")} />
    </div>
  );
}

function TabSwitchHandler({ onViolation }: { onViolation: () => void }) {
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) onViolation();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [onViolation]);
  return null;
}
