'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ChevronLeft, X } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';

function CampaignDetailContent() {
 const router = useRouter();
 const params = useParams();
 const searchParams = useSearchParams();
 const isPublic = searchParams.get('type') === 'public';
 
 const [negotiateModalOpen, setNegotiateModalOpen] = useState(false);
 const [negotiateAmount, setNegotiateAmount] = useState('');

 const applyNegotiation = () => {
 alert(`Negotiation for ₹${negotiateAmount || 8000} applied!`);
 setNegotiateModalOpen(false);
 router.push('/categories');
 };

 return (
 <div className="w-full max-w-md mx-auto min-h-screen bg-white pb-24 font-sans relative overflow-x-hidden">
 
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
 <div className="w-12 h-12 bg-[#f0f4ff] rounded-[14px] flex items-center justify-center shrink-0">
 {/* Abstract brand icon */}
 <div className="w-6 h-6 border-4 border-[#8ba4eb] rounded-sm transform rotate-45 border-t-transparent"></div>
 </div>
 <span className="text-[11px] font-medium text-gray-400 mt-1">25 minute ago</span>
 </div>
 
 <div className="flex justify-between items-start mb-3">
 <div className="flex flex-col pr-4">
 <h1 className="text-[20px] font-extrabold text-[#1a1a2e] mb-0.5 tracking-tight">Glow With Radiance</h1>
 <p className="text-[12px] font-medium text-gray-500 italic">- Skincare Brand Campaign</p>
 </div>
 <div className="flex flex-col items-end shrink-0">
 <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">Budget</span>
 <span className="text-[18px] font-extrabold text-[#EF4823]">₹6000</span>
 </div>
 </div>

 <div className="inline-block px-3 py-1.5 bg-[#fff7ed] text-[#ea580c] text-[11px] font-bold rounded-lg mb-8">
 04 September - 10 September 2025
 </div>

 {/* Detailed Sections */}
 <div className="flex flex-col gap-8 mb-12">
 
 <section>
 <h2 className="text-[15px] font-extrabold text-[#1a1a2e] mb-3">Campaign Brief</h2>
 <p className="text-[13px] text-gray-500 leading-relaxed">
 We're looking for lifestyle and beauty influencers to showcase our new Radiance Glow Serum. The campaign will highlight how the serum fits seamlessly into everyday skincare routines, promoting natural beauty and confidence. Influencers should create authentic, engaging content that resonates with their followers and communicates the product's key benefits: hydration, glow, and skin nourishment.
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

 {/* Action Buttons */}
 <div className="flex flex-wrap items-center gap-2 mb-10">
 {isPublic ? (
 <button 
 className="py-3 px-10 bg-[#EF4823] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] hover:bg-[#d83e1c] transition-colors"
 onClick={() => alert("Applied to Campaign!")}
 >
 Apply
 </button>
 ) : (
 <>
 <button 
 className="flex-1 py-3 bg-[#EF4823] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] hover:bg-[#d83e1c] transition-colors"
 onClick={() => alert("Campaign Accepted!")}
 >
 Accept
 </button>
 <button 
 className="flex-1 py-3 bg-[#f3f4f6] text-gray-500 text-[13px] font-bold rounded-xl hover:bg-gray-200 transition-colors"
 onClick={() => router.back()}
 >
 Reject
 </button>
 <button 
 className="flex-1 py-3 bg-[#f3f4f6] text-gray-500 text-[13px] font-bold rounded-xl hover:bg-gray-200 transition-colors"
 onClick={() => setNegotiateModalOpen(true)}
 >
 Negotiate
 </button>
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

 <BottomNav />
 </div>
 );
}

export default function CampaignDetailPage() {
 return (
 <Suspense fallback={<div className="min-h-screen bg-white" />}>
 <CampaignDetailContent />
 </Suspense>
 );
}
