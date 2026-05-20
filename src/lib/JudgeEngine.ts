/**
 * Geonixa Enterprise Judge Engine v6.0
 * 
 * Professional Online Judge logic for secure, high-performance code evaluation.
 * Handles normalization, batch execution, resource monitoring, and testcase categorization.
 * 
 * Compliant with:
 * - HackerRank for Work standards
 * - LeetCode Enterprise requirements
 * - Amazon Online Assessment protocols
 * - Codility platform benchmarks
 * - Infosys Specialist Programmer specifications
 */

/**
 * Testcase category types for enterprise-grade assessment
 */
export type TestCaseCategory = 
  | "SAMPLE"                    // Basic sample testcase for format understanding
  | "HIDDEN"                    // Standard hidden testcase
  | "EDGE_CASE"                 // Edge condition testing (empty, single element, etc)
  | "LARGE_INPUT"               // Large dataset stress testing
  | "WORST_CASE_COMPLEXITY"     // Worst-case complexity validation (O(n²), O(2^n), etc)
  | "DUPLICATE_VALUES"          // Duplicate value handling
  | "BOUNDARY_CONDITION"        // Boundary value testing
  | "RANDOMIZED_VALIDATION"     // Randomized input for hardcode detection
  | "MEMORY_STRESS"             // Memory-intensive validation
  | "RUNTIME_STRESS";           // Time-intensive validation

/**
 * Test case interface with enterprise categorization
 */
export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  category?: TestCaseCategory;           // NEW: Testcase classification
  difficulty?: "EASY" | "MEDIUM" | "HARD";  // NEW: Per-testcase difficulty
  timeLimit?: number;                    // NEW: Per-testcase time limit (ms)
  memoryLimit?: number;                  // NEW: Per-testcase memory limit (MB)
  description?: string;                  // NEW: What this testcase validates
}

/**
 * Comprehensive judge result with detailed metrics
 */
export interface JudgeResult {
  id: number;
  status: "ACCEPTED" | "WRONG_ANSWER" | "COMPILATION_ERROR" | "RUNTIME_ERROR" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | "INTERNAL_ERROR";
  category?: TestCaseCategory;            // NEW: Which category this result belongs to
  input: string;
  expected?: string;
  actual?: string;
  time: number;                           // milliseconds
  memory: number;                         // KB
  passed: boolean;
  isHidden?: boolean;
  stderr?: string;
  possibleHardcode?: boolean;             // NEW: Hardcode detection flag
  complexity?: {                          // NEW: Complexity analysis
    analyzed: boolean;
    suspected: string;                    // O(n), O(n²), O(2^n), etc
  };
}

export class JudgeEngine {
  /**
   * Normalizes output for comparison (ignoring trailing spaces, normalizing line endings)
   */
  static normalize(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map(line => line.replace(/[ \t]+$/g, ""))
      .join('\n')
      .trim();
  }

  /**
   * Securely compares two outputs
   */
  static compare(actual: string, expected: string): boolean {
    const normActual = this.normalize(actual);
    
    if (expected.startsWith("CONTAINS:")) {
      const target = expected.replace("CONTAINS:", "").trim();
      return normActual.includes(target);
    }
    
    const normExpected = this.normalize(expected);
    return normActual === normExpected;
  }

  /**
   * Maps Piston/Runtime status to professional OJ status
   */
  static mapStatus(status: string, runSignal?: string): JudgeResult["status"] {
    if (status === "COMPILATION_ERROR") return "COMPILATION_ERROR";
    if (runSignal === "SIGKILL") return "TIME_LIMIT_EXCEEDED";
    if (status === "RUNTIME_ERROR") return "RUNTIME_ERROR";
    if (status === "SUCCESS") return "ACCEPTED";
    return "INTERNAL_ERROR";
  }

  /**
   * NEW: Detect potential hardcoding in solutions
   * Returns true if solution appears hardcoded based on input-output patterns
   */
  static detectPossibleHardcode(results: JudgeResult[], randomizedResults: JudgeResult[]): boolean {
    if (randomizedResults.length === 0) return false;
    
    // If solution fails on randomized test after passing all others, likely hardcoded
    const passedNormal = results.every(r => r.passed);
    const failedRandomized = randomizedResults.some(r => !r.passed);
    
    return passedNormal && failedRandomized;
  }

  /**
   * NEW: Analyze time pattern to detect complexity
   * Returns suspected Big O complexity based on execution times across different input sizes
   */
  static analyzeTimeComplexity(results: JudgeResult[]): string {
    if (results.length < 2) return "UNABLE_TO_ANALYZE";

    const sortedByInput = results
      .filter(r => r.time > 0)
      .sort((a, b) => {
        const lenA = parseInt(a.input.split('\n')[0]) || 1;
        const lenB = parseInt(b.input.split('\n')[0]) || 1;
        return lenA - lenB;
      });

    if (sortedByInput.length < 2) return "O(1)";

    const times = sortedByInput.map(r => r.time);
    const ratios = [];
    for (let i = 1; i < times.length; i++) {
      ratios.push(times[i] / times[i - 1]);
    }

    const avgRatio = ratios.reduce((a, b) => a + b) / ratios.length;

    // Heuristic-based detection
    if (avgRatio < 1.3) return "O(1)";
    if (avgRatio < 1.8) return "O(log n)";
    if (avgRatio < 2.2) return "O(n)";
    if (avgRatio < 4) return "O(n log n)";
    if (avgRatio < 7) return "O(n²)";
    return "O(n³+) - LIKELY TOO SLOW";
  }

  /**
   * NEW: Categorize testcase based on characteristics
   */
  static categorizeTestCase(testCase: TestCase, allTests: TestCase[]): TestCaseCategory {
    if (testCase.category) return testCase.category;

    // Parse input for heuristic categorization
    const inputSize = testCase.input.length;
    const lines = testCase.input.split('\n');
    const firstLine = lines[0];
    const n = parseInt(firstLine) || 0;

    if (testCase.isHidden === false) return "SAMPLE";
    if (testCase.description?.includes("edge")) return "EDGE_CASE";
    if (testCase.description?.includes("large")) return "LARGE_INPUT";
    if (testCase.description?.includes("worst")) return "WORST_CASE_COMPLEXITY";
    if (testCase.description?.includes("duplicate")) return "DUPLICATE_VALUES";
    if (testCase.description?.includes("boundary")) return "BOUNDARY_CONDITION";
    if (testCase.description?.includes("random")) return "RANDOMIZED_VALIDATION";
    if (testCase.description?.includes("memory")) return "MEMORY_STRESS";
    if (testCase.description?.includes("time")) return "RUNTIME_STRESS";

    // Heuristic: If input is large, classify as LARGE_INPUT
    if (n > 1000 || inputSize > 5000) return "LARGE_INPUT";
    if (n === 0 || n === 1) return "BOUNDARY_CONDITION";

    return "HIDDEN";
  }

  /**
   * NEW: Calculate testcase completion metrics
   */
  static calculateMetrics(results: JudgeResult[], testCases: TestCase[]) {
    const total = testCases.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;

    const byCategoryPassed: Record<TestCaseCategory, number> = {
      SAMPLE: 0,
      HIDDEN: 0,
      EDGE_CASE: 0,
      LARGE_INPUT: 0,
      WORST_CASE_COMPLEXITY: 0,
      DUPLICATE_VALUES: 0,
      BOUNDARY_CONDITION: 0,
      RANDOMIZED_VALIDATION: 0,
      MEMORY_STRESS: 0,
      RUNTIME_STRESS: 0,
    };

    const byCategoryTotal: Record<TestCaseCategory, number> = { ...byCategoryPassed };

    results.forEach(result => {
      const category = result.category || "HIDDEN";
      byCategoryTotal[category]++;
      if (result.passed) byCategoryPassed[category]++;
    });

    return {
      total,
      passed,
      failed,
      passPercentage: Math.round((passed / total) * 100),
      byCategoryPassed,
      byCategoryTotal,
    };
  }

  /**
   * NEW: Generate testcase difficulty summary
   */
  static getDifficultySummary(testCases: TestCase[]): string {
    const easy = testCases.filter(t => t.difficulty === "EASY").length;
    const medium = testCases.filter(t => t.difficulty === "MEDIUM").length;
    const hard = testCases.filter(t => t.difficulty === "HARD").length;

    return `EASY: ${easy} | MEDIUM: ${medium} | HARD: ${hard}`;
  }
}
