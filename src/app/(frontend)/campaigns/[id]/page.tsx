'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ChevronLeft, X } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import PostDealChatbot from '@/components/shared/PostDealChatbot';

function CampaignDetailContent() {
  const router = useRouter();
  const params = useParams();
  const [negotiateModalOpen, setNegotiateModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [actionError, setActionError] = useState<{type: 'accept' | 'negotiate' | 'reject' | null, message: string}>({ type: null, message: '' });
  const [negotiateAmount, setNegotiateAmount] = useState('');
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

 React.useEffect(() => {
   fetch(`/api/campaigns?role=creator&t=${Date.now()}`)
     .then(r => r.json())
     .then(data => {
       if (data.success && data.campaigns) {
         const found = data.campaigns.find((c: any) => c.id === params.id);
         setCampaign(found);
       }
       setLoading(false);
     })
     .catch(() => setLoading(false));
 }, [params.id]);

  const [actionLoading, setActionLoading] = useState(false);
  const [activeDealInfo, setActiveDealInfo] = useState<{chatId: string} | null>(null);

  const isPublic = campaign?.visibility === 'Public';
  const requestInfo = isPublic ? campaign?.requests?.[0] : campaign?.campaignInvites?.[0];
  const currentStatus = requestInfo?.status;
  const isAccepted = ['BRAND_ACCEPTED_NEGOTIATION', 'ACCEPTED', 'accepted'].includes(currentStatus);

  const handleAction = async (status: string, message?: string) => {
    if (!campaign) return;
    setActionLoading(true);
    setActionError({ type: null, message: '' });
    
    // Determine the error type for UI based on status
    const getErrorType = () => {
      if (status === 'accepted' || status === 'applied') return 'accept';
      if (status === 'negotiating') return 'negotiate';
      if (status === 'rejected') return 'reject';
      return null;
    };
    const errorType = getErrorType();

    try {
      const isPrivate = !isPublic;
      const endpoint = isPrivate ? '/api/campaigns/respond-invite' : '/api/campaigns/requests';
      let payload: any = {};
      
      if (isPrivate) {
        let action = status.toUpperCase();
        if (action === 'APPLIED' || action === 'ACCEPTED') action = 'ACCEPT';
        else if (action === 'REJECTED') action = 'REJECT';
        else if (action === 'NEGOTIATING') action = 'NEGOTIATE';
        
        const inviteId = campaign.campaignInvites?.[0]?.id;
        
        payload = { 
          campaignId: campaign.id,
          inviteId, 
          action, 
          negotiatedPrice: status === 'negotiating' ? negotiateAmount : undefined, 
          message 
        };
      } else {
        payload = { campaignId: campaign.id, status, message: status === 'negotiating' ? `Negotiated to ₹${negotiateAmount}` : undefined };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        if (status === 'accepted' || status === 'applied') {
           setCampaign({
             ...campaign,
             [isPrivate ? 'campaignInvites' : 'requests']: [{
               ...requestInfo,
               status: data.status || 'ACCEPTED'
             }]
           });
           return;
        }
        
        if (status === 'negotiating') setNegotiateModalOpen(false);
        if (status === 'rejected') setRejectModalOpen(false);
        
        router.push('/creator');
      } else {
        setActionError({ type: errorType, message: data.error || 'An unexpected error occurred.' });
      }
    } catch(e: any) {
      console.error(e);
      setActionError({ type: errorType, message: e.message || 'Network error occurred.' });
    } finally {
      setActionLoading(false);
    }
  };

  const applyNegotiation = () => {
    handleAction('negotiating', `Negotiated to ₹${negotiateAmount}`);
  };

  const handleConnect = async () => {
    try {
      const dealId = requestInfo.id;
      const creatorId = requestInfo.creatorId;
      const brandId = campaign.userId;
      
      const res = await fetch('/api/chats/initiate-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, brandId, creatorId })
      });
      const data = await res.json();
      if (data.success) {
        setActiveDealInfo({ chatId: data.chatId });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  if (!campaign) return <div className="min-h-screen flex justify-center items-center">Campaign not found</div>;

  return (
  <>
  <div className="w-full max-w-md mx-auto min-h-screen bg-white pb-40 font-sans relative overflow-x-hidden">
  
  {/* Header */}
  <div className="px-4 sm:px-6 pt-4 pb-6 flex justify-start">
  <button 
  onClick={() => router.back()}
  className="w-12 h-12 bg-orange-100/80 text-primary-red rounded-[16px] flex items-center justify-center transition-transform active:scale-95"
  >
  <ChevronLeft size={28} strokeWidth={2.5} />
  </button>
  </div>

  <div className="px-4 sm:px-6">
  {/* Campaign Info Header */}
  <div className="flex justify-between items-start mb-4">
  {campaign.user?.brandProfile?.profilePic ? (
    <div className="w-12 h-12 rounded-[14px] overflow-hidden shrink-0">
      <img src={campaign.user.brandProfile.profilePic} alt="Brand" className="w-full h-full object-cover" />
    </div>
  ) : (
    <div className="w-12 h-12 bg-[#f0f4ff] rounded-[14px] flex items-center justify-center shrink-0">
      <div className="w-6 h-6 border-4 border-[#8ba4eb] rounded-sm transform rotate-45 border-t-transparent"></div>
    </div>
  )}
  <span className="text-[11px] font-medium text-gray-400 mt-1">Just now</span>
  </div>
  
  <div className="flex justify-between items-start mb-3">
  <div className="flex flex-col pr-4">
  <h1 className="text-[20px] font-extrabold text-[#1a1a2e] mb-0.5 tracking-tight">{campaign.title}</h1>
  <p className="text-[12px] font-medium text-gray-500 italic">{campaign.subtitle || 'Brand Campaign'}</p>
  </div>
  <div className="flex flex-col items-end shrink-0">
  <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Budget</span>
  <span className="text-[18px] font-extrabold text-[#EF4423]">{campaign.budget || 'Open'}</span>
  </div>
  </div>

  <div className="inline-block px-3 py-1.5 bg-[#fff7ed] text-[#ea580c] text-[11px] font-bold rounded-lg mb-8">
  {campaign.dateRange || 'TBD'}
  </div>

  {/* Detailed Sections */}
  <div className="flex flex-col gap-8 mb-12">
  
  <section>
  <h2 className="text-[15px] font-extrabold text-[#1a1a2e] mb-3">Campaign Brief</h2>
  <p className="text-[13px] text-gray-500 leading-relaxed whitespace-pre-wrap">
  {campaign.description || "No description provided."}
  </p>
  </section>

  <section>
  <h2 className="text-[15px] font-extrabold text-[#1a1a2e] mb-3">Campaign Goal</h2>
  <ul className="list-disc pl-5 text-[13px] text-gray-500 leading-relaxed space-y-2">
  <li className="pl-1">Increase brand awareness among target audiences (18–30, skincare enthusiasts).</li>
  <li className="pl-1">Drive social engagement (likes, comments, shares, saves).</li>
  <li className="pl-1">Encourage website traffic & conversions using influencer discount codes.</li>
  </ul>
  </section>

  <section>
  <h2 className="text-[15px] font-extrabold text-[#1a1a2e] mb-3">Deliverables</h2>
  <ul className="list-disc pl-5 text-[13px] text-gray-500 leading-relaxed space-y-2">
  <li className="pl-1">1 Instagram Reel (30–60s): Product unboxing, routine demo, or before/after usage.</li>
  <li className="pl-1">2 Instagram Stories (with swipe-up link): Highlight product benefits & call-to-action.</li>
  <li className="pl-1">1 Instagram Post (static or carousel): High-quality photo showcasing product usage in daily routine.</li>
  <li className="pl-1">Tag @brandhandle and use campaign hashtags: <span className="font-semibold text-gray-700">#GlowWithRadiance #RadiancePartner</span></li>
  </ul>
  </section>

  </div>

   {/* Action Buttons (Sticky) */}
   <div className="fixed bottom-[72px] sm:bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-md px-4 sm:px-6 py-4 bg-white/90 backdrop-blur-md border-t border-gray-100 flex flex-wrap items-center gap-2 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
  {isAccepted ? (
    <button 
      onClick={handleConnect}
      className="w-full py-3 px-10 bg-green-500 text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(34,197,94,0.2)] hover:bg-green-600 transition-colors"
    >
      Let's Connect Together
    </button>
  ) : requestInfo && currentStatus === 'BRAND_NEGOTIATING' ? (
    <div className="flex flex-col w-full gap-2">
      <div className="w-full py-2 bg-orange-50 text-orange-600 text-[12px] font-bold rounded-xl text-center border border-orange-100">
        Brand Counter Offer: {requestInfo.negotiatedPrice || 'See message'}<br/>
        <span className="text-[10px] text-gray-500 italic">"{requestInfo.message}"</span>
      </div>
      <div className="flex gap-2 w-full">
        <button 
        disabled={actionLoading}
        className={`flex-1 py-3 bg-[#EF4423] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] transition-colors ${actionLoading ? 'opacity-50' : 'hover:bg-[#d83e1c]'}`}
        onClick={() => handleAction('accepted')}
        >
        {actionLoading ? '...' : 'Accept Offer'}
        </button>
        <button 
        disabled={actionLoading}
        className={`flex-1 py-3 bg-[#f3f4f6] text-gray-500 text-[13px] font-bold rounded-xl transition-colors ${actionLoading ? 'opacity-50' : 'hover:bg-gray-200'}`}
        onClick={() => setRejectModalOpen(true)}
        >
        Reject
        </button>
        <button 
        disabled={actionLoading}
        className={`flex-1 py-3 bg-orange-100 text-[#D9873E] text-[13px] font-bold rounded-xl transition-colors ${actionLoading ? 'opacity-50' : 'hover:bg-orange-200'}`}
        onClick={() => setNegotiateModalOpen(true)}
        >
        Negotiate
        </button>
      </div>
    </div>
  ) : isPublic ? (
    requestInfo ? (
      <div className="w-full py-3 bg-green-50 text-green-600 text-[13px] font-bold rounded-xl text-center border border-green-100 uppercase tracking-wide">
        Status: {currentStatus}
      </div>
    ) : (
       <button 
       disabled={actionLoading}
       className={`w-full py-3 px-10 bg-[#EF4423] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] transition-colors ${actionLoading ? 'opacity-50' : 'hover:bg-[#d83e1c]'}`}
       onClick={() => handleAction('applied')}
       >
         {actionLoading ? 'Working...' : 'Apply'}
       </button>
     )
   ) : (
   <>
   {requestInfo && currentStatus !== 'PENDING' ? (
     <div className="w-full py-3 bg-gray-50 text-gray-600 text-[13px] font-bold rounded-xl text-center border border-gray-200 uppercase tracking-wide">
       Status: {currentStatus}
     </div>
   ) : (
     <>
       <button 
       disabled={actionLoading}
       className={`flex-1 py-3 bg-[#EF4423] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] transition-colors ${actionLoading ? 'opacity-50' : 'hover:bg-[#d83e1c]'}`}
       onClick={() => handleAction('accepted')}
       >
       {actionLoading ? '...' : 'Accept'}
       </button>
       <button 
       disabled={actionLoading}
       className={`flex-1 py-3 bg-[#f3f4f6] text-gray-500 text-[13px] font-bold rounded-xl transition-colors ${actionLoading ? 'opacity-50' : 'hover:bg-gray-200'}`}
       onClick={() => setRejectModalOpen(true)}
       >
       {actionLoading ? '...' : 'Reject'}
       </button>
       <button 
       disabled={actionLoading}
       className={`flex-1 py-3 bg-[#f3f4f6] text-gray-500 text-[13px] font-bold rounded-xl transition-colors ${actionLoading ? 'opacity-50' : 'hover:bg-gray-200'}`}
       onClick={() => setNegotiateModalOpen(true)}
       >
       Negotiate
       </button>
     </>
   )}
  </>
  )}
 </div>

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
 <h2 className="text-[18px] font-black text-[#EF4423] mb-1.5 uppercase tracking-wide">YOUR NEGOTIATION</h2>
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
 disabled={actionLoading}
 className={`w-full py-4 bg-[#EF4423] text-white text-[14px] font-bold tracking-wide rounded-[14px] shadow-[0_6px_16px_rgba(239,72,35,0.25)] transition-all duration-300 ${actionLoading ? 'opacity-50' : 'hover:-translate-y-0.5'}`}
 onClick={applyNegotiation}
 >
 {actionLoading ? 'WORKING...' : 'APPLY'}
 </button>
 </div>
 </div>
 )}

  {/* Rejection Modal Overlay */}
  {rejectModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
  <div 
  className="absolute inset-0 bg-[#1a1a2e]/60 backdrop-blur-[2px]"
  onClick={() => setRejectModalOpen(false)}
  ></div>
  
  <div className="relative bg-white w-full max-w-sm rounded-[24px] p-6 shadow-2xl z-10 animate-in fade-in zoom-in duration-200 text-center">
  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
    <X size={32} strokeWidth={2.5} />
  </div>
  <h2 className="text-[20px] font-black text-[#1a1a2e] mb-2">Reject Campaign?</h2>
  <p className="text-[13px] font-medium text-gray-500 mb-8">
    Are you sure you want to reject this campaign? It will be permanently removed from your private list.
  </p>
  
  <div className="flex gap-3 w-full">
    <button 
    disabled={actionLoading}
    className="flex-1 py-3.5 bg-gray-100 text-gray-600 text-[13px] font-bold rounded-[14px] hover:bg-gray-200 transition-colors"
    onClick={() => setRejectModalOpen(false)}
    >
    Cancel
    </button>
    <button 
    disabled={actionLoading}
    className="flex-1 py-3.5 bg-red-500 text-white text-[13px] font-bold rounded-[14px] shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:bg-red-600 transition-colors flex items-center justify-center"
    onClick={() => handleAction('rejected')}
    >
    {actionLoading ? 'Working...' : 'Confirm Reject'}
    </button>
  </div>
  </div>
  </div>
  )}

  {/* Action Error Modal (Failure States) */}
  {actionError.type && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
  <div 
  className="absolute inset-0 bg-[#1a1a2e]/60 backdrop-blur-[2px]"
  onClick={() => setActionError({ type: null, message: '' })}
  ></div>
  
  <div className="relative bg-white w-full max-w-sm rounded-[24px] p-6 shadow-2xl z-10 animate-in fade-in zoom-in duration-200 text-center">
  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
    <X size={32} strokeWidth={2.5} />
  </div>
  <h2 className="text-[20px] font-black text-[#1a1a2e] mb-2">
    {actionError.type === 'accept' ? 'Accept Failure' : actionError.type === 'negotiate' ? 'Negotiation Send Failure' : 'Action Failed'}
  </h2>
  <p className="text-[13px] font-medium text-gray-500 mb-8">
    {actionError.message}
  </p>
  
  <button 
  className="w-full py-4 bg-[#EF4423] text-white text-[14px] font-bold tracking-wide rounded-[14px] shadow-[0_6px_16px_rgba(239,72,35,0.25)] transition-all duration-300 hover:-translate-y-0.5"
  onClick={() => setActionError({ type: null, message: '' })}
  >
  TRY AGAIN
  </button>
  </div>
  </div>
  )}

  <BottomNav />
 </div>
 
 {activeDealInfo && (
   <PostDealChatbot 
     chatId={activeDealInfo.chatId}
     userRole="creator"
     onComplete={() => { setActiveDealInfo(null); router.push('/creator'); }}
     onClose={() => { setActiveDealInfo(null); router.push('/creator'); }}
   />
 )}
 </>
 );
}

export default function CampaignDetailPage() {
 return (
 <Suspense fallback={<div className="min-h-screen bg-white" />}>
 <CampaignDetailContent />
 </Suspense>
 );
}
