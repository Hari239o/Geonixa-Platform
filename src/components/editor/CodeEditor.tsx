"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";
import {
  Play, RotateCcw, Terminal, ShieldCheck, Loader2, CheckCircle2, Check,
  XCircle, Code2, Cpu, Copy, Download, Maximize2, Palette, AlertCircle, Clock, Zap
} from "lucide-react";
import axios from "axios";

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
  initialCode: string;
  language: string;
  testCases: TestCase[];
  initialResults?: TestResult[];
  onTestsStatusChange?: (passed: boolean) => void;
  onIntegrityCheck?: (code: string, results: TestResult[]) => void;
  onFinalSubmit?: (code: string, results: any[]) => void;
  onUpdate?: (data: { code: string, language: string, results: TestResult[] }) => void;
  onRunMode?: (mode: "RUN" | "SUBMIT") => void; // Added to fix ghost TS error
}

const PISTON_API = "https://emkc.org/api/v2/piston/execute";
const PISTON_FALLBACK = "https://piston.engineer/api/v2/execute";

const LANGUAGE_MAP: Record<string, { name: string, version: string, monaco: string, boilerplate: string }> = {
  javascript: {
    name: "javascript", version: "18.15.0", monaco: "javascript",
    boilerplate: `function solve() {\n    const fs = require('fs');\n    const input = fs.readFileSync(0, 'utf8');\n    // Write your logic here\n}\n\nsolve();`
  },
  python: {
    name: "python", version: "3.10.0", monaco: "python",
    boilerplate: `def solve():\n    import sys\n    input_data = sys.stdin.read().split()\n    # Write your logic here\n\nif __name__ == "__main__":\n    solve()`
  },
  java: {
    name: "java", version: "17.0.6", monaco: "java",
    boilerplate: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your logic here\n    }\n}`
  },
  cpp: {
    name: "cpp", version: "10.2.1", monaco: "cpp",
    boilerplate: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your logic here\n    return 0;\n}`
  },
  c: {
    name: "c", version: "10.2.1", monaco: "c",
    boilerplate: `#include <stdio.h>\n\nint main() {\n    // Write your logic here\n    return 0;\n}`
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
  expected?: string;
  stderr?: string;
}

export default function CodeEditor({ 
  questionId, 
  initialCode, 
  language: initialLanguage, 
  testCases, 
  initialResults = [],
  onTestsStatusChange, 
  onIntegrityCheck, 
  onFinalSubmit,
  onUpdate,
  onRunMode
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState("vs-dark");
  const [activeTab, setActiveTab] = useState<"OUTPUT" | "TESTS" | "DEBUG">("TESTS");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>(initialResults);
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  const editorRef = useRef<any>(null);

  // Auto-save logic with debounce
  useEffect(() => {
    // 1. Load the specific code for THIS language and THIS question
    const currentUser = localStorage.getItem("geonixa_current_user") || "anonymous";
    const savedCode = localStorage.getItem(`geonixa_judge_v3_${questionId}_${selectedLanguage}_code_${currentUser}`);
    
    if (savedCode) {
      setCode(savedCode);
    } else {
      // If no saved code, use boilerplate
      setCode(LANGUAGE_MAP[selectedLanguage]?.boilerplate || "");
    }
  }, [questionId, selectedLanguage]);

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

    monaco.editor.setTheme("geonixa-premium");
  };

  const handleSubmitSolution = async () => {
    if (isRunning || isFinalSubmitting) return;
    
    // Custom Professional Confirmation
    const confirmed = window.confirm("Ready to submit this task? All test cases (including hidden ones) will be evaluated.");
    if (!confirmed) return;

    setIsFinalSubmitting(true);
    setActiveTab("TESTS");
    setTestResults([]);

    try {
      const data = await runBatchTests(code, selectedLanguage, testCases, true);
      const results = data.results || [];
      setTestResults(results);

      const allPassed = results.every((r: any) => r.passed);
      const passedCount = results.filter((r: any) => r.passed).length;
      
      setOutput(allPassed 
        ? "✅ ALL TESTCASES PASSED\n\nYour solution is highly optimized and correct. Progress has been synced to the assessment server." 
        : `❌ SUBMISSION FAILED\n\nScore: ${passedCount}/${results.length} cases passed.\nReview the diagnostics below to identify logic gaps.`);
      setActiveTab("OUTPUT");

      if (onUpdate) {
        onUpdate({ code, language: selectedLanguage, results });
      }
      
      if (onTestsStatusChange) onTestsStatusChange(allPassed);
    } catch (err) {
       alert("Network timeout. Progress saved locally.");
    } finally {
      setIsFinalSubmitting(false);
    }
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
        testCases: tests,
        mode: isFinal ? "SUBMIT" : "RUN"
      }, {
        timeout: 60000
      });
      
      return response.data;
    } catch (err: any) {
      console.error("Batch execution failed:", err);
      return {
        error: "Execution engine unreachable. Retrying...",
        status: "SYSTEM_FAILURE"
      };
    }
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveTab("TESTS");
    setOutput("Initializing sandboxed execution environment...");
    setTestResults([]);

    try {
      const visibleTests = testCases.filter(t => !t.isHidden);
      const data = await runBatchTests(code, selectedLanguage, visibleTests, false);
      
      if (data.error) {
        setOutput(`⚠ COMPILER ERROR:\n\n${data.error}`);
        setActiveTab("OUTPUT");
        return;
      }

      const results = data.results || [];
      setTestResults(results);
      setActiveTestIndex(0);
      
      const allPassed = results.length > 0 && results.every((r: any) => r.passed);
      setOutput(allPassed 
        ? "✅ Sample Testcases Passed\n\nProceed to submit your code to validate against hidden enterprise testcases." 
        : "❌ Wrong Answer\n\nYour output did not match the expected result for one or more sample cases.");
      
      setActiveTab("TESTS");
      
      if (data.results?.[0]) {
        setExecTime(data.results[0].time);
        setMemoryUsage(data.results[0].memory);
      }
    } catch (err) {
      setOutput("⚠ Execution System Offline. Progress is saved locally.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunTests = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveTab("TESTS");

    try {
      const { results, summary } = await runBatchTests(code, selectedLanguage, testCases);
      if (!results || results.length === 0) {
        setOutput("Execution returned no results. Check your code logic.");
        setActiveTab("OUTPUT");
        return;
      }
      setTestResults(results);
      if (onIntegrityCheck) onIntegrityCheck(code, results);
      if (onTestsStatusChange) onTestsStatusChange(summary?.status === "ACCEPTED");
    } catch (err) {
      console.error("Critical test runner failure:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (confirm("Restore boilerplate code for this language? Current changes will be lost.")) {
      setCode(LANGUAGE_MAP[selectedLanguage]?.boilerplate || initialCode);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] rounded-2xl overflow-hidden border border-[#30363d] shadow-2xl transition-all">
      <style>{`
        .monaco-editor .margin { background-color: #0d1117 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #010409; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #58a6ff; }
      `}</style>

      <div className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#58a6ff]">
            <Cpu size={18} fill="currentColor" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">ASSESSMENT CORE v4.0</span>
          </div>

          <div className="h-6 w-[1px] bg-[#30363d]" />

          <div className="flex items-center gap-3">
            <Code2 size={14} className="text-slate-500" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-[#c9d1d9] text-[11px] font-black outline-none cursor-pointer uppercase tracking-wider"
            >
              {Object.keys(LANGUAGE_MAP).map(lang => (
                <option key={lang} value={lang} className="bg-[#0d1117]">{lang.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigator.clipboard.writeText(code)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Copy Code"><Copy size={16} /></button>
          <button onClick={handleReset} className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all" title="Reset Boilerplate"><RotateCcw size={16} /></button>
          <div className="h-6 w-[1px] bg-[#30363d] mx-2" />

          <button
            onClick={handleRunCode}
            disabled={isRunning || isFinalSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-[#161b22] hover:bg-[#1c2128] text-[#58a6ff] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#30363d] disabled:opacity-50 transition-all active:scale-95"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
            Run Code
          </button>

          <button
            onClick={handleRunTests}
            disabled={isRunning || isFinalSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all border border-slate-700 active:scale-95 shadow-lg"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
            Test Suite
          </button>

          <div className="w-[1px] h-6 bg-[#30363d] mx-2" />

          <button
            onClick={handleSubmitSolution}
            disabled={isRunning || isFinalSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all border border-emerald-400/50 active:scale-95"
          >
            {isFinalSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            Submit Solution
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-[2] relative border-r border-[#30363d]">
          <Editor
            height="100%"
            language={LANGUAGE_MAP[selectedLanguage]?.monaco || "javascript"}
            theme={theme}
            value={code}
            onChange={(v) => setCode(v || "")}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              renderLineHighlight: "all",
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
              letterSpacing: 0.5,
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
        </div>

        <div className="flex-1 flex flex-col bg-[#010409]">
          <div className="flex border-b border-[#30363d]">
            {["TESTS", "OUTPUT"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-[#58a6ff] bg-[#161b22] border-b-2 border-[#58a6ff]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === "TESTS" && (
              <div className="p-0 h-full flex flex-col bg-[#0d1117]">
                <div className="flex items-center gap-1 p-2 bg-[#161b22] border-b border-[#30363d]">
                  {testCases.filter(t => !t.isHidden).map((test, idx) => (
                    <button
                      key={test.id}
                      onClick={() => setActiveTestIndex(idx)}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        activeTestIndex === idx 
                          ? "bg-[#21262d] text-white shadow-lg" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Case {idx}
                      {testResults[idx] && (
                        <div className={`w-1.5 h-1.5 rounded-full ${testResults[idx].passed ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                  {!testResults.length ?
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-4 text-blue-500">
                        <Play size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-300">Run your code to see results</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-[200px]">We'll validate your solution against {testCases.filter(t => !t.isHidden).length} sample testcases.</p>
                    </div>
                  :
                    <div className="space-y-6 animate-fade-in">
                      {/* Summary Status */}
                      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                        testResults.every(r => r.passed) 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      }`}>
                        <div className="flex items-center gap-3">
                          {testResults.every(r => r.passed) ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                          <span className="text-[11px] font-black uppercase tracking-widest">
                            {testResults.every(r => r.passed) ? "Sample Testcases Passed" : "Wrong Answer"}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                          {testResults.filter(r => r.passed).length}/{testResults.length} Cases
                        </span>
                      </div>

                      {/* Detailed View */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${
                            testResults[activeTestIndex]?.passed ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            {testResults[activeTestIndex]?.status === "ACCEPTED" ? "Success" : 
                             testResults[activeTestIndex]?.status === "WRONG_ANSWER" ? "Mismatch" : 
                             testResults[activeTestIndex]?.status || "Error"}
                          </h3>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                              <Clock size={10} /> {testResults[activeTestIndex]?.time || 0}ms
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                              <Cpu size={10} /> {testResults[activeTestIndex]?.memory ? Math.round(testResults[activeTestIndex].memory / 1024) : 0}KB
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Input</label>
                            <pre className="p-3 bg-[#161b22] rounded-xl text-[11px] font-mono text-slate-300 border border-[#30363d] overflow-x-auto">
                              {testResults[activeTestIndex]?.input || testCases.filter(t => !t.isHidden)[activeTestIndex]?.input}
                            </pre>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Expected Output</label>
                              <pre className="p-3 bg-emerald-500/5 rounded-xl text-[11px] font-mono text-emerald-500/80 border border-emerald-500/10">
                                {testResults[activeTestIndex]?.expected || testCases.filter(t => !t.isHidden)[activeTestIndex]?.expectedOutput}
                              </pre>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Your Output</label>
                              <pre className={`p-3 rounded-xl text-[11px] font-mono border ${
                                testResults[activeTestIndex]?.passed 
                                  ? 'bg-emerald-500/5 text-emerald-400/80 border-emerald-500/10' 
                                  : 'bg-rose-500/5 text-rose-400/80 border-rose-500/10'
                              }`}>
                                {testResults[activeTestIndex]?.actual || (testResults[activeTestIndex]?.stderr ? "Error in execution" : "No output")}
                              </pre>
                            </div>
                          </div>

                          {testResults[activeTestIndex]?.stderr && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-rose-500/50">Error Stream</label>
                              <pre className="p-4 bg-rose-500/5 rounded-xl font-mono text-[11px] text-rose-400 border border-rose-500/10 whitespace-pre-wrap">
                                {testResults[activeTestIndex].stderr}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            )}

            {activeTab === "OUTPUT" && (
              <div className="p-6 h-full overflow-auto custom-scrollbar bg-[#0d1117]">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <Terminal size={14} /> System Diagnostics
                   </h3>
                   <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Terminal v4.2 Stable</span>
                </div>
                
                <div className="space-y-6">
                  {output ? (
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-2 text-emerald-500/40 mb-3 select-none">
                         <span className="text-xs">➜</span>
                         <span className="text-[9px] font-black uppercase tracking-widest">process.stdout</span>
                      </div>
                      <pre className="font-mono text-[12px] text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/40 p-5 rounded-2xl border border-white/5 shadow-2xl">
                        {output}
                      </pre>
                      <div className="mt-6 flex justify-between items-center opacity-50">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" />
                           {output.includes("Retrying") ? "Execution in progress..." : "Process exited successfully"}
                        </span>
                        {execTime && <span className="text-[10px] font-bold text-slate-500 italic tracking-tighter">Wall Time: {execTime}ms</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-700 space-y-4">
                      <Terminal size={32} strokeWidth={1} className="opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Listener waiting for execution stream...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-10 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between px-6">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
                <ShieldCheck size={12} className="text-emerald-500" /> Secure Environment
              </div>
              {execTime && (
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
                  <Clock size={12} /> {execTime}ms
                </div>
              )}
            </div>
            <div className="flex items-center gap-6">
               <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Geonixa Core Engine</div>
               <button
                 onClick={handleSubmitSolution}
                 disabled={isRunning || isFinalSubmitting}
                 className="h-7 px-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
               >
                 {isFinalSubmitting ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                 <span className="text-[9px] font-black uppercase tracking-widest">Submit Solution</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
