'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, X, Send } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import { getItem } from '@/utils/storage';

type Campaign = {
  id: number;
  timeAgo: string;
  title: string;
  subtitle: string;
  budget: string;
  dateRange: string;
  description: string;
  negotiatedAmount: string | null;
  isNegotiated: boolean;
};

export default function CampaignPage() {
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<'Private' | 'Public'>('Private');
 const [negotiateModalOpen, setNegotiateModalOpen] = useState(false);
 const [negotiateAmount, setNegotiateAmount] = useState('');
 const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
 const [profilePic, setProfilePic] = useState<string>('/profile_pic.png');

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

 const [campaigns, setCampaigns] = useState<Campaign[]>([
 {
 id: 1,
 timeAgo: '25 minute ago',
 title: 'Glow With Radiance',
 subtitle: '- Skincare Brand Campaign',
 budget: '₹6000',
 dateRange: '04 September - 10 September 2025',
 description: "We're looking for lifestyle and beauty influencers to showcase our new Radiance Glow Serum.",
 negotiatedAmount: null,
 isNegotiated: false
 },
 {
 id: 2,
 timeAgo: '25 minute ago',
 title: 'Glow With Radiance',
 subtitle: '- Skincare Brand Campaign',
 budget: '₹6000',
 dateRange: '04 September - 10 September 2025',
 description: "We're looking for lifestyle and beauty influencers to showcase our new Radiance Glow Serum.",
 negotiatedAmount: null,
 isNegotiated: false
 },
 {
 id: 3,
 timeAgo: '25 minute ago',
 title: 'Glow With Radiance',
 subtitle: '- Skincare Brand Campaign',
 budget: '₹6000',
 dateRange: '04 September - 10 September 2025',
 description: "We're looking for lifestyle and beauty influencers to showcase our new Radiance Glow Serum.",
 negotiatedAmount: null,
 isNegotiated: false
 }
 ]);

 const handleNegotiateClick = (id: number) => {
 setSelectedCampaignId(id);
 setNegotiateModalOpen(true);
 };

 const applyNegotiation = () => {
 if (selectedCampaignId && negotiateAmount) {
 setCampaigns(campaigns.map(c => 
 c.id === selectedCampaignId ? { ...c, isNegotiated: true, negotiatedAmount: `₹ ${negotiateAmount}` } : c
 ));
 }
 setNegotiateModalOpen(false);
 setNegotiateAmount('');
 };

 return (
 <div className="w-full max-w-md mx-auto h-full flex flex-col bg-[#fafbfc] font-sans relative overflow-hidden">
 
 {/* Header */}
 <div className="px-4 sm:px-6 pt-10 pb-6 flex justify-between items-center bg-white shrink-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
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
 {campaigns.map((campaign) => (
 <div 
 key={campaign.id} 
 className={`bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] cursor-pointer transition-all duration-300 ${campaign.isNegotiated && activeTab === 'Private' ? 'border-2 border-[#EF4823]' : 'border border-gray-100'}`}
 onClick={() => router.push(`/categories/${campaign.id}?type=${activeTab.toLowerCase()}`)}
 >
 <div className="flex justify-between items-start mb-4">
 <div className="w-12 h-12 bg-[#f0f4ff] rounded-[14px] flex items-center justify-center shrink-0">
 {/* Abstract brand icon */}
 <div className="w-6 h-6 border-4 border-[#8ba4eb] rounded-sm transform rotate-45 border-t-transparent"></div>
 </div>
 <span className="text-[11px] font-medium text-gray-400 mt-1">{campaign.timeAgo}</span>
 </div>
 
 <div className="flex justify-between items-start mb-3">
 <div className="flex flex-col pr-4">
 <h3 className="text-base font-extrabold text-[#1a1a2e] mb-0.5 tracking-tight">{campaign.title}</h3>
 <p className="text-[11px] font-medium text-gray-500 italic">{campaign.subtitle}</p>
 </div>
 <div className="flex flex-col items-end shrink-0">
 <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Budget</span>
 <span className="text-[16px] font-extrabold text-[#EF4823]">{campaign.budget}</span>
 </div>
 </div>

 <div className="inline-block px-3 py-1.5 bg-[#fff7ed] text-[#ea580c] text-[11px] font-bold rounded-lg mb-4">
 {campaign.dateRange}
 </div>

 <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
 {campaign.description} <span className="text-[#EF4823] font-semibold hover:underline cursor-pointer">Read more</span>
 </p>

 {/* Action Buttons */}
 <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
 {activeTab === 'Public' ? (
 <button 
 className="py-2.5 px-10 bg-[#EF4823] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] hover:bg-[#d83e1c] transition-colors"
 onClick={() => alert("Applied to Campaign!")}
 >
 Apply
 </button>
 ) : (
 !campaign.isNegotiated ? (
 <>
 <button className="flex-1 min-w-[80px] py-3 bg-[#EF4823] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] hover:bg-[#d83e1c] transition-colors">
 Accept
 </button>
 <button className="flex-1 min-w-[80px] py-3 bg-[#f3f4f6] text-gray-500 text-[13px] font-bold rounded-xl hover:bg-gray-200 transition-colors">
 Reject
 </button>
 <button 
 className="flex-1 min-w-[80px] py-3 bg-[#f3f4f6] text-gray-500 text-[13px] font-bold rounded-xl hover:bg-gray-200 transition-colors"
 onClick={() => handleNegotiateClick(campaign.id)}
 >
 Negotiate
 </button>
 </>
 ) : (
 <>
 <button className="flex-1 min-w-[80px] py-3 bg-[#f9fafb] text-gray-400 text-[13px] font-bold rounded-xl cursor-not-allowed">
 Accept
 </button>
 <button className="flex-1 min-w-[80px] py-3 bg-[#f9fafb] text-gray-400 text-[13px] font-bold rounded-xl cursor-not-allowed">
 Reject
 </button>
 <div className="flex-1 min-w-[120px] flex justify-end items-center gap-2">
 <div className="px-4 py-2.5 bg-[#fff7ed] text-[#EF4823] text-[14px] font-extrabold rounded-xl">
 {campaign.negotiatedAmount}
 </div>
 <button className="w-10 h-10 bg-[#EF4823] text-white rounded-[12px] flex items-center justify-center shadow-sm hover:scale-105 transition-transform shrink-0">
 <Send size={16} strokeWidth={2.5} className="-ml-0.5" />
 </button>
 </div>
 </>
 )
 )}
 </div>
 </div>
 ))}
 </div>

 {/* Negotiation Modal Overlay */}
 {negotiateModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
 {/* Backdrop */}
 <div 
 className="absolute inset-0 bg-[#1a1a2e]/60 backdrop-blur-[2px]"
 onClick={() => setNegotiateModalOpen(false)}
 ></div>
 
 {/* Modal Content */}
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
 placeholder="₹ 8000"
 value={negotiateAmount}
 onChange={(e) => setNegotiateAmount(e.target.value)}
 className="w-full bg-[#f9fafb] border border-transparent focus:border-gray-200 rounded-[16px] py-4 px-5 text-[15px] font-bold text-gray-900 placeholder:text-gray-600 outline-none"
 />
 </div>
 </div>

 <button 
 className="w-full py-4 bg-[#EF4823] text-white text-[14px] font-bold tracking-wide rounded-[14px] shadow-[0_6px_16px_rgba(239,72,35,0.25)] hover:-translate-y-0.5 transition-all duration-300"
 onClick={applyNegotiation}
 >
 APPLY
 </button>
 </div>
 </div>
 )}

 <BottomNav profilePic={profilePic} />
 </div>
 );
}
