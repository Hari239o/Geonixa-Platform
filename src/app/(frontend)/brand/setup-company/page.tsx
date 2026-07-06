"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2, ChevronLeft } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

import { uploadFileToR2 } from "@/utils/upload"

export default function BrandCompanySetupPage() {
  const router = useRouter()
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    teamMembers: "",
    bio: "",
    website: "",
    phone: "",
    facebook: "",
    instagram: "",
    x: ""
  })

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/complete-profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setFormData(prev => ({
              ...prev,
              fullName: data.profile.fullName || "",
              teamMembers: data.profile.teamMembers || "",
              bio: data.profile.bio || "",
              website: data.profile.website || "",
              phone: data.profile.phone || "",
              facebook: data.profile.facebook || "",
              instagram: data.profile.instagram || "",
              x: data.profile.x || ""
            }));
            if (data.profile.profilePic) {
              setProfilePic(data.profile.profilePic);
            }
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
      
      const saved = localStorage.getItem("kaling_brand_profile")
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({...prev, ...parsed}));
          if (parsed.profilePic) setProfilePic(parsed.profilePic);
        } catch(e) {}
      }
    }
    fetchProfile();
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const url = await uploadFileToR2(file, 'public')
        setProfilePic(url)
      } catch (err) {
        console.error("Upload failed", err)
        alert("Failed to upload image.")
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    // Save to local storage for temporary persistence
    const profileData = {
      ...formData,
      profilePic,
      type: 'company'
    }
    localStorage.setItem("kaling_brand_profile", JSON.stringify(profileData))
    localStorage.setItem("kaling_company_profile", JSON.stringify(profileData))
    
    try {
      // Send to server to mark profile completed
      const serverPayload: any = { ...profileData };
      if (serverPayload.profilePic && serverPayload.profilePic.startsWith('data:image/')) {
        delete serverPayload.profilePic;
      }
      
      await fetch("/api/user/complete-profile", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(serverPayload)
      });
    } catch (e) {
      console.error(e);
    }
    
    router.push("/brand/company")
  }

  return (
    <div className="h-full bg-[#F8F9FA] font-sans flex justify-center overflow-hidden">
      <div className="w-full w-full bg-white h-full shadow-sm relative pt-6 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 mb-8 shrink-0">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-[#EF4823] hover:bg-orange-100 transition-colors"
          >
            <ChevronLeft size={20} strokeWidth={3} />
          </button>
          <h1 className="text-xl font-black text-[#1E1B4B] tracking-tight">Settings</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 touch-pan-y">
        
        {/* Profile Logo Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <label className="cursor-pointer block relative">
              {profilePic ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-[#EF4823] flex items-center justify-center text-white font-bold text-2xl shadow-sm hover:bg-[#d63d1c] transition-colors">
                  LOGO
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden"
              />
            </label>
            
          </div>
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
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Team Members</label>
            <input 
              type="text" 
              name="teamMembers"
              placeholder="e.g. 10-50"
              value={formData.teamMembers}
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
