import { 
  APTITUDE_POOL as DATA_APTITUDE, 
  GRAMMAR_POOL as DATA_GRAMMAR, 
  DOMAIN_MCQ_POOL as DATA_DOMAIN_MCQ, 
  DSA_HARD_POOL as DATA_DSA_HARD,
  TYPING_TOPICS as DATA_TYPING_TOPICS,
  TYPING_TOPICS_POOL as DATA_TYPING_POOL,
  WEB_DEV_POOL as DATA_WEB_DEV,
  JAVA_POOL as DATA_JAVA,
  PYTHON_POOL as DATA_PYTHON,
  DATA_SCIENCE_POOL as DATA_SCIENCE
} from './questions_data';
export { isTechnicalDomain } from './domainConfig';

export const APTITUDE_POOL = DATA_APTITUDE;
export const GRAMMAR_POOL = DATA_GRAMMAR;
export const TYPING_TOPICS = DATA_TYPING_TOPICS;
export const DOMAIN_MCQ_POOL = DATA_DOMAIN_MCQ;
const stickersQuestion = {
  title: "Stickers to Spell Word",
  desc: `1. PROBLEM OVERVIEW
-------------------
We are given n different types of stickers. Each sticker has a lowercase English word on it.
You would like to spell out the given string target by cutting individual letters from your collection of stickers and rearranging them. You can use each sticker more than once if you want, and you have infinite quantities of each sticker.

Return the minimum number of stickers that you need to spell out target. If the task is impossible, return -1.

Note: In all test cases, all words were chosen randomly from the 1000 most common US English words, and target was chosen as a concatenation of two random words.

2. CONSTRAINTS
--------------
* n == stickers.length
* 1 <= n <= 50
* 1 <= stickers[i].length <= 10
* 1 <= target.length <= 15
* stickers[i] and target consist of lowercase English letters.`,
  objective: "Return the minimum number of stickers that you need to spell out the target.",
  task: "Implement an optimized dynamic programming with bitmask or memoized DFS approach.",
  inputFormat: "First line: space-separated string of stickers.\nSecond line: target string.",
  outputFormat: "Integer representing the minimum number of stickers, or -1 if impossible.",
  sampleInput: "with example science\nthehat",
  sampleOutput: "3",
  explanation: "We can use 2 'with' stickers, and 1 'example' sticker. After cutting and rearranging the letters, we can form 'thehat'.",
  initialCode: `int minStickers(vector<string>& stickers, string target) {\n    // Complete your solution here\n}`,
  tests: [
    {
      id: 1,
      input: "with example science\nthehat",
      expectedOutput: "3",
      category: "SAMPLE",
      difficulty: "EASY",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Sample case using two copies of one sticker and one of another."
    },
    {
      id: 2,
      input: "notice possible\nbasicbasic",
      expectedOutput: "-1",
      isHidden: true,
      category: "BOUNDARY_CONDITION",
      difficulty: "MEDIUM",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Impossible target because required letters are missing from the sticker set."
    },
    {
      id: 3,
      input: "a b c\nabc",
      expectedOutput: "3",
      isHidden: true,
      category: "EDGE_CASE",
      difficulty: "EASY",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Each letter comes from a separate sticker."
    },
    {
      id: 4,
      input: "ab bc cd\nabcd",
      expectedOutput: "2",
      isHidden: true,
      category: "DUPLICATE_VALUES",
      difficulty: "MEDIUM",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Overlapping sticker words are combined to cover the target."
    },
    {
      id: 5,
      input: "hello world\nhelloworld",
      expectedOutput: "2",
      isHidden: true,
      category: "RANDOMIZED_VALIDATION",
      difficulty: "MEDIUM",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Common-word target formed from two stickers."
    },
    {
      id: 6,
      input: "abcde fghij\nabcdefghij",
      expectedOutput: "2",
      isHidden: true,
      category: "BOUNDARY_CONDITION",
      difficulty: "MEDIUM",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Two stickers each contribute half the target."
    },
    {
      id: 7,
      input: "a b c\nd",
      expectedOutput: "-1",
      isHidden: true,
      category: "EDGE_CASE",
      difficulty: "EASY",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Target contains a letter not present in any sticker."
    },
    {
      id: 8,
      input: "z y x\nx",
      expectedOutput: "1",
      isHidden: true,
      category: "BOUNDARY_CONDITION",
      difficulty: "EASY",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Single-letter target from one sticker."
    },
    {
      id: 9,
      input: "apple banana\napplebanana",
      expectedOutput: "2",
      isHidden: true,
      category: "DUPLICATE_VALUES",
      difficulty: "MEDIUM",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Duplicate letters require using both stickers in full."
    },
    {
      id: 10,
      input: "aaaaa bbbbb\naabb",
      expectedOutput: "2",
      isHidden: true,
      category: "WORST_CASE_COMPLEXITY",
      difficulty: "HARD",
      timeLimit: 1000,
      memoryLimit: 256,
      description: "Requires choosing the right sticker combination for repeated letters."
    }
  ]
};

import { NEW_HARDCORE_DSA_POOL } from './hardcore_dsa_pool';

export const DSA_HARD_POOL: any[] = [stickersQuestion, ...DATA_DSA_HARD, ...NEW_HARDCORE_DSA_POOL];
export const TYPING_TOPICS_POOL = DATA_TYPING_POOL;
export const WEB_DEV_POOL: any[] = DATA_WEB_DEV;
export const JAVA_POOL: any[] = DATA_JAVA;
export const PYTHON_POOL: any[] = DATA_PYTHON;
export const DATA_SCIENCE_POOL: any[] = DATA_SCIENCE;

// Industry Standard Hard DSA Coding Questions (LeetCode Style)
export const CODING_DSA_POOL: any[] = [
  { ...stickersQuestion, difficulty: "Hard" },
  ...DATA_DSA_HARD,
  ...NEW_HARDCORE_DSA_POOL.map(q => ({ ...q, difficulty: "Hard" }))
];

// Technical Round 4 - Corporate Assessment Challenges
export const TECHNICAL_ROUND_4_POOL: any[] = [stickersQuestion, ...DATA_DSA_HARD, ...NEW_HARDCORE_DSA_POOL];
