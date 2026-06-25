"use client";

import React from "react";
import { Logo } from "@/components/ui/Logo";

export default function PartnerSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] w-full bg-[#FF4D2D] relative flex flex-col items-center">
      {/* Background that fills top portion if needed, but the container handles the red background now */}
      
      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[450px] pt-3 flex flex-col items-center h-[100dvh] overflow-hidden">
        
        {/* Header (Logo + Title) */}
        <div className="w-full relative flex justify-center items-start mb-3 px-4 shrink-0">
          <div className="absolute left-4 top-0">
            <button 
              onClick={() => window.history.back()}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </button>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Logo large={false} showText={false} className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Sign Up</h1>
            <p className="text-white/90 text-xs">
              Already have an account? <a href="/auth/login" className="underline font-medium hover:text-white">Log In</a>
            </p>
            <div className="mt-2 px-4 py-1.5 bg-[#DCE26A] text-black font-semibold rounded-full text-[10px] shadow-sm uppercase tracking-wider">
              Partners
            </div>
          </div>
        </div>

        {/* White Bottom Sheet Container */}
        <div className="w-full flex-grow bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden flex flex-col">
          {children}
        </div>
        
      </div>
    </div>
  );
}
