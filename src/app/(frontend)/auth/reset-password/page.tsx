"use client"

import React, { useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

const resetSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetFormValues = z.infer<typeof resetSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetFormValues) => {
    setStatusMsg(null)
    if (!token) {
      setStatusMsg({ type: 'error', text: "Invalid or missing token." })
      return
    }
    
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password })
      });
      const resData = await res.json();
      
      if (res.ok) {
        setStatusMsg({ type: 'success', text: "Password reset successfully. Redirecting..." })
        setTimeout(() => router.push("/auth/login"), 2000)
      } else {
        setStatusMsg({ type: 'error', text: resData.error || "Failed to reset password." })
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: "An unexpected error occurred." })
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-8">
        <Link href="/auth/login" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-[12px] flex items-center justify-center text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10"></div>
      </div>
      
      <h1 className="text-3xl font-bold text-white lg:text-text-dark mb-2 text-center drop-shadow-sm lg:drop-shadow-none tracking-tight">
        New Password
      </h1>
      
      <p className="text-white/95 lg:text-text-light text-[13px] font-normal mb-8 text-center px-4">
        Enter your new password below.
      </p>

      <div className="w-[90%] max-w-[400px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6">
        {statusMsg && (
          <div className={`mb-6 p-3 rounded-lg text-[13px] font-medium text-center ${statusMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5 relative">
            <Label htmlFor="password" className="text-[12px] font-medium text-[#6B7280]">New Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                placeholder="•••••••" 
                {...register("password")}
                className={errors.password ? "border-red-500 focus-visible:ring-red-500 bg-red-50/50 pr-10" : "bg-[#F1F5F9] border-transparent text-[#1F2937] placeholder:text-[#9CA3AF] h-11 rounded-[10px] focus-visible:bg-white focus-visible:border-primary-red focus-visible:ring-1 focus-visible:ring-primary-red pr-10"}
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

          <div className="space-y-1.5 relative">
            <Label htmlFor="confirmPassword" className="text-[12px] font-medium text-[#6B7280]">Confirm Password</Label>
            <div className="relative">
              <Input 
                id="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"}
                placeholder="•••••••" 
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500 bg-red-50/50 pr-10" : "bg-[#F1F5F9] border-transparent text-[#1F2937] placeholder:text-[#9CA3AF] h-11 rounded-[10px] focus-visible:bg-white focus-visible:border-primary-red focus-visible:ring-1 focus-visible:ring-primary-red pr-10"}
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-red hover:text-secondary-red focus:outline-none transition-colors"
              >
                {showConfirmPassword ? <Eye className="w-[18px] h-[18px]" /> : <EyeOff className="w-[18px] h-[18px]" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[11px] text-red-500 ml-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-6 h-11 bg-primary-red hover:bg-primary-red/90 text-secondary-yellow font-semibold rounded-[10px] transition-all text-[13px]"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-20">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
