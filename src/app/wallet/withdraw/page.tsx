'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';

export default function WithdrawPage() {
 const router = useRouter();
 const [amount, setAmount] = useState('');

 return (
 <div className="w-full max-w-md mx-auto min-h-screen bg-[#f9fafb] pb-24 font-sans relative flex flex-col">
 {/* Header */}
 <div className="px-6 pt-4 pb-12 flex justify-start">
 <button 
 onClick={() => router.back()}
 className="w-12 h-12 bg-orange-100/80 text-primary-red rounded-[16px] flex items-center justify-center transition-transform active:scale-95"
 >
 <ChevronLeft size={28} strokeWidth={2.5} />
 </button>
 </div>

 {/* Main Content */}
 <div className="px-6 flex flex-col items-center flex-1">
 <h1 className="text-[22px] font-extrabold text-[#1a1a2e] mb-1 tracking-tight">Withdraw</h1>
 <p className="text-[13px] text-gray-400 font-medium mb-12">Enter your amount</p>

 <div className="w-full relative mb-4">
 <input 
 type="number" 
 placeholder="₹5000"
 value={amount}
 onChange={(e) => setAmount(e.target.value)}
 className="w-full bg-white border border-transparent focus:border-gray-100 rounded-2xl py-5 px-6 text-base font-medium text-gray-900 placeholder:text-gray-400 shadow-[0_2px_15px_rgba(0,0,0,0.02)] outline-none"
 />
 </div>

 <div className="w-full px-2 mb-10 flex justify-start">
 <span className="text-[11px] font-semibold text-gray-400">Your balance : ₹10950</span>
 </div>

 <button 
 className="w-full py-4 bg-[#EF4823] text-white text-[15px] font-bold rounded-[14px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
 onClick={() => {
 alert(`Withdraw request for ₹${amount || 5000} submitted!`);
 router.push('/wallet');
 }}
 >
 WITHDRAW
 </button>
 </div>

 <BottomNav />
 </div>
 );
}
