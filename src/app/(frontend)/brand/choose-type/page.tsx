"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Building2, User } from "lucide-react"

export default function BrandChooseTypePage() {
  const router = useRouter()

  return (
    <div className="h-full bg-[#F8F9FA] font-sans flex flex-col justify-center items-center overflow-hidden px-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center">
        
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#1E1B4B] tracking-tight mb-2">Welcome to Kalinq</h2>
          <p className="text-gray-500 text-sm">How would you like to set up your brand profile?</p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <button 
            onClick={() => router.push("/brand/setup-individual")}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-[#EF4823] hover:bg-orange-50/50 transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#EF4823] group-hover:text-white transition-colors shrink-0">
              <User size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-bold text-[#1E1B4B] mb-1">Individual</h3>
              <p className="text-xs text-gray-500">I am a solo brand or entrepreneur</p>
            </div>
          </button>

          <button 
            onClick={() => router.push("/brand/setup-company")}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-[#EF4823] hover:bg-orange-50/50 transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#EF4823] group-hover:text-white transition-colors shrink-0">
              <Building2 size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-bold text-[#1E1B4B] mb-1">Company</h3>
              <p className="text-xs text-gray-500">I represent a company or agency</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  )
}
