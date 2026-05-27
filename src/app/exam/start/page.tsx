'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExamStartPage() {
  const router = useRouter();

  useEffect(() => {
    const currentUser = typeof window !== 'undefined' ? localStorage.getItem('geonixa_current_user') : null;
    const examId = currentUser ? encodeURIComponent(currentUser) : 'candidate-session';
    router.replace(`/exam/${examId}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 px-10 py-12 text-center shadow-2xl shadow-slate-950/30">
        <h1 className="text-3xl font-black text-white">Preparing your hiring session...</h1>
        <p className="mt-4 text-slate-400">You will be redirected to the secure 4-round exam environment shortly.</p>
      </div>
    </div>
  );
}
