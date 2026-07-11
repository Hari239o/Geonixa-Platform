"use client"

import React, { useState, useEffect, useRef } from "react"
import { Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import BottomNav from "@/components/brand/BottomNav"

export default function BrandWalletPage() {
  const router = useRouter()
  const [showFilter, setShowFilter] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  // Close filter when click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const { data: session } = useSession()
  const credits = (session?.user as any)?.credits || 0
  // 10 rupees = 1 credit, so balance = credits * 10
  const balance = credits * 10

  return (
    <div className="h-full bg-white font-sans flex justify-center overflow-hidden">
      <div className="w-full w-full bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Fixed Header */}
        <div className="pt-5 px-5 pb-6 shrink-0 z-20 bg-white">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <h1 className="text-gray-800 font-extrabold text-[18px]">Hello {session?.user?.name?.split(' ')[0] || 'Lorem'},</h1>
              <p className="text-gray-400 text-[13px] font-medium mb-0.5">Your available balance</p>
            </div>
            <div className="text-[#EF4423] font-extrabold text-[32px] tracking-tight leading-none mt-1">
              ₹{balance.toLocaleString()}
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button onClick={() => router.push("/brand/wallet/add-funds")} className="flex-1 bg-[#2ECC71] text-white py-3 rounded-[12px] font-bold text-[14px] shadow-sm hover:opacity-90 transition-opacity">
              Add Funds
            </button>
            <button onClick={() => router.push("/brand/wallet/withdraw")} className="flex-1 bg-[#EF4423] text-white py-3 rounded-[12px] font-bold text-[14px] shadow-sm hover:opacity-90 transition-opacity">
              Withdraw
            </button>
          </div>

          {/* Red Dashboard Card */}
          <div className="bg-[#EF4423] rounded-[14px] text-white py-[18px] px-4 flex justify-between items-center shadow-md">
            <div className="flex flex-col items-center flex-1">
              <span className="text-[18px] font-bold leading-none mb-1.5 mt-0.5">₹0</span>
              <span className="text-[11px] font-medium opacity-90">Pending</span>
            </div>
            <div className="w-px h-[42px] bg-white/30"></div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-[18px] font-bold leading-none mb-1.5 mt-0.5">₹0</span>
              <span className="text-[11px] font-medium opacity-90">Received</span>
            </div>
            <div className="w-px h-[42px] bg-white/30"></div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-[18px] font-bold leading-none mb-1.5 mt-0.5">{credits}</span>
              <span className="text-[11px] font-medium opacity-90">Credit Coins</span>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32 touch-pan-y flex flex-col relative">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-gray-800 font-extrabold text-[15px]">Transactions</h2>
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setShowFilter(!showFilter)} 
                className="p-1 hover:bg-gray-50 rounded-full transition-colors"
              >
                <Filter className="w-5 h-5" color="#EF4423" strokeWidth={2} />
              </button>
              
              {/* Dropdown Options */}
              {showFilter && (
                <div className="absolute right-0 top-9 bg-white border border-[#EF4423] rounded-[10px] p-1.5 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50 w-28">
                  <button onClick={() => setShowFilter(false)} className="text-[11px] text-gray-500 font-medium py-2 px-2.5 text-left hover:bg-gray-50 rounded-md">Pending</button>
                  <button onClick={() => setShowFilter(false)} className="text-[11px] text-gray-500 font-medium py-2 px-2.5 text-left hover:bg-gray-50 rounded-md">Received</button>
                  <button onClick={() => setShowFilter(false)} className="text-[11px] text-gray-500 font-medium py-2 px-2.5 text-left hover:bg-gray-50 rounded-md">last month</button>
                  <button onClick={() => setShowFilter(false)} className="text-[11px] text-gray-500 font-medium py-2 px-2.5 text-left hover:bg-gray-50 rounded-md">Clear</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 items-center justify-center pt-8">
            <span className="text-gray-400 font-medium text-sm">No transactions yet</span>
          </div>

        </div>

        {/* Floating Banner */}
        <div className="absolute bottom-20 left-0 w-full px-5 z-30 pointer-events-none">
          <div className="w-full max-w-[335px] mx-auto bg-[#EF4423] rounded-[18px] p-4 flex items-center justify-between shadow-xl pointer-events-auto relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10 flex flex-col">
              <span className="text-white/90 text-[11px] font-medium leading-none mb-1">Find More</span>
              <span className="text-white text-xl font-bold leading-none tracking-tight">campaigns</span>
            </div>
            <button onClick={() => router.push('/brand/campaigns')} className="relative z-10 bg-[#D4E865] hover:bg-[#c2d655] text-gray-800 px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95">
              View
            </button>
          </div>
        </div>

      </div>
      
      <BottomNav />
    </div>
  )
}
