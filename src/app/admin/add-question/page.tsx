'use client';

import { FormEvent, useMemo, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard' | 'very-hard';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'very-hard'];

const initialOptions = ['', '', '', ''];

export default function AdminAddQuestionPage() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [category, setCategory] = useState('');
  const [marks, setMarks] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const visibleOptions = useMemo(
    () => options.filter((option) => option.trim().length > 0),
    [options]
  );

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      if (correctAnswer && !next.includes(correctAnswer)) {
        setCorrectAnswer('');
      }
      return next;
    });
  };

  const addOption = () => {
    if (options.length >= 8) return;
    setOptions((prev) => [...prev, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next;
    });
  };

  const resetForm = () => {
    setQuestion('');
    setOptions(initialOptions);
    setCorrectAnswer('');
    setDifficulty('easy');
    setCategory('');
    setMarks(1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedOptions = options.map((option) => option.trim()).filter(Boolean);

    if (!question.trim()) {
      setError('Please add the question text.');
      return;
    }

    if (trimmedOptions.length < 2) {
      setError('Please provide at least two answer options.');
      return;
    }

    if (!correctAnswer || !trimmedOptions.includes(correctAnswer)) {
      setError('Please select a valid correct answer.');
      return;
    }

    if (!category.trim()) {
      setError('Category is required.');
      return;
    }

    if (marks < 0) {
      setError('Marks must be zero or greater.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/questions/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          options: trimmedOptions,
          correctAnswer: correctAnswer.trim(),
          difficulty,
          category: category.trim(),
          marks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add question.');
        return;
      }

      resetForm();
      setSuccess('Question added successfully.');
    } catch (fetchError) {
      setError('Unable to reach the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Admin question builder</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white">Add Exam Question</h1>
            <p className="mt-2 text-slate-400">Create structured questions and store them directly in MongoDB.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Question</span>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={4}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-4 text-sm text-slate-100 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Type the exam question here"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">Category</span>
                  <input
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    placeholder="e.g. Quantitative Reasoning"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">Difficulty</span>
                  <select
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value as Difficulty)}
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  >
                    {difficulties.map((level) => (
                      <option key={level} value={level} className="bg-slate-950 text-slate-100">
                        {level.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">Marks</span>
                  <input
                    type="number"
                    min={0}
                    value={marks}
                    onChange={(event) => setMarks(Number(event.target.value))}
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">Correct answer</span>
                  <select
                    value={correctAnswer}
                    onChange={(event) => setCorrectAnswer(event.target.value)}
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="">Choose the correct option</option>
                    {visibleOptions.map((option, index) => (
                      <option key={`${option}-${index}`} value={option} className="bg-slate-950 text-slate-100">
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Answer options</p>
                    <p className="text-xs text-slate-500">Add a minimum of two answer options.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addOption}
                    className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-orange-500 hover:text-orange-300"
                  >
                    Add option
                  </button>
                </div>

                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={`option-${index}`} className="flex items-center gap-3">
                      <span className="min-w-8 text-sm font-semibold text-slate-400">{index + 1}</span>
                      <input
                        type="text"
                        value={option}
                        onChange={(event) => handleOptionChange(index, event.target.value)}
                        className="flex-1 rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        disabled={options.length <= 2}
                        className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-red-500 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-3xl bg-orange-500 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Saving question...' : 'Save question'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
