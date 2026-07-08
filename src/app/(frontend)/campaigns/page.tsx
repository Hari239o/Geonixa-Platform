'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, X, Send } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import { getItem } from '@/utils/storage';

type Campaign = {
  id: string;
  timeAgo?: string;
  title: string;
  subtitle?: string;
  budget?: string;
  dateRange?: string;
  description?: string;
  negotiatedAmount?: string | null;
  isNegotiated?: boolean;
  createdAt?: string;
  visibility?: string;
  creatorStatus?: string;
  requests?: any[];
};

export default function CampaignPage() {
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<'Private' | 'Public'>('Private');
 const [negotiateModalOpen, setNegotiateModalOpen] = useState(false);
 const [negotiateAmount, setNegotiateAmount] = useState('');
 const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
 const [profilePic, setProfilePic] = useState<string>('/profile_pic.png');
 const [actionLoading, setActionLoading] = useState<string | null>(null);
 const [campaigns, setCampaigns] = useState<Campaign[]>([]);

 useEffect(() => {
   async function loadProfile() {
     if (typeof window !== 'undefined') {
       const parsed = await getItem<any>('kaling_user_profile');
       if (parsed && parsed.profilePic) {
         setProfilePic(parsed.profilePic);
       }
     }
   }
   loadProfile();
 }, []);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('/api/campaigns?role=creator');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.campaigns) {
            setCampaigns(data.campaigns);
          }
        }
      } catch (err: any) {
        console.error("Error fetching campaigns:", err);
      }
    }
    fetchCampaigns();
  }, []);

 const handleNegotiateClick = (e: React.MouseEvent, id: string) => {
   e.stopPropagation();
   setSelectedCampaignId(id);
   setNegotiateModalOpen(true);
 };

 const handleAction = async (e: React.MouseEvent | null, campaignId: string, status: string, message?: string) => {
    if (e) e.stopPropagation();
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    setActionLoading(campaignId);
    try {
      const isPrivate = campaign.visibility === 'Private';
      const endpoint = isPrivate ? '/api/campaigns/respond-invite' : '/api/campaigns/requests';
      let payload: any = {};
      
      if (isPrivate) {
        let action = status.toUpperCase();
        if (action === 'APPLIED' || action === 'ACCEPTED') action = 'ACCEPT';
        else if (action === 'REJECTED') action = 'REJECT';
        else if (action === 'NEGOTIATING') action = 'NEGOTIATE';
        
        payload = { 
          campaignId: campaign.id,
          action, 
          negotiatedPrice: status === 'negotiating' ? negotiateAmount : undefined, 
          message: status === 'negotiating' ? `Negotiated to ₹${negotiateAmount}` : message 
        };
      } else {
        payload = { 
          campaignId: campaign.id, 
          status, 
          message: status === 'negotiating' ? `Negotiated to ₹${negotiateAmount}` : undefined 
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`Campaign ${status}!`);
        if (status === 'negotiating') {
          setNegotiateModalOpen(false);
          setNegotiateAmount('');
        }
        setCampaigns(campaigns.map(c => 
          c.id === campaignId 
            ? { ...c, creatorStatus: status === 'negotiating' ? 'negotiating' : (isPrivate && status === 'accepted' ? 'ACCEPTED' : 'applied') }
            : c
        ));
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch(err: any) {
      console.error(err);
      alert(`Network Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

 const applyNegotiation = () => {
   if (selectedCampaignId && negotiateAmount) {
     handleAction(null, selectedCampaignId, 'negotiating', `Negotiated to ₹${negotiateAmount}`);
   }
 };

 const filteredCampaigns = campaigns.filter(c => (c.visibility || 'Public') === activeTab);

 return (
 <div className="w-full max-w-md mx-auto h-full flex flex-col bg-[#fafbfc] font-sans overflow-hidden">
  <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 relative">
 
 {/* Header */}
 <div className="px-4 sm:px-6 pt-4 pb-6 flex justify-between items-center bg-white shrink-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
 <div className="flex-1 relative mr-4">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
 <input 
 type="text" 
 placeholder="Search" 
 className="w-full bg-[#f9fafb] text-gray-900 text-sm font-medium rounded-2xl pl-11 pr-4 py-3.5 outline-none border border-transparent focus:border-gray-200"
 />
 </div>
 <button 
 className="relative p-2 rounded-full hover:bg-gray-50 transition-colors shrink-0"
 onClick={() => router.push('/creator/notifications')}
 >
 <Bell className="w-6 h-6 text-[#1a1a2e]" strokeWidth={2.5} />
 <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-primary-red rounded-full border-2 border-white"></span>
 </button>
 </div>

 {/* Tabs */}
 <div className="px-4 sm:px-6 mb-6 mt-4 shrink-0">
 <div className="flex bg-[#f3f4f6] rounded-[20px] p-1.5">
 <button 
 className={`flex-1 py-3 text-[14px] font-bold rounded-[16px] transition-all duration-300 ${activeTab === 'Private' ? 'bg-[#EF4823] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
 onClick={() => setActiveTab('Private')}
 >
 Private
 </button>
 <button 
 className={`flex-1 py-3 text-[14px] font-bold rounded-[16px] transition-all duration-300 ${activeTab === 'Public' ? 'bg-[#EF4823] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
 onClick={() => setActiveTab('Public')}
 >
 Public
 </button>
 </div>
 </div>

 {/* Campaign List */}
 <div className="px-4 sm:px-6 flex flex-col gap-5 flex-1 overflow-y-auto no-scrollbar pb-24 touch-pan-y">
 {filteredCampaigns.length === 0 ? (
    <div className="text-center text-gray-400 py-10">No {activeTab} campaigns found.</div>
 ) : filteredCampaigns.map((campaign) => (
 <div 
 key={campaign.id} 
 className={`bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] cursor-pointer transition-all duration-300 ${campaign.creatorStatus === 'negotiating' ? 'border-2 border-[#EF4823]' : 'border border-gray-100'}`}
 onClick={() => router.push(`/campaigns/${campaign.id}`)}
 >
 <div className="flex justify-between items-start mb-4">
 <div className="w-12 h-12 bg-[#f0f4ff] rounded-[14px] flex items-center justify-center shrink-0">
 <div className="w-6 h-6 border-4 border-[#8ba4eb] rounded-sm transform rotate-45 border-t-transparent"></div>
 </div>
 <span className="text-[11px] font-medium text-gray-400 mt-1">{campaign.timeAgo || 'Just now'}</span>
 </div>
 
 <div className="flex justify-between items-start mb-3">
 <div className="flex flex-col pr-4">
 <h3 className="text-base font-extrabold text-[#1a1a2e] mb-0.5 tracking-tight">{campaign.title}</h3>
 <p className="text-[11px] font-medium text-gray-500 italic">{campaign.subtitle || 'Brand Campaign'}</p>
 </div>
 <div className="flex flex-col items-end shrink-0">
 <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Budget</span>
 <span className="text-[16px] font-extrabold text-[#EF4823]">{campaign.budget || 'Open'}</span>
 </div>
 </div>

 <div className="inline-block px-3 py-1.5 bg-[#fff7ed] text-[#ea580c] text-[11px] font-bold rounded-lg mb-4">
 {campaign.dateRange || 'TBD'}
 </div>

 <p className="text-[13px] text-gray-500 leading-relaxed mb-6 line-clamp-2">
 {campaign.description} <span className="text-[#EF4823] font-semibold hover:underline cursor-pointer">Read more</span>
 </p>

 {/* Action Buttons */}
 <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
 {['brand_accepted_negotiation', 'BRAND_ACCEPTED_NEGOTIATION', 'ACCEPTED', 'accepted', 'applied'].includes(campaign.creatorStatus || '') ? (
    <div className="w-full py-3 bg-green-50 text-green-600 text-[13px] font-bold rounded-xl text-center border border-green-100 uppercase tracking-wide">
      STATUS: {campaign.creatorStatus === 'applied' ? 'APPLIED' : 'ACCEPTED'}
    </div>
 ) : campaign.creatorStatus === 'negotiating' ? (
    <div className="w-full py-3 bg-orange-50 text-orange-500 text-[13px] font-bold rounded-xl text-center border border-orange-100 uppercase tracking-wide">
      STATUS: NEGOTIATING
    </div>
 ) : campaign.creatorStatus === 'REJECTED' || campaign.creatorStatus === 'rejected' ? (
    <div className="w-full py-3 bg-red-50 text-red-500 text-[13px] font-bold rounded-xl text-center border border-red-100 uppercase tracking-wide">
      STATUS: REJECTED
    </div>
 ) : activeTab === 'Public' ? (
 <button 
 disabled={actionLoading === campaign.id}
 className={`py-2.5 px-10 bg-[#EF4823] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] transition-colors ${actionLoading === campaign.id ? 'opacity-50' : 'hover:bg-[#d83e1c]'}`}
 onClick={(e) => handleAction(e, campaign.id, 'applied')}
 >
 {actionLoading === campaign.id ? 'Working...' : 'Apply'}
 </button>
 ) : (
 <>
 <button 
 disabled={actionLoading === campaign.id}
 onClick={(e) => handleAction(e, campaign.id, 'accepted')}
 className={`flex-1 min-w-[80px] py-3 bg-[#EF4823] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] transition-colors ${actionLoading === campaign.id ? 'opacity-50' : 'hover:bg-[#d83e1c]'}`}>
 {actionLoading === campaign.id ? '...' : 'Accept'}
 </button>
 <button 
 disabled={actionLoading === campaign.id}
 onClick={(e) => handleAction(e, campaign.id, 'rejected')}
 className={`flex-1 min-w-[80px] py-3 bg-[#f3f4f6] text-gray-500 text-[13px] font-bold rounded-xl transition-colors ${actionLoading === campaign.id ? 'opacity-50' : 'hover:bg-gray-200'}`}>
 {actionLoading === campaign.id ? '...' : 'Reject'}
 </button>
 <button 
 disabled={actionLoading === campaign.id}
 className={`flex-1 min-w-[80px] py-3 bg-[#f3f4f6] text-gray-500 text-[13px] font-bold rounded-xl transition-colors ${actionLoading === campaign.id ? 'opacity-50' : 'hover:bg-gray-200'}`}
 onClick={(e) => handleNegotiateClick(e, campaign.id)}
 >
 Negotiate
 </button>
 </>
 )}
 </div>
 </div>
 ))}
 </div>

 {/* Negotiation Modal Overlay */}
 {negotiateModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
 <div 
 className="absolute inset-0 bg-[#1a1a2e]/60 backdrop-blur-[2px]"
 onClick={() => setNegotiateModalOpen(false)}
 ></div>
 
 <div className="relative bg-white w-full max-w-sm rounded-[24px] p-6 shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
 <button 
 className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
 onClick={() => setNegotiateModalOpen(false)}
 >
 <X size={20} strokeWidth={2.5} />
 </button>

 <div className="flex flex-col items-center mt-6 mb-8 text-center">
 <h2 className="text-[18px] font-black text-[#EF4823] mb-1.5 uppercase tracking-wide">YOUR NEGOTIATION</h2>
 <p className="text-[12px] font-medium text-gray-400">Enter Your Negotiation Amount</p>
 </div>

 <div className="w-full mb-8">
    <div className="relative">
      <input 
        type="number" 
        placeholder="Enter Amount"
        value={negotiateAmount}
        onChange={(e) => setNegotiateAmount(e.target.value)}
        className="w-full bg-[#f9fafb] border border-transparent focus:border-gray-200 rounded-[16px] py-4 px-5 text-[15px] font-bold text-gray-900 placeholder:text-gray-400 outline-none"
      />
    </div>
    <div className="flex justify-between gap-2 mt-4">
      <button 
        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-bold rounded-[10px] transition-colors"
        onClick={() => setNegotiateAmount((prev) => (parseInt(prev || "0") + 1000).toString())}
      >
        +1000
      </button>
      <button 
        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-bold rounded-[10px] transition-colors"
        onClick={() => setNegotiateAmount((prev) => (parseInt(prev || "0") + 2000).toString())}
      >
        +2000
      </button>
      <button 
        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-bold rounded-[10px] transition-colors"
        onClick={() => setNegotiateAmount((prev) => (parseInt(prev || "0") + 3000).toString())}
      >
        +3000
      </button>
    </div>
  </div>

 <button 
 disabled={actionLoading === selectedCampaignId}
 className={`w-full py-4 bg-[#EF4823] text-white text-[14px] font-bold tracking-wide rounded-[14px] shadow-[0_6px_16px_rgba(239,72,35,0.25)] transition-all duration-300 ${actionLoading === selectedCampaignId ? 'opacity-50' : 'hover:-translate-y-0.5'}`}
 onClick={applyNegotiation}
 >
 {actionLoading === selectedCampaignId ? 'WORKING...' : 'APPLY'}
 </button>
 </div>
 </div>
 )}
 </div>

 <BottomNav profilePic={profilePic} />
 </div>
 );
}
