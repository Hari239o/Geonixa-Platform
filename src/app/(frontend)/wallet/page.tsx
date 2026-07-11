'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Filter } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import { getItem } from '@/utils/storage';
import { useSession } from 'next-auth/react';

export default function WalletPage() {
 const router = useRouter();
 const [filterOpen, setFilterOpen] = useState(false);
 const [profile, setProfile] = useState({
 fullName: 'Lorem Ipsum',
 profilePic: ''
 });

 useEffect(() => {
    async function loadProfile() {
      if (typeof window !== 'undefined') {
        const parsed = await getItem<any>('kaling_user_profile');
        if (parsed) {
          setProfile({
            fullName: parsed.fullName || 'Lorem Ipsum',
            profilePic: parsed.profilePic || ''
          });
        }
      }
    }
    loadProfile();
  }, []);

  const { data: session } = useSession();
  const credits = (session?.user as any)?.credits || 0;
  const balance = credits * 10;
  const pending = 0; // realistic default since no pending logic exists
  const received = 0; // realistic default

  const transactions: any[] = [];

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 relative flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 pb-4 flex justify-between items-start shrink-0">
          <div className="flex flex-col truncate pr-2">
            <h1 className="text-[18px] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
              Hello {profile.fullName.split(' ')[0]},
            </h1>
            <p className="text-[13px] text-gray-400 font-medium mb-1">Your available balance</p>
          </div>
          <div className="text-[28px] font-extrabold text-primary-red tracking-tight mt-1">
            ₹{balance.toLocaleString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 px-4 sm:px-6 mb-6 shrink-0">
          <button 
            onClick={() => router.push('/wallet/add-credits')}
            className="flex-1 bg-[#2ECC71] text-white py-3 rounded-[12px] font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
          >
            Add Funds
          </button>
          <button 
            onClick={() => router.push('/wallet/withdraw')}
            className="flex-1 bg-[#EF4423] text-white py-3 rounded-[12px] font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
          >
            Withdraw
          </button>
        </div>

        {/* Stats Card */}
        <div className="px-4 sm:px-6 mb-8 shrink-0">
          <div className="bg-[#EF4423] rounded-[16px] p-4 flex justify-between items-center shadow-md relative overflow-hidden">
            <div className="flex flex-col items-center flex-1 border-r border-white/20">
              <span className="text-[18px] font-bold text-white mb-0.5">₹{pending.toLocaleString()}</span>
              <span className="text-[11px] text-white/90 font-medium">Pending</span>
            </div>
            <div className="flex flex-col items-center flex-1 border-r border-white/20">
              <span className="text-[18px] font-bold text-white mb-0.5">₹{received.toLocaleString()}</span>
              <span className="text-[11px] text-white/90 font-medium">Received</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-[18px] font-bold text-white mb-0.5">{credits.toLocaleString()}</span>
              <span className="text-[11px] text-white/90 font-medium">Credit Coins</span>
            </div>
          </div>
        </div>

        {/* Transactions Header */}
        <div className="px-4 sm:px-6 flex justify-between items-center mb-6 relative shrink-0">
          <h2 className="text-[15px] font-extrabold text-[#1a1a2e]">Transactions</h2>
          <div className="relative">
            <button 
              className="text-gray-500 hover:text-primary-red transition-colors relative"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className={`w-5 h-5 ${filterOpen ? 'text-primary-red' : ''}`} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-8 bg-white border border-[#EF4423] rounded-lg shadow-xl w-28 overflow-hidden z-20 flex flex-col p-1">
                <button className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 hover:bg-orange-50 hover:text-[#EF4423]">Pending</button>
                <button className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 hover:bg-orange-50 hover:text-[#EF4423]">Received</button>
                <button className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 hover:bg-orange-50 hover:text-[#EF4423]">last month</button>
                <button className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 hover:bg-orange-50 hover:text-[#EF4423] border-t border-gray-100">Clear</button>
              </div>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="px-4 sm:px-6 flex flex-col gap-6 flex-1">
          {transactions.length > 0 ? transactions.map((tx) => (
            <div key={tx.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0">
                <Image src={tx.image} alt={tx.name} width={40} height={40} className="w-11 h-11 rounded-full object-cover shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-bold text-[#1a1a2e] mb-0.5 truncate pr-2">{tx.name}</span>
                  <span className="text-[10px] font-medium text-gray-400 truncate">{tx.date}</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className={`text-[14px] font-bold ${
                  tx.type === 'withdraw' ? 'text-primary-red' : 
                  tx.type === 'received' ? 'text-[#2ECC71]' : 
                  'text-[#fbc02d]'
                }`}>{tx.amount}</span>
                {tx.status && (
                  <span className="text-[10px] font-medium text-gray-400 mt-0.5">{tx.status}</span>
                )}
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center pt-8 pb-10">
              <span className="text-gray-400 font-medium text-sm">No transactions yet</span>
            </div>
          )}
        </div>

        {/* Floating Banner (Relative to stay in flow, avoiding Nav overlap) */}
        <div className="w-full px-5 z-30 shrink-0 mt-auto pb-4">
          <div className="w-full max-w-[335px] mx-auto bg-[#EF4423] rounded-[18px] p-4 flex items-center justify-between shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col pointer-events-none">
              <span className="text-white/90 text-[11px] font-medium leading-none mb-1">Find More</span>
              <span className="text-white text-xl font-bold leading-none tracking-tight">campaigns</span>
            </div>
            <button onClick={() => router.push('/campaigns')} className="relative z-10 bg-[#D4E865] hover:bg-[#c2d655] text-gray-800 px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95">
              View
            </button>
          </div>
        </div>
      </div>

 <BottomNav profilePic={profile.profilePic} />
 </div>
 );
}
