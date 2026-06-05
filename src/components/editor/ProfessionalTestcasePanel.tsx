/**
 * Professional Testcase Results Panel v1.0
 * 
 * Enterprise-grade testcase result visualization
 * Displays detailed metrics following HackerRank/LeetCode/Codility standards
 */

"use client";

import React, { useMemo } from "react";
import {
  CheckCircle2, XCircle, AlertCircle, Clock, Zap, Target,
  TrendingUp, Layers, Gauge, Shield, Bug
} from "lucide-react";
import { JudgeResult, TestCaseCategory } from "@/lib/JudgeEngine";

interface ProfessionalTestcasePanelProps {
  results: JudgeResult[];
  totalTestcases: number;
  mode: "RUN" | "SUBMIT";
  possibleHardcode?: boolean;
  detectedComplexity?: string;
  categoryBreakdown?: Record<TestCaseCategory, number>;
  categoryPassed?: Record<TestCaseCategory, number>;
}

export const ProfessionalTestcasePanel: React.FC<ProfessionalTestcasePanelProps> = ({
  results,
  totalTestcases,
  mode,
  possibleHardcode = false,
  detectedComplexity = "UNKNOWN",
  categoryBreakdown = {},
  categoryPassed = {}
}) => {
  const metrics = useMemo(() => {
    const passed = results.filter(r => r.passed).length;
    const failed = totalTestcases - passed;
    const passPercentage = Math.round((passed / totalTestcases) * 100);
    
    const avgTime = results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + (r.time || 0), 0) / results.length)
      : 0;
    
    const maxMemory = results.length > 0
      ? Math.max(...results.map(r => r.memory || 0))
      : 0;

    const statusCounts = {
      accepted: results.filter(r => r.status === "ACCEPTED").length,
      wrongAnswer: results.filter(r => r.status === "WRONG_ANSWER").length,
      compilationError: results.filter(r => r.status === "COMPILATION_ERROR").length,
      runtimeError: results.filter(r => r.status === "RUNTIME_ERROR").length,
      timeLimitExceeded: results.filter(r => r.status === "TIME_LIMIT_EXCEEDED").length,
      memoryLimitExceeded: results.filter(r => r.status === "MEMORY_LIMIT_EXCEEDED").length,
    };

    return {
      passed,
      failed,
      passPercentage,
      avgTime,
      maxMemory,
      statusCounts,
      allPassed: passed === totalTestcases,
      isClean: statusCounts.compilationError === 0 && statusCounts.runtimeError === 0
    };
  }, [results, totalTestcases]);

  const getCategoryEmoji = (category?: TestCaseCategory): string => {
    const emojiMap: Record<TestCaseCategory, string> = {
      SAMPLE: "📝",
      HIDDEN: "🔒",
      EDGE_CASE: "⚠️",
      LARGE_INPUT: "📦",
      WORST_CASE_COMPLEXITY: "🏃",
      DUPLICATE_VALUES: "🔄",
      BOUNDARY_CONDITION: "🎯",
      RANDOMIZED_VALIDATION: "🎲",
      MEMORY_STRESS: "💾",
      RUNTIME_STRESS: "⏱️"
    };
    return emojiMap[category || "HIDDEN"];
  };

  const getComplexityColor = (complexity: string): string => {
    if (complexity.includes("O(1)")) return "text-emerald-500";
    if (complexity.includes("O(log n)")) return "text-emerald-500";
    if (complexity.includes("O(n)")) return "text-emerald-500";
    if (complexity.includes("O(n log n)")) return "text-yellow-500";
    if (complexity.includes("O(n²)")) return "text-orange-500";
    return "text-rose-500";
  };

  return (
    <div className="space-y-6 py-4">
      {/* PRIMARY RESULT BANNER */}
      <div
        className={`p-6 rounded-2xl border-2 shadow-lg transition-all ${
          metrics.allPassed
            ? "bg-emerald-500/10 border-emerald-500/30"
            : "bg-rose-500/10 border-rose-500/30"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {metrics.allPassed ? (
              <div className="text-emerald-500">
                <CheckCircle2 size={32} strokeWidth={2} />
              </div>
            ) : (
              <div className="text-rose-500">
                <XCircle size={32} strokeWidth={2} />
              </div>
            )}
            <div>
              <h3
                className={`text-2xl font-black uppercase tracking-wide ${
                  metrics.allPassed ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {metrics.allPassed ? "✅ ACCEPTED" : "❌ REJECTED"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
                {mode === "RUN" ? "Sample Testcase Validation" : "Full Assessment Mode"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-black text-[#0f172a]">
              {metrics.passed}/{totalTestcases}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">
              Testcases Passed
            </div>
            <div className="mt-3 bg-black/5 px-3 py-1 rounded-lg border border-black/10">
              <span className="text-sm font-bold text-emerald-500">
                {metrics.passPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PERFORMANCE METRICS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-500" />
            <span className="text-xs font-bold text-slate-500 uppercase">
              Avg Time
            </span>
          </div>
          <div className="text-xl font-black text-[#0f172a]">{metrics.avgTime}ms</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-yellow-500" />
            <span className="text-xs font-bold text-slate-500 uppercase">
              Peak Memory
            </span>
          </div>
          <div className="text-xl font-black text-[#0f172a]">
            {Math.round(metrics.maxMemory / 1024)}KB
          </div>
        </div>
      </div>

      {/* COMPLEXITY ANALYSIS (if available) */}
      {detectedComplexity && detectedComplexity !== "UNKNOWN" && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge size={18} className="text-blue-400" />
              <div>
                <p className="text-xs font-bold text-blue-300 uppercase">
                  Detected Complexity
                </p>
                <p className={`text-lg font-black mt-1 ${getComplexityColor(detectedComplexity)}`}>
                  {detectedComplexity}
                </p>
              </div>
            </div>
            {detectedComplexity.includes("O(n³+)") && (
              <AlertCircle size={20} className="text-rose-500" />
            )}
          </div>
        </div>
      )}

      {/* HARDCODE DETECTION WARNING */}
      {possibleHardcode && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
          <div className="flex items-start gap-3">
            <Bug size={18} className="text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-orange-300 text-sm">
                ⚠️ Suspicious Pattern Detected
              </p>
              <p className="text-xs text-orange-200/70 mt-1">
                Your solution passed visible testcases but failed on randomized inputs. This may indicate hardcoding.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED STATUS BREAKDOWN */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.statusCounts.accepted > 0 && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-300">
              {metrics.statusCounts.accepted} Accepted
            </span>
          </div>
        )}
        
        {metrics.statusCounts.wrongAnswer > 0 && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
            <XCircle size={14} className="text-rose-500" />
            <span className="text-xs font-bold text-rose-300">
              {metrics.statusCounts.wrongAnswer} Wrong Answer
            </span>
          </div>
        )}
        
        {metrics.statusCounts.compilationError > 0 && (
          <div className="flex items-center gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <AlertCircle size={14} className="text-purple-500" />
            <span className="text-xs font-bold text-purple-300">
              {metrics.statusCounts.compilationError} Compilation Error
            </span>
          </div>
        )}
        
        {metrics.statusCounts.runtimeError > 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-xs font-bold text-red-300">
              {metrics.statusCounts.runtimeError} Runtime Error
            </span>
          </div>
        )}
        
        {metrics.statusCounts.timeLimitExceeded > 0 && (
          <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Clock size={14} className="text-orange-500" />
            <span className="text-xs font-bold text-orange-300">
              {metrics.statusCounts.timeLimitExceeded} TLE
            </span>
          </div>
        )}
        
        {metrics.statusCounts.memoryLimitExceeded > 0 && (
          <div className="flex items-center gap-2 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Zap size={14} className="text-cyan-500" />
            <span className="text-xs font-bold text-cyan-300">
              {metrics.statusCounts.memoryLimitExceeded} MLE
            </span>
          </div>
        )}
      </div>

      {/* TESTCASE CATEGORY BREAKDOWN */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="p-4 rounded-xl bg-white border border-[#cbd5e1] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={16} className="text-blue-500" />
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Testcase Categories
            </h4>
          </div>

          <div className="space-y-2">
            {Object.entries(categoryBreakdown).map(([category, total]) => {
              const passed = categoryPassed?.[category as TestCaseCategory] || 0;
              const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getCategoryEmoji(category as TestCaseCategory)}</span>
                      <span className="font-semibold text-slate-700 capitalize">
                        {category.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </div>
                    <span className={`font-bold ${
                      percentage === 100 ? "text-emerald-500" : "text-slate-500"
                    }`}>
                      {passed}/{total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentage === 100 ? "bg-emerald-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      {!metrics.allPassed && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-amber-300 text-sm">💡 Debugging Recommendations</p>
              <ul className="text-xs text-amber-200/70 mt-2 space-y-1 list-disc list-inside">
                <li>Review failed testcase inputs and expected outputs below</li>
                <li>Check for edge cases and boundary conditions</li>
                {metrics.statusCounts.timeLimitExceeded > 0 && (
                  <li>Optimize algorithm complexity - consider a faster approach</li>
                )}
                {metrics.statusCounts.compilationError > 0 && (
                  <li>Fix syntax errors - check the error stream for details</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {metrics.allPassed && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-emerald-300 text-sm">🎉 Excellent Work!</p>
              <p className="text-xs text-emerald-200/70 mt-1">
                {mode === "RUN"
                  ? "All sample testcases passed. Submit your solution to validate against hidden enterprise testcases."
                  : "Your solution passed all testcases and has been submitted for evaluation."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfessionalTestcasePanel;
