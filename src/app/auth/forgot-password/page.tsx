"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/ui/Logo"
import Link from "next/link"

import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"

const forgotPasswordSchema = z.object({
 email: z.string().email({ message: "Please enter a valid email address" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

type Step = "email" | "success"

export default function ForgotPasswordPage() {
 const [step, setStep] = useState<Step>("email")

 const {
 register,
 handleSubmit,
 setError,
 formState: { errors, isSubmitting },
 } = useForm<ForgotPasswordFormValues>({
 resolver: zodResolver(forgotPasswordSchema),
 })

 const onSubmit = async (data: ForgotPasswordFormValues) => {
 try {
 await sendPasswordResetEmail(auth, data.email)
 setStep("success")
 } catch (error: any) {
 console.error("Password reset error:", error)
 setError("email", { 
 type: "manual", 
 message: error.code === "auth/user-not-found" ? "No account found with this email" : "Failed to send reset link. Please try again." 
 })
 }
 }

 return (
 <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
 {/* Top Section */}
 <Logo large={false} showText={false} className="mb-4 lg:hidden w-10 h-10" />
 
 <h1 className="text-3xl font-bold text-white lg:text-text-dark mb-2 text-center drop-shadow-sm lg:drop-shadow-none tracking-tight">
 {step === "email" ? (
 <>Reset your<br />Password</>
 ) : (
 <>Check your<br />Email</>
 )}
 </h1>
 
 <p className="text-white/95 lg:text-text-light text-[13px] font-normal mb-6 text-center px-4">
 {step === "email" 
 ? "Enter your email and we'll send a link to reset your password." 
 : "We have sent a secure reset link to your email address."}
 </p>

 {/* Card Section: Solid White */}
 <div className="w-full max-w-[400px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6">
 
 {step === "email" && (
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

 {/* Submit Button */}
 <Button 
 type="submit" 
 disabled={isSubmitting}
 className="w-full mt-6 h-11 bg-primary-red hover:bg-primary-red/90 text-white font-semibold rounded-[10px] transition-all text-[13px] shadow-[0_4px_14px_0_rgba(255,77,45,0.39)]"
 >
 {isSubmitting ? "Sending Link..." : "Send Reset Link"}
 </Button>
 </form>
 )}

 {step === "success" && (
 <div className="flex flex-col items-center py-4">
 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
 <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 </div>
 <Link href="/auth/login" className="w-full">
 <Button 
 variant="outline"
 className="w-full h-11 border-[#EEEEEE] text-[#333333] font-semibold rounded-[10px] hover:bg-slate-50 transition-all text-[13px]"
 >
 Back to Login
 </Button>
 </Link>
 </div>
 )}

 {/* Footer: Back to Login Link */}
 {step === "email" && (
 <div className="mt-6 text-center text-[11px] font-normal text-[#6B7280]">
 Remember your password? <Link href="/auth/login" className="text-primary-red font-semibold hover:underline transition-all">Log In</Link>
 </div>
 )}

 </div>
 </div>
 )
}
