"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Send, Bookmark } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"
import { User } from "lucide-react"

// SVG for Verified Badge
const VerifiedBadge = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4823" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export default function CampaignRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadRequests() {
      try {
        const res = await fetch('/api/campaigns')
        const data = await res.json()
        if (data.success && data.campaigns) {
          const allRequests: any[] = []
          data.campaigns.forEach((camp: any) => {
            if (camp.campaignInvites) {
              camp.campaignInvites.forEach((inv: any) => {
                if (inv.status === 'NEGOTIATING' || inv.status === 'PENDING') {
                  allRequests.push({ ...inv, campaign: camp, isPublicRequest: false })
                }
              })
            }
            if (camp.requests) {
              camp.requests.forEach((req: any) => {
                if (req.status === 'negotiating' || req.status === 'pending' || req.status === 'applied') {
                  allRequests.push({ ...req, campaign: camp, isPublicRequest: true })
                }
              })
            }
          })
          setRequests(allRequests.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadRequests()
  }, [])

  const handleAction = async (id: string, action: string, isPublicRequest: boolean) => {
    try {
      const endpoint = isPublicRequest ? '/api/campaigns/requests' : '/api/campaigns/respond-invite'
      const method = isPublicRequest ? 'PATCH' : 'POST'
      const payload = isPublicRequest ? { requestId: id, action } : { inviteId: id, action }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setRequests(prev => prev.filter(req => req.id !== id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="h-full bg-white font-sans flex justify-center overflow-hidden">
      <div className="w-full w-full bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="pt-5 px-5 pb-6 shrink-0 z-20 bg-white flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4823] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          
          <h1 className="text-[#1E1B4B] font-extrabold text-[18px]">Requests</h1>
          
          <div className="w-10 h-10"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32 touch-pan-y flex flex-col gap-8 relative bg-gray-50/30">
          
          {loading ? (
             <div className="text-center text-gray-400 mt-10">Loading...</div>
          ) : requests.length === 0 ? (
             <div className="text-center text-gray-400 mt-10">No pending requests</div>
          ) : requests.map((req) => (
            <div key={req.id} className="flex flex-col gap-2">
              
              {/* Creator Card */}
              <div 
                onClick={() => router.push(`/brand/portfolio/${req.creator.id}`)}
                className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="p-4 flex gap-4 h-[126px] z-10 relative">
                  <span className="absolute bottom-4 right-4 text-gray-300 text-[10px] font-medium">
                    {new Date(req.updatedAt).toLocaleDateString()}
                  </span>
                  
                  {/* Profile Pic */}
                  <div className="w-[84px] h-[84px] rounded-[18px] bg-gray-200 overflow-hidden shrink-0 relative mt-1 flex items-center justify-center">
                    {req.creator.profilePic ? (
                      <img src={req.creator.profilePic} alt="Profile" className="object-cover w-full h-full" />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 flex flex-col pt-1">
                    <div className="flex justify-end gap-2.5 mb-1.5">
                      <button><Send className="w-[15px] h-[15px] text-gray-400 hover:text-gray-600" /></button>
                      <button><Bookmark className="w-[15px] h-[15px] text-gray-400 hover:text-gray-600" /></button>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <h3 className="text-[18px] font-extrabold text-gray-700 leading-none">{req.creator.fullName || 'Creator'}</h3>
                      {req.creator.isVerified && <VerifiedBadge className="shrink-0 mt-0.5" />}
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-full">{req.creator.category || 'Creator'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FEF5ED] flex-1 flex items-center justify-around py-4">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[#EF4823] font-black text-[15px]">{req.creator.followers || '0'}</span>
                    <span className="text-gray-400 text-[9px] font-semibold tracking-wide">Followers</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[#EF4823] font-black text-[15px]">{req.creator.viewership || '0'}</span>
                    <span className="text-gray-400 text-[9px] font-semibold tracking-wide">Avg Viewership</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[#EF4823] font-black text-[15px]">{req.creator.engagement || '0'}</span>
                    <span className="text-gray-400 text-[9px] font-semibold tracking-wide">Avg Engagement</span>
                  </div>
                </div>
              </div>

              {/* Campaign Card below it */}
              <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] flex flex-col relative border border-gray-50">
                <div className="w-10 h-10 rounded-[12px] bg-gray-100 flex items-center justify-center mb-4">
                   <div className="w-5 h-5 bg-blue-500 rounded-sm rotate-45 transform flex items-center justify-center opacity-40"></div>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-gray-800 text-[15px]">{req.campaign.title}</h3>
                    <p className="text-gray-400 text-[11px] font-medium">- {req.campaign.subtitle || 'Brand Campaign'}</p>
                  </div>
                  <div className="flex flex-col items-end pt-1">
                    <span className="text-gray-400 text-[10px] font-bold">Budget</span>
                    <span className="text-[#EF4823] font-bold text-[15px]">{req.campaign.budget || 'Open'}</span>
                  </div>
                </div>

                <div className="bg-[#FCF5EB] text-[#D9873E] text-[10px] font-bold py-1.5 px-3 rounded-full inline-block w-fit mb-3 mt-1">
                  {req.campaign.dateRange || 'TBD'}
                </div>

                <p className="text-gray-500 text-[11px] leading-relaxed mb-4 pr-2">
                  {req.campaign.description}
                </p>

                {req.status === 'NEGOTIATING' || req.status === 'negotiating' ? (
                  <div className="mb-4 bg-orange-50 p-3 rounded-xl border border-orange-100">
                    <p className="text-[#EF4823] text-sm font-bold mb-1">Creator Negotiated Price: {req.negotiatedPrice || 'See message'}</p>
                    {req.message && <p className="text-gray-600 text-xs italic">"{req.message}"</p>}
                  </div>
                ) : null}

                <div className="flex gap-3">
                  {req.status === 'NEGOTIATING' || req.status === 'negotiating' || req.status === 'applied' || req.status === 'pending' || req.status === 'PENDING' ? (
                    <>
                      <button onClick={() => handleAction(req.id, 'ACCEPT', req.isPublicRequest)} className="flex-1 bg-[#EF4823] text-white text-[12px] font-bold py-3 rounded-[12px] hover:bg-[#e03d1b] transition-colors">
                        Accept Deal
                      </button>
                      <button onClick={() => handleAction(req.id, 'REJECT', req.isPublicRequest)} className="flex-1 bg-gray-100 text-gray-500 text-[12px] font-bold py-3 rounded-[12px] hover:bg-gray-200 transition-colors">
                        Reject
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 bg-gray-100 text-gray-500 text-[12px] font-bold py-3 text-center rounded-[12px]">
                      Waiting for Creator
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}

        </div>
        
        <BottomNav />
      </div>
    </div>
  )
}
