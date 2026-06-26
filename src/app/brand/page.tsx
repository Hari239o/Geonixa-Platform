"use client"

import React, { useState } from "react"
import { Search, Bell, Send, Bookmark } from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import BottomNav from "@/components/brand/BottomNav"

export default function BrandHomePage() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filters = ['All', 'UGC', 'Influencer', 'Partners']

  const profiles = [
    { id: 1, name: 'Lorem Ipsum', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop', tags: ['Fashion', 'UGC'], followers: '44.5k', viewership: '22.8k', engagement: '38.9k' },
    { id: 2, name: 'Lorem Ipsum', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop', tags: ['Fashion', 'Influencer'], followers: '44.5k', viewership: '22.8k', engagement: '38.9k' },
    { id: 3, name: 'Lorem Ipsum', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop', tags: ['Fashion', 'Influencer'], followers: '44.5k', viewership: '22.8k', engagement: '38.9k' },
  ]
  const [dynamicProfiles, setDynamicProfiles] = useState(profiles)

  useEffect(() => {
    // Check if there's a newly created creator profile
    const saved = typeof window !== 'undefined' ? (sessionStorage.getItem("creatorSignupData") || localStorage.getItem("creatorSignupData")) : null;
    if (saved) {
      try {
        const creatorData = JSON.parse(saved)
        if (creatorData.firstName || creatorData.name) {
          const newProfile = {
            id: 999,
            name: creatorData.firstName ? `${creatorData.firstName} ${creatorData.lastName || ''}`.trim() : creatorData.name,
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop', // Default avatar
            tags: [creatorData.category || 'Lifestyle', creatorData.creatorType || 'Creator'],
            followers: '0',
            viewership: '0',
            engagement: '0'
          }
          // Avoid duplicates in dev mode
          setDynamicProfiles(prev => {
            if (prev.some(p => p.id === 999)) return prev;
            return [newProfile, ...prev];
          });
        }
      } catch (e) {}
    }
  }, [])

  return (
    <div className="h-full bg-black flex justify-center font-sans overflow-hidden">
      <div className="w-full max-w-md bg-white h-full relative shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header / Search Area */}
        <div className="pt-12 px-5 pb-4 bg-white z-10 shrink-0">
          <div className="flex justify-center mb-6">
            <Logo large={false} showText={true} />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full bg-[#F8F9FA] rounded-2xl h-[46px] pl-12 pr-4 text-sm font-medium outline-none focus:ring-1 focus:ring-[#EF4823]"
              />
            </div>
            <button className="relative p-2 text-gray-700 hover:text-[#EF4823] transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#EF4823] rounded-full border border-white"></span>
            </button>
          </div>

          <h2 className="text-gray-900 font-bold text-[15px] mb-3">Top Opportunities For You ✨</h2>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  activeFilter === filter 
                    ? 'bg-[#FEF0EC] text-[#EF4823]' 
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-28 pt-2 touch-pan-y flex flex-col gap-5 bg-white">
          
          {dynamicProfiles.map((profile) => (
            <div key={profile.id} className="w-[335px] h-[194px] bg-white rounded-3xl flex flex-col p-4 relative mx-auto border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)]">
              {/* Top section */}
              <div className="flex relative z-10">
                {/* Profile image */}
                <div className="w-[84px] h-[84px] rounded-[24px] bg-gray-200 overflow-hidden shrink-0 shadow-sm">
                  <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                </div>
                
                {/* Info */}
                <div className="ml-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xl font-bold text-gray-500">{profile.name}</h3>
                    {/* Verified Badge */}
                    <svg className="w-5 h-5 text-[#EF4823]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.16 15.68L6.4 13.24l1.37-1.42 3.07 2.94 6.83-7.23 1.42 1.34-8.25 8.81z"/>
                    </svg>
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    {profile.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-[#F8F9FA] text-[#C1C1C1] text-[11px] font-bold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Icons */}
                <div className="absolute top-1 right-1 flex gap-3 text-gray-400">
                  <button className="hover:text-[#EF4823] transition-colors"><Send className="w-[18px] h-[18px]" /></button>
                  <button className="hover:text-[#EF4823] transition-colors"><Bookmark className="w-[18px] h-[18px]" /></button>
                </div>
              </div>
              
              {/* Bottom section (Stats) */}
              <div className="mt-auto h-[62px] bg-[#FDF5EB] rounded-[16px] flex items-center justify-between px-6">
                <div className="flex flex-col items-center">
                  <span className="text-[#EF4823] font-bold text-[17px]">{profile.followers}</span>
                  <span className="text-gray-400 text-[10px] font-medium mt-0.5">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[#EF4823] font-bold text-[17px]">{profile.viewership}</span>
                  <span className="text-gray-400 text-[10px] font-medium mt-0.5">Avg Viewership</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[#EF4823] font-bold text-[17px]">{profile.engagement}</span>
                  <span className="text-gray-400 text-[10px] font-medium mt-0.5">Avg Engagement</span>
                </div>
              </div>
            </div>
          ))}

          {/* Find Partners Banner */}
          <div className="w-[335px] h-[72px] bg-[#EF4823] rounded-2xl mx-auto flex items-center justify-between px-6 relative overflow-hidden mt-1 shadow-md">
            {/* Watermark/Background Pattern overlay */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full object-cover">
                <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="white" />
              </svg>
            </div>
            
            <div className="flex flex-col relative z-10 mt-1">
              <span className="text-white/90 text-[11px] font-medium leading-none">Find</span>
              <span className="text-white text-lg font-bold">Partners</span>
            </div>
            <button className="bg-[#E5DF72] text-[#EF4823] px-6 py-1.5 rounded-full font-bold text-sm relative z-10 active:scale-95 transition-transform">
              View
            </button>
          </div>

        </div>
      </div>
      
      <BottomNav />
    </div>
  )
}
