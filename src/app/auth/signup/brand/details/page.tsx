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
import { ArrowLeft } from "lucide-react"

const businessSchema = z.object({
  teamSize: z.string().min(1, { message: "Team size is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  businessCategory: z.string().min(1, { message: "Category is required" }),
})

type BusinessFormValues = z.infer<typeof businessSchema>

export default function BrandSignupStep2() {
  const router = useRouter()
  const { data, updateData } = useSignup()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      teamSize: data.teamSize || "",
      location: data.location || "",
      businessCategory: data.businessCategory || "",
    },
  })

  const onSubmit = (formData: BusinessFormValues) => {
    updateData({
      teamSize: formData.teamSize,
      location: formData.location,
      businessCategory: formData.businessCategory,
    })
    
    // In a real app, you would submit to backend here.
    // For now, we'll push to a dashboard or success screen
    router.push("/dashboard")
  }

  const handlePrevious = () => {
    // Save current state before going back
    updateData({
      teamSize: "1-10", // Just to ensure it's not totally empty, or pull from watch() if we wanted perfectly strict back-saving
    })
    router.back()
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Orange-Red Header */}
      <h1 className="text-3xl font-bold text-white mb-2 text-center drop-shadow-sm">
        Business Details
      </h1>
      <p className="text-white/90 text-sm font-medium mb-8 text-center px-4">
        Tell us more about your company
      </p>

      {/* White Card */}
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          <div className="space-y-1.5">
            <Label htmlFor="teamSize" className="text-xs font-semibold text-text-light ml-1">Size of Team</Label>
            <Input 
              id="teamSize" 
              placeholder="e.g. 5 or 1-10" 
              {...register("teamSize")} 
              className={errors.teamSize ? "border-red-500" : ""}
            />
            {errors.teamSize && <p className="text-xs text-red-500 ml-1">{errors.teamSize.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-semibold text-text-light ml-1">Location</Label>
            <Input 
              id="location" 
              placeholder="Enter the address or city" 
              {...register("location")} 
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && <p className="text-xs text-red-500 ml-1">{errors.location.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessCategory" className="text-xs font-semibold text-text-light ml-1">Categories</Label>
            <Select onValueChange={(val) => setValue("businessCategory", val)} defaultValue={data.businessCategory}>
              <SelectTrigger className={errors.businessCategory ? "border-red-500 bg-[#F9FAFB] h-12" : "bg-[#F9FAFB] h-12"}>
                <SelectValue placeholder="Select a Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                <SelectItem value="tech">Technology & Electronics</SelectItem>
                <SelectItem value="food">Food & Beverage</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.businessCategory && <p className="text-xs text-red-500 ml-1">{errors.businessCategory.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handlePrevious}
              className="w-1/3 h-12 border-gray-200 text-text-dark font-bold rounded-xl"
            >
              Previous
            </Button>
            <Button 
              type="submit" 
              className="w-2/3 h-12 bg-primary-red hover:bg-primary-red/90 text-white font-bold rounded-xl"
            >
              Finish
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
