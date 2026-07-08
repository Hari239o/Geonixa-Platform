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
  return (
    <div className="w-full h-full flex flex-col items-center justify-start py-4 lg:py-6 flex-1 min-h-0 relative overflow-y-auto no-scrollbar">
      {/* Split Background (White Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 h-[45dvh] bg-[#FAFAFA] -z-10 pointer-events-none" />
      
      {/* Top Header Section */}
      <div className="w-full flex flex-col items-center justify-center relative mb-4 lg:mb-2 px-2 pt-4 shrink-0">
        <img src="/logo.png" alt="Kalinq Logo" className="w-8 h-8 lg:hidden object-contain filter brightness-0 invert mb-1" />
      </div>
      
      <h1 className="text-[32px] sm:text-[36px] font-bold text-white lg:text-text-dark mb-1 lg:mb-1 text-center drop-shadow-sm lg:drop-shadow-none tracking-tight leading-tight">
        Sign Up
      </h1>
      
      <p className="text-white/95 lg:text-text-light text-[12px] sm:text-[13px] lg:text-sm font-normal mb-4 lg:mb-2 text-center px-4 leading-tight">
        Already have an account? <Link href="/auth/login" className="font-bold underline decoration-white/50 lg:decoration-text-light/50 underline-offset-4 hover:text-white lg:hover:text-text-dark transition-colors">Log In</Link>
      </p>

      {/* Yellow Pill */}
      <div className="bg-[#E5DF72] rounded-full px-4 py-1.5 mb-6 lg:mb-4 shadow-sm">
        <span className="text-primary-red font-bold text-[11px] sm:text-[12px] lg:text-sm leading-none tracking-wide">Select your category!</span>
      </div>

      {/* Card Section: Solid White */}
      {/* Constrain max-width strongly to prevent excessive height on mobile, mirroring Figma's 266px width logic */}
      <div className="w-full max-w-[290px] sm:max-w-[340px] md:max-w-[400px] lg:max-w-[480px] bg-white rounded-[24px] lg:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-3 sm:p-5 lg:p-8 mx-auto flex flex-col justify-center shrink-0 mb-8">
        
        {/* Alternating Masonry Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 w-full">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
            
            {/* 1. Join as a Creator (Red Block) */}
            <div 
              onClick={() => handleSelect('creator')}
              className="flex flex-col items-center justify-center bg-primary-red rounded-[20px] lg:rounded-[28px] aspect-[4/5] p-2 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm relative overflow-hidden group"
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 opacity-[0.15] pointer-events-none transform rotate-12">
                <img src="/logo.png" alt="watermark" className="w-full h-full object-contain" />
              </div>
              
              <h3 className="text-white text-[24px] sm:text-[28px] lg:text-3xl font-black relative z-10 leading-none mb-0.5">Join</h3>
              <p className="text-button-yellow text-[10px] sm:text-[11px] font-bold uppercase tracking-widest relative z-10 mb-0.5">as a</p>
              <p className="text-button-yellow text-[15px] sm:text-[18px] lg:text-lg font-black relative z-10 leading-none">Creator</p>
            </div>

            {/* 2. Brand Logos (White Block) */}
            <div 
              onClick={() => handleSelect('brand')}
              className="bg-white rounded-[20px] lg:rounded-[28px] aspect-square flex flex-col p-2 sm:p-3 lg:p-4 items-center justify-center shadow-sm border border-gray-100 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 w-full h-full items-center justify-items-center opacity-80">
                <span className="font-serif font-black text-[10px] sm:text-[12px] lg:text-sm tracking-tighter">CHANEL</span>
                <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 fill-black"><path d="M24 7.6c-2.8.2-5.4.8-7.7 1.8-4.6 2-7.7 5.1-9 7.8-.5 1.1-.7 2.1-.7 3.1 0 1.2.6 2.1 1.6 2.5 1.5.7 3.5.2 5.5-.8 3.5-1.9 6.8-5.3 9.4-9.6.2-.3.3-.6.5-.9-1.2 1.4-2.6 2.6-4.1 3.7-2.6 1.8-5.2 2.6-7.5 2.2-1.3-.2-2.1-.8-2.5-1.6-.4-.9-.3-1.8.2-2.8 1.1-2.4 3.3-4.8 6.4-6.8 2.3-1.5 4.8-2.6 7.4-3.2.2 0 .4-.1.5-.1z" /></svg>
                <span className="font-black text-red-600 text-[11px] sm:text-[13px] lg:text-sm tracking-tighter">Levi's</span>
                <span className="font-serif text-pink-400 font-bold text-[9px] sm:text-[10px] lg:text-[11px]">PINK</span>
              </div>
            </div>

            {/* 3. Join as Partners (Red Block) */}
            <div 
              onClick={() => handleSelect('partner')}
              className="flex flex-col items-center justify-center bg-primary-red rounded-[20px] lg:rounded-[28px] aspect-[4/5] p-2 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm relative overflow-hidden group"
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 opacity-[0.15] pointer-events-none transform rotate-12">
                <img src="/logo.png" alt="watermark" className="w-full h-full object-contain" />
              </div>
              
              <h3 className="text-white text-[24px] sm:text-[28px] lg:text-3xl font-black relative z-10 leading-none mb-0.5">Join</h3>
              <p className="text-button-yellow text-[10px] sm:text-[11px] font-bold uppercase tracking-widest relative z-10 mb-0.5">as a</p>
              <p className="text-button-yellow text-[12px] sm:text-[14px] lg:text-[15px] font-black relative z-10 leading-tight text-center mt-0.5">Partners /<br/>Agency</p>
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
              className="flex flex-col items-center justify-center bg-primary-red rounded-[20px] lg:rounded-[28px] aspect-[4/5] p-2 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm relative overflow-hidden group"
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 opacity-[0.15] pointer-events-none transform rotate-12">
                <img src="/logo.png" alt="watermark" className="w-full h-full object-contain" />
              </div>
              
              <h3 className="text-white text-[24px] sm:text-[28px] lg:text-3xl font-black relative z-10 leading-none mb-0.5">Join</h3>
              <p className="text-button-yellow text-[10px] sm:text-[11px] font-bold uppercase tracking-widest relative z-10 mb-0.5">as a</p>
              <p className="text-button-yellow text-[15px] sm:text-[18px] lg:text-lg font-black relative z-10 leading-none">Brand</p>
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
