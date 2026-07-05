'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Bell, CheckCircle } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import { useKnockFeed } from "@knocklabs/react";

export default function NotificationsPage() {
 const router = useRouter();

 // Use Knock's headless UI hooks
 const { feedClient, useFeedStore } = useKnockFeed()
 const { items, metadata } = useFeedStore()
 
 // Fetch the feed when the component mounts
 useEffect(() => {
   feedClient.fetch()
 }, [feedClient])

 // Helper to format time
 const formatTime = (dateString: string) => {
   const date = new Date(dateString)
   const now = new Date()
   const diffMs = now.getTime() - date.getTime()
   const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
   if (diffHrs < 1) {
     const diffMins = Math.floor(diffMs / (1000 * 60))
     return `${diffMins} min ago`
   }
   if (diffHrs < 24) return `${diffHrs} hours ago`
   return `${Math.floor(diffHrs / 24)} days ago`
 }

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
 <h1 className="text-[20px] font-extrabold text-[#1a1a2e] tracking-tight">Notifications {metadata.unread_count > 0 && <span className="bg-[#EF4823] text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{metadata.unread_count}</span>}</h1>
 <button 
  onClick={() => feedClient.markAllAsRead()}
  className="text-[13px] font-bold text-[#EF4823] shrink-0 disabled:opacity-50"
  disabled={metadata.unread_count === 0}
 >
 Read all
 </button>
 </div>

 {/* Notifications List */}
 <div className="px-4 sm:px-6 flex flex-col gap-5">
  {items.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-20">
      <Bell className="w-12 h-12 mb-4 text-gray-200" />
      <p className="text-sm font-medium">No notifications yet.</p>
    </div>
  ) : (
    items.map((notif: any) => (
      <div 
        key={notif.id} 
        onClick={() => {
          if (!notif.read_at) feedClient.markAsRead(notif);
        }}
        className={`bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border cursor-pointer transition-all ${
          !notif.read_at ? "border-orange-200 bg-orange-50/30" : "border-white"
        }`}
      >
      
      {/* Logo */}
      <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center mb-4 relative overflow-hidden ${
        notif.blocks[0]?.name === "success" ? "bg-emerald-500" : "bg-[#00a8ff]"
      }`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {notif.blocks[0]?.name === "success" ? (
            <CheckCircle className="w-6 h-6 text-white" />
          ) : (
            <div className="w-6 h-6 border-[3px] border-white rounded-sm transform rotate-45 flex items-center justify-center">
              <div className="w-full h-0.5 bg-white transform -rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div 
        className="text-[13px] text-gray-500 leading-relaxed mb-5 knock-content"
        dangerouslySetInnerHTML={{ __html: notif.blocks[0]?.rendered || notif.data?.message || "You have a new notification!" }}
      />

      {/* Action & Time */}
      <div className="flex justify-between items-end">
      <button className="py-2.5 px-6 bg-[#EF4823] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] hover:-translate-y-0.5 transition-transform">
      {notif.data?.actionLabel || "See Details"}
      </button>
      <span className="text-[11px] font-medium text-gray-400 mb-1">{formatTime(notif.inserted_at)}</span>
      </div>
      
      </div>
    ))
  )}
 </div>

 <BottomNav />
 </div>
 );
}
