"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, SendHorizontal } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

export default function AICampaignCreatePage() {
  const router = useRouter()

  return (
    <div className="h-full bg-white font-sans flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="pt-12 px-5 pb-4 shrink-0 bg-white z-20 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4823] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          
          <h1 className="text-[#1E1B4B] font-extrabold text-[18px]">Create Campaign</h1>
          
          {/* Empty div for flex balance */}
          <div className="w-10 h-10"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-5 pb-32 flex flex-col relative">
          
          {/* Centered Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
            <img src="/profile.png" alt="Kalinq Watermark" className="w-48 object-contain grayscale" />
          </div>

          {/* Bottom Chat Section */}
          <div className="mt-auto flex flex-col relative z-10 pb-4">
            
            <h2 className="text-gray-800 font-extrabold text-[18px] text-center mb-6">What can I help with?</h2>
            
            {/* Pills */}
            <div className="flex justify-center gap-3 mb-6">
              {["Brief", "Budget", "Creators"].map(pill => (
                <button key={pill} className="px-5 py-2 rounded-full border border-gray-200 text-gray-500 text-[11px] font-bold hover:bg-gray-50 transition-colors bg-white">
                  {pill}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="w-full bg-white border border-gray-200 rounded-[18px] flex items-center p-2 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
              <input 
                type="text" 
                placeholder="Send a message."
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-gray-700 font-medium px-3 placeholder:text-gray-400"
              />
              <button className="w-10 h-10 flex items-center justify-center text-[#EF4823] hover:bg-orange-50 rounded-xl transition-colors shrink-0">
                <SendHorizontal className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

          </div>
          
        </div>
        
        <BottomNav />
      </div>
    </div>
  )
}
