"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

interface OtpStepProps {
 phone: string
 onNext: () => void
}

export function OtpStep({ phone, onNext }: OtpStepProps) {
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

 const isValid = otp.every(digit => digit !== "")

 return (
 <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 sm:p-8 flex flex-col items-center">
 <h2 className="text-lg font-bold text-text-dark mb-2">OTP Verification</h2>
 
 <p className="text-sm text-text-light text-center mb-1">
 We have sent a verification code to
 </p>
 <p className="text-sm font-bold text-text-dark mb-8">
 {phone || "+91 7853065649"}
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
 className="w-14 h-14 text-center text-2xl font-bold rounded-xl border border-border focus:border-primary-red focus:ring-1 focus:ring-primary-red outline-none transition-all"
 />
 ))}
 </div>

 <p className="text-sm text-text-light mb-8">
 Resend OTP in {timer}
 </p>

 <Button 
 onClick={onNext} 
 disabled={!isValid}
 className="w-full"
 >
 Next
 </Button>
 </div>
 )
}
