"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";
import SimpleCodeEditor from "react-simple-code-editor";
import {
  Play, RotateCcw, Terminal, ShieldCheck, Loader2, CheckCircle2, Check,
  XCircle, Code2, Cpu, Copy, Download, Maximize2, Palette, AlertCircle, Clock, Zap
} from "lucide-react";
import axios from "axios";
import ProfessionalTestcasePanel from "./ProfessionalTestcasePanel";
import { JudgeEngine } from "@/lib/JudgeEngine";

// Use the installed Monaco package when available. The simple editor fallback below
// keeps Round 4 usable if the package/CDN cannot be loaded on the client machine.
loader.config({});

interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

interface CodeEditorProps {
  questionId: string;
  questionTitle?: string;
  initialCode: string;
  language: string;
  testCases: TestCase[];
  initialResults?: TestResult[];
  onTestsStatusChange?: (passed: boolean) => void;
  onIntegrityCheck?: (code: string, results: TestResult[]) => void;
  onFinalSubmit?: (code: string, results: any[]) => void;
  onUpdate?: (data: { code: string, language: string, results: TestResult[] }) => void;
  onRunMode?: (mode: "RUN" | "SUBMIT") => void; // Added to fix ghost TS error
}

const PISTON_API = "https://emkc.org/api/v2/piston/execute";
const PISTON_FALLBACK = "https://piston.engineer/api/v2/execute";

const LANGUAGE_MAP: Record<string, { name: string, version: string, monaco: string, boilerplate: string }> = {
  javascript: {
    name: "javascript", version: "18.15.0", monaco: "javascript",
    boilerplate: `function solve(nums) {\n    \n}`
  },
  python: {
    name: "python", version: "3.10.0", monaco: "python",
    boilerplate: `class Solution:\n    def solve(self, nums):\n        pass\n`
  },
  java: {
    name: "java", version: "17.0.6", monaco: "java",
    boilerplate: `class Solution {\n    public int solve(int[] nums) {\n        return 0;\n    }\n}`
  },
  cpp: {
    name: "cpp", version: "10.2.1", monaco: "cpp",
    boilerplate: `class Solution {\npublic:\n    int solve(vector<int>& nums) {\n        return 0;\n    }\n};`
  },
  c: {
    name: "c", version: "10.2.1", monaco: "c",
    boilerplate: `int solve(int* nums, int numsSize) {\n    return 0;\n}`
  },
  csharp: {
    name: "csharp", version: "11.0.0", monaco: "csharp",
    boilerplate: `public class Solution {\n    public int Solve(int[] nums) {\n        return 0;\n    }\n}`
  }
};

const THEMES = [
  { id: "vs-dark", name: "VS Code Dark" },
  { id: "hc-black", name: "High Contrast" },
  { id: "light", name: "Classic Light" }
];

interface TestResult {
  id: number;
  passed: boolean | null;
  actual: string;
  error?: string;
  time?: number;
  memory?: number;
  status?: string;
  input?: string;
  expected?: string;
  stderr?: string;
  category?: string;
  possibleHardcode?: boolean;
  complexity?: {
    analyzed: boolean;
    suspected: string;
  };
}

function getQuestionTemplate(title: string, language: string, cppCode: string): string {
  const t = (title || "").toLowerCase();
  
  if (language === "cpp") {
    return cppCode || LANGUAGE_MAP.cpp?.boilerplate || "";
  }
  
  if (t.includes("n-queens") || t.includes("queens")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def totalNQueens(self, n: int) -> int:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public int totalNQueens(int n) {\n        // Write your code here\n        return 0;\n    }\n}`;
    if (language === "javascript") return `function totalNQueens(n) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("word ladder")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def findLadders(self, beginWord: str, endWord: str, wordList: List[str]) -> List[List[str]]:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `import java.util.*;\n\nclass Solution {\n    public List<List<String>> findLadders(String beginWord, String endWord, List<String> wordList) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}`;
    if (language === "javascript") return `function findLadders(beginWord, endWord, wordList) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("sliding window")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `import java.util.*;\n\nclass Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        // Write your code here\n        return new int[0];\n    }\n}`;
    if (language === "javascript") return `function maxSlidingWindow(nums, k) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("median of two")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your code here\n        return 0.0;\n    }\n}`;
    if (language === "javascript") return `function findMedianSortedArrays(nums1, nums2) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("regular expression") || t.includes("regex")) {
    if (language === "python") return `class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public boolean isMatch(String s, String p) {\n        // Write your code here\n        return false;\n    }\n}`;
    if (language === "javascript") return `function isMatch(s, p) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("merge k")) {
    if (language === "python") return `from typing import List, Optional\n\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n\nclass Solution:\n    def mergeKLists(self, lists: List[ListNode]) -> Optional[ListNode]:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `// class ListNode {\n//     int val;\n//     ListNode next;\n// }\n\nclass Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Write your code here\n        return null;\n    }\n}`;
    if (language === "javascript") return `/*\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\nfunction mergeKLists(lists) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("trapping rain")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def trap(self, height: List[int]) -> int:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public int trap(int[] height) {\n        // Write your code here\n        return 0;\n    }\n}`;
    if (language === "javascript") return `function trap(height) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("edit distance")) {
    if (language === "python") return `class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public int minDistance(String word1, String word2) {\n        // Write your code here\n        return 0;\n    }\n}`;
    if (language === "javascript") return `function minDistance(word1, word2) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("largest rectangle")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def largestRectangleArea(self, heights: List[int]) -> int:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public int largestRectangleArea(int[] heights) {\n        // Write your code here\n        return 0;\n    }\n}`;
    if (language === "javascript") return `function largestRectangleArea(heights) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("sudoku solver")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def solveSudoku(self, board: List[List[str]]) -> None:\n        # Write your code here, modify board in-place\n        pass\n`;
    if (language === "java") return `class Solution {\n    public void solveSudoku(char[][] board) {\n        // Write your code here, modify board in-place\n    }\n}`;
    if (language === "javascript") return `function solveSudoku(board) {\n    // Write your code here, modify board in-place\n    \n}`;
  }
  
  if (t.includes("longest valid parentheses")) {
    if (language === "python") return `class Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public int longestValidParentheses(String s) {\n        // Write your code here\n        return 0;\n    }\n}`;
    if (language === "javascript") return `function longestValidParentheses(s) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("palindrome partitioning")) {
    if (language === "python") return `class Solution:\n    def minCut(self, s: str) -> int:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public int minCut(String s) {\n        // Write your code here\n        return 0;\n    }\n}`;
    if (language === "javascript") return `function minCut(s) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("maximal rectangle")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def maximalRectangle(self, matrix: List[List[str]]) -> int:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public int maximalRectangle(char[][] matrix) {\n        // Write your code here\n        return 0;\n    }\n}`;
    if (language === "javascript") return `function maximalRectangle(matrix) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("distinct subsequences")) {
    if (language === "python") return `class Solution:\n    def numDistinct(self, s: str, t: str) -> int:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public int numDistinct(String s, String t) {\n        // Write your code here\n        return 0;\n    }\n}`;
    if (language === "javascript") return `function numDistinct(s, t) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("first missing positive")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def firstMissingPositive(self, nums: List[int]) -> int:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public int firstMissingPositive(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`;
    if (language === "javascript") return `function firstMissingPositive(nums) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("minimum window substring")) {
    if (language === "python") return `class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public String minWindow(String s, String t) {\n        // Write your code here\n        return "";\n    }\n}`;
    if (language === "javascript") return `function minWindow(s, t) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("wildcard matching")) {
    if (language === "python") return `class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public boolean isMatch(String s, String p) {\n        // Write your code here\n        return false;\n    }\n}`;
    if (language === "javascript") return `function isMatch(s, p) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("shortest palindrome")) {
    if (language === "python") return `class Solution:\n    def shortestPalindrome(self, s: str) -> str:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public String shortestPalindrome(String s) {\n        // Write your code here\n        return "";\n    }\n}`;
    if (language === "javascript") return `function shortestPalindrome(s) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("word break ii")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def wordBreak(self, s: str, wordDict: List[str]) -> List[str]:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `import java.util.*;\n\nclass Solution {\n    public List<String> wordBreak(String s, List<String> wordDict) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}`;
    if (language === "javascript") return `function wordBreak(s, wordDict) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("kth smallest element")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def kthSmallest(self, matrix: List[List[int]], k: int) -> int:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public int kthSmallest(int[][] matrix, int k) {\n        // Write your code here\n        return 0;\n    }\n}`;
    if (language === "javascript") return `function kthSmallest(matrix, k) {\n    // Write your code here\n    \n}`;
  }
  
  if (t.includes("split array largest sum")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def splitArray(self, nums: List[int], k: int) -> int:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public int splitArray(int[] nums, int k) {\n        // Write your code here\n        return 0;\n    }\n}`;
    if (language === "javascript") return `function splitArray(nums, k) {\n    // Write your code here\n    \n}`;
  }
  
  // Generated coding questions/fallback:
  if (language === "python") {
    return `import sys\n\ndef process():\n    # Read input from sys.stdin and implement solution\n    pass\n\nif __name__ == '__main__':\n    process()\n`;
  }
  if (language === "java") {
    return `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution logic here\n        \n    }\n}`;
  }
  if (language === "javascript") {
    return `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\n// Implement solution logic here\n`;
  }
  if (language === "c") {
    return `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution logic here\n    return 0;\n}`;
  }
  if (language === "csharp") {
    return `using System;\n\npublic class Program {\n    public static void Main(string[] args) {\n        // Implement solution logic here\n    }\n}`;
  }
  
  return LANGUAGE_MAP[language]?.boilerplate || "";
}

export default function CodeEditor({ 
  questionId, 
  questionTitle = "",
  initialCode, 
  language: initialLanguage, 
  testCases, 
  initialResults = [],
  onTestsStatusChange, 
  onIntegrityCheck, 
  onFinalSubmit,
  onUpdate,
  onRunMode
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState("vs-dark");
  const [activeTab, setActiveTab] = useState<"OUTPUT" | "TESTS" | "DEBUG">("TESTS");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>(initialResults);
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const [executionSummary, setExecutionSummary] = useState<any>(null);
  const [runMode, setRunMode] = useState<"RUN" | "SUBMIT">("RUN");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [monacoFailed, setMonacoFailed] = useState(false);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    setMonacoFailed(false);
    const timeout = window.setTimeout(() => {
      if (!editorRef.current) setMonacoFailed(true);
    }, 8000);

    const handleEditorLoadError = (event: ErrorEvent) => {
      const message = `${event.message || ""} ${event.filename || ""}`.toLowerCase();
      if (message.includes("monaco") || message.includes("/vs/") || message.includes("loader")) {
        setMonacoFailed(true);
      }
    };

    window.addEventListener("error", handleEditorLoadError);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("error", handleEditorLoadError);
    };
  }, [questionId]);

  // Auto-save logic with debounce
  useEffect(() => {
    // 1. Load the specific code for THIS language and THIS question
    const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
    const savedCode = localStorage.getItem(`geonixa_judge_v3_${questionId}_${selectedLanguage}_code_${currentUser}`);
    
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(getQuestionTemplate(questionTitle, selectedLanguage, initialCode));
    }
  }, [questionId, selectedLanguage, initialCode, initialLanguage, questionTitle]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
      // Save code PER LANGUAGE
      localStorage.setItem(`geonixa_judge_v3_${questionId}_${selectedLanguage}_code_${currentUser}`, code);
      localStorage.setItem(`geonixa_judge_v3_${questionId}_lang_${currentUser}`, selectedLanguage);
      if (onUpdate) {
        onUpdate({ code, language: selectedLanguage, results: testResults });
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [code, selectedLanguage, questionId, testResults]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setMonacoFailed(false);

    monaco.editor.defineTheme("geonixa-premium", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6", fontStyle: "bold" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
        { token: "regexp", foreground: "f1fa8c" },
        { token: "type", foreground: "8be9fd", fontStyle: "italic" },
        { token: "class", foreground: "50fa7b" },
        { token: "function", foreground: "50fa7b" },
      ],
      colors: {
        "editor.background": "#0d1117",
        "editor.foreground": "#c9d1d9",
        "editorLineNumber.foreground": "#30363d",
        "editorLineNumber.activeForeground": "#58a6ff",
        "editor.selectionBackground": "#58a6ff33",
        "editor.inactiveSelectionBackground": "#58a6ff11",
        "editorCursor.foreground": "#58a6ff",
        "editor.lineHighlightBackground": "#161b22",
        "editorWidget.background": "#161b22",
        "editorSuggestWidget.background": "#161b22",
        "editorSuggestWidget.border": "#30363d",
        "editorSuggestWidget.selectedBackground": "#58a6ff33",
      }
    });

    monaco.editor.setTheme("geonixa-premium");
  };

  const setEditorMarkers = useCallback((results: TestResult[]) => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const markers = results.flatMap((result) => {
      if (result.status !== "COMPILATION_ERROR" || !result.stderr) return [];
      const matches = [...result.stderr.matchAll(/(?:line|Line)\s*(\d+)/gi)];
      const lineNumber = matches.length ? Number(matches[0][1]) : 1;
      return [{
        severity: monacoRef.current.MarkerSeverity.Error,
        startLineNumber: Math.max(1, lineNumber),
        startColumn: 1,
        endLineNumber: Math.max(1, lineNumber),
        endColumn: 120,
        message: result.stderr.split("\n")[0] || "Compilation error"
      }];
    });

    monacoRef.current.editor.setModelMarkers(model, "geonixa", markers);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen toggle failed:", error);
    }
  };

  useEffect(() => {
    const listener = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);

  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      const isMac = /(Mac|iPod|iPhone|iPad)/i.test(navigator.platform);
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlOrCmd && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
      if (ctrlOrCmd && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        handleSubmitSolution();
      }
      if (ctrlOrCmd && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
        localStorage.setItem(`geonixa_judge_v3_${questionId}_${selectedLanguage}_code_${currentUser}`, code);
      }
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
      if (ctrlOrCmd && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"));
      }
    };

    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [questionId, selectedLanguage, code]);

  const handleSubmitSolution = async () => {
    if (isRunning || isFinalSubmitting) return;
    
    // Custom Professional Confirmation
    const confirmed = window.confirm("Ready to submit this task? All test cases (including hidden ones) will be evaluated.");
    if (!confirmed) return;

    setIsFinalSubmitting(true);
    setActiveTab("TESTS");
    setTestResults([]);

    try {
      const data = await runBatchTests(code, selectedLanguage, testCases, true);
      const results = data.results || [];
      setTestResults(results);

      const allPassed = results.every((r: any) => r.passed);
      const passedCount = results.filter((r: any) => r.passed).length;
      
      setOutput(allPassed 
        ? "✅ ALL TESTCASES PASSED\n\nYour solution is highly optimized and correct. Progress has been synced to the assessment server." 
        : `❌ SUBMISSION FAILED\n\nScore: ${passedCount}/${results.length} cases passed.\nReview the diagnostics below to identify logic gaps.`);
      setActiveTab("OUTPUT");

      if (onUpdate) {
        onUpdate({ code, language: selectedLanguage, results });
      }
      
      if (onTestsStatusChange) onTestsStatusChange(allPassed);
    } catch (err) {
       alert("Network timeout. Progress saved locally.");
    } finally {
      setIsFinalSubmitting(false);
    }
  };

  useEffect(() => {
    const lang = initialLanguage.toLowerCase();
    setSelectedLanguage(LANGUAGE_MAP[lang] ? lang : "javascript");
  }, [initialLanguage]);

  useEffect(() => {
    setTestResults([]);
    setOutput("");
    setExecTime(null);
    setMemoryUsage(null);
  }, [testCases]);

  const runBatchTests = async (code: string, language: string, tests: TestCase[], isFinal: boolean = false) => {
    try {
      const response = await axios.post("/api/execute", {
        code,
        language,
        questionTitle,
        testCases: tests,
        mode: isFinal ? "SUBMIT" : "RUN"
      }, {
        timeout: 60000
      });
      
      const { results, summary } = response.data;
      if (results) {
        setEditorMarkers(results);
      }
      if (summary) {
        setExecutionSummary(summary);
      }
      setRunMode(isFinal ? "SUBMIT" : "RUN");
      return response.data;
    } catch (err: any) {
      console.error("Batch execution failed:", err);
      setEditorMarkers([]);
      return {
        error: "Execution engine unreachable. Retrying...",
        status: "SYSTEM_FAILURE"
      };
    }
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveTab("TESTS");
    setOutput("Initializing sandboxed execution environment...");
    setTestResults([]);

    try {
      const visibleTests = testCases.filter(t => !t.isHidden);
      const data = await runBatchTests(code, selectedLanguage, visibleTests, false);
      
      const results = data.results || [];
      setTestResults(results);
      setActiveTestIndex(0);
      
      const compileError = results.find((r: TestResult) => r.status === "COMPILATION_ERROR");
      const runtimeError = results.find((r: TestResult) => r.status === "RUNTIME_ERROR");
      const wrongAnswer = results.find((r: TestResult) => r.status === "WRONG_ANSWER");
      const allPassed = results.length > 0 && results.every((r: TestResult) => r.passed);

      if (compileError) {
        setOutput(`⚠ COMPILATION ERROR:\n\n${compileError.stderr || "Compilation failed"}`);
        setActiveTab("OUTPUT");
      } else if (runtimeError) {
        setOutput(`⚠ RUNTIME ERROR:\n\n${runtimeError.stderr || "Runtime failure occurred"}`);
        setActiveTab("OUTPUT");
      } else if (wrongAnswer) {
        setOutput(`❌ Wrong Answer\n\nFirst failed testcase: ${wrongAnswer.id}. Review expected vs actual output.`);
        setActiveTab("TESTS");
      } else if (allPassed) {
        setOutput("✅ Sample Testcases Passed\n\nProceed to submit your code to validate against hidden enterprise testcases.");
        setActiveTab("TESTS");
      } else {
        setOutput("⚠ Execution completed with unexpected status. Inspect diagnostics below.");
        setActiveTab("TESTS");
      }
      
      if (data.results?.[0]) {
        setExecTime(data.results[0].time);
        setMemoryUsage(data.results[0].memory);
      }
    } catch (err) {
      setOutput("⚠ Execution System Offline. Progress is saved locally.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunTests = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveTab("TESTS");

    try {
      const { results, summary, error } = await runBatchTests(code, selectedLanguage, testCases, false);
      if (error) {
        setOutput(`⚠ EXECUTION FAILED:\n\n${error}`);
        setActiveTab("OUTPUT");
        return;
      }

      if (!results || results.length === 0) {
        setOutput("Execution returned no results. Check your code logic.");
        setActiveTab("OUTPUT");
        return;
      }

      setTestResults(results);
      setActiveTestIndex(0);

      const compileError = results.find((r: TestResult) => r.status === "COMPILATION_ERROR");
      const runtimeError = results.find((r: TestResult) => r.status === "RUNTIME_ERROR");
      const wrongAnswer = results.find((r: TestResult) => r.status === "WRONG_ANSWER");
      const allPassed = results.every((r: TestResult) => r.passed);

      if (compileError) {
        setOutput(`⚠ COMPILATION ERROR:\n\n${compileError.stderr || "Compilation failed"}`);
        setActiveTab("OUTPUT");
      } else if (runtimeError) {
        setOutput(`⚠ RUNTIME ERROR:\n\n${runtimeError.stderr || "Runtime failure occurred"}`);
        setActiveTab("OUTPUT");
      } else if (wrongAnswer) {
        setOutput(`❌ Wrong Answer\n\nFirst failed testcase: ${wrongAnswer.id}. Review expected vs actual output.`);
        setActiveTab("TESTS");
      } else if (allPassed) {
        setOutput("✅ All testcases passed. Submit to validate hidden enterprise cases.");
        setActiveTab("TESTS");
      }

      if (onIntegrityCheck) onIntegrityCheck(code, results);
      if (onTestsStatusChange) onTestsStatusChange(summary?.status === "ACCEPTED");
    } catch (err) {
      console.error("Critical test runner failure:", err);
      setOutput("⚠ Execution system failure. Check network or service availability.");
      setActiveTab("OUTPUT");
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (confirm("Restore boilerplate code for this language? Current changes will be lost.")) {
      setCode(selectedLanguage === initialLanguage ? (initialCode || LANGUAGE_MAP[selectedLanguage]?.boilerplate || "") : (LANGUAGE_MAP[selectedLanguage]?.boilerplate || ""));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] rounded-2xl overflow-hidden border border-[#30363d] shadow-2xl transition-all">
      <style>{`
        .monaco-editor .margin { background-color: #0d1117 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #010409; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #58a6ff; }
      `}</style>

      <div className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#58a6ff]">
            <Cpu size={18} fill="currentColor" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">ASSESSMENT CORE v4.0</span>
          </div>

          <div className="h-6 w-px bg-[#30363d]" />

          <div className="flex items-center gap-3">
            <Code2 size={14} className="text-slate-500" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-[#c9d1d9] text-[11px] font-black outline-none cursor-pointer uppercase tracking-wider"
            >
              {Object.keys(LANGUAGE_MAP).map(lang => (
                <option key={lang} value={lang} className="bg-[#0d1117]">{lang.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigator.clipboard.writeText(code)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Copy Code"><Copy size={16} /></button>
          <button onClick={handleReset} className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all" title="Reset Boilerplate"><RotateCcw size={16} /></button>
          <button onClick={toggleFullscreen} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Toggle Fullscreen"><Maximize2 size={16} /></button>
          <button onClick={() => setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"))} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Toggle Theme">
            <Palette size={16} />
          </button>
          <div className="h-6 w-px bg-[#30363d] mx-2" />

          <button
            onClick={handleRunCode}
            disabled={isRunning || isFinalSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-[#161b22] hover:bg-[#1c2128] text-[#58a6ff] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#30363d] disabled:opacity-50 transition-all active:scale-95"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
            Run Code
          </button>

          <button
            onClick={handleRunTests}
            disabled={isRunning || isFinalSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all border border-slate-700 active:scale-95 shadow-lg"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
            Test Suite
          </button>

          <div className="w-px h-6 bg-[#30363d] mx-2" />

          <button
            onClick={handleSubmitSolution}
            disabled={isRunning || isFinalSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all border border-emerald-400/50 active:scale-95"
          >
            {isFinalSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            Submit Solution
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-2 relative border-r border-[#30363d]">
          {monacoFailed ? (
            <SimpleCodeEditor
              value={code}
              onValueChange={setCode}
              highlight={(value) => value}
              disabled={isRunning || isFinalSubmitting}
              padding={20}
              textareaClassName="focus:outline-none disabled:opacity-50"
              preClassName="custom-scrollbar"
              className="h-full min-h-full overflow-auto custom-scrollbar bg-[#0d1117] text-[#c9d1d9]"
              style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                fontSize: 14,
                lineHeight: 1.5,
                minHeight: "100%",
                tabSize: 4,
              }}
            />
          ) : (
            <Editor
              height="100%"
              language={LANGUAGE_MAP[selectedLanguage]?.monaco || "javascript"}
              theme={theme}
              value={code}
              loading={<div className="h-full flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest">Loading editor...</div>}
              onChange={(v) => {
                setCode(v || "");
                setTestResults([]);
              }}
              onMount={handleEditorDidMount}
              options={{
                contextmenu: false,
                dragAndDrop: false,
                readOnly: isRunning || isFinalSubmitting,
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "all",
                renderWhitespace: "all",
                renderControlCharacters: true,
                tabSize: 4,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                formatOnType: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                padding: { top: 20, bottom: 20 },
                bracketPairColorization: { enabled: true },
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                folding: true,
                lineHeight: 1.5,
                letterSpacing: 0,
                wordWrap: "on",
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible",
                  useShadows: false,
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10
                }
              }}
            />
          )}
        </div>

        <div className="flex-1 flex flex-col bg-[#010409]">
          <div className="flex border-b border-[#30363d]">
            {["TESTS", "OUTPUT"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-[#58a6ff] bg-[#161b22] border-b-2 border-[#58a6ff]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === "TESTS" && (
              <div className="p-0 h-full flex flex-col bg-[#0d1117]">
                <div className="flex items-center gap-1 p-2 bg-[#161b22] border-b border-[#30363d] overflow-x-auto custom-scrollbar">
                  {(runMode === "SUBMIT" ? testCases : testCases.filter(t => !t.isHidden)).map((test, idx) => (
                    <button
                      key={test.id}
                      onClick={() => setActiveTestIndex(idx)}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                        activeTestIndex === idx 
                          ? "bg-[#21262d] text-white shadow-lg border border-[#58a6ff]/30" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {test.isHidden ? `🔒 Case ${idx + 1}` : `📝 Sample ${idx + 1}`}
                      {testResults[idx] && (
                        <div className={`w-1.5 h-1.5 rounded-full ${testResults[idx].passed ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                  {!testResults.length ?
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-4 text-blue-500">
                        <Play size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-300">Run your code to see results</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-50">We'll validate your solution against {testCases.filter(t => !t.isHidden).length} sample testcases.</p>
                    </div>
                  :
                    <div className="space-y-6 animate-fade-in">
                      <ProfessionalTestcasePanel
                        results={testResults as any}
                        totalTestcases={runMode === "RUN" ? testCases.filter(t => !t.isHidden).length : testCases.length}
                        mode={runMode}
                        possibleHardcode={executionSummary?.possibleHardcode}
                        detectedComplexity={executionSummary?.detectedComplexity}
                        categoryBreakdown={executionSummary?.byCategory}
                        categoryPassed={executionSummary?.passedByCategory}
                      />

                      {/* Detailed View */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${
                            testResults[activeTestIndex]?.passed ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            {testResults[activeTestIndex]?.status === "ACCEPTED" ? "Success" : 
                             testResults[activeTestIndex]?.status === "WRONG_ANSWER" ? "Mismatch" : 
                             testResults[activeTestIndex]?.status || "Error"}
                          </h3>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                              <Clock size={10} /> {testResults[activeTestIndex]?.time || 0}ms
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                              <Cpu size={10} /> {testResults[activeTestIndex]?.memory ? Math.round(testResults[activeTestIndex].memory / 1024) : 0}KB
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Input</label>
                            <pre className="p-3 bg-[#161b22] rounded-xl text-[11px] font-mono text-slate-300 border border-[#30363d] overflow-x-auto">
                              {(((runMode as string) === "SUBMIT" ? testCases : testCases.filter(t => !t.isHidden))[activeTestIndex]?.isHidden || (runMode as string) === "SUBMIT") ? "[HIDDEN]" : (testResults[activeTestIndex]?.input || ((runMode as string) === "SUBMIT" ? testCases : testCases.filter(t => !t.isHidden))[activeTestIndex]?.input)}
                            </pre>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Expected Output</label>
                              <pre className="p-3 bg-emerald-500/5 rounded-xl text-[11px] font-mono text-emerald-500/80 border border-emerald-500/10">
                                {(((runMode as string) === "SUBMIT" ? testCases : testCases.filter(t => !t.isHidden))[activeTestIndex]?.isHidden || (runMode as string) === "SUBMIT") ? "[HIDDEN]" : (testResults[activeTestIndex]?.expected || ((runMode as string) === "SUBMIT" ? testCases : testCases.filter(t => !t.isHidden))[activeTestIndex]?.expectedOutput)}
                              </pre>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Your Output</label>
                              <pre className={`p-3 rounded-xl text-[11px] font-mono border ${
                                testResults[activeTestIndex]?.passed 
                                  ? 'bg-emerald-500/5 text-emerald-400/80 border-emerald-500/10' 
                                  : 'bg-rose-500/5 text-rose-400/80 border-rose-500/10'
                              }`}>
                                {(((runMode as string) === "SUBMIT" ? testCases : testCases.filter(t => !t.isHidden))[activeTestIndex]?.isHidden || (runMode as string) === "SUBMIT") ? "[HIDDEN]" : (testResults[activeTestIndex]?.actual || (testResults[activeTestIndex]?.stderr ? "Error in execution" : "No output"))}
                              </pre>
                            </div>
                          </div>

                          {testResults[activeTestIndex]?.stderr && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-rose-500/50">Error Stream</label>
                              <pre className="p-4 bg-rose-500/5 rounded-xl font-mono text-[11px] text-rose-400 border border-rose-500/10 whitespace-pre-wrap">
                                {testResults[activeTestIndex].stderr}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            )}

            {activeTab === "OUTPUT" && (
              <div className="p-6 h-full overflow-auto custom-scrollbar bg-[#0d1117]">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <Terminal size={14} /> System Diagnostics
                   </h3>
                   <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Terminal v4.2 Stable</span>
                </div>
                
                <div className="space-y-6">
                  {output ? (
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-2 text-emerald-500/40 mb-3 select-none">
                         <span className="text-xs">➜</span>
                         <span className="text-[9px] font-black uppercase tracking-widest">process.stdout</span>
                      </div>
                      <pre className="font-mono text-[12px] text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/40 p-5 rounded-2xl border border-white/5 shadow-2xl">
                        {output}
                      </pre>
                      <div className="mt-6 flex justify-between items-center opacity-50">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" />
                           {output.includes("Retrying") ? "Execution in progress..." : "Process exited successfully"}
                        </span>
                        {execTime && <span className="text-[10px] font-bold text-slate-500 italic tracking-tighter">Wall Time: {execTime}ms</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-700 space-y-4">
                      <Terminal size={32} strokeWidth={1} className="opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Listener waiting for execution stream...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-10 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between px-6">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
                <ShieldCheck size={12} className="text-emerald-500" /> Secure Environment
              </div>
              {execTime && (
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
                  <Clock size={12} /> {execTime}ms
                </div>
              )}
            </div>
            <div className="flex items-center gap-6">
               <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Geonixa Core Engine</div>
               <button
                 onClick={handleSubmitSolution}
                 disabled={isRunning || isFinalSubmitting}
                 className="h-7 px-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
               >
                 {isFinalSubmitting ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                 <span className="text-[9px] font-black uppercase tracking-widest">Submit Solution</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
