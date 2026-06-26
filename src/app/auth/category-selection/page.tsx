"use client"

import React from "react"
import { Logo } from "@/components/ui/Logo"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  const handleSelect = (category: string) => {
    localStorage.setItem("userRole", category)
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
    <div className="w-full flex flex-col items-center h-full pb-8">
      {/* Top Section */}
      <Logo large={false} showText={false} className="mb-2 lg:hidden w-8 h-8" />
      
      <h1 className="text-3xl lg:text-4xl font-bold text-white lg:text-text-dark mb-1 lg:mb-3 text-center drop-shadow-sm lg:drop-shadow-none tracking-tight">
        Sign Up
      </h1>
      
      <p className="text-white/95 lg:text-text-light text-xs lg:text-sm font-normal mb-4 lg:mb-6 text-center px-4">
        Already have an account? <Link href="/auth/login" className="font-bold underline decoration-white/50 lg:decoration-text-light/50 underline-offset-4 hover:text-white lg:hover:text-text-dark transition-colors">Log In</Link>
      </p>

      {/* Yellow Pill */}
      <div className="bg-[#E5DF72] rounded-full px-5 py-1.5 lg:px-6 lg:py-2 mb-6 lg:mb-8 shadow-sm">
        <span className="text-primary-red font-bold text-[13px] lg:text-sm">Select your category!</span>
      </div>

      {/* Card Section: Solid White */}
      <div className="w-full max-w-[360px] lg:max-w-[480px] bg-white rounded-[24px] lg:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-4 lg:p-6">
        
        {/* Alternating Masonry Grid */}
        <div className="grid grid-cols-2 gap-3 lg:gap-5">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-3 lg:gap-5">
            
            {/* 1. Join as a Creator (Red Block) */}
            <div 
              onClick={() => handleSelect('creator')}
              className="flex flex-col items-center justify-center bg-primary-red rounded-[20px] lg:rounded-[28px] aspect-[4/5] p-3 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-white/20 transition-all" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/5 rounded-full blur-xl -ml-6 -mb-6" />
              
              <h3 className="text-white text-2xl lg:text-3xl font-black relative z-10 leading-none mb-0.5">Join</h3>
              <p className="text-button-yellow text-[9px] lg:text-[11px] font-bold uppercase tracking-widest relative z-10 mb-0.5">as a</p>
              <p className="text-button-yellow text-[15px] lg:text-lg font-black relative z-10 leading-none">Creator</p>
            </div>

            {/* 2. Brand Logos (White Block) */}
            <div 
              onClick={() => handleSelect('brand')}
              className="bg-white rounded-[20px] lg:rounded-[28px] aspect-square flex flex-col p-2 lg:p-4 items-center justify-center shadow-sm border border-gray-100 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <div className="grid grid-cols-2 gap-2 lg:gap-4 w-full h-full items-center justify-items-center opacity-80">
                <span className="font-serif font-black text-[11px] lg:text-sm tracking-tighter">CHANEL</span>
                <svg viewBox="0 0 24 24" className="w-7 h-7 lg:w-9 lg:h-9 fill-black"><path d="M24 8.25l-24 11.25 6.75-3.75 17.25-7.5z" /></svg>
                <span className="font-black text-red-600 text-[11px] lg:text-sm tracking-tighter">Levi's</span>
                <span className="font-serif text-pink-400 font-bold text-[9px] lg:text-[11px]">PINK</span>
              </div>
            </div>

            {/* 3. Join as Partners (Red Block) */}
            <div 
              onClick={() => handleSelect('partner')}
              className="flex flex-col items-center justify-center bg-primary-red rounded-[20px] lg:rounded-[28px] aspect-[4/5] p-3 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-white/20 transition-all" />
              
              <h3 className="text-white text-2xl lg:text-3xl font-black relative z-10 leading-none mb-0.5">Join</h3>
              <p className="text-button-yellow text-[9px] lg:text-[11px] font-bold uppercase tracking-widest relative z-10 mb-0.5">as a</p>
              <p className="text-button-yellow text-[13px] lg:text-[15px] font-black relative z-10 leading-tight text-center">Partners /<br/>Agency</p>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3 lg:gap-5">
            
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
              className="flex flex-col items-center justify-center bg-primary-red rounded-[20px] lg:rounded-[28px] aspect-[4/5] p-3 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm relative overflow-hidden group"
            >
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -ml-8 -mb-8 group-hover:bg-white/20 transition-all" />
              
              <h3 className="text-white text-2xl lg:text-3xl font-black relative z-10 leading-none mb-0.5">Join</h3>
              <p className="text-button-yellow text-[9px] lg:text-[11px] font-bold uppercase tracking-widest relative z-10 mb-0.5">as a</p>
              <p className="text-button-yellow text-[15px] lg:text-lg font-black relative z-10 leading-none">Brand</p>
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
