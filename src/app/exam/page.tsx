'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const roundDefinitions = [
  {
    title: 'Round 1 - Aptitude Intelligence',
    description: 'Aptitude and logical reasoning questions to assess problem-solving, numerical ability, and decision-making under pressure.',
  },
  {
    title: 'Round 2 - Grammar & Logic',
    description: 'Language precision, comprehension, and analytical reasoning designed for enterprise-ready communication.',
  },
  {
    title: 'Round 3 - Typing Velocity',
    description: 'Typing and composition assessment to validate speed, accuracy, and candidate fluency under timed conditions.',
  },
  {
    title: 'Round 4 - Technical Hiring Assessment',
    description: 'Domain-specific technical evaluation with enterprise hidden test validation and a secure coding editor.',
  },
];

export default function ExamPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = 'Hiring Assessment — 4 Round Exam';
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="rounded-4xl border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-orange-400">GeoNixa Hiring Exam</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white">Full 4-Round Secure Assessment</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">
                This assessment is a complete hiring evaluation, not a practice test. All four rounds are included: Aptitude, Grammar, Typing, and Technical.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/exam/start')}
              className="inline-flex items-center justify-center rounded-3xl bg-linear-to-r from-orange-500 to-amber-400 px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-slate-950 shadow-xl shadow-orange-500/20 transition hover:scale-[1.01]"
            >
              Start Secure Exam
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {roundDefinitions.map((round, idx) => (
            <div key={round.title} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-lg shadow-slate-950/10">
              <div className="mb-4 inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
                Round {idx + 1}
              </div>
              <h2 className="text-2xl font-bold text-white">{round.title}</h2>
              <p className="mt-3 text-slate-400">{round.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-4xl border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/20">
          <h2 className="text-2xl font-black text-white">Why this is a hiring assessment</h2>
          <ul className="mt-6 space-y-4 text-slate-400">
            <li className="flex gap-3">
              <span className="mt-1 h-3 w-3 rounded-full bg-emerald-400" />
              End-to-end skill validation across cognitive, language, typing, and technical domains.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-3 w-3 rounded-full bg-emerald-400" />
              Secure proctoring and integrity monitoring throughout the exam flow.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-3 w-3 rounded-full bg-emerald-400" />
              Hidden test validation in the final technical round for enterprise-grade hiring decisions.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
