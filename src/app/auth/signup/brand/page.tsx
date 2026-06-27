"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, Eye, EyeOff } from "lucide-react";

export default function BrandSignupStep1() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    brandName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Load saved data from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("brandSignupData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => setFormData(prev => ({ ...prev, ...parsed })), 0);
      } catch {}
    }
  }, []);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...data };
      sessionStorage.setItem("brandSignupData", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("userRole", "brand");
    router.push("/brand");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-5 sm:p-6 flex flex-col h-full overflow-y-auto no-scrollbar pb-10">
      
      <div className="flex flex-col gap-3">
        
        {/* Brand Name */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-[#A0A0A0] font-medium ml-1">Brand Name</Label>
          <Input 
            required
            placeholder="Lois" 
            value={formData.brandName}
            onChange={(e) => updateFormData({ brandName: e.target.value })}
            className="bg-[#F8F8F8] border-transparent rounded-[14px] h-[52px] px-4 text-[14px] text-[#333333] font-medium placeholder:text-[#333333] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#FF4D2D] focus-visible:border-[#FF4D2D] shadow-sm"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-[#A0A0A0] font-medium ml-1">Email</Label>
          <Input 
            required
            type="email"
            placeholder="loisbecket@gmail.com" 
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className="bg-[#F8F8F8] border-transparent rounded-[14px] h-[52px] px-4 text-[14px] text-[#333333] font-medium placeholder:text-[#333333] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#FF4D2D] focus-visible:border-[#FF4D2D] shadow-sm"
          />
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-[#A0A0A0] font-medium ml-1">Phone Number</Label>
          <div className="flex w-full bg-[#F8F8F8] border border-transparent rounded-[14px] overflow-hidden focus-within:ring-1 focus-within:ring-[#FF4D2D] focus-within:border-[#FF4D2D] focus-within:bg-white transition-all shadow-sm">
            <div className="flex items-center justify-center pl-4 pr-2 gap-1.5 border-r border-transparent">
              <span className="text-[18px]">🇮🇳</span>
              <ChevronDown className="w-3 h-3 text-[#A0A0A0]" />
            </div>
            <Input 
              required
              type="tel"
              placeholder="(+91) 000-000-0000" 
              value={formData.phoneNumber}
              onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
              className="border-none bg-transparent rounded-none h-[52px] text-[14px] text-[#333333] font-medium placeholder:text-[#888888] focus-visible:ring-0 shadow-none px-3 w-full"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-[#A0A0A0] font-medium ml-1">Password</Label>
          <div className="relative">
            <Input 
              required
              type={showPassword ? "text" : "password"}
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => updateFormData({ password: e.target.value })}
              className="bg-[#F8F8F8] border-transparent rounded-[14px] h-[52px] px-4 text-[14px] text-[#333333] font-medium placeholder:text-[#333333] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#FF4D2D] focus-visible:border-[#FF4D2D] shadow-sm pr-10"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <Eye className="w-[18px] h-[18px]" /> : <EyeOff className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

      </div>

      <div className="mt-2 flex flex-col gap-4">
        <Button 
          type="submit" 
          className="w-full bg-[#FF4D2D] hover:bg-[#FF4D2D]/90 text-white rounded-[14px] h-[52px] text-[15px] font-semibold shadow-[0_4px_14px_0_rgba(255,77,45,0.39)] transition-all active:scale-[0.98] mt-2"
        >
          Sign Up
        </Button>
        
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute border-t border-[#F0F0F0] w-full"></div>
          <span className="bg-white px-3 text-[11px] text-[#A0A0A0] relative z-10 font-medium">Or</span>
        </div>

        <Button 
          type="button" 
          variant="outline"
          className="w-full bg-white border-[#EEEEEE] hover:bg-slate-50 rounded-[14px] h-[52px] text-[14px] font-semibold text-[#333333] flex items-center justify-center gap-3 shadow-sm transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </Button>
      </div>
    </form>
  );
}
