"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"

const loginSchema = z.object({
 email: z.string().email({ message: "Please enter a valid email address" }),
 password: z.string().min(1, { message: "Password is required" }),
 rememberMe: z.boolean().default(false).optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
 const router = useRouter()
 const [showPassword, setShowPassword] = useState(false)

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

 const onSubmit = async (data: LoginFormValues) => {
 // Simulate API call
 await new Promise((resolve) => setTimeout(resolve, 1000))
 console.log("Login submitted:", data)
 router.push("/dashboard")
 }

 return (
 <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 sm:p-8">
 {/* Google Button */}
 <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2 mb-6 rounded-xl border-gray-200 text-text-dark font-medium hover:bg-gray-50">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.81 15.7 17.59V20.34H19.27C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
 <path d="M12 23C14.97 23 17.46 22.02 19.27 20.34L15.7 17.59C14.72 18.25 13.46 18.66 12 18.66C9.17 18.66 6.77 16.75 5.88 14.18H2.21V17.03C4.01 20.61 7.74 23 12 23Z" fill="#34A853"/>
 <path d="M5.88 14.18C5.65 13.5 5.52 12.77 5.52 12C5.52 11.23 5.65 10.5 5.88 9.82V6.97H2.21C1.47 8.44 1.04 10.16 1.04 12C1.04 13.84 1.47 15.56 2.21 17.03L5.88 14.18Z" fill="#FBBC05"/>
 <path d="M12 5.34C13.62 5.34 15.07 5.9 16.22 6.99L19.35 3.86C17.46 2.11 14.97 1 12 1C7.74 1 4.01 3.39 2.21 6.97L5.88 9.82C6.77 7.25 9.17 5.34 12 5.34Z" fill="#EA4335"/>
 </svg>
 Continue with Google
 </Button>

 {/* Divider */}
 <div className="relative flex items-center py-5">
 <div className="flex-grow border-t border-gray-100"></div>
 <span className="flex-shrink-0 mx-4 text-text-light text-xs font-medium">Or login with</span>
 <div className="flex-grow border-t border-gray-100"></div>
 </div>

 {/* Form */}
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
 {/* Email Field */}
 <div className="space-y-1.5">
 <Label htmlFor="email" className="text-xs text-text-light ml-1">Email</Label>
 <Input 
 id="email" 
 placeholder="Test.mail@gmail.com" 
 {...register("email")} 
 className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
 />
 {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
 </div>

 {/* Password Field */}
 <div className="space-y-1.5 relative">
 <Label htmlFor="password" className="text-xs text-text-light ml-1">Password</Label>
 <div className="relative">
 <Input 
 id="password" 
 type={showPassword ? "text" : "password"}
 placeholder="•••••••" 
 {...register("password")}
 className={errors.password ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"}
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

 {/* Remember Me & Forgot Password */}
 <div className="flex items-center justify-between pt-1">
 <div className="flex items-center space-x-2">
 <Checkbox 
 id="rememberMe" 
 onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
 />
 <Label htmlFor="rememberMe" className="text-xs text-text-light font-medium cursor-pointer">
 Remember me
 </Label>
 </div>
 
 <Link href="/auth/forgot-password" className="text-xs text-primary-red font-bold hover:underline">
 Forgot Password ?
 </Link>
 </div>

 {/* Submit Button */}
 <Button 
 type="submit" 
 variant="default" 
 size="default" 
 disabled={isSubmitting}
 className="w-full mt-4"
 >
 {isSubmitting ? "Logging in..." : "Log In"}
 </Button>
 </form>

 {/* Sign Up Link */}
 <div className="mt-8 text-center text-xs font-medium text-text-light">
 Don&apos;t have an account? <Link href="/auth/category-selection" className="text-primary-red font-bold hover:underline">Sign Up</Link>
 </div>
 </div>
 )
}
