'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Filter, ArrowUpRight, ArrowDownLeft, Building2 } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import { useSession } from 'next-auth/react';

export default function PartnerWalletPage() {
 const router = useRouter();
 const [filterOpen, setFilterOpen] = useState(false);
 const [profile, setProfile] = useState({
   fullName: 'Partner Agency',
   profilePic: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop'
 });

 useEffect(() => {
    async function loadProfile() {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('kaling_partner_profile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.fullName) setProfile(prev => ({ ...prev, fullName: parsed.fullName }));
            if (parsed.profilePic) setProfile(prev => ({ ...prev, profilePic: parsed.profilePic }));
          } catch(e) {}
        } else {
           fetch('/api/user/complete-profile').then(res => res.json()).then(data => {
             if (data.profile) {
               if (data.profile.fullName) setProfile(prev => ({ ...prev, fullName: data.profile.fullName }));
               if (data.profile.profilePic) setProfile(prev => ({ ...prev, profilePic: data.profile.profilePic }));
             }
           }).catch(console.error);
        }
      }
    }
    loadProfile();
  }, []);

  const { data: session } = useSession();
  
  // Make it realistic by computing based on dummy data simulating real API logic
  const credits = (session?.user as any)?.credits || 0;
  const balance = credits > 0 ? credits * 10 : 85400; // Realistic Agency Balance
  const pending = 12500;
  const received = 345000;

  const transactions = [
    {
      id: 'tx-1',
      name: 'Glow With Radiance Campaign',
      date: '10 Sep 2025 • 02:45 PM',
      amount: '+₹25,000',
      type: 'received',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop'
    },
    {
      id: 'tx-2',
      name: 'Urban Style Walk Agency Fee',
      date: '08 Sep 2025 • 11:20 AM',
      amount: '+₹15,400',
      type: 'received',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100&h=100&fit=crop'
    },
    {
      id: 'tx-3',
      name: 'Bank Transfer (Withdrawal)',
      date: '05 Sep 2025 • 09:15 AM',
      amount: '-₹50,000',
      type: 'withdraw',
      status: 'Processed',
      image: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=100&h=100&fit=crop' // Bank icon metaphor
    },
    {
      id: 'tx-4',
      name: 'Summer Vibes Commission',
      date: '01 Sep 2025 • 04:30 PM',
      amount: '+₹45,000',
      type: 'received',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1513346940221-6f673d962e97?w=100&h=100&fit=crop'
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-[#F8F9FA] font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-28 relative flex flex-col">
        
        {/* Header & Balance Card */}
        <div className="bg-white rounded-b-[32px] px-6 pt-8 pb-10 shadow-sm relative z-10 shrink-0">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm">
                <img src={profile.profilePic} alt={profile.fullName} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <p className="text-[12px] text-gray-500 font-medium">Agency Wallet</p>
                <h1 className="text-[16px] font-extrabold text-[#1a1a2e] tracking-tight truncate max-w-[150px]">
                  {profile.fullName}
                </h1>
              </div>
            </div>
            
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 cursor-pointer">
              <Building2 className="w-5 h-5 text-gray-600" />
            </div>
          </div>

          <div className="flex flex-col items-center mb-6">
            <span className="text-[14px] text-gray-500 font-medium mb-1">Total Available Balance</span>
            <span className="text-[36px] font-extrabold text-[#1a1a2e] tracking-tight">₹{balance.toLocaleString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => router.push('/wallet/add-credits')}
              className="flex-1 bg-white border-2 border-[#1a1a2e] text-[#1a1a2e] py-3.5 rounded-[16px] font-bold text-[14px] shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDownLeft className="w-4 h-4" /> Add Funds
            </button>
            <button 
              onClick={() => router.push('/wallet/withdraw')}
              className="flex-1 bg-[#1a1a2e] text-white py-3.5 rounded-[16px] font-bold text-[14px] shadow-sm hover:bg-[#2a2a3e] transition-colors flex items-center justify-center gap-2"
            >
              Withdraw <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-5 mt-6 mb-8 shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex flex-col">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                <span className="text-[#EF4823] font-bold text-lg">₹</span>
              </div>
              <span className="text-[12px] text-gray-500 font-medium mb-1">Pending Clearance</span>
              <span className="text-[20px] font-bold text-[#1a1a2e]">₹{pending.toLocaleString()}</span>
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex flex-col">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <ArrowDownLeft className="w-5 h-5 text-[#2ECC71]" />
              </div>
              <span className="text-[12px] text-gray-500 font-medium mb-1">Total Received</span>
              <span className="text-[20px] font-bold text-[#1a1a2e]">₹{received.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="px-5 flex flex-col flex-1 bg-white rounded-t-[32px] pt-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[18px] font-extrabold text-[#1a1a2e]">Recent Transactions</h2>
            <div className="relative">
              <button 
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className={`w-4 h-4 ${filterOpen ? 'text-[#EF4823]' : 'text-gray-600'}`} />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-xl shadow-xl w-36 overflow-hidden z-20 flex flex-col py-2">
                  <button className="px-4 py-2 text-left text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-[#EF4823]">All</button>
                  <button className="px-4 py-2 text-left text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-[#EF4823]">Received</button>
                  <button className="px-4 py-2 text-left text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-[#EF4823]">Withdrawn</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center group cursor-pointer">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                    <img src={tx.image} alt={tx.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[15px] font-bold text-[#1a1a2e] mb-0.5 truncate">{tx.name}</span>
                    <span className="text-[11px] font-medium text-gray-400">{tx.date}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-3">
                  <span className={`text-[15px] font-bold tracking-tight ${
                    tx.type === 'withdraw' ? 'text-[#1a1a2e]' : 'text-[#2ECC71]'
                  }`}>{tx.amount}</span>
                  <span className="text-[11px] font-medium text-gray-400 mt-0.5">{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
