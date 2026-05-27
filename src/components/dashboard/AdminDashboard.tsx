"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { SimpleBarChart, SimpleLineChart, StatCard } from './ChartComponents';

interface AdminDashboardProps {}

interface AdminStats {
  totalStudents: number;
  totalExams: number;
  totalSubmissions: number;
  averageScore: string;
  averagePercentage: string;
  highestScore: number;
}

interface QuestionStats {
  totalQuestions: number;
  averageCorrect: string;
  difficultQuestions: Array<{
    questionId: string;
    successRate: string;
    totalAttempts: number;
  }>;
}

interface Submission {
  id: string;
  userId: string;
  score: number;
  totalMarks: number;
  percentage: string;
  submittedAt: Date;
  totalQuestions: number;
  correctAnswers: number;
}

interface ScoreDistribution {
  range: string;
  count: number;
  label: string;
}

export default function AdminDashboardComponent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [questionStats, setQuestionStats] = useState<QuestionStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch admin dashboard data: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setQuestionStats(data.questionStats);
        setRecentSubmissions(data.recentSubmissions);
        setScoreDistribution(data.scoreDistribution);
      } else {
        setError(data.error || 'Failed to load admin dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050810] text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-slate-900 border-t-[#FF5A1F] rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050810] text-white p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-500 mb-2">Error Loading Dashboard</h3>
              <p className="text-sm text-slate-300">{error}</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-linear-to-br from-[#0D121F] via-[#0A0E18] to-[#050810] border-b border-slate-900 px-8 py-16"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5A1F]/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Admin Dashboard</h1>
          <p className="text-slate-400 text-lg">
            Monitor system performance, student progress, and exam statistics
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Key Metrics */}
        {stats && (
          <>
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-[#FF5A1F]" />
                Key Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  label="Total Students"
                  value={stats.totalStudents}
                  icon={Users}
                  color="text-blue-500"
                />
                <StatCard
                  label="Total Exams"
                  value={stats.totalExams}
                  icon={BookOpen}
                  color="text-emerald-500"
                />
                <StatCard
                  label="Submissions"
                  value={stats.totalSubmissions}
                  icon={TrendingUp}
                  color="text-amber-500"
                />
                <StatCard
                  label="Avg Score"
                  value={`${stats.averageScore}`}
                  icon={BarChart3}
                  color="text-[#FF5A1F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Performance Overview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
              >
                <h3 className="text-lg font-bold mb-6">Score Distribution</h3>
                {scoreDistribution.length > 0 ? (
                  <SimpleBarChart data={scoreDistribution} label="Score Ranges" />
                ) : (
                  <p className="text-slate-400">No data available</p>
                )}
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
              >
                <h3 className="text-lg font-bold mb-6">Quick Stats</h3>
                <div className="space-y-6">
                  <div className="pb-6 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Average Score
                    </p>
                    <p className="text-3xl font-black text-[#FF5A1F]">{stats.averageScore}</p>
                  </div>
                  <div className="pb-6 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Avg Percentage
                    </p>
                    <p className="text-3xl font-black text-emerald-500">{stats.averagePercentage}%</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Highest Score
                    </p>
                    <p className="text-3xl font-black text-amber-500">{stats.highestScore}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* Recent Submissions & Question Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Recent Submissions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Recent Submissions</h2>
            {recentSubmissions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center"
              >
                <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">No submissions yet.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {recentSubmissions.map((submission, idx) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-[#FF5A1F]/50 transition-all cursor-pointer"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{submission.userId}</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>
                              {submission.score}/{submission.totalMarks} ({submission.percentage}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            <span>
                              {submission.correctAnswers}/{submission.totalQuestions} Correct
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${parseFloat(submission.percentage)}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="h-full bg-linear-to-r from-[#FF5A1F] to-[#FF7A4A]"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Question Statistics */}
          {questionStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
            >
              <h3 className="text-lg font-bold mb-6">Question Stats</h3>
              <div className="space-y-6">
                <div className="pb-6 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Total Questions
                  </p>
                  <p className="text-3xl font-black text-emerald-500">{questionStats.totalQuestions}</p>
                </div>
                <div className="pb-6 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Avg Correct
                  </p>
                  <p className="text-3xl font-black text-blue-500">{questionStats.averageCorrect}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Difficult Questions
                  </p>
                  <div className="space-y-2">
                    {questionStats.difficultQuestions.slice(0, 5).map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400 truncate">Q{q.questionId.slice(-2)}</span>
                        <span className="text-red-500 font-semibold">{q.successRate}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Advanced Analytics */}
        {recentSubmissions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
            >
              <h3 className="text-lg font-bold mb-6">Submission Trend</h3>
              <SimpleLineChart data={recentSubmissions} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
            >
              <h3 className="text-lg font-bold mb-6">Performance Categories</h3>
              <SimpleBarChart
                data={[
                  {
                    range: 'Excellent (80-100%)',
                    count: recentSubmissions.filter(s => parseFloat(s.percentage) >= 80).length,
                  },
                  {
                    range: 'Good (60-80%)',
                    count: recentSubmissions.filter(
                      s => parseFloat(s.percentage) >= 60 && parseFloat(s.percentage) < 80
                    ).length,
                  },
                  {
                    range: 'Average (40-60%)',
                    count: recentSubmissions.filter(
                      s => parseFloat(s.percentage) >= 40 && parseFloat(s.percentage) < 60
                    ).length,
                  },
                  {
                    range: 'Below Avg (<40%)',
                    count: recentSubmissions.filter(s => parseFloat(s.percentage) < 40).length,
                  },
                ]}
                label="Submissions"
              />
            </motion.div>
          </div>
        )}
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedSubmission(null)}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0D121F] border border-slate-800 rounded-2xl max-w-2xl w-full p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Submission Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2">STUDENT</p>
                <p className="font-bold truncate">{selectedSubmission.userId}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2">SCORE</p>
                <p className="text-xl font-bold text-[#FF5A1F]">
                  {selectedSubmission.score}/{selectedSubmission.totalMarks}
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2">PERCENTAGE</p>
                <p className="text-xl font-bold text-emerald-500">{selectedSubmission.percentage}%</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2">CORRECT</p>
                <p className="text-xl font-bold text-blue-500">
                  {selectedSubmission.correctAnswers}/{selectedSubmission.totalQuestions}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedSubmission(null)}
              className="w-full bg-[#FF5A1F] hover:bg-[#E44E18] text-white font-bold py-3 rounded-xl transition-all"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
