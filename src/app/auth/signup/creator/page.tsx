"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";

export default function CreatorSignupStep1() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    category: "",
    creatorType: "",
    phoneNumber: "",
    password: "",
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

  const handleSendOtp = () => {
    if (!formData.phoneNumber) return;
    setShowOtpModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOtpModal(true);
  };

  const handleVerifyAndSignup = () => {
    if (otp.join("").length === 6) {
      setShowOtpModal(false);
      router.push("/auth/login");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const focusIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full p-6 pb-12 flex flex-col min-h-max">
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

          {/* Password */}
          <div className="flex flex-col gap-1 relative">
            <Label className="text-[11px] text-slate-500 font-normal ml-1">Password</Label>
            <div className="relative">
              <Input 
                required
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                className="bg-[#F5F5F5] border-slate-200 rounded-xl h-10 pr-10 focus-visible:ring-[#FF4D2D]/20 focus-visible:border-[#FF4D2D]"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF4D2D] focus:outline-none transition-colors"
              >
                {showPassword ? <Eye className="w-[18px] h-[18px]" /> : <EyeOff className="w-[18px] h-[18px]" />}
              </button>
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
                className="border-none bg-transparent rounded-none h-10 focus-visible:ring-0 shadow-none px-3 w-full"
              />
            </div>
            {formData.phoneNumber && (
              <Button 
                type="button" 
                onClick={handleSendOtp}
                className="mt-1.5 bg-[#F5F5F5] text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-xl h-8 text-[12px] font-medium self-end px-4 transition-colors shadow-sm"
              >
                Send OTP
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button 
            type="submit" 
            className="w-full bg-[#FF4D2D] hover:bg-[#FF4D2D]/90 text-white rounded-xl h-11 text-sm font-semibold shadow-md shadow-[#FF4D2D]/20"
          >
            Sign Up
          </Button>
          
          <div className="relative flex items-center justify-center py-2 mt-1">
            <div className="absolute border-t border-slate-200 w-full"></div>
            <span className="bg-white px-4 text-[11px] text-slate-400 relative z-10 capitalize tracking-wide font-medium">Or</span>
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

      {/* OTP Modal exactly matching the provided design */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] pt-8 pb-6 px-6 w-full max-w-[340px] flex flex-col items-center relative shadow-[0_10px_40px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-200">
            
            <div 
              className="absolute inset-0 -z-10" 
              onClick={() => setShowOtpModal(false)}
            />

            <h3 className="text-[17px] font-bold text-[#111111] mb-5">OTP Verification</h3>
            
            <div className="flex flex-col items-center mb-6">
              <p className="text-[13px] text-[#666666]">We have sent a verification code to</p>
              <p className="text-[14px] font-bold text-[#111111] mt-1">{formData.phoneNumber || "+91 0000000000"}</p>
            </div>
            
            <div className="flex gap-2 mb-6 w-full justify-center">
              {otp.map((digit, idx) => (
                <input 
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-10 h-11 sm:w-11 sm:h-12 text-center text-xl font-semibold text-[#111111] rounded-[10px] border border-[#E0E0E0] bg-transparent focus:border-[#FF4D2D] focus:ring-1 focus:ring-[#FF4D2D] focus:outline-none transition-all shadow-sm"
                />
              ))}
            </div>
            
            <p className="text-[13px] text-[#666666] mb-6">
              Resend OTP in 30
            </p>
            
            <Button 
              type="button"
              onClick={handleVerifyAndSignup}
              disabled={otp.join("").length !== 6}
              className="w-full bg-[#FF4D2D] hover:bg-[#FF4D2D]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[12px] h-[50px] text-[15px] font-medium transition-all"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
