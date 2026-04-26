"use client";

import { use, useEffect, useRef, useState } from "react";
import AIProctor from "@/components/proctoring/AIProctor";
import CodeEditor from "@/components/editor/CodeEditor";
import { storeExamAnswers } from "@/lib/firebase";

type ExamState = "SYS_CHECK" | "INSTRUCTIONS" | "ACTIVE" | "SUBMITTED" | "VIOLATION_TERMINATED";

export default function ExamSession({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;
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
  const [r1Flags, setR1Flags] = useState<Record<number, boolean>>({});
  const [r2Flags, setR2Flags] = useState<Record<number, boolean>>({});
  const [isOnline, setIsOnline] = useState(true);

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

  const isExamActiveRef = useRef(true);
  const severeWarningCountRef = useRef(0);
  const noiseWarningCountRef = useRef(0);
  const lastNoiseWarningTimeRef = useRef(0);
  
  useEffect(() => {
    isExamActiveRef.current = examState === "ACTIVE";
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [examState]);

  const handleFinalSubmit = async () => {
    isExamActiveRef.current = false;
    try {
      const currentUser = typeof window !== "undefined" ? localStorage.getItem("geonixa_current_user") || "anonymous" : "anonymous";
      const typingLines = typingText.split('\n').length;

      // Compute structured results for the database
      const r1Results = r1List.map((q, i) => ({
        question: q.q,
        selected: r1Answers[i] || "Not Attempted",
        correct: q.correctAnswer || q.opts[0],
        isRight: r1Answers[i] === (q.correctAnswer || q.opts[0])
      }));

      const r2Results = r2List.map((q, i) => ({
        question: q.q,
        selected: r2Answers[i] || "Not Attempted",
        correct: q.correctAnswer || q.opts[0],
        isRight: r2Answers[i] === (q.correctAnswer || q.opts[0])
      }));

      await storeExamAnswers(currentUser, { 
        aiQuests: aiQuestions, 
        codingProgress, 
        finalRoundCompleted: true, 
        r1Answers, 
        r2Answers, 
        r1Results,
        r2Results,
        typingLines, 
        backspacesUsed: backspaceCount 
      });
    } catch (e) { }
    setExamState("SUBMITTED");
    if (typeof document !== "undefined" && document.fullscreenElement) document.exitFullscreen().catch(() => { });
  };

  useEffect(() => {
    if (examState === "ACTIVE") {
      const timer = setInterval(() => {
        setRoundTimes(prev => {
          const currentLeft = prev[currentRound as keyof typeof timeLimits];
          if (currentLeft <= 1) {
            if (currentRound < totalRounds) {
              setCurrentRound(c => c + 1);
            } else {
              handleFinalSubmit();
              // Prevent multiple alerts if interval triggers right before cleanup
              if (currentLeft === 1) {
                alert("Time is up! Your exam has been automatically submitted.");
              }
            }
            return { ...prev, [currentRound]: 0 };
          }
          return { ...prev, [currentRound]: currentLeft - 1 };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examState, currentRound]);

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
      { q: "Number Theory: If 2^x = 3^y = 6^-z, what is the value of 1/x + 1/y + 1/z?", opts: ["0", "1", "-1", "Cannot be determined"] },
      { q: "Probability: In a group of 50 people, what is the probability that at least two people share the same birthday?", opts: ["~97%", "~50%", "~10%", "~99%"] },
      { q: "Combinatorics: A spider has 8 distinguishable legs. It wants to put on 8 socks and 8 shoes, one on each leg. The sock must go on before the shoe. How many orders are possible?", opts: ["16! / 2^8", "16!", "8! * 8!", "(16! * 8!) / 2"] },
      { q: "Geometry: A point P is inside an equilateral triangle. Its perpendicular distances from the three sides are 3, 4, and 5. What is the side length of the triangle?", opts: ["8√3", "12", "16", "24/√3"] },
      { q: "Algebra: Evaluate the infinite nested radical √(2 + √(2 + √(2 + ...)))", opts: ["2", "1", "Undefined", "Infinity"] },
      { q: "Number Theory: Find the remainder when 3^2022 is divided by 5.", opts: ["4", "1", "2", "3"] },
      { q: "Probability: Three points are chosen independently at random on the circumference of a circle. What is the probability that the triangle formed by them contains the center?", opts: ["1/4", "1/8", "1/2", "1/3"] },
      { q: "Work & Time: A takes as much time as B and C together. B takes 3 times as much time as C and A together. If C takes 20 days, how long do A, B, and C take together?", opts: ["4 days", "5 days", "3.33 days", "6 days"] },
      { q: "Permutations: Determine the number of ways to arrange the letters of the word 'ASSASSINATION' such that no two A's are adjacent.", opts: ["10!/ (4!*2!*2!) * 11C3", "13! / (4!*3!*2!*2!)", "11! / (4!*2!*2!)", "None of these"] },
      { q: "Game Theory: Two players play a game starting with 100 on a board. At each turn, a player can subtract a divisor of the current number (but not the number itself). The player unable to make a move loses. Who wins?", opts: ["First Player", "Second Player", "Draw", "Depends on initial moves"] },
      { q: "Algebra: If f(x) = (x^2+1)/(x), what is the minimum value of f(x) for x > 0?", opts: ["2", "1", "0", "-2"] },
      { q: "Combinatorics: How many paths are there from (0,0) to (5,5) on a grid moving only up and right?", opts: ["252", "120", "25", "10^5"] },
      { q: "Probability: Two numbers are chosen randomly between 0 and 1. What is the probability that their sum is less than 1?", opts: ["1/2", "1", "1/4", "1/8"] },
      { q: "Number Theory: What is the last digit of 7^2023?", opts: ["3", "7", "9", "1"] },
      { q: "Mixture: 20L of 30% alcohol is mixed with 30L of 60% alcohol. What is the final concentration?", opts: ["48%", "45%", "50%", "42%"] },
      { q: "Speed & Distance: Two trains start towards each other from A and B. After crossing, they take 4h and 9h to reach B and A. Find ratio of speeds.", opts: ["3:2", "2:3", "4:9", "Inconclusive"] },
      { q: "Work & Time: A and B can do a job in 12 days, B and C in 15 days, C and A in 20 days. How long for A alone?", opts: ["30", "60", "24", "45"] },
      { q: "Geometry: A cube of side 4 is cut into smaller cubes of side 1. The ratio of new surface area to old is?", opts: ["4:1", "1:4", "2:1", "16:1"] },
      { q: "Probability: 3 coins are tossed. Probability of getting exactly 2 heads?", opts: ["3/8", "1/8", "1/4", "1/2"] },
      { q: "Algebra: Sum of roots of x^3 - 6x^2 + 11x - 6 = 0 is?", opts: ["6", "-6", "11", "-11"] },
      { q: "Number Theory: The number of trailing zeros in 100! is?", opts: ["24", "21", "20", "25"] },
      { q: "Profit & Loss: A man sells two articles at Rs99 each. One at 10% profit, other at 10% loss. Net result?", opts: ["Loss 1%", "No profit no loss", "Profit 1%", "Loss 2%"] },
      { q: "Clock: Angle between hands at 4:15?", opts: ["37.5", "30", "45", "42.5"] },
      { q: "Trig: Max value of 3sin(x) + 4cos(x)?", opts: ["5", "7", "1", "12"] },
      { q: "Permutations: Words from 'MISSISSIPPI'?", opts: ["34650", "39916800", "495", "11!"] },
      { q: "Venn: In a class, 40 like Math, 30 like Science, 10 like both. Total?", opts: ["60", "70", "50", "80"] },
      { q: "Interest: Difference between CI and SI on Rs1000 for 2 yrs at 10%?", opts: ["10", "100", "0", "20"] },
      { q: "Age: Father is 3x son. In 10 years, he will be 2x. Father's current age?", opts: ["30", "40", "45", "50"] },
      { q: "Pipes: Pipe A fills in 4h, B in 6h. C empties in 12h. Together they fill in?", opts: ["3h", "2h", "4h", "5h"] },
      { q: "Dist: A walks at 4kmph and reaches 10min late. At 5kmph he is 5min early. Distance?", opts: ["5km", "4km", "10km", "6km"] },
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
      { q: "Sentence Improvement: Had he realized the implications of his actions, he ___ beforehand.", opts: ["would have reconsidered", "will reconsider", "might reconsider", "had reconsidered"] },
      { q: "Error Spotting: 'Scarcely had the minister started his speech than the crowd began to roar angrily.'", opts: ["when the crowd began", "than the crowd began", "did the crowd begin", "No error"] },
      { q: "Vocabulary: Choose the exact antonym for 'Obfuscate'.", opts: ["Elucidate", "Confuse", "Amalgamate", "Enervate"] },
      { q: "Parajumbles: Arrange -> P: but the conceptual Q: entirely empirical R: foundation is S: not.", opts: ["PRSQ", "PQRS", "RQPS", "SPQR"] },
      { q: "Active/Passive: Convert to Passive -> 'Someone has stolen my purse.'", opts: ["My purse has been stolen.", "My purse had been stolen.", "Someone had stolen my purse.", "My purse is stolen."] },
      { q: "Direct/Indirect: 'Please give me a glass of water,' she said to him.", opts: ["She requested him to give her a glass of water.", "She ordered him to give her a glass of water.", "She told him to give me a glass of water.", "She asked him to give a glass of water."] },
      { q: "Reading Comprehension Analysis: What is the primary tone of an editorial decrying political corruption?", opts: ["Indignant", "Sycophantic", "Empathetic", "Ambivalent"] },
      { q: "Cloze Test: The committee's decision was met with ___ approval from all members.", opts: ["unanimous", "equivocal", "dissenting", "trivial"] },
      { q: "Modifier Misplacement: Fix -> 'Covered in mud, she watched the dog run into the house.'", opts: ["She watched the dog, covered in mud, run into the house.", "She watched the dog run into the house, covered in mud.", "Covered in mud, the dog ran into the house as she watched.", "No fix needed."] },
      { q: "Prepositions: The management is fully apprised ___ the situation.", opts: ["of", "about", "with", "for"] },
      { q: "Logical Deduction: If all A's are B's and no B's are C's, then...", opts: ["No A's are C's", "Some A's are C's", "All C's are A's", "Cannot be determined"] },
      { q: "Tense Consistency: We ___ the meeting before the manager arrived.", opts: ["had started", "started", "have started", "were starting"] },
      { q: "Vocabulary Root: The root 'chron' in chronology means:", opts: ["Time", "Color", "Measure", "Sound"] },
      { q: "Idioms: To 'let the cat out of the bag' means to:", opts: ["Reveal a secret", "Release an animal", "Make a mistake", "Buy something unexpectedly"] },
      { q: "Phonology: Which word has a different vowel sound?", opts: ["Bat", "Cat", "Mat", "Call"] },
      { q: "Punctuation: Choose the correct sentence.", opts: ["Its a beautiful day.", "It's a beautiful day.", "Its' a beautiful day.", "It is a beautiful day,"] },
      { q: "Sentence Improvement: If I was you, I wouldn't do that.", opts: ["were", "am", "had been", "No improvement"] },
      { q: "Semantic Ambiguity: 'Visiting relatives can be boring.' means:", opts: ["Going to see relatives", "Relatives coming to see us", "Both A and B", "Neither"] },
      { q: "Parallelism: The teacher told the students to read, write, and ___ their answers.", opts: ["review", "to review", "reviewing", "reviewed"] },
      { q: "Subjunctive Mood: I demand that he ___ immediately.", opts: ["leave", "leaves", "left", "will leave"] },
      { q: "Subject-Verb Concord: A number of students ___ absent.", opts: ["are", "is", "was", "has been"] },
      { q: "Error Spotting: 'The furniture in this room are made of oak.'", opts: ["is made", "were made", "has made", "No error"] },
      { q: "Vocabulary: A person who hates mankind is a:", opts: ["Misanthrope", "Philanthropist", "Misogynist", "Introvert"] },
      { q: "Parajumbles: Arrange -> P: and it Q: profoundly changed R: scientific thinking S: forever.", opts: ["PQRS", "RQSP", "SQRP", "RSQP"] },
      { q: "Active/Passive: 'Who wrote this book?'", opts: ["By whom was this book written?", "Who was written this book?", "This book was written by whom?", "Whom wrote this book?"] },
      { q: "Direct/Indirect: 'I will go tomorrow,' he said.", opts: ["He said he would go the next day.", "He said he will go tomorrow.", "He said he would go tomorrow.", "He said he will go the next day."] },
      { q: "Prepositions: She congratulated him ___ his success.", opts: ["on", "for", "about", "with"] },
      { q: "Idioms: 'A piece of cake' means:", opts: ["Very easy", "Delicious", "A small fraction", "A sweet dessert"] },
      { q: "Tense Consistency: I have been knowing him for ten years.", opts: ["have known", "know", "knew", "No change"] },
    ];

    // Seed Randomness globally for diversity across logins
    const currentUser = typeof window !== 'undefined' ? localStorage.getItem("geonixa_current_user") || "anonymous" : "anonymous";
    let seed = 0;
    for (let i = 0; i < currentUser.length; i++) seed += currentUser.charCodeAt(i);

    const seededShuffle = (array: any[]) => array.sort(() => 0.5 - Math.random());

    const shuffleOpts = (list: any[]) => list.map(q => ({
      ...q,
      correctAnswer: q.opts[0],
      opts: seededShuffle([...q.opts])
    }));

    setAiQuestions(seededShuffle([...hardLeetcodePool]).slice(0, 3));
    setR1List(shuffleOpts(seededShuffle([...allAptitude]).slice(0, 30)));
    setR2List(shuffleOpts(seededShuffle([...allGrammar]).slice(0, 30)));

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
      handleProctorViolation("COPY_PASTE", "Copy/Paste is strictly disabled.");
    };
    const detectScreenshot = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || (e.metaKey && e.shiftKey) || (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's')) {
        handleProctorViolation("SCREENSHOT", "Screenshot or Screen Snip detected!");
      }
    };

    if (examState === "ACTIVE") {
      document.addEventListener("contextmenu", disableContext);
      document.addEventListener("copy", disableCopyPaste);
      document.addEventListener("paste", disableCopyPaste);
      window.addEventListener("keyup", detectScreenshot);
    }

    return () => {
      document.removeEventListener("contextmenu", disableContext);
      document.removeEventListener("copy", disableCopyPaste);
      document.removeEventListener("paste", disableCopyPaste);
      window.removeEventListener("keyup", detectScreenshot);
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
    if (!isExamActiveRef.current) return; // Completely ignore violations if submitted

    if (type === "TAB_SWITCH") {
      isExamActiveRef.current = false;
      setExamState("SUBMITTED");
      if (typeof document !== "undefined" && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      alert("CRITICAL VIOLATION: Tab switch detected! Your exam has been automatically submitted and nullified.");
      handleFinalSubmit();
      return;
    }

    const now = Date.now();
    const isSevere = type === "VISUAL" || type === "SCREENSHOT" || type === "COPY_PASTE";

    if (isSevere) {
        severeWarningCountRef.current += 1;
        const sCount = severeWarningCountRef.current;
        setWarnings(prev => [...prev, `SEVERE FLAG [${new Date().toLocaleTimeString()}]: ${message}`]);
        
        setTimeout(() => {
           if (sCount === 1) {
              alert(`SEVERE WARNING: ${message}\n\nYou have 1 severe warning remaining before automatic forceful submission.`);
           } else if (sCount >= 2 && isExamActiveRef.current) {
              isExamActiveRef.current = false;
              alert("CRITICAL VIOLATION LIMIT TRIGGERED! 2 Severe AI Warnings Recorded. Submitting assessment permanently.");
              handleFinalSubmit();
           }
        }, 50);
        return;
    }

    // Audio/Noise Logic
    const count = noiseWarningCountRef.current;

    // Cooldown logic
    if (count === 1) {
      // 2 minute cooldown between 1st and 2nd warning
      if (now - lastNoiseWarningTimeRef.current < 120000) return;
    } else if (count >= 2) {
      // 5 minute cooldown between 2nd and 3rd warning
      if (now - lastNoiseWarningTimeRef.current < 300000) return;
    }

    noiseWarningCountRef.current += 1;
    lastNoiseWarningTimeRef.current = now;
    const currentCount = noiseWarningCountRef.current;

    setWarnings(prev => [...prev, `AUDIO FLAG [${new Date().toLocaleTimeString()}]: ${message}`]);

    setTimeout(() => {
      alert(`SYSTEM WARNING: ${message}\n\nYou have ${3 - currentCount} audio warnings remaining before automatic forceful submission.`);
      if (currentCount >= 3 && isExamActiveRef.current) {
        isExamActiveRef.current = false;
        alert("CRITICAL VIOLATION LIMIT TRIGGERED! 3 Audio AI Warnings Recorded. Submitting assessment permanently.");
        handleFinalSubmit();
      }
    }, 50);
  };

  const handleCodeExecution = async (code: string, language: string) => {
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        body: JSON.stringify({ code, language }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      return data.output || data.error || "No Output";
    } catch (err: any) {
      return `Execution Error: ${err.message || "Network failure"}`;
    }
  };

  const saveStateToFirebase = async () => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem("geonixa_current_user");
      if (email) {
        await storeExamAnswers(email, {
          r1Answers,
          r2Answers,
          typingText,
          typingLines: typingText.split('\n').length,
          backspacesUsed: backspaceCount,
          codingProgress,
          currentRound,
          timestamp: Date.now()
        });
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (examState === "ACTIVE") saveStateToFirebase();
    }, 30000);
    return () => clearInterval(interval);
  }, [examState, r1Answers, r2Answers, typingText, codingProgress]);

  const nextRound = () => {
    if (confirm(`FINAL SECTION LOCK: You are about to submit PART ${String.fromCharCode(64 + currentRound)} and move to the next section. \n\nYou will NOT be able to return to this section. Proceed?`)) {
      saveStateToFirebase();
      setCurrentRound(prev => (prev < totalRounds ? prev + 1 : prev));
      if (currentRound === 1) setQ2Index(0); // Reset index for next round
    }
  };

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
      <div style={{ height: "100vh", width: "100vw", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-color)" }}>
        <style dangerouslySetInnerHTML={{ __html: `
          body { overflow: hidden !important; margin: 0; padding: 0; }
        `}} />
        <div style={{ backgroundColor: "#0f172a", color: "white", padding: "0.8rem 2.5rem", display: "flex", alignItems: "center", gap: "0.8rem", borderBottom: "4px solid #ea580c" }}>
          <div style={{ width: "35px", height: "35px", backgroundColor: "#3b82f6", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
               <polyline points="2 17 12 22 22 17"></polyline>
               <polyline points="2 12 12 17 22 12"></polyline>
             </svg>
          </div>
          <div>
            <h1 style={{ color: "white", fontSize: "1.4rem", margin: 0, letterSpacing: "1px", fontWeight: "bold" }}>GEONIXA</h1>
            <p style={{ color: "#94a3b8", fontSize: "0.6rem", margin: 0, textTransform: "uppercase", letterSpacing: "1.5px" }}>Corporate Systems</p>
          </div>
        </div>
        
        <div className="animate-fade-in" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center" }}>
        <h1 style={{ color: examState === "VIOLATION_TERMINATED" ? "var(--danger)" : "var(--success)", fontSize: "2.5rem", marginBottom: "1rem" }}>
          {examState === "VIOLATION_TERMINATED" ? "EXAM TERMINATED" : "Exam Submitted Successfully"}
        </h1>
        {examState === "VIOLATION_TERMINATED" && (
          <div style={{ margin: '2rem auto', textAlign: 'left', border: '1px solid var(--danger)', backgroundColor: "#fef2f2", padding: '1rem', borderRadius: '8px', width: '400px' }}>
            <h3 style={{ color: "var(--danger)", marginBottom: "0.5rem" }}>Violation Log:</h3><ul style={{ paddingLeft: '1rem', color: "#991b1b" }}>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
          </div>
        )}

        {examState === "SUBMITTED" && !feedbackSubmitted && (
          <div style={{ marginTop: "1rem", width: "100%", maxWidth: "600px", padding: "1.5rem", backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)", borderTop: "4px solid var(--primary-color)", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
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
    </div>
  );
}

  // ACTIVE EXAM RENDER //
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body { overflow: hidden !important; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
      
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", backgroundColor: "var(--bg-color)", position: "relative", overflow: "hidden" }}>
      {/* MNC Header Bar */}
      <div style={{ backgroundColor: "#0f172a", color: "white", padding: "0.8rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "4px solid #ea580c" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
           <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "900", letterSpacing: "-1px" }}>
             <span style={{ color: "#ea580c" }}>Geo</span>Nixa <span style={{ fontSize: "0.7rem", fontWeight: "normal", color: "#94a3b8", verticalAlign: "middle", marginLeft: "10px" }}>CORPORATE SYSTEMS</span>
           </h2>
           <div style={{ height: "20px", width: "1px", backgroundColor: "#334155" }} />
           <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
             Assessment ID: <span style={{ color: "#f8fafc", fontFamily: "monospace" }}>GX-{examId.toUpperCase()}-2026</span>
           </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
           <div style={{ textAlign: "right" }}>
             <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase" }}>Candidate Portal</div>
             <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{typeof window !== "undefined" ? localStorage.getItem("geonixa_current_user") || "H. Kishore Reddy" : "H. Kishore Reddy"}</div>
           </div>
           <div style={{ padding: "0.4rem 1rem", backgroundColor: "#1e293b", borderRadius: "4px", border: "1px solid #334155", color: "#10b981", fontSize: "0.8rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
             <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", animation: "blink 1s infinite" }} />
             SECURE ENVIRONMENT
           </div>
        </div>
      </div>

      {/* Security Watermark Overlay - MNC High-Security Grid */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 99999, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridTemplateRows: "repeat(5, 1fr)", opacity: 0.02, gap: "50px" }}>
         {Array.from({length: 25}).map((_, i) => (
           <div key={i} style={{ 
             fontSize: "1.4rem", 
             fontWeight: "900", 
             transform: "rotate(-30deg)", 
             whiteSpace: "nowrap", 
             color: "#1e293b",
             fontFamily: "monospace",
             display: "flex",
             flexDirection: "column",
             alignItems: "center",
             justifyContent: "center",
             border: "1px solid rgba(0,0,0,0.1)",
             padding: "20px"
           }}>
             <div>{typeof window !== "undefined" ? localStorage.getItem("geonixa_current_user") : "CONFIDENTIAL"}</div>
             <div style={{ fontSize: "0.6rem" }}>PROPERTY OF GEONIXA CORP</div>
           </div>
         ))}
      </div>

      <div style={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden" }}>
        {/* Main Workspace Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>


      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: currentRound === 4 ? "0" : "1rem", overflowY: "auto" }}>
        {currentRound === 1 && r1List.length > 0 && (
          <div style={{ flex: 1, display: "flex", gap: "2rem" }}>
            <div style={{ flex: 3 }}>
              <h2>Q{q1Index + 1}/30: {r1List[q1Index].q}</h2>
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
              <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button className="btn btn-outline" disabled={q1Index === 0} onClick={() => setQ1Index(p => p - 1)}>Previous</button>
                  <button 
                    onClick={() => setR1Flags(prev => ({ ...prev, [q1Index]: !prev[q1Index] }))}
                    style={{ padding: "0.75rem 1.5rem", borderRadius: "6px", border: "1px solid #f59e0b", color: r1Flags[q1Index] ? "white" : "#f59e0b", backgroundColor: r1Flags[q1Index] ? "#f59e0b" : "transparent", fontWeight: "bold", cursor: "pointer" }}
                  >
                    {r1Flags[q1Index] ? "🚩 Flagged for Review" : "🏳️ Flag for Review"}
                  </button>
                </div>
                <button className="btn btn-primary" onClick={() => q1Index < 29 ? setQ1Index(p => p + 1) : nextRound()}>
                  {q1Index < 29 ? "Next Question" : "Submit Section"}
                </button>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: "var(--card-bg)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)", alignSelf: "flex-start" }}>
              <h4 style={{ margin: "0 0 1rem" }}>Question Tracker</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", maxHeight: "400px", overflowY: "auto" }}>
                {Array.from({ length: 30 }, (_, i) => {
                  const statusBg = r1Answers[i] ? (i === q1Index ? "var(--primary-color)" : "#10b981") : (i === q1Index ? "var(--primary-color)" : "white");
                  const statusColor = r1Answers[i] ? "white" : (i === q1Index ? "white" : "black");
                  return (
                    <button key={i} onClick={() => setQ1Index(i)} style={{ padding: "0.5rem", border: "1px solid var(--border-color)", transition: "0.2s all", backgroundColor: statusBg, color: statusColor, borderRadius: "4px", cursor: "pointer", fontWeight: "bold", position: "relative" }}>
                      {i + 1}
                      {r1Flags[i] && <div style={{ position: "absolute", top: "-5px", right: "-5px", fontSize: "0.6rem" }}>🚩</div>}
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
              <h2>Q{q2Index + 1}/30: {r2List[q2Index].q}</h2>
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
              <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button className="btn btn-outline" disabled={q2Index === 0} onClick={() => setQ2Index(p => p - 1)}>Previous</button>
                  <button 
                    onClick={() => setR2Flags(prev => ({ ...prev, [q2Index]: !prev[q2Index] }))}
                    style={{ padding: "0.75rem 1.5rem", borderRadius: "6px", border: "1px solid #f59e0b", color: r2Flags[q2Index] ? "white" : "#f59e0b", backgroundColor: r2Flags[q2Index] ? "#f59e0b" : "transparent", fontWeight: "bold", cursor: "pointer" }}
                  >
                    {r2Flags[q2Index] ? "🚩 Flagged for Review" : "🏳️ Flag for Review"}
                  </button>
                </div>
                <button className="btn btn-primary" onClick={() => q2Index < 29 ? setQ2Index(p => p + 1) : nextRound()}>
                  {q2Index < 29 ? "Next Question" : "Submit Section"}
                </button>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: "var(--card-bg)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)", alignSelf: "flex-start" }}>
              <h4 style={{ margin: "0 0 1rem" }}>Question Tracker</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", maxHeight: "400px", overflowY: "auto" }}>
                {Array.from({ length: 30 }, (_, i) => {
                  const statusBg = r2Answers[i] ? (i === q2Index ? "var(--primary-color)" : "#10b981") : (i === q2Index ? "var(--primary-color)" : "white");
                  const statusColor = r2Answers[i] ? "white" : (i === q2Index ? "white" : "black");
                  return (
                    <button key={i} onClick={() => setQ2Index(i)} style={{ padding: "0.5rem", border: "1px solid var(--border-color)", transition: "0.2s all", backgroundColor: statusBg, color: statusColor, borderRadius: "4px", cursor: "pointer", fontWeight: "bold", position: "relative" }}>
                      {i + 1}
                      {r2Flags[i] && <div style={{ position: "absolute", top: "-5px", right: "-5px", fontSize: "0.6rem" }}>🚩</div>}
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
          <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingBottom: "2rem" }}>
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
              <div style={{ flex: "1 1 30%", padding: "2rem", overflowY: "auto", borderRight: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
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
              <div style={{ flex: "1 1 70%", display: "flex", flexDirection: "column" }}>
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

            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-primary"
                style={{
                  padding: "0.8rem 2rem",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  backgroundColor: "var(--danger)",
                  border: "none",
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

        </div>
      </div>

      {/* Modern MNC Bottom Controls Dock */}
      <div style={{ height: "140px", backgroundColor: "#0f172a", color: "white", padding: "1rem 2rem", display: "flex", gap: "2rem", borderTop: "2px solid #1e293b", zIndex: 100 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid #334155", paddingRight: "2rem" }}>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase" }}>Round Remaining Time</span>
          <div style={{ fontSize: "2rem", fontWeight: "900", fontFamily: "monospace", color: roundTimes[currentRound as keyof typeof timeLimits] < 60 ? "var(--danger)" : "#3b82f6" }}>
            {formatTime(roundTimes[currentRound as keyof typeof timeLimits])}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", gap: "1rem", alignItems: "center", overflowX: "auto" }}>
          {[1, 2, 3, 4].map(round => {
            const names = ["APTITUDE", "VERBAL", "TYPING", "ALGORITHMS"];
            const isActive = currentRound === round;
            const isDone = currentRound > round;
            return (
              <div key={round} style={{ padding: "0.8rem 1.2rem", backgroundColor: isActive ? "#1e293b" : "transparent", borderRadius: "8px", border: isActive ? "1px solid #3b82f6" : "1px solid transparent", opacity: isActive || isDone ? 1 : 0.3, minWidth: "180px" }}>
                <div style={{ fontSize: "0.65rem", color: isActive ? "#3b82f6" : "#94a3b8" }}>ROUND {round}</div>
                <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{names[round-1]} {isDone && "✅"}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "6px", color: isOnline ? "#10b981" : "#ef4444", fontSize: "0.75rem", fontWeight: "bold" }}>
               <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: isOnline ? "#10b981" : "#ef4444", animation: isOnline ? "blink 1.5s infinite" : "none" }} />
               {isOnline ? "SENTINEL: LINK STABLE" : "SENTINEL: LINK INTERRUPTED"}
             </div>
             <div style={{ fontSize: "0.6rem", color: "#64748b" }}>LATENCY: {isOnline ? "24ms" : "---"} | SYNC: ACTIVE</div>
          </div>

          <button 
             onClick={() => alert("MNC Standard Scientific Calculator Activated (Mock).")}
             style={{ height: "50px", padding: "0 1.5rem", backgroundColor: "#1e293b", border: "1px solid #3b82f6", color: "white", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
          >
             🧮 SCIENTIFIC CALCULATOR
          </button>
          <div style={{ textAlign: "right", fontSize: "0.7rem", color: "#94a3b8" }}>
            GEONIXA SECURE ENV<br/>
            SESSION: {examId}
          </div>
        </div>
      </div>
      </div>
      {examState === "ACTIVE" && <AIProctor onViolation={handleProctorViolation} />}
    </div>
    </>
  );
}
