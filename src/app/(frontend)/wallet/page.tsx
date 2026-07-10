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

  const transactions = [
    { id: '1', name: 'Alpha Studios', date: '26 .11 .2021 - 5:15 AM', amount: '-₹5000', type: 'withdraw', status: 'Withdrawn', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' },
    { id: '2', name: 'Creative Media', date: '21 .11 .2021 - 2:15 PM', amount: '₹8000', type: 'received', status: '', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
    { id: '3', name: 'Zephyr Brands', date: '19 .11 .2021 - 4:35 AM', amount: '₹5000', type: 'pending', status: 'Pending', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' }
  ];

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 relative">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 pb-4 flex justify-between items-start">
          <div className="flex flex-col truncate pr-2">
            <h1 className="text-[18px] font-extrabold text-[#1a1a2e] tracking-tight mb-1">
              Hello {profile.fullName.split(' ')[0]},
            </h1>
            <p className="text-[13px] text-gray-400 font-medium mb-1">Your available balance</p>
          </div>
          <div className="text-[28px] font-extrabold text-primary-red tracking-tight mt-1">
            ₹15,901
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 px-4 sm:px-6 mb-6">
          <button 
            onClick={() => router.push('/wallet/add-credits')}
            className="flex-1 bg-[#2ECC71] text-white py-3 rounded-[12px] font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
          >
            Add Funds
          </button>
          <button 
            onClick={() => router.push('/wallet/withdraw')}
            className="flex-1 bg-[#EF4823] text-white py-3 rounded-[12px] font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
          >
            Withdraw
          </button>
        </div>

        {/* Stats Card */}
        <div className="px-4 sm:px-6 mb-8">
          <div className="bg-[#EF4823] rounded-[16px] p-4 flex justify-between items-center shadow-md relative overflow-hidden">
            <div className="flex flex-col items-center flex-1 border-r border-white/20">
              <span className="text-[18px] font-bold text-white mb-0.5">₹5,820</span>
              <span className="text-[11px] text-white/90 font-medium">Pending</span>
            </div>
            <div className="flex flex-col items-center flex-1 border-r border-white/20">
              <span className="text-[18px] font-bold text-white mb-0.5">₹20,890</span>
              <span className="text-[11px] text-white/90 font-medium">Received</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-[18px] font-bold text-white mb-0.5">178</span>
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
            <div className="absolute top-8 right-6 bg-white border border-primary-red rounded-xl shadow-lg w-32 overflow-hidden z-20 flex flex-col p-1">
              <button className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 hover:bg-gray-50">Pending</button>
              <button className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 hover:bg-gray-50">Recived</button>
              <button className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 hover:bg-gray-50">last month</button>
              <button className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 hover:bg-gray-50">Clear</button>
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="px-4 sm:px-6 flex flex-col gap-6 mb-10">
          {transactions.map((tx) => (
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
          ))}
        </div>

        {/* Floating Banner */}
        <div className="absolute bottom-6 w-full px-5 z-30 pointer-events-none">
          <div className="w-full max-w-[335px] mx-auto bg-[#EF4823] rounded-[18px] p-4 flex items-center justify-between shadow-xl pointer-events-auto relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10 flex flex-col">
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
