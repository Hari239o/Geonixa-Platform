# Randomization & Execution Specification

This document outlines required behavior for the online judge randomization engine, execution engine, and error reporting.

1) Randomization Engine
- Each student session receives a permutation of the 20-question set. Use cryptographically seeded RNG (server-side) tied to student-id + session-id + timestamp to avoid repetition.
- For each selected question, the judge picks a subset of visible testcases (>=3) and generates a set of hidden testcases (>=7) drawn from the question's testcase pool and parameterized generators.
- Difficulty balancing: ensure each student sees at least 6 very-hard problems and at most 10 ultra-hard; tune by tagging questions with weight.
- Repeat suppression: same exact question instance (including randomized parameters) must not repeat for the same student within last 90 days.

2) Execution Engine
- Support languages: Java (OpenJDK 17), Python 3.10+, C++17, Node 16+.
- Per submission: compile step (if applicable), run in sandbox with CPU time limit (e.g., 2s-5s per test), memory limit (e.g., 512MB). Multiple testcases run sequentially with aggregated time measurement.
- Resource tracking: measure per-test execution time and peak memory. Fail on TLE or MLE.
- Runtime environment: isolate filesystem, no network, no child process spawning.
- Deterministic seeds: where tests require RNG, seeds are provided by judge.

3) Testcase Management
- Visible tests: show input and expected output for sample tests only (3-5 samples).
- Hidden tests: judge stores canonical outputs; not revealed. Student only sees which tests failed and differences.
- Stress tests: include large randomized inputs to validate performance.

4) Error Reporting
- On failure, student sees:
  - Compilation errors (full compiler output)
  - Runtime errors (stack trace)
  - Failed testcase details: input, expected output, actual output, time used, memory used
  - TLE / MLE messages with limits
- Do not reveal hidden testcases inputs or outputs but reveal their index and whether they passed.

5) Security & Anti-cheat
- Watermark test inputs per student (small parameter perturbations) to catch hard-coded answers.
- Rate limit submissions and randomize hidden test order to reduce overfitting.

6) Acceptance Criteria
- A submission accepted only if all testcases (visible + hidden) pass within limits.

7) Integration Notes
- Provide endpoints: /getAssignment, /submitSolution, /getResult
- /getAssignment returns question meta, language templates, and visible tests only.
- /submitSolution uploads code and requested language; returns run-id. /getResult returns detailed run results per test.

This spec is a blueprint; implementers should adapt to infra constraints and compliance.
