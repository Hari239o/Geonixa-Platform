"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Building2, Check } from "lucide-react"
import { useSession } from "next-auth/react"

export default function WithdrawPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("₹500")
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState("bank")
  const [loading, setLoading] = useState(false)
  
  const { data: session, update: updateSession } = useSession()
  const credits = (session?.user as any)?.credits || 0
  const balance = credits * 10

  const handleWithdraw = async () => {
    try {
      setLoading(true)
      const numericAmount = parseInt(amount.replace(/\D/g, "")) || 0
      
      const res = await fetch("/api/wallet/withdraw-dummy-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInRupees: numericAmount })
      })
      
      if (res.ok) {
        await updateSession() // refresh session credits
        setShowSuccess(true)
      } else {
        const errorData = await res.json()
        alert(errorData.error || "Failed to withdraw dummy funds.")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="h-full bg-white flex flex-col items-center justify-center p-6 relative">
        <button 
          onClick={() => router.push("/brand/wallet")}
          className="absolute top-5 left-5 w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4423]"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="relative">
          <div className="w-32 h-32 bg-[#EF4423] rounded-full flex items-center justify-center z-10 relative shadow-xl">
            <Check className="text-white w-16 h-16" strokeWidth={3} />
          </div>
          {/* Confetti dots */}
          <div className="absolute top-0 left-0 w-full h-full z-0">
             <div className="absolute -top-4 -left-8 w-2 h-2 rounded-full bg-[#D4E865]"></div>
             <div className="absolute -bottom-6 -right-4 w-3 h-3 rounded-full bg-[#EF4423]"></div>
             <div className="absolute top-1/2 -right-8 w-2 h-2 rounded-full bg-[#D4E865]"></div>
             <div className="absolute bottom-4 -left-10 w-2.5 h-2.5 rounded-full bg-[#EF4423]"></div>
          </div>
        </div>
        <h2 className="text-[#EF4423] font-bold text-xl mt-8 tracking-tight">Withdraw Successful!</h2>
      </div>
    )
  }

  return (
    <div className="h-full bg-white font-sans flex justify-center overflow-hidden">
      <div className="w-full bg-white h-full relative flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="pt-5 px-5 pb-6 shrink-0 bg-white flex items-center">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4423] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 flex flex-col">
          <h1 className="text-gray-900 font-extrabold text-[22px] mb-1">Withdraw Funds</h1>
          <p className="text-gray-400 text-[14px] font-medium mb-6">Enter your amount</p>

          <div className="w-full flex flex-col mb-8">
            <input 
              type="text" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border border-[#EF4423] outline-none rounded-[14px] py-4 px-5 text-gray-500 font-medium text-[15px] mb-2"
            />
            <span className="text-gray-400 text-[12px] font-medium pl-1 mb-4">
              Your balance : <span className="text-[#EF4423] font-bold">₹{balance.toLocaleString()}</span>
            </span>

            <div className="flex gap-3">
              <button onClick={() => setAmount("₹1500")} className="px-4 py-2 border border-[#EF4423] text-[#EF4423] font-bold text-[12px] rounded-full hover:bg-[#FEF5ED]">+₹1500</button>
              <button onClick={() => setAmount("₹5000")} className="px-4 py-2 border border-[#EF4423] text-[#EF4423] font-bold text-[12px] rounded-full hover:bg-[#FEF5ED]">+₹5000</button>
              <button onClick={() => setAmount("₹10000")} className="px-4 py-2 border border-[#EF4423] text-[#EF4423] font-bold text-[12px] rounded-full hover:bg-[#FEF5ED]">+₹10000</button>
            </div>
          </div>

          <h2 className="text-gray-900 font-extrabold text-[16px] mb-4">Withdraw Method</h2>
          <div className="flex flex-col gap-3">
            <button onClick={() => setSelectedMethod("bank")} className={`flex items-center gap-4 p-4 rounded-[14px] border transition-colors ${selectedMethod === "bank" ? "border-[#EF4423] bg-[#FEF5ED]" : "border-gray-100 bg-white"}`}>
              <Building2 className="w-6 h-6 text-[#EF4423]" />
              <span className="font-bold text-gray-800 text-[14px]">To Bank Account</span>
            </button>
            
            <button onClick={() => setSelectedMethod("upi")} className={`flex items-center gap-4 p-4 rounded-[14px] border transition-colors ${selectedMethod === "upi" ? "border-[#EF4423] bg-[#FEF5ED]" : "border-gray-100 bg-white"}`}>
              <div className="w-6 h-6 flex items-center justify-center text-[#EF4423] font-bold text-xs border border-[#EF4423] rounded-sm">UPI</div>
              <span className="font-bold text-gray-800 text-[14px]">To UPI ID</span>
            </button>
          </div>

          <div className="mt-auto pt-8 pb-8">
            <button 
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full bg-[#EF4423] text-white font-bold text-[14px] py-4 rounded-[14px] shadow-[0_4px_14px_rgba(239,72,35,0.4)] hover:bg-[#e03d1b] transition-colors disabled:opacity-50"
            >
              {loading ? "PROCESSING..." : "WITHDRAW FUNDS"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
