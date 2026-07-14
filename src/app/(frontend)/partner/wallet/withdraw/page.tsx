'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Building2, CreditCard, Check, BadgeCheck } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import { useSession } from 'next-auth/react';

export default function WithdrawPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const credits = (session?.user as any)?.credits || 0;
  const balance = credits * 10;

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bank' | 'upi' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const addAmount = (val: number) => {
    const current = parseInt(amount || '0', 10);
    setAmount((current + val).toString());
  };

  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    // We don't fetch or block on mount, we just need it available
  }, []);

  const handleWithdraw = () => {
    // Check if verified
    const savedProfile = localStorage.getItem("kaling_user_profile");
    let isVerified = false;
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        isVerified = parsed.isVerified;
      } catch (e) {}
    }
    
    if (!isVerified) {
      setShowVerifyModal(true);
      return;
    }

    setShowSuccess(true);
    setTimeout(() => {
      router.push('/partner/wallet');
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-white font-sans flex flex-col relative">
        <div className="px-6 pt-6 pb-8 flex justify-start relative z-10">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-orange-50 text-primary-red rounded-xl flex items-center justify-center transition-transform active:scale-95"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center pb-32">
          <div className="relative mb-6">
            <div className="absolute inset-0 scale-150">
              {/* Confetti dots */}
              <div className="absolute top-0 left-4 w-2 h-2 bg-[#DCE26A] rounded-full"></div>
              <div className="absolute top-2 right-4 w-1.5 h-1.5 bg-[#DCE26A] rounded-full"></div>
              <div className="absolute bottom-4 left-0 w-2.5 h-2.5 bg-[#DCE26A] rounded-full"></div>
              <div className="absolute bottom-0 right-2 w-2 h-2 bg-[#DCE26A] rounded-full"></div>
              <div className="absolute top-1/2 -left-6 w-1.5 h-1.5 bg-[#DCE26A] rounded-full"></div>
              <div className="absolute top-1/3 -right-6 w-2 h-2 bg-[#DCE26A] rounded-full"></div>
            </div>
            <div className="w-28 h-28 bg-[#EF4423] rounded-full flex items-center justify-center shadow-lg relative z-10 animate-in zoom-in duration-300">
              <Check size={50} strokeWidth={4} className="text-white" />
            </div>
          </div>
          <h2 className="text-[20px] font-extrabold text-[#EF4423] mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            Withdraw Successful!
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-white pb-24 font-sans relative flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-8 flex justify-start">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-orange-50 text-primary-red rounded-xl flex items-center justify-center transition-transform active:scale-95"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Main Content */}
      <div className="px-6 flex flex-col flex-1">
        <h1 className="text-[22px] font-extrabold text-[#1a1a2e] mb-1 tracking-tight">Withdraw Funds</h1>
        <p className="text-[13px] text-gray-400 font-medium mb-8">Enter your amount</p>

        <div className="w-full relative mb-2">
          <input 
            type="number" 
            placeholder="₹500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white border border-[#EF4423] rounded-[12px] py-4 px-5 text-base font-medium text-gray-900 placeholder:text-gray-400 outline-none"
          />
        </div>

        <div className="w-full mb-4 flex justify-start pl-2">
          <span className="text-[11px] font-bold text-[#EF4423]">Your balance : ₹{balance}</span>
        </div>

        <div className="flex gap-3 mb-10 pl-2">
          <button onClick={() => addAmount(500)} className="bg-orange-50 text-[#EF4423] px-3 py-1.5 rounded-md text-[11px] font-bold">
            + ₹500
          </button>
          <button onClick={() => addAmount(1000)} className="bg-orange-50 text-[#EF4423] px-3 py-1.5 rounded-md text-[11px] font-bold">
            + ₹1000
          </button>
          <button onClick={() => addAmount(2000)} className="bg-orange-50 text-[#EF4423] px-3 py-1.5 rounded-md text-[11px] font-bold">
            + ₹2000
          </button>
        </div>

        <h2 className="text-[15px] font-extrabold text-[#1a1a2e] mb-4">Withdraw Method</h2>
        
        <div className="flex flex-col gap-2 mb-10">
          <div 
            onClick={() => setMethod('bank')}
            className={`flex items-center gap-4 py-4 px-2 border-b border-gray-100 cursor-pointer ${method === 'bank' ? 'bg-orange-50/50 rounded-lg border-transparent' : ''}`}
          >
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-[#EF4423]">
              <Building2 size={20} strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold text-gray-800">To Bank Account</span>
          </div>
          <div 
            onClick={() => setMethod('upi')}
            className={`flex items-center gap-4 py-4 px-2 border-b border-gray-100 cursor-pointer ${method === 'upi' ? 'bg-orange-50/50 rounded-lg border-transparent' : ''}`}
          >
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-[#EF4423]">
              <CreditCard size={20} strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold text-gray-800">To UPI ID</span>
          </div>
        </div>

        <div className="fixed bottom-[80px] left-0 right-0 max-w-md mx-auto px-6 z-40 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-2">
          <button 
            className="w-full py-4 bg-[#EF4423] text-white text-[15px] font-bold rounded-[14px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
            disabled={!amount || !method}
            onClick={handleWithdraw}
          >
            WITHDRAW FUNDS
          </button>
        </div>
      </div>

      {/* Verify Account Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-[320px] relative shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="w-14 h-14 bg-[#EF4423]/10 rounded-full flex items-center justify-center mb-4 mt-2">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#EF4423]" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            
            <h2 className="text-[#EF4423] text-lg font-black tracking-wide mb-1">VERIFY YOUR ACCOUNT</h2>
            <div className="flex flex-col items-center mb-6">
              <span className="text-[13px] text-gray-500 font-medium">Take A</span>
              <span className="text-[13px] text-gray-500 font-medium">Live Selfie Video</span>
            </div>
            
            <div className="w-full border-2 border-dashed border-[#EF4423]/40 rounded-[14px] py-4 flex items-center justify-center gap-2 text-[#EF4423] mb-6 cursor-pointer hover:bg-orange-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              <span className="font-bold text-sm">Camera</span>
            </div>
            
            <button 
              onClick={() => setShowVerifyModal(false)}
              className="w-full bg-[#EF4423] text-white font-bold py-3.5 rounded-[12px] shadow-lg shadow-orange-500/30 hover:bg-[#d63f1c] hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              SUBMIT
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
