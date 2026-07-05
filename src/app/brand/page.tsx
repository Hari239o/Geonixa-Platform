"use client"

import React, { useState, useEffect } from "react"
import { Search, Bell, Send, Bookmark, BadgeCheck } from "lucide-react"
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

export default function BrandHomeFeedPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("All")
  const [tabs, setTabs] = useState(["All", "UGC", "Influencer", "Partners"])
  const [isVerified, setIsVerified] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  
  const [creators, setCreators] = useState<any[]>([])

  useEffect(() => {
    // Check if the brand is verified
    const savedBrand = localStorage.getItem("kaling_brand_profile")
    if (savedBrand) {
      try {
        const parsedBrand = JSON.parse(savedBrand)
        setIsVerified(parsedBrand.isVerified || false)
        if (!parsedBrand.isVerified) {
          setShowVerifyModal(true)
        }
      } catch(e) {}
    } else {
      setShowVerifyModal(true)
    }

    // Fetch creators from the database
    async function fetchCreators() {
      try {
        const res = await fetch('/api/creators');
        const data = await res.json();
        if (data.success && data.creators && data.creators.length > 0) {
          const fetchedCreators = data.creators.map((c: any) => ({
            id: c.id,
            name: c.fullName || "Unnamed Creator",
            image: c.profilePic || null,
            category: c.category || "General",
            tags: c.tags || [],
            followers: c.followers || "0",
            viewership: c.viewership || "0",
            engagement: c.engagement || "0",
            verified: c.isVerified || false
          }));
          setCreators(fetchedCreators);
          
          // Generate real-time categories from database
          const uniqueCategories = new Set<string>();
          fetchedCreators.forEach((c: any) => {
            if (c.category && c.category !== "Creator") uniqueCategories.add(c.category);
            if (c.tags && c.tags.length > 0) {
              c.tags.forEach((t: string) => uniqueCategories.add(t));
            }
          });
          
          if (uniqueCategories.size > 0) {
            setTabs(["All", ...Array.from(uniqueCategories)]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch creators:", error);
      }
    }
    
    fetchCreators();
  }, [])

  return (
    <div className="h-full bg-[#F8F9FA] font-sans flex justify-center overflow-hidden">
      <div className="w-full w-full bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Fixed Header */}
        <div className="pt-4 px-5 pb-4 shrink-0 bg-white z-20">
          <div className="flex justify-center mb-4">
            <img src="/profile.png" alt="Kalinq Logo" className="w-[120px] h-auto object-contain" />
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
          
          {/* Fallback Authenticate Button if modal is closed */}
          {!isVerified && (
            <button 
              className="w-full py-4 bg-gradient-to-r from-[#EF4823] to-[#ff6b4a] text-white text-[15px] font-bold rounded-[18px] shadow-[0_8px_20px_rgba(239,72,35,0.25)] hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => router.push('/kyc')}
            >
              Authenticate
            </button>
          )}

          {creators.filter(creator => activeTab === "All" || creator.category === activeTab || creator.tags?.includes(activeTab)).map((creator) => (
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
                    {creator.tags.map((tag: string) => (
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

        {/* Fixed Banner */}
        <div className="fixed bottom-[88px] left-0 w-full px-5 z-40 pointer-events-none">
          <div className="w-full max-w-[335px] mx-auto bg-[#EF4823] rounded-[20px] p-4 flex items-center justify-between shadow-[0_8px_30px_rgba(239,72,35,0.25)] relative overflow-hidden pointer-events-auto">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
            
            {/* Transparent Kalinq pattern */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 opacity-10">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="white">
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col">
              <span className="text-white/90 text-[12px] font-semibold leading-none mb-1">Find</span>
              <span className="text-white text-[22px] font-bold leading-none tracking-tight">Partners</span>
            </div>
            <button className="relative z-10 bg-[#D4E865] hover:bg-[#c2d655] text-gray-800 px-7 py-2.5 rounded-[12px] text-[15px] font-bold shadow-sm transition-transform active:scale-95">
              View
            </button>
          </div>
        </div>
        
        {/* Spacing for fixed banner */}
        <div className="w-full h-[140px] shrink-0"></div>

        </div>
      </div>
      
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

      <BottomNav />
    </div>
  )
}
