"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { Send, SlidersHorizontal, Plus, Link as LinkIcon, Phone, Globe, Trash2, LogOut, Star } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

export default function BrandDashboardPage() {
  const router = useRouter()
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profileData?.fullName || "Brand Profile",
          text: "Check out my brand profile!",
          url: window.location.href,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Sharing is not supported on this device.");
    }
  }

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

  const handleDeletePortfolioImage = (index: number) => {
    const updatedImages = portfolioImages.filter((_, i) => i !== index)
    setPortfolioImages(updatedImages)
    localStorage.setItem("kaling_brand_portfolio", JSON.stringify(updatedImages))
  }

  return (
    <div className="h-full bg-black flex justify-center font-sans overflow-hidden">
      <div className="w-full w-full bg-[#F8F9FA] h-full relative shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Section */}
        <div className="pt-5 px-6 pb-6 bg-white rounded-b-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-10 shrink-0 relative">
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
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {profileData?.fullName || "Lorem Ipsum"}
                  </h1>
                  {profileData?.isVerified && (
                    <div className="flex items-center gap-1 mt-1 bg-red-50 px-2 py-0.5 rounded-full">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4823" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span className="text-[#EF4823] text-[10px] font-bold uppercase tracking-wider">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 text-gray-400 mt-2 items-center">
              <button onClick={handleShare} className="hover:text-[#EF4823] transition-colors" title="Share Profile"><Send size={18} /></button>
              <button onClick={() => router.push("/brand/setup-company")} className="hover:text-[#EF4823] transition-colors" title="Edit Profile"><SlidersHorizontal size={18} /></button>
              <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="hover:text-red-500 transition-colors" title="Log Out"><LogOut size={18} /></button>
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
        <div className="px-6 py-6 flex-1 overflow-y-auto no-scrollbar pb-24 touch-pan-y">
          
          {/* Authentication Prompt */}
          {!profileData?.isVerified && (
            <button
              onClick={() => router.push("/mock-instagram-login")}
              className="w-full bg-[#EF4823] hover:bg-[#d63d1c] text-white font-bold py-4 rounded-[20px] shadow-[0_4px_15px_rgba(239,72,35,0.25)] transition-all active:scale-[0.98] mb-6 flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              Authenticate Account
            </button>
          )}

          {activeTab === 'about' && (
            <div className="flex flex-col gap-4">
              
              {/* Profile Details Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bio</h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    {profileData?.bio || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tortor turpis sodales nulla velit. Nunc cum vitae, rhoncus leo id. Volutpat. Duis tinunt pretium luctus pulvinar pretium."}
                  </p>
                </div>
                
                <div className="h-px w-full bg-gray-50"></div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-8">
                    <p className="text-xs text-gray-400 font-bold w-16">Website</p>
                    <p className="text-sm text-gray-800 font-medium">{profileData?.website || "www.portfolio.com"}</p>
                  </div>
                  
                  <div className="flex items-start gap-8">
                    <p className="text-xs text-gray-400 font-bold w-16">Phone</p>
                    <p className="text-sm text-gray-800 font-medium">{profileData?.phone || "000-000-0000"}</p>
                  </div>
                </div>
              </div>

              {/* Stats Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm flex items-center justify-between px-8">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">17</span>
                  <span className="text-xs text-gray-400 font-bold leading-tight">Projects<br/>Done</span>
                </div>
                <div className="w-px h-8 bg-gray-100"></div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">92%</span>
                  <span className="text-xs text-gray-400 font-bold leading-tight">Success<br/>Rate</span>
                </div>
              </div>

              {/* Rating Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Rating</h3>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map(star => (
                    <Star key={star} size={22} className="fill-[#FBBF24] text-[#FBBF24]" />
                  ))}
                  <Star size={22} className="fill-gray-200 text-gray-200" />
                </div>
              </div>

              {/* Social Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">On The Web</h3>
                <div className="flex gap-3">
                  <a href={profileData?.facebook || "#"} className="w-10 h-10 rounded-full bg-gray-600 hover:bg-[#EF4823] flex items-center justify-center text-white transition-colors">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                  <a href={profileData?.x || "#"} className="w-10 h-10 rounded-full bg-gray-600 hover:bg-[#EF4823] flex items-center justify-center text-white transition-colors">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                  </a>
                  <a href={profileData?.instagram || "#"} className="w-10 h-10 rounded-full bg-gray-600 hover:bg-[#EF4823] flex items-center justify-center text-white transition-colors">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-600 hover:bg-[#EF4823] flex items-center justify-center text-white transition-colors">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="flex flex-col items-center">
              
              {portfolioImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 w-full">
                  <p className="text-sm font-medium">No images added yet.</p>
                  <p className="text-xs mt-1">Tap the + button to upload some!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-[15px] w-full max-w-[323px] mx-auto mb-6">
                  {portfolioImages.map((src, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden shadow-sm relative group aspect-[154/178]">
                      {/* Using standard img for data URLs to avoid next/image domain strictness */}
                      <img src={src} alt="Portfolio item" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => handleDeletePortfolioImage(i)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md text-[#EF4823]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Button Below Grid */}
              <label className="w-12 h-12 bg-[#EF4823] hover:bg-[#d63d1c] rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer active:scale-95 transition-transform shrink-0 mb-6">
                <Plus size={24} strokeWidth={2} />
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



          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem("kaling_brand_profile");
              localStorage.removeItem("kalinq_mock_user_id");
              router.push("/");
            }}
            className="w-full text-red-500 font-bold py-4 mt-8 flex items-center justify-center gap-2 hover:bg-red-50 rounded-[20px] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>

        </div>
      </div>
      
      <BottomNav />
    </div>
  )
}
