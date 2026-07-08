"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Send, SlidersHorizontal, Plus, Link as LinkIcon, Phone, Globe, BadgeCheck, Settings, CheckCircle2 } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"
import { signOut } from "next-auth/react"
import { uploadFileToR2 } from "@/utils/upload"
import { useRouter } from "next/navigation"

export default function BrandCompanyDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio'>('about')
  const [profileData, setProfileData] = useState<any>(null)
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if we just completed verification
    if (typeof window !== 'undefined' && window.location.search.includes('verified=true')) {
      setShowSuccessPopup(true)
      // Clean up URL to avoid showing it on refresh
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    async function fetchProfile() {
      // First try local storage for instant load
      const saved = localStorage.getItem("kaling_company_profile")
      if (saved) {
        setProfileData(JSON.parse(saved))
        setIsLoading(false)
      }

      try {
        const res = await fetch('/api/user/complete-profile')
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            setProfileData(data.profile)
            localStorage.setItem("kaling_company_profile", JSON.stringify(data.profile))
            localStorage.setItem("kaling_brand_profile", JSON.stringify(data.profile))
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()

    // Listen for custom event from BottomNav to show verification modal
    const handleShowVerify = () => setShowVerifyModal(true)
    window.addEventListener("showVerifyModal", handleShowVerify)
    
    const savedImages = localStorage.getItem("kaling_company_portfolio")
    if (savedImages) {
      setPortfolioImages(JSON.parse(savedImages))
    }
    
    return () => window.removeEventListener("showVerifyModal", handleShowVerify)
  }, [])

  const handleDeletePortfolioImage = (index: number) => {
    const updatedImages = portfolioImages.filter((_, i) => i !== index)
    setPortfolioImages(updatedImages)
    localStorage.setItem("kaling_company_portfolio", JSON.stringify(updatedImages))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    
    try {
      const url = await uploadFileToR2(file, 'public');
      const updatedProfile = { ...profileData, profilePic: url };
      setProfileData(updatedProfile);
      
      localStorage.setItem("kaling_company_profile", JSON.stringify(updatedProfile));
      localStorage.setItem("kaling_brand_profile", JSON.stringify(updatedProfile));
      
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

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    
    try {
      const uploadPromises = files.map(file => uploadFileToR2(file, 'public'))
      const urls = await Promise.all(uploadPromises)
      
      const updatedImages = [...portfolioImages, ...urls]
      setPortfolioImages(updatedImages)
      localStorage.setItem("kaling_company_portfolio", JSON.stringify(updatedImages))
    } catch (err: any) {
      console.error("Portfolio upload failed", err)
      alert("Upload failed: " + (err.message || String(err)))
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
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {profileData?.fullName || ""}
                </h1>
                {profileData?.isVerified && (
                  <BadgeCheck className="text-[#EF4823] w-6 h-6 fill-[#EF4823] text-white" />
                )}
              </div>
            </div>
            
            <div className="flex gap-3 text-gray-400 mt-2">
              <button className="hover:text-[#EF4823] transition-colors" title="Share Profile"><Send size={18} /></button>
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
                    onClick={() => setShowVerifyModal(true)}
                    className="w-full font-bold py-3.5 rounded-[16px] transition-all flex items-center justify-center gap-2 bg-[#EF4823] hover:bg-[#d63d1c] text-white active:scale-[0.98] shadow-[0_4px_15px_rgba(239,72,35,0.25)]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    Authenticate Account
                  </button>
                )}
              </div>
              
              {/* Bio Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bio</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  {profileData?.bio || "No bio added yet."}
                </p>
              </div>

              {/* Contact Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#EF4823] shrink-0">
                    <Globe size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-bold mb-0.5">Website</p>
                    <p className="text-sm text-gray-800 font-medium break-all">{profileData?.website || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="h-px w-full bg-gray-50"></div>

                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#EF4823] shrink-0">
                    <Phone size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-bold mb-0.5">Phone</p>
                    <p className="text-sm text-gray-800 font-medium break-all">{profileData?.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Registration Block */}
              {(profileData?.registrationNumber || profileData?.panNumber || profileData?.gstNumber || profileData?.authorizedPerson) && (
                <div className="bg-white rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Registration Details</h3>
                  
                  {profileData?.authorizedPerson && (
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400 font-bold">Authorized Person</p>
                      <p className="text-sm text-gray-800 font-medium">{profileData.authorizedPerson}</p>
                    </div>
                  )}

                  {profileData?.registrationNumber && (
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400 font-bold">Registration Number</p>
                      <p className="text-sm text-gray-800 font-medium">{profileData.registrationNumber}</p>
                    </div>
                  )}

                  {profileData?.panNumber && (
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400 font-bold">Company PAN</p>
                      <p className="text-sm text-gray-800 font-medium uppercase">{profileData.panNumber}</p>
                    </div>
                  )}

                  {profileData?.gstNumber && (
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400 font-bold">GST Number</p>
                      <p className="text-sm text-gray-800 font-medium uppercase">{profileData.gstNumber}</p>
                    </div>
                  )}
                </div>
              )}

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
                        onClick={(e) => {
                          e.preventDefault();
                          const updatedImages = portfolioImages.filter((_, index) => index !== i);
                          setPortfolioImages(updatedImages);
                          localStorage.setItem("kaling_company_portfolio", JSON.stringify(updatedImages));
                        }}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm z-10"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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
                localStorage.removeItem("kaling_company_profile");
                localStorage.removeItem("kaling_brand_profile");
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
              <div className="w-[42px] h-[42px] mb-3">
                <svg viewBox="0 0 24 24" fill="#EF4823" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
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

      {/* Success Verification Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-sm flex flex-col items-center text-center max-w-sm w-full animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-sm">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-[26px] font-black text-[#1a1a2e] mb-2 tracking-tight">Verified!</h2>
            <p className="text-[14px] text-gray-500 font-medium mb-10">Your company has been successfully verified. You now have the official tick mark.</p>
            <button 
              onClick={() => setShowSuccessPopup(false)}
              className="w-full bg-[#EF4823] hover:bg-[#d63f1c] text-white font-bold py-4 rounded-[16px] transition-all shadow-[0_4px_15px_rgba(239,72,35,0.25)]"
            >
              CONTINUE TO DASHBOARD
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
