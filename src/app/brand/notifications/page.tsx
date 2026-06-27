"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Wand2 } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

export default function BrandNotificationsPage() {
  const router = useRouter()
  
  // Dummy data based on the screenshot
  const notifications = [
    { id: 1, time: "6 Hours" },
    { id: 2, time: "6 Hours" },
    { id: 3, time: "6 Hours" },
  ]

  return (
    <div className="h-full bg-[#F8F9FA] font-sans flex justify-center overflow-hidden">
      <div className="w-full w-full bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Header with Back Button */}
        <div className="pt-12 px-5 pb-6 shrink-0 z-20 bg-white flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4823] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          
          <h1 className="text-[#1E1B4B] font-extrabold text-[18px]">Notifications</h1>
          
          <button className="text-[#EF4823] text-[11px] font-bold tracking-wide hover:underline">
            Read all
          </button>
        </div>

        {/* Content Area - Scrollable List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32 touch-pan-y flex flex-col gap-4 relative">
          
          {notifications.map((notif) => (
            <div key={notif.id} className="bg-white rounded-[20px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col gap-3">
              
              <div className="w-11 h-11 rounded-full bg-[#0095FF] flex items-center justify-center shrink-0">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              
              <p className="text-[12px] text-gray-500 leading-snug pr-2">
                <span className="font-bold text-[#1E1B4B]">Lorem inc</span> is looking for a Creators. Check out this and 9 other gigs recommendations
              </p>
              
              <div className="flex justify-between items-end mt-1">
                <button className="bg-[#EF4823] text-white font-bold text-[13px] px-6 py-2 rounded-lg shadow-sm hover:bg-[#e03d1b] transition-colors">
                  See Gig
                </button>
                <span className="text-gray-400 text-[10px] font-medium mb-1">{notif.time}</span>
              </div>

            </div>
          ))}

        </div>
        
        <BottomNav />
      </div>
    </div>
  )
}
