"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Send, SlidersHorizontal, Plus, Link as LinkIcon, Phone, Globe, Edit2, Save, Upload } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

export default function BrandDashboardPage() {
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio'>('about')
  const [profileData, setProfileData] = useState<any>(null)
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({})

  useEffect(() => {
    // Load data from localStorage (this is temporary until backend is connected)
    const saved = localStorage.getItem("kaling_brand_profile")
    if (saved) {
      const parsed = JSON.parse(saved)
      setProfileData(parsed)
      setEditForm(parsed)
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

  const handleSave = () => {
    setProfileData(editForm)
    localStorage.setItem("kaling_brand_profile", JSON.stringify(editForm))
    setIsEditing(false)
  }

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = () => {
        setEditForm({ ...editForm, profilePic: reader.result as string })
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  // Use editForm when editing, otherwise profileData
  const displayData = isEditing ? editForm : profileData

  return (
    <div className="h-full bg-black flex justify-center font-sans overflow-hidden">
      <div className="w-full bg-[#F8F9FA] h-full relative shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Section */}
        <div className="pt-12 px-6 pb-6 bg-white rounded-b-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-10 shrink-0 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4 w-full">
              <div className="w-20 h-20 bg-[#EF4823] rounded-2xl flex items-center justify-center overflow-hidden relative shadow-md group">
                {displayData?.profilePic ? (
                  <Image src={displayData.profilePic} alt="Brand Logo" fill className="object-cover" />
                ) : (
                  <span className="text-white font-black text-xl">LOGO</span>
                )}
                {isEditing && (
                  <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={20} />
                    <span className="text-[10px] mt-1 font-bold">CHANGE</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                  </label>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                {isEditing ? (
                  <input 
                    type="text"
                    value={editForm?.fullName || ""}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    placeholder="Company Name"
                    className="w-full text-2xl font-bold text-gray-900 tracking-tight bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 outline-none focus:border-[#EF4823]"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight truncate">
                    {displayData?.fullName || "Lorem Ipsum"}
                  </h1>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 text-gray-400 mt-2 shrink-0">
              {isEditing ? (
                <button onClick={handleSave} className="w-10 h-10 rounded-full bg-[#FEF5ED] text-[#EF4823] flex items-center justify-center hover:bg-[#ffeada] transition-colors shadow-sm">
                  <Save size={18} strokeWidth={2.5} />
                </button>
              ) : (
                <button onClick={() => { setIsEditing(true); setEditForm(profileData || {}); }} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-[#FEF5ED] hover:text-[#EF4823] transition-colors">
                  <Edit2 size={18} />
                </button>
              )}
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
          
          {activeTab === 'about' && (
            <div className="flex flex-col gap-4">
              
              {/* Bio Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bio</h3>
                {isEditing ? (
                  <textarea 
                    value={editForm?.bio || ""}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Tell us about your brand..."
                    rows={4}
                    className="w-full text-sm text-gray-800 leading-relaxed font-medium bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-[#EF4823] resize-none"
                  />
                ) : (
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    {displayData?.bio || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tortor turpis sodales nulla velit. Nunc cum vitae, rhoncus leo id. Volutpat. Duis tinunt pretium luctus pulvinar pretium."}
                  </p>
                )}
              </div>

              {/* Contact Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#EF4823] shrink-0">
                    <Globe size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-bold mb-1">Website</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editForm?.website || ""}
                        onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                        placeholder="www.portfolio.com"
                        className="w-full text-sm text-gray-800 font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#EF4823]"
                      />
                    ) : (
                      <p className="text-sm text-gray-800 font-medium break-all">{displayData?.website || "www.portfolio.com"}</p>
                    )}
                  </div>
                </div>
                
                <div className="h-px w-full bg-gray-50"></div>

                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#EF4823] shrink-0">
                    <Phone size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-bold mb-1">Phone</p>
                    {isEditing ? (
                      <input 
                        type="tel"
                        value={editForm?.phone || ""}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        placeholder="000-000-0000"
                        className="w-full text-sm text-gray-800 font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#EF4823]"
                      />
                    ) : (
                      <p className="text-sm text-gray-800 font-medium break-all">{displayData?.phone || "000-000-0000"}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">On The Web</h3>
                
                {isEditing ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                      </div>
                      <input type="text" value={editForm?.facebook || ""} onChange={(e) => setEditForm({...editForm, facebook: e.target.value})} placeholder="Facebook URL" className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#EF4823]" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                      </div>
                      <input type="text" value={editForm?.x || ""} onChange={(e) => setEditForm({...editForm, x: e.target.value})} placeholder="Twitter/X URL" className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#EF4823]" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      </div>
                      <input type="text" value={editForm?.instagram || ""} onChange={(e) => setEditForm({...editForm, instagram: e.target.value})} placeholder="Instagram URL" className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#EF4823]" />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <a href={displayData?.facebook || "#"} className="w-10 h-10 rounded-full bg-gray-600 hover:bg-[#EF4823] flex items-center justify-center text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                    <a href={displayData?.x || "#"} className="w-10 h-10 rounded-full bg-gray-600 hover:bg-[#EF4823] flex items-center justify-center text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                    </a>
                    <a href={displayData?.instagram || "#"} className="w-10 h-10 rounded-full bg-gray-600 hover:bg-[#EF4823] flex items-center justify-center text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-gray-600 hover:bg-[#EF4823] flex items-center justify-center text-white transition-colors">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                  </div>
                )}
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
                      <img src={src} alt="Portfolio item" className="w-full h-full object-cover" />
                      {isEditing && (
                        <button 
                          onClick={() => {
                            const newImages = [...portfolioImages]
                            newImages.splice(i, 1)
                            setPortfolioImages(newImages)
                            localStorage.setItem("kaling_brand_portfolio", JSON.stringify(newImages))
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-red-500 shadow-md hover:bg-white transition-colors"
                        >
                          ✕
                        </button>
                      )}
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

        </div>
      </div>
      
      <BottomNav />
    </div>
  )
}
