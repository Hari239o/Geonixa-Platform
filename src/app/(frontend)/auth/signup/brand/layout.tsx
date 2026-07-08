"use client";

import React from "react";
import { Logo } from "@/components/ui/Logo";

export default function BrandSignupLayout({
 children,
}: {
 children: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Header (Logo + Title) */}
      <div className="w-full relative flex flex-col items-center justify-start mb-2 px-2 shrink-0">
        <Logo large={false} showText={false} className="w-8 h-8 lg:hidden filter brightness-0 invert" />
        <h1 className="text-xl sm:text-2xl font-bold text-white lg:text-text-dark tracking-tight mt-1">Sign Up</h1>
        <p className="text-white/90 lg:text-text-light text-[10px] sm:text-xs">
          Already have an account? <a href="/auth/login" className="underline font-medium hover:text-white lg:hover:text-text-dark">Log In</a>
        </p>
        <div className="mt-2 px-3 py-1 bg-[#DCE26A] text-black font-semibold rounded-full text-[9px] sm:text-[10px] shadow-sm uppercase tracking-wider">
          Brand
        </div>
      </div>

      {/* White Bottom Container */}
      <div className="w-full bg-white rounded-[20px] lg:rounded-[32px] shadow-sm relative flex flex-col border border-gray-100 lg:border-none">
        {children}
      </div>
      
    </div>
  );
}
