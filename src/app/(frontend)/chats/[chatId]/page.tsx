'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Send, Bot, User, ShieldCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export default function ChatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string;

  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      const data = await res.json();
      if (data.success) {
        setChat(data.chat);
        setMessages(data.chat.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;
    
    setSending(true);
    const tempMsg = inputValue;
    setInputValue('');

    // Optimistic UI
    setMessages(prev => [...prev, {
      id: 'temp-' + Date.now(),
      senderId: 'me', // Will be re-fetched and updated
      senderName: 'Me',
      content: tempMsg,
      createdAt: new Date().toISOString()
    }]);

    try {
      const res = await fetch(`/api/chats/${chatId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tempMsg })
      });
      if (!res.ok) {
        // If failed, could restore input, but for simplicity we rely on next poll
      }
      await fetchChat(); // Force sync
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex justify-center items-center">Loading...</div>;
  }

  if (!chat) {
    return <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <p>Chat not found</p>
      <button onClick={() => router.back()} className="mt-4 text-[#EF4423]">Go back</button>
    </div>;
  }

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-white font-sans flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="bg-white pt-5 px-5 pb-4 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between z-20">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4423] hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-[#1E1B4B] font-extrabold text-[16px]">Deal Chat</h1>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
            {chat.status === 'bot' ? 'Waiting for Admin' : chat.status === 'admin_joined' ? 'Admin Joined' : 'Resolved'}
          </span>
        </div>
        <div className="w-10 h-10"></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50/50 flex flex-col gap-4">
        {messages.map((msg, idx) => {
          const isBot = msg.senderId === 'bot';
          const isAdmin = msg.senderName === 'Kalinq Admin';
          const isMe = msg.senderId === 'me' || (!isBot && !isAdmin); // Approximation since we don't strictly have myUserId in state for comparison here, wait, we do not know who is me strictly without session. Let's rely on senderId. Actually, if senderId is neither bot nor admin, and it matches my session id it's me. For simplicity, we just check if it's the automated bot.
          
          // Better logic: since we don't have user session here easily without extra fetch, we'll align based on senderName.
          const alignRight = msg.senderName === 'User' || msg.senderName === 'Me' || (!isBot && !isAdmin);

          return (
            <div 
              key={msg.id || idx}
              className={`flex gap-3 max-w-[85%] ${alignRight ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto 
                ${isBot ? 'bg-gray-200' : isAdmin ? 'bg-blue-100' : 'bg-[#EF4423]'}`}
              >
                {isBot ? <Bot size={16} className="text-gray-600" /> : 
                 isAdmin ? <ShieldCheck size={16} className="text-blue-600" /> : 
                 <User size={16} className="text-white" />}
              </div>
              <div className="flex flex-col gap-1">
                {!alignRight && <span className="text-[10px] text-gray-400 font-medium ml-1">{msg.senderName}</span>}
                <div className={`p-3.5 text-[14px] leading-relaxed shadow-sm
                  ${alignRight 
                    ? 'bg-[#EF4423] text-white rounded-2xl rounded-br-sm' 
                    : isAdmin 
                      ? 'bg-blue-500 text-white rounded-2xl rounded-bl-sm' 
                      : 'bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="relative flex items-center">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={sending}
            className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-[#EF4423] focus:ring-2 focus:ring-[#EF4423]/20 rounded-full py-3.5 pl-5 pr-14 text-[14px] font-medium transition-all outline-none disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            className="absolute right-1.5 w-10 h-10 bg-[#EF4423] hover:bg-[#d83e1c] disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
