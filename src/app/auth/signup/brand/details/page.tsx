"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function BrandSignupStep3Details() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    teamSize: "",
    location: "",
    category: "",
  });

  // Load saved data from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("brandSignupData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
  }, []);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...data };
      sessionStorage.setItem("brandSignupData", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/auth/signup/brand/account");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-5 sm:p-6 flex flex-col h-full justify-between">
      
      <div className="flex flex-col gap-4">
        
        {/* Team Size Input */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-[#A0A0A0] font-medium ml-1">Size of Team</Label>
          <Input 
            required
            type="number"
            placeholder="5" 
            value={formData.teamSize}
            onChange={(e) => updateFormData({ teamSize: e.target.value })}
            className="bg-[#F8F8F8] border-transparent rounded-[14px] h-[52px] px-4 text-[14px] text-[#333333] font-medium placeholder:text-[#333333] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#FF4D2D] focus-visible:border-[#FF4D2D] shadow-sm"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-[#A0A0A0] font-medium ml-1">Location</Label>
          <Input 
            required
            placeholder="Enter the address" 
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            className="bg-[#F8F8F8] border-transparent rounded-[14px] h-[52px] px-4 text-[14px] text-[#333333] font-medium placeholder:text-[#A0A0A0] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#FF4D2D] focus-visible:border-[#FF4D2D] shadow-sm"
          />
        </div>

        {/* Categories Dropdown */}
        <div className="flex flex-col gap-1.5 relative">
          <Label className="text-[11px] text-[#A0A0A0] font-medium ml-1">Categories</Label>
          <div className="relative">
            <select
              required
              value={formData.category}
              onChange={(e) => updateFormData({ category: e.target.value })}
              className="w-full bg-[#F8F8F8] border border-transparent rounded-[14px] h-[52px] px-4 text-[14px] text-[#333333] font-medium appearance-none focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF4D2D] focus:border-[#FF4D2D] shadow-sm cursor-pointer"
            >
              <option value="" disabled hidden>Drop Down</option>
              <option value="ecommerce">E-commerce</option>
              <option value="agency">Agency</option>
              <option value="saas">SaaS / Tech</option>
              <option value="retail">Retail</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0] pointer-events-none" />
          </div>
        </div>

      </div>

      <div className="mt-2 flex flex-col">
        <Button 
          type="submit" 
          className="w-full bg-[#FF4D2D] hover:bg-[#FF4D2D]/90 text-white rounded-[14px] h-[52px] text-[15px] font-semibold shadow-[0_4px_14px_0_rgba(255,77,45,0.39)] transition-all active:scale-[0.98]"
        >
          Next
        </Button>
      </div>
    </form>
  );
}
