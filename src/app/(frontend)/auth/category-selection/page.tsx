"use client"

import React from "react"
import { Logo } from "@/components/ui/Logo"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  React.useEffect(() => {
    // Clear any stale signup cookies when landing here
    document.cookie = "signupRole=; path=/; max-age=0";
  }, []);

  const handleSelect = async (category: string) => {
    localStorage.setItem("userRole", category)
    
    // Removed automatic bypass so all users go through the signup form

    if (category === "creator") {
      router.push("/auth/signup/creator")
    } else if (category === "brand") {
      router.push("/auth/signup/brand")
    } else if (category === "partner") {
      router.push("/auth/signup/partner")
    } else {
      router.push(`/onboarding?type=${category}`)
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-2 lg:py-6 flex-1 min-h-0 relative">
      {/* Mobile Split Background (White Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 h-[45dvh] bg-[#FAFAFA] -z-10 lg:hidden pointer-events-none" />
      
      {/* Top Header Section */}
      <div className="w-full flex items-center justify-center relative mb-1 lg:mb-2 px-2 pt-2 lg:pt-4">
        <img src="/logo.png" alt="Kalinq Logo" className="w-8 h-8 sm:w-12 sm:h-12 lg:hidden object-contain filter brightness-0 invert" />
      </div>
      
      <h1 className="text-[20px] sm:text-[24px] font-bold text-white lg:text-text-dark mb-0.5 lg:mb-1 text-center drop-shadow-sm lg:drop-shadow-none tracking-tight leading-tight">
        Sign Up
      </h1>
      
      <p className="text-white/95 lg:text-text-light text-[10px] sm:text-[11px] lg:text-sm font-normal mb-1.5 lg:mb-2 text-center px-4 leading-tight">
        Already have an account? <Link href="/auth/login" className="font-bold underline decoration-white/50 lg:decoration-text-light/50 underline-offset-4 hover:text-white lg:hover:text-text-dark transition-colors">Log In</Link>
      </p>

      {/* Yellow Pill */}
      <div className="bg-[#E5DF72] rounded-full px-3 py-1 mb-2 lg:mb-3 shadow-sm">
        <span className="text-primary-red font-bold text-[9px] sm:text-[10px] lg:text-sm leading-none">Select your category!</span>
      </div>

      {/* Card Section: Solid White */}
      <div className="w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[480px] bg-white rounded-[20px] lg:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-2 lg:p-8 mx-auto flex flex-col justify-center shrink-0">
        {/* Responsive Image Map for perfect fidelity across devices */}
        <div className="w-full relative">
          <img src="/signup.png" alt="Select Category" className="w-full h-auto object-contain" />
          
          {/* Invisible clickable rows mapped to the image */}
          <div 
            onClick={() => handleSelect('creator')} 
            className="absolute top-0 left-0 w-full h-[33.33%] cursor-pointer z-10 hover:bg-white/10 transition-colors" 
            aria-label="Join as a Creator"
          />
          <div 
            onClick={() => handleSelect('brand')} 
            className="absolute top-[33.33%] left-0 w-full h-[33.33%] cursor-pointer z-10 hover:bg-white/10 transition-colors" 
            aria-label="Join as a Brand"
          />
          <div 
            onClick={() => handleSelect('partner')} 
            className="absolute top-[66.66%] left-0 w-full h-[33.33%] cursor-pointer z-10 hover:bg-white/10 transition-colors" 
            aria-label="Join as a Partner"
          />
        </div>
      </div>
    </div>
  )
}
