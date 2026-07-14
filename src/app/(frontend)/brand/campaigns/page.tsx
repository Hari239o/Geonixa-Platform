"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, MessageSquare, Plus, Wand2, Edit3, X, Lock, Globe } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"
import { Logo } from "@/components/ui/Logo"

export default function CampaignDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("Private")
  const [isPopulated, setIsPopulated] = useState(true) // Set to true to show populated state based on mockups
  const [showCreateMenu, setShowCreateMenu] = useState(false)

  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    async function fetchCampaigns() {
      try {
        const [res, jobsRes] = await Promise.all([
          fetch('/api/campaigns?role=brand'),
          fetch('/api/studios/jobs?role=brand')
        ]);
        
        let allItems: any[] = [];

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.campaigns) {
            allItems = [...allItems, ...data.campaigns.map((c: any) => {
               let computedStatus = 'Pending';
               const hasAcceptedRequests = c.requests?.some((r: any) => r.status === 'ACCEPTED' || r.status === 'brand_accepted_negotiation');
               const hasPendingRequests = c.requests?.some((r: any) => r.status === 'PENDING' || r.status === 'applied');
               
               if (hasAcceptedRequests) {
                 computedStatus = 'Active';
               } else if (hasPendingRequests) {
                 computedStatus = 'Pending';
               } else if (c.visibility === 'Private' && c.campaignInvites?.length > 0) {
                 computedStatus = 'Invited';
               } else {
                 computedStatus = 'Open';
               }

               return {
                 id: c.id,
                 title: c.title,
                 subtitle: c.subtitle || `${c.visibility || 'Public'} Campaign`,
                 date: c.dateRange || 'TBD',
                 desc: c.description || 'No description provided.',
                 budget: c.budget || 'Open',
                 timeAgo: 'Just now',
                 status: computedStatus,
                 visibility: c.visibility || 'Public',
                 type: 'campaign'
               }
            })];
          }
        }

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          if (jobsData.success && jobsData.jobs) {
            allItems = [...allItems, ...jobsData.jobs.map((j: any) => ({
              id: j.id,
              title: j.contentBrief ? j.contentBrief.substring(0, 30) + "..." : "Studio Job",
              subtitle: j.partnerType,
              date: `${j.date} | ${j.timeSlot}`,
              desc: j.contentBrief || 'No description',
              budget: j.location || 'Any',
              timeAgo: new Date(j.createdAt).toLocaleDateString(),
              status: j.status === 'open' && j.applications?.length > 0 ? 'Pending' : j.status === 'open' ? 'Open' : 'Active',
              visibility: 'Studio Jobs',
              type: 'studioJob',
              applications: j.applications
            }))]
          }
        }

        setCampaigns(allItems);

      } catch (e) {
        console.error("Failed to fetch campaigns", e)
      } finally {
        setLoading(false)
        setIsPopulated(true)
      }
    }
    fetchCampaigns()
  }, [])

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Active':
        return <div className="bg-[#10B981] text-white text-[11px] font-bold px-5 py-1.5 rounded-full inline-block mt-3">Active</div>
      case 'Open':
        return <div className="bg-[#3B82F6] text-white text-[11px] font-bold px-5 py-1.5 rounded-full inline-block mt-3">Open</div>
      case 'Pending':
        return <div className="bg-[#F59E0B] text-white text-[11px] font-bold px-5 py-1.5 rounded-full inline-block mt-3">Pending Requests</div>
      case 'Invited':
        return <div className="bg-[#8B5CF6] text-white text-[11px] font-bold px-5 py-1.5 rounded-full inline-block mt-3">Invited</div>
      default:
        return null
    }
  }

  return (
    <div className="h-full bg-[#F8F9FA] font-sans flex justify-center overflow-hidden">
      <div className="w-full w-full bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Fixed Header */}
        <div className="pt-4 px-5 pb-4 shrink-0 bg-white z-20">
          <div className="flex justify-center mb-4">
            <Logo showText={true} />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-full h-11 flex items-center px-4">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 font-medium text-gray-700"
              />
            </div>
            <button onClick={() => router.push('/brand/campaigns/requests')} className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <MessageSquare className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4423] rounded-full border border-white"></span>
            </button>
            <button onClick={() => router.push('/brand/notifications')} className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4423] rounded-full border border-white"></span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-50 rounded-[14px] p-1">
            {["Private", "Public", "Studio Jobs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-[12px] text-[13px] font-bold transition-colors ${
                  activeTab === tab 
                  ? "bg-[#EF4423] text-white shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32 pt-2 touch-pan-y flex flex-col gap-4 relative bg-[#F8F9FA]">
          
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center pb-20">
              <span className="text-gray-400 font-medium">Loading...</span>
            </div>
          ) : campaigns.filter(c => c.visibility === activeTab).length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-20">
              <h2 className="text-gray-400 text-lg font-medium text-center leading-snug">No {activeTab} Campaigns<br/>Found</h2>
            </div>
          ) : (
            campaigns.filter(c => c.visibility === activeTab).map((camp) => (
              <div 
                key={camp.id} 
                onClick={() => {
                  if (camp.type === 'studioJob') {
                    router.push(`/brand/jobs/${camp.id}`);
                  } else {
                    router.push(`/brand/campaigns/${camp.id}`);
                  }
                }}
                className="bg-white rounded-[20px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col relative border border-gray-50/50 cursor-pointer hover:shadow-md transition-shadow"
              >
                <span className="absolute top-5 right-5 text-gray-300 text-[10px] font-medium">{camp.timeAgo}</span>
                
                <div className="w-10 h-10 rounded-[12px] bg-gray-100 flex items-center justify-center mb-4">
                   <div className="w-5 h-5 bg-blue-500 rounded-sm rotate-45 transform flex items-center justify-center opacity-40"></div>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-gray-800 text-[15px]">{camp.title}</h3>
                    <p className="text-gray-400 text-[11px] font-medium">{camp.subtitle}</p>
                  </div>
                  <div className="flex flex-col items-end pt-1">
                    <span className="text-gray-400 text-[10px] font-bold">Budget</span>
                    <span className="text-[#EF4423] font-bold text-[15px]">{camp.budget}</span>
                  </div>
                </div>

                <div className="bg-[#FCF5EB] text-[#D9873E] text-[10px] font-bold py-1.5 px-3 rounded-full inline-block w-fit mb-3 mt-1">
                  {camp.date}
                </div>

                <p className="text-gray-500 text-[11.5px] leading-relaxed mb-1 pr-2">
                  {camp.desc}
                  <span className="text-[#EF4423] font-bold cursor-pointer hover:underline ml-1">Read more</span>
                </p>

                {getStatusBadge(camp.status)}
              </div>
            ))
          )}

        </div>

        {/* Floating Action Button */}
        <div className="absolute bottom-20 left-0 w-full flex justify-center z-30 pointer-events-none">
          <button 
            onClick={() => setShowCreateMenu(true)}
            className="w-12 h-12 bg-[#EF4423] rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(239,72,35,0.3)] hover:scale-105 transition-transform pointer-events-auto"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        {/* Create Menu Bottom Sheet Overlay */}
        {showCreateMenu && (
          <div className="fixed inset-0 z-[110] flex flex-col justify-end items-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowCreateMenu(false)}></div>
            <div className="bg-white rounded-t-[24px] p-5 pb-8 w-full w-full relative z-10 animate-in slide-in-from-bottom-full duration-200 shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-[18px] text-gray-800">Create Campaign</h3>
                <button onClick={() => setShowCreateMenu(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col gap-2.5">
                <button 
                  onClick={() => router.push("/brand/campaigns/create/ai")}
                  className="w-full bg-[#FAFAFA] border border-gray-100 p-3 rounded-[16px] flex items-center gap-4 hover:bg-orange-50/50 hover:border-orange-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#EF4423]/10 flex items-center justify-center shrink-0">
                    <Wand2 className="w-5 h-5 text-[#EF4423]" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-[14px] text-gray-800 group-hover:text-[#EF4423] transition-colors">Create with AI</span>
                    <span className="text-[11px] text-gray-400 font-medium">Use our smart assistant to build it</span>
                  </div>
                </button>

                <button 
                  onClick={() => router.push("/brand/campaigns/create/manual")}
                  className="w-full bg-[#FAFAFA] border border-gray-100 p-3 rounded-[16px] flex items-center gap-4 hover:bg-orange-50/50 hover:border-orange-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#EF4423]/10">
                    <Edit3 className="w-5 h-5 text-gray-500 group-hover:text-[#EF4423]" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-[14px] text-gray-800 group-hover:text-gray-900">Create Manual</span>
                    <span className="text-[11px] text-gray-400 font-medium">Fill out the details yourself</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
        
        <BottomNav />
      </div>
    </div>
  )
}
