"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import BottomNav from "@/components/shared/BottomNav";

export default function PartnerNotificationsPage() {
  const router = useRouter();

  // Mock data for realistic notifications
  const notifications = [
    {
      id: 1,
      brand: "Glow & Co.",
      message: "is looking for a Creator. Check out this and 9 other gigs recommendations",
      time: "6 Hours",
      actionText: "See Gig",
      isUnread: true,
    },
    {
      id: 2,
      brand: "Nike",
      message: "is looking for a Creator. Check out this and 5 other gigs recommendations",
      time: "10 Hours",
      actionText: "See Gig",
      isUnread: false,
    },
    {
      id: 3,
      brand: "TechNova",
      message: "is looking for a Creator. Check out this and 12 other gigs recommendations",
      time: "1 Day",
      actionText: "See Gig",
      isUnread: false,
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8F9FA] pb-24 font-sans flex flex-col relative">
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 rounded-b-[24px]">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center bg-orange-50 hover:bg-orange-100 rounded-[12px] transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-[#EF4423]" />
        </button>
        <h1 className="text-[18px] font-extrabold text-[#1a1a2e]">Notifications</h1>
        <button className="text-[13px] font-bold text-[#EF4423] hover:underline">
          Read all
        </button>
      </div>

      {/* Notifications List */}
      <div className="px-5 pt-6 flex flex-col gap-4">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className="bg-white rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col"
          >
            <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center mb-4 text-white shadow-md shadow-blue-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            
            <p className="text-[13px] text-[#1a1a2e] font-medium leading-relaxed mb-4">
              <span className="font-extrabold">{notification.brand}</span> {notification.message}
            </p>
            
            <div className="flex justify-between items-center">
              <button className="bg-[#EF4423] hover:bg-[#d63f1c] text-white text-[12px] font-bold px-5 py-2.5 rounded-[10px] shadow-sm transition-all active:scale-95">
                {notification.actionText}
              </button>
              <span className="text-[11px] font-medium text-gray-400">
                {notification.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
