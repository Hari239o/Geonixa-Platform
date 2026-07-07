'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Bell, CheckCircle, Check } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';

export default function NotificationsPage() {
 const router = useRouter();
 const [dbNotifs, setDbNotifs] = useState<any[]>([]);

 useEffect(() => {
   async function fetchNotifs() {
     try {
       const res = await fetch('/api/notifications');
       const data = await res.json();
       if (data.success && data.notifications) {
         setDbNotifs(data.notifications);
       }
     } catch (e) {
       console.error(e);
     }
   }
   fetchNotifs();
 }, []);

 const markAsRead = async (id?: string) => {
   try {
     const res = await fetch('/api/notifications', {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(id ? { notificationId: id } : {})
     });
     if (res.ok) {
       if (id) {
         setDbNotifs(dbNotifs.map(n => n.id === id ? { ...n, isRead: true } : n));
       } else {
         setDbNotifs(dbNotifs.map(n => ({ ...n, isRead: true })));
       }
     }
   } catch (e) {
     console.error(e);
   }
 };

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

 const unreadNotifs = dbNotifs.filter(n => !n.isRead);

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
 <h1 className="text-[20px] font-extrabold text-[#1a1a2e] tracking-tight">Notifications {unreadNotifs.length > 0 && <span className="bg-[#EF4823] text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{unreadNotifs.length}</span>}</h1>
 <button 
  onClick={() => markAsRead()}
  className="text-[13px] font-bold text-[#EF4823] shrink-0 disabled:opacity-50"
  disabled={unreadNotifs.length === 0}
 >
 Read all
 </button>
 </div>

 {/* Notifications List */}
 <div className="px-4 sm:px-6 flex flex-col gap-5">
  {unreadNotifs.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-20">
      <Bell className="w-12 h-12 mb-4 text-gray-200" />
      <p className="text-sm font-medium">No notifications yet.</p>
    </div>
  ) : (
    unreadNotifs.map((notif: any) => (
      <div 
        key={notif.id} 
        className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-orange-200 bg-orange-50/30 transition-all relative"
      >
      
      {/* Mark as read button */}
      <button 
        onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
        className="absolute top-4 right-4 text-xs font-bold text-gray-400 hover:text-[#EF4823] flex items-center gap-1 transition-colors"
      >
        <Check size={14} strokeWidth={2.5} /> Read
      </button>

      {/* Logo */}
      <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center mb-4 relative overflow-hidden ${
        notif.senderImage ? "" : (notif.title?.includes("Responded") ? "bg-emerald-500" : "bg-[#00a8ff]")
      }`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {notif.senderImage ? (
            <img src={notif.senderImage} alt="Profile" className="w-full h-full object-cover" />
          ) : notif.title?.includes("Responded") ? (
            <CheckCircle className="w-6 h-6 text-white" />
          ) : (
            <div className="w-6 h-6 border-[3px] border-white rounded-sm transform rotate-45 flex items-center justify-center">
              <div className="w-full h-0.5 bg-white transform -rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="text-[13px] text-gray-500 leading-relaxed mb-5 pr-8">
        <span className="font-bold block mb-1 text-gray-800">{notif.title}</span>
        {notif.message}
      </div>

      {/* Action & Time */}
      <div className="flex justify-between items-end">
      <button 
        onClick={() => { if(notif.actionUrl) router.push(notif.actionUrl) }}
        className="py-2.5 px-6 bg-[#EF4823] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] hover:-translate-y-0.5 transition-transform">
      {notif.actionLabel || "See Details"}
      </button>
      <span className="text-[11px] font-medium text-gray-400 mb-1">{formatTime(notif.createdAt)}</span>
      </div>
      
      </div>
    ))
  )}
 </div>

 <BottomNav />
 </div>
 );
}
