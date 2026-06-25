"use client"

import React, { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Logo } from "@/components/ui/Logo"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { signIn } from "next-auth/react"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().default(false).optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

type LoginStep = "credentials" | "otp"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>("credentials")
  const [showPassword, setShowPassword] = useState(false)

  // OTP State
  const [phoneNumber, setPhoneNumber] = useState("+91 6305799927") // Default test number for demo
  const [otp, setOtp] = useState(["", "", "", "", "", ""]) // 6 digits
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [countdown, setCountdown] = useState(30)
  const [isSending, setIsSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  // Start countdown when on OTP step
  useEffect(() => {
    if (step === "otp" && countdown > 0 && !isSending) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [step, countdown, isSending])

  const sendOTP = async (phone: string) => {
    setIsSending(true)
    setError("")
    try {
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

      setIsSending(false)
      setCountdown(30)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to send OTP. Try again.")
      setIsSending(false)
    }
  }

  const onSubmitCredentials = async (data: LoginFormValues) => {
    // Simulate checking email and password
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Credentials verified:", data)
    
    // Switch to OTP step and send OTP to the registered phone number
    setStep("otp")
    sendOTP(phoneNumber)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const onSubmitOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join("")
    if (code.length === 6) {
      setLoading(true)
      setError("")
      try {
        const result = await signIn("credentials", {
          redirect: false,
          phoneNumber: phoneNumber,
          otp: code,
        })

        if (result?.error) {
          setError("Invalid OTP. Please try again.")
          setLoading(false)
        } else {
          setTimeout(() => {
            router.push("/setup-profile")
          }, 500)
        }
      } catch (err: any) {
        setError("Something went wrong. Please try again.")
        setLoading(false)
      }
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Section */}
      <Logo large={false} showText={false} className="mb-4 lg:hidden w-10 h-10" />
      
      <h1 className="text-3xl font-bold text-white lg:text-text-dark mb-2 text-center drop-shadow-sm lg:drop-shadow-none tracking-tight">
        {step === "credentials" ? (
          <>Sign in to your<br />Account</>
        ) : (
          <>Two-Factor<br />Authentication</>
        )}
      </h1>
      
      <p className="text-white/95 lg:text-text-light text-[13px] font-normal mb-6 text-center px-4">
        {step === "credentials" 
          ? "Enter your email and password to log in" 
          : "Verify your identity with the code sent to your phone"}
      </p>

      {/* Card Section: Solid White */}
      <div className="w-full max-w-[400px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6">
        
        {step === "credentials" && (
          <>
            {/* Google Button */}
            <Button 
              variant="outline" 
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full h-[46px] flex items-center justify-center gap-3 mb-5 rounded-xl border-[#E5E7EB] text-[#4B5563] text-[13px] font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.81 15.7 17.59V20.34H19.27C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.27 20.34L15.7 17.59C14.72 18.25 13.46 18.66 12 18.66C9.17 18.66 6.77 16.75 5.88 14.18H2.21V17.03C4.01 20.61 7.74 23 12 23Z" fill="#34A853"/>
                <path d="M5.88 14.18C5.65 13.5 5.52 12.77 5.52 12C5.52 11.23 5.65 10.5 5.88 9.82V6.97H2.21C1.47 8.44 1.04 10.16 1.04 12C1.04 13.84 1.47 15.56 2.21 17.03L5.88 14.18Z" fill="#FBBC05"/>
                <path d="M12 5.34C13.62 5.34 15.07 5.9 16.22 6.99L19.35 3.86C17.46 2.11 14.97 1 12 1C7.74 1 4.01 3.39 2.21 6.97L5.88 9.82C6.77 7.25 9.17 5.34 12 5.34Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative flex items-center py-3">
              <div className="flex-grow border-t border-[#F3F4F6]"></div>
              <span className="flex-shrink-0 mx-4 text-[#9CA3AF] text-[11px] font-normal">Or login with</span>
              <div className="flex-grow border-t border-[#F3F4F6]"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[12px] font-medium text-[#6B7280]">Email</Label>
                <Input 
                  id="email" 
                  placeholder="Test.mail@gmail.com" 
                  {...register("email")} 
                  className={errors.email ? "border-red-500 focus-visible:ring-red-500 bg-red-50/50" : "bg-[#F1F5F9] border-transparent text-[#1F2937] placeholder:text-[#1F2937] h-11 rounded-[10px] focus-visible:bg-white focus-visible:border-primary-red focus-visible:ring-1 focus-visible:ring-primary-red"}
                />
                {errors.email && <p className="text-[11px] text-red-500 ml-1">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 relative">
                <Label htmlFor="password" className="text-[12px] font-medium text-[#6B7280]">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="•••••••" 
                    {...register("password")}
                    className={errors.password ? "border-red-500 focus-visible:ring-red-500 bg-red-50/50 pr-10" : "bg-[#F1F5F9] border-transparent text-[#1F2937] placeholder:text-[#1F2937] h-11 rounded-[10px] focus-visible:bg-white focus-visible:border-primary-red focus-visible:ring-1 focus-visible:ring-primary-red pr-10"}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-red hover:text-secondary-red focus:outline-none transition-colors"
                  >
                    {showPassword ? <Eye className="w-[18px] h-[18px]" /> : <EyeOff className="w-[18px] h-[18px]" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-red-500 ml-1">{errors.password.message}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rememberMe" 
                    onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="rememberMe" className="text-[11px] text-[#6B7280] font-normal cursor-pointer leading-none">
                    Remember me
                  </Label>
                </div>
                
                <Link href="/auth/forgot-password" className="text-[11px] text-primary-red font-semibold hover:underline transition-all">
                  Forgot Password ?
                </Link>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-6 h-11 bg-primary-red hover:bg-primary-red/90 text-secondary-yellow font-semibold rounded-[10px] transition-all text-[13px]"
              >
                {isSubmitting ? "Authenticating..." : "Log In"}
              </Button>
            </form>

            {/* Footer: Sign Up Link */}
            <div className="mt-6 text-center text-[11px] font-normal text-[#6B7280]">
              Don't have an account? <Link href="/auth/category-selection" className="text-primary-red font-semibold hover:underline transition-all">Sign Up</Link>
            </div>
          </>
        )}

        {step === "otp" && (
          <form onSubmit={onSubmitOTP} className="w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col items-center text-center w-full mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-2">OTP Verification</h2>
              <p className="text-sm text-slate-500">
                We have sent a 6-digit code to<br/>
                <span className="font-bold text-slate-800 text-base mt-1 block">
                  {phoneNumber}
                </span>
              </p>
            </div>

            {error && <p className="text-[11px] text-red-500 mb-4 text-center">{error}</p>}
            {isSending && <p className="text-[11px] text-blue-500 mb-4 animate-pulse">Sending OTP...</p>}

            <div className="flex gap-2 sm:gap-3 justify-center mb-6 w-full">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={isSending}
                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 text-center text-xl font-semibold outline-none transition-all
                    ${digit ? 'border-[#FF4D2D] text-slate-800' : 'border-slate-200 text-slate-400 bg-[#F5F5F5]'}
                    focus:border-[#FF4D2D] focus:bg-white disabled:opacity-50
                  `}
                />
              ))}
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Resend OTP in <span className="font-medium text-slate-700">{countdown}</span>
            </p>

            {countdown === 0 && !isSending && (
              <Button 
                type="button" 
                variant="link" 
                onClick={() => sendOTP(phoneNumber)}
                className="text-[#FF4D2D] mb-4 -mt-2 text-[13px] h-auto p-0"
              >
                Resend Code
              </Button>
            )}

            <div className="w-full mt-2">
              <Button 
                type="submit" 
                disabled={otp.join("").length !== 6 || isSending || loading}
                className="w-full h-11 bg-primary-red hover:bg-primary-red/90 text-white rounded-[10px] text-[13px] font-semibold transition-all disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Log In"}
              </Button>
            </div>

            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setStep("credentials")}
              className="mt-4 text-[12px] text-slate-500 hover:text-slate-700"
            >
              Back to Email/Password
            </Button>
          </form>
        )}

      </div>
    </div>
  )
}
