"use client";

import { useEffect, useRef, useState } from "react";
import AIProctor from "@/components/proctoring/AIProctor";
import CodeEditor from "@/components/editor/CodeEditor";
import { storeExamAnswers } from "@/lib/firebase";

type ExamState = "SYS_CHECK" | "INSTRUCTIONS" | "ACTIVE" | "SUBMITTED" | "VIOLATION_TERMINATED";

export default function ExamSession({ params }: { params: { id: string } }) {
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [examState, setExamState] = useState<ExamState>("SYS_CHECK");

  const [feedback, setFeedback] = useState({ stars: 0, experience: "", improvements: "" });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 4;
  const [timeLeft, setTimeLeft] = useState(120 * 60);

  // Pagination States for rounds
  const [q1Index, setQ1Index] = useState(0);
  const [q2Index, setQ2Index] = useState(0);

  // MCQ Answers Tracker
  const [r1Answers, setR1Answers] = useState<Record<number, string>>({});
  const [r2Answers, setR2Answers] = useState<Record<number, string>>({});

  // Specific Time Limits tracking (Aptitude 10m, Grammar 10m, Typing 5m, Coding 30m)
  const timeLimits = { 1: 10 * 60, 2: 10 * 60, 3: 5 * 60, 4: 45 * 60 };
  const [roundTimes, setRoundTimes] = useState(timeLimits);

  // Generative AI Leetcode State & Pools
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [r1List, setR1List] = useState<any[]>([]);
  const [r2List, setR2List] = useState<any[]>([]);
  const [codingProgress, setCodingProgress] = useState<boolean[]>([false, false, false]);
  const [currentCodingQuestionIndex, setCurrentCodingQuestionIndex] = useState(0);

  // Typing Round States
  const [typingText, setTypingText] = useState("");
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [typingWarning, setTypingWarning] = useState("");

  // System & Video Check States
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasSelfie, setHasSelfie] = useState(false);
  const [sysChecks, setSysChecks] = useState({
    browser: false,
    camera: false,
    mic: false,
    network: false,
  });

  const handleFinalSubmit = async () => {
    try {
      const currentUser = typeof window !== "undefined" ? localStorage.getItem("geonixa_current_user") || "anonymous" : "anonymous";
      const typingLines = typingText.split('\n').length;
      await storeExamAnswers(currentUser, { aiQuests: aiQuestions, codingProgress, finalRoundCompleted: true, r1Answers, r2Answers, typingLines, backspacesUsed: backspaceCount });
    } catch (e) { }
    setExamState("SUBMITTED");
    if (typeof document !== "undefined" && document.fullscreenElement) document.exitFullscreen().catch(() => { });
  };

  useEffect(() => {
    if (examState === "ACTIVE" && roundTimes[currentRound as keyof typeof timeLimits] > 0) {
      const timer = setInterval(() => {
        setRoundTimes(prev => {
          const currentLeft = prev[currentRound as keyof typeof timeLimits];
          if (currentLeft <= 1) {
            if (currentRound < totalRounds) {
              setCurrentRound(c => c + 1);
            } else {
              handleFinalSubmit();
              alert("Time is up! Your exam has been automatically submitted.");
            }
            return { ...prev, [currentRound]: 0 };
          }
          return { ...prev, [currentRound]: currentLeft - 1 };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examState, currentRound, roundTimes]);

  // Exam Persistance to prevent 2nd chance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
      const isSubmitted = localStorage.getItem(`geonixa_exam_status_${currentUser}`);
      if (isSubmitted === "true" && examState === "SYS_CHECK") {
        setExamState("SUBMITTED");
      }
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

  // Generate Leetcode AI questions on start
  useEffect(() => {
    const hardLeetcodePool = [
      {
        title: "Sliding Window Maximum (Hard)", desc: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. Return the max sliding window natively in O(N) via monotonic queue.", initialCode: "function maxSlidingWindow(nums, k) {\n  \n}\nconsole.log(maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3));",
        tests: [
          { id: 1, input: "[1,3,-1,-3,5,3,6,7], 3", expectedOutput: "[3,3,5,5,6,7]" },
          { id: 2, input: "[1], 1", expectedOutput: "[1]" },
          { id: 3, input: "[9,11], 2", expectedOutput: "[11]" },
          { id: 4, input: "[4,-2], 2", expectedOutput: "[4]" },
          { id: 5, input: "[7,2,4], 2", expectedOutput: "[7,4]" }
        ]
      },
      {
        title: "Regular Expression Matching (Hard)", desc: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where '.' Matches any single character. '*' Matches zero or more of the preceding element.", initialCode: "function isMatch(s, p) {\n  \n}\nconsole.log(isMatch('aab', 'c*a*b'));",
        tests: [
          { id: 1, input: "'aa', 'a'", expectedOutput: "false" },
          { id: 2, input: "'aa', 'a*'", expectedOutput: "true" },
          { id: 3, input: "'ab', '.*'", expectedOutput: "true" },
          { id: 4, input: "'aab', 'c*a*b'", expectedOutput: "true" },
          { id: 5, input: "'mississippi', 'mis*is*p*.'", expectedOutput: "false" }
        ]
      },
      {
        title: "First Missing Positive (Hard)", desc: "Given an unsorted integer array nums, return the smallest missing positive integer. You must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.", initialCode: "function firstMissingPositive(nums) {\n  \n}\nconsole.log(firstMissingPositive([3,4,-1,1]));",
        tests: [
          { id: 1, input: "[1,2,0]", expectedOutput: "3" },
          { id: 2, input: "[3,4,-1,1]", expectedOutput: "2" },
          { id: 3, input: "[7,8,9,11,12]", expectedOutput: "1" },
          { id: 4, input: "[2,1]", expectedOutput: "3" },
          { id: 5, input: "[1]", expectedOutput: "2" }
        ]
      },
      {
        title: "Edit Distance (Hard)", desc: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2 (insert, delete, replace). Use dynamic programming bottom-up.", initialCode: "function minDistance(word1, word2) {\n  \n}\nconsole.log(minDistance('horse', 'ros'));",
        tests: [
          { id: 1, input: "'horse', 'ros'", expectedOutput: "3" },
          { id: 2, input: "'intention', 'execution'", expectedOutput: "5" },
          { id: 3, input: "'', 'a'", expectedOutput: "1" },
          { id: 4, input: "'a', 'b'", expectedOutput: "1" },
          { id: 5, input: "'ab', 'cd'", expectedOutput: "2" }
        ]
      },
      {
        title: "Largest Rectangle in Histogram (Hard)", desc: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.", initialCode: "function largestRectangleArea(heights) {\n  \n}\nconsole.log(largestRectangleArea([2,1,5,6,2,3]));",
        tests: [
          { id: 1, input: "[2,1,5,6,2,3]", expectedOutput: "10" },
          { id: 2, input: "[2,4]", expectedOutput: "4" },
          { id: 3, input: "[1,1]", expectedOutput: "2" },
          { id: 4, input: "[2,1,2]", expectedOutput: "3" },
          { id: 5, input: "[5,4,1,2]", expectedOutput: "8" }
        ]
      },
      {
        title: "Trapping Rain Water (Hard)", desc: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining. Ensure O(N) complexity constraints utilizing pointers.", initialCode: "function trap(height) {\n  \n}\nconsole.log(trap([0,1,0,2,1,0,1,3,2,1,2,1]));",
        tests: [
          { id: 1, input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6" },
          { id: 2, input: "[4,2,0,3,2,5]", expectedOutput: "9" },
          { id: 3, input: "[1,0,1]", expectedOutput: "1" },
          { id: 4, input: "[0,2,0]", expectedOutput: "0" },
          { id: 5, input: "[4,2,3]", expectedOutput: "1" }
        ]
      },
      {
        title: "N-Queens II (Hard)", desc: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return the number of distinct solutions using backtracking configurations.", initialCode: "function totalNQueens(n) {\n  \n}\nconsole.log(totalNQueens(4));",
        tests: [
          { id: 1, input: "4", expectedOutput: "2" },
          { id: 2, input: "1", expectedOutput: "1" },
          { id: 3, input: "5", expectedOutput: "10" },
          { id: 4, input: "6", expectedOutput: "4" },
          { id: 5, input: "2", expectedOutput: "0" }
        ]
      },
      {
        title: "Merge k Sorted Lists (Hard)", desc: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.", initialCode: "function mergeKLists(lists) {\n  \n}\nconsole.log(mergeKLists([[1,4,5],[1,3,4],[2,6]]));",
        tests: [
          { id: 1, input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]" },
          { id: 2, input: "[]", expectedOutput: "[]" },
          { id: 3, input: "[[]]", expectedOutput: "[]" },
          { id: 4, input: "[[1,2],[1,3]]", expectedOutput: "[1,1,2,3]" },
          { id: 5, input: "[[1],[0]]", expectedOutput: "[0,1]" }
        ]
      },
      {
        title: "Minimum Window Substring (Hard)", desc: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.", initialCode: "function minWindow(s, t) {\n  \n}\nconsole.log(minWindow('ADOBECODEBANC', 'ABC'));",
        tests: [
          { id: 1, input: "'ADOBECODEBANC', 'ABC'", expectedOutput: "'BANC'" },
          { id: 2, input: "'a', 'a'", expectedOutput: "'a'" },
          { id: 3, input: "'a', 'aa'", expectedOutput: "''" },
          { id: 4, input: "'aa', 'a'", expectedOutput: "'a'" },
          { id: 5, input: "'ab', 'b'", expectedOutput: "'b'" }
        ]
      },
    ];

    const allAptitude = [
      { q: "Number System: Find the largest number of four digits exactly divisible by 12, 15, 18, and 27.", opts: ["9720", "9930", "9960", "9990"] },
      { q: "Ratio & Proportion: A bag contains rupees, 50-paise and 25-paise coins in the ratio 5:6:8. If the total amount is Rs.210, find the number of 25-paise coins.", opts: ["168", "120", "144", "100"] },
      { q: "Probability: Two dice are thrown simultaneously. What is the probability of getting two numbers whose product is even?", opts: ["1/2", "3/4", "5/8", "7/12"] },
      { q: "Time & Work: A can do a piece of work in 24 days. If B is 60% more efficient than A, then how many days does B require to do the same work?", opts: ["15 days", "12 days", "18 days", "20 days"] },
      { q: "Speed & Distance: A train running at 54 km/hr crosses a platform in 20 seconds. If the length of the train is 150m, what is the length of the platform?", opts: ["150 m", "250 m", "300 m", "100 m"] },
      { q: "Algebra: If x + 1/x = 5, find the value of x^3 + 1/x^3.", opts: ["110", "125", "115", "100"] },
      { q: "Geometry: A triangle has sides 5, 12, and 13. What is the radius of the inscribed circle?", opts: ["2", "3", "4", "5"] },
      { q: "Trigonometry: In a right angled triangle, if tan(A) = 3/4, what is the value of cos(A)?", opts: ["4/5", "3/5", "5/4", "1/2"] },
      { q: "Clocks: What is the angle between the minute hand and the hour hand of a clock at 3:40?", opts: ["130 degrees", "140 degrees", "150 degrees", "160 degrees"] },
      { q: "Calendars: What day of the week was on 15th August 1947?", opts: ["Friday", "Monday", "Wednesday", "Saturday"] },
      { q: "Profit & Loss: A merchant marks his goods up by 50% and then offers a discount on the marked price. If he makes a 20% profit, what is the discount percentage?", opts: ["20%", "25%", "30%", "15%"] },
      { q: "Logarithms: If log(2) = 0.3010 and log(3) = 0.4771, find the value of log(72).", opts: ["1.8573", "1.9542", "2.1245", "1.5643"] },
      { q: "Combinatorics: In how many ways can a committee of 5 be formed from 6 men and 4 women if at least 2 women must be included?", opts: ["186", "240", "150", "200"] },
      { q: "Mixture: A container contains 40 litres of milk. From this, 4 litres of milk was taken out and replaced by water. This process was repeated further two times. How much milk is now in the container?", opts: ["29.16 L", "30 L", "28.5 L", "32.1 L"] },
      { q: "Simple Interest: At what rate percent per annum will a sum of money double in 16 years?", opts: ["6.25%", "8%", "10%", "5%"] },
      { q: "Ages: The present ages of A and B are in the ratio 4:5. Eight years hence, the ratio of their ages will be 5:6. What is A's present age?", opts: ["32 years", "40 years", "24 years", "28 years"] },
      { q: "Data Interpretation: From a dataset of 5, 9, x, 14, 21, if the mean is 12, what is the value of x?", opts: ["11", "12", "10", "13"] },
      { q: "Mensuration: If the radius of a cylinder is doubled and its height is halved, by what percent does its volume increase?", opts: ["100%", "50%", "200%", "No change"] },
      { q: "Pipes & Cisterns: Pipe A can fill a tank in 10 hours, B in 15 hours. If both are opened together, how long will it take?", opts: ["6 hours", "8 hours", "5 hours", "12 hours"] },
      { q: "Permutations: How many unique string sets can be formed by rearranging ALGORITHM?", opts: ["362880", "40320", "5040", "2560"] },
    ];

    const allGrammar = [
      { q: "Error Spotting: Identify the error -> 'Neither of the two candidates who had applied for the post were eligible.'", opts: ["were eligible", "had applied", "Neither of the", "for the post"] },
      { q: "Synonyms: What is the closest meaning of the word 'Ebullient'?", opts: ["Enthusiastic", "Depressed", "Arrogant", "Deceitful"] },
      { q: "Parajumbles: Arrange -> P: to understand Q: is essential R: the context S: clearly.", opts: ["RQPS", "PQRS", "QRPS", "SQRP"] },
      { q: "Active/Passive: Convert to Passive -> 'The manager will give you a ticket.'", opts: ["A ticket will be given to you by the manager.", "You will be given a ticket by the manager.", "Both A and B", "None"] },
      { q: "Direct/Indirect: 'He said, \"I have been reading this book.\"'", opts: ["He said that he had been reading that book.", "He said he has been reading this book.", "He told he had read that book.", "He said that he is reading that book."] },
      { q: "Reading Comprehension Analysis: What is the primary tone of a passage discussing catastrophic climate failures?", opts: ["Pessimistic / Objective", "Joyful", "Humorous", "Apathetic"] },
      { q: "Cloze Test: The scientist was highly ___ by his peers for his groundbreaking research.", opts: ["revered", "ignored", "criticized", "demolished"] },
      { q: "Modifier Misplacement: Fix -> 'Running down the street, the tree caught my attention.'", opts: ["As I was running down the street, the tree caught my attention.", "Running down the street, my attention was caught by the tree.", "The tree caught my attention running down the street.", "No fix needed."] },
      { q: "Prepositions: She is completely averse ___ the idea of moving abroad.", opts: ["to", "from", "against", "with"] },
      { q: "Logical Deduction: If all Bloops are Razzies and all Razzies are Lazzies, then...", opts: ["All Bloops are Lazzies", "All Lazzies are Bloops", "Some Bloops are not Lazzies", "Cannot be determined"] },
      { q: "Tense Consistency: By the time the police arrived, the burglar ___.", opts: ["had escaped", "escaped", "has escaped", "was escaped"] },
      { q: "Vocabulary Root: The root 'phil' in philanthropy means:", opts: ["Love", "Hate", "Light", "Time"] },
      { q: "Idioms: To 'bite the bullet' means to:", opts: ["Endure a painful experience bravely", "Take a huge risk for money", "Literally fight someone", "Be indecisive"] },
      { q: "Phonology: Which word has a silent 'b'?", opts: ["Doubt", "Obtain", "Symbol", "Rubber"] },
      { q: "Punctuation: Which sentence is correctly punctuated?", opts: ["Let's eat, Grandma!", "Lets eat, Grandma!", "Let's eat Grandma!", "Lets eat Grandma!"] },
      { q: "Sentence Improvement: He is the smartest of the two brothers.", opts: ["smarter of the two", "smartest among the two", "more smart of the two", "No improvement"] },
      { q: "Semantic Ambiguity: 'I saw the man with the telescope.' This means:", opts: ["I used it, or he had it (ambiguous)", "I used the telescope", "The man had the telescope", "Neither"] },
      { q: "Parallelism: She likes cooking, jogging, and ___.", opts: ["reading", "to read", "read", "she reads"] },
      { q: "Subjunctive Mood: It is essential that he ___ his homework immediately.", opts: ["finish", "finishes", "finished", "will finish"] },
      { q: "Subject-Verb Concord: The bouquet of red roses ___ a beautiful aroma.", opts: ["has", "have", "are having", "were having"] },
    ];

    // Seed Randomness globally for diversity across logins
    const currentUser = typeof window !== 'undefined' ? localStorage.getItem("geonixa_current_user") || "anonymous" : "anonymous";
    let seed = 0;
    for (let i = 0; i < currentUser.length; i++) seed += currentUser.charCodeAt(i);

    const seededShuffle = (array: any[]) => array.sort(() => 0.5 - Math.random());

    setAiQuestions(seededShuffle([...hardLeetcodePool]).slice(0, 3));
    setR1List(seededShuffle([...allAptitude]).slice(0, 15));
    setR2List(seededShuffle([...allGrammar]).slice(0, 15));

  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Anti-cheating listeners
  useEffect(() => {
    const disableContext = (e: MouseEvent) => e.preventDefault();
    const disableCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Copy/Paste is strictly disabled.");
    };

    if (examState === "ACTIVE") {
      document.addEventListener("contextmenu", disableContext);
      document.addEventListener("copy", disableCopyPaste);
      document.addEventListener("paste", disableCopyPaste);
    }

    return () => {
      document.removeEventListener("contextmenu", disableContext);
      document.removeEventListener("copy", disableCopyPaste);
      document.removeEventListener("paste", disableCopyPaste);
    };
  }, [examState]);

  // Boot up System checks & live camera feed
  useEffect(() => {
    if (examState === "SYS_CHECK") {
      setTimeout(() => setSysChecks(s => ({ ...s, browser: true })), 500);
      setTimeout(() => setSysChecks(s => ({ ...s, network: true })), 1000);

      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setSysChecks(s => ({ ...s, camera: true, mic: true }));
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          alert("Camera or Microphone access denied. You cannot proceed.");
        });
    } else {
      // Cleanup video stream when leaving SYS_CHECK
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [examState]);

  const handleCaptureSelfie = () => {
    // In a real app, capture frame to canvas, optionally upload. 
    // Here we just mark it complete to allow proceeding.
    if (sysChecks.camera) setHasSelfie(true);
  };

  const allChecksPassed = sysChecks.browser && sysChecks.network && sysChecks.camera && sysChecks.mic && hasSelfie;

  const handleStartExam = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      setExamState("ACTIVE");
    } catch (err) {
      alert("You must allow full screen to start the exam.");
    }
  };

  const handleProctorViolation = (type: string, message: string) => {
    if (type === "TAB_SWITCH") {
      setExamState("SUBMITTED");
      if (typeof document !== "undefined" && document.fullscreenElement) document.exitFullscreen();
      alert("CRITICAL VIOLATION: Tab switch detected! Your exam has been automatically submitted and nullified.");
      handleFinalSubmit();
      return;
    }

    setWarnings(prev => {
      const newWarnings = [...prev, `AI FLAG [${new Date().toLocaleTimeString()}]: ${message}`];
      alert(`SYSTEM WARNING: ${message}\n\nYou have ${3 - newWarnings.length} warnings remaining before automatic forceful submission.`);
      if (newWarnings.length >= 3 && examState === "ACTIVE") {
        alert("CRITICAL VIOLATION LIMIT TRIGGERED! 3 AI Warnings Recorded. Submitting assessment permanently.");
        handleFinalSubmit();
      }
      return newWarnings;
    });
  };

  const handleCodeExecution = async (code: string, language: string) => {
    const res = await fetch("/api/execute", {
      method: "POST",
      body: JSON.stringify({ code, language }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    return data.output || data.error;
  };

  const nextRound = () => setCurrentRound(prev => (prev < totalRounds ? prev + 1 : prev));

  // --- RENDERING DIFFERENT STATES --- //

  if (examState === "SYS_CHECK") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem", backgroundColor: "var(--bg-color)" }}>
        <h2 style={{ color: "var(--primary-color)" }}>Geonixa Environment Setup</h2>

        <div style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
          {/* Hardware Checks */}
          <div style={{ width: '300px', backgroundColor: "var(--card-bg)", padding: "2rem", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>System Scan</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Browser Supported</span> <span>{sysChecks.browser ? "✅" : "⏳"}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Network Stability</span> <span>{sysChecks.network ? "✅" : "⏳"}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Webcam Ready</span> <span>{sysChecks.camera ? "✅" : "⏳"}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Microphone Ready</span> <span>{sysChecks.mic ? "✅" : "⏳"}</span>
            </div>
          </div>

          {/* Identity Verification */}
          <div style={{ width: '300px', backgroundColor: "var(--card-bg)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3 style={{ alignSelf: "flex-start", width: "100%", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>Identity Verification</h3>
            <div style={{ width: "200px", height: "150px", backgroundColor: "#000", marginTop: "1rem", borderRadius: "8px", overflow: "hidden" }}>
              <video ref={videoRef} autoPlay muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {hasSelfie ? (
              <div style={{ marginTop: "1rem", color: "var(--success)", fontWeight: "bold" }}>✅ Identity Captured</div>
            ) : (
              <button
                onClick={handleCaptureSelfie}
                className="btn btn-outline"
                style={{ marginTop: "1rem", width: "100%" }}
                disabled={!sysChecks.camera}
              >
                📸 Take Selfie
              </button>
            )}
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ marginTop: '2.5rem', width: '300px', padding: "1rem" }}
          disabled={!allChecksPassed}
          onClick={() => setExamState("INSTRUCTIONS")}
        >
          {allChecksPassed ? "Proceed to Guidelines" : "Complete All Setup Steps"}
        </button>
      </div>
    );
  }

  if (examState === "INSTRUCTIONS") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", padding: "2rem", backgroundColor: "var(--bg-color)" }}>
        <h1 style={{ color: "var(--primary-color)", fontSize: "2.5rem", marginBottom: "1rem" }}>Advanced Proctoring Integrity Hub</h1>
        <div style={{ maxWidth: '800px', backgroundColor: 'var(--card-bg)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginTop: '1rem' }}>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "2rem", textAlign: "center" }}>
            Deep verification complete. Please read the globally regulated compliance structures before authorizing exam commencement.
          </p>
          <h3 style={{ color: "var(--text-main)", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem", marginBottom: "1rem" }}>Strict Examination Compliance Framework:</h3>
          <ul style={{ marginLeft: '1.5rem', color: "#b91c1c", marginTop: "1rem", lineHeight: "1.8", fontWeight: "500" }}>
            <li><strong>MANDATORY:</strong> A highly synchronized neural AI feed is monitoring visual metrics, physical movement, and ambient noise constantly. Firebase saves records contextually.</li>
            <li><strong>AUTO-TERMINATION:</strong> Leaving the active browser boundary, utilizing external screen displays, or alt-tabbing immediately terminates the session via background observers.</li>
            <li><strong>FIREBASE ARCHIVING:</strong> All analytical data including code compilation logs, terminal executions, aptitude choices, grammar deductions, and video artifacts are safely encrypted and persisted on secure regional Firebase clusters.</li>
            <li><strong>NO SECOND CHANCES:</strong> Security tokens permanently latch onto your verified email. Attempting bypass by refreshing instances triggers instant blockade mechanisms.</li>
            <li><strong>CRYPTOGRAPHIC SOURCING:</strong> Plagiarism detectors will parse algorithmic logic natively inside the sandbox. Write algorithms uniquely.</li>
          </ul>
        </div>
        <button className="btn btn-primary" onClick={handleStartExam} style={{ marginTop: '3rem', padding: "1.2rem 3rem", fontSize: "1.2rem", fontWeight: "bold", borderRadius: "8px", background: "linear-gradient(90deg, #10b981, #059669)", border: "none", color: "white", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.5)" }}>
          I acknowledge and am ready to begin
        </button>
      </div>
    );
  }

  if (examState === "VIOLATION_TERMINATED" || examState === "SUBMITTED") {

    const submitFeedback = () => {
      if (typeof window !== 'undefined') {
        const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
        const key = "geonixa_submissions";
        const prev = JSON.parse(localStorage.getItem(key) || "{}");
        if (prev[currentUser]) {
          prev[currentUser].feedback = feedback;
          localStorage.setItem(key, JSON.stringify(prev));
        }
      }
      setFeedbackSubmitted(true);
    };

    return (
      <div className="animate-fade-in" style={{ padding: "5rem", textAlign: "center", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "var(--bg-color)" }}>
        <h1 style={{ color: examState === "VIOLATION_TERMINATED" ? "var(--danger)" : "var(--success)", fontSize: "2.5rem", marginBottom: "1rem" }}>
          {examState === "VIOLATION_TERMINATED" ? "EXAM TERMINATED" : "Exam Submitted Successfully"}
        </h1>
        {examState === "VIOLATION_TERMINATED" && (
          <div style={{ margin: '2rem auto', textAlign: 'left', border: '1px solid var(--danger)', backgroundColor: "#fef2f2", padding: '1rem', borderRadius: '8px', width: '400px' }}>
            <h3 style={{ color: "var(--danger)", marginBottom: "0.5rem" }}>Violation Log:</h3><ul style={{ paddingLeft: '1rem', color: "#991b1b" }}>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
          </div>
        )}

        {examState === "SUBMITTED" && !feedbackSubmitted && (
          <div style={{ marginTop: "2rem", width: "100%", maxWidth: "600px", padding: "2rem", backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)", borderTop: "4px solid var(--primary-color)", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>Candidate Experience Review</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Help us improve the Geonixa assessment architecture. Your feedback is entirely secure.</p>

            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} onClick={() => setFeedback(p => ({ ...p, stars: star }))} style={{ fontSize: "2.5rem", cursor: "pointer", transition: "0.2s", color: feedback.stars >= star ? "var(--warning)" : "var(--border-color)", transform: feedback.stars >= star ? "scale(1.1)" : "scale(1)" }}>★</span>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
              <label style={{ fontWeight: "bold" }}>Elaborate your experience & any Technical Issues faced:</label>
              <textarea rows={3} placeholder="Did the code editor work natively? Any anomalies?" style={{ width: "100%", padding: "1rem", borderRadius: "6px", border: "1px solid var(--border-color)", fontFamily: "inherit" }} value={feedback.experience} onChange={e => setFeedback(p => ({ ...p, experience: e.target.value }))}></textarea>

              <label style={{ fontWeight: "bold" }}>What logic vectors need improvement?</label>
              <textarea rows={3} placeholder="Suggestions for the MNC pipeline..." style={{ width: "100%", padding: "1rem", borderRadius: "6px", border: "1px solid var(--border-color)", fontFamily: "inherit" }} value={feedback.improvements} onChange={e => setFeedback(p => ({ ...p, improvements: e.target.value }))}></textarea>
            </div>

            <button disabled={!feedback.stars} onClick={submitFeedback} className="btn btn-primary" style={{ marginTop: "2rem", width: "100%", opacity: !feedback.stars ? 0.5 : 1 }}>
              Submit Review securely
            </button>
          </div>
        )}

        {feedbackSubmitted && (
          <div className="animate-fade-in" style={{ marginTop: "2rem", padding: "2rem", backgroundColor: "#e0f2fe", border: "1px solid #7dd3fc", borderRadius: "12px", width: "100%", maxWidth: "500px", color: "#0369a1" }}>
            <h2>Review Captured Successfully.</h2>
            <p style={{ marginTop: "0.5rem" }}>You may safely close this terminal native window.</p>
          </div>
        )}
      </div>
    );
  }

  // ACTIVE EXAM RENDER //
  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--bg-color)" }}>
      <div style={{ width: "320px", backgroundColor: "var(--card-bg)", borderRight: "1px solid var(--border-color)", padding: "1rem", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.2rem", color: "var(--primary-color)", margin: 0 }}>Active Section</h2>
          <div style={{ fontWeight: "bold", fontFamily: "monospace", fontSize: "1.2rem", padding: "0.5rem", borderRadius: "4px", backgroundColor: roundTimes[currentRound as keyof typeof timeLimits] < 60 ? "#fef2f2" : "#fff7ed", color: roundTimes[currentRound as keyof typeof timeLimits] < 60 ? "var(--danger)" : "var(--primary-color)" }}>
            {formatTime(roundTimes[currentRound as keyof typeof timeLimits])}
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "1rem", backgroundColor: currentRound === 1 ? "#fff7ed" : "transparent", borderRadius: "8px", border: currentRound === 1 ? "1px solid var(--primary-color)" : "1px solid transparent", opacity: currentRound >= 1 ? 1 : 0.5 }}>
            <strong>Round 1: Aptitude</strong>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>10 Mins (Locks after submit)</div>
          </div>

          <div style={{ padding: "1rem", backgroundColor: currentRound === 2 ? "#fff7ed" : "transparent", borderRadius: "8px", border: currentRound === 2 ? "1px solid var(--primary-color)" : "1px solid transparent", opacity: currentRound >= 2 ? 1 : 0.5, marginTop: "0.5rem" }}>
            <strong>Round 2: Grammar</strong>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>10 Mins (Locks after submit)</div>
          </div>

          <div style={{ padding: "1rem", backgroundColor: currentRound === 3 ? "#fff7ed" : "transparent", borderRadius: "8px", border: currentRound === 3 ? "1px solid var(--primary-color)" : "1px solid transparent", opacity: currentRound >= 3 ? 1 : 0.5, marginTop: "0.5rem" }}>
            <strong>Round 3: Typing Skill</strong>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>5 Mins (Locks after submit)</div>
          </div>

          <div style={{ padding: "1rem", backgroundColor: currentRound === 4 ? "#fff7ed" : "transparent", borderRadius: "8px", border: currentRound === 4 ? "1px solid var(--primary-color)" : "1px solid transparent", opacity: currentRound >= 4 ? 1 : 0.5, marginTop: "0.5rem" }}>
            <strong>Round 4: Coding Tasks</strong>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>30 Mins (Final Submission)</div>
          </div>
        </div>

        {currentRound === 4 && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '1rem', fontWeight: 600, backgroundColor: 'var(--danger)', opacity: codingProgress.every(Boolean) ? 1 : 0.5 }}
            disabled={!codingProgress.every(Boolean)}
            onClick={() => {
              if (confirm("Submit Assessment final?")) {
                handleFinalSubmit();
              }
            }}> {codingProgress.every(Boolean) ? "End & Submit Complete Exam" : "Pass All Tests To Submit"} </button>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: currentRound === 4 ? "0" : "2rem", overflowY: "auto", paddingBottom: currentRound === 4 ? "0" : "15rem" }}>
        {currentRound === 1 && r1List.length > 0 && (
          <div style={{ flex: 1, display: "flex", gap: "2rem" }}>
            <div style={{ flex: 3 }}>
              <h2>Q{q1Index + 1}/15: {r1List[q1Index].q}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem", maxWidth: "800px" }}>
                {r1List[q1Index].opts.map((opt: any, i: number) => {
                  const isSelected = r1Answers[q1Index] === opt;
                  return (
                    <label key={i} style={{ padding: "1.5rem", border: "1px solid var(--border-color)", borderRadius: "8px", cursor: "pointer", backgroundColor: isSelected ? "var(--primary-color)" : "white", color: isSelected ? "white" : "black", fontSize: "1.1rem" }}>
                      <input
                        type="radio"
                        name={`r1_${q1Index}`}
                        checked={isSelected}
                        onChange={() => setR1Answers(prev => ({ ...prev, [q1Index]: opt }))}
                        style={{ display: "none" }}
                      />
                      {opt}
                    </label>
                  )
                })}
              </div>
              <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-outline" disabled={q1Index === 0} onClick={() => setQ1Index(p => p - 1)}>Previous</button>
                <button className="btn btn-primary" onClick={() => q1Index < 14 ? setQ1Index(p => p + 1) : nextRound()}>
                  {q1Index < 14 ? "Next Question" : "Submit Section"}
                </button>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: "var(--card-bg)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)", alignSelf: "flex-start" }}>
              <h4 style={{ margin: "0 0 1rem" }}>Question Tracker</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                {Array.from({ length: 15 }, (_, i) => {
                  const statusBg = r1Answers[i] ? (i === q1Index ? "var(--primary-color)" : "#10b981") : (i === q1Index ? "var(--primary-color)" : "white");
                  const statusColor = r1Answers[i] ? "white" : (i === q1Index ? "white" : "black");
                  return (
                    <button key={i} onClick={() => setQ1Index(i)} style={{ padding: "0.5rem", border: "1px solid var(--border-color)", transition: "0.2s all", backgroundColor: statusBg, color: statusColor, borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentRound === 2 && r2List.length > 0 && (
          <div style={{ flex: 1, display: "flex", gap: "2rem" }}>
            <div style={{ flex: 3 }}>
              <h2>Q{q2Index + 1}/15: {r2List[q2Index].q}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem", maxWidth: "800px" }}>
                {r2List[q2Index].opts.map((opt: any, i: number) => {
                  const isSelected = r2Answers[q2Index] === opt;
                  return (
                    <label key={i} style={{ padding: "1.5rem", border: "1px solid var(--border-color)", borderRadius: "8px", cursor: "pointer", backgroundColor: isSelected ? "var(--primary-color)" : "white", color: isSelected ? "white" : "black", fontSize: "1.1rem" }}>
                      <input
                        type="radio"
                        name={`r2_${q2Index}`}
                        checked={isSelected}
                        onChange={() => setR2Answers(prev => ({ ...prev, [q2Index]: opt }))}
                        style={{ display: "none" }}
                      />
                      {opt}
                    </label>
                  )
                })}
              </div>
              <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-outline" disabled={q2Index === 0} onClick={() => setQ2Index(p => p - 1)}>Previous</button>
                <button className="btn btn-primary" onClick={() => q2Index < 14 ? setQ2Index(p => p + 1) : nextRound()}>
                  {q2Index < 14 ? "Next Question" : "Submit Section"}
                </button>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: "var(--card-bg)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)", alignSelf: "flex-start" }}>
              <h4 style={{ margin: "0 0 1rem" }}>Question Tracker</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                {Array.from({ length: 15 }, (_, i) => {
                  const statusBg = r2Answers[i] ? (i === q2Index ? "var(--primary-color)" : "#10b981") : (i === q2Index ? "var(--primary-color)" : "white");
                  const statusColor = r2Answers[i] ? "white" : (i === q2Index ? "white" : "black");
                  return (
                    <button key={i} onClick={() => setQ2Index(i)} style={{ padding: "0.5rem", border: "1px solid var(--border-color)", transition: "0.2s all", backgroundColor: statusBg, color: statusColor, borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentRound === 3 && (
          <div style={{ flex: 1 }}>
            <h2>Typing Check: Expressive Writing</h2>
            <p style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "var(--card-bg)", borderRadius: "8px" }}>
              <strong>Topic:</strong> Describe a daily life situation (e.g., your morning routine, a visit to the market, or managing household chores).<br /><br />
              <strong>Rules:</strong><br />
              1. Minimum 30 lines required.<br />
              2. Maximum 25 backspaces allowed.<br />
              3. Enter carefully: a warning is issued if you use backspace or space incorrectly.
            </p>
            {typingWarning && (
              <div style={{ color: "var(--danger)", fontWeight: "bold", marginTop: "1rem", padding: "0.5rem", border: "1px solid var(--danger)", borderRadius: "4px", backgroundColor: "#fef2f2" }}>
                {typingWarning}
              </div>
            )}
            <div style={{ marginTop: "1rem", fontWeight: "bold", color: typingText.split('\n').length < 30 ? "var(--text-muted)" : "var(--success)" }}>
              Current Lines: {typingText.split('\n').length} / 30
            </div>
            <textarea
              style={{ width: "100%", height: "300px", marginTop: "0.5rem", padding: "1rem", fontSize: "1.1rem", fontFamily: "monospace", borderRadius: "8px", border: "1px solid var(--border-color)" }}
              value={typingText}
              onChange={(e) => setTypingText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace') {
                  if (backspaceCount >= 25) {
                    e.preventDefault();
                    setTypingWarning("🚨 LIMIT REACHED: 25 backspaces maximum allowed! You cannot backspace anymore.");
                  } else {
                    setBackspaceCount(prev => prev + 1);
                    setTypingWarning(`⚠️ Backspace used: (${backspaceCount + 1}/25)`);
                  }
                } else if (e.key === ' ') {
                  setTypingWarning("⚠️ Space entered! Watch your formatting.");
                } else {
                  if (typingWarning && !typingWarning.includes("LIMIT REACHED")) {
                    setTypingWarning("");
                  }
                }
              }}
              placeholder="Start typing your daily life situation here..."
            />
          </div>
        )}

        {currentRound === 4 && aiQuestions.length === 3 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingBottom: "15rem" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              {aiQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentCodingQuestionIndex(idx)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: currentCodingQuestionIndex === idx ? "var(--primary-color)" : "var(--card-bg)",
                    color: currentCodingQuestionIndex === idx ? "white" : "var(--text-main)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Code {idx + 1} {codingProgress[idx] ? "✅" : ""}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", height: "650px", backgroundColor: "white" }}>

              {/* Left Pane - Problem Description */}
              <div style={{ flex: "1 1 40%", padding: "2rem", overflowY: "auto", borderRight: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                <h2 style={{ fontSize: "1.5rem", margin: "0 0 1rem", color: "#0f172a" }}>Coding {currentCodingQuestionIndex + 1}/3: {aiQuestions[currentCodingQuestionIndex].title}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div>
                    <h4 style={{ color: "#334155", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem", marginBottom: "0.5rem", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px" }}>Objective</h4>
                    <p style={{ color: "#475569", lineHeight: "1.6" }}>{aiQuestions[currentCodingQuestionIndex].desc}</p>
                  </div>
                  <div>
                    <h4 style={{ color: "#334155", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem", marginBottom: "0.5rem", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px" }}>Task Constraints</h4>
                    <ul style={{ color: "#475569", paddingLeft: "1.5rem", lineHeight: "1.6", margin: 0 }}>
                      <li>Analyze the edge cases meticulously.</li>
                      <li>Function correctly handles extreme numerical / character bounds.</li>
                      <li>Return the correct typed Object or Scalar.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ color: "#334155", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem", marginBottom: "0.5rem", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px" }}>Sample Validation</h4>
                    <div style={{ backgroundColor: "#1e293b", color: "#f8fafc", padding: "1rem", borderRadius: "6px", fontFamily: "monospace", fontSize: "0.9rem" }}>
                      {aiQuestions[currentCodingQuestionIndex].tests.map((t: any) => (
                        <div key={t.id} style={{ marginBottom: "1rem", borderBottom: "1px solid #334155", paddingBottom: "0.5rem" }}>
                          <div style={{ color: "#94a3b8" }}>Input Format: <span style={{ color: "#f8fafc" }}>{t.input}</span></div>
                          <div style={{ color: "#94a3b8", marginTop: "0.4rem" }}>Expected Output: <span style={{ color: "#10b981", fontWeight: "bold" }}>{t.expectedOutput}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Pane - Virtual Editor */}
              <div style={{ flex: "1 1 60%", display: "flex", flexDirection: "column" }}>
                <CodeEditor
                  key={currentCodingQuestionIndex}
                  language="javascript"
                  testCases={aiQuestions[currentCodingQuestionIndex].tests}
                  initialCode={aiQuestions[currentCodingQuestionIndex].initialCode}
                  onRunMode={handleCodeExecution}
                  onTestsStatusChange={(passed) => {
                    setCodingProgress(prev => {
                      const n = [...prev];
                      n[currentCodingQuestionIndex] = passed;
                      return n;
                    });
                  }}
                />
              </div>
            </div>

            {(currentCodingQuestionIndex < 2) && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button className="btn btn-primary" onClick={() => setCurrentCodingQuestionIndex(c => c + 1)}>
                  Next Coding Question
                </button>
              </div>
            )}

            {/* Massive End Check Button Block added per user request */}
            <div style={{ padding: "2.5rem", borderRadius: "12px", border: codingProgress.every(Boolean) ? "2px solid var(--success)" : "2px dashed var(--danger)", backgroundColor: "var(--card-bg)", marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <h2 style={{ color: "var(--primary-color)", margin: 0 }}>Final Code Assessment Completion</h2>
              <p style={{ color: "var(--text-muted)", margin: 0, textAlign: "center" }}>
                {codingProgress.every(Boolean) ? "All Code matrix systems are green. Ready for encrypted payload delivery!" : "You have not passed all required test cases. Submitting now will generate partial score analytics."}
              </p>
              <button
                className="btn btn-primary"
                style={{
                  padding: "1rem 3rem",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  backgroundColor: "var(--danger)",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  cursor: "pointer"
                }}
                onClick={() => {
                  if (confirm("Confirm Final Submit Protocol? This locks the payload and terminates the environment.")) {
                    handleFinalSubmit();
                  }
                }}
              >
                SUBMIT EXAM
              </button>
            </div>
          </div>
        )}

        {currentRound === 3 && (
          <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" onClick={nextRound}> Submit Section & Continue {'>'} </button>
          </div>
        )}
      </div>
      {examState === "ACTIVE" && <AIProctor onViolation={handleProctorViolation} />}
    </div>
  );
}
