"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Building2, CreditCard, Check, ShieldCheck, BadgeCheck } from "lucide-react"
import { useSession } from "next-auth/react"

export default function AddFundsPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("₹500")
  const [showSuccess, setShowSuccess] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState("bank")
  const [loading, setLoading] = useState(false)
  
  const { data: session, update: updateSession } = useSession()
  const credits = (session?.user as any)?.credits || 0
  const balance = credits * 10

  const handleAddFunds = async () => {
    const saved = localStorage.getItem("kaling_company_profile") || localStorage.getItem("kaling_brand_profile");
    let isVerified = false;
    if (saved) {
      try {
        isVerified = JSON.parse(saved).isVerified === true;
      } catch (err) {}
    }

    if (!isVerified) {
      setShowVerifyModal(true);
      return;
    }

    try {
      setLoading(true)
      const numericAmount = parseInt(amount.replace(/\D/g, "")) || 0
      
      const res = await fetch("/api/wallet/add-dummy-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInRupees: numericAmount })
      })
      
      if (res.ok) {
        await updateSession() // refresh session credits
        setShowSuccess(true)
      } else {
        alert("Failed to add dummy funds.")
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
        <h2 className="text-[#EF4423] font-bold text-xl mt-8 tracking-tight">Payment Successful!</h2>
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
          <h1 className="text-gray-900 font-extrabold text-[22px] mb-1">Add Funds</h1>
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
              <button onClick={() => setAmount("₹500")} className="px-4 py-2 border border-[#EF4423] text-[#EF4423] font-bold text-[12px] rounded-full hover:bg-[#FEF5ED]">+₹500</button>
              <button onClick={() => setAmount("₹1000")} className="px-4 py-2 border border-[#EF4423] text-[#EF4423] font-bold text-[12px] rounded-full hover:bg-[#FEF5ED]">+₹1000</button>
              <button onClick={() => setAmount("₹2000")} className="px-4 py-2 border border-[#EF4423] text-[#EF4423] font-bold text-[12px] rounded-full hover:bg-[#FEF5ED]">+₹2000</button>
            </div>
          </div>

          <h2 className="text-gray-900 font-extrabold text-[16px] mb-4">Payment Method</h2>
          <div className="flex flex-col gap-3">
            <button onClick={() => setSelectedMethod("bank")} className={`flex items-center gap-4 p-4 rounded-[14px] border transition-colors ${selectedMethod === "bank" ? "border-[#EF4423] bg-[#FEF5ED]" : "border-gray-100 bg-white"}`}>
              <Building2 className="w-6 h-6 text-[#EF4423]" />
              <span className="font-bold text-gray-800 text-[14px]">Bank Transfer</span>
            </button>
            
            <button onClick={() => setSelectedMethod("upi")} className={`flex items-center gap-4 p-4 rounded-[14px] border transition-colors ${selectedMethod === "upi" ? "border-[#EF4423] bg-[#FEF5ED]" : "border-gray-100 bg-white"}`}>
              <div className="w-6 h-6 flex items-center justify-center text-[#EF4423] font-bold text-xs border border-[#EF4423] rounded-sm">UPI</div>
              <span className="font-bold text-gray-800 text-[14px]">UPI</span>
            </button>
            
            <button onClick={() => setSelectedMethod("card")} className={`flex items-center gap-4 p-4 rounded-[14px] border transition-colors ${selectedMethod === "card" ? "border-[#EF4423] bg-[#FEF5ED]" : "border-gray-100 bg-white"}`}>
              <CreditCard className="w-6 h-6 text-[#EF4423]" />
              <span className="font-bold text-gray-800 text-[14px]">Credit/Debit Card</span>
            </button>
          </div>

          <div className="mt-auto pt-8 pb-8">
            <button 
              onClick={handleAddFunds}
              disabled={loading}
              className="w-full bg-[#EF4423] text-white font-bold text-[14px] py-4 rounded-[14px] shadow-[0_4px_14px_rgba(239,72,35,0.4)] hover:bg-[#e03d1b] transition-colors disabled:opacity-50"
            >
              {loading ? "PROCESSING..." : "ADD FUNDS"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Verify Account Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[320px] rounded-[24px] p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center mt-2">
              <BadgeCheck className="w-[42px] h-[42px] text-[#EF4423] fill-[#EF4423] text-white mb-3" />
              <h2 className="text-[20px] font-black text-[#EF4423] text-center mb-1 tracking-tight">VERIFY YOUR ACCOUNT</h2>
              <p className="text-[13px] text-gray-500 font-medium text-center mb-6 leading-tight">
                With Aadhar
              </p>

              <button 
                onClick={() => router.push('/kyc')}
                className="w-full py-3.5 border-2 border-dashed border-[#EF4423]/40 rounded-[14px] flex items-center justify-center gap-3 mb-6 hover:bg-[#EF4423]/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EF4423]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-[#1a1a2e] font-semibold text-[14px]">Camera</span>
              </button>

              <button 
                className="w-full py-3.5 bg-[#EF4423] text-white text-[14px] font-bold rounded-[14px] hover:bg-[#d63f1c] transition-colors shadow-[0_4px_14px_rgba(239,72,35,0.3)]"
                onClick={() => router.push('/kyc')}
              >
                VERIFY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
