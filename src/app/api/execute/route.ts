import { NextResponse } from 'next/server';
import { JudgeEngine, TestCase, JudgeResult } from '@/lib/JudgeEngine';
import { execFile, spawn } from 'child_process';
import { promises as fs, existsSync } from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import {
  DSA_HARD_POOL,
  JAVA_POOL,
  PYTHON_POOL,
  WEB_DEV_POOL,
  DATA_SCIENCE_POOL
} from '@/data/questions_data';
import { TECHNICAL_ROUND_4_POOL } from '@/data/examQuestions';

function getRealTestCases(questionTitle: string): TestCase[] {
  const titleLower = questionTitle.toLowerCase().trim();
  const allPools = [
    ...TECHNICAL_ROUND_4_POOL,
    ...DSA_HARD_POOL,
    ...JAVA_POOL,
    ...PYTHON_POOL,
    ...WEB_DEV_POOL,
    ...DATA_SCIENCE_POOL
  ];
  const found = allPools.find(q => q.title.toLowerCase().trim() === titleLower);
  return found ? (found.tests as any[]) : [];
}

export const runtime = 'nodejs';
export const maxDuration = 300;

const execFileAsync = promisify(execFile);

const JUDGE0_LANG_MAP: Record<string, number> = {
  "cpp": 54,
  "c": 50,
  "python": 71,
  "javascript": 93,
  "java": 91,
  "csharp": 51
};

const LANG_MAP: Record<string, string> = {
  "cpp": "cpp",
  "c": "c",
  "python": "python",
  "javascript": "javascript",
  "java": "java",
  "csharp": "csharp"
};

const USE_LOCAL_FIRST = process.env.LOCAL_JUDGE_EXECUTION_FIRST === "true";
const REMOTE_MIRROR_TIMEOUT_MS = 14000;

async function executeRemoteTest(pistonLang: string, executableCode: string, test: TestCase, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const rapidApiKey = process.env.RAPIDAPI_KEY;

  if (!rapidApiKey) {
    throw new Error("RAPIDAPI_KEY is missing. Remote execution unavailable.");
  }

  const langId = JUDGE0_LANG_MAP[pistonLang] || 71;

  try {
    const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      },
      body: JSON.stringify({
        language_id: langId,
        source_code: executableCode,
        stdin: test.input || "",
        cpu_time_limit: (test.timeLimit || 5000) / 1000.0,
        memory_limit: (test.memoryLimit || 256) * 1024
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const serverBody = await response.text().catch(() => "");
      throw new Error(`HTTP_${response.status}:${serverBody}`);
    }

    const data = await response.json();
    const statusId = data.status?.id || 13;

    return {
      compile: {
        code: statusId === 6 ? 1 : 0,
        stderr: data.compile_output || "",
        output: data.compile_output || ""
      },
      run: {
        code: (statusId === 3 || statusId === 4) ? 0 : 1,
        stdout: data.stdout || "",
        stderr: data.stderr || data.message || "",
        time: parseFloat(data.time || "0") * 1000,
        memory: (data.memory || 0) * 1024,
        signal: statusId === 5 ? "SIGKILL" : null
      }
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

const parseCppVector = `
vector<int> parseVector(const string& line) {
  vector<int> values;
  stringstream ss(line);
  int value;
  while (ss >> value) values.push_back(value);
  return values;
}
`;

function hasMainFunction(code: string): boolean {
  return /\bint\s+main\s*\(/.test(code) || /\bvoid\s+main\s*\(/.test(code) || /\bpublic\s+static\s+void\s+main\s*\(/i.test(code);
}

function normalizeJavaSource(code: string): string {
  const imports = new Set<string>();
  const bodyLines: string[] = [];

  code.split(/\r?\n/).forEach((line) => {
    if (/^\s*import\s+[\w.*]+;\s*$/.test(line)) {
      imports.add(line.trim());
    } else {
      bodyLines.push(line);
    }
  });

  return `${Array.from(imports).join("\n")}${imports.size ? "\n\n" : ""}${bodyLines.join("\n").trimStart()}`;
}

function finalizeExecutableCode(code: string, language: string): string {
  if (language === "java") {
    return normalizeJavaSource(code);
  }

  if (language === "c" && !hasMainFunction(code)) {
    return `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n${code}\n`;
  }

  return code;
}

function isInterpretedSyntaxError(stderr: string): boolean {
  return /\bSyntaxError\b|IndentationError|TabError|ParseError/i.test(stderr);
}

function prepareExecutableCode(code: string, language: string, questionTitle?: string): string {
  if (hasMainFunction(code)) return code;

  const title = (questionTitle || "").toLowerCase();
  const useSolution = code.includes("class Solution");

  if (language === "cpp") {
    const header = `#include <bits/stdc++.h>\nusing namespace std;\n\n`;
    const listNodeDef = `struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\n`;
    if (title.includes("stickers") || title.includes("spell word")) {
      return `${header}${code}\n\nint main() {\n  string stickersLine, target;\n  getline(cin, stickersLine);\n  getline(cin, target);\n  stringstream ss(stickersLine);\n  vector<string> stickers;\n  string sticker;\n  while (ss >> sticker) stickers.push_back(sticker);\n  ${useSolution ? "Solution solver;\n  cout << solver.minStickers(stickers, target);" : "cout << minStickers(stickers, target);"}\n  return 0;\n}\n`;
    }
    if (title.includes("n-queens") || title.includes("queens")) {
      return `${header}${code}\n\nint main() {\n  int n;\n  if (!(cin >> n)) return 0;\n  ${useSolution ? "Solution solver;\n  cout << solver.totalNQueens(n);" : "cout << totalNQueens(n);"}\n  return 0;\n}\n`;
    }
    if (title.includes("word ladder")) {
      return `${header}${code}\n\nint main() {\n  string beginWord, endWord;\n  if (!(cin >> beginWord >> endWord)) return 0;\n  vector<string> wordList;\n  string word;\n  while (cin >> word) wordList.push_back(word);\n  ${useSolution ? "Solution solver;\n  auto result = solver.findLadders(beginWord, endWord, wordList);" : "auto result = findLadders(beginWord, endWord, wordList);"}\n  for (size_t i = 0; i < result.size(); ++i) {\n    for (size_t j = 0; j < result[i].size(); ++j) {\n      if (j) cout << ' ';\n      cout << result[i][j];\n    }\n    if (i + 1 < result.size()) cout << '\\n';\n  }\n  return 0;\n}\n`;
    }
    if (title.includes("sliding window")) {
      return `${header}${parseCppVector}\n${code}\n\nint main() {\n  string numsLine;\n  getline(cin, numsLine);\n  if (numsLine.size() == 0 && !cin.eof()) getline(cin, numsLine);\n  int k;\n  cin >> k;\n  vector<int> nums = parseVector(numsLine);\n  ${useSolution ? "Solution solver;\n  auto result = solver.maxSlidingWindow(nums, k);" : "auto result = maxSlidingWindow(nums, k);"}\n  for (size_t i = 0; i < result.size(); ++i) {\n    if (i) cout << ' ';\n    cout << result[i];\n  }\n  return 0;\n}\n`;
    }
    if (title.includes("median of two")) {
      return `${header}${parseCppVector}\n${code}\n\nint main() {\n  string firstLine, secondLine;\n  getline(cin, firstLine);\n  getline(cin, secondLine);\n  vector<int> nums1 = parseVector(firstLine);\n  vector<int> nums2 = parseVector(secondLine);\n  ${useSolution ? "Solution solver;\n  cout << fixed << setprecision(1) << solver.findMedianSortedArrays(nums1, nums2);" : "cout << fixed << setprecision(1) << findMedianSortedArrays(nums1, nums2);"}\n  return 0;\n}\n`;
    }
    if (title.includes("regular expression") || title.includes("regex") || title.includes("wildcard")) {
      return `${header}${code}\n\nint main() {\n  string s, p;\n  getline(cin, s);\n  getline(cin, p);\n  ${useSolution ? "Solution solver;\n  cout << (solver.isMatch(s, p) ? \"true\" : \"false\");" : "cout << (isMatch(s, p) ? \"true\" : \"false\");"}\n  return 0;\n}\n`;
    }
    if (title.includes("trapping rain")) {
      return `${header}${parseCppVector}\n${code}\n\nint main() {\n  string heightLine;\n  getline(cin, heightLine);\n  vector<int> height = parseVector(heightLine);\n  ${useSolution ? "Solution solver;\n  cout << solver.trap(height);" : "cout << trap(height);"}\n  return 0;\n}\n`;
    }
    if (title.includes("edit distance")) {
      return `${header}${code}\n\nint main() {\n  string w1, w2;\n  if (cin >> w1 >> w2) {\n    ${useSolution ? "Solution solver;\n    cout << solver.minDistance(w1, w2);" : "cout << minDistance(w1, w2);"}\n  }\n  return 0;\n}\n`;
    }
    if (title.includes("largest rectangle")) {
      return `${header}${parseCppVector}\n${code}\n\nint main() {\n  string heightsLine;\n  getline(cin, heightsLine);\n  vector<int> heights = parseVector(heightsLine);\n  ${useSolution ? "Solution solver;\n  cout << solver.largestRectangleArea(heights);" : "cout << largestRectangleArea(heights);"}\n  return 0;\n}\n`;
    }
    if (title.includes("sudoku solver")) {
      return `${header}${code}\n\nint main() {\n  vector<vector<char>> board(9, vector<char>(9));\n  for (int i = 0; i < 9; ++i) {\n    for (int j = 0; j < 9; ++j) {\n      cin >> board[i][j];\n    }\n  }\n  ${useSolution ? "Solution solver;\n  solver.solveSudoku(board);" : "solveSudoku(board);"}\n  for (int i = 0; i < 9; ++i) {\n    for (int j = 0; j < 9; ++j) {\n      if (j) cout << ' ';\n      cout << board[i][j];\n    }\n    if (i < 8) cout << '\\n';\n  }\n  return 0;\n}\n`;
    }
    if (title.includes("longest valid parentheses")) {
      return `${header}${code}\n\nint main() {\n  string s;\n  if (getline(cin, s)) {\n    ${useSolution ? "Solution solver;\n    cout << solver.longestValidParentheses(s);" : "cout << longestValidParentheses(s);"}\n  }\n  return 0;\n}\n`;
    }
    if (title.includes("palindrome partitioning")) {
      return `${header}${code}\n\nint main() {\n  string s;\n  if (getline(cin, s)) {\n    ${useSolution ? "Solution solver;\n    cout << solver.minCut(s);" : "cout << minCut(s);"}\n  }\n  return 0;\n}\n`;
    }
    if (title.includes("maximal rectangle")) {
      return `${header}${code}\n\nint main() {\n  int r, c;\n  if (cin >> r >> c) {\n    vector<vector<char>> mat(r, vector<char>(c));\n    for (int i = 0; i < r; ++i)\n      for (int j = 0; j < c; ++j)\n        cin >> mat[i][j];\n    ${useSolution ? "Solution solver;\n    cout << solver.maximalRectangle(mat);" : "cout << maximalRectangle(mat);"}\n  }\n  return 0;\n}\n`;
    }
    if (title.includes("distinct subsequences")) {
      return `${header}${code}\n\nint main() {\n  string s, t;\n  getline(cin, s);\n  getline(cin, t);\n  ${useSolution ? "Solution solver;\n  cout << solver.numDistinct(s, t);" : "cout << numDistinct(s, t);"}\n  return 0;\n}\n`;
    }
    if (title.includes("first missing positive")) {
      return `${header}${parseCppVector}\n${code}\n\nint main() {\n  string line;\n  getline(cin, line);\n  vector<int> nums = parseVector(line);\n  ${useSolution ? "Solution solver;\n  cout << solver.firstMissingPositive(nums);" : "cout << firstMissingPositive(nums);"}\n  return 0;\n}\n`;
    }
    if (title.includes("minimum window substring")) {
      return `${header}${code}\n\nint main() {\n  string s, t;\n  getline(cin, s);\n  getline(cin, t);\n  ${useSolution ? "Solution solver;\n  cout << solver.minWindow(s, t);" : "cout << minWindow(s, t);"}\n  return 0;\n}\n`;
    }
    if (title.includes("shortest palindrome")) {
      return `${header}${code}\n\nint main() {\n  string s;\n  getline(cin, s);\n  ${useSolution ? "Solution solver;\n  cout << solver.shortestPalindrome(s);" : "cout << shortestPalindrome(s);"}\n  return 0;\n}\n`;
    }
    if (title.includes("word break ii")) {
      return `${header}${code}\n\nint main() {\n  string s, dictLine;\n  getline(cin, s);\n  getline(cin, dictLine);\n  stringstream ss(dictLine);\n  vector<string> wordDict;\n  string w;\n  while (ss >> w) wordDict.push_back(w);\n  ${useSolution ? "Solution solver;\n  auto result = solver.wordBreak(s, wordDict);" : "auto result = wordBreak(s, wordDict);"}\n  sort(result.begin(), result.end());\n  for (size_t i = 0; i < result.size(); ++i) {\n    cout << result[i] << (i + 1 < result.size() ? "\\n" : \"\");\n  }\n  return 0;\n}\n`;
    }
    if (title.includes("kth smallest element")) {
      return `${header}${code}\n\nint main() {\n  int n;\n  if (cin >> n) {\n    vector<vector<int>> matrix(n, vector<int>(n));\n    for (int i = 0; i < n; ++i)\n      for (int j = 0; j < n; ++j)\n        cin >> matrix[i][j];\n    int k;\n    cin >> k;\n    ${useSolution ? "Solution solver;\n    cout << solver.kthSmallest(matrix, k);" : "cout << kthSmallest(matrix, k);"}\n  }\n  return 0;\n}\n`;
    }
    if (title.includes("split array largest sum")) {
      return `${header}${parseCppVector}\n${code}\n\nint main() {\n  string line;\n  getline(cin, line);\n  vector<int> nums = parseVector(line);\n  int k;\n  cin >> k;\n  ${useSolution ? "Solution solver;\n  cout << solver.splitArray(nums, k);" : "cout << splitArray(nums, k);"}\n  return 0;\n}\n`;
    }
    if (title.includes("merge k sorted lists")) {
      return `${header}${listNodeDef}${code}\n\nint main() {\n  string line;\n  vector<ListNode*> lists;\n  while (getline(cin, line)) {\n    if (line.empty()) continue;\n    stringstream ss(line);\n    int val;\n    ListNode* dummy = new ListNode(0);\n    ListNode* curr = dummy;\n    while (ss >> val) {\n      curr->next = new ListNode(val);\n      curr = curr->next;\n    }\n    lists.push_back(dummy->next);\n  }\n  Solution solver;\n  ListNode* res = solver.mergeKLists(lists);\n  bool first = true;\n  while (res) {\n    if (!first) cout << " ";\n    cout << res->val;\n    first = false;\n    res = res->next;\n  }\n  return 0;\n}\n`;
    }
    return code;
  }

  if (language === "java") {
    const cleanedCode = code.replace(/public\s+class\s+Solution/g, "class Solution");
    const listNodeDef = `class ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n\n`;
    if (title.includes("stickers") || title.includes("spell word")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (!sc.hasNextLine()) return;\n    String[] stickers = sc.nextLine().trim().split("\\s+");\n    String target = sc.hasNextLine() ? sc.nextLine().trim() : "";\n    Solution solver = new Solution();\n    System.out.print(solver.minStickers(stickers, target));\n  }\n}\n`;
    }
    if (title.includes("n-queens") || title.includes("queens")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n      int n = sc.nextInt();\n      Solution solver = new Solution();\n      System.out.print(solver.totalNQueens(n));\n    }\n  }\n}\n`;
    }
    if (title.includes("word ladder")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (!sc.hasNext()) return;\n    String beginWord = sc.next();\n    if (!sc.hasNext()) return;\n    String endWord = sc.next();\n    List<String> wordList = new ArrayList<>();\n    while (sc.hasNext()) {\n      wordList.add(sc.next());\n    }\n    Solution solver = new Solution();\n    List<List<String>> result = solver.findLadders(beginWord, endWord, wordList);\n    for (int i = 0; i < result.size(); i++) {\n      List<String> path = result.get(i);\n      for (int j = 0; j < path.size(); j++) {\n        if (j > 0) System.out.print(" ");\n        System.out.print(path.get(j));\n      }\n      if (i < result.size() - 1) System.out.println();\n    }\n  }\n}\n`;
    }
    if (title.includes("sliding window")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (!sc.hasNextLine()) return;\n    String line = sc.nextLine();\n    if (line.trim().isEmpty() && sc.hasNextLine()) line = sc.nextLine();\n    String[] parts = line.trim().split("\\\s+");\n    int[] nums = (parts.length == 1 && parts[0].isEmpty()) ? new int[0] : new int[parts.length];\n    for (int i = 0; i < nums.length; i++) nums[i] = Integer.parseInt(parts[i]);\n    int k = sc.hasNextInt() ? sc.nextInt() : 0;\n    Solution solver = new Solution();\n    int[] result = solver.maxSlidingWindow(nums, k);\n    for (int i = 0; i < result.length; i++) {\n      if (i > 0) System.out.print(" ");\n      System.out.print(result[i]);\n    }\n  }\n}\n`;
    }
    if (title.includes("median of two")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (!sc.hasNextLine()) return;\n    String l1 = sc.nextLine();\n    if (!sc.hasNextLine()) return;\n    String l2 = sc.nextLine();\n    String[] p1 = l1.trim().split("\\\s+");\n    String[] p2 = l2.trim().split("\\\s+");\n    int[] nums1 = (p1.length == 1 && p1[0].isEmpty()) ? new int[0] : new int[p1.length];\n    for (int i = 0; i < nums1.length; i++) nums1[i] = Integer.parseInt(p1[i]);\n    int[] nums2 = (p2.length == 1 && p2[0].isEmpty()) ? new int[0] : new int[p2.length];\n    for (int i = 0; i < nums2.length; i++) nums2[i] = Integer.parseInt(p2[i]);\n    Solution solver = new Solution();\n    System.out.print(String.format(Locale.US, "%.1f", solver.findMedianSortedArrays(nums1, nums2)));\n  }\n}\n`;
    }
    if (title.includes("regular expression") || title.includes("regex") || title.includes("wildcard")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (!sc.hasNextLine()) return;\n    String s = sc.nextLine();\n    if (!sc.hasNextLine()) return;\n    String p = sc.nextLine();\n    Solution solver = new Solution();\n    System.out.print(solver.isMatch(s, p) ? "true" : "false");\n  }\n}\n`;
    }
    if (title.includes("trapping rain")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (!sc.hasNextLine()) return;\n    String line = sc.nextLine();\n    String[] parts = line.trim().split("\\\s+");\n    int[] height = (parts.length == 1 && parts[0].isEmpty()) ? new int[0] : new int[parts.length];\n    for (int i = 0; i < height.length; i++) height[i] = Integer.parseInt(parts[i]);\n    Solution solver = new Solution();\n    System.out.print(solver.trap(height));\n  }\n}\n`;
    }
    if (title.includes("edit distance")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNext()) {\n      String w1 = sc.next();\n      String w2 = sc.next();\n      Solution solver = new Solution();\n      System.out.print(solver.minDistance(w1, w2));\n    }\n  }\n}\n`;
    }
    if (title.includes("largest rectangle")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (!sc.hasNextLine()) return;\n    String line = sc.nextLine();\n    String[] parts = line.trim().split("\\\s+");\n    int[] heights = (parts.length == 1 && parts[0].isEmpty()) ? new int[0] : new int[parts.length];\n    for (int i = 0; i < heights.length; i++) heights[i] = Integer.parseInt(parts[i]);\n    Solution solver = new Solution();\n    System.out.print(solver.largestRectangleArea(heights));\n  }\n}\n`;
    }
    if (title.includes("sudoku solver")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    char[][] board = new char[9][9];\n    for (int i = 0; i < 9; i++) {\n      for (int j = 0; j < 9; j++) {\n        board[i][j] = sc.next().charAt(0);\n      }\n    }\n    Solution solver = new Solution();\n    solver.solveSudoku(board);\n    for (int i = 0; i < 9; i++) {\n      for (int j = 0; j < 9; j++) {\n        if (j > 0) System.out.print(" ");\n        System.out.print(board[i][j]);\n      }\n      if (i < 8) System.out.println();\n    }\n  }\n}\n`;
    }
    if (title.includes("longest valid parentheses")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String s = sc.hasNext() ? sc.next() : "";\n    Solution solver = new Solution();\n    System.out.print(solver.longestValidParentheses(s));\n  }\n}\n`;
    }
    if (title.includes("palindrome partitioning")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String s = sc.hasNext() ? sc.next() : "";\n    Solution solver = new Solution();\n    System.out.print(solver.minCut(s));\n  }\n}\n`;
    }
    if (title.includes("maximal rectangle")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n      int r = sc.nextInt();\n      int c = sc.nextInt();\n      char[][] mat = new char[r][c];\n      for (int i = 0; i < r; i++) {\n        for (int j = 0; j < c; j++) {\n          mat[i][j] = sc.next().charAt(0);\n        }\n      }\n      Solution solver = new Solution();\n      System.out.print(solver.maximalRectangle(mat));\n    }\n  }\n}\n`;
    }
    if (title.includes("distinct subsequences")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextLine()) {\n      String s = sc.nextLine();\n      String t = sc.hasNextLine() ? sc.nextLine() : "";\n      Solution solver = new Solution();\n      System.out.print(solver.numDistinct(s, t));\n    }\n  }\n}\n`;
    }
    if (title.includes("first missing positive")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextLine()) {\n      String line = sc.nextLine();\n      String[] parts = line.trim().split("\\s+");\n      int[] nums = (parts.length == 1 && parts[0].isEmpty()) ? new int[0] : new int[parts.length];\n      for (int i = 0; i < nums.length; i++) nums[i] = Integer.parseInt(parts[i]);\n      Solution solver = new Solution();\n      System.out.print(solver.firstMissingPositive(nums));\n    }\n  }\n}\n`;
    }
    if (title.includes("minimum window substring")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextLine()) {\n      String s = sc.nextLine();\n      String t = sc.hasNextLine() ? sc.nextLine() : "";\n      Solution solver = new Solution();\n      System.out.print(solver.minWindow(s, t));\n    }\n  }\n}\n`;
    }
    if (title.includes("shortest palindrome")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String s = sc.hasNextLine() ? sc.nextLine() : "";\n    Solution solver = new Solution();\n    System.out.print(solver.shortestPalindrome(s));\n  }\n}\n`;
    }
    if (title.includes("word break ii")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextLine()) {\n      String s = sc.nextLine().trim();\n      List<String> wordDict = new ArrayList<>();\n      if (sc.hasNextLine()) {\n        String[] parts = sc.nextLine().trim().split("\\s+");\n        for (String p : parts) if (!p.isEmpty()) wordDict.add(p);\n      }\n      Solution solver = new Solution();\n      List<String> res = solver.wordBreak(s, wordDict);\n      Collections.sort(res);\n      for (int i = 0; i < res.size(); i++) {\n        System.out.print(res.get(i) + (i + 1 < res.size() ? "\\n" : ""));\n      }\n    }\n  }\n}\n`;
    }
    if (title.includes("kth smallest element")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n      int n = sc.nextInt();\n      int[][] matrix = new int[n][n];\n      for (int i = 0; i < n; i++)\n        for (int j = 0; j < n; j++)\n          matrix[i][j] = sc.nextInt();\n      int k = sc.nextInt();\n      Solution solver = new Solution();\n      System.out.print(solver.kthSmallest(matrix, k));\n    }\n  }\n}\n`;
    }
    if (title.includes("split array largest sum")) {
      return `${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextLine()) {\n      String line = sc.nextLine();\n      String[] parts = line.trim().split("\\s+");\n      int[] nums = (parts.length == 1 && parts[0].isEmpty()) ? new int[0] : new int[parts.length];\n      for (int i = 0; i < nums.length; i++) nums[i] = Integer.parseInt(parts[i]);\n      int k = sc.hasNextInt() ? sc.nextInt() : 0;\n      Solution solver = new Solution();\n      System.out.print(solver.splitArray(nums, k));\n    }\n  }\n}\n`;
    }
    if (title.includes("merge k sorted lists")) {
      return `${listNodeDef}${cleanedCode}\n\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    List<ListNode> lists = new ArrayList<>();\n    while (sc.hasNextLine()) {\n      String line = sc.nextLine().trim();\n      if (line.isEmpty()) continue;\n      String[] parts = line.split("\\s+");\n      ListNode dummy = new ListNode(0);\n      ListNode curr = dummy;\n      for (String part : parts) {\n        curr.next = new ListNode(Integer.parseInt(part));\n        curr = curr.next;\n      }\n      lists.add(dummy.next);\n    }\n    Solution solver = new Solution();\n    ListNode res = solver.mergeKLists(lists.toArray(new ListNode[0]));\n    boolean first = true;\n    while (res != null) {\n      if (!first) System.out.print(" ");\n      System.out.print(res.val);\n      first = false;\n      res = res.next;\n    }\n  }\n}\n`;
    }
    return code;
  }

  if (language === "python") {
    const helperImports = `from typing import List, Optional, Dict, Tuple\n\n`;
    const listNodeDef = `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n`;
    if (title.includes("stickers") || title.includes("spell word")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        stickers = lines[0].split()\n        target = lines[1].strip()\n        solver = Solution()\n        print(solver.minStickers(stickers, target), end="")\n`;
    }
    if (title.includes("n-queens") || title.includes("queens")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().split()\n    if lines:\n        n = int(lines[0])\n        solver = Solution()\n        print(solver.totalNQueens(n), end="")\n`;
    }
    if (title.includes("word ladder")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    words = sys.stdin.read().split()\n    if len(words) >= 2:\n        solver = Solution()\n        result = solver.findLadders(words[0], words[1], words[2:])\n        print("\\n".join(" ".join(path) for path in result), end="")\n`;
    }
    if (title.includes("sliding window")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        nums = list(map(int, lines[0].split()))\n        k = int(lines[1])\n        solver = Solution()\n        print(" ".join(map(str, solver.maxSlidingWindow(nums, k))), end="")\n`;
    }
    if (title.includes("median of two")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        nums1 = list(map(int, lines[0].split()))\n        nums2 = list(map(int, lines[1].split()))\n        solver = Solution()\n        print(f"{solver.findMedianSortedArrays(nums1, nums2):.1f}", end="")\n`;
    }
    if (title.includes("regular expression") || title.includes("regex") || title.includes("wildcard")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        solver = Solution()\n        print("true" if solver.isMatch(lines[0], lines[1]) else "false", end="")\n`;
    }
    if (title.includes("trapping rain")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        height = list(map(int, lines[0].split()))\n        solver = Solution()\n        print(solver.trap(height), end="")\n`;
    }
    if (title.includes("edit distance")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    words = sys.stdin.read().split()\n    if len(words) >= 2:\n        solver = Solution()\n        print(solver.minDistance(words[0], words[1]), end="")\n`;
    }
    if (title.includes("largest rectangle")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        heights = list(map(int, lines[0].split()))\n        solver = Solution()\n        print(solver.largestRectangleArea(heights), end="")\n`;
    }
    if (title.includes("sudoku solver")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().split()\n    if len(lines) >= 81:\n        board = [lines[i:i+9] for i in range(0, 81, 9)]\n        solver = Solution()\n        solver.solveSudoku(board)\n        print("\\n".join(" ".join(row) for row in board), end="")\n`;
    }
    if (title.includes("longest valid parentheses")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    s = sys.stdin.read().strip()\n    solver = Solution()\n    print(solver.longestValidParentheses(s), end="")\n`;
    }
    if (title.includes("palindrome partitioning")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    s = sys.stdin.read().strip()\n    solver = Solution()\n    print(solver.minCut(s), end="")\n`;
    }
    if (title.includes("maximal rectangle")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().split()\n    if lines:\n        r, c = int(lines[0]), int(lines[1])\n        idx = 2\n        matrix = []\n        for i in range(r):\n            matrix.append(lines[idx:idx+c])\n            idx += c\n        solver = Solution()\n        print(solver.maximalRectangle(matrix), end="")\n`;
    }
    if (title.includes("distinct subsequences")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        solver = Solution()\n        print(solver.numDistinct(lines[0], lines[1]), end="")\n`;
    }
    if (title.includes("first missing positive")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    nums = list(map(int, line.split())) if line else []\n    solver = Solution()\n    print(solver.firstMissingPositive(nums), end="")\n`;
    }
    if (title.includes("minimum window substring")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        solver = Solution()\n        print(solver.minWindow(lines[0], lines[1]), end="")\n`;
    }
    if (title.includes("shortest palindrome")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    s = sys.stdin.read().strip()\n    solver = Solution()\n    print(solver.shortestPalindrome(s), end="")\n`;
    }
    if (title.includes("word break ii")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 1:\n        s = lines[0].strip()\n        wordDict = lines[1].split() if len(lines) >= 2 else []\n        solver = Solution()\n        res = solver.wordBreak(s, wordDict)\n        res.sort()\n        print("\\n".join(res), end="")\n`;
    }
    if (title.includes("kth smallest element")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    words = sys.stdin.read().split()\n    if words:\n        n = int(words[0])\n        matrix = []\n        idx = 1\n        for i in range(n):\n            matrix.append([int(x) for x in words[idx:idx+n]])\n            idx += n\n        k = int(words[idx])\n        solver = Solution()\n        print(solver.kthSmallest(matrix, k), end="")\n`;
    }
    if (title.includes("split array largest sum")) {
      return `${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        nums = list(map(int, lines[0].split()))\n        k = int(lines[1])\n        solver = Solution()\n        print(solver.splitArray(nums, k), end="")\n`;
    }
    if (title.includes("merge k sorted lists")) {
      return `${listNodeDef}${helperImports}${code}\n\nimport sys\nif __name__ == '__main__':\n    lines = sys.stdin.read().strip().split('\\n')\n    lists = []\n    for line in lines:\n        if not line.strip(): continue\n        parts = list(map(int, line.split()))\n        dummy = ListNode(0)\n        curr = dummy\n        for val in parts:\n            curr.next = ListNode(val)\n            curr = curr.next\n        lists.append(dummy.next)\n    solver = Solution()\n    res = solver.mergeKLists(lists)\n    out = []\n    while res:\n        out.append(str(res.val))\n        res = res.next\n    print(" ".join(out), end="")\n`;
    }
    return code;
  }

  if (language === "javascript") {
    const listNodeDef = `function ListNode(val, next) {\n    this.val = (val===undefined ? 0 : val)\n    this.next = (next===undefined ? null : next)\n}\n\n`;
    if (title.includes("stickers") || title.includes("spell word")) {
      return `${code}\n\nconst fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf-8').split(/\\r?\\n/);\nif (lines.length >= 2) {\n    const stickers = lines[0].trim().split(/\\s+/).filter(Boolean);\n    const target = lines[1].trim();\n    const solver = typeof minStickers === 'function' ? minStickers : (s, t) => new Solution().minStickers(s, t);\n    console.log(solver(stickers, target));\n}\n`;
    }
    if (title.includes("n-queens") || title.includes("queens")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const n = parseInt(input, 10);\n    const solver = typeof totalNQueens === 'function' ? totalNQueens : (nVal) => new Solution().totalNQueens(nVal);\n    console.log(solver(n));\n}\n`;
    }
    if (title.includes("word ladder")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const words = input.split(/\\\s+/);\n    if (words.length >= 2) {\n        const solver = typeof findLadders === 'function' ? findLadders : (b, e, w) => new Solution().findLadders(b, e, w);\n        const result = solver(words[0], words[1], words.slice(2));\n        if (result && Array.isArray(result)) {\n            console.log(result.map(path => path.join(" ")).join("\\n"));\n        }\n    }\n}\n`;
    }
    if (title.includes("sliding window")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const nums = input[0].trim().split(/\\\s+/).map(Number);\n    const k = parseInt(input[1], 10);\n    const solver = typeof maxSlidingWindow === 'function' ? maxSlidingWindow : (ns, kVal) => new Solution().maxSlidingWindow(ns, kVal);\n    const result = solver(nums, k);\n    if (result && Array.isArray(result)) console.log(result.join(" "));\n}\n`;
    }
    if (title.includes("median of two")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const nums1 = input[0].trim().split(/\\\s+/).map(Number);\n    const nums2 = input[1].trim().split(/\\\s+/).map(Number);\n    const solver = typeof findMedianSortedArrays === 'function' ? findMedianSortedArrays : (n1, n2) => new Solution().findMedianSortedArrays(n1, n2);\n    console.log(solver(nums1, nums2).toFixed(1));\n}\n`;
    }
    if (title.includes("regular expression") || title.includes("regex")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const solver = typeof isMatch === 'function' ? isMatch : (sVal, pVal) => new Solution().isMatch(sVal, pVal);\n    console.log(solver(input[0].trim(), input[1].trim()) ? "true" : "false");\n}\n`;
    }
    if (title.includes("trapping rain")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length > 0) {\n    const height = input[0].trim().split(/\\\s+/).map(Number);\n    const solver = typeof trap === 'function' ? trap : (h) => new Solution().trap(h);\n    console.log(solver(height));\n}\n`;
    }
    if (title.includes("edit distance")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\\s+/);\nif (input.length >= 2) {\n    const solver = typeof minDistance === 'function' ? minDistance : (w1, w2) => new Solution().minDistance(w1, w2);\n    console.log(solver(input[0], input[1]));\n}\n`;
    }
    if (title.includes("largest rectangle")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length > 0) {\n    const heights = input[0].trim().split(/\\\s+/).map(Number);\n    const solver = typeof largestRectangleArea === 'function' ? largestRectangleArea : (hs) => new Solution().largestRectangleArea(hs);\n    console.log(solver(heights));\n}\n`;
    }
    if (title.includes("sudoku solver")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\\s+/);\nif (input.length >= 81) {\n    const board = [];\n    for (let i = 0; i < 9; i++) {\n        board.push(input.slice(i*9, i*9+9).map(x => x[0]));\n    }\n    const solver = typeof solveSudoku === 'function' ? solveSudoku : (b) => new Solution().solveSudoku(b);\n    solver(board);\n    console.log(board.map(row => row.join(" ")).join("\\n"));\n}\n`;
    }
    if (title.includes("longest valid parentheses")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst solver = typeof longestValidParentheses === 'function' ? longestValidParentheses : (s) => new Solution().longestValidParentheses(s);\nconsole.log(solver(input));\n`;
    }
    if (title.includes("palindrome partitioning")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst solver = typeof minCut === 'function' ? minCut : (s) => new Solution().minCut(s);\nconsole.log(solver(input));\n`;
    }
    if (title.includes("maximal rectangle")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\\s+/);\nif (input.length >= 2) {\n    const r = parseInt(input[0], 10);\n    const c = parseInt(input[1], 10);\n    const matrix = [];\n    let idx = 2;\n    for (let i = 0; i < r; i++) {\n        matrix.push(input.slice(idx, idx+c).map(x => x[0]));\n        idx += c;\n    }\n    const solver = typeof maximalRectangle === 'function' ? maximalRectangle : (m) => new Solution().maximalRectangle(m);\n    console.log(solver(matrix));\n}\n`;
    }
    if (title.includes("distinct subsequences")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const solver = typeof numDistinct === 'function' ? numDistinct : (s, t) => new Solution().numDistinct(s, t);\n    console.log(solver(input[0].trim(), input[1].trim()));\n}\n`;
    }
    if (title.includes("first missing positive")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst nums = input ? input.split(/\\\s+/).map(Number) : [];\nconst solver = typeof firstMissingPositive === 'function' ? firstMissingPositive : (n) => new Solution().firstMissingPositive(n);\nconsole.log(solver(nums));\n`;
    }
    if (title.includes("minimum window substring")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const solver = typeof minWindow === 'function' ? minWindow : (s, t) => new Solution().minWindow(s, t);\n    console.log(solver(input[0].trim(), input[1].trim()));\n}\n`;
    }
    if (title.includes("wildcard matching")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const solver = typeof isMatch === 'function' ? isMatch : (s, p) => new Solution().isMatch(s, p);\n    console.log(solver(input[0].trim(), input[1].trim()) ? "true" : "false");\n}\n`;
    }
    if (title.includes("shortest palindrome")) {
      return `${code}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst solver = typeof shortestPalindrome === 'function' ? shortestPalindrome : (s) => new Solution().shortestPalindrome(s);\nconsole.log(solver(input));\n`;
    }
    if (title.includes("word break ii")) {
      return `${code}\n\nconst fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (lines.length >= 1) {\n    const s = lines[0].trim();\n    const wordDict = lines[1] ? lines[1].trim().split(/\\\s+/) : [];\n    const solver = typeof wordBreak === 'function' ? wordBreak : (str, dict) => new Solution().wordBreak(str, dict);\n    const res = solver(s, wordDict) || [];\n    res.sort();\n    console.log(res.join("\\n"));\n}\n`;
    }
    if (title.includes("kth smallest element")) {
      return `${code}\n\nconst fs = require('fs');\nconst words = fs.readFileSync(0, 'utf-8').trim().split(/\\\s+/).map(Number);\nif (words.length >= 2) {\n    const n = words[0];\n    const matrix = [];\n    let idx = 1;\n    for (let i = 0; i < n; i++) {\n        matrix.push(words.slice(idx, idx+n));\n        idx += n;\n    }\n    const k = words[idx];\n    const solver = typeof kthSmallest === 'function' ? kthSmallest : (m, kVal) => new Solution().kthSmallest(m, kVal);\n    console.log(solver(matrix, k));\n}\n`;
    }
    if (title.includes("split array largest sum")) {
      return `${code}\n\nconst fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (lines.length >= 2) {\n    const nums = lines[0].trim().split(/\\\s+/).map(Number);\n    const k = parseInt(lines[1], 10);\n    const solver = typeof splitArray === 'function' ? splitArray : (ns, kVal) => new Solution().splitArray(ns, kVal);\n    console.log(solver(nums, k));\n}\n`;
    }
    if (title.includes("merge k sorted lists")) {
      return `${listNodeDef}${code}\n\nconst fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst lists = [];\nfor (let line of lines) {\n    if (!line.trim()) continue;\n    const parts = line.trim().split(/\\\s+/).map(Number);\n    let dummy = new ListNode(0);\n    let curr = dummy;\n    for (let val of parts) {\n        curr.next = new ListNode(val);\n        curr = curr.next;\n    }\n    lists.push(dummy.next);\n}\nconst solver = typeof mergeKLists === 'function' ? mergeKLists : (l) => new Solution().mergeKLists(l);\nlet res = solver(lists);\nconst out = [];\nwhile (res) {\n    out.push(res.val);\n    res = res.next;\n}\nconsole.log(out.join(" "));\n`;
    }
    return code;
  }

  if (language === "csharp") {
    if (title.includes("stickers") || title.includes("spell word")) {
      return `using System;\nusing System.Linq;\n\n${code}\n\npublic class Program {\n  public static void Main(string[] args) {\n    string stickersLine = Console.ReadLine() ?? "";\n    string target = Console.ReadLine() ?? "";\n    string[] stickers = stickersLine.Split(new[] { ' ', '\\t' }, StringSplitOptions.RemoveEmptyEntries);\n    var solver = new Solution();\n    Console.Write(solver.MinStickers(stickers, target));\n  }\n}\n`;
    }
    return code;
  }

  return code;
}

async function runLocalCode(code: string, language: string, stdin: string, timeout: number) {
  const started = Date.now();
  const runWithStdin = (command: string, args: string[]) => new Promise<{
    stdout: string;
    stderr: string;
    code: number | null;
    signal: NodeJS.Signals | null;
    time: number;
    spawnErrorCode?: string;
  }>((resolve) => {
    const child = spawn(command, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeoutId = setTimeout(() => {
      settled = true;
      if (process.platform === "win32" && child.pid) {
        execFile("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true }, () => {
          child.kill();
        });
      } else {
        child.kill("SIGKILL");
      }
    }, timeout);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 1024 * 1024) child.kill("SIGKILL");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 1024 * 1024) child.kill("SIGKILL");
    });
    child.on("error", (error) => {
      clearTimeout(timeoutId);
      resolve({ stdout, stderr: error.message, code: 1, signal: null, time: Date.now() - started, spawnErrorCode: (error as any).code });
    });
    child.on("close", (code, signal) => {
      clearTimeout(timeoutId);
      resolve({ stdout, stderr, code, signal: settled ? "SIGKILL" : signal, time: Date.now() - started });
    });
    // Ensure stdin is written reliably into the child process stream
    try {
      if (typeof stdin === 'string' && stdin.length > 0) {
        // Some programs on windows expect \r\n
        const normalizedStdin = process.platform === "win32" ? stdin.replace(/\r?\n/g, "\r\n") : stdin;
        child.stdin.write(normalizedStdin, 'utf8');
      }
      child.stdin.end();
    } catch (e) {
      // ignore write errors; we'll still attempt to end the stream
    }
  }).then(res => res.spawnErrorCode === "ENOENT" ? null : res);

  try {
    if (language === "javascript") {
      return await runWithStdin("node", ["-e", code]);
    }

    if (language === "python") {
      return await runWithStdin("python", ["-c", code]);
    }

    if (language === "java") {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "geonixa-java-"));
      try {
        const sourcePath = path.join(tempDir, "Main.java");
        await fs.writeFile(sourcePath, code, "utf8");
        try {
          await execFileAsync("javac", [sourcePath], { timeout, maxBuffer: 1024 * 1024, windowsHide: true });
        } catch (compileError: any) {
          if (compileError.code === "ENOENT") return null;
          return {
            stdout: "",
            stderr: (compileError.stderr || compileError.stdout || compileError.message || "Compilation failed").trim(),
            code: 1,
            signal: null,
            time: 0,
            isCompilationError: true
          } as any;
        }
        return await runWithStdin("java", ["-cp", tempDir, "Main"]);
      } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
      }
    }

    if (language === "cpp") {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "geonixa-cpp-"));
      try {
        const sourcePath = path.join(tempDir, "solution.cpp");
        const exePath = path.join(tempDir, "solution.exe");
        await fs.writeFile(sourcePath, code, "utf8");
        try {
          await execFileAsync("g++", ["-O3", "-std=c++17", sourcePath, "-o", exePath], { timeout, maxBuffer: 1024 * 1024, windowsHide: true });
        } catch (compileError: any) {
          if (compileError.code === "ENOENT") return null;
          return {
            stdout: "",
            stderr: (compileError.stderr || compileError.stdout || compileError.message || "Compilation failed").trim(),
            code: 1,
            signal: null,
            time: 0,
            isCompilationError: true
          } as any;
        }
        return await runWithStdin(exePath, []);
      } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
      }
    }

    if (language === "c") {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "geonixa-c-"));
      try {
        const sourcePath = path.join(tempDir, "solution.c");
        const exePath = path.join(tempDir, "solution.exe");
        await fs.writeFile(sourcePath, code, "utf8");
        try {
          await execFileAsync("gcc", ["-O2", sourcePath, "-o", exePath], { timeout, maxBuffer: 1024 * 1024, windowsHide: true });
        } catch (compileError: any) {
          if (compileError.code === "ENOENT") return null;
          return {
            stdout: "",
            stderr: (compileError.stderr || compileError.stdout || compileError.message || "Compilation failed").trim(),
            code: 1,
            signal: null,
            time: 0,
            isCompilationError: true
          } as any;
        }
        return await runWithStdin(exePath, []);
      } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
      }
    }

    if (language === "csharp") {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "geonixa-csharp-"));
      try {
        const sourcePath = path.join(tempDir, "Program.cs");
        const exePath = path.join(tempDir, "Program.exe");
        await fs.writeFile(sourcePath, code, "utf8");
        try {
          try {
            await execFileAsync("csc", ["/out:" + exePath, sourcePath], { timeout, maxBuffer: 1024 * 1024, windowsHide: true });
          } catch (e: any) {
            await execFileAsync("dotnet", ["new", "console", "-o", tempDir, "--force"], { timeout, windowsHide: true });
            await fs.writeFile(path.join(tempDir, "Program.cs"), code, "utf8");
            await execFileAsync("dotnet", ["build", "-c", "Release", "-o", path.join(tempDir, "bin")], { timeout, windowsHide: true });
          }
        } catch (compileError: any) {
          if (compileError.code === "ENOENT") return null;
          return {
            stdout: "",
            stderr: (compileError.stderr || compileError.stdout || compileError.message || "Compilation failed").trim(),
            code: 1,
            signal: null,
            time: 0,
            isCompilationError: true
          } as any;
        }

        if (existsSync(exePath)) {
          return await runWithStdin(exePath, []);
        } else {
          return await runWithStdin("dotnet", [path.join(tempDir, "bin", "Program.dll")]);
        }
      } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
      }
    }

    return null;
  } catch (error: any) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || error.message || "Local execution failed",
      code: error.killed || error.signal === "SIGTERM" ? null : (error.code || 1),
      signal: error.killed ? "SIGKILL" : error.signal,
      time: Date.now() - started,
    };
  }
}

/**
 * Enterprise Execution Handler v2.0
 *
 * Enhanced with:
 * - Testcase categorization
 * - Hardcode detection
 * - Complexity analysis
 * - Professional result metrics
 * - Supports single-run (visible) and batch-run (all tests)
 */
export async function POST(req: Request) {
  try {
    const { code, language, questionTitle, testCases, mode } = await req.json();

    if (!code || !language || !Array.isArray(testCases)) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const pistonLang = LANG_MAP[language] || language;
    const executableCode = finalizeExecutableCode(prepareExecutableCode(code, language, questionTitle), language);
    const results: JudgeResult[] = [];
    const randomizedResults: JudgeResult[] = [];

    let realTests: TestCase[] = testCases;

    // Retrieve server-side truth for test cases to prevent client leakage & cheating
    if (questionTitle) {
      const serverTests = getRealTestCases(questionTitle);
      if (serverTests && serverTests.length > 0) {
        if (mode === "SUBMIT") {
          realTests = serverTests;
        } else {
          // If mode is RUN, prefer visible/sample testcases. If there are fewer
          // than 10 visible tests, include hidden tests (in order) until we
          // reach at least 10 tests so clients can run a meaningful suite.
          const visible = serverTests.filter(t => !t.isHidden);
          if (visible.length >= 10) {
            realTests = visible;
          } else {
            const hidden = serverTests.filter(t => t.isHidden);
            realTests = [...visible, ...hidden].slice(0, Math.max(10, visible.length));
          }
        }
      }
    }

    for (const test of realTests) {
      const category = test.category || JudgeEngine.categorizeTestCase(test, realTests);
      let testResult: JudgeResult = {
        id: test.id,
        status: "INTERNAL_ERROR",
        category,
        input: test.isHidden ? "[HIDDEN]" : test.input,
        expected: test.isHidden ? "[HIDDEN]" : test.expectedOutput,
        actual: "",
        passed: false,
        time: 0,
        memory: 0,
        isHidden: !!test.isHidden,
        complexity: {
          analyzed: false,
          suspected: "UNKNOWN"
        }
      };

      let mirrorAttempt = 0;
      let executedSuccessfully = false;
      let remoteMirrorsAvailable = true;
      const timeLimit = test.timeLimit || 5000;

      const applyLocalResult = (localRun: any) => {
        const stdout = (localRun.stdout || "").trim();
        const stderr = (localRun.stderr || "").trim();

        if (localRun.isCompilationError) {
          testResult = {
            ...testResult,
            status: "COMPILATION_ERROR",
            actual: "",
            expected: test.isHidden ? "[HIDDEN]" : test.expectedOutput,
            passed: false,
            stderr: stderr || "Compilation failed",
            time: 0,
            memory: 0
          };
        } else {
          const isOutputCorrect = JudgeEngine.compare(stdout, test.expectedOutput);
          const isCorrect = isOutputCorrect && localRun.code === 0;

          testResult = {
            ...testResult,
            status: localRun.signal === "SIGKILL"
              ? "TIME_LIMIT_EXCEEDED"
              : (isCorrect ? "ACCEPTED" : (localRun.code !== 0 ? (isInterpretedSyntaxError(stderr) ? "COMPILATION_ERROR" : "RUNTIME_ERROR") : "WRONG_ANSWER")),
            actual: test.isHidden ? "[HIDDEN]" : stdout,
            expected: test.isHidden ? "[HIDDEN]" : test.expectedOutput,
            passed: isCorrect,
            time: localRun.time || 0,
            memory: 0,
            stderr: test.isHidden ? (stderr ? "Execution completed with errors." : "") : stderr,
          };
        }

        executedSuccessfully = true;
      };

      const tryLocalExecution = async () => {
        const localRun = await runLocalCode(executableCode, language, test.input, timeLimit);
        if (!localRun) return false;
        applyLocalResult(localRun);
        return true;
      };

      if (USE_LOCAL_FIRST) {
        await tryLocalExecution();
      }

      if (!executedSuccessfully && remoteMirrorsAvailable) {
        try {
          const data = await executeRemoteTest(pistonLang, executableCode, test, Math.max(REMOTE_MIRROR_TIMEOUT_MS, timeLimit + 5000));
          const run = data.run || {};
          const compile = data.compile || { code: 0 };

          if (compile.code !== 0 && compile.code !== undefined) {
            testResult = {
              ...testResult,
              status: "COMPILATION_ERROR",
              actual: "",
              expected: test.isHidden ? "[HIDDEN]" : test.expectedOutput,
              passed: false,
              stderr: (compile.stderr || compile.output || "Compilation failed").trim(),
              time: 0,
              memory: 0
            };
            executedSuccessfully = true;
            break;
          }

          const stdout = (run.stdout || "").trim();
          const stderr = (run.stderr || "").trim();
          const isOutputCorrect = JudgeEngine.compare(stdout, test.expectedOutput);
          const isCorrect = isOutputCorrect && run.code === 0;

          testResult = {
            ...testResult,
            status: isCorrect ? "ACCEPTED" : (run.code !== 0 ? (isInterpretedSyntaxError(stderr) ? "COMPILATION_ERROR" : "RUNTIME_ERROR") : "WRONG_ANSWER"),
            actual: test.isHidden ? "[HIDDEN]" : stdout,
            expected: test.isHidden ? "[HIDDEN]" : test.expectedOutput,
            passed: isCorrect,
            time: run.time || 0,
            memory: run.memory || 0,
            stderr: test.isHidden ? (stderr ? "Execution completed with errors." : "") : stderr
          };

          if (run.signal === "SIGKILL") testResult.status = "TIME_LIMIT_EXCEEDED";
          if (run.code === 0 && stderr && !isCorrect) {
            testResult.stderr = test.isHidden ? "Execution completed with errors." : stderr;
          }

          executedSuccessfully = true;
        } catch (err) {
          console.warn(`[EXECUTE] Remote judge execution failed:`, err);
          remoteMirrorsAvailable = false;
          if (!executedSuccessfully) {
            testResult.status = "INTERNAL_ERROR";
            testResult.stderr = "Remote execution service unavailable (check RAPIDAPI_KEY). Falling back to local runner.";
          }
        }
      }

      if (!executedSuccessfully && !USE_LOCAL_FIRST) {
        const localSuccess = await tryLocalExecution();
        if (!localSuccess) {
          testResult = {
            ...testResult,
            status: "INTERNAL_ERROR",
            stderr: remoteMirrorsAvailable
              ? "Execution service is unreachable and no local runner is available for this language."
              : "Execution service is unreachable and no local runner is available."
          };
        }
      }

      if (!executedSuccessfully && USE_LOCAL_FIRST && !remoteMirrorsAvailable) {
        testResult = {
          ...testResult,
          status: "INTERNAL_ERROR",
          stderr: "Execution mirrors are currently unavailable and local execution could not be completed."
        };
      }

      results.push(testResult);

      if (testResult.category === "RANDOMIZED_VALIDATION") {
        randomizedResults.push(testResult);
      }

      if (testResult.status === "COMPILATION_ERROR") break;
    }

    const hardcodeDetected = JudgeEngine.detectPossibleHardcode(
      results.filter(r => r.category !== "RANDOMIZED_VALIDATION"),
      randomizedResults
    );

    if (hardcodeDetected) {
      results.forEach(r => {
        if (r.passed) r.possibleHardcode = true;
      });
    }

    const complexityAnalysis = JudgeEngine.analyzeTimeComplexity(results);
    results.forEach(r => {
      if (r.complexity) {
        r.complexity.analyzed = true;
        r.complexity.suspected = complexityAnalysis;
      }
    });

    const metrics = JudgeEngine.calculateMetrics(results, realTests);

    const summary = {
      passed: results.filter(r => r.passed).length,
      total: realTests.length,
      passPercentage: metrics.passPercentage,
      status: results.every(r => r.status === "ACCEPTED") ? "ACCEPTED" : results.find(r => r.status !== "ACCEPTED")?.status || "FAILED",
      possibleHardcode: hardcodeDetected,
      detectedComplexity: complexityAnalysis,
      byCategory: metrics.byCategoryTotal,
      passedByCategory: metrics.byCategoryPassed
    };

    return NextResponse.json({ results, summary });

  } catch (error: any) {
    console.error("Critical Execution Error:", error);
    return NextResponse.json({ error: "System failure in execution pipeline", status: "INTERNAL_ERROR" }, { status: 500 });
  }
}
