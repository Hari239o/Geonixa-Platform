"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

export default function CreatorSignupStep1() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    category: "",
    creatorType: "influencer",
    phoneNumber: "",
    password: "",
  });

  // Load saved data from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("creatorSignupData");
    if (saved) {
      setTimeout(() => {
        try {
          const parsed = JSON.parse(saved);
          setTimeout(() => setFormData(prev => ({ ...prev, ...parsed })), 0);
        } catch {}
      }, 0);
    }
  }, []);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...data };
      sessionStorage.setItem("creatorSignupData", JSON.stringify(updated));
      return updated;
    });
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phoneNumber) return;
    setOtpError("");
    setIsSendingOtp(true);
    
    try {
      setupRecaptcha();
      const formattedPhone = "+91" + formData.phoneNumber.replace(/\D/g, '');
      const appVerifier = (window as any).recaptchaVerifier;
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setShowOtpModal(true);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP: " + (error.message || "Unknown error"));
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneVerified) {
      handleSendOtp();
      return;
    }
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "+91" + formData.phoneNumber.replace(/\D/g, ''),
          role: "creator",
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
        }),
      });

      if (res.ok) {
        router.push("/auth/login");
      } else {
        console.error("Failed to register user");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleSignup = () => {
    document.cookie = "signupRole=creator; path=/; max-age=3600";
    signIn("google", { callbackUrl: "/auth/callback" });
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length === 6 && confirmationResult) {
      setIsVerifyingOtp(true);
      setOtpError("");
      try {
        await confirmationResult.confirm(otpCode);
        setIsPhoneVerified(true);
        setShowOtpModal(false);
      } catch (error: any) {
        console.error("Error verifying OTP:", error);
        setOtpError("Invalid OTP. Please try again.");
      } finally {
        setIsVerifyingOtp(false);
      }
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
      <form onSubmit={handleSubmit} className="w-full p-3 sm:p-5 lg:p-6 pb-6 lg:pb-12 flex flex-col min-h-max">
        <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
          {/* Name Fields */}
          <div className="flex gap-2 sm:gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-[10px] sm:text-[11px] text-slate-500 font-normal ml-1">First Name</Label>
              <Input 
                required
                placeholder="First Name" 
                value={formData.firstName}
                onChange={(e) => updateFormData({ firstName: e.target.value })}
                className="bg-[#F5F5F5] border-slate-200 rounded-lg sm:rounded-xl h-10 lg:h-12 focus-visible:ring-[#EF4423]/20 focus-visible:border-[#EF4423] text-[13px] sm:text-[14px]"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-[10px] sm:text-[11px] text-slate-500 font-normal ml-1">Last Name</Label>
              <Input 
                required
                placeholder="Last Name" 
                value={formData.lastName}
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                className="bg-[#F5F5F5] border-slate-200 rounded-lg sm:rounded-xl h-10 lg:h-12 focus-visible:ring-[#EF4423]/20 focus-visible:border-[#EF4423] text-[13px] sm:text-[14px]"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] sm:text-[11px] text-slate-500 font-normal ml-1">Email</Label>
            <Input 
              required
              type="email"
              placeholder="Loisbecket@gmail.com" 
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className="bg-[#F5F5F5] border-slate-200 rounded-lg sm:rounded-xl h-10 lg:h-12 focus-visible:ring-[#EF4423]/20 focus-visible:border-[#EF4423] text-[13px] sm:text-[14px]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col gap-1 relative">
            <Label className="text-[10px] sm:text-[11px] text-slate-500 font-normal ml-1">Type of Category</Label>
            <div className="relative">
              <select
                required
                value={formData.category}
                onChange={(e) => updateFormData({ category: e.target.value })}
                className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg sm:rounded-xl h-10 lg:h-12 px-3 text-[13px] sm:text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#EF4423]/20 focus:border-[#EF4423]"
              >
                <option value="" disabled hidden>Select Category</option>
                <option value="fashion">Fashion & Style</option>
                <option value="tech">Technology</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="food">Food & Beverage</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>



          {/* Password */}
          <div className="flex flex-col gap-1 relative">
            <Label className="text-[10px] sm:text-[11px] text-slate-500 font-normal ml-1">Password</Label>
            <div className="relative">
              <Input 
                required
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                className="bg-[#F5F5F5] border-slate-200 rounded-lg sm:rounded-xl h-10 lg:h-12 pr-10 focus-visible:ring-[#EF4423]/20 focus-visible:border-[#EF4423] text-[13px] sm:text-[14px]"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#EF4423] focus:outline-none transition-colors"
              >
                {showPassword ? <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : <EyeOff className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
              </button>
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] sm:text-[11px] text-slate-500 font-normal ml-1">Phone Number</Label>
            <div className="flex w-full bg-[#F5F5F5] border border-slate-200 rounded-lg sm:rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#EF4423]/20 focus-within:border-[#EF4423] transition-all h-10 lg:h-12">
              <div className="flex items-center justify-center px-2.5 sm:px-3 border-r border-slate-200 gap-1 sm:gap-1.5">
                <span className="text-[14px] sm:text-base">🇮🇳</span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500" />
              </div>
              <Input 
                required
                type="tel"
                placeholder="(+91) 000-000-0000" 
                value={formData.phoneNumber}
                onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
                className="border-none bg-transparent rounded-none h-full focus-visible:ring-0 shadow-none px-2 sm:px-3 w-full text-[13px] sm:text-[14px]"
              />
            </div>
            {formData.phoneNumber && !isPhoneVerified && (
              <Button 
                type="button" 
                onClick={handleSendOtp}
                className="mt-1 bg-[#F5F5F5] text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-[8px] sm:rounded-xl h-7 sm:h-8 text-[10px] sm:text-[12px] font-medium self-end px-3 sm:px-4 transition-colors shadow-sm"
              >
                Send OTP
              </Button>
            )}
            {isPhoneVerified && (
              <span className="mt-1 text-[11px] sm:text-[13px] text-green-600 font-medium self-end px-2 py-0.5 sm:py-1">
                ✓ Verified
              </span>
            )}
          </div>
        </div>


        <div className="mt-3 sm:mt-5 lg:mt-6 flex flex-col gap-2 sm:gap-3 lg:gap-4">
          <Button 
            type="submit" 
            className="w-full bg-[#EF4423] hover:bg-[#EF4423]/90 text-white rounded-lg sm:rounded-[14px] h-10 sm:h-12 lg:h-[52px] text-[13px] sm:text-[15px] font-semibold shadow-[0_4px_14px_0_rgba(255,77,45,0.39)] transition-all active:scale-[0.98]"
          >
            Sign Up
          </Button>
          
          <div className="relative flex items-center justify-center py-1 mt-1">
            <div className="absolute border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 sm:px-4 text-[10px] sm:text-[11px] text-slate-400 relative z-10 capitalize tracking-wide font-medium">Or</span>
          </div>

          <Button 
            type="button" 
            onClick={handleGoogleSignup}
            variant="outline"
            className="w-full bg-white border-slate-200 hover:bg-slate-50 rounded-lg sm:rounded-xl h-10 sm:h-11 lg:h-12 text-[12px] sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </Button>

          <div id="recaptcha-container"></div>
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
                  className="w-10 h-11 sm:w-11 sm:h-12 text-center text-xl font-semibold text-[#111111] rounded-[10px] border border-[#E0E0E0] bg-transparent focus:border-[#EF4423] focus:ring-1 focus:ring-[#EF4423] focus:outline-none transition-all shadow-sm"
                />
              ))}
            </div>
            
            {otpError && (
              <p className="text-[#EF4423] text-sm text-center mt-4 font-medium">{otpError}</p>
            )}
            <Button 
              onClick={handleVerifyOtp}
              disabled={otp.join("").length !== 6 || isVerifyingOtp}
              className="w-full mt-8 bg-[#EF4423] hover:bg-[#EF4423]/90 text-white rounded-[14px] h-[52px] text-[15px] font-semibold"
            >
              {isVerifyingOtp ? "Verifying..." : "Verify Code"}
            </Button>
            <div className="mt-4 text-center">
              <span className="text-[#A0A0A0] text-sm">Didn't receive the code? </span>
              <button 
                type="button"
                disabled={isSendingOtp}
                onClick={handleSendOtp}
                className="text-[#333333] text-sm font-semibold hover:underline"
              >
                {isSendingOtp ? "Sending..." : "Resend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
