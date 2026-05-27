const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'questions_data.ts');
const content = fs.readFileSync(filePath, 'utf-8');

const targetIndex = content.indexOf('// PROFESSIONAL DSA HARD POOL');
if (targetIndex === -1) {
  console.error("Could not find target comment!");
  process.exit(1);
}

const head = content.substring(0, targetIndex);

const dsaHardPool = [
  // 1. N-Queens II
  {
    title: "N-Queens II",
    desc: `1. PROBLEM OVERVIEW
-------------------
The N-Queens problem is a classic combinatorial optimization challenge. It requires placing N chess queens on an N×N chessboard so that no two queens threaten each other.

2. REAL-WORLD SCENARIO
----------------------
This problem models complex resource allocation in distributed systems, where you must assign N resources to N positions without conflicts.

3. DETAILED OBJECTIVE
---------------------
Given an integer n, return the number of distinct solutions to the n-queens puzzle.

4. PROBLEM STATEMENT
--------------------
You must implement a backtracking algorithm that explores all valid queen placements while pruning invalid configurations early.

5. FUNCTION SIGNATURE
---------------------
int totalNQueens(int n)

6. INPUT FORMAT
---------------
A single integer n (1 ≤ n ≤ 12)

7. OUTPUT FORMAT
----------------
An integer representing the total number of distinct solutions.

8. CONSTRAINTS
--------------
* 1 ≤ n ≤ 12
* Time limit: 1 second
* Memory limit: 256 MB

9. EDGE CASE REQUIREMENTS
-------------------------
* n = 1: Should return 1
* n = 2, 3: Should return 0
* n = 4: Should return 2

10. TIME COMPLEXITY EXPECTATIONS
--------------------------------
* Expected: O(N!) with pruning
`,
    objective: "Implement optimized N-Queens backtracking with bit manipulation.",
    task: "Complete the function to count all distinct N-Queens solutions.",
    inputFormat: "A single integer n",
    outputFormat: "Integer count of solutions",
    sampleInput: "4",
    sampleOutput: "2",
    explanation: "Two distinct ways to place 4 queens safely on 4×4 board.",
    initialCode: "int totalNQueens(int n) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "4", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "1", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "8", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "3", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "5", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "6", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "7", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "9", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "10", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 11, input: "11", expectedOutput: "[HIDDEN]" },
      { id: 12, input: "12", expectedOutput: "[HIDDEN]" }
    ]
  },
  // 2. Word Ladder II
  {
    title: "Word Ladder II",
    desc: `1. PROBLEM OVERVIEW
-------------------
Find all shortest transformation sequences from beginWord to endWord, such that:
- Only one letter can be changed at a time
- Each transformed word must exist in the word list
- Return all shortest sequences

2. CONSTRAINTS
--------------
* 1 ≤ beginWord.length, endWord.length ≤ 10
* 1 ≤ wordList.length ≤ 5000
`,
    objective: "Implement a bidirectional BFS to find all shortest paths in the word graph.",
    task: "Find all shortest transformation sequences.",
    inputFormat: "beginWord endWord\\nspace-separated word list",
    outputFormat: "All shortest sequences, each path on a line",
    sampleInput: "hit cog\nhot dot dog lot log cog",
    sampleOutput: "hit hot dot dog cog\nhit hot lot log cog",
    explanation: "Two shortest paths of length 5 exist.",
    initialCode: "vector<vector<string>> findLadders(string beginWord, string endWord, vector<string>& wordList) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "hit cog\nhot dot dog lot log cog", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "a c\na b c", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "red tax\nted tex red tax tad den rex pee", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "hot dog\nhot dog", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "a c\nb", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "lost cost\nlost most cost", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "talk tail\ntalk talk tail", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "lead gold\nlead load goad gold", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "work play\nwork pork pony plny play", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "cat dog\ncat bat bet bet dog", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 3. Sliding Window Maximum
  {
    title: "Sliding Window Maximum",
    desc: `1. PROBLEM OVERVIEW
-------------------
Given an array of integers and a sliding window of size k, return the maximum values in each sliding window.

2. CONSTRAINTS
--------------
* 1 ≤ nums.length ≤ 10^5
* 1 ≤ k ≤ nums.length
`,
    objective: "Implement monotonic queue or double-ended queue optimization.",
    task: "Return sliding window maximums.",
    inputFormat: "Space separated array\\nk",
    outputFormat: "Space separated maximums",
    sampleInput: "1 3 -1 -3 5 3 6 7\n3",
    sampleOutput: "3 3 5 5 6 7",
    explanation: "Window positions and max values are computed.",
    initialCode: "vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "1 3 -1 -3 5 3 6 7\n3", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "1\n1", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "1 -1\n1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "9 11\n2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "4 -2\n2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "1 2 3 4 5 6 7 8 9 10\n3", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "10 9 8 7 6 5 4 3 2 1\n4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "2 2 2 2\n2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "5 4 3 2 1 2 3 4 5\n3", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "1 3 1 2 0 5\n3", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 4. Median of Two Sorted Arrays
  {
    title: "Median of Two Sorted Arrays",
    desc: `1. PROBLEM OVERVIEW
-------------------
Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

2. CONSTRAINTS
--------------
* O(log(m+n)) runtime complexity required
* 0 ≤ m, n ≤ 2000
`,
    objective: "Implement binary search / partition search on sorted arrays.",
    task: "Find the median of the merged array.",
    inputFormat: "Space separated nums1\\nSpace separated nums2",
    outputFormat: "Decimal value (1 decimal place)",
    sampleInput: "1 3\n2",
    sampleOutput: "2.0",
    explanation: "Merged array is [1, 2, 3] and median is 2.0.",
    initialCode: "double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "1 3\n2", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "1 2\n3 4", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "0 0\n0 0", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "\n1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "2\n", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "1 3 5 7 9\n2 4 6 8 10", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "1 12 15 26 38\n2 13 17 30 45", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "100\n101 102", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "1 2 5\n3 4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "100000\n100001", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 5. Regular Expression Matching
  {
    title: "Regular Expression Matching",
    desc: `1. PROBLEM OVERVIEW
-------------------
Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.

2. CONSTRAINTS
--------------
* 1 ≤ s.length, p.length ≤ 30
`,
    objective: "Implement dynamic programming or memoized recursion.",
    task: "Determine if s matches p.",
    inputFormat: "s\\np",
    outputFormat: "true or false",
    sampleInput: "aa\na*",
    sampleOutput: "true",
    explanation: "'*' means zero or more of preceding element.",
    initialCode: "bool isMatch(string s, string p) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "aa\na*", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "ab\n.*", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "mississippi\nmis*is*p*.", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "aab\nc*a*b", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "ab\n.*c", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "aaa\naaaa", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "aaa\na*a", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "abc\na.c", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "a\nab*", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "bbbba\n.*a*a", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 6. Merge k Sorted Lists
  {
    title: "Merge k Sorted Lists",
    desc: `1. PROBLEM OVERVIEW
-------------------
Merge k sorted linked lists and return it as one sorted list.

2. CONSTRAINTS
--------------
* 0 <= k <= 10^4
* 0 <= lists[i].length <= 500
* O(N log k) time required
`,
    objective: "Implement priority queue or divide-and-conquer for list merging.",
    task: "Return the merged sorted list.",
    inputFormat: "k arrays (each on a separate line)",
    outputFormat: "Merged array",
    sampleInput: "1 4 5\n1 3 4\n2 6",
    sampleOutput: "1 1 2 3 4 4 5 6",
    explanation: "Merged 3 lists.",
    initialCode: "ListNode* mergeKLists(vector<ListNode*>& lists) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "1 4 5\n1 3 4\n2 6", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "1 2\n3 4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 3, input: "1\n2\n3\n4\n5", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "1 3 5\n2 4 6\n7 8 9", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "10 20\n15 25\n5 30", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "2 2 2\n2 2\n2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "1 4 7\n2 5 8\n3 6 9", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "5 5 5\n5 5\n5", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "3 6 9\n1 4 7\n2 5 8", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "0 1 2\n3 4 5\n6 7 8", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 7. Trapping Rain Water
  {
    title: "Trapping Rain Water",
    desc: `1. PROBLEM OVERVIEW
-------------------
Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

2. CONSTRAINTS
--------------
* n == height.length
* 1 <= n <= 2 * 10^4
`,
    objective: "Implement two pointers or monotonic stack.",
    task: "Return total trapped water.",
    inputFormat: "Space separated heights",
    outputFormat: "Total trapped water",
    sampleInput: "0 1 0 2 1 0 1 3 2 1 2 1",
    sampleOutput: "6",
    explanation: "Traps 6 units.",
    initialCode: "int trap(vector<int>& height) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "4 2 0 3 2 5", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "5 4 3 2 1 2 3 4 5", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "4 2 3", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "1 2 3 4 5", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "3 0 2 0 4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "2 0 2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "0 0 0 0", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "4 1 1 0 2 3", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "4 2 3 4 1 2", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 8. Edit Distance
  {
    title: "Edit Distance",
    desc: `1. PROBLEM OVERVIEW
-------------------
Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2 (insert, delete, replace).

2. CONSTRAINTS
--------------
* 0 <= word1.length, word2.length <= 500
`,
    objective: "Implement 2D dynamic programming.",
    task: "Return min operations.",
    inputFormat: "word1\\nword2",
    outputFormat: "Integer distance",
    sampleInput: "horse\nros",
    sampleOutput: "3",
    explanation: "horse -> rorse -> rose -> ros",
    initialCode: "int minDistance(string word1, string word2) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "horse\nros", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "intention\nexecution", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "\na", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "abc\nabc", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "pale\nple", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "kitten\nsitting", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "flaw\nlawn", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "distance\nediting", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "Sunday\nSaturday", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "abc\n", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 9. Largest Rectangle in Histogram
  {
    title: "Largest Rectangle in Histogram",
    desc: `1. PROBLEM OVERVIEW
-------------------
Given heights representing the histogram's bar height, return the area of the largest rectangle in the histogram.

2. CONSTRAINTS
--------------
* 1 <= heights.length <= 10^5
`,
    objective: "Implement monotonic stack.",
    task: "Return max rectangle area.",
    inputFormat: "Space separated heights",
    outputFormat: "Max area",
    sampleInput: "2 1 5 6 2 3",
    sampleOutput: "10",
    explanation: "Rectangle [5,6] has area 10",
    initialCode: "int largestRectangleArea(vector<int>& heights) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "2 1 5 6 2 3", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "2 4", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "1 1 1 1 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "10 9 8 7 6 5 4 3 2 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "2 2 2 2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "2 4 2 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "5 4 5", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "5 5 1 7", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "3 3 3 3 3", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "6 2 5 4 5 1 6", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 10. Sudoku Solver
  {
    title: "Sudoku Solver",
    desc: `1. PROBLEM OVERVIEW
-------------------
Write a program to solve a Sudoku puzzle. Empty cells are indicated by '.'.

2. CONSTRAINTS
--------------
* 9x9 board
`,
    objective: "Implement backtracking with constraint propagation.",
    task: "Output solved board.",
    inputFormat: "9 lines of 9 chars",
    outputFormat: "9 lines of 9 chars",
    sampleInput: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79",
    sampleOutput: "534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n345286179",
    explanation: "Standard sudoku rules.",
    initialCode: "void solveSudoku(vector<vector<char>>& board) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 3, input: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 11. Shortest Path Visiting All Nodes
  {
    title: "Shortest Path Visiting All Nodes",
    desc: `1. PROBLEM OVERVIEW
-------------------
You are given an undirected, connected graph of n nodes. Find the length of the shortest path that visits every node.

2. CONSTRAINTS
--------------
* 1 <= n <= 12
`,
    objective: "Implement BFS + Bitmask shortest path algorithm.",
    task: "Complete the shortestPathLength function.",
    inputFormat: "Number of nodes N, followed by N lines of neighbors",
    outputFormat: "Integer length",
    sampleInput: "4\n1 2 3\n0\n0\n0",
    sampleOutput: "4",
    explanation: "Path: 1 -> 0 -> 2 -> 0 -> 3 has length 4.",
    initialCode: "int shortestPathLength(vector<vector<int>>& graph) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "4\n1 2 3\n0\n0\n0", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "5\n1\n0 2 4\n1 3\n2\n1", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "1\n", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "2\n1\n0", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "3\n1 2\n0 2\n0 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "6\n1\n0 2\n1 3\n2 4\n3 5\n4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "4\n1\n0 2\n1 3\n2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "5\n1 2 3 4\n0\n0\n0\n0", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "7\n1\n0 2\n1 3\n2 4\n3 5\n4 6\n5", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "3\n1\n0 2\n1", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 12. Binary Tree Maximum Path Sum
  {
    title: "Binary Tree Maximum Path Sum",
    desc: `1. PROBLEM OVERVIEW
-------------------
Find the maximum path sum in a binary tree represented by a level-order traversal array (-1 for null).

2. CONSTRAINTS
--------------
* 1 <= nodes.length <= 10^4
`,
    objective: "Implement a recursion tracking path extensions and split maximum sums.",
    task: "Complete maxPathSum function.",
    inputFormat: "Space separated level-order nodes",
    outputFormat: "Integer maximum path sum",
    sampleInput: "1 2 3",
    sampleOutput: "6",
    explanation: "Path: 2 -> 1 -> 3 gives sum 6.",
    initialCode: "int maxPathSum(vector<int>& nodes) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "1 2 3", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "-10 9 20 -1 -1 15 7", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "-3", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "2 -1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "1 -2 3", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "5 4 8 11 -1 13 4 7 2 -1 -1 -1 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "-2 1 -3", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "1 2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "9 6 -3 -1 -1 -6 2 -1 -1 2 -1 -6 -6 -6", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "-10 -20 -30", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 13. Segment Tree Range Query
  {
    title: "Segment Tree Range Query",
    desc: `1. PROBLEM OVERVIEW
-------------------
Implement a segment tree or Fenwick tree to handle point updates and range sum queries.

2. CONSTRAINTS
--------------
* 1 <= N, Q <= 10^5
`,
    objective: "Implement Segment tree for O(log N) updates and queries.",
    task: "Complete processQueries function.",
    inputFormat: "N Q\\nN elements\\nQ lines of queries (U index value or Q left right)",
    outputFormat: "Space separated sums",
    sampleInput: "5 3\n1 3 5 7 9\nQ 1 3\nU 2 10\nQ 1 3",
    sampleOutput: "15 22",
    explanation: "Sum from index 1 to 3 is 3+5+7=15. Update array[2] = 10. New sum is 3+10+7=22.",
    initialCode: "vector<int> processQueries(vector<int>& nums, vector<string>& queries) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "5 3\n1 3 5 7 9\nQ 1 3\nU 2 10\nQ 1 3", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "3 2\n5 5 5\nQ 0 2\nQ 1 1", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "4 4\n1 2 3 4\nQ 0 3\nU 0 5\nQ 0 3\nQ 1 2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "2 1\n10 20\nQ 0 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "6 3\n2 4 6 8 10 12\nQ 2 4\nU 3 0\nQ 2 4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "1 2\n100\nQ 0 0\nU 0 50", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "5 5\n1 1 1 1 1\nQ 0 4\nU 2 10\nQ 0 4\nU 0 -5\nQ 0 4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "4 3\n10 -5 20 8\nQ 1 3\nU 2 -10\nQ 1 3", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "3 3\n1 2 3\nQ 0 2\nU 1 20\nQ 1 2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "5 2\n3 4 5 6 7\nU 4 0\nQ 0 4", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 14. Word Search II
  {
    title: "Word Search II",
    desc: `1. PROBLEM OVERVIEW
-------------------
Given a 2D board of characters and a list of words from a dictionary, find all words in the board.

2. CONSTRAINTS
--------------
* R, C <= 12
* words.length <= 10^3
`,
    objective: "Implement backtracking using a Trie for dictionary word search.",
    task: "Complete findWords function.",
    inputFormat: "R C\\nR lines of C chars\\nSpace separated words",
    outputFormat: "Alphabetically sorted matched words separated by space",
    sampleInput: "4 4\no a a n\ne t a e\ni h k r\ni f l v\noath pea eat rain",
    sampleOutput: "eat oath",
    explanation: "Matched words: eat, oath.",
    initialCode: "vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "4 4\no a a n\ne t a e\ni h k r\ni f l v\noath pea eat rain", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "2 2\na b\nc d\nababcd", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "1 1\na\na", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "3 3\na b c\nd e f\ng h i\ncfi beh adg", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "2 3\na b c\nd e f\nabc fed dec", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "2 2\na a\na a\naaaaa", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "4 4\no a a n\ne t a e\ni h k r\ni f l v\noath oat pea eat rain", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "2 2\na b\nc d\na b c d", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "1 2\na b\na b ab ba", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "3 3\nt e s\nt o t\nh e r\ntest tot the", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 15. Minimum Cost Maximum Flow
  {
    title: "Minimum Cost Maximum Flow",
    desc: `1. PROBLEM OVERVIEW
-------------------
Calculate the maximum flow in a flow network from source S to sink T.

2. CONSTRAINTS
--------------
* N <= 100, E <= 1000
`,
    objective: "Implement Dinic or Edmonds-Karp network flow algorithm.",
    task: "Complete maxFlow function.",
    inputFormat: "N S T E\\nE lines of: u v capacity",
    outputFormat: "Integer maximum flow",
    sampleInput: "4 0 3 5\n0 1 3\n0 2 2\n1 2 1\n1 3 2\n2 3 3",
    sampleOutput: "5",
    explanation: "Maximum flow is 5.",
    initialCode: "int maxFlow(int n, int source, int sink, vector<vector<int>>& edges) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "4 0 3 5\n0 1 3\n0 2 2\n1 2 1\n1 3 2\n2 3 3", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "2 0 1 1\n0 1 10", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "3 0 2 2\n0 1 5\n1 2 4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "6 0 5 9\n0 1 16\n0 2 13\n1 2 10\n1 3 12\n2 1 4\n2 4 14\n3 2 9\n3 5 20\n4 3 7\n4 5 4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "4 0 3 4\n0 1 100\n0 2 100\n1 3 1\n2 3 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "3 0 2 2\n0 1 0\n1 2 10", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "5 0 4 6\n0 1 10\n0 2 10\n1 3 4\n2 3 8\n1 4 2\n3 4 10", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "2 0 1 0", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "4 0 3 4\n0 1 5\n1 2 5\n2 3 5\n0 3 2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "3 0 2 3\n0 1 10\n0 2 5\n1 2 5", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 16. Ways to Wear Different Hats
  {
    title: "Ways to Wear Different Hats",
    desc: `1. PROBLEM OVERVIEW
-------------------
Find the number of ways to assign different hats to people.

2. CONSTRAINTS
--------------
* P <= 10
* hats[i][j] <= 40
`,
    objective: "Implement bitmask DP matching hats to people.",
    task: "Complete numberWays function.",
    inputFormat: "P (people count)\\nP lines: space-separated hats preferred by person i",
    outputFormat: "Number of ways modulo 10^9+7",
    sampleInput: "2\n3 5 1\n3 5",
    sampleOutput: "4",
    explanation: "Hats assigned uniquely.",
    initialCode: "int numberWays(vector<vector<int>>& hats) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "2\n3 5 1\n3 5", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "3\n3 5\n3\n3", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "2\n1 2 3 4\n1 2 3 4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "1\n1 2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "3\n1 2 3\n2 3 4\n3 4 5", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "4\n1\n2\n3\n4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "2\n1\n1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "3\n1 2\n1 2\n1 2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "3\n1 2 3\n1 2 3\n1 2 3", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "5\n1 2 3 4 5\n1 2 3 4 5\n1 2 3 4 5\n1 2 3 4 5\n1 2 3 4 5", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 17. Course Schedule III
  {
    title: "Course Schedule III",
    desc: `1. PROBLEM OVERVIEW
-------------------
Find the maximum number of courses you can take given their durations and last days.

2. CONSTRAINTS
--------------
* N <= 10^4
`,
    objective: "Implement greedy scheduling using priority queue.",
    task: "Complete scheduleCourse function.",
    inputFormat: "N (courses count)\\nN lines: duration lastDay",
    outputFormat: "Maximum courses",
    sampleInput: "4\n100 200\n200 1300\n1000 1250\n2000 3200",
    sampleOutput: "3",
    explanation: "Take 3 courses: 100, 200, 2000.",
    initialCode: "int scheduleCourse(vector<vector<int>>& courses) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "4\n100 200\n200 1300\n1000 1250\n2000 3200", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "2\n1 2\n3 2", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "1\n3 2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "3\n5 5\n4 6\n2 6", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "5\n100 200\n200 1300\n1000 1250\n2000 3200\n100 150", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "2\n10 10\n10 10", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "3\n1 2\n2 3\n3 4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "4\n5 15\n3 8\n10 20\n2 10", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "1\n5 5", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "5\n5 15\n3 12\n2 8\n6 20\n1 5", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 18. Kth Ancestor of a Tree Node
  {
    title: "Kth Ancestor of a Tree Node",
    desc: `1. PROBLEM OVERVIEW
-------------------
Find the Kth ancestor of a node in a tree.

2. CONSTRAINTS
--------------
* N, Q <= 50000
`,
    objective: "Implement binary lifting structure for tree query acceleration.",
    task: "Complete getKthAncestors function.",
    inputFormat: "N Q\\nParent array of size N\\nQ lines: node k",
    outputFormat: "Space separated ancestors",
    sampleInput: "7 3\n-1 0 0 1 1 2 2\n3 1\n5 2\n6 3",
    sampleOutput: "1 0 -1",
    explanation: "Queries: node 3's 1st ancestor is 1; node 5's 2nd is 0; node 6's 3rd is -1.",
    initialCode: "vector<int> getKthAncestors(int n, vector<int>& parent, vector<vector<int>>& queries) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "7 3\n-1 0 0 1 1 2 2\n3 1\n5 2\n6 3", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "2 1\n-1 0\n1 1", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "3 2\n-1 0 1\n2 1\n2 2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "4 2\n-1 0 1 2\n3 2\n3 4", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "5 3\n-1 0 0 3 3\n4 1\n4 2\n2 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "1 1\n-1\n0 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "6 2\n-1 0 1 2 3 4\n5 5\n5 6", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "3 1\n-1 0 0\n1 2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "4 3\n-1 0 0 1\n3 1\n3 2\n2 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "5 2\n-1 0 1 2 3\n4 3\n3 2", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 19. Distinct Subsequences II
  {
    title: "Distinct Subsequences II",
    desc: `1. PROBLEM OVERVIEW
-------------------
Given string s, return number of distinct non-empty subsequences of s.

2. CONSTRAINTS
--------------
* 1 <= s.length <= 2000
`,
    objective: "Implement linear dynamic programming with distinct character tracking.",
    task: "Complete distinctSubseqII function.",
    inputFormat: "string s",
    outputFormat: "Number of subsequences modulo 10^9+7",
    sampleInput: "abc",
    sampleOutput: "7",
    explanation: "All 7 non-empty subsequences are unique.",
    initialCode: "int distinctSubseqII(string s) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "abc", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "aba", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "aaa", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "a", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "abcb", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "z", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "leetcode", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "pcec", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "abacaba", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "abcdefg", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  },
  // 20. Number of Islands II
  {
    title: "Number of Islands II",
    desc: `1. PROBLEM OVERVIEW
-------------------
Calculate the number of islands after each land position is added.

2. CONSTRAINTS
--------------
* R, C <= 100
`,
    objective: "Implement Disjoint Set Union (DSU) to count dynamically connected components.",
    task: "Complete numIslands2 function.",
    inputFormat: "R C L\\nL lines of r c",
    outputFormat: "Space separated counts",
    sampleInput: "3 3 4\n0 0\n0 1\n1 2\n2 1",
    sampleOutput: "1 1 2 3",
    explanation: "Number of islands are calculated after each step.",
    initialCode: "vector<int> numIslands2(int m, int n, vector<vector<int>>& positions) {\n    // Complete your solution here\n}",
    tests: [
      { id: 1, input: "3 3 4\n0 0\n0 1\n1 2\n2 1", expectedOutput: "[HIDDEN]" },
      { id: 2, input: "2 2 2\n0 0\n1 1", expectedOutput: "[HIDDEN]" },
      { id: 3, input: "1 1 1\n0 0", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 4, input: "2 2 4\n0 0\n0 1\n1 0\n1 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 5, input: "3 3 3\n0 0\n0 2\n2 2", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 6, input: "2 3 3\n0 0\n0 2\n0 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 7, input: "1 2 2\n0 0\n0 1", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 8, input: "3 3 4\n0 0\n1 1\n2 2\n1 0", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 9, input: "2 2 3\n0 0\n0 1\n0 0", expectedOutput: "[HIDDEN]", isHidden: true },
      { id: 10, input: "3 3 5\n0 0\n0 1\n1 0\n1 1\n2 2", expectedOutput: "[HIDDEN]", isHidden: true }
    ]
  }
];

const typingTopics = [
  {
    title: "The Industrial Revolution",
    text: "The Industrial Revolution was a period of global transition of the human economy towards more widespread, efficient and stable manufacturing processes that succeeded the Agricultural Revolution, starting from Great Britain, continental Europe, and the United States, that occurred during the period from around 1760 to about 1820–1840. This transition included going from hand production methods to machines, new chemical manufacturing and iron production processes, the increasing use of steam power and water power, the development of machine tools and the rise of the mechanized factory system."
  }
];

const typingTopicsPool = [
  "The impact of Artificial Intelligence on job markets and the future of human labor in a machine-driven economy.",
  "Sustainable urban planning: Creating green cities through vertical forests and renewable energy integration.",
  "The ethics of genetic engineering: Balancing scientific progress with moral responsibility in human DNA editing.",
  "Cybersecurity in the age of quantum computing: Protecting global data from unprecedented encryption threats.",
  "The philosophy of space exploration: Should humanity prioritize Mars colonization or Earth restoration?",
  "The psychology of social media: Analyzing the effects of digital connectivity on mental health and social behavior.",
  "Blockchain and the decentralization of finance: Can cryptocurrency truly replace traditional banking systems?",
  "The evolution of education: Transitioning from standard classroom models to personalized AI-driven learning.",
  "Climate change and global water security: Addressing the looming crisis of freshwater scarcity in the 21st century.",
  "The rise of remote work: How the pandemic accelerated a permanent shift in corporate culture and office life."
];

// Rebuild tail block
const tailContent = `
export const DSA_HARD_POOL = ${JSON.stringify(dsaHardPool, null, 2)};

export const TYPING_TOPICS = ${JSON.stringify(typingTopics, null, 2)};

export const TYPING_TOPICS_POOL = ${JSON.stringify(typingTopicsPool, null, 2)};

export const WEB_DEV_POOL = DSA_HARD_POOL;
export const JAVA_POOL = DSA_HARD_POOL;
export const PYTHON_POOL = DSA_HARD_POOL;
export const DATA_SCIENCE_POOL = DSA_HARD_POOL;
`;

fs.writeFileSync(filePath, head + tailContent, 'utf-8');
console.log("Successfully rewrote questions_data.ts with 20 premium questions!");
