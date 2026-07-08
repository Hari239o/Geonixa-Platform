import React, { useState } from 'react';
import { Wallet, X, AlertCircle, ArrowRight } from 'lucide-react';

import { useSession } from 'next-auth/react';

export default function WalletCheckModal({ 
  isOpen, 
  onClose, 
  onProceed, 
  budget 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onProceed: () => void;
  budget: string;
}) {
  const { data: session } = useSession();
  const credits = (session?.user as any)?.credits || 0;
  const balance = credits * 10;
  
  // Try to parse max budget from string like "₹13k - ₹25k", default to 13000
  const maxBudgetStr = budget.split('-')[1] || budget;
  const maxBudgetNum = parseInt(maxBudgetStr.replace(/\D/g, '')) || 13;
  const requiredAmount = maxBudgetNum * 1000;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col justify-end items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-t-[24px] p-6 pb-8 w-full relative z-10 animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
             <Wallet className="w-6 h-6 text-[#EF4823]" />
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="font-extrabold text-[22px] text-gray-900 mb-2">Wallet Check</h3>
        <p className="text-gray-500 text-[14px] leading-relaxed mb-6">
          You need sufficient funds in your wallet to publish this campaign and cover potential payouts.
        </p>

        <div className="bg-[#FAFAFA] rounded-[16px] p-4 border border-gray-100 flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
             <span className="text-gray-500 text-[13px] font-medium">Required Minimum</span>
             <span className="text-gray-900 font-bold text-[15px]">₹{requiredAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-gray-500 text-[13px] font-medium">Current Balance</span>
             <span className="text-gray-900 font-bold text-[15px]">₹{balance.toLocaleString()}</span>
          </div>
          
          {balance < requiredAmount && (
            <div className="bg-red-50 p-3 rounded-[10px] flex items-start gap-3 mt-2">
               <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
               <p className="text-red-700 text-[12px] font-medium leading-relaxed">
                 You are short by ₹{(requiredAmount - balance).toLocaleString()}. Please add money to your wallet to proceed.
               </p>
            </div>
          )}
        </div>

        {balance >= requiredAmount ? (
          <button 
            onClick={onProceed}
            className="w-full bg-[#EF4823] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors flex items-center justify-center gap-2"
          >
            PROCEED TO PUBLISH <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={() => {
              // Mock adding money
              setBalance(balance + 10000);
            }}
            className="w-full bg-[#1E1B4B] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:opacity-90 transition-colors"
          >
            ADD MONEY TO WALLET
          </button>
        )}
      </div>
    </div>
  );
}
