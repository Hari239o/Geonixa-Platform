/**
 * Professional Admin Dashboard Analytics v1.0
 * 
 * Enterprise-grade analytics for coding submissions
 * Displays comprehensive testcase metrics, performance analytics, and student insights
 */

"use client";

import React, { useMemo } from "react";
import {
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2, XCircle,
  Layers, Users, Target, Zap, Clock, Bug, Database
} from "lucide-react";

interface CodingSubmission {
  studentId: string;
  studentName: string;
  questionTitle: string;
  language: string;
  finalVerdict: string;
  passedTestcaseCount: number;
  totalTestcaseCount: number;
  runtimeMs?: number;
  memoryKb?: number;
  results?: Array<{
    id: number;
    status: string;
    passed: boolean;
    time: number;
    memory: number;
    category?: string;
    possibleHardcode?: boolean;
  }>;
}

interface AdminDashboardAnalyticsProps {
  submissions: CodingSubmission[];
  questionTitle?: string;
  round?: string;
}

export const AdminDashboardAnalytics: React.FC<AdminDashboardAnalyticsProps> = ({
  submissions,
  questionTitle = "Round 4 - Coding Assessment",
  round = "R4"
}) => {
  const analytics = useMemo(() => {
    if (!submissions || submissions.length === 0) {
      return {
        totalSubmissions: 0,
        totalStudents: 0,
        acceptedCount: 0,
        acceptanceRate: 0,
        avgPassedTestcases: 0,
        avgPassPercentage: 0,
        avgRuntime: 0,
        avgMemory: 0,
        hardcodeDetections: 0,
        errorBreakdown: {
          wrongAnswer: 0,
          compilationError: 0,
          runtimeError: 0,
          timeLimitExceeded: 0,
          memoryLimitExceeded: 0
        },
        languageDistribution: {} as Record<string, number>,
        performanceTiers: {
          excellent: 0,  // 100%
          good: 0,       // 75-99%
          average: 0,    // 50-74%
          poor: 0        // <50%
        },
        topPerformers: [] as CodingSubmission[],
        strugglingStudents: [] as CodingSubmission[]
      };
    }

    const uniqueStudents = new Set(submissions.map(s => s.studentId)).size;
    const accepted = submissions.filter(s => s.finalVerdict === "ACCEPTED").length;
    const totalTestcases = submissions.reduce((sum, s) => sum + (s.totalTestcaseCount || 0), 0);
    const passedTestcases = submissions.reduce((sum, s) => sum + (s.passedTestcaseCount || 0), 0);
    const avgPassPercentage = totalTestcases > 0 ? Math.round((passedTestcases / totalTestcases) * 100) : 0;
    
    const avgRuntime = submissions.reduce((sum, s) => sum + (s.runtimeMs || 0), 0) / submissions.length;
    const avgMemory = submissions.reduce((sum, s) => sum + (s.memoryKb || 0), 0) / submissions.length;

    const languageDistribution: Record<string, number> = {};
    submissions.forEach(s => {
      languageDistribution[s.language] = (languageDistribution[s.language] || 0) + 1;
    });

    const performanceTiers = {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0
    };

    submissions.forEach(s => {
      const percentage = s.totalTestcaseCount > 0 
        ? (s.passedTestcaseCount / s.totalTestcaseCount) * 100 
        : 0;
      
      if (percentage === 100) performanceTiers.excellent++;
      else if (percentage >= 75) performanceTiers.good++;
      else if (percentage >= 50) performanceTiers.average++;
      else performanceTiers.poor++;
    });

    const sortedByPerformance = [...submissions].sort(
      (a, b) => (b.passedTestcaseCount / b.totalTestcaseCount) - (a.passedTestcaseCount / a.totalTestcaseCount)
    );

    const errorBreakdown = {
      wrongAnswer: 0,
      compilationError: 0,
      runtimeError: 0,
      timeLimitExceeded: 0,
      memoryLimitExceeded: 0
    };

    submissions.forEach(s => {
      if (s.results) {
        s.results.forEach(r => {
          if (r.status === "WRONG_ANSWER") errorBreakdown.wrongAnswer++;
          else if (r.status === "COMPILATION_ERROR") errorBreakdown.compilationError++;
          else if (r.status === "RUNTIME_ERROR") errorBreakdown.runtimeError++;
          else if (r.status === "TIME_LIMIT_EXCEEDED") errorBreakdown.timeLimitExceeded++;
          else if (r.status === "MEMORY_LIMIT_EXCEEDED") errorBreakdown.memoryLimitExceeded++;
        });
      }
    });

    const hardcodeDetections = submissions.filter(s => 
      s.results?.some(r => r.possibleHardcode)
    ).length;

    return {
      totalSubmissions: submissions.length,
      totalStudents: uniqueStudents,
      acceptedCount: accepted,
      acceptanceRate: Math.round((accepted / submissions.length) * 100),
      avgPassedTestcases: Math.round(passedTestcases / submissions.length),
      avgPassPercentage,
      avgRuntime: Math.round(avgRuntime),
      avgMemory: Math.round(avgMemory),
      hardcodeDetections,
      errorBreakdown,
      languageDistribution,
      performanceTiers,
      topPerformers: sortedByPerformance.slice(0, 5),
      strugglingStudents: sortedByPerformance.slice(-5).reverse()
    };
  }, [submissions]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">
            {questionTitle}
          </h2>
          <p className="text-sm text-slate-400 mt-1">Professional Testcase Analytics</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-blue-400">
            {analytics.totalSubmissions}
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Total Submissions</p>
        </div>
      </div>

      {/* KEY METRICS GRID */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard
          icon={CheckCircle2}
          label="Accepted"
          value={`${analytics.acceptedCount}/${analytics.totalSubmissions}`}
          subtext={`${analytics.acceptanceRate}%`}
          color="emerald"
        />
        <MetricCard
          icon={Users}
          label="Unique Students"
          value={analytics.totalStudents}
          subtext={`${Math.round(analytics.totalSubmissions / analytics.totalStudents)}avg/student`}
          color="blue"
        />
        <MetricCard
          icon={Target}
          label="Avg Pass %"
          value={`${analytics.avgPassPercentage}%`}
          subtext={`${analytics.avgPassedTestcases} testcases`}
          color="violet"
        />
        <MetricCard
          icon={Clock}
          label="Avg Runtime"
          value={`${analytics.avgRuntime}ms`}
          subtext="per submission"
          color="yellow"
        />
        <MetricCard
          icon={Zap}
          label="Avg Memory"
          value={`${analytics.avgMemory}KB`}
          subtext="per submission"
          color="cyan"
        />
      </div>

      {/* PERFORMANCE DISTRIBUTION */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-2xl font-black text-emerald-400">{analytics.performanceTiers.excellent}</div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Excellent (100%)</p>
          <div className="text-sm text-slate-300 mt-2">Perfect submissions</div>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="text-2xl font-black text-blue-400">{analytics.performanceTiers.good}</div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Good (75-99%)</p>
          <div className="text-sm text-slate-300 mt-2">Strong performance</div>
        </div>

        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <div className="text-2xl font-black text-orange-400">{analytics.performanceTiers.average}</div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Average (50-74%)</p>
          <div className="text-sm text-slate-300 mt-2">Moderate progress</div>
        </div>

        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="text-2xl font-black text-rose-400">{analytics.performanceTiers.poor}</div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Poor (&lt;50%)</p>
          <div className="text-sm text-slate-300 mt-2">Needs improvement</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {/* ERROR BREAKDOWN */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-red-400" />
            <h3 className="text-sm font-bold text-slate-300 uppercase">Error Breakdown</h3>
          </div>

          <div className="space-y-2 text-sm">
            {analytics.errorBreakdown.compilationError > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Compilation Errors</span>
                <span className="font-bold text-purple-400">{analytics.errorBreakdown.compilationError}</span>
              </div>
            )}
            {analytics.errorBreakdown.runtimeError > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Runtime Errors</span>
                <span className="font-bold text-red-400">{analytics.errorBreakdown.runtimeError}</span>
              </div>
            )}
            {analytics.errorBreakdown.wrongAnswer > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Wrong Answers</span>
                <span className="font-bold text-rose-400">{analytics.errorBreakdown.wrongAnswer}</span>
              </div>
            )}
            {analytics.errorBreakdown.timeLimitExceeded > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Time Limit Exceeded</span>
                <span className="font-bold text-orange-400">{analytics.errorBreakdown.timeLimitExceeded}</span>
              </div>
            )}
            {analytics.errorBreakdown.memoryLimitExceeded > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Memory Limit Exceeded</span>
                <span className="font-bold text-cyan-400">{analytics.errorBreakdown.memoryLimitExceeded}</span>
              </div>
            )}
          </div>
        </div>

        {/* LANGUAGE DISTRIBUTION */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Database size={18} className="text-blue-400" />
            <h3 className="text-sm font-bold text-slate-300 uppercase">Languages Used</h3>
          </div>

          <div className="space-y-2 text-sm">
            {Object.entries(analytics.languageDistribution).map(([lang, count]) => (
              <div key={lang} className="flex justify-between items-center">
                <span className="text-slate-400 capitalize">{lang}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-400">{count}</span>
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${(count / analytics.totalSubmissions) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HARDCODE DETECTION */}
        {analytics.hardcodeDetections > 0 && (
          <div className="p-6 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Bug size={18} className="text-orange-400" />
              <h3 className="text-sm font-bold text-slate-300 uppercase">Suspicious Submissions</h3>
            </div>

            <div className="text-center">
              <div className="text-3xl font-black text-orange-400">
                {analytics.hardcodeDetections}
              </div>
              <p className="text-xs text-orange-300 mt-2">
                Possible hardcoding detected
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Failed on randomized inputs
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TOP PERFORMERS */}
      {analytics.topPerformers.length > 0 && (
        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-300 uppercase">Top Performers</h3>
          </div>

          <div className="space-y-3">
            {analytics.topPerformers.map((submission, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="font-semibold text-emerald-300">{submission.studentName}</p>
                  <p className="text-xs text-slate-500">{submission.language}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">
                    {submission.passedTestcaseCount}/{submission.totalTestcaseCount}
                  </div>
                  <p className="text-xs text-slate-400">
                    {Math.round((submission.passedTestcaseCount / submission.totalTestcaseCount) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STRUGGLING STUDENTS */}
      {analytics.strugglingStudents.length > 0 && (
        <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-rose-400" />
            <h3 className="text-sm font-bold text-slate-300 uppercase">Students Needing Support</h3>
          </div>

          <div className="space-y-3">
            {analytics.strugglingStudents.map((submission, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="font-semibold text-rose-300">{submission.studentName}</p>
                  <p className="text-xs text-slate-500">{submission.language}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-400">
                    {submission.passedTestcaseCount}/{submission.totalTestcaseCount}
                  </div>
                  <p className="text-xs text-slate-400">
                    {Math.round((submission.passedTestcaseCount / submission.totalTestcaseCount) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Reusable metric card component
 */
const MetricCard: React.FC<{
  icon: any;
  label: string;
  value: string | number;
  subtext: string;
  color: "emerald" | "blue" | "violet" | "yellow" | "cyan" | "rose" | "orange";
}> = ({ icon: Icon, label, value, subtext, color }) => {
  const colorMap = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", text: "text-emerald-400" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-400", text: "text-blue-400" },
    violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "text-violet-400", text: "text-violet-400" },
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "text-yellow-400", text: "text-yellow-400" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: "text-cyan-400", text: "text-cyan-400" },
    rose: { bg: "bg-rose-500/10", border: "border-rose-500/20", icon: "text-rose-400", text: "text-rose-400" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "text-orange-400", text: "text-orange-400" },
  };

  const colors = colorMap[color];

  return (
    <div className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={colors.icon} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <div className={`text-2xl font-black ${colors.text}`}>{value}</div>
      <p className="text-xs text-slate-500 mt-2">{subtext}</p>
    </div>
  );
};

export default AdminDashboardAnalytics;
