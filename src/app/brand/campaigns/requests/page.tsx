"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Send, Bookmark } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

// SVG for Verified Badge
const VerifiedBadge = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4823" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export default function CampaignRequestsPage() {
  const router = useRouter()

  const requests = [1, 2] // Two dummy requests

  return (
    <div className="h-full bg-white font-sans flex justify-center overflow-hidden">
      <div className="w-full w-full bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="pt-12 px-5 pb-6 shrink-0 z-20 bg-white flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4823] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          
          <h1 className="text-[#1E1B4B] font-extrabold text-[18px]">Requests</h1>
          
          <div className="w-10 h-10"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32 touch-pan-y flex flex-col gap-8 relative bg-gray-50/30">
          
          {requests.map((req) => (
            <div key={req} className="flex flex-col gap-2">
              
              {/* Creator Card */}
              <div 
                onClick={() => router.push("/brand/campaigns/requests/detail")}
                className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="p-4 flex gap-4 h-[126px] z-10 relative">
                  <span className="absolute bottom-4 right-4 text-gray-300 text-[10px] font-medium">25 minute ago</span>
                  
                  {/* Profile Pic */}
                  <div className="w-[84px] h-[84px] rounded-[18px] bg-gray-200 overflow-hidden shrink-0 relative mt-1">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" alt="Dummy" className="object-cover w-full h-full" />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 flex flex-col pt-1">
                    <div className="flex justify-end gap-2.5 mb-1.5">
                      <button><Send className="w-[15px] h-[15px] text-gray-400 hover:text-gray-600" /></button>
                      <button><Bookmark className="w-[15px] h-[15px] text-gray-400 hover:text-gray-600" /></button>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <h3 className="text-[18px] font-extrabold text-gray-700 leading-none">Lorem Ipsum</h3>
                      <VerifiedBadge className="shrink-0 mt-0.5" />
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-full">Fashion</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-full">UGC</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FEF5ED] flex-1 flex items-center justify-around py-4">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[#EF4823] font-black text-[15px]">44.5k</span>
                    <span className="text-gray-400 text-[9px] font-semibold tracking-wide">Followers</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[#EF4823] font-black text-[15px]">22.8k</span>
                    <span className="text-gray-400 text-[9px] font-semibold tracking-wide">Avg Viewership</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[#EF4823] font-black text-[15px]">38.9k</span>
                    <span className="text-gray-400 text-[9px] font-semibold tracking-wide">Avg Engagement</span>
                  </div>
                </div>
              </div>

              {/* Campaign Card below it */}
              <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col relative border border-gray-50">
                <div className="w-10 h-10 rounded-[12px] bg-gray-100 flex items-center justify-center mb-4">
                   <div className="w-5 h-5 bg-blue-500 rounded-sm rotate-45 transform flex items-center justify-center opacity-40"></div>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-gray-800 text-[15px]">Glow With Radiance</h3>
                    <p className="text-gray-400 text-[11px] font-medium">- Skincare Brand Campaign</p>
                  </div>
                  <div className="flex flex-col items-end pt-1">
                    <span className="text-gray-400 text-[10px] font-bold">Budget</span>
                    <span className="text-[#EF4823] font-bold text-[15px]">₹6000</span>
                  </div>
                </div>

                <div className="bg-[#FCF5EB] text-[#D9873E] text-[10px] font-bold py-1.5 px-3 rounded-full inline-block w-fit mb-3 mt-1">
                  04 September - 10 September 2025
                </div>

                <p className="text-gray-500 text-[11px] leading-relaxed mb-4 pr-2">
                  We're looking for lifestyle and beauty influencers to showcase our new Radiance Glow Serum. <span className="text-[#EF4823] font-bold cursor-pointer hover:underline">Read more</span>
                </p>

                <div className="flex gap-3">
                  <button className="flex-1 bg-[#EF4823] text-white text-[12px] font-bold py-3 rounded-[12px] hover:bg-[#e03d1b] transition-colors">
                    Accept
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-500 text-[12px] font-bold py-3 rounded-[12px] hover:bg-gray-200 transition-colors">
                    Reject
                  </button>
                </div>
              </div>

            </div>
          ))}

        </div>
        
        <BottomNav />
      </div>
    </div>
  )
}
