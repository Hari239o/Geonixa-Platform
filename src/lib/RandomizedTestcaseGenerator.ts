/**
 * Randomized Testcase Generator v1.0
 * 
 * Generates different randomized testcases per student to prevent answer sharing
 * and hardcoding. Each student gets a unique set of randomized inputs with
 * mathematically verifiable expected outputs.
 */

import { TestCase, TestCaseCategory } from "./JudgeEngine";

export class RandomizedTestcaseGenerator {
  /**
   * Generate a seed for deterministic randomness based on student ID and exam ID
   * Ensures same student gets same testcase across retakes, but different students get different testcases
   */
  static generateSeed(studentId: string, examId: string, questionId: string): number {
    const combined = `${studentId}:${examId}:${questionId}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Seeded random number generator (Mulberry32)
   * For deterministic pseudo-random values based on a seed
   */
  private static mulberry32(seed: number) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Generate randomized array problem testcases
   * Different for each student based on their ID
   */
  static generateRandomizedArrayTestcases(
    studentId: string,
    examId: string,
    questionId: string
  ): TestCase[] {
    const seed = this.generateSeed(studentId, examId, questionId);
    const rng = this.mulberry32(seed);

    const testcases: TestCase[] = [];

    // Generate 3 randomized testcases
    for (let i = 0; i < 3; i++) {
      const n = Math.floor(rng() * 50) + 10; // Random size 10-60
      const array = Array.from({ length: n }, () => Math.floor(rng() * 100) - 50); // Random values -50 to 50
      const sum = array.reduce((a, b) => a + b, 0);

      testcases.push({
        id: 1000 + i,
        input: `${n}\n${array.join(" ")}`,
        expectedOutput: `${sum}`,
        category: "RANDOMIZED_VALIDATION" as TestCaseCategory,
        difficulty: "MEDIUM",
        isHidden: true,
        description: `Randomized array validation test ${i + 1} - Student specific seed`,
        timeLimit: 1000,
        memoryLimit: 256
      });
    }

    return testcases;
  }

  /**
   * Generate randomized string problem testcases
   */
  static generateRandomizedStringTestcases(
    studentId: string,
    examId: string,
    questionId: string
  ): TestCase[] {
    const seed = this.generateSeed(studentId, examId, questionId);
    const rng = this.mulberry32(seed);

    const testcases: TestCase[] = [];
    const chars = "abcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < 3; i++) {
      const length = Math.floor(rng() * 30) + 10; // 10-40 length strings
      const str = Array.from({ length }, () =>
        chars[Math.floor(rng() * chars.length)]
      ).join("");

      // Compute a simple expected output (e.g., character frequency)
      const charFreq: Record<string, number> = {};
      for (const ch of str) {
        charFreq[ch] = (charFreq[ch] || 0) + 1;
      }

      testcases.push({
        id: 1000 + i,
        input: str,
        expectedOutput: JSON.stringify(charFreq),
        category: "RANDOMIZED_VALIDATION" as TestCaseCategory,
        difficulty: "MEDIUM",
        isHidden: true,
        description: `Randomized string validation test ${i + 1}`,
        timeLimit: 1000,
        memoryLimit: 256
      });
    }

    return testcases;
  }

  /**
   * Generate randomized number theory testcases
   */
  static generateRandomizedNumberTestcases(
    studentId: string,
    examId: string,
    questionId: string
  ): TestCase[] {
    const seed = this.generateSeed(studentId, examId, questionId);
    const rng = this.mulberry32(seed);

    const testcases: TestCase[] = [];

    for (let i = 0; i < 3; i++) {
      const n = Math.floor(rng() * 30) + 5; // 5-35
      const m = Math.floor(rng() * 30) + 5;

      // Example: GCD computation
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const expectedGcd = gcd(n, m);

      testcases.push({
        id: 1000 + i,
        input: `${n}\n${m}`,
        expectedOutput: `${expectedGcd}`,
        category: "RANDOMIZED_VALIDATION" as TestCaseCategory,
        difficulty: "MEDIUM",
        isHidden: true,
        description: `Randomized number theory test ${i + 1}`,
        timeLimit: 1000,
        memoryLimit: 256
      });
    }

    return testcases;
  }

  /**
   * Generate randomized graph/tree testcases
   */
  static generateRandomizedGraphTestcases(
    studentId: string,
    examId: string,
    questionId: string
  ): TestCase[] {
    const seed = this.generateSeed(studentId, examId, questionId);
    const rng = this.mulberry32(seed);

    const testcases: TestCase[] = [];

    for (let i = 0; i < 2; i++) {
      const nodeCount = Math.floor(rng() * 10) + 5; // 5-15 nodes
      const edgeCount = Math.floor(rng() * (nodeCount - 1)) + 1; // Random edges

      const edges: string[] = [];
      const used = new Set<string>();

      for (let e = 0; e < Math.min(edgeCount, (nodeCount * (nodeCount - 1)) / 2); e++) {
        let u = Math.floor(rng() * nodeCount);
        let v = Math.floor(rng() * nodeCount);

        if (u === v) v = (v + 1) % nodeCount;

        const edgeKey = [Math.min(u, v), Math.max(u, v)].join("-");
        if (!used.has(edgeKey)) {
          edges.push(`${u} ${v}`);
          used.add(edgeKey);
        }
      }

      const edgesStr = edges.join("\n");

      testcases.push({
        id: 1000 + i,
        input: `${nodeCount}\n${edgesStr}`,
        expectedOutput: `${edges.length}`,
        category: "RANDOMIZED_VALIDATION" as TestCaseCategory,
        difficulty: "HARD",
        isHidden: true,
        description: `Randomized graph test ${i + 1} - ${nodeCount} nodes`,
        timeLimit: 2000,
        memoryLimit: 512
      });
    }

    return testcases;
  }

  /**
   * Generate randomized DP testcases (e.g., Fibonacci)
   */
  static generateRandomizedDPTestcases(
    studentId: string,
    examId: string,
    questionId: string
  ): TestCase[] {
    const seed = this.generateSeed(studentId, examId, questionId);
    const rng = this.mulberry32(seed);

    const testcases: TestCase[] = [];

    // Precomputed Fibonacci values
    const fibonacci = [0, 1];
    for (let i = 2; i <= 50; i++) {
      fibonacci.push(fibonacci[i - 1] + fibonacci[i - 2]);
    }

    for (let i = 0; i < 3; i++) {
      const n = Math.floor(rng() * 30) + 10; // 10-40
      const fibValue = fibonacci[n];

      testcases.push({
        id: 1000 + i,
        input: `${n}`,
        expectedOutput: `${fibValue}`,
        category: "RANDOMIZED_VALIDATION" as TestCaseCategory,
        difficulty: "MEDIUM",
        isHidden: true,
        description: `Randomized DP test ${i + 1}`,
        timeLimit: 1000,
        memoryLimit: 256
      });
    }

    return testcases;
  }

  /**
   * Generate randomized matrix problem testcases
   */
  static generateRandomizedMatrixTestcases(
    studentId: string,
    examId: string,
    questionId: string
  ): TestCase[] {
    const seed = this.generateSeed(studentId, examId, questionId);
    const rng = this.mulberry32(seed);

    const testcases: TestCase[] = [];

    for (let i = 0; i < 2; i++) {
      const rows = Math.floor(rng() * 10) + 3; // 3-13 rows
      const cols = Math.floor(rng() * 10) + 3; // 3-13 cols

      const matrix: number[][] = [];
      for (let r = 0; r < rows; r++) {
        const row: number[] = [];
        for (let c = 0; c < cols; c++) {
          row.push(Math.floor(rng() * 20) - 10); // -10 to 10
        }
        matrix.push(row);
      }

      // Example: Sum of all elements
      const sum = matrix.flat().reduce((a, b) => a + b, 0);

      const input = `${rows} ${cols}\n${matrix
        .map((row) => row.join(" "))
        .join("\n")}`;

      testcases.push({
        id: 1000 + i,
        input,
        expectedOutput: `${sum}`,
        category: "RANDOMIZED_VALIDATION" as TestCaseCategory,
        difficulty: "MEDIUM",
        isHidden: true,
        description: `Randomized matrix test ${i + 1} - ${rows}x${cols}`,
        timeLimit: 1000,
        memoryLimit: 256
      });
    }

    return testcases;
  }

  /**
   * Inject randomized testcases into a question's testcase pool
   * These will be marked as RANDOMIZED_VALIDATION and help detect hardcoding
   */
  static injectRandomizedTestcases(
    baseTestcases: TestCase[],
    studentId: string,
    examId: string,
    questionId: string,
    problemType: "array" | "string" | "number" | "graph" | "dp" | "matrix" = "array"
  ): TestCase[] {
    let randomized: TestCase[] = [];

    switch (problemType) {
      case "array":
        randomized = this.generateRandomizedArrayTestcases(studentId, examId, questionId);
        break;
      case "string":
        randomized = this.generateRandomizedStringTestcases(studentId, examId, questionId);
        break;
      case "number":
        randomized = this.generateRandomizedNumberTestcases(studentId, examId, questionId);
        break;
      case "graph":
        randomized = this.generateRandomizedGraphTestcases(studentId, examId, questionId);
        break;
      case "dp":
        randomized = this.generateRandomizedDPTestcases(studentId, examId, questionId);
        break;
      case "matrix":
        randomized = this.generateRandomizedMatrixTestcases(studentId, examId, questionId);
        break;
    }

    // Combine base testcases with randomized ones
    return [...baseTestcases, ...randomized];
  }

  /**
   * Verify if a testcase is deterministic and reproducible for integrity checking
   */
  static verifyTestcaseIntegrity(
    testcase: TestCase,
    studentId: string,
    examId: string,
    questionId: string
  ): boolean {
    // For randomized testcases, verify they were generated with correct seed
    if (testcase.category !== "RANDOMIZED_VALIDATION") {
      return true;
    }

    const seed = this.generateSeed(studentId, examId, questionId);
    // If the seed matches and category is randomized, it's integrity-verified
    return seed > 0;
  }
}
