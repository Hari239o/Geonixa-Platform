"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2, BadgeCheck } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

import { uploadFileToR2 } from "@/utils/upload"

export default function BrandIndividualSetupPage() {
  const router = useRouter()
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    website: "",
    phone: "",
    facebook: "",
    instagram: "",
    x: "",
    linkedin: ""
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
      } catch (err: any) {
        console.error("Upload failed", err)
        alert("Upload failed: " + (err.message || String(err)))
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
      type: 'individual'
    }
    localStorage.setItem("kaling_brand_profile", JSON.stringify(profileData))
    
    try {
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
    
    // Read current verification status from localStorage (it might have been fetched from server)
    const isVerified = JSON.parse(localStorage.getItem("kaling_brand_profile") || "{}").isVerified === true;
    
    if (!isVerified) {
      setShowVerifyModal(true);
    } else {
      router.push("/brand/profile")
    }
  }

  return (
    <div className="h-full bg-[#F8F9FA] font-sans flex justify-center overflow-hidden">
      <div className="w-full w-full bg-white h-full shadow-sm relative pt-5 flex flex-col overflow-hidden">
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
                <div className="w-24 h-24 rounded-2xl bg-[#EF4423] flex items-center justify-center text-white font-bold text-2xl shadow-sm hover:bg-[#d63d1c] transition-colors">
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
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              placeholder="Your Name"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4423] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bio</label>
            <textarea 
              name="bio"
              placeholder="Tell us about yourself..."
              rows={4}
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4423] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400 resize-y min-h-[120px]"
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
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4423] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
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
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4423] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
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
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4423] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
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
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4423] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
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
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4423] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">LinkedIn</label>
            <input 
              type="url" 
              name="linkedin"
              placeholder="https://"
              value={formData.linkedin}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium outline-none transition-all focus:bg-white focus:border-[#EF4423] focus:ring-4 focus:ring-orange-50 placeholder:text-gray-400"
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-[#EF4423] hover:bg-[#d63d1c] text-white py-4 rounded-2xl font-bold tracking-wider mt-4 shadow-[0_4px_15px_rgba(239,72,35,0.25)] transition-all active:scale-[0.98]"
          >
            SAVE
          </button>
        </div>
      </div>
      
      {/* Verify Account Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[320px] rounded-[24px] p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => {
                setShowVerifyModal(false)
                router.push("/brand/profile") // proceed anyway if they close
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center mt-2">
              <BadgeCheck className="w-[42px] h-[42px] text-[#EF4423] fill-[#EF4423] text-white mb-3" />
              <h2 className="text-[20px] font-black text-[#EF4423] text-center mb-1 tracking-tight">VERIFY YOUR ACCOUNT</h2>
              <p className="text-[13px] text-gray-500 font-medium text-center mb-6 leading-tight">
                With Aadhar
              </p>

              <button 
                onClick={() => router.push('/kyc')}
                className="w-full py-3.5 border-2 border-dashed border-[#EF4423]/40 rounded-[14px] flex items-center justify-center gap-3 mb-6 hover:bg-[#EF4423]/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EF4423]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-[#1a1a2e] font-semibold text-[14px]">Camera</span>
              </button>

              <button 
                className="w-full py-3.5 bg-[#EF4423] text-white text-[14px] font-bold rounded-[14px] hover:bg-[#d63f1c] transition-colors shadow-[0_4px_14px_rgba(239,72,35,0.3)]"
                onClick={() => router.push('/kyc')}
              >
                VERIFY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      
      <BottomNav />
    </div>
  )
}
