"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSignup } from "@/components/auth/SignupContext"

const brandDetailsSchema = z.object({
  brandName: z.string().min(2, { message: "Brand Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(5, { message: "Phone number is required" }),
  countryCode: z.string().min(1, "Required"),
})

type BrandDetailsFormValues = z.infer<typeof brandDetailsSchema>

export default function BrandSignupStep1() {
  const router = useRouter()
  const { data, updateData } = useSignup()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BrandDetailsFormValues>({
    resolver: zodResolver(brandDetailsSchema),
    defaultValues: {
      brandName: data.brandName || "",
      email: data.email || "",
      phone: data.phone.replace(/^\+\d+\s/, "") || "", // strip country code if present
      countryCode: data.countryCode || "+91", 
    },
  })

  const onSubmit = (formData: BrandDetailsFormValues) => {
    updateData({
      brandName: formData.brandName,
      email: formData.email,
      countryCode: formData.countryCode,
      phone: formData.phone,
    })
    router.push("/auth/signup/brand/otp")
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Orange-Red Header */}
      <h1 className="text-3xl font-bold text-white mb-2 text-center drop-shadow-sm">
        Tell us about<br />your Brand
      </h1>
      <p className="text-white/90 text-sm font-medium mb-8 text-center px-4">
        Enter your brand details to get started
      </p>

      {/* White Card */}
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          <div className="space-y-1.5">
            <Label htmlFor="brandName" className="text-xs font-semibold text-text-light ml-1">Brand Name</Label>
            <Input 
              id="brandName" 
              placeholder="e.g. Kalinq Co." 
              {...register("brandName")} 
              className={errors.brandName ? "border-red-500" : ""}
            />
            {errors.brandName && <p className="text-xs text-red-500 ml-1">{errors.brandName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-text-light ml-1">Email</Label>
            <Input 
              id="email" 
              placeholder="brand@kalinq.com" 
              {...register("email")} 
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold text-text-light ml-1">Phone Number</Label>
            <div className="flex gap-2">
              <div className="w-[100px]">
                <Select defaultValue={data.countryCode || "+91"} onValueChange={(val) => setValue("countryCode", val)}>
                  <SelectTrigger className="bg-[#F9FAFB] border-border h-12">
                    <span className="flex items-center gap-1">
                      🇮🇳 <SelectValue />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+91">🇮🇳 +91</SelectItem>
                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input 
                id="phone" 
                placeholder="(+91) 000-000-0000" 
                {...register("phone")} 
                className={`flex-1 ${errors.phone ? "border-red-500" : ""}`}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone.message}</p>}
          </div>

          <Button type="submit" className="w-full mt-2 h-12 bg-primary-red hover:bg-primary-red/90 text-white font-bold rounded-xl">
            Next
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink-0 mx-4 text-text-light text-xs font-medium">Or</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        {/* Google Button */}
        <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-gray-200 text-text-dark font-medium hover:bg-gray-50 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.81 15.7 17.59V20.34H19.27C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
            <path d="M12 23C14.97 23 17.46 22.02 19.27 20.34L15.7 17.59C14.72 18.25 13.46 18.66 12 18.66C9.17 18.66 6.77 16.75 5.88 14.18H2.21V17.03C4.01 20.61 7.74 23 12 23Z" fill="#34A853"/>
            <path d="M5.88 14.18C5.65 13.5 5.52 12.77 5.52 12C5.52 11.23 5.65 10.5 5.88 9.82V6.97H2.21C1.47 8.44 1.04 10.16 1.04 12C1.04 13.84 1.47 15.56 2.21 17.03L5.88 14.18Z" fill="#FBBC05"/>
            <path d="M12 5.34C13.62 5.34 15.07 5.9 16.22 6.99L19.35 3.86C17.46 2.11 14.97 1 12 1C7.74 1 4.01 3.39 2.21 6.97L5.88 9.82C6.77 7.25 9.17 5.34 12 5.34Z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </Button>
      </div>
    </div>
  )
}
