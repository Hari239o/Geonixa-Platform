'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, ChevronRight } from 'lucide-react';

export default function AddCreditsPage() {
  const router = useRouter();
  const [credits, setCredits] = useState('');

  // 100 credits = 100 rs means 1 credit = 1 rs
  const amountRs = credits ? parseInt(credits) : 0;

  const handleAddCredits = () => {
    if (amountRs > 0) {
      alert(`Successfully added ${credits} credits for ₹${amountRs}!`);
      router.push('/wallet');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-[#fafbfc] font-sans overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-6 flex items-center bg-white z-10 sticky top-0 border-b border-gray-100">
        <button 
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-full hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a2e]" />
        </button>
        <h1 className="text-xl font-extrabold text-[#1a1a2e] tracking-tight">Add Credits</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        
        {/* Info Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-[20px] mb-8 border border-indigo-100/50 flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-indigo-600 font-bold text-lg">ℹ</span>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#1a1a2e] mb-1">How Credits Work</h3>
            <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
              Add credits to access exclusive campaigns run by brands. 
              <br />
              <strong className="text-indigo-600">100 Credits = ₹100</strong>
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
          <label className="block text-[13px] font-bold text-gray-500 mb-3">
            ENTER CREDITS AMOUNT
          </label>
          
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="text-2xl font-black text-gray-300">C</span>
            </div>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="0"
              className="w-full bg-[#f4f6fa] border-2 border-transparent focus:border-indigo-100 text-[#1a1a2e] text-[28px] font-black rounded-[20px] py-4 pl-12 pr-6 outline-none transition-all placeholder:text-gray-300"
            />
          </div>

          <div className="flex justify-between items-center py-4 border-t border-dashed border-gray-200 mb-6">
            <span className="text-[14px] font-bold text-gray-500">Amount to pay</span>
            <span className="text-xl font-extrabold text-[#EF4823]">₹{amountRs}</span>
          </div>

          <button 
            onClick={handleAddCredits}
            disabled={amountRs <= 0}
            className="w-full py-4 bg-[#EF4823] disabled:bg-gray-200 disabled:text-gray-400 text-white text-[15px] font-bold rounded-[16px] hover:bg-[#d63f1c] transition-colors shadow-lg shadow-orange-500/20 disabled:shadow-none flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Pay ₹{amountRs}
            <ChevronRight className="w-5 h-5 opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
}
