"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { Send, SlidersHorizontal, Plus, Link as LinkIcon, Phone, Globe, Trash2, LogOut, Star, BadgeCheck, Settings } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"
import { uploadFileToR2 } from "@/utils/upload"

export default function BrandDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio'>('about')
  const [profileData, setProfileData] = useState<any>(null)
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      // First try local storage for instant load
      const saved = localStorage.getItem("kaling_brand_profile")
      if (saved) {
        setProfileData(JSON.parse(saved))
        setIsLoading(false)
      }

      try {
        const res = await fetch('/api/user/complete-profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfileData(data.profile);
            localStorage.setItem("kaling_brand_profile", JSON.stringify(data.profile));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProfile();

    // Listen for custom event from BottomNav to show verification modal
    const handleShowVerify = () => setShowVerifyModal(true)
    window.addEventListener("showVerifyModal", handleShowVerify)
    
    const savedImages = localStorage.getItem("kaling_brand_portfolio")
    if (savedImages) {
      setPortfolioImages(JSON.parse(savedImages))
    }

    return () => window.removeEventListener("showVerifyModal", handleShowVerify)
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

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    
    try {
      const uploadPromises = files.map(file => uploadFileToR2(file, 'public'))
      const urls = await Promise.all(uploadPromises)
      
      const updatedImages = [...portfolioImages, ...urls]
      setPortfolioImages(updatedImages)
      localStorage.setItem("kaling_brand_portfolio", JSON.stringify(updatedImages))
    } catch (err: any) {
      console.error("Portfolio upload failed", err)
      alert("Upload failed: " + (err.message || String(err)))
    }
  }

  const handleDeletePortfolioImage = (index: number) => {
    const updatedImages = portfolioImages.filter((_, i) => i !== index)
    setPortfolioImages(updatedImages)
    localStorage.setItem("kaling_brand_portfolio", JSON.stringify(updatedImages))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    
    try {
      const url = await uploadFileToR2(file, 'public');
      const updatedProfile = { ...profileData, profilePic: url };
      setProfileData(updatedProfile);
      
      // Save locally
      localStorage.setItem("kaling_brand_profile", JSON.stringify(updatedProfile));
      
      // Save to server
      const serverPayload: any = { ...updatedProfile };
      await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem('userId') || 'temp-user-id',
          ...serverPayload
        })
      });
    } catch (err: any) {
      console.error("Logo upload failed", err);
      alert("Upload failed: " + (err.message || String(err)));
    }
  }

  if (isLoading) {
    return (
      <div className="h-full bg-[#F8F9FA] flex justify-center items-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EF4823]"></div>
      </div>
    )
  }

  return (
    <div className="h-full bg-black flex justify-center font-sans overflow-hidden">
      <div className="w-full w-full bg-[#F8F9FA] h-full relative shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Section */}
        <div className="pt-5 px-6 pb-6 bg-white rounded-b-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-10 shrink-0 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <label className="w-24 h-24 bg-[#EF4823] rounded-2xl flex items-center justify-center overflow-hidden relative shadow-md cursor-pointer group">
                {profileData?.profilePic ? (
                  <img src={profileData.profilePic} alt="Brand Logo" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                ) : (
                  <span className="text-white font-black text-2xl group-hover:opacity-80 transition-opacity">LOGO</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {profileData?.fullName || "Lorem Ipsum"}
                  </h1>
                  {profileData?.isVerified && (
                    <div className="flex items-center mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4823" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 text-gray-400 mt-2 items-center">
              <button onClick={handleShare} className="hover:text-[#EF4823] transition-colors" title="Share Profile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 3L3 10.5l7.5 3 3 7.5L21 3z" />
                  <path d="M10.5 13.5l4.5-4.5" />
                </svg>
              </button>
              <button 
                onClick={() => {
                  if (profileData?.brandType === 'individual') {
                    router.push("/brand/setup-individual")
                  } else {
                    router.push("/brand/setup-company")
                  }
                }} 
                className="hover:text-[#EF4823] transition-colors" 
                title="Settings"
              >
                <SlidersHorizontal size={20} strokeWidth={2.5} />
              </button>
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
              onClick={() => {
                if (!profileData?.isVerified) {
                  setShowVerifyModal(true);
                  return;
                }
                setActiveTab('portfolio')
              }}
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
          
          {activeTab === 'about' && (
            <div className="flex flex-col gap-4">

              {/* Authentication Prompt */}
              <div className="px-1">
                {!profileData?.isVerified && (
                  <button
                    onClick={() => router.push('/kyc')}
                    className="w-full font-bold py-3.5 rounded-[16px] transition-all flex items-center justify-center gap-2 bg-[#EF4823] hover:bg-[#d63d1c] text-white active:scale-[0.98] shadow-[0_4px_15px_rgba(239,72,35,0.25)]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    Authenticate Account
                  </button>
                )}
              </div>
              
              {/* Profile Details Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bio</h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    {profileData?.bio || "No bio added yet."}
                  </p>
                </div>
                
                <div className="h-px w-full bg-gray-50"></div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-8">
                    <p className="text-xs text-gray-400 font-bold w-16">Website</p>
                    <p className="text-sm text-gray-800 font-medium">{profileData?.website || "Not provided"}</p>
                  </div>
                  
                  <div className="flex items-start gap-8">
                    <p className="text-xs text-gray-400 font-bold w-16">Phone</p>
                    <p className="text-sm text-gray-800 font-medium">{profileData?.phone || "Not provided"}</p>
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
                  {profileData?.facebook ? (
                    <a href={profileData.facebook.startsWith('http') ? profileData.facebook : `https://${profileData.facebook}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-80" style={{ backgroundColor: '#1877F2' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-white"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></div>
                  )}

                  {profileData?.x ? (
                    <a href={profileData.x.startsWith('http') ? profileData.x : `https://${profileData.x}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-80" style={{ backgroundColor: '#000000' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-white"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></div>
                  )}

                  {profileData?.instagram ? (
                    <a href={profileData.instagram.startsWith('http') ? profileData.instagram : `https://${profileData.instagram}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-80" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-white"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></div>
                  )}

                  {profileData?.linkedin ? (
                    <a href={profileData.linkedin.startsWith('http') ? profileData.linkedin : `https://${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-80" style={{ backgroundColor: '#0A66C2' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-white"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="flex flex-col">

              
              {portfolioImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 w-full">
                  <p className="text-sm font-medium">No images added yet.</p>
                  <p className="text-xs mt-1">Tap the + button to upload some!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-[15px] w-full max-w-[323px] mx-auto mb-6">
                  {portfolioImages.map((src, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden shadow-sm relative group aspect-[154/178]">
                      {(src.startsWith('data:video/') || src.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
                        <video src={src} className="w-full h-full object-cover" controls playsInline />
                      ) : (
                        <img src={src} alt={`Portfolio ${i}`} className="w-full h-full object-cover" />
                      )}
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



          {/* Actions at bottom */}
          <div className="flex flex-col gap-3 mt-8">
            
            <button
              onClick={async () => {
                localStorage.removeItem("kaling_brand_profile");
                localStorage.removeItem("kalinq_mock_user_id");
                await signOut({ redirect: false });
              window.location.href = "/";
              }}
              className="w-full text-red-500 font-bold py-4 flex items-center justify-center gap-2 hover:bg-red-50 rounded-[20px] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
          </div>

        </div>
      </div>
      
      <BottomNav />

      {/* Verify Account Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[320px] rounded-[24px] p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center mt-2">
              <BadgeCheck className="w-[42px] h-[42px] text-[#EF4823] fill-[#EF4823] text-white mb-3" />
              <h2 className="text-[20px] font-black text-[#EF4823] text-center mb-1 tracking-tight">VERIFY YOUR ACCOUNT</h2>
              <p className="text-[13px] text-gray-500 font-medium text-center mb-6 leading-tight">
                With Aadhar
              </p>

              <button 
                onClick={() => router.push('/kyc')}
                className="w-full py-3.5 border-2 border-dashed border-[#EF4823]/40 rounded-[14px] flex items-center justify-center gap-3 mb-6 hover:bg-[#EF4823]/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EF4823]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-[#1a1a2e] font-semibold text-[14px]">Camera</span>
              </button>

              <button 
                className="w-full py-3.5 bg-[#EF4823] text-white text-[14px] font-bold rounded-[14px] hover:bg-[#d63f1c] transition-colors shadow-[0_4px_14px_rgba(239,72,35,0.3)]"
                onClick={() => router.push('/kyc')}
              >
                VERIFY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
