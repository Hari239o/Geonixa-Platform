"use client"

import React, { useState, useEffect } from "react"
import { Search, Bell, Send, Bookmark, BadgeCheck, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import BottomNav from "@/components/brand/BottomNav"
import { Logo } from "@/components/ui/Logo"

// SVG for Verified Badge matching Image 2
const VerifiedBadge = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4423" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export default function BrandHomeFeedPage() {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const [activeTab, setActiveTab] = useState("All")
  const [tabs, setTabs] = useState(["All", "UGC", "Influencer", "Partners"])
  const [isVerified, setIsVerified] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  
  // Wallet Unlock States
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  
  const [creators, setCreators] = useState<any[]>([])
  const [brandProfile, setBrandProfile] = useState<any>(null)

  useEffect(() => {
    // Redirect if partner or creator
    if (status === "authenticated" && session?.user) {
      const userRole = (session.user as any).role;
      if (userRole === "partner") {
        router.replace("/partner");
        return;
      } else if (userRole === "creator") {
        router.replace("/creator");
        return;
      }
    }

    // Check if the brand is verified and get their profile
    const savedBrand = localStorage.getItem("kaling_brand_profile") || localStorage.getItem("kaling_company_profile")
    if (savedBrand) {
      try {
        const parsedBrand = JSON.parse(savedBrand)
        setIsVerified(parsedBrand.isVerified || false)
        setBrandProfile(parsedBrand)
      } catch(e) {}
    } else {
      fetch('/api/user/complete-profile').then(res => res.json()).then(data => {
        if (data.profile) {
          setBrandProfile(data.profile)
          setIsVerified(data.profile.isVerified || false)
        }
      }).catch(console.error)
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
            verified: c.isVerified || false,
            isUnlocked: c.isUnlocked || false
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
            const defaultTabs = ["All", "UGC", "Influencer", "Partners"];
            const newTabs = Array.from(uniqueCategories).filter(t => !defaultTabs.includes(t));
            setTabs([...defaultTabs, ...newTabs]);
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
          <div className="flex justify-center mb-6 mt-2 scale-125 origin-top">
            <Logo showText={true} />
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
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/chats')}
                className="relative p-2.5 rounded-[12px] bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <MessageCircle size={20} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => router.push('/brand/notifications')}
                className="relative p-2.5 rounded-[12px] bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Bell size={20} strokeWidth={2.5} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EF4423] rounded-full border-2 border-white"></span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <h2 className="font-bold text-gray-800 text-[15px]">Top Opportunities For You</h2>
              <span className="text-[14px]">✨</span>
            </div>
            

          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab 
                  ? "bg-orange-50 text-[#EF4423]" 
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
          
          {creators.filter(creator => activeTab === "All" || creator.category === activeTab || creator.tags?.includes(activeTab)).map((creator) => (
            <div 
              key={creator.id} 
              onClick={() => {
                if (!isVerified) {
                  setShowVerifyModal(true);
                  return;
                }
                if (creator.isUnlocked) {
                  router.push(`/brand/portfolio/${creator.id}`);
                } else {
                  setSelectedCreator(creator);
                  setShowUnlockModal(true);
                  try {
                    fetch('/api/creators/view', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: creator.id })
                    });
                  } catch(e) {}
                }
              }}
              className="w-[335px] bg-white border border-gray-100 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col mx-auto overflow-hidden shrink-0 cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all active:scale-[0.98]"
            >
              {/* Top Profile Section */}
              <div className="p-5 flex gap-4">
                {/* Profile Pic */}
                <div className="w-[88px] h-[88px] rounded-[20px] bg-gray-100 shrink-0 relative overflow-hidden shadow-sm">
                  {creator.image ? (
                    <img src={creator.image} alt={creator.name} className="object-cover w-full h-full" />
                  ) : (
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" alt="Dummy" className="object-cover w-full h-full" />
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <h3 className="text-[18px] font-bold text-gray-900 leading-tight">{creator.name}</h3>
                    {creator.verified && <VerifiedBadge className="shrink-0 w-4 h-4" />}
                  </div>
                  
                  {/* Category */}
                  {creator.category && (
                    <div className="text-[12px] font-medium text-[#EF4423] mb-2 capitalize">
                      {creator.category} Creator
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {creator.tags.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-semibold rounded-full">
                        {tag}
                      </span>
                    ))}
                    {creator.tags.length > 2 && (
                      <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-semibold rounded-full">
                        +{creator.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full h-[1px] bg-gray-50"></div>

              {/* Bottom Stats Section */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#FEF5ED] rounded-b-[24px]">
                <div className="flex flex-col items-center">
                  <span className="text-[#EF4423] font-bold text-[15px]">{creator.followers || "0"}</span>
                  <span className="text-gray-500 text-[10px] font-medium mt-0.5">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[#EF4423] font-bold text-[15px]">{creator.viewership || "0"}</span>
                  <span className="text-gray-500 text-[10px] font-medium mt-0.5">Avg Viewership</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[#EF4423] font-bold text-[15px]">{creator.engagement || "0"}</span>
                  <span className="text-gray-500 text-[10px] font-medium mt-0.5">Avg Engagement</span>
                </div>
              </div>
            </div>
          ))}

        {/* Fixed Banner */}
        <div className="fixed bottom-[88px] left-0 w-full px-5 z-40 pointer-events-none">
          <div className="w-full max-w-[335px] mx-auto bg-[#EF4423] rounded-[20px] p-4 flex items-center justify-between shadow-[0_8px_30px_rgba(239,72,35,0.25)] relative overflow-hidden pointer-events-auto">
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
            <button 
              onClick={() => {
                if (!isVerified) {
                  setShowVerifyModal(true);
                  return;
                }
                router.push('/studios')
              }}
              className="relative z-10 bg-[#D4E865] hover:bg-[#c2d655] text-gray-800 px-7 py-2.5 rounded-[12px] text-[15px] font-bold shadow-sm transition-transform active:scale-95"
            >
              View
            </button>
          </div>
        </div>
        
        {/* Spacing for fixed banner */}
        <div className="w-full h-[140px] shrink-0"></div>

        </div>
      </div>
      


      {/* Wallet Unlock Modal */}
      {showUnlockModal && selectedCreator && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[320px] rounded-[24px] p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowUnlockModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center mt-2 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4423" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5.45 7.59c-.36.12-.76.15-1.15.15h-11a2 2 0 0 1-2-2v-3"/>
                  <path d="M3 11v3"/>
                  <path d="M21 11v4"/>
                </svg>
              </div>
              <h2 className="text-[20px] font-black text-gray-800 mb-1 tracking-tight">Unlock Profile?</h2>
              <p className="text-[13px] text-gray-500 font-medium mb-6 leading-tight">
                Unlock {selectedCreator.name}'s full profile.
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button 
                  disabled={isUnlocking}
                  onClick={async () => {
                    const userId = (session?.user as any)?.id;
                    if (!userId) {
                      alert("Please log in to unlock profiles.");
                      return;
                    }

                    setIsUnlocking(true);
                    try {
                      const res = await fetch('/api/wallet/unlock-profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, targetProfileId: selectedCreator.id, unlockType: 'once' })
                      });
                      const data = await res.json();
                      
                      if (data.success) {
                        await updateSession();
                        alert(`Successfully unlocked! You have ${data.remainingCredits} credits remaining.`);
                        setShowUnlockModal(false);
                        router.push(`/brand/portfolio/${selectedCreator.id}`);
                      } else {
                        if (data.error && data.error.toLowerCase().includes("credit")) {
                          if (confirm("Insufficient credits! Would you like to go to your wallet to get more?")) {
                            setShowUnlockModal(false);
                            router.push('/brand/wallet');
                          }
                        } else {
                          alert(data.error || "Failed to unlock");
                        }
                      }
                    } catch(e) {
                      console.error(e);
                      alert("An error occurred");
                    } finally {
                      setIsUnlocking(false);
                    }
                  }}
                  className="w-full bg-white border border-gray-200 text-gray-800 font-bold py-3.5 rounded-[16px] hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Unlock Once (-1 Credit)
                </button>

                <button 
                  disabled={isUnlocking}
                  onClick={async () => {
                    const userId = (session?.user as any)?.id;
                    if (!userId) {
                      alert("Please log in to unlock profiles.");
                      return;
                    }

                    setIsUnlocking(true);
                    try {
                      const res = await fetch('/api/wallet/unlock-profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, targetProfileId: selectedCreator.id, unlockType: 'permanent' })
                      });
                      const data = await res.json();
                      
                      if (data.success) {
                        await updateSession();
                        
                        // Save permanent unlock locally
                        const unlocked = JSON.parse(localStorage.getItem('kaling_unlocked_profiles') || '[]');
                        if (!unlocked.includes(selectedCreator.id)) {
                          unlocked.push(selectedCreator.id);
                          localStorage.setItem('kaling_unlocked_profiles', JSON.stringify(unlocked));
                        }
                        
                        alert(`Permanently unlocked! You have ${data.remainingCredits} credits remaining.`);
                        setShowUnlockModal(false);
                        router.push(`/brand/portfolio/${selectedCreator.id}`);
                      } else {
                        if (data.error && data.error.toLowerCase().includes("credit")) {
                          if (confirm("Insufficient credits! Would you like to go to your wallet to get more?")) {
                            setShowUnlockModal(false);
                            router.push('/brand/wallet');
                          }
                        } else {
                          alert(data.error || "Failed to unlock");
                        }
                      }
                    } catch(e) {
                      console.error(e);
                      alert("An error occurred");
                    } finally {
                      setIsUnlocking(false);
                    }
                  }}
                  className="w-full bg-[#EF4423] text-white font-bold py-3.5 rounded-[16px] hover:bg-[#d63d1c] active:scale-[0.98] transition-all shadow-[0_4px_15px_rgba(239,72,35,0.25)] flex items-center justify-center gap-2"
                >
                  Permanent Unlock (-50 Credits)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <BadgeCheck className="w-[42px] h-[42px] text-[#EF4423] fill-[#EF4423] text-white mb-3" />
              <h2 className="text-[20px] font-black text-[#EF4423] text-center mb-1 tracking-tight">VERIFY YOUR ACCOUNT</h2>
              <p className="text-[13px] text-gray-500 font-medium text-center mb-6 leading-tight">
                With Aadhar
              </p>

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

      <BottomNav />
    </div>
  )
}
