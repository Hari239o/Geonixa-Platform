"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

const forgotSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotFormValues) => {
    setStatusMsg(null)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email })
      });
      const resData = await res.json();
      
      if (res.ok) {
        setStatusMsg({ type: 'success', text: resData.message || "Reset link sent to your email." })
      } else {
        setStatusMsg({ type: 'error', text: resData.error || "Failed to send reset link." })
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: "An unexpected error occurred." })
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-8">
      
      <h1 className="text-3xl font-bold text-white lg:text-text-dark mb-2 text-center drop-shadow-sm lg:drop-shadow-none tracking-tight">
        Forgot Password
      </h1>
      
      <p className="text-white/95 lg:text-text-light text-[13px] font-normal mb-8 text-center px-4">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <div className="w-[90%] max-w-[400px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6">
        {statusMsg && (
          <div className={`mb-6 p-3 rounded-lg text-[13px] font-medium text-center ${statusMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[12px] font-medium text-[#6B7280]">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="Enter your email" 
              {...register("email")} 
              className={errors.email ? "border-red-500 focus-visible:ring-red-500 bg-red-50/50" : "bg-[#F1F5F9] border-transparent text-[#1F2937] placeholder:text-[#9CA3AF] h-11 rounded-[10px] focus-visible:bg-white focus-visible:border-primary-red focus-visible:ring-1 focus-visible:ring-primary-red"}
            />
            {errors.email && <p className="text-[11px] text-red-500 ml-1">{errors.email.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-6 h-11 bg-primary-red hover:bg-primary-red/90 text-secondary-yellow font-semibold rounded-[10px] transition-all text-[13px]"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </div>
  )
}
