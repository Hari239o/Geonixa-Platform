"use client"

import React from "react"
import { Logo } from "@/components/ui/Logo"
import { useRouter } from "next/navigation"

export default function BrandSetupSelectionPage() {
  const router = useRouter()

  React.useEffect(() => {
    try {
      const profile = localStorage.getItem("kaling_brand_profile");
      if (profile) {
        const parsed = JSON.parse(profile);
        router.replace(parsed.type === "company" ? "/brand/company" : "/brand");
      }
    } catch (e) {}
  }, [router]);

  const handleSelect = (type: string) => {
    localStorage.setItem("brandType", type)
    
    if (type === 'individual') {
      router.push("/brand/setup-individual")
    } else {
      router.push("/brand/setup-company")
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Section */}
      <img src="/logo.png" alt="Kalinq Logo" className="mb-6 lg:hidden w-32 h-auto object-contain filter brightness-0 invert" />
      
      <h1 className="text-3xl font-bold text-white lg:text-text-dark mb-2 text-center drop-shadow-sm lg:drop-shadow-none tracking-tight">
        Brand Profile
      </h1>
      
      <p className="text-white/95 lg:text-text-light text-xs lg:text-sm font-normal mb-4 lg:mb-6 text-center px-4">
        How would you like to set up your brand profile?
      </p>

      {/* Yellow Pill */}
      <div className="bg-[#E5DF72] rounded-full px-5 py-1.5 lg:px-6 lg:py-2 mb-6 lg:mb-8 shadow-sm">
        <span className="text-primary-red font-bold text-[13px] lg:text-sm">Select your profile type!</span>
      </div>

      {/* Card Section: Solid White */}
      <div className="w-[90%] max-w-[340px] sm:max-w-[360px] lg:max-w-[480px] bg-white rounded-[24px] lg:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-4 sm:p-6 lg:p-8 mx-auto flex flex-col gap-4 sm:gap-6">
        
        {/* Individual Option */}
        <div 
          onClick={() => handleSelect('individual')}
          className="flex items-center justify-between bg-white border-2 border-gray-100 rounded-[20px] p-5 cursor-pointer hover:border-primary-red hover:shadow-md transition-all active:scale-[0.98] group"
        >
          <div className="flex flex-col">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 group-hover:text-primary-red transition-colors mb-1">Individual</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">I am a sole proprietor or freelancer.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-primary-red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>

        {/* Company Option */}
        <div 
          onClick={() => handleSelect('company')}
          className="flex items-center justify-between bg-white border-2 border-gray-100 rounded-[20px] p-5 cursor-pointer hover:border-primary-red hover:shadow-md transition-all active:scale-[0.98] group"
        >
          <div className="flex flex-col">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 group-hover:text-primary-red transition-colors mb-1">Company</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">I am registering a registered business.</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-primary-red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              <rect x="9" y="9" width="6" height="6"></rect>
              <line x1="9" y1="1" x2="9" y2="4"></line>
              <line x1="15" y1="1" x2="15" y2="4"></line>
              <line x1="9" y1="20" x2="9" y2="23"></line>
              <line x1="15" y1="20" x2="15" y2="23"></line>
              <line x1="20" y1="9" x2="23" y2="9"></line>
              <line x1="20" y1="14" x2="23" y2="14"></line>
              <line x1="1" y1="9" x2="4" y2="9"></line>
              <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>
          </div>
        </div>

      </div>
    </div>
  )
}
