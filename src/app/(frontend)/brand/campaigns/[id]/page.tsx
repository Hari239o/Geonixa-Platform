"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, CheckCircle2, Clock, CheckCircle } from "lucide-react"

export default function CampaignTrackingPage() {
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const id = window.location.pathname.split("/").pop();
        const res = await fetch(`/api/campaigns/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCampaign(data.campaign);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, []);
  


  // Extract all creators from both public requests and private invites
  const allCreators: any[] = [];
  const addedCreatorIds = new Set();
  
  if (campaign) {
    if (campaign.campaignInvites) {
      campaign.campaignInvites.forEach((r: any) => {
        if (r.creator) {
          allCreators.push({
            id: r.creator.id,
            name: r.creator.fullName || "Unknown Creator",
            profilePic: r.creator.profilePic || "/placeholder.png",
            status: r.status,
            type: "Private Invite"
          });
          addedCreatorIds.add(r.creator.id);
        }
      });
    }
    if (campaign.requests) {
      campaign.requests.forEach((r: any) => {
        if (r.creator && !addedCreatorIds.has(r.creator.id)) {
          allCreators.push({
            id: r.creator.id,
            name: r.creator.fullName || "Unknown Creator",
            profilePic: r.creator.profilePic || "/placeholder.png",
            status: r.status,
            type: "Public Request"
          });
          addedCreatorIds.add(r.creator.id);
        }
      });
    }
  }

  // Calculate statuses based on all creators
  let approveStatus = "active"
  let workVerStatus = "pending"
  let paymentStatus = "pending"
  let isRejected = false;

  if (campaign) {
    const hasAccepted = allCreators.some((r: any) => ['accepted', 'brand_accepted_negotiation'].includes(r.status?.toLowerCase()));
    
    // Fallback: these might need to be fetched from specific request models in the future
    const hasWorkVerified = campaign.requests?.some((r: any) => r.workVerified) || false;
    const hasPaymentDone = campaign.requests?.some((r: any) => r.paymentDone) || false;
    
    isRejected = allCreators.length > 0 && allCreators.every((r: any) => r.status?.toLowerCase() === "rejected" || r.status?.toLowerCase() === "brand_rejected_negotiation");

    if (hasAccepted) {
      approveStatus = "completed";
      workVerStatus = "active";
    } else if (isRejected) {
      approveStatus = "rejected";
    }

    if (hasWorkVerified) {
      workVerStatus = "completed";
      paymentStatus = "active";
    }
    if (hasPaymentDone) {
      paymentStatus = "completed";
    }
  }
  const steps = [
    { id: 1, name: "Fill Form", status: "completed" },
    { id: 2, name: "Send Invites", status: "completed" },
    { id: 3, name: "Approve Submissions", status: approveStatus },
    { id: 4, name: "Work Verification", status: workVerStatus },
    { id: 5, name: "Payment", status: paymentStatus },
  ]

  const getStatusText = () => {
    if (isRejected) return "Rejected by Creator(s)";
    if (paymentStatus === "completed") return "Campaign Completed";
    if (paymentStatus === "active") return "Pending Payments";
    if (workVerStatus === "active") return "Verifying Work";
    return "Reviewing Submissions";
  };

  const handleActionClick = async (stepId: number) => {
    // Basic mock action for now, in a real app this would call an API to update the request
    const id = window.location.pathname.split("/").pop();
    if (stepId === 4) {
      alert("Work verification feature coming soon!");
    } else if (stepId === 5) {
      alert("Payment gateway integration coming soon!");
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-[#F8F9FA] flex justify-center items-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EF4423]"></div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#F8F9FA] font-sans flex justify-center overflow-hidden">
      <div className="w-full w-full bg-[#F8F9FA] h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="pt-5 px-5 pb-4 shrink-0 bg-white z-20 flex items-center justify-between border-b border-gray-50">
          <button 
            onClick={() => router.push('/brand/campaigns')}
            className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4423] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          
          <h1 className="text-[#1E1B4B] font-extrabold text-[18px]">Campaign Tracker</h1>
          
          <div className="w-10 h-10"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 pb-32 touch-pan-y flex flex-col relative">
          
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 mb-6">
            <h2 className="font-extrabold text-[20px] text-gray-900 mb-2">{campaign?.title || "Campaign"}</h2>
            <p className="text-gray-500 text-[13px]">Status: <span className="text-[#EF4423] font-bold">{getStatusText()}</span></p>
          </div>

          <h3 className="font-extrabold text-[16px] text-gray-800 mb-6 px-1">Progress</h3>

          <div className="flex flex-col gap-0 relative px-2">
            {/* Connecting Line */}
            <div className="absolute left-[23px] top-6 bottom-10 w-0.5 bg-gray-200"></div>

            {steps.map((step, index) => {
              const isCompleted = step.status === "completed"
              const isActive = step.status === "active"
              const isRejectedStep = step.status === "rejected"
              const showAction = isActive && (step.id === 4 || step.id === 5);
              
              return (
                <div key={step.id} className="flex gap-4 relative z-10 mb-8 last:mb-0">
                  {/* Icon Node */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-[#F8F9FA] ${
                    isCompleted ? "bg-[#EF4423] text-white" :
                    isRejectedStep ? "bg-red-500 text-white" :
                    isActive ? "bg-[#1E1B4B] text-white" :
                    "bg-white border-gray-200 text-gray-300 border-2"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                     isRejectedStep ? <span className="font-bold text-sm">X</span> :
                     isActive ? <Clock className="w-5 h-5 animate-pulse" /> : 
                     <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>}
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col pt-2.5 w-full">
                    <span className={`font-bold text-[15px] ${
                      isCompleted ? "text-gray-900" :
                      isRejectedStep ? "text-red-500" :
                      isActive ? "text-[#1E1B4B]" :
                      "text-gray-400"
                    }`}>
                      {step.name}
                    </span>
                    {isActive && (
                      <p className="text-[#EF4423] text-[12px] font-medium mt-1">
                        Currently waiting on your action
                      </p>
                    )}
                    {isRejectedStep && (
                      <p className="text-red-500 text-[12px] font-medium mt-1">
                        Creator rejected this campaign
                      </p>
                    )}
                    {showAction && (
                      <button 
                        onClick={() => handleActionClick(step.id)}
                        className="mt-3 bg-[#FEF5ED] text-[#EF4423] py-2 px-4 rounded-xl text-xs font-bold text-left self-start"
                      >
                        {step.id === 4 ? "Verify Work Now" : "Make Payment Now"}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {allCreators.length > 0 && (
            <>
              <h3 className="font-extrabold text-[16px] text-gray-800 mb-4 px-1 mt-6 border-t border-gray-100 pt-6">Creator Responses</h3>
              <div className="flex flex-col gap-3">
                {allCreators.map((c: any, i: number) => (
                  <div key={i} className="bg-white p-4 rounded-[16px] border border-gray-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
                        {c.profilePic && c.profilePic !== "/placeholder.png" ? (
                          <img src={c.profilePic} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold bg-[#FEF5ED]">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-gray-900 line-clamp-1">{c.name}</span>
                        <span className="text-[11px] text-gray-400">{c.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${
                        c.status?.toLowerCase() === 'accepted' ? 'bg-green-50 text-green-600' :
                        c.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-600' :
                        c.status?.toLowerCase() === 'negotiating' ? 'bg-orange-50 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1).toLowerCase() : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        <div className="px-5 pb-8 pt-4 bg-[#F8F9FA] z-10 border-t border-gray-100 flex justify-center">
          <button 
            onClick={async () => {
              if(confirm("Are you sure you want to delete this campaign?")) {
                try {
                  const id = window.location.pathname.split("/").pop();
                  const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
                  const data = await res.json();
                  if(data.success) {
                    router.push('/brand/campaigns');
                  } else {
                    alert("Error deleting campaign");
                  }
                } catch(e) { console.error(e); }
              }
            }}
            className="w-full py-3.5 bg-red-50 text-red-600 font-bold text-[14px] rounded-xl hover:bg-red-100 transition-colors"
          >
            Delete Campaign
          </button>
        </div>
        
      </div>
    </div>
  )
}
