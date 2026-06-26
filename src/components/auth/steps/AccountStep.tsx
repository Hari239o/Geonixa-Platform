"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SignupData } from "../SignupContext"
import { useRouter } from "next/navigation"

const accountSchema = z.object({
 username: z.string().min(3, { message: "Username must be at least 3 characters" }),
 password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type AccountFormValues = z.infer<typeof accountSchema>

interface AccountStepProps {
 initialData: SignupData
 onComplete: (data: Partial<SignupData>) => void
}

export function AccountStep({ initialData, onComplete }: AccountStepProps) {
 const router = useRouter()
 const [showPassword, setShowPassword] = useState(false)

 const {
 register,
 handleSubmit,
 formState: { errors, isSubmitting },
 } = useForm<AccountFormValues>({
 resolver: zodResolver(accountSchema),
 defaultValues: {
 username: initialData.username || "",
 password: initialData.password || "",
 },
 })

 const onSubmit = async (data: AccountFormValues) => {
 onComplete(data)
 
 // Simulate API call for registration
 await new Promise((resolve) => setTimeout(resolve, 1000))
 
 // Redirect to dashboard on success
 router.push("/dashboard")
 }

 return (
 <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 sm:p-8">
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
 
 <div className="space-y-1.5">
 <Label htmlFor="username" className="text-xs text-text-light ml-1">Username</Label>
 <Input 
 id="username" 
 placeholder="Loisbecket@gmail.com" 
 {...register("username")} 
 className={errors.username ? "border-red-500" : ""}
 />
 {errors.username && <p className="text-xs text-red-500 ml-1">{errors.username.message}</p>}
 </div>

 <div className="space-y-1.5 relative">
 <Label htmlFor="password" className="text-xs text-text-light ml-1">Password</Label>
 <div className="relative">
 <Input 
 id="password" 
 type={showPassword ? "text" : "password"}
 placeholder="•••••••" 
 {...register("password")}
 className={errors.password ? "border-red-500 pr-10" : "pr-10"}
 />
 <button 
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-red hover:text-secondary-red focus:outline-none"
 >
 {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
 </button>
 </div>
 {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
 </div>

 <Button 
 type="submit" 
 disabled={isSubmitting}
 className="w-full mt-4"
 >
 {isSubmitting ? "Signing up..." : "Sign Up"}
 </Button>
 </form>
 </div>
 )
}
