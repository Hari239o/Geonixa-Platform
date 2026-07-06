"use client"

import React, { useState } from "react"
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
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

const loginSchema = z.object({
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().default(false).optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(searchParams.get("error"))

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

  const onSubmitCredentials = async (data: LoginFormValues) => {
    setLoginError(null)
    const result = await signIn("credentials", {
      phoneNumber: data.phoneNumber,
      otp: data.password, // Mapping password to OTP for the current mock setup
      redirect: false
    });

    if (result?.error) {
      console.error("Login failed:", result.error);
      setLoginError(result.error);
    } else if (result?.ok) {
      router.push("/auth/callback");
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Section */}
      <img src="/logo.png" alt="Kalinq Logo" className="mb-6 lg:hidden w-32 h-auto object-contain filter brightness-0 invert" />
      
      <h1 className="text-3xl font-bold text-white lg:text-text-dark mb-2 text-center drop-shadow-sm lg:drop-shadow-none tracking-tight">
        Sign in to your<br />Account
      </h1>
      
      <p className="text-white/95 lg:text-text-light text-[13px] font-normal mb-6 text-center px-4">
        Enter your phone number and password to log in
      </p>

      {/* Card Section: Solid White */}
      <div className="w-[90%] max-w-[400px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6">
        
        {/* Google Button */}
        <Button 
          variant="outline" 
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/auth/callback" })}
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
          {/* Phone Number Field */}
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber" className="text-[12px] font-medium text-[#6B7280]">Phone Number</Label>
            <Input 
              id="phoneNumber" 
              placeholder="+91 00000 00000" 
              {...register("phoneNumber")} 
              className={errors.phoneNumber ? "border-red-500 focus-visible:ring-red-500 bg-red-50/50" : "bg-[#F1F5F9] border-transparent text-[#1F2937] placeholder:text-[#1F2937] h-11 rounded-[10px] focus-visible:bg-white focus-visible:border-primary-red focus-visible:ring-1 focus-visible:ring-primary-red"}
            />
            {errors.phoneNumber && <p className="text-[11px] text-red-500 ml-1">{errors.phoneNumber.message}</p>}
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

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <LoginContent />
    </React.Suspense>
  )
}
