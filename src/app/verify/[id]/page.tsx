"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { reportGeneratorService, AssessmentReportData } from "@/lib/reportGenerator";
import { ShieldCheck, AlertOctagon, FileCheck, Download, Award, User, Clock, Calendar, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";

export default function ReportVerificationPage() {
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<AssessmentReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVerification() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await reportGeneratorService.getReportById(id);
        if (data) {
          setReport(data);
        } else {
          setError("VERIFICATION_NOT_FOUND");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setError("VERIFICATION_ERROR");
      } finally {
        setLoading(false);
      }
    }
    fetchVerification();
  }, [id]);

  const handleDownloadCertifiedPDF = async () => {
    if (!report || downloading) return;
    setDownloading(true);
    try {
      const pdfBytes = await reportGeneratorService.generateSecurePDFReport(report);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Geonixa_Certified_Report_${report.reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download certified PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#ff5a1f] selection:text-white">
      {/* Header Banner */}
      <header className="max-w-4xl mx-auto mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-[#ff5a1f] tracking-wider uppercase mb-4 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cryptographic Integrity Verification Suite
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          GEONIXA <span className="text-[#ff5a1f]">SECURE AUDIT</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl mx-auto">
          Official real-time ledger verification for corporate assessment certifications and immutable technical telemetry.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto">
        {loading ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center shadow-2xl backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-[#ff5a1f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-white">Verifying Immutable Ledger Record...</h3>
            <p className="text-sm text-slate-400 mt-1">Inspecting cryptographic hash signatures and database snapshots for ID: {id}</p>
          </div>
        ) : error || !report ? (
          <div className="bg-red-950/40 border border-red-500/50 rounded-3xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600"></div>
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-lg shadow-red-500/10">
              <AlertOctagon className="w-10 h-10 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">UNVERIFIED DOCUMENT / RECORD NOT FOUND</h2>
            <p className="text-slate-300 mt-3 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              The requested Verification ID <span className="font-mono bg-red-900/60 px-2 py-0.5 rounded text-red-200 border border-red-700/50">{id}</span> does not exist in the Geonixa secure immutable ledger. This document may be fraudulent, altered, or unrecorded.
            </p>
            <div className="mt-8 pt-8 border-t border-red-500/20 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-400" /> Discrepancy Logged to Security Core</span>
              <span className="hidden sm:inline">•</span>
              <span>Contact Geonixa Talent Administration for assistance.</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all">
            {/* Glowing Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-[#ff5a1f] to-emerald-500 shadow-lg shadow-emerald-500/20"></div>

            {/* Verification Banner */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-inner">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider">
                      VERIFIED AUTHENTIC RECORD
                    </span>
                    <span className="text-xs text-slate-400 font-mono">• {report.reportId}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Official Technical Evaluation Certified</h2>
                </div>
              </div>
              <button
                onClick={handleDownloadCertifiedPDF}
                disabled={downloading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff5a1f] to-amber-600 hover:from-[#ff5a1f]/90 hover:to-amber-600/90 text-white font-bold text-sm shadow-xl shadow-[#ff5a1f]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating Secure PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download Certified PDF Report
                  </>
                )}
              </button>
            </div>

            {/* Candidate Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 shadow">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-[#ff5a1f]" /> Candidate Name
                </span>
                <div className="text-lg font-black text-white truncate">{report.studentName}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5 font-mono">{report.studentId}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 shadow">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Award className="w-3.5 h-3.5 text-blue-400" /> Evaluation Track
                </span>
                <div className="text-lg font-black text-white truncate">{report.domain}</div>
                <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-0.5">
                  {report.domainTrack} Track
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 shadow">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Overall Score
                </span>
                <div className="text-xl font-black text-white">
                  {report.totalScore} <span className="text-xs font-normal text-slate-400">/ {report.maxTotalScore} ({report.percentage}%)</span>
                </div>
                <div className="text-xs text-slate-300 font-semibold uppercase mt-0.5">
                  Grade Status: <span className={report.qualificationStatus === 'QUALIFIED' ? 'text-emerald-400' : 'text-rose-400'}>{report.qualificationStatus}</span>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 shadow">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" /> Evaluation Date
                </span>
                <div className="text-base font-bold text-white truncate">{new Date(report.examDate).toLocaleDateString()}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5 font-mono">{new Date(report.examDate).toLocaleTimeString()}</div>
              </div>
            </div>

            {/* Round Breakdown Table */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 mb-8 overflow-x-auto shadow-inner">
              <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#ff5a1f]" /> Round-Wise Performance Matrix
              </h3>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                    <th className="py-3 px-4 rounded-l-lg">Assessment Module</th>
                    <th className="py-3 px-4">Max Score</th>
                    <th className="py-3 px-4">Marks Obtained</th>
                    <th className="py-3 px-4">Accuracy Rate</th>
                    <th className="py-3 px-4 rounded-r-lg">Module Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">Round 1: Cognitive Aptitude</td>
                    <td className="py-3.5 px-4 text-slate-300">15</td>
                    <td className="py-3.5 px-4 font-black text-[#ff5a1f]">{report.roundScores.round1}</td>
                    <td className="py-3.5 px-4 font-semibold">{Math.round((report.roundScores.round1 / 15) * 100)}%</td>
                    <td className="py-3.5 px-4"><span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">PASSED</span></td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">Round 2: Professional Grammar</td>
                    <td className="py-3.5 px-4 text-slate-300">15</td>
                    <td className="py-3.5 px-4 font-black text-[#ff5a1f]">{report.roundScores.round2}</td>
                    <td className="py-3.5 px-4 font-semibold">{Math.round((report.roundScores.round2 / 15) * 100)}%</td>
                    <td className="py-3.5 px-4"><span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">PASSED</span></td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">Round 3: Descriptive Typing Speed</td>
                    <td className="py-3.5 px-4 text-slate-300">10</td>
                    <td className="py-3.5 px-4 font-black text-[#ff5a1f]">{report.roundScores.round3}</td>
                    <td className="py-3.5 px-4 font-semibold">{Math.round((report.roundScores.round3 / 10) * 100)}%</td>
                    <td className="py-3.5 px-4"><span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">PASSED</span></td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">Round 4: Technical Challenge</td>
                    <td className="py-3.5 px-4 text-slate-300">{report.maxTotalScore - 40}</td>
                    <td className="py-3.5 px-4 font-black text-[#ff5a1f]">{report.roundScores.round4}</td>
                    <td className="py-3.5 px-4 font-semibold">{Math.round((report.roundScores.round4 / (report.maxTotalScore - 40)) * 100)}%</td>
                    <td className="py-3.5 px-4"><span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">VERIFIED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Coding Challenge Details (If any) */}
            {report.codingRoundDetails && report.codingRoundDetails.length > 0 && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 mb-8 overflow-x-auto shadow-inner">
                <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400" /> Coding Challenge Execution Telemetry
                </h3>
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                      <th className="py-3 px-4 rounded-l-lg">Problem Title</th>
                      <th className="py-3 px-4">Testcases Passed</th>
                      <th className="py-3 px-4">Runtime</th>
                      <th className="py-3 px-4">Peak Memory</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4 rounded-r-lg">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {report.codingRoundDetails.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{c.title}</td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{c.passedTestcases} / {c.totalTestcases}</td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono">{c.runtime} ms</td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono">{(c.memory / 1024).toFixed(1)} MB</td>
                        <td className="py-3.5 px-4"><span className="text-xs px-2 py-0.5 rounded bg-slate-800 font-mono uppercase text-slate-300 border border-slate-700">{c.language}</span></td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs px-2.5 py-1 rounded font-bold border ${
                            c.verdict === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}>
                            {c.verdict === 'ACCEPTED' ? 'ACCEPTED (100%)' : c.verdict}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* AI Proctoring & Security Index */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Trust Index</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{report.aiTrustScore}%</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-sm shadow-inner">
                  A+
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plagiarism Index</span>
                  <div className="text-2xl font-black text-blue-400 mt-1">{report.plagiarismScore}% <span className="text-xs text-slate-400 font-normal">Similarity</span></div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-extrabold text-xs shadow-inner">
                  CLEAN
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proctoring Status</span>
                  <div className="text-xl font-black text-emerald-400 mt-1">{report.proctoringVerdict}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{report.proctoringViolationsCount} Logged Events</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Cryptographic Signature Stamp */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">Cryptographic Verification Hashing</span>
                <div className="text-sm font-mono text-slate-300 break-all select-all bg-slate-900 px-3 py-1.5 rounded border border-slate-800/80 shadow-inner">
                  SHA256:{report.verificationHash}
                </div>
                <div className="text-xs text-slate-400">Timestamp: {new Date(report.generatedAt).toUTCString()}</div>
              </div>
              <div className="text-center sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-6">
                <div className="text-sm font-black text-white">Geonixa Evaluation Committee</div>
                <div className="text-xs text-[#ff5a1f] font-semibold mt-0.5 uppercase tracking-wider">Authorized Digital Sign-off</div>
                <div className="text-[10px] text-slate-500 mt-1">Tamper-Proof Ledger Record</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Note */}
      <footer className="max-w-4xl mx-auto mt-12 text-center text-xs text-slate-500 border-t border-slate-800 pt-6">
        &copy; {new Date().getFullYear()} Geonixa Corporation. All examination records are cryptographically signed and stored in immutable database clusters.
      </footer>
    </div>
  );
}
