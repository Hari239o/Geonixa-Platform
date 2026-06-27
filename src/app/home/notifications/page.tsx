'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';

export default function NotificationsPage() {
 const router = useRouter();

 const notifications = [
 { id: 1, brand: 'Lorem inc', time: '6 Hours' },
 { id: 2, brand: 'Lorem inc', time: '6 Hours' },
 { id: 3, brand: 'Lorem inc', time: '6 Hours' }
 ];

 return (
 <div className="w-full max-w-md mx-auto min-h-screen bg-[#fafbfc] pb-24 font-sans relative overflow-x-hidden flex flex-col">
 
 {/* Header */}
 <div className="px-4 sm:px-6 pt-4 pb-8 flex items-center justify-between sticky top-0 z-10 bg-[#fafbfc]">
 <button 
 onClick={() => router.back()}
 className="w-12 h-12 bg-orange-100/80 text-[#EF4823] rounded-[16px] flex items-center justify-center transition-transform active:scale-95 shrink-0"
 >
 <ChevronLeft size={28} strokeWidth={2.5} />
 </button>
 <h1 className="text-[20px] font-extrabold text-[#1a1a2e] tracking-tight">Notifications</h1>
 <button className="text-[13px] font-bold text-[#EF4823] shrink-0">
 Read all
 </button>
 </div>

 {/* Notifications List */}
 <div className="px-4 sm:px-6 flex flex-col gap-5">
 {notifications.map((notif) => (
 <div key={notif.id} className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-white">
 
 {/* Logo */}
 <div className="w-[52px] h-[52px] bg-[#00a8ff] rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
 <div className="absolute inset-0 flex items-center justify-center">
 {/* Abstract shape */}
 <div className="w-6 h-6 border-[3px] border-white rounded-sm transform rotate-45 flex items-center justify-center">
 <div className="w-full h-0.5 bg-white transform -rotate-45"></div>
 </div>
 </div>
 </div>

 {/* Content */}
 <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
 <span className="font-extrabold text-[#1a1a2e]">{notif.brand}</span> is looking for a Creators. Check out this and 9 other gigs recommendations
 </p>

 {/* Action & Time */}
 <div className="flex justify-between items-end">
 <button className="py-2.5 px-6 bg-[#EF4823] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] hover:-translate-y-0.5 transition-transform">
 See Gig
 </button>
 <span className="text-[11px] font-medium text-gray-400 mb-1">{notif.time}</span>
 </div>
 
 </div>
 ))}
 </div>

 <BottomNav />
 </div>
 );
}
