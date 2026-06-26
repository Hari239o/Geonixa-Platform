"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Send, SlidersHorizontal, Plus, Link as LinkIcon, Phone, Globe, Linkedin, Twitter, Facebook, Instagram } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

export default function BrandDashboardPage() {
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio'>('about')
  const [profileData, setProfileData] = useState<any>(null)
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])

  useEffect(() => {
    // Load data from localStorage (this is temporary until backend is connected)
    const saved = localStorage.getItem("kaling_brand_profile")
    if (saved) {
      setProfileData(JSON.parse(saved))
    }
    
    const savedImages = localStorage.getItem("kaling_brand_portfolio")
    if (savedImages) {
      setPortfolioImages(JSON.parse(savedImages))
    }
  }, [])

  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    
    const newImages: string[] = []
    
    // We use a counter to know when all files are read to save them together
    let processed = 0
    
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(reader.result as string)
        processed++
        
        if (processed === files.length) {
          const updatedImages = [...portfolioImages, ...newImages]
          setPortfolioImages(updatedImages)
          localStorage.setItem("kaling_brand_portfolio", JSON.stringify(updatedImages))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="min-h-screen bg-black flex justify-center font-sans">
      <div className="w-full max-w-md bg-[#F8F9FA] min-h-screen relative pb-24 shadow-2xl">
        
        {/* Header Section */}
        <div className="pt-12 px-6 pb-6 bg-white rounded-b-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-10 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-[#EF4823] rounded-2xl flex items-center justify-center overflow-hidden relative shadow-md">
                {profileData?.profilePic ? (
                  <Image src={profileData.profilePic} alt="Brand Logo" fill className="object-cover" />
                ) : (
                  <span className="text-white font-black text-xl">LOGO</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {profileData?.fullName || "Lorem Ipsum"}
                </h1>
              </div>
            </div>
            
            <div className="flex gap-3 text-gray-400 mt-2">
              <button className="hover:text-[#EF4823] transition-colors"><Send size={18} /></button>
              <button className="hover:text-[#EF4823] transition-colors"><SlidersHorizontal size={18} /></button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mt-8 bg-gray-50/80 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'about' 
                ? 'bg-[#EF4823] text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              About
            </button>
            <button 
              onClick={() => setActiveTab('portfolio')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'portfolio' 
                ? 'bg-[#EF4823] text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Portfolio
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6">
          
          {activeTab === 'about' && (
            <div className="flex flex-col gap-4">
              
              {/* Bio Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bio</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  {profileData?.bio || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tortor turpis sodales nulla velit. Nunc cum vitae, rhoncus leo id. Volutpat. Duis tinunt pretium luctus pulvinar pretium."}
                </p>
              </div>

              {/* Contact Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#EF4823]">
                    <Globe size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold mb-0.5">Website</p>
                    <p className="text-sm text-gray-800 font-medium">{profileData?.website || "www.portfolio.com"}</p>
                  </div>
                </div>
                
                <div className="h-px w-full bg-gray-50"></div>

                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#EF4823]">
                    <Phone size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold mb-0.5">Phone</p>
                    <p className="text-sm text-gray-800 font-medium">{profileData?.phone || "000-000-0000"}</p>
                  </div>
                </div>
              </div>

              {/* Social Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">On The Web</h3>
                <div className="flex gap-3">
                  <a href={profileData?.facebook || "#"} className="w-10 h-10 rounded-full bg-gray-600 hover:bg-[#EF4823] flex items-center justify-center text-white transition-colors">
                    <Facebook size={16} fill="currentColor" strokeWidth={0} />
                  </a>
                  <a href={profileData?.x || "#"} className="w-10 h-10 rounded-full bg-gray-600 hover:bg-[#EF4823] flex items-center justify-center text-white transition-colors">
                    <Twitter size={16} fill="currentColor" strokeWidth={0} />
                  </a>
                  <a href={profileData?.instagram || "#"} className="w-10 h-10 rounded-full bg-gray-600 hover:bg-[#EF4823] flex items-center justify-center text-white transition-colors">
                    <Instagram size={16} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-600 hover:bg-[#EF4823] flex items-center justify-center text-white transition-colors">
                    <Linkedin size={16} fill="currentColor" strokeWidth={0} />
                  </a>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="relative min-h-[400px]">
              
              {portfolioImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <p className="text-sm font-medium">No images added yet.</p>
                  <p className="text-xs mt-1">Tap the + button to upload some!</p>
                </div>
              ) : (
                <div className="columns-2 gap-4 space-y-4 pb-20">
                  {portfolioImages.map((src, i) => (
                    <div key={i} className="break-inside-avoid rounded-3xl overflow-hidden shadow-sm relative group">
                      {/* Using standard img for data URLs to avoid next/image domain strictness */}
                      <img src={src} alt="Portfolio item" className="w-full h-auto object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Floating Action Button for Portfolio Upload */}
              <label className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#EF4823] hover:bg-[#d63d1c] rounded-full shadow-xl flex items-center justify-center text-white cursor-pointer active:scale-95 transition-transform z-20">
                <Plus size={24} strokeWidth={3} />
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handlePortfolioUpload} 
                  className="hidden"
                />
              </label>

            </div>
          )}

        </div>
      </div>
      
      <BottomNav />
    </div>
  )
}
