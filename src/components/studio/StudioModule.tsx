'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import BottomNav from '../shared/BottomNav';
import { Logo } from '@/components/ui/Logo';
import { getItem } from '@/utils/storage';

export default function StudioModule() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [profilePic, setProfilePic] = useState<string>('/profile_pic.png');

  useEffect(() => {
    async function loadProfile() {
      if (typeof window !== 'undefined') {
        const parsed = await getItem<any>('kaling_user_profile');
        if (parsed && parsed.profilePic) {
          setProfilePic(parsed.profilePic);
        }
      }
    }
    loadProfile();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto h-full bg-white relative flex flex-col overflow-hidden font-sans">
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
      {/* Header */}
      <div className="px-6 pt-10 pb-4 z-10">
        <button 
          onClick={() => router.back()}
          className="w-12 h-12 bg-[#fff0e5] text-[#EF4823] rounded-[16px] flex items-center justify-center transition-transform active:scale-95"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Faded Magic Wand Center */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-20 z-0">
        <div className="text-gray-200 pointer-events-none transform scale-[4]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            width={48}
            height={48}
          >
            <g transform="rotate(45 12 12)">
              <path fillRule="evenodd" clipRule="evenodd" d="M8.5 5C8.5 4.44772 8.94772 4 9.5 4H14.5C15.0523 4 15.5 4.44772 15.5 5V19C15.5 19.5523 15.0523 20 14.5 20H9.5C8.94772 20 8.5 19.5523 8.5 19V5ZM10 5.5H14V9.5H10V5.5Z" fill="currentColor" />
            </g>
            <path d="M10 2.5 Q10 5 12.5 5 Q10 5 10 7.5 Q10 5 7.5 5 Q10 5 10 2.5 Z" fill="currentColor" />
            <path d="M19 4 Q19 6 21 6 Q19 6 19 8 Q19 6 17 6 Q19 6 19 4 Z" fill="currentColor" />
            <path d="M16.5 13 Q16.5 15 18.5 15 Q16.5 15 16.5 17 Q16.5 15 14.5 15 Q16.5 15 16.5 13 Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Bottom Area */}
      <div className="px-6 pb-[120px] z-10 relative bg-gradient-to-t from-white via-white to-transparent pt-10">
        <h2 className="text-[20px] font-extrabold text-[#1a1a2e] text-center mb-6 tracking-tight">What can I help with?</h2>
        
        <div className="flex items-center justify-center gap-3 mb-6 overflow-x-auto no-scrollbar">
          <button className="px-5 py-2.5 bg-[#f4f4f5] text-gray-500 text-[11px] font-bold rounded-full whitespace-nowrap active:scale-95 transition-transform">
            Content Ideas
          </button>
          <button className="px-5 py-2.5 bg-[#f4f4f5] text-gray-500 text-[11px] font-bold rounded-full whitespace-nowrap active:scale-95 transition-transform">
            Captions/Descriptions
          </button>
          <button className="px-5 py-2.5 bg-[#f4f4f5] text-gray-500 text-[11px] font-bold rounded-full whitespace-nowrap active:scale-95 transition-transform">
            Scripts
          </button>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Send a message." 
            className="w-full bg-white border border-gray-100 rounded-2xl pl-5 pr-14 py-4 outline-none text-[13px] text-gray-900 shadow-[0_2px_15px_rgba(0,0,0,0.04)] font-medium placeholder-gray-400"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#EF4823] p-1 active:scale-95 transition-transform">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" />
            </svg>
          </button>
        </div>
      </div>

      </div>
      <BottomNav profilePic={profilePic} />
    </div>
  );
}
