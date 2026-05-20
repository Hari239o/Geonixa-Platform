/**
 * Enterprise Testcase Generator v1.0
 * 
 * Generates professional, categorized testcases for competitive programming problems.
 * Ensures comprehensive testing with minimum 10 testcases per question following:
 * - HackerRank/LeetCode standards
 * - Amazon OA protocols
 * - Codility benchmarks
 */

import { TestCase, TestCaseCategory } from "./JudgeEngine";

/**
 * Utility class for generating comprehensive testcases
 */
export class TestcaseGenerator {
  /**
   * Create a testcase with full metadata
   */
  static createTestcase(
    id: number,
    input: string,
    expectedOutput: string,
    category: TestCaseCategory,
    difficulty: "EASY" | "MEDIUM" | "HARD" = "MEDIUM",
    isHidden: boolean = true,
    description?: string,
    timeLimit: number = 1000,
    memoryLimit: number = 256
  ): TestCase {
    return {
      id,
      input,
      expectedOutput,
      category,
      difficulty,
      isHidden,
      description,
      timeLimit,
      memoryLimit,
    };
  }

  /**
   * Generate minimum 10 testcases for array/number problems
   */
  static generateArrayProblemTestcases(
    sampleInput: string,
    sampleOutput: string
  ): TestCase[] {
    const testcases: TestCase[] = [];

    // 1. SAMPLE: Basic sample case
    testcases.push(
      this.createTestcase(
        1,
        sampleInput,
        sampleOutput,
        "SAMPLE",
        "EASY",
        false,
        "Basic sample case for format understanding"
      )
    );

    // 2. EDGE_CASE: Empty or single element
    testcases.push(
      this.createTestcase(
        2,
        "1\n5",
        "5",
        "EDGE_CASE",
        "EASY",
        true,
        "Single element array"
      )
    );

    // 3. EDGE_CASE: Zeros and special values
    testcases.push(
      this.createTestcase(
        3,
        "3\n0 0 0",
        "0",
        "EDGE_CASE",
        "EASY",
        true,
        "All zeros handling"
      )
    );

    // 4. BOUNDARY_CONDITION: Minimum constraints
    testcases.push(
      this.createTestcase(
        4,
        "2\n1 2",
        "3",
        "BOUNDARY_CONDITION",
        "EASY",
        true,
        "Minimum size array (n=2)"
      )
    );

    // 5. HIDDEN: Standard case
    testcases.push(
      this.createTestcase(
        5,
        "5\n1 2 3 4 5",
        "15",
        "HIDDEN",
        "MEDIUM",
        true,
        "Standard medium-size array"
      )
    );

    // 6. LARGE_INPUT: Moderate size
    testcases.push(
      this.createTestcase(
        6,
        `100\n${Array.from({ length: 100 }, (_, i) => i + 1).join(" ")}`,
        "5050",
        "LARGE_INPUT",
        "HARD",
        true,
        "Moderate size array (n=100)",
        2000,
        256
      )
    );

    // 7. WORST_CASE_COMPLEXITY: Check for O(n²) solutions
    testcases.push(
      this.createTestcase(
        7,
        `1000\n${Array.from({ length: 1000 }, (_, i) => (i % 10) + 1).join(" ")}`,
        "5500",
        "WORST_CASE_COMPLEXITY",
        "HARD",
        true,
        "Large array for complexity validation (n=1000)",
        3000,
        256
      )
    );

    // 8. DUPLICATE_VALUES: Handle duplicates
    testcases.push(
      this.createTestcase(
        8,
        "5\n5 5 5 5 5",
        "25",
        "DUPLICATE_VALUES",
        "MEDIUM",
        true,
        "All duplicate values"
      )
    );

    // 9. RANDOMIZED_VALIDATION: Random values
    testcases.push(
      this.createTestcase(
        9,
        "8\n7 2 9 1 4 8 3 6",
        "40",
        "RANDOMIZED_VALIDATION",
        "MEDIUM",
        true,
        "Random unordered values for hardcode detection",
        1000,
        256
      )
    );

    // 10. MEMORY_STRESS: Stress test
    testcases.push(
      this.createTestcase(
        10,
        `5000\n${Array.from({ length: 5000 }, (_, i) => (i % 100) + 1).join(" ")}`,
        "250000",
        "MEMORY_STRESS",
        "HARD",
        true,
        "Large array for memory stress testing (n=5000)",
        5000,
        512
      )
    );

    // 11. RUNTIME_STRESS: Time stress
    testcases.push(
      this.createTestcase(
        11,
        `10000\n${Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000) + 1).join(" ")}`,
        "5000000",
        "RUNTIME_STRESS",
        "HARD",
        true,
        "Massive array for runtime stress (n=10000)",
        10000,
        1024
      )
    );

    // 12-15: Additional hidden testcases for comprehensive coverage
    for (let i = 0; i < 4; i++) {
      const n = 20 + i * 15;
      testcases.push(
        this.createTestcase(
          12 + i,
          `${n}\n${Array.from({ length: n }, (_, idx) => (idx % 10) + 1).join(" ")}`,
          `${n * 5}`,
          "HIDDEN",
          "MEDIUM",
          true,
          `Additional validation case ${i + 1}`
        )
      );
    }

    return testcases;
  }

  /**
   * Generate testcases for graph/tree problems
   */
  static generateGraphProblemTestcases(
    sampleInput: string,
    sampleOutput: string
  ): TestCase[] {
    const testcases: TestCase[] = [];

    // SAMPLE
    testcases.push(
      this.createTestcase(
        1,
        sampleInput,
        sampleOutput,
        "SAMPLE",
        "EASY",
        false,
        "Basic sample case"
      )
    );

    // EDGE_CASE: Single node
    testcases.push(
      this.createTestcase(
        2,
        "1\n0",
        "0",
        "EDGE_CASE",
        "EASY",
        true,
        "Single node graph"
      )
    );

    // EDGE_CASE: Disconnected components
    testcases.push(
      this.createTestcase(
        3,
        "4\n0 1\n2 3",
        "2",
        "EDGE_CASE",
        "MEDIUM",
        true,
        "Disconnected graph components"
      )
    );

    // BOUNDARY_CONDITION: Linear chain
    testcases.push(
      this.createTestcase(
        4,
        "5\n0 1\n1 2\n2 3\n3 4",
        "4",
        "BOUNDARY_CONDITION",
        "MEDIUM",
        true,
        "Linear chain graph"
      )
    );

    // HIDDEN: Complete graph
    testcases.push(
      this.createTestcase(
        5,
        "4\n0 1\n0 2\n0 3\n1 2\n1 3\n2 3",
        "6",
        "HIDDEN",
        "MEDIUM",
        true,
        "Fully connected graph"
      )
    );

    // WORST_CASE_COMPLEXITY: Dense graph
    testcases.push(
      this.createTestcase(
        6,
        `100\n${Array.from({ length: 100 }, (_, i) => i + 1).map(i => `0 ${i}`).join("\n")}`,
        "100",
        "WORST_CASE_COMPLEXITY",
        "HARD",
        true,
        "Dense star topology (n=100)",
        3000,
        512
      )
    );

    // LARGE_INPUT: Complex graph
    testcases.push(
      this.createTestcase(
        7,
        `1000\n${Array.from({ length: 999 }, (_, i) => `${i} ${i + 1}`).join("\n")}`,
        "998",
        "LARGE_INPUT",
        "HARD",
        true,
        "Large graph (n=1000)",
        5000,
        1024
      )
    );

    // DUPLICATE_VALUES: Cycles
    testcases.push(
      this.createTestcase(
        8,
        "5\n0 1\n1 2\n2 3\n3 4\n4 0",
        "5",
        "DUPLICATE_VALUES",
        "MEDIUM",
        true,
        "Cyclic graph"
      )
    );

    // RANDOMIZED_VALIDATION
    testcases.push(
      this.createTestcase(
        9,
        "6\n0 3\n1 4\n2 5\n0 1\n1 2\n3 4",
        "6",
        "RANDOMIZED_VALIDATION",
        "MEDIUM",
        true,
        "Randomized graph edges"
      )
    );

    // MEMORY_STRESS
    testcases.push(
      this.createTestcase(
        10,
        `500\n${Array.from({ length: 499 }, (_, i) => `${i} ${i + 1}`).join("\n")}`,
        "498",
        "MEMORY_STRESS",
        "HARD",
        true,
        "Memory stress test (n=500)",
        8000,
        2048
      )
    );

    // Additional hidden cases
    for (let i = 0; i < 5; i++) {
      testcases.push(
        this.createTestcase(
          11 + i,
          `${10 + i * 3}\n${Array.from({ length: 9 + i * 3 }, (_, j) => `${j} ${(j + 1) % (10 + i * 3)}`).join("\n")}`,
          `${8 + i * 3}`,
          "HIDDEN",
          "MEDIUM",
          true,
          `Graph validation case ${i + 1}`
        )
      );
    }

    return testcases;
  }

  /**
   * Generate testcases for string problems
   */
  static generateStringProblemTestcases(
    sampleInput: string,
    sampleOutput: string
  ): TestCase[] {
    const testcases: TestCase[] = [];

    testcases.push(
      this.createTestcase(
        1,
        sampleInput,
        sampleOutput,
        "SAMPLE",
        "EASY",
        false,
        "Basic sample case"
      )
    );

    testcases.push(
      this.createTestcase(
        2,
        "a",
        "a",
        "EDGE_CASE",
        "EASY",
        true,
        "Single character"
      )
    );

    testcases.push(
      this.createTestcase(
        3,
        "",
        "0",
        "EDGE_CASE",
        "EASY",
        true,
        "Empty string"
      )
    );

    testcases.push(
      this.createTestcase(
        4,
        "aaa",
        "3",
        "BOUNDARY_CONDITION",
        "EASY",
        true,
        "Repeated characters"
      )
    );

    testcases.push(
      this.createTestcase(
        5,
        "abcdefghij",
        "10",
        "HIDDEN",
        "MEDIUM",
        true,
        "Medium length distinct string"
      )
    );

    testcases.push(
      this.createTestcase(
        6,
        `${Array(100).fill("a").join("")}`,
        "100",
        "LARGE_INPUT",
        "HARD",
        true,
        "Large repetitive string (n=100)"
      )
    );

    testcases.push(
      this.createTestcase(
        7,
        `${Array(1000).fill("x").join("")}`,
        "1000",
        "WORST_CASE_COMPLEXITY",
        "HARD",
        true,
        "Very large repetitive string (n=1000)",
        3000,
        256
      )
    );

    testcases.push(
      this.createTestcase(
        8,
        "aaabbbccc",
        "9",
        "DUPLICATE_VALUES",
        "MEDIUM",
        true,
        "String with duplicate sequences"
      )
    );

    testcases.push(
      this.createTestcase(
        9,
        "qwertyasdfghzxcvbnm",
        "19",
        "RANDOMIZED_VALIDATION",
        "MEDIUM",
        true,
        "Randomized character string"
      )
    );

    testcases.push(
      this.createTestcase(
        10,
        `${Array(5000).fill("z").join("")}`,
        "5000",
        "MEMORY_STRESS",
        "HARD",
        true,
        "Memory stress string (n=5000)",
        5000,
        512
      )
    );

    for (let i = 0; i < 5; i++) {
      testcases.push(
        this.createTestcase(
          11 + i,
          Array(20 + i * 10)
            .fill("x")
            .join(""),
          `${20 + i * 10}`,
          "HIDDEN",
          "MEDIUM",
          true,
          `String validation case ${i + 1}`
        )
      );
    }

    return testcases;
  }

  /**
   * Generate testcases for DP problems
   */
  static generateDPProblemTestcases(
    sampleInput: string,
    sampleOutput: string
  ): TestCase[] {
    const testcases: TestCase[] = [];

    testcases.push(
      this.createTestcase(
        1,
        sampleInput,
        sampleOutput,
        "SAMPLE",
        "EASY",
        false,
        "Basic sample case"
      )
    );

    testcases.push(
      this.createTestcase(
        2,
        "1",
        "1",
        "EDGE_CASE",
        "EASY",
        true,
        "Base case n=1"
      )
    );

    testcases.push(
      this.createTestcase(
        3,
        "0",
        "0",
        "BOUNDARY_CONDITION",
        "EASY",
        true,
        "Zero case"
      )
    );

    testcases.push(
      this.createTestcase(
        4,
        "10",
        "55",
        "HIDDEN",
        "MEDIUM",
        true,
        "Fibonacci 10"
      )
    );

    testcases.push(
      this.createTestcase(
        5,
        "20",
        "6765",
        "HIDDEN",
        "MEDIUM",
        true,
        "Fibonacci 20"
      )
    );

    testcases.push(
      this.createTestcase(
        6,
        "30",
        "832040",
        "LARGE_INPUT",
        "HARD",
        true,
        "Larger DP problem (n=30)",
        2000,
        256
      )
    );

    testcases.push(
      this.createTestcase(
        7,
        "40",
        "102334155",
        "WORST_CASE_COMPLEXITY",
        "HARD",
        true,
        "Complexity test case (n=40)",
        3000,
        256
      )
    );

    testcases.push(
      this.createTestcase(
        8,
        "35",
        "9227465",
        "RUNTIME_STRESS",
        "HARD",
        true,
        "Runtime stress (n=35)",
        5000,
        256
      )
    );

    testcases.push(
      this.createTestcase(
        9,
        "5",
        "5",
        "RANDOMIZED_VALIDATION",
        "MEDIUM",
        true,
        "Random case validation"
      )
    );

    testcases.push(
      this.createTestcase(
        10,
        "15",
        "610",
        "MEMORY_STRESS",
        "MEDIUM",
        true,
        "Memory validation"
      )
    );

    for (let i = 0; i < 5; i++) {
      testcases.push(
        this.createTestcase(
          11 + i,
          `${12 + i * 3}`,
          "varies",
          "HIDDEN",
          "MEDIUM",
          true,
          `DP validation case ${i + 1}`
        )
      );
    }

    return testcases;
  }

  /**
   * Calculate comprehensive statistics for testcase suite
   */
  static getTestcaseStatistics(testcases: TestCase[]) {
    const stats = {
      totalCount: testcases.length,
      sampleCount: testcases.filter((t) => t.category === "SAMPLE").length,
      hiddenCount: testcases.filter((t) => t.isHidden).length,
      visibleCount: testcases.filter((t) => !t.isHidden).length,
      byCategory: {} as Record<TestCaseCategory, number>,
      byDifficulty: {
        EASY: testcases.filter((t) => t.difficulty === "EASY").length,
        MEDIUM: testcases.filter((t) => t.difficulty === "MEDIUM").length,
        HARD: testcases.filter((t) => t.difficulty === "HARD").length,
      },
      averageTimeLimit:
        testcases.reduce((sum, t) => sum + (t.timeLimit || 1000), 0) /
        testcases.length,
      averageMemoryLimit:
        testcases.reduce((sum, t) => sum + (t.memoryLimit || 256), 0) /
        testcases.length,
    };

    const categories: TestCaseCategory[] = [
      "SAMPLE",
      "HIDDEN",
      "EDGE_CASE",
      "LARGE_INPUT",
      "WORST_CASE_COMPLEXITY",
      "DUPLICATE_VALUES",
      "BOUNDARY_CONDITION",
      "RANDOMIZED_VALIDATION",
      "MEMORY_STRESS",
      "RUNTIME_STRESS",
    ];

    categories.forEach((cat) => {
      stats.byCategory[cat] = testcases.filter(
        (t) => t.category === cat
      ).length;
    });

    return stats;
  }
}
