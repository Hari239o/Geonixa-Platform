"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

export default function WithdrawPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("₹5000")

  return (
    <div className="h-full bg-white font-sans flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Header with Back Button */}
        <div className="pt-12 px-5 pb-6 shrink-0 z-20 bg-white">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4823] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32 touch-pan-y flex flex-col relative">
          
          <div className="bg-white rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-6 pt-10 pb-8 flex flex-col items-center">
            
            <h1 className="text-gray-900 font-extrabold text-[22px] mb-1">Withdraw</h1>
            <p className="text-gray-400 text-[14px] font-medium mb-8">Enter your amount</p>

            <div className="w-full flex flex-col gap-2">
              <input 
                type="text" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#F9F9F9] border-none outline-none rounded-[14px] py-4 px-5 text-gray-500 font-medium text-[15px]"
              />
              <span className="text-gray-400 text-[11px] font-medium pl-1 mb-6">
                Your balance : ₹10950
              </span>

              <button className="w-full bg-[#EF4823] text-white font-bold text-[13px] tracking-wider py-4 rounded-[14px] shadow-md hover:bg-[#e03d1b] transition-colors">
                WITHDRAW
              </button>
            </div>

          </div>
          
        </div>
        
        <BottomNav />
      </div>
    </div>
  )
}
