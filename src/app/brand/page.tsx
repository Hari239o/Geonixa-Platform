"use client"

import React, { useState, useEffect } from "react"
import { Search, Bell, Send, Bookmark } from "lucide-react"
import { useRouter } from "next/navigation"
import BottomNav from "@/components/brand/BottomNav"
import { Logo } from "@/components/ui/Logo"

// SVG for Verified Badge matching Image 2
const VerifiedBadge = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4823" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const tabs = ["All", "UGC", "Influencer", "Partners"]

export default function BrandHomeFeedPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("All")
  
  const [creators, setCreators] = useState([
    {
      id: 1,
      name: "Lorem Ipsum",
      image: null,
      tags: ["Fashion", "UGC"],
      followers: "44.5k",
      viewership: "22.8k",
      engagement: "38.9k",
      verified: true
    },
    {
      id: 2,
      name: "Lorem Ipsum",
      image: null,
      tags: ["Fashion", "Influencer"],
      followers: "44.5k",
      viewership: "22.8k",
      engagement: "38.9k",
      verified: true
    },
    {
      id: 3,
      name: "Lorem Ipsum",
      image: null,
      tags: ["Fashion", "Influencer"],
      followers: "44.5k",
      viewership: "22.8k",
      engagement: "38.9k",
      verified: true
    }
  ])

  useEffect(() => {
    // Check if a creator profile was just created to show it dynamically!
    const savedCreator = localStorage.getItem("kaling_creator_profile")
    if (savedCreator) {
      try {
        const parsed = JSON.parse(savedCreator)
        setCreators(prev => {
          // Prevent duplicates if already added (simple check by name for now)
          if (prev.some(c => c.name === parsed.fullName)) return prev;
          
          return [{
            id: Date.now(),
            name: parsed.fullName || "New Creator",
            image: parsed.profilePic || null,
            tags: ["New", "Creator"],
            followers: "0",
            viewership: "0",
            engagement: "0",
            verified: false
          }, ...prev]
        })
      } catch (e) {}
    }
  }, [])

  return (
    <div className="h-full bg-[#F8F9FA] font-sans flex justify-center overflow-hidden">
      <div className="w-full w-full bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Fixed Header */}
        <div className="pt-12 px-5 pb-4 shrink-0 bg-white z-20">
          <div className="flex justify-center mb-6 mt-2">
            <img src="/profile.png" alt="Kalinq Logo" className="w-[142px] h-[70px] object-contain" />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 rounded-full h-11 flex items-center px-4">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 font-medium text-gray-700"
              />
            </div>
            <button onClick={() => router.push('/brand/notifications')} className="relative w-11 h-11 rounded-full flex items-center justify-center bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 shrink-0 hover:bg-gray-50 transition-colors">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-[#EF4823] rounded-full border-2 border-white"></span>
            </button>
          </div>

          <div className="flex items-center gap-1 mb-4">
            <h2 className="font-bold text-gray-800 text-[15px]">Top Opportunities For You</h2>
            <span className="text-[14px]">✨</span>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab 
                  ? "bg-orange-50 text-[#EF4823]" 
                  : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32 pt-2 touch-pan-y flex flex-col gap-5 relative">
          
          {creators.map((creator) => (
            <div key={creator.id} className="w-[335px] h-[194px] bg-[#FCF5EB] rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col mx-auto overflow-hidden shrink-0">
              {/* Top White Section */}
              <div className="bg-white p-4 pb-3 flex gap-4 h-[126px] rounded-b-[20px] shadow-sm z-10">
                {/* Profile Pic */}
                <div className="w-[84px] h-[84px] rounded-[18px] bg-gray-200 shrink-0 relative mt-1 shadow-[0_8px_16px_rgba(0,0,0,0.15)] z-20">
                  {creator.image ? (
                    <img src={creator.image} alt={creator.name} className="object-cover w-full h-full rounded-[18px]" />
                  ) : (
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" alt="Dummy" className="object-cover w-full h-full rounded-[18px]" />
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 flex flex-col pt-1">
                  <div className="flex justify-end gap-2.5 mb-1.5">
                    <button><Send className="w-[15px] h-[15px] text-gray-400 hover:text-gray-600" /></button>
                    <button><Bookmark className="w-[15px] h-[15px] text-gray-400 hover:text-gray-600" /></button>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <h3 className="text-[20px] font-extrabold text-gray-600 leading-none">{creator.name}</h3>
                    {creator.verified && <VerifiedBadge className="shrink-0" />}
                  </div>
                  <div className="flex gap-2">
                    {creator.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Stats Section */}
              <div className="flex-1 flex items-center justify-around px-4">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[#EF4823] font-black text-[16px]">{creator.followers}</span>
                  <span className="text-gray-400 text-[9px] font-semibold tracking-wide">Followers</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[#EF4823] font-black text-[16px]">{creator.viewership}</span>
                  <span className="text-gray-400 text-[9px] font-semibold tracking-wide">Avg Viewership</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[#EF4823] font-black text-[16px]">{creator.engagement}</span>
                  <span className="text-gray-400 text-[9px] font-semibold tracking-wide">Avg Engagement</span>
                </div>
              </div>
            </div>
          ))}

        {/* Inline Banner */}
        <div className="w-full pb-[88px] pt-2 z-10 shrink-0">
          <div className="w-full max-w-[335px] mx-auto bg-[#EF4823] rounded-2xl p-4 flex items-center justify-between shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
            
            {/* Transparent Kalinq pattern */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 opacity-10">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="white">
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col">
              <span className="text-white/90 text-[11px] font-medium leading-none mb-1">Find</span>
              <span className="text-white text-xl font-bold leading-none tracking-tight">Partners</span>
            </div>
            <button className="relative z-10 bg-[#D4E865] hover:bg-[#c2d655] text-gray-800 px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95">
              View
            </button>
          </div>
        </div>

        </div>
      </div>
      
      <BottomNav />
    </div>
  )
}
