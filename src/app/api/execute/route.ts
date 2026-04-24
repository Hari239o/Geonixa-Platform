import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: "Missing code or language" }, { status: 400 });
    }

    let finalCode = code;
    if (language === "python" || language === "python3") {
        finalCode = code.replace(/true/g, 'True').replace(/false/g, 'False');
    }

    const versionMap: Record<string, string> = {
      javascript: "18.15.0",
      python: "3.10.0",
      c: "10.2.0",
      cpp: "10.2.0",
      java: "15.0.2",
      csharp: "6.12.0"
    };

    const pistonLang = language === "cpp" ? "c++" : language;
    const version = versionMap[language] || "*";

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: pistonLang,
        version: version,
        files: [{ content: finalCode }]
      })
    });

    const data = await response.json();
    
    let finalOutput = "";
    if (data.compile && data.compile.code !== 0) {
        finalOutput = data.compile.stderr || data.compile.output;
    } else if (data.run) {
        finalOutput = data.run.stderr || data.run.output;
    } else {
        finalOutput = data.message || "Execution Matrix Error";
    }

    return NextResponse.json({ output: finalOutput.trim() || 'No Output' });
  } catch (error) {
    console.error("Execution error", error);
    return NextResponse.json({ error: "Internal Server Error executing code natively." }, { status: 500 });
  }
}
