"use client";

import { useState, useEffect } from "react";

interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
}

interface CodeEditorProps {
  initialCode: string;
  language: string;
  testCases: TestCase[];
  onRunMode: (code: string, language: string) => Promise<string>;
  onTestsStatusChange?: (passed: boolean) => void;
}

export default function CodeEditor({ initialCode, language: initialLanguage, testCases, onRunMode, onTestsStatusChange }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  
  const [activeTab, setActiveTab] = useState<"CONSOLE" | "TEST_CASES">("TEST_CASES");
  const [rawOutput, setRawOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  
  const [testResults, setTestResults] = useState<{ id: number, passed: boolean | null, actual: string }[]>(
    testCases.map(t => ({ id: t.id, passed: null, actual: "" }))
  );

  useEffect(() => {
    if (selectedLanguage === "java") {
        setCode(`// Online Java Compiler\n// Use this editor to write, compile and run your Java code online\n\nclass Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`);
    } else if (selectedLanguage === "cpp") {
        setCode(`// Online C++ Compiler\n\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}`);
    } else if (selectedLanguage === "c") {
        setCode(`// Online C Compiler\n\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!");\n    return 0;\n}`);
    } else if (selectedLanguage === "csharp") {
        setCode(`// Online C# Compiler\n\nusing System;\n\nclass HelloWorld {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}`);
    } else if (selectedLanguage === "python" && code.includes("function ")) {
       const strippedLogs = code.replace(/console\.log\(.*\);?/g, "");
       const rep = strippedLogs.replace(/function ([a-zA-Z0-9_]+)\((.*)\) \{[\s\S]*?\}/, "def $1($2):\n    pass").trim();
       setCode(rep);
    } else if (selectedLanguage === "javascript" && code.includes("def ")) {
       const strippedLogs = code.replace(/print\(.*\)/g, "");
       const rep = strippedLogs.replace(/def ([a-zA-Z0-9_]+)\((.*)\):[\s\S]*?pass/, "function $1($2) {\n  \n}").trim();
       setCode(rep);
    }
  }, [selectedLanguage]);

  const handleRunCode = async () => {
    // In HackerRank style, Run Code executes the sample test cases and shows the visual blocks
    await handleSubmitCode();
  };

  const handleSubmitCode = async () => {
    setIsRunning(true);
    setActiveTab("TEST_CASES");

    try {
      const functionMatch = code.match(/(?:function|def)\s+([a-zA-Z0-9_]+)/);
      const functionName = functionMatch ? functionMatch[1] : null;

      // Reset test UI to pending
      setTestResults(testCases.map(t => ({ id: t.id, passed: null, actual: "Running Engine..." })));
      
      let allPassed = true;
      const updatedResults = [];

      for (const tc of testCases) {
         let testCodeSnippet = code;
         
         if (functionName) {
            if (selectedLanguage === "python") {
               testCodeSnippet += `\n\nif __name__ == '__main__':\n    print("----GEONIXA_EVAL----")\n    import json\n    res = ${functionName}(${tc.input.replace(/true/g,"True").replace(/false/g,"False")})\n    print(json.dumps(res))`;
            } else if (selectedLanguage === "javascript") {
               testCodeSnippet += `\n\nconsole.log("----GEONIXA_EVAL----");\nconsole.log(JSON.stringify(${functionName}(${tc.input})));`;
            }
         }

         try {
           const rawExecutionOutput = await onRunMode(testCodeSnippet, selectedLanguage);
           
           let finalTargetOutput = rawExecutionOutput;
           let userStdout = rawExecutionOutput.trim();
           
           if (rawExecutionOutput.includes("----GEONIXA_EVAL----")) {
               const parts = rawExecutionOutput.split("----GEONIXA_EVAL----");
               const candidateLogs = parts[0].trim();
               const evalValue = parts[parts.length - 1].trim();
               
               finalTargetOutput = evalValue;
               
               if (candidateLogs && candidateLogs !== "undefined") {
                  userStdout = `[Diagnostics]:\n${candidateLogs}\n\n[Returned]: ${evalValue}`;
               } else {
                  userStdout = `[Returned]: ${evalValue}`;
               }
            }

           const cleanFormat = (s: string) => (s || "").toString().replace(/\s+/g, "").toLowerCase().replace(/'/g, '"');
           
           const passed = cleanFormat(finalTargetOutput) === cleanFormat(tc.expectedOutput) || cleanFormat(finalTargetOutput).includes(cleanFormat(tc.expectedOutput));
           if(!passed) allPassed = false;

           const currentResult = {
             id: tc.id,
             passed: passed,
             actual: userStdout || "No Retrievable Output"
           };
           updatedResults.push(currentResult);
           
           // Update state dynamically
           setTestResults([...updatedResults, ...testCases.slice(updatedResults.length).map(t => ({ id: t.id, passed: null, actual: "Pending..." }))]);
         } catch(execErr) {
           allPassed = false;
           updatedResults.push({ id: tc.id, passed: false, actual: "Execution Environment Crash" });
           setTestResults([...updatedResults, ...testCases.slice(updatedResults.length).map(t => ({ id: t.id, passed: null, actual: "Pending..." }))]);
         }
      }

      if (onTestsStatusChange) onTestsStatusChange(allPassed);
      
    } catch (err: any) {
      setRawOutput(`Matrix System Failure: ${err.message}`);
      setActiveTab("CONSOLE");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", border: "1px solid var(--border-color)" }}>
      {/* Tools / Header */}
      <div style={{ padding: "0.5rem 1rem", backgroundColor: "var(--card-bg)", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        <select 
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          style={{ padding: "0.4rem 0.8rem", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.9rem", backgroundColor: "var(--card-bg)", color: "var(--text-main)" }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java (class Solution)</option>
          <option value="cpp">C++ (class Solution)</option>
          <option value="c">C</option>
          <option value="csharp">C# (class Solution)</option>
        </select>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button 
            onClick={handleRunCode} 
            disabled={isRunning}
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-main)",
              border: "1px solid var(--border-color)",
              padding: "0.4rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            {isRunning ? "Running..." : "Run Code"}
          </button>
          
          <button 
            onClick={handleSubmitCode} 
            disabled={isRunning}
            style={{
              backgroundColor: "var(--success)",
              color: "white",
              border: "none",
              padding: "0.4rem 1.5rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            {isRunning ? "Evaluating..." : "Submit Code"}
          </button>
        </div>
      </div>

      {/* Editor Space */}
      <div style={{ flex: 1, backgroundColor: "#1e1e1e" }}>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            color: "#d4d4d4",
            fontFamily: "'Courier New', Courier, monospace",
            padding: "1rem",
            border: "none",
            resize: "none",
            outline: "none"
          }}
        />
      </div>

      {/* Terminal / Output Bottom Panel */}
      <div style={{ height: "250px", backgroundColor: "var(--card-bg)", display: "flex", flexDirection: "column", borderTop: "2px solid var(--border-color)" }}>
        
        {/* Output Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", backgroundColor: "#f8fafc" }}>
          <div style={{ padding: "0.5rem 1rem", borderBottom: "2px solid var(--primary-color)", fontWeight: 600, color: "var(--primary-color)" }}>
            Output Console
          </div>
        </div>

        {/* Output Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {testCases.map((tc, index) => {
                const result = testResults.find(r => r.id === tc.id);
                const isPending = result?.passed === null;
                const isSuccess = result?.passed;

                return (
                  <div key={tc.id} style={{ display: "flex", flexDirection: "row", gap: "1.5rem" }}>
                    
                    {/* Left Panel: Test Case Status Button */}
                    <div style={{ width: "200px" }}>
                       <div style={{
                          padding: "1rem", backgroundColor: "#1e293b", color: isPending ? "#cbd5e1" : (isSuccess ? "#22c55e" : "#ef4444"), 
                          fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "4px"
                       }}>
                          {isPending ? "⏳" : (isSuccess ? "✅" : "❌")} Sample Test case {index}
                       </div>
                    </div>

                    {/* Right Panel: HackerRank-style Code Blocks */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      
                      {/* Stdin */}
                      <div>
                         <div style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                            <span>Input (stdin)</span>
                         </div>
                         <div style={{ display: "flex", backgroundColor: "#000", fontFamily: "monospace", color: "#f8fafc", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ backgroundColor: "#1e293b", color: "#64748b", padding: "1rem 0.5rem", textAlign: "right", userSelect: "none" }}>
                               {tc.input.split('\n').map((_, i) => <div key={i}>{i+1}</div>)}
                            </div>
                            <div style={{ padding: "1rem", whiteSpace: "pre-wrap" }}>
                               {tc.input}
                            </div>
                         </div>
                      </div>

                      {/* Stdout */}
                      <div>
                         <div style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                            <span>Your Output (stdout)</span>
                         </div>
                         <div style={{ display: "flex", backgroundColor: "#000", fontFamily: "monospace", color: "#f8fafc", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ backgroundColor: "#1e293b", color: "#64748b", padding: "1rem 0.5rem", textAlign: "right", userSelect: "none" }}>
                               {isPending ? <div>1</div> : (result?.actual || " ").split('\n').map((_, i) => <div key={i}>{i+1}</div>)}
                            </div>
                            <div style={{ padding: "1rem", whiteSpace: "pre-wrap" }}>
                               {isPending ? "Pending Evaluation..." : (result?.actual || "")}
                            </div>
                         </div>
                      </div>

                      {/* Expected */}
                      <div>
                         <div style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                            <span>Expected Output</span>
                         </div>
                         <div style={{ display: "flex", backgroundColor: "#000", fontFamily: "monospace", color: "#f8fafc", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ backgroundColor: "#1e293b", color: "#64748b", padding: "1rem 0.5rem", textAlign: "right", userSelect: "none" }}>
                               {tc.expectedOutput.split('\n').map((_, i) => <div key={i}>{i+1}</div>)}
                            </div>
                            <div style={{ padding: "1rem", whiteSpace: "pre-wrap" }}>
                               {tc.expectedOutput}
                            </div>
                         </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );
}
