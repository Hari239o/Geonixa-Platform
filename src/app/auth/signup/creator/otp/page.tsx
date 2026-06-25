"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function CreatorSignupStep2OTP() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("+91 0000000000"); // Default fallback
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 digits for Fast2SMS
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(true);

  const hasMounted = useRef(false);

  const sendOTP = async (phone: string) => {
    setIsSending(true);
    setError("");
    try {
      // Call our custom Fast2SMS backend
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setIsSending(false);
      setCountdown(30);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to send OTP. Try again.");
      setIsSending(false);
    }
  };

  // Load saved data from sessionStorage and send OTP
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    let savedPhone = "+91 0000000000";
    const saved = sessionStorage.getItem("creatorSignupData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.phoneNumber) {
          // Remove all non-digit characters
          let cleanPhone = parsed.phoneNumber.replace(/\D/g, '');
          // If it doesn't already start with 91 (for India), prepend it
          if (!cleanPhone.startsWith('91')) {
             cleanPhone = '91' + cleanPhone;
          }
          savedPhone = '+' + cleanPhone;
          setTimeout(() => setPhoneNumber(savedPhone), 0);
        }
      } catch {}
    }

    sendOTP(savedPhone);
  }, []);

  useEffect(() => {
    if (countdown > 0 && !isSending) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isSending]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) {
      setLoading(true);
      setError("");
      try {
        // Authenticate with NextAuth Credentials Provider
        const result = await signIn("credentials", {
          redirect: false,
          phoneNumber: phoneNumber,
          otp: code,
        });

        if (result?.error) {
          setError("Invalid OTP. Please try again.");
          setLoading(false);
        } else {
          // Authentication successful!
          router.push("/auth/signup/creator/social-links");
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-5 sm:p-6 flex flex-col items-center h-full justify-between">
      
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col items-center text-center w-full mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-2">OTP Verification</h2>
        <p className="text-sm text-slate-500">
          We have sent a 6-digit code to<br/>
          <span className="font-bold text-slate-800 text-base mt-1 block">
            {phoneNumber}
          </span>
        </p>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {isSending && <p className="text-sm text-blue-500 mb-4 animate-pulse">Sending OTP...</p>}

      <div className="flex gap-2 sm:gap-3 justify-center mb-8 w-full">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isSending}
            className={`w-12 h-14 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border-2 text-center text-2xl font-semibold outline-none transition-all
              ${digit ? 'border-[#FF4D2D] text-slate-800' : 'border-slate-200 text-slate-400 bg-[#F5F5F5]'}
              focus:border-[#FF4D2D] focus:bg-white disabled:opacity-50
            `}
          />
        ))}
      </div>

      <p className="text-sm text-slate-500 mb-6">
        Resend OTP in <span className="font-medium text-slate-700">{countdown}</span>
      </p>

      {countdown === 0 && !isSending && (
        <Button 
          type="button" 
          variant="link" 
          onClick={() => sendOTP(phoneNumber)}
          className="text-[#FF4D2D] mb-4 -mt-4"
        >
          Resend Code
        </Button>
      )}

      </div>

      <div className="w-full mt-2">
        <Button 
          type="submit" 
          disabled={otp.join("").length !== 6 || isSending || loading}
          className="w-full bg-[#FF4D2D] hover:bg-[#FF4D2D]/90 text-white rounded-xl h-14 text-lg font-bold shadow-md shadow-[#FF4D2D]/20 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Next"}
        </Button>
      </div>
    </form>
  );
}
