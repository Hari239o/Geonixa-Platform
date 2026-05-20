/**
 * Geonixa Enterprise Judge Engine v5.0
 * 
 * Professional Online Judge logic for secure, high-performance code evaluation.
 * Handles normalization, batch execution, and resource monitoring.
 */

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface JudgeResult {
  id: number;
  status: "ACCEPTED" | "WRONG_ANSWER" | "COMPILATION_ERROR" | "RUNTIME_ERROR" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | "INTERNAL_ERROR";
  input: string;
  expected?: string;
  actual?: string;
  time: number;
  memory: number;
  passed: boolean;
  stderr?: string;
}

export class JudgeEngine {
  /**
   * Normalizes output for comparison (ignoring trailing spaces, normalizing line endings)
   */
  static normalize(text: string): string {
    return text
      .split('\n')
      .map(line => line.trimEnd())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();
  }

  /**
   * Securely compares two outputs
   */
  static compare(actual: string, expected: string): boolean {
    const normActual = this.normalize(actual);
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
}
