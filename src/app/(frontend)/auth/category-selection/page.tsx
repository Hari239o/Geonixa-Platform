"use client"

import React from "react"
import { Logo } from "@/components/ui/Logo"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

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
    <div className="w-full flex flex-col items-center justify-center h-full min-h-[100dvh] py-4 sm:py-8">
      {/* Top Header Section */}
      <div className="w-full flex items-center justify-center relative mb-2 px-4 pt-4 sm:pt-6">
        <img src="/logo.png" alt="Kalinq Logo" className="w-10 h-10 sm:w-12 sm:h-12 lg:hidden object-contain filter brightness-0 invert" />
      </div>
      
      <h1 className="text-[24px] font-bold text-white lg:text-text-dark mb-1 text-center drop-shadow-sm lg:drop-shadow-none tracking-tight">
        Sign Up
      </h1>
      
      <p className="text-white/95 lg:text-text-light text-[11px] lg:text-sm font-normal mb-2 text-center px-4">
        Already have an account? <Link href="/auth/login" className="font-bold underline decoration-white/50 lg:decoration-text-light/50 underline-offset-4 hover:text-white lg:hover:text-text-dark transition-colors">Log In</Link>
      </p>

      {/* Yellow Pill */}
      <div className="bg-[#E5DF72] rounded-full px-3 py-1 mb-3 shadow-sm">
        <span className="text-primary-red font-bold text-[10px] sm:text-[12px] lg:text-sm">Select your category!</span>
      </div>

      {/* Card Section: Solid White */}
      <div className="w-[90%] max-w-[340px] sm:max-w-[380px] lg:max-w-[480px] bg-white rounded-[20px] lg:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-3 sm:p-4 lg:p-8 mx-auto">
        
        {/* Alternating Masonry Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
            
            {/* 1. Join as a Creator (Red Block) */}
            <div 
              onClick={() => handleSelect('creator')}
              className="flex flex-col items-center justify-center bg-primary-red rounded-[20px] lg:rounded-[28px] aspect-[4/5] p-2 sm:p-3 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm relative overflow-hidden group"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 opacity-[0.15] pointer-events-none transform rotate-12">
                <img src="/logo.png" alt="watermark" className="w-full h-full object-contain" />
              </div>
              
              <h3 className="text-white text-[22px] sm:text-[26px] lg:text-3xl font-black relative z-10 leading-none mb-0.5">Join</h3>
              <p className="text-button-yellow text-[9px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-widest relative z-10 mb-0.5">as a</p>
              <p className="text-button-yellow text-[14px] sm:text-[16px] lg:text-lg font-black relative z-10 leading-none">Creator</p>
            </div>

            {/* 2. Brand Logos (White Block) */}
            <div 
              onClick={() => handleSelect('brand')}
              className="bg-white rounded-[20px] lg:rounded-[28px] aspect-square flex flex-col p-2 lg:p-4 items-center justify-center shadow-sm border border-gray-100 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <div className="grid grid-cols-2 gap-2 lg:gap-4 w-full h-full items-center justify-items-center opacity-80">
                <span className="font-serif font-black text-[9px] sm:text-[11px] lg:text-sm tracking-tighter">CHANEL</span>
                <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9 fill-black"><path d="M24 7.6c-2.8.2-5.4.8-7.7 1.8-4.6 2-7.7 5.1-9 7.8-.5 1.1-.7 2.1-.7 3.1 0 1.2.6 2.1 1.6 2.5 1.5.7 3.5.2 5.5-.8 3.5-1.9 6.8-5.3 9.4-9.6.2-.3.3-.6.5-.9-1.2 1.4-2.6 2.6-4.1 3.7-2.6 1.8-5.2 2.6-7.5 2.2-1.3-.2-2.1-.8-2.5-1.6-.4-.9-.3-1.8.2-2.8 1.1-2.4 3.3-4.8 6.4-6.8 2.3-1.5 4.8-2.6 7.4-3.2.2 0 .4-.1.5-.1z" /></svg>
                <span className="font-black text-red-600 text-[9px] sm:text-[11px] lg:text-sm tracking-tighter">Levi's</span>
                <span className="font-serif text-pink-400 font-bold text-[8px] sm:text-[9px] lg:text-[11px]">PINK</span>
              </div>
            </div>

            {/* 3. Join as Partners (Red Block) */}
            <div 
              onClick={() => handleSelect('partner')}
              className="flex flex-col items-center justify-center bg-primary-red rounded-[20px] lg:rounded-[28px] aspect-[4/5] p-2 sm:p-3 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm relative overflow-hidden group"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 opacity-[0.15] pointer-events-none transform rotate-12">
                <img src="/logo.png" alt="watermark" className="w-full h-full object-contain" />
              </div>
              
              <h3 className="text-white text-[22px] sm:text-[26px] lg:text-3xl font-black relative z-10 leading-none mb-0.5">Join</h3>
              <p className="text-button-yellow text-[9px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-widest relative z-10 mb-0.5">as a</p>
              <p className="text-button-yellow text-[11px] sm:text-[12px] lg:text-[15px] font-black relative z-10 leading-tight text-center mt-0.5">Partners /<br/>Agency</p>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
            
            {/* 1. Creator Photo */}
            <div 
              onClick={() => handleSelect('creator')}
              className="rounded-[20px] lg:rounded-[28px] overflow-hidden aspect-square relative shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" 
                alt="Creator" 
                className="object-cover w-full h-full"
              />
            </div>

            {/* 2. Join as a Brand (Red Block) */}
            <div 
              onClick={() => handleSelect('brand')}
              className="flex flex-col items-center justify-center bg-primary-red rounded-[20px] lg:rounded-[28px] aspect-[4/5] p-2 sm:p-3 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm relative overflow-hidden group"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 opacity-[0.15] pointer-events-none transform rotate-12">
                <img src="/logo.png" alt="watermark" className="w-full h-full object-contain" />
              </div>
              
              <h3 className="text-white text-[22px] sm:text-[26px] lg:text-3xl font-black relative z-10 leading-none mb-0.5">Join</h3>
              <p className="text-button-yellow text-[9px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-widest relative z-10 mb-0.5">as a</p>
              <p className="text-button-yellow text-[14px] sm:text-[16px] lg:text-lg font-black relative z-10 leading-none">Brand</p>
            </div>

            {/* 3. Partner Photo */}
            <div 
              onClick={() => handleSelect('partner')}
              className="rounded-[20px] lg:rounded-[28px] overflow-hidden aspect-square relative shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img 
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80" 
                alt="Partner" 
                className="object-cover w-full h-full"
              />
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
