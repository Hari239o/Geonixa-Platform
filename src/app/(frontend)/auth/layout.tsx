"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { KalinqBackground } from "@/components/auth/KalinqBackground"
import { SignupProvider } from "@/components/auth/SignupContext"

export default function AuthFlowLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const router = useRouter()
 const pathname = usePathname()

 const handleBack = () => {
   if (pathname.includes('/auth/signup/creator/')) {
     router.push('/auth/signup/creator')
   } else if (pathname.includes('/auth/signup/brand/')) {
     router.push('/auth/signup/brand')
   } else if (pathname.includes('/auth/signup/partner/')) {
     router.push('/auth/signup/partner')
   } else if (pathname.includes('/auth/signup/')) {
     router.push('/auth/category-selection')
   } else if (pathname.includes('/auth/category-selection')) {
     router.push('/auth/login')
   } else {
     router.push('/')
   }
 }

  return (
    <SignupProvider>
      <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row relative bg-primary-red lg:bg-white lg:overflow-hidden">
        
        {/* Back button - Moved outside z-0 so it's clickable on mobile */}
        <button 
          onClick={handleBack}
          className="absolute top-6 left-4 lg:top-8 lg:left-6 text-white hover:opacity-80 transition-opacity z-[100] p-2"
        >
          <ArrowLeft className="w-6 h-6 sm:w-5 sm:h-5" strokeWidth={2} />
        </button>

        {/* Top/Left Red Section */}
        {/* Mobile: Full screen background. Desktop: 50% width fixed side panel */}
        <div className="absolute lg:relative top-0 left-0 w-full lg:w-1/2 min-h-[100dvh] h-full bg-primary-red z-0 overflow-hidden flex flex-col shadow-none lg:shadow-2xl">
          
          {/* Desktop Branding Content */}
          <div className="hidden lg:flex flex-col items-center justify-center h-full relative z-10 text-white p-12">
            <img src="/logo.png" alt="Kalinq" className="w-32 h-32 mb-8 object-contain drop-shadow-2xl filter brightness-0 invert" />
            <h1 className="text-5xl font-black tracking-tight mb-4 drop-shadow-md text-center">
              Welcome to Kalinq
            </h1>
            <p className="text-white/80 text-lg font-medium text-center leading-relaxed">
              Your complete SaaS ecosystem for managing brands, creators, and agencies seamlessly.
            </p>
          </div>
        </div>

        {/* Form Content Area */}
        {/* Mobile: Sits directly over the fixed red background. Desktop: Sits on the right half. */}
        <div className="relative z-10 w-full lg:w-1/2 flex flex-col items-center justify-start lg:justify-center flex-1 min-h-[100dvh] px-2 py-12 lg:py-12 bg-transparent lg:bg-white">
          <div className="w-full flex justify-center max-w-md mt-6 lg:mt-0 lg:my-auto pb-8">
            {children}
          </div>
        </div>

      </div>
    </SignupProvider>
  )
}
