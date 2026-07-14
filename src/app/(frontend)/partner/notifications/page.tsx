"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import BottomNav from "@/components/shared/BottomNav";

export default function PartnerNotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          if (data.notifications) {
            setNotifications(data.notifications);
          }
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const handleReadAll = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

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
        <button 
          onClick={handleReadAll}
          className="text-[13px] font-bold text-[#EF4423] hover:underline"
        >
          Read all
        </button>
      </div>

      {/* Notifications List */}
      <div className="px-5 pt-6 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-[#EF4423] rounded-full animate-spin"></div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col relative ${!notification.isRead ? 'border-l-4 border-l-[#EF4423]' : ''}`}
            >
              {!notification.isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-[#EF4423] rounded-full"></div>
              )}
              <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center mb-4 text-white shadow-md shadow-blue-500/20 overflow-hidden">
                {notification.senderImage ? (
                  <img src={notification.senderImage} alt="Sender" className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
              </div>
              
              <p className="text-[13px] text-[#1a1a2e] font-medium leading-relaxed mb-4">
                <span className="font-extrabold">{notification.title}</span> {notification.message}
              </p>
              
              <div className="flex justify-between items-center">
                {notification.actionLabel ? (
                  <button 
                    onClick={() => notification.actionUrl ? router.push(notification.actionUrl) : null}
                    className="bg-[#EF4423] hover:bg-[#d63f1c] text-white text-[12px] font-bold px-5 py-2.5 rounded-[10px] shadow-sm transition-all active:scale-95"
                  >
                    {notification.actionLabel}
                  </button>
                ) : (
                  <div></div>
                )}
                <span className="text-[11px] font-medium text-gray-400">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[24px] p-8 text-center shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col items-center mt-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-1">No notifications yet</h3>
            <p className="text-[13px] text-gray-500">We'll let you know when something important happens.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
