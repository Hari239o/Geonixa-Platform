"use client"

import React, { useState } from "react"
import BottomNav from "@/components/brand/BottomNav"

export default function ExpertsPartnersPage() {
  const [mainTab, setMainTab] = useState<"experts" | "partners">("experts")

  return (
    <div className="h-[100dvh] bg-white font-sans flex justify-center overflow-hidden w-full">
      <div className="w-full bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Header - Large Logo */}
        <div className="pt-16 px-5 pb-8 shrink-0 bg-white z-20 flex items-center justify-center">
          <img 
            src="/profile.png" 
            alt="Kalinq Logo" 
            className="object-contain w-[142px] h-[70px]" 
          />
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden px-5">
          
          {/* Primary Tabs */}
          <div className="flex bg-white rounded-[14px] p-1 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-50 mb-10 shrink-0 mx-auto w-full max-w-sm">
            <button 
              onClick={() => setMainTab("experts")}
              className={`flex-1 py-3.5 rounded-[12px] text-[13px] font-extrabold transition-colors ${mainTab === "experts" ? "bg-[#EF4823] text-white shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
            >
              Our Experts
            </button>
            <button 
              onClick={() => setMainTab("partners")}
              className={`flex-1 py-3.5 rounded-[12px] text-[13px] font-extrabold transition-colors ${mainTab === "partners" ? "bg-[#EF4823] text-white shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
            >
              Partners
            </button>
          </div>

          {/* Simple Contact View */}
          <div className="flex-1 flex flex-col items-center justify-center pb-32">
            <h2 className="text-[#1E1B4B] text-[22px] font-extrabold mb-1 tracking-tight">
              Speak to our experts
            </h2>
            <p className="text-gray-400 text-[13px] font-medium mb-8">Call us now or whatsapp us</p>
            
            <h1 className="text-[#8e959f] font-extrabold text-[28px] tracking-wide mb-10">
              +91 000 000 0000
            </h1>
            
            <button className="w-full max-w-sm bg-[#EF4823] text-white font-bold text-[14px] tracking-widest uppercase py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors">
              Call Now
            </button>
          </div>
          
        </div>
        
        {/* Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  )
}
