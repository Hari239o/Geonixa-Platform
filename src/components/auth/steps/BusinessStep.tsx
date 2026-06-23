"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SignupData } from "../SignupContext"

const businessSchema = z.object({
  teamSize: z.string().min(1, { message: "Team size is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  businessCategory: z.string().min(1, { message: "Category is required" }),
})

type BusinessFormValues = z.infer<typeof businessSchema>

interface BusinessStepProps {
  initialData: SignupData
  onNext: (data: Partial<SignupData>) => void
}

export function BusinessStep({ initialData, onNext }: BusinessStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      teamSize: initialData.teamSize || "",
      location: initialData.location || "",
      businessCategory: initialData.businessCategory || "",
    },
  })

  const onSubmit = (data: BusinessFormValues) => {
    onNext(data)
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 sm:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        <div className="space-y-1.5">
          <Label htmlFor="teamSize" className="text-xs text-text-light ml-1">Size of Team</Label>
          <Input 
            id="teamSize" 
            placeholder="5" 
            {...register("teamSize")} 
            className={errors.teamSize ? "border-red-500" : ""}
          />
          {errors.teamSize && <p className="text-xs text-red-500 ml-1">{errors.teamSize.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-xs text-text-light ml-1">Location</Label>
          <Input 
            id="location" 
            placeholder="Enter the address" 
            {...register("location")} 
            className={errors.location ? "border-red-500" : ""}
          />
          {errors.location && <p className="text-xs text-red-500 ml-1">{errors.location.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="businessCategory" className="text-xs text-text-light ml-1">Categories</Label>
          <Select onValueChange={(val) => setValue("businessCategory", val)} defaultValue={initialData.businessCategory}>
            <SelectTrigger className={errors.businessCategory ? "border-red-500 bg-[#F9FAFB]" : "bg-[#F9FAFB]"}>
              <SelectValue placeholder="Drop Down" />
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

        <Button type="submit" className="w-full mt-4">
          Next
        </Button>
      </form>
    </div>
  )
}
