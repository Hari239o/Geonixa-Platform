import { NextResponse } from 'next/server';
import { JudgeEngine, TestCase, JudgeResult } from '@/lib/JudgeEngine';

const MIRRORS = [
  "https://emkc.org/api/v2/piston/execute",
  "https://piston.engineer/api/v2/execute",
  "https://api.piston.dev/v2/execute"
];

const LANG_MAP: Record<string, string> = {
  "cpp": "cpp",
  "c": "c",
  "python": "python",
  "javascript": "javascript",
  "java": "java"
};

/**
 * Enterprise Execution Handler
 * Supports single-run (visible) and batch-run (all tests)
 */
export async function POST(req: Request) {
  try {
    const { code, language, testCases, mode } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const pistonLang = LANG_MAP[language] || language;
    const results: JudgeResult[] = [];

    // Mode: 'RUN' executes only provided testCases
    // Mode: 'SUBMIT' would ideally fetch from DB/pool, but for now we process what's sent
    // in a batch to minimize round trips.
    
    for (const test of testCases as TestCase[]) {
      let testResult: JudgeResult = {
        id: test.id,
        status: "INTERNAL_ERROR",
        input: test.input,
        passed: false,
        time: 0,
        memory: 0
      };

      let mirrorAttempt = 0;
      let executedSuccessfully = false;

      while (mirrorAttempt < MIRRORS.length && !executedSuccessfully) {
        const mirror = MIRRORS[mirrorAttempt];
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(mirror, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              language: pistonLang,
              version: "*",
              files: [{ content: code }],
              stdin: test.input,
              compile_timeout: 10000,
              run_timeout: 5000,
              memory_limit: 128 * 1024 * 1024
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) throw new Error(`HTTP_${response.status}`);

          const data = await response.json();
          const run = data.run || {};
          const compile = data.compile || { code: 0 };

          if (compile.code !== 0 && compile.code !== undefined) {
            testResult.status = "COMPILATION_ERROR";
            testResult.stderr = (compile.stderr || compile.output).trim();
            executedSuccessfully = true;
            break; 
          }

          const stdout = (run.stdout || "").trim();
          const stderr = (run.stderr || "").trim();
          const isCorrect = JudgeEngine.compare(stdout, test.expectedOutput);
          
          testResult = {
            ...testResult,
            status: isCorrect ? "ACCEPTED" : (run.code !== 0 ? "RUNTIME_ERROR" : "WRONG_ANSWER"),
            actual: stdout,
            expected: test.isHidden ? "[HIDDEN]" : test.expectedOutput,
            passed: isCorrect,
            time: run.time || 0,
            memory: run.memory || 0,
            stderr: stderr
          };

          if (run.signal === "SIGKILL") testResult.status = "TIME_LIMIT_EXCEEDED";

          executedSuccessfully = true;

        } catch (err) {
          clearTimeout(timeoutId);
          mirrorAttempt++;
          if (mirrorAttempt >= MIRRORS.length) {
            testResult.status = "INTERNAL_ERROR";
          }
        }
      }

      results.push(testResult);
      
      // Stop early if compilation error or critical failure to save resources
      if (testResult.status === "COMPILATION_ERROR") break;
    }

    const summary = {
      passed: results.filter(r => r.passed).length,
      total: testCases.length,
      status: results.every(r => r.status === "ACCEPTED") ? "ACCEPTED" : results.find(r => r.status !== "ACCEPTED")?.status || "FAILED"
    };

    return NextResponse.json({ results, summary });

  } catch (error: any) {
    console.error("Critical Execution Error:", error);
    return NextResponse.json({ error: "System failure in execution pipeline", status: "INTERNAL_ERROR" }, { status: 500 });
  }
}
