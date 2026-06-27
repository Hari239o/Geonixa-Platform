"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Send, Bookmark, Linkedin, Twitter, Facebook, Instagram } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

// SVG for Verified Badge
const VerifiedBadge = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4823" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export default function RequestDetailPage() {
  const router = useRouter()

  return (
    <div className="h-full bg-white font-sans flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Header with Accept / Reject */}
        <div className="pt-12 px-5 pb-4 shrink-0 bg-white z-20 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:opacity-80 transition-opacity shrink-0"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>

          <div className="flex gap-2 w-full max-w-[220px]">
            <button className="flex-1 bg-[#EF4823] text-white text-[11px] font-bold py-2.5 rounded-full hover:bg-[#e03d1b] transition-colors shadow-sm">
              Accept
            </button>
            <button className="flex-1 bg-gray-100 text-gray-400 text-[11px] font-bold py-2.5 rounded-full hover:bg-gray-200 transition-colors">
              Reject
            </button>
          </div>
          
          <div className="w-10 h-10 shrink-0"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar touch-pan-y flex flex-col relative bg-white pb-32">
          
          {/* Top Profile Card */}
          <div className="px-5 pt-4">
            <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden border border-gray-50">
              <div className="p-4 flex gap-4 h-[110px] relative">
                
                {/* Profile Pic */}
                <div className="w-[76px] h-[76px] rounded-[18px] bg-gray-200 overflow-hidden shrink-0 relative mt-1">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" alt="Dummy" className="object-cover w-full h-full" />
                </div>
                
                {/* Info */}
                <div className="flex-1 flex flex-col pt-1">
                  <div className="flex justify-end gap-2.5 mb-2">
                    <button><Send className="w-[15px] h-[15px] text-gray-400 hover:text-gray-600" /></button>
                    <button><Bookmark className="w-[15px] h-[15px] text-gray-400 hover:text-gray-600" /></button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <h3 className="text-[20px] font-extrabold text-gray-700 leading-none">Lorem Ipsum</h3>
                    <VerifiedBadge className="shrink-0 mt-0.5" />
                  </div>
                </div>
              </div>

              <div className="bg-[#FEF5ED] flex items-center justify-around py-4 mt-2">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[#EF4823] font-black text-[16px]">44.5k</span>
                  <span className="text-gray-400 text-[9px] font-semibold tracking-wide">Followers</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[#EF4823] font-black text-[16px]">22.8k</span>
                  <span className="text-gray-400 text-[9px] font-semibold tracking-wide">Avg Viewership</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[#EF4823] font-black text-[16px]">38.9k</span>
                  <span className="text-gray-400 text-[9px] font-semibold tracking-wide">Avg Engagement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-5 mt-6 mb-4">
            <div className="flex bg-gray-50 rounded-full p-1">
              <button className="flex-1 bg-[#EF4823] text-white text-[12px] font-bold py-2.5 rounded-full shadow-sm">
                About
              </button>
              <button className="flex-1 text-gray-400 text-[12px] font-bold py-2.5 rounded-full hover:text-gray-600">
                Portfolio
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="px-5 flex flex-col gap-6">
            
            {/* Bio */}
            <div>
              <h4 className="text-gray-800 font-extrabold text-[13px] mb-2">Bio</h4>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit. Tortor Turpis Sodales Nulla Velit. Nunc Cum Vitae, Rhoncus Leo Id. Volutpat Duis Tincunt Pretium Luctus Pulvinar Pretium.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="flex items-end gap-1">
                <span className="text-gray-800 font-extrabold text-[16px] leading-none">17</span>
                <span className="text-gray-400 text-[10px] font-medium leading-none pb-0.5">Projects Done</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-gray-800 font-extrabold text-[16px] leading-none">92%</span>
                <span className="text-gray-400 text-[10px] font-medium leading-none pb-0.5">Success Rate</span>
              </div>
            </div>

            {/* Budgets */}
            <div>
              <h4 className="text-gray-800 font-extrabold text-[13px] mb-3">Budgets</h4>
              <div className="flex flex-col gap-2">
                {[
                  { label: "1 Reel", value: "₹ xxx" },
                  { label: "5 Reels", value: "₹ xxx" },
                  { label: "10 Reels", value: "₹ xxx" },
                  { label: "Custom", value: "₹ xxx" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center max-w-[200px]">
                    <span className="text-gray-500 text-[12px] font-medium">{item.label}</span>
                    <span className="text-gray-400 text-[12px] font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div>
              <h4 className="text-gray-800 font-extrabold text-[13px] mb-3">Badges</h4>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#EF4823] flex items-center justify-center shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="mt-0.5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* On The Web */}
            <div className="mb-6">
              <h4 className="text-gray-800 font-extrabold text-[13px] mb-3">On The Web</h4>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><Linkedin className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><Facebook className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><Instagram className="w-4 h-4" /></a>
              </div>
            </div>

          </div>
        </div>
        
        <BottomNav />
      </div>
    </div>
  )
}
