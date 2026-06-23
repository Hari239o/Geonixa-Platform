"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSignup } from "@/components/auth/SignupContext"

export default function OTPVerificationPage() {
  const router = useRouter()
  const { data } = useSignup()
  
  const [otp, setOtp] = useState(["", "", "", ""])
  const [timer, setTimer] = useState(30)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  // Auto focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple chars

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input if value is entered
    if (value && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus()
      } else {
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 4)
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      // Focus the next empty input or the last one
      const focusIndex = Math.min(pastedData.length, 3)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleNext = () => {
    router.push("/auth/signup/brand/details")
  }

  const isValid = otp.every(digit => digit !== "")

  return (
    <div className="w-full flex flex-col items-center">
      
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 sm:p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-text-dark mb-2">OTP Verification</h2>
        
        <p className="text-sm text-text-light text-center mb-1">
          We have sent a verification code to
        </p>
        <p className="text-base font-bold text-text-dark mb-8">
          {data.phone || "+91 000-000-0000"}
        </p>

        <div className="flex gap-4 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-100 focus:border-primary-red focus:ring-1 focus:ring-primary-red outline-none transition-all"
            />
          ))}
        </div>

        <div className="text-sm font-medium mb-8">
          {timer > 0 ? (
            <span className="text-text-light">Resend OTP in <span className="font-bold text-primary-red">{timer}s</span></span>
          ) : (
            <button 
              onClick={() => setTimer(30)}
              className="text-primary-red font-bold hover:underline focus:outline-none"
            >
              Resend OTP
            </button>
          )}
        </div>

        <Button 
          onClick={handleNext} 
          disabled={!isValid}
          className="w-full h-12 bg-primary-red hover:bg-primary-red/90 text-white font-bold rounded-xl"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
