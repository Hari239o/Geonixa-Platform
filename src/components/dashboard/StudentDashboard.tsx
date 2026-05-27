"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  TrendingUp,
  Download,
  Calendar,
  Clock,
  BarChart3,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import { downloadHTML, exportToPDF } from '@/lib/pdf-export';
import { SimpleBarChart, SimpleLineChart, StatCard } from './ChartComponents';

interface StudentDashboardProps {
  userEmail?: string;
}

interface ExamResult {
  id: string;
  name: string;
  score: number;
  totalMarks: number;
  percentage: string;
  submittedAt: Date;
  correctAnswers: number;
  totalQuestions: number;
}

interface DashboardStats {
  totalExams: number;
  averageScore: string;
  highestScore: number;
  lowestScore: number;
  totalMarks: number;
  averagePercentage: string;
}

export default function StudentDashboardComponent({ userEmail }: StudentDashboardProps) {
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamResult | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/student/dashboard', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setExams(data.exams);
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      } else {
        setError(data.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (exam: ExamResult) => {
    try {
      setGeneratingPDF(true);

      const response = await fetch('/api/reports/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ resultId: exam.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const data = await response.json();

      // Download as HTML file that can be printed to PDF
      const filename = `exam-result-${exam.name.replace(/\s+/g, '-').toLowerCase()}.html`;
      downloadHTML(data.html, filename);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download report. Please try again.');
    } finally {
      setGeneratingPDF(false);
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
          <h1 className="text-4xl md:text-5xl font-black mb-4">Dashboard</h1>
          <p className="text-slate-400 text-lg">
            Track your exam performance, review results, and monitor your progress
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Overview */}
        {stats && stats.totalExams > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#FF5A1F]" />
              Performance Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label="Total Exams"
                value={stats.totalExams}
                icon={Trophy}
                color="text-emerald-500"
              />
              <StatCard
                label="Average Score"
                value={`${stats.averageScore}/${Math.floor(stats.totalMarks / stats.totalExams)}`}
                icon={Target}
                color="text-blue-500"
              />
              <StatCard
                label="Highest Score"
                value={stats.highestScore}
                icon={TrendingUp}
                color="text-amber-500"
              />
              <StatCard
                label="Avg Percentage"
                value={`${stats.averagePercentage}%`}
                icon={BarChart3}
                color="text-[#FF5A1F]"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Exam Results History */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Exam Results</h2>
            {exams.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center"
              >
                <Trophy className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">No exam results yet. Start your first exam to see results here.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {exams.map((exam, idx) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-[#FF5A1F]/50 transition-all cursor-pointer"
                    onClick={() => setSelectedExam(exam)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{exam.name}</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            <span>
                              {exam.score}/{exam.totalMarks} ({exam.percentage}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>
                              {exam.correctAnswers}/{exam.totalQuestions} Correct
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(exam.submittedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPDF(exam);
                        }}
                        disabled={generatingPDF}
                        className="ml-4 p-3 bg-[#FF5A1F]/20 hover:bg-[#FF5A1F]/30 text-[#FF5A1F] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-5 h-5" />
                      </motion.button>
                    </div>
                    <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${parseFloat(exam.percentage)}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="h-full bg-linear-to-r from-[#FF5A1F] to-[#FF7A4A]"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-[#FF5A1F]/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#FF5A1F]/20 rounded-lg flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle className="w-5 h-5 text-[#FF5A1F]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{activity.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(activity.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {exams.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
            >
              <h3 className="text-lg font-bold mb-6">Score Trend</h3>
              <SimpleLineChart data={exams} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
            >
              <h3 className="text-lg font-bold mb-6">Score Distribution</h3>
              <SimpleBarChart
                data={[
                  { range: '0-20%', count: exams.filter(e => parseFloat(e.percentage) < 20).length },
                  { range: '20-40%', count: exams.filter(e => parseFloat(e.percentage) >= 20 && parseFloat(e.percentage) < 40).length },
                  { range: '40-60%', count: exams.filter(e => parseFloat(e.percentage) >= 40 && parseFloat(e.percentage) < 60).length },
                  { range: '60-80%', count: exams.filter(e => parseFloat(e.percentage) >= 60 && parseFloat(e.percentage) < 80).length },
                  { range: '80-100%', count: exams.filter(e => parseFloat(e.percentage) >= 80).length },
                ]}
                label="Distribution"
              />
            </motion.div>
          </div>
        )}
      </div>

      {/* Exam Details Modal */}
      {selectedExam && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedExam(null)}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0D121F] border border-slate-800 rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedExam.name}</h2>
                <p className="text-slate-400 mt-2">
                  Submitted on{' '}
                  {new Date(selectedExam.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedExam(null)}
                className="p-2 hover:bg-slate-900 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 mb-2">SCORE</p>
                <p className="text-2xl font-bold text-[#FF5A1F]">
                  {selectedExam.score}/{selectedExam.totalMarks}
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 mb-2">PERCENTAGE</p>
                <p className="text-2xl font-bold text-emerald-500">{selectedExam.percentage}%</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 mb-2">CORRECT</p>
                <p className="text-2xl font-bold text-blue-500">
                  {selectedExam.correctAnswers}/{selectedExam.totalQuestions}
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 mb-2">ACCURACY</p>
                <p className="text-2xl font-bold text-amber-500">
                  {((selectedExam.correctAnswers / selectedExam.totalQuestions) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownloadPDF(selectedExam)}
              disabled={generatingPDF}
              className="w-full bg-[#FF5A1F] hover:bg-[#E44E18] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              {generatingPDF ? 'Generating...' : 'Download Report'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
