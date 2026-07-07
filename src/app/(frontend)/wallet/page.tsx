'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Filter } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import { getItem } from '@/utils/storage';

export default function WalletPage() {
 const router = useRouter();
 const [filterOpen, setFilterOpen] = useState(false);
 const [profile, setProfile] = useState({
 fullName: 'Lorem Ipsum',
 profilePic: '/profile_pic.png'
 });

 useEffect(() => {
    async function loadProfile() {
      if (typeof window !== 'undefined') {
        const parsed = await getItem<any>('kaling_user_profile');
        if (parsed) {
          setProfile({
            fullName: parsed.fullName || 'Lorem Ipsum',
            profilePic: parsed.profilePic || '/profile_pic.png'
          });
        }
      }
    }
    loadProfile();
  }, []);

 const transactions: any[] = [];

 return (
  <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white font-sans overflow-hidden">
    <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 relative">
 {/* Header */}
 <div className="px-4 sm:px-6 pt-4 pb-6 flex justify-between items-start">
 <div className="flex flex-col truncate pr-2">
 <h1 className="text-xl font-extrabold text-[#1a1a2e] tracking-tight mb-1">
 Hello {profile.fullName.split(' ')[0]},
 </h1>
 <p className="text-[13px] text-gray-400 font-medium mb-1">Your available balance</p>
  <div className="flex gap-4 mt-1">
   <button 
   className="text-[11px] font-bold text-primary-red text-left w-fit hover:underline"
   onClick={() => router.push('/wallet/withdraw')}
   >
   Withdraw
   </button>
   <button 
   className="text-[11px] font-bold text-primary-red text-left w-fit hover:underline"
   onClick={() => router.push('/wallet/add-credits')}
   >
   Add credits
   </button>
  </div>
 </div>
 <div className="text-[28px] font-extrabold text-primary-red tracking-tight">
 ₹0
 </div>
 </div>

 {/* Stats Card */}
 <div className="px-4 sm:px-6 mb-8">
 <div className="bg-[#EF4823] rounded-[20px] p-4 sm:p-5 flex justify-between items-center shadow-md relative overflow-hidden">
 {/* subtle decoration */}
 <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
 
 <div className="flex flex-col items-center flex-1 border-r border-white/20">
 <span className="text-lg font-bold text-white mb-0.5">₹0</span>
 <span className="text-[11px] text-white/90 font-medium">Pending</span>
 </div>
 <div className="flex flex-col items-center flex-1 border-r border-white/20">
 <span className="text-lg font-bold text-white mb-0.5">₹0</span>
 <span className="text-[11px] text-white/90 font-medium">Received</span>
 </div>
 <div className="flex flex-col items-center flex-1">
 <span className="text-lg font-bold text-white mb-0.5">0</span>
 <span className="text-[11px] text-white/90 font-medium">Credit Coins</span>
 </div>
 </div>
 </div>

 {/* Transactions Header */}
 <div className="px-4 sm:px-6 flex justify-between items-center mb-6 relative">
 <h2 className="text-[15px] font-extrabold text-[#1a1a2e]">Transactions</h2>
 <button 
 className="text-gray-500 hover:text-primary-red transition-colors relative"
 onClick={() => setFilterOpen(!filterOpen)}
 >
 <Filter className={`w-5 h-5 ${filterOpen ? 'text-primary-red' : ''}`} />
 </button>

 {/* Filter Dropdown */}
 {filterOpen && (
 <div className="absolute top-8 right-6 bg-white border border-primary-red rounded-xl shadow-lg w-32 overflow-hidden z-20">
 <div className="flex flex-col">
 <button className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 hover:bg-gray-50 border-b border-gray-100">Pending</button>
 <button className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 hover:bg-gray-50 border-b border-gray-100">Recived</button>
 <button className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 hover:bg-gray-50 border-b border-gray-100">last month</button>
 <button className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 hover:bg-gray-50">Clear</button>
 </div>
 </div>
 )}
 </div>

 {/* Transactions List */}
 <div className="px-4 sm:px-6 flex flex-col gap-6 mb-10">
 {transactions.map((tx) => (
 <div key={tx.id} className="flex justify-between items-center">
 <div className="flex items-center gap-3 min-w-0">
 <Image src={profile.profilePic} alt="User" width={40} height={40} className="w-11 h-11 rounded-full object-cover shrink-0" />
 <div className="flex flex-col min-w-0">
 <span className="text-[14px] font-bold text-[#1a1a2e] mb-0.5 truncate pr-2">{profile.fullName}</span>
 <span className="text-[10px] font-medium text-gray-400 truncate">{tx.date}</span>
 </div>
 </div>
 <div className="flex flex-col items-end shrink-0">
 <span className={`text-[14px] font-bold ${
 tx.type === 'withdraw' ? 'text-primary-red' : 
 tx.type === 'received' ? 'text-[#2ed47a]' : 
 'text-[#fbc02d]'
 }`}>{tx.amount}</span>
 {tx.status && (
 <span className="text-[10px] font-medium text-gray-400 mt-0.5">{tx.status}</span>
 )}
 </div>
 </div>
 ))}
 </div>

 {/* Campaign Banner */}
 <section className="px-4 mb-8">
 <div className="bg-[#EF4823] rounded-2xl p-6 flex justify-between items-center relative overflow-hidden shadow-md h-[100px]">
 <div className="absolute top-0 right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
 <div className="absolute bottom-0 left-10 w-24 h-24 bg-white opacity-10 rounded-full blur-xl transform -translate-x-10 translate-y-10"></div>
 <div className="relative z-10">
 <div className="flex flex-col">
 <span className="text-[13px] font-medium text-white/90 mb-0.5">Find More</span>
 <span className="text-xl font-medium text-white tracking-wide">campaigns</span>
 </div>
 </div>
 <button onClick={() => router.push('/campaigns')} className="relative z-10 px-6 py-2.5 bg-[#d8f042] text-[#EF4823] text-sm font-bold rounded-full shadow-sm hover:shadow-md transition-shadow">View</button>
 </div>
 </section>
 </div>

 <BottomNav profilePic={profile.profilePic} />
 </div>
 );
}
