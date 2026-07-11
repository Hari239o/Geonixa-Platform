'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';

export default function ChatsPage() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch('/api/chats');
        const data = await res.json();
        if (data.success) {
          setChats(data.chats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchChats();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 font-sans relative flex flex-col overflow-hidden pb-24">
      {/* Header */}
      <div className="bg-white pt-5 px-5 pb-4 shrink-0 shadow-sm flex items-center justify-between sticky top-0 z-20">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4423] hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <h1 className="text-[#1E1B4B] font-extrabold text-[18px]">Messages</h1>
        <div className="w-10 h-10"></div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-6 flex flex-col gap-3">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">Loading chats...</p>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
            <p>No active chats yet</p>
          </div>
        ) : (
          chats.map((chat, idx) => (
            <div 
              key={`${chat.type || 'chat'}-${chat.id}-${idx}`}
              onClick={() => {
                if (chat.type === 'chat' || !chat.type) {
                  router.push(`/chats/${chat.id}`);
                } else {
                  router.push(`/campaigns/${chat.campaignId}`);
                }
              }}
              className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-2 border border-gray-100"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#EF4423] uppercase tracking-wide truncate max-w-[70%]">
                  {chat.title || `Deal: ${chat.dealId?.slice(0, 8)}...`}
                </span>
                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                  {new Date(chat.updatedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800">
                  {chat.type === 'chat' || !chat.type
                    ? (chat.status === 'bot' ? 'Waiting for Admin' : chat.status === 'admin_joined' ? 'Admin Joined' : 'Resolved') 
                    : chat.status}
                </span>
                {(!chat.type || chat.type === 'chat') && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                    {chat.messagesCount ?? (chat.messages?.length || 0)} msgs
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
