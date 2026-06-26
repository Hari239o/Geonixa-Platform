"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

export default function BrandCompanySetupPage() {
  const router = useRouter()
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    website: "",
    phone: "",
    facebook: "",
    instagram: "",
    x: ""
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePic(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    // Save to local storage for temporary persistence
    const profileData = {
      ...formData,
      profilePic,
      type: 'company'
    }
    localStorage.setItem("kaling_company_profile", JSON.stringify(profileData))
    router.push("/brand/company")
  }

  return (
    <div className="h-full bg-[#F8F9FA] font-sans flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white h-full shadow-sm relative pt-12 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 touch-pan-y">
        
        {/* Profile Logo Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            {profilePic ? (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <Image src={profilePic} alt="Profile" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-[#EF4823] flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                LOGO
              </div>
            )}
            <button 
              onClick={() => setProfilePic(null)}
              className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-gray-100 text-[#EF4823] hover:bg-gray-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          <label className="bg-[#EF4823] hover:bg-[#d63d1c] text-white px-5 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors active:scale-95 shadow-sm">
            Change
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden"
            />
          </label>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Company Name</label>
            <input 
              type="text" 
              name="fullName"
              placeholder="Lorem ipsum"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bio</label>
            <textarea 
              name="bio"
              placeholder="Lorem ipsum dolor sit amet..."
              rows={4}
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400 resize-y min-h-[120px]"
            ></textarea>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Website</label>
            <input 
              type="url" 
              name="website"
              placeholder="www.portfolio.com"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone</label>
            <input 
              type="tel" 
              name="phone"
              placeholder="000-000-0000"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Facebook</label>
            <input 
              type="url" 
              name="facebook"
              placeholder="https://"
              value={formData.facebook}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Instagram</label>
            <input 
              type="url" 
              name="instagram"
              placeholder="https://"
              value={formData.instagram}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">X</label>
            <input 
              type="url" 
              name="x"
              placeholder="https://"
              value={formData.x}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-[#EF4823] hover:bg-[#d63d1c] text-white py-4 rounded-2xl font-bold tracking-wider mt-4 shadow-[0_4px_15px_rgba(239,72,35,0.25)] transition-all active:scale-[0.98]"
          >
            SAVE
          </button>
        </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  )
}
