"use client";

import React from "react";
import { KalinqBackground } from "@/components/auth/KalinqBackground";
import { Logo } from "@/components/ui/Logo";

export default function CreatorSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] w-full bg-[#EF4823] relative flex flex-col items-center">
      {/* Background Pattern (Optional dots/grid) */}
      <div className="absolute top-0 left-0 w-full h-[55vh] z-0 pointer-events-none overflow-hidden opacity-20">
        <KalinqBackground />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full pt-10 flex flex-col items-center h-[100dvh] overflow-hidden">
        
        {/* Header (Logo + Title) */}
        <div className="w-full relative flex justify-center items-start mb-8 px-4 shrink-0">
          <div className="absolute left-6 top-0">
            <button 
              onClick={() => window.history.back()}
              className="p-1 transition text-white hover:text-white/80"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          </div>
          <div className="flex flex-col items-center gap-2">
            {/* White Logo */}
            <img 
              src="/logo.png" 
              alt="Kalinq Logo" 
              className="w-12 h-12 object-contain brightness-0 invert" 
            />
            
            <h1 className="text-[28px] font-bold text-white tracking-tight mt-1">Sign Up</h1>
            <p className="text-white/90 text-[13px] font-medium">
              Already have an account? <a href="/auth/login" className="underline font-bold hover:text-white underline-offset-2">Log In</a>
            </p>
            <div className="mt-4 px-6 py-2 bg-[#D4E865] text-gray-900 font-bold rounded-xl text-[12px] shadow-sm">
              User Generated Content
            </div>
          </div>
        </div>

        {/* White Bottom Sheet Container */}
        <div className="w-full flex-grow bg-white rounded-t-[32px] shadow-2xl relative overflow-y-auto no-scrollbar flex flex-col">
          {children}
        </div>
        
      </div>
    </div>
  );
}
