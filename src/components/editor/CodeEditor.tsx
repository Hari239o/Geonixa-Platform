"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";
import {
  Play, RotateCcw, Terminal, ShieldCheck, Loader2, CheckCircle2, Check,
  XCircle, Code2, Cpu, Copy, Download, Maximize2, Palette, AlertCircle, Clock, Zap, X, ChevronUp, ChevronDown, ListChecks
} from "lucide-react";
import axios from "axios";
import SimpleCodeEditor from "react-simple-code-editor";
import ProfessionalTestcasePanel from "./ProfessionalTestcasePanel";

// Configure Monaco Loader to use CDN for stability and speed
loader.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs" } });

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
  onSubmitSolution?: (code: string, language: string) => void;
  onUpdate?: (data: { code: string, language: string, results: TestResult[] }) => void;
  onRunMode?: (mode: "RUN" | "SUBMIT") => void; // Added to fix ghost TS error
  isExamMode?: boolean;
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
  questionTitle?: string;
  expected?: string;
  stderr?: string;
  stdout?: string;
  output?: string;
  category?: string;
  possibleHardcode?: boolean;
  complexity?: {
    analyzed: boolean;
    suspected: string;
  };
  isHidden?: boolean;
}

function getQuestionTemplate(questionTitle: string, language: string, initialCode: string) {
  const t = questionTitle?.toLowerCase() || "";
  
  // Only use default initialCode (which is C++) if language is cpp or c
  if ((language === "cpp" || language === "c") && initialCode?.trim()) {
    return initialCode;
  }

  const cppCode = LANGUAGE_MAP.cpp?.boilerplate || "";

  if (language === "cpp") {
    return cppCode;
  }

  if (t.includes("stickers") || t.includes("spell word")) {
    if (language === "python") return `from typing import List\n\nclass Solution:\n    def minStickers(self, stickers: List[str], target: str) -> int:\n        # Complete your solution here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public int minStickers(String[] stickers, String target) {\n        // Complete your solution here\n        return 0;\n    }\n}`;
    if (language === "javascript") return `function minStickers(stickers, target) {\n    // Complete your solution here\n    \n}`;
    if (language === "csharp") return `public class Solution {\n    public int MinStickers(string[] stickers, string target) {\n        // Complete your solution here\n        return 0;\n    }\n}`;
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
    if (language === "java") return `class Solution {\n    public String minWindow(String s, String t) {\n        // Write your code here\n        return \"\";\n    }\n}`;
    if (language === "javascript") return `function minWindow(s, t) {\n    // Write your code here\n    \n}`;
  }

  if (t.includes("wildcard matching")) {
    if (language === "python") return `class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public boolean isMatch(String s, String p) {\n        // Write your code here\n        return false;\n    }\n}`;
    if (language === "javascript") return `function isMatch(s, p) {\n    // Write your code here\n    \n}`;
  }

  if (t.includes("shortest palindrome")) {
    if (language === "python") return `class Solution:\n    def shortestPalindrome(self, s: str) -> str:\n        # Write your code here\n        pass\n`;
    if (language === "java") return `class Solution {\n    public String shortestPalindrome(String s) {\n        // Write your code here\n        return \"\";\n    }\n}`;
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
  onSubmitSolution,
  onUpdate,
  onRunMode,
  isExamMode = false
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState("light");
  const [activeTab, setActiveTab] = useState<"TESTS" | "OUTPUT" | "COMPILATION" | "RUNTIME">("TESTS");
  const [output, setOutput] = useState("");
  const [isResultPanelOpen, setIsResultPanelOpen] = useState(false);
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
  const [submitConfirmationOpen, setSubmitConfirmationOpen] = useState(false);

  const visibleTests = testCases.filter((t) => !t.isHidden);
  const displayTestCases = runMode === "SUBMIT" ? testCases : visibleTests;
  const executedTestCount = runMode === "SUBMIT"
    ? testCases.length
    : Math.max(testResults.length || visibleTests.length, visibleTests.length);
  const hiddenExecutionCount = runMode === "RUN" && testResults.length > displayTestCases.length
    ? testResults.length - displayTestCases.length
    : 0;

  useEffect(() => {
    if (activeTestIndex >= displayTestCases.length) {
      setActiveTestIndex(0);
    }
  }, [displayTestCases.length, activeTestIndex]);

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

    // We use the theme prop directly so it respects "light" theme.
    // The "geonixa-premium" theme is defined but not forcefully set here anymore.
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

  const executeSubmitSolution = async () => {
    if (isRunning || isFinalSubmitting) return;

    setIsFinalSubmitting(true);
    setRunMode("SUBMIT");
    setExecutionSummary(null);
    setActiveTab("TESTS");
    setTestResults([]);

    try {
      const data = await runBatchTests(code, selectedLanguage, testCases, true);
      const results = data.results || [];
      const typedResults = results as Array<TestResult & { isHidden?: boolean }>;
      setTestResults(typedResults);
      setExecutionSummary(data.summary || null);
      setExecTime(typedResults[0]?.time ?? null);
      setMemoryUsage(typedResults[0]?.memory ?? null);

      const allPassed = typedResults.length > 0 && typedResults.every((r: any) => r.passed);
      const passedCount = typedResults.filter((r: any) => r.passed).length;
      
      const compileError = typedResults.find((r: TestResult) => r.status === "COMPILATION_ERROR");
      const runtimeError = typedResults.find((r: TestResult) => r.status === "RUNTIME_ERROR");
      const firstFailure = typedResults.find((r: TestResult) => !r.passed);

      const totalCount = data.summary?.total ?? typedResults.length ?? testCases.length;

      let lines = [
        "Final Submission Result",
        `Passed: ${passedCount}/${totalCount}`,
        `Failed: ${Math.max(0, totalCount - passedCount)}/${totalCount}`,
      ];

      const hiddenCount = typedResults.filter((r) => r.isHidden).length;
      if (hiddenCount > 0) lines.push(`Hidden testcases executed: ${hiddenCount}`);

      let mainOutput = lines.join("\n");

      if (compileError) {
        setOutput(`⚠ COMPILATION ERROR:\n\n${compileError.stderr || "Compilation failed"}\n\n---\n${mainOutput}`);
        setActiveTab("OUTPUT");
      } else if (runtimeError) {
        setOutput(`⚠ RUNTIME ERROR:\n\n${runtimeError.stderr || "Runtime failure occurred"}\n\n---\n${mainOutput}`);
        setActiveTab("OUTPUT");
      } else {
        if (!allPassed && firstFailure) {
          mainOutput += `\n\nFirst failed testcase: ${firstFailure.id}\nExpected output: ${firstFailure.isHidden ? "[HIDDEN]" : (firstFailure.expected || "")}\nActual output: ${firstFailure.isHidden ? "[HIDDEN]" : (firstFailure.actual || "No output")}`;
        }
        setOutput(allPassed 
          ? `✅ ALL TESTCASES PASSED\n\nYour solution is highly optimized and correct. Progress has been synced to the assessment server.\n\n---\n${mainOutput}`
          : `❌ SUBMISSION FAILED\n\nScore: ${passedCount}/${totalCount} cases passed.\nReview the diagnostics below to identify logic gaps.\n\n---\n${mainOutput}`);
        setActiveTab("TESTS");
      }

      if (onUpdate) {
        onUpdate({ code, language: selectedLanguage, results });
      }
      
      if (onTestsStatusChange) onTestsStatusChange(allPassed);

      if (onSubmitSolution) {
        onSubmitSolution(code, selectedLanguage);
      }
    } catch (err) {
       alert("Network timeout. Progress saved locally.");
    } finally {
      setIsFinalSubmitting(false);
      setIsResultPanelOpen(true);
    }
  };

  const handleSubmitSolution = async () => {
    if (isRunning || isFinalSubmitting) return;
    setSubmitConfirmationOpen(true);
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
        timeout: 90000
      });
      
      console.log("✅ API Response received:", response.data);
      
      const { results, summary } = response.data;
      if (results && results.length > 0) {
        setEditorMarkers(results);
      }
      setExecutionSummary(summary || null);
      setRunMode(isFinal ? "SUBMIT" : "RUN");
      return response.data;
    } catch (err: any) {
      console.error("❌ Batch execution failed:", err?.message || err);
      console.error("Error details:", err?.response?.data || err?.config);
      setEditorMarkers([]);
      return {
        error: err?.response?.data?.error || "Execution engine unreachable",
        results: [],
        summary: { passed: 0, total: tests.length, passPercentage: 0, status: "INTERNAL_ERROR", possibleHardcode: false, detectedComplexity: "UNKNOWN", byCategory: {}, passedByCategory: {} },
        status: "NETWORK_ERROR"
      };
    }
  };
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setRunMode("RUN");
    setExecutionSummary(null);
    setActiveTab("TESTS");
    setOutput("Initializing sandboxed execution environment...");
    setTestResults([]);

    try {
      const visibleTests = testCases.filter(t => !t.isHidden);
      const data = await runBatchTests(code, selectedLanguage, visibleTests, false);
      
      console.log("handleRunCode - data received:", data);
      
      if (data.error && (!data.results || data.results.length === 0)) {
        setOutput(`⚠ EXECUTION ERROR:\n\n${data.error}`);
        setActiveTab("OUTPUT");
        setIsRunning(false);
        return;
      }
      
      const results = data.results || [];
      const typedResults = results as Array<TestResult & { isHidden?: boolean }>;
      
      if (typedResults.length === 0) {
        setOutput(data.error ? `⚠ EXECUTION ERROR:\n\n${data.error}` : "⚠ No test results returned. The execution may have timed out or encountered an issue.");
        setActiveTab("OUTPUT");
        setIsRunning(false);
        return;
      }
      
      console.log("Setting test results:", typedResults);
      setTestResults(typedResults);
      setExecTime(typedResults[0]?.time ?? null);
      setMemoryUsage(typedResults[0]?.memory ?? null);
      setActiveTestIndex(0);
      
      const compileError = typedResults.find((r: TestResult) => r.status === "COMPILATION_ERROR");
      const runtimeError = typedResults.find((r: TestResult) => r.status === "RUNTIME_ERROR");
      const wrongAnswer = typedResults.find((r: TestResult) => r.status === "WRONG_ANSWER");
      const firstFailure = typedResults.find((r: TestResult) => !r.passed);
      const allPassed = typedResults.length > 0 && typedResults.every((r: TestResult) => r.passed);
      const passedCount = typedResults.filter((r: TestResult) => r.passed).length;
      
      const totalCount = data.summary?.total ?? typedResults.length ?? visibleTests.length;

      let lines = [
        "Run Code Result",
        `Passed: ${passedCount}/${totalCount}`,
        `Failed: ${Math.max(0, totalCount - passedCount)}/${totalCount}`,
      ];

      const hiddenCount = typedResults.filter((r) => r.isHidden).length;
      if (hiddenCount > 0) lines.push(`Hidden testcases executed: ${hiddenCount}`);

      let mainOutput = lines.join("\n");

      if (compileError) {
        setOutput(`⚠ COMPILATION ERROR:\n\n${compileError.stderr || "Compilation failed"}\n\n---\n${mainOutput}`);
        setActiveTab("OUTPUT");
      } else if (runtimeError) {
        setOutput(`⚠ RUNTIME ERROR:\n\n${runtimeError.stderr || "Runtime failure occurred"}\n\n---\n${mainOutput}`);
        setActiveTab("OUTPUT");
      } else if (wrongAnswer || firstFailure) {
        const failedTest = wrongAnswer || firstFailure;
        mainOutput += `\n\nFirst failed testcase: ${failedTest?.id}\nExpected output: ${failedTest?.isHidden ? "[HIDDEN]" : (failedTest?.expected || "")}\nActual output: ${failedTest?.isHidden ? "[HIDDEN]" : (failedTest?.actual || "No output")}`;
        setOutput(`❌ Wrong Answer\n\nReview expected vs actual output.\n\n---\n${mainOutput}`);
        setActiveTab("TESTS");
      } else if (allPassed) {
        setOutput(`✅ Sample Testcases Passed\n\nProceed to submit your code to validate against hidden enterprise testcases.\n\n---\n${mainOutput}`);
        setActiveTab("OUTPUT");
      } else {
        setOutput(`⚠ Execution completed with unexpected status. Inspect diagnostics below.\n\n---\n${mainOutput}`);
        setActiveTab("TESTS");
      }
      
      if (data.results?.[0]) {
        setExecTime(data.results[0].time ?? null);
        setMemoryUsage(data.results[0].memory ?? null);
      }
    } catch (err: any) {
      console.error("handleRunCode error:", err);
      setOutput("⚠ Execution System Offline. Progress is saved locally.");
      setActiveTab("OUTPUT");
    } finally {
      setIsRunning(false);
      setIsResultPanelOpen(true);
    }
  };

  const handleRunTests = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setRunMode("RUN");
    setExecutionSummary(null);
    setActiveTab("TESTS");

    try {
      const { results, summary, error } = await runBatchTests(code, selectedLanguage, testCases, false);
      if (error) {
        setOutput(`⚠ EXECUTION FAILED:\n\n${error}`);
        setActiveTab("OUTPUT");
        return;
      }

      if (!results || results.length === 0) {
        setOutput(error ? `⚠ EXECUTION FAILED:\n\n${error}` : "Execution returned no results. Check your code logic.");
        setActiveTab("OUTPUT");
        return;
      }

      const typedResults = results as Array<TestResult & { isHidden?: boolean }>;
      setTestResults(typedResults);
      setActiveTestIndex(0);
      setExecutionSummary(summary || null);

      const compileError = typedResults.find((r: TestResult) => r.status === "COMPILATION_ERROR");
      const runtimeError = typedResults.find((r: TestResult) => r.status === "RUNTIME_ERROR");
      const wrongAnswer = typedResults.find((r: TestResult) => r.status === "WRONG_ANSWER");
      const firstFailure = typedResults.find((r: TestResult) => !r.passed);
      const allPassed = typedResults.length > 0 && typedResults.every((r: TestResult) => r.passed);
      const passedCount = typedResults.filter((r: TestResult) => r.passed).length;

      const totalCount = summary?.total ?? typedResults.length ?? testCases.length;

      let lines = [
        "Run Tests Result",
        `Passed: ${passedCount}/${totalCount}`,
        `Failed: ${Math.max(0, totalCount - passedCount)}/${totalCount}`,
      ];

      const hiddenCount = typedResults.filter((r) => r.isHidden).length;
      if (hiddenCount > 0) lines.push(`Hidden testcases executed: ${hiddenCount}`);

      let mainOutput = lines.join("\n");

      if (compileError) {
        setOutput(`⚠ COMPILATION ERROR:\n\n${compileError.stderr || "Compilation failed"}\n\n---\n${mainOutput}`);
        setActiveTab("OUTPUT");
      } else if (runtimeError) {
        setOutput(`⚠ RUNTIME ERROR:\n\n${runtimeError.stderr || "Runtime failure occurred"}\n\n---\n${mainOutput}`);
        setActiveTab("OUTPUT");
      } else if (wrongAnswer || firstFailure) {
        const failedTest = wrongAnswer || firstFailure;
        mainOutput += `\n\nFirst failed testcase: ${failedTest?.id}\nExpected output: ${failedTest?.isHidden ? "[HIDDEN]" : (failedTest?.expected || "")}\nActual output: ${failedTest?.isHidden ? "[HIDDEN]" : (failedTest?.actual || "No output")}`;
        setOutput(`❌ Wrong Answer\n\nReview expected vs actual output.\n\n---\n${mainOutput}`);
        setActiveTab("TESTS");
      } else if (allPassed) {
        setOutput(`✅ All testcases passed. Submit to validate hidden enterprise cases.\n\n---\n${mainOutput}`);
        setActiveTab("OUTPUT");
      } else {
        setOutput(`⚠ Execution completed with unexpected status. Inspect diagnostics below.\n\n---\n${mainOutput}`);
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
      setIsResultPanelOpen(true);
    }
  };

  const handleReset = () => {
    if (confirm("Restore boilerplate code for this language? Current changes will be lost.")) {
      setCode(selectedLanguage === initialLanguage ? (initialCode || LANGUAGE_MAP[selectedLanguage]?.boilerplate || "") : (LANGUAGE_MAP[selectedLanguage]?.boilerplate || ""));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[whitesmoke] rounded-2xl overflow-hidden border border-[#30363d] shadow-2xl transition-all relative">
      <style>{`
        .monaco-editor .margin { background-color: whitesmoke !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #010409; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #58a6ff; }
      `}</style>

      <div className="min-h-[52px] py-1.5 bg-[whitesmoke] border-b border-[#cbd5e1] flex items-center justify-between gap-2 px-3 sm:px-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 text-slate-800">
            <Cpu size={16} className="text-[#2563eb]" fill="currentColor" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase hidden xl:inline-block">ASSESSMENT</span>
          </div>

          <div className="h-5 w-px bg-slate-300" />

          <div className="flex items-center gap-1.5">
            <Code2 size={13} className="text-slate-500" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-slate-700 text-[11px] font-black outline-none cursor-pointer uppercase tracking-wider"
            >
              {Object.keys(LANGUAGE_MAP).map(lang => (
                <option key={lang} value={lang} className="bg-white text-slate-800">{lang.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
          <div className="flex items-center gap-0.5">
            <button onClick={() => navigator.clipboard.writeText(code)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all" title="Copy Code"><Copy size={15} /></button>
            <button onClick={handleReset} className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-500/10 rounded-lg transition-all" title="Reset Boilerplate"><RotateCcw size={15} /></button>
            <button onClick={toggleFullscreen} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all" title="Toggle Fullscreen"><Maximize2 size={15} /></button>
            <button onClick={() => setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"))} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all" title="Toggle Theme">
              <Palette size={15} />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-300 mx-1" />

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRunCode}
              disabled={isRunning || isFinalSubmitting}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#161b22] hover:bg-[#1c2128] text-[#58a6ff] rounded-lg text-[10px] font-black uppercase tracking-wider border border-[#30363d] disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
            >
              {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
              Run
            </button>

            <button
              onClick={handleSubmitSolution}
              disabled={isRunning || isFinalSubmitting}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider disabled:opacity-50 transition-all active:scale-95 shadow-md whitespace-nowrap"
            >
              {isFinalSubmitting ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} fill="currentColor" />}
              Submit
            </button>
          </div>
        </div>
      </div>
      {/* Submit Confirmation Modal */}
      {submitConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black mb-3" style={{ color: "#ffffff" }}>Confirm Submission</h3>
            <p className="mb-6 leading-relaxed font-medium" style={{ color: "#e2e8f0" }}>
              Are you sure you want to submit your solution? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setSubmitConfirmationOpen(false)}
                className="flex-1 flex items-center justify-center py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-bold"
                style={{ color: "#94a3b8" }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setSubmitConfirmationOpen(false);
                  await executeSubmitSolution();
                }}
                className="flex-1 flex items-center justify-center py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-colors font-black shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
                style={{ color: "#000000" }}
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex min-h-0 flex-col">
        <div className="relative border-b border-[#30363d] flex-1 min-h-[100px] overflow-hidden">
          {monacoFailed ? (
            <SimpleCodeEditor
              value={code}
              onValueChange={setCode}
              highlight={(value) => value}
              disabled={isRunning || isFinalSubmitting}
              padding={20}
              textareaClassName="focus:outline-none disabled:opacity-50"
              preClassName="custom-scrollbar"
              className="h-full min-h-full overflow-auto custom-scrollbar bg-[whitesmoke] text-[#0f172a]"
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

        {/* Resizable Result Drawer - Shrinks editor when open */}
        <div 
          className={`bg-white border-t border-slate-300 flex flex-col transition-all duration-300 ease-in-out z-40 shrink-0 ${
            isResultPanelOpen ? 'h-[40%] min-h-[150px] opacity-100' : 'h-0 min-h-0 opacity-0 pointer-events-none'
          }`}
          style={{ boxShadow: isResultPanelOpen ? '0 -10px 30px rgba(0,0,0,0.1)' : 'none' }}
        >
          <div className="flex justify-between items-center bg-slate-50 border-b border-slate-200 px-2 shrink-0">
            <div className="flex overflow-x-auto custom-scrollbar">
              {["TESTS", "OUTPUT", "COMPILATION", "RUNTIME"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline-block mr-2">Execution Results</span>
              <button 
                onClick={() => setIsResultPanelOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors mr-2 cursor-pointer"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-white">
            {activeTab === "TESTS" && (
               <div className="p-0 h-full flex flex-col bg-white">
                 {/* Test Results Summary Card */}
                 <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 tracking-widest">Passed</div>
                     <div className="text-2xl font-black text-emerald-600">{testResults.filter(r => r.passed).length}</div>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 tracking-widest">Failed</div>
                     <div className="text-2xl font-black text-rose-600">{testResults.filter(r => r.passed === false).length}</div>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 tracking-widest">Time</div>
                     <div className="text-2xl font-black text-blue-600">{execTime ? `${execTime}ms` : '-'}</div>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 tracking-widest">Memory</div>
                     <div className="text-2xl font-black text-purple-600">{memoryUsage ? `${(memoryUsage / 1024 / 1024).toFixed(1)}MB` : '-'}</div>
                   </div>
                 </div>
                 
                 {/* Detailed Test Cases */}
                 <div className="flex-1 overflow-auto p-4 space-y-4">
                   {testResults.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-8">
                        <ListChecks size={32} className="opacity-20 text-slate-400" />
                        <div className="text-xs font-bold uppercase tracking-widest opacity-60">Run code to evaluate tests</div>
                      </div>
                   ) : (
                      testResults.map((result, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <div className={`px-4 py-3 border-b text-sm font-bold flex items-center justify-between ${result.passed ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                            <div className="flex items-center gap-2">
                              {result.passed ? <CheckCircle2 size={18} className="text-emerald-600" /> : <XCircle size={18} className="text-rose-600" />}
                              <span>Test Case #{idx + 1}</span>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {result.passed ? 'Accepted' : 'Rejected'}
                            </span>
                          </div>
                          
                          <div className="p-4 bg-slate-50 space-y-4">
                            {!result.isHidden ? (
                              <>
                                <div>
                                  <div className="text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Input</div>
                                  <div className="font-mono text-sm bg-white text-slate-800 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">{result.input || "No input"}</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Expected Output</div>
                                    <div className="font-mono text-sm bg-white text-slate-800 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">{result.expected || "N/A"}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Actual Output</div>
                                    <div className={`font-mono text-sm bg-white p-3 rounded-lg border whitespace-pre-wrap ${!result.passed ? 'border-rose-300 text-rose-800 bg-rose-50' : 'border-slate-200 text-slate-800'}`}>
                                      {result.actual || result.output || "No output"}
                                    </div>
                                  </div>
                                </div>
                                {(result.stdout || result.stderr) && (
                                  <div>
                                    <div className="text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Console Output</div>
                                    <div className="font-mono text-xs bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                                      {result.stdout && <div>{result.stdout}</div>}
                                      {result.stderr && <div className="text-rose-400">{result.stderr}</div>}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="py-6 flex flex-col items-center justify-center text-slate-500">
                                <span className="text-sm font-bold bg-slate-200 px-3 py-1 rounded-full uppercase tracking-widest text-slate-600">Hidden Test Case</span>
                                <p className="text-xs mt-2 max-w-sm text-center">Input and output details are hidden to prevent hardcoding. Ensure your logic covers edge cases.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                   )}
                 </div>
               </div>
            )}

            {activeTab === "OUTPUT" && (
              <div className="p-6 h-full font-mono text-sm text-slate-800 whitespace-pre-wrap overflow-auto">
                {output || "Waiting for execution stream..."}
              </div>
            )}

            {activeTab === "COMPILATION" && (
              <div className="p-6 h-full font-mono text-sm text-rose-600 whitespace-pre-wrap overflow-auto">
                {testResults.find(r => r.status === "COMPILATION_ERROR")?.stderr || "No compilation errors detected."}
              </div>
            )}

            {activeTab === "RUNTIME" && (
              <div className="p-6 h-full text-slate-700">
                 <h3 className="text-sm font-black mb-6 text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-4">Runtime Diagnostics</h3>
                 <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-2xl">
                   <div className="flex justify-between border-b border-slate-100 pb-3">
                     <span className="font-semibold text-slate-600">Average Execution Time</span>
                     <span className="font-mono font-bold text-blue-600">{execTime != null ? `${execTime}ms` : 'N/A'}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-100 pb-3">
                     <span className="font-semibold text-slate-600">Peak Memory Usage</span>
                     <span className="font-mono font-bold text-purple-600">{memoryUsage != null ? `${(memoryUsage / 1024 / 1024).toFixed(1)}MB` : 'N/A'}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-100 pb-3">
                     <span className="font-semibold text-slate-600">Test Cases Evaluated</span>
                     <span className="font-mono font-bold text-slate-800">{testResults.length}</span>
                   </div>
                   <div className="flex justify-between pb-3">
                     <span className="font-semibold text-slate-600">Engine Environment</span>
                     <span className="font-mono font-bold text-slate-800 uppercase">{selectedLanguage} Sandboxed Container</span>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
