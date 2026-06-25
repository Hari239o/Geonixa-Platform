"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";

export default function CreatorSignupStep1() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    category: "",
    creatorType: "",
    phoneNumber: "",
  });

  // Load saved data from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("creatorSignupData");
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
      sessionStorage.setItem("creatorSignupData", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/auth/signup/creator/otp");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-5 sm:p-6 flex flex-col h-full justify-between">
      
      <div className="flex flex-col gap-3">
        
        {/* Name Fields */}
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <Label className="text-[11px] text-slate-500 font-normal ml-1">First Name</Label>
            <Input 
              required
              placeholder="First Name" 
              value={formData.firstName}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              className="bg-[#F5F5F5] border-slate-200 rounded-xl h-10 focus-visible:ring-[#FF4D2D]/20 focus-visible:border-[#FF4D2D]"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <Label className="text-[11px] text-slate-500 font-normal ml-1">Last Name</Label>
            <Input 
              required
              placeholder="Last Name" 
              value={formData.lastName}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              className="bg-[#F5F5F5] border-slate-200 rounded-xl h-10 focus-visible:ring-[#FF4D2D]/20 focus-visible:border-[#FF4D2D]"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] text-slate-500 font-normal ml-1">Email</Label>
          <Input 
            required
            type="email"
            placeholder="Loisbecket@gmail.com" 
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className="bg-[#F5F5F5] border-slate-200 rounded-xl h-10 focus-visible:ring-[#FF4D2D]/20 focus-visible:border-[#FF4D2D]"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-col gap-1 relative">
          <Label className="text-[11px] text-slate-500 font-normal ml-1">Type of Category</Label>
          <div className="relative">
            <select
              required
              value={formData.category}
              onChange={(e) => updateFormData({ category: e.target.value })}
              className="w-full bg-[#F5F5F5] border border-slate-200 rounded-xl h-10 px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF4D2D]/20 focus:border-[#FF4D2D]"
            >
              <option value="" disabled hidden>Select Category</option>
              <option value="fashion">Fashion & Style</option>
              <option value="tech">Technology</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="food">Food & Beverage</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Creator Type Dropdown */}
        <div className="flex flex-col gap-1 relative">
          <Label className="text-[11px] text-slate-500 font-normal ml-1">Type of Creator</Label>
          <div className="relative">
            <select
              required
              value={formData.creatorType}
              onChange={(e) => updateFormData({ creatorType: e.target.value })}
              className="w-full bg-[#F5F5F5] border border-slate-200 rounded-xl h-10 px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF4D2D]/20 focus:border-[#FF4D2D]"
            >
              <option value="" disabled hidden>Select Creator Type</option>
              <option value="ugc">User Generated Content</option>
              <option value="influencer">Influencer</option>
              <option value="streamer">Streamer</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1">
          <Label className="text-[11px] text-slate-500 font-normal ml-1">Phone Number</Label>
          <div className="flex w-full bg-[#F5F5F5] border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#FF4D2D]/20 focus-within:border-[#FF4D2D] transition-all">
            <div className="flex items-center justify-center px-3 border-r border-slate-200 gap-1.5">
              <span className="text-base">🇮🇳</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>
            <Input 
              required
              type="tel"
              placeholder="(+91) 000-000-0000" 
              value={formData.phoneNumber}
              onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
              className="border-none bg-transparent rounded-none h-10 focus-visible:ring-0 shadow-none px-3"
            />
          </div>
        </div>

      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button 
          type="submit" 
          className="w-full bg-[#FF4D2D] hover:bg-[#FF4D2D]/90 text-white rounded-xl h-11 text-sm font-semibold shadow-md shadow-[#FF4D2D]/20"
        >
          Next
        </Button>
        
        <div className="relative flex items-center justify-center py-1">
          <div className="absolute border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] text-slate-400 relative z-10 uppercase tracking-wide">Or</span>
        </div>

        <Button 
          type="button" 
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          variant="outline"
          className="w-full bg-white border-slate-200 hover:bg-slate-50 rounded-xl h-11 text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
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
