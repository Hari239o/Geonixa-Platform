"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, Camera, X } from "lucide-react";
import BottomNav from "@/components/shared/BottomNav";
import { useSession } from "next-auth/react";

export default function PartnerDashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userName = session?.user?.name || "Karthik";
  
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [showVerificationModal, setShowVerificationModal] = useState(true);

  // Realistic mock data for projects
  const activeProjects = [
    {
      id: 1,
      title: "Glow With Radiance",
      subtitle: "Skincare Brand Campaign",
      dateRange: "04 September - 10 September 2025",
      description: "We're looking for lifestyle and beauty influencers to showcase our new Radiance Glow Serum.",
      budget: 6000,
      daysLeft: 2,
      timeAgo: "25 minute ago"
    },
    {
      id: 2,
      title: "Urban Style Walk",
      subtitle: "Fashion Brand Campaign",
      dateRange: "15 September - 22 September 2025",
      description: "Looking for trendy influencers to promote our upcoming autumn collection in urban settings.",
      budget: 8500,
      daysLeft: 5,
      timeAgo: "1 hour ago"
    }
  ];

  const completedProjects = [
    {
      id: 3,
      title: "Summer Fresh Vibes",
      subtitle: "Beverage Brand Campaign",
      dateRange: "01 August - 07 August 2025",
      description: "A successful campaign promoting our new line of iced teas for summer.",
      budget: 5000,
      daysLeft: 0,
      timeAgo: "1 month ago"
    },
    {
      id: 4,
      title: "Tech Gadget Review",
      subtitle: "Electronics Brand Campaign",
      dateRange: "10 July - 20 July 2025",
      description: "Review and showcase the latest smart watch features to your audience.",
      budget: 12000,
      daysLeft: 0,
      timeAgo: "2 months ago"
    }
  ];

  const projectsToDisplay = activeTab === "active" ? activeProjects : completedProjects;

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8F9FA] pb-28 relative font-sans flex flex-col">
      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-[320px] relative shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-14 h-14 bg-[#EF4423]/10 rounded-full flex items-center justify-center mb-4 mt-2">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#EF4423]" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            
            <h2 className="text-[#EF4423] text-lg font-black tracking-wide mb-1">VERIFY YOUR ACCOUNT</h2>
            <div className="flex flex-col items-center mb-6">
              <span className="text-[13px] text-gray-500 font-medium">Take A</span>
              <span className="text-[13px] text-gray-500 font-medium">Live Selfie Video</span>
            </div>
            
            <div className="w-full border-2 border-dashed border-[#EF4423]/40 rounded-[14px] py-4 flex items-center justify-center gap-2 text-[#EF4423] mb-6 cursor-pointer hover:bg-orange-50 transition-colors">
              <Camera size={20} strokeWidth={2.5} />
              <span className="font-bold text-sm">Camera</span>
            </div>
            
            <button 
              onClick={() => setShowVerificationModal(false)}
              className="w-full bg-[#EF4423] text-white font-bold py-3.5 rounded-[12px] shadow-lg shadow-orange-500/30 hover:bg-[#d63f1c] hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              SUBMIT
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 flex justify-between items-center rounded-b-[24px] shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
              <Image src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" alt="Profile" width={44} height={44} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#EF4423]" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-[17px] font-extrabold text-[#1a1a2e] leading-tight">Hello {userName.split(' ')[0]},</h1>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Welcome to your dashboard</p>
          </div>
        </div>
        
        <button 
          onClick={() => router.push('/partner/notifications')}
          className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors"
        >
          <Bell className="w-6 h-6 text-[#1a1a2e]" strokeWidth={2} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#EF4423] rounded-full border-2 border-white"></span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-5 pt-6 flex-1 flex flex-col relative z-0">
        
        {/* Stats */}
        <div className="flex justify-between items-center px-4 mb-6">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-extrabold text-[#1a1a2e]">17</span>
            <span className="text-[12px] font-medium text-gray-400">Projects Done</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-extrabold text-[#1a1a2e]">92%</span>
            <span className="text-[12px] font-medium text-gray-400">Success Rate</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-full p-1 shadow-sm mb-6">
          <button 
            className={`flex-1 py-3 text-[13px] font-bold rounded-full transition-all duration-300 ${activeTab === 'active' ? 'bg-[#EF4423] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button 
            className={`flex-1 py-3 text-[13px] font-bold rounded-full transition-all duration-300 ${activeTab === 'completed' ? 'bg-[#EF4423] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        {/* Projects List */}
        <div className="flex flex-col gap-4 mb-8">
          {projectsToDisplay.map((project) => (
            <div key={project.id} className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 relative flex flex-col">
              <span className="absolute top-5 right-5 text-[10px] font-semibold text-gray-300">{project.timeAgo}</span>
              
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3 text-indigo-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col pr-4">
                  <h3 className="text-[17px] font-bold text-[#1a1a2e] leading-tight mb-0.5">{project.title}</h3>
                  <p className="text-[11px] font-medium text-gray-400">- {project.subtitle}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[11px] font-medium text-gray-400 mb-0.5">Budget</span>
                  <span className="text-[16px] font-extrabold text-[#EF4423] leading-none">₹{project.budget}</span>
                </div>
              </div>
              
              <div className="text-[11px] font-bold text-orange-400/90 mb-3 bg-orange-50 w-fit px-2 py-0.5 rounded-md">
                {project.dateRange}
              </div>
              
              <p className="text-[12px] text-gray-500 font-medium leading-relaxed mb-4">
                {project.description} <span className="text-[#EF4423] font-bold cursor-pointer hover:underline">Read more</span>
              </p>
              
              <div>
                {activeTab === 'active' ? (
                  <span className="inline-block bg-[#EF4423] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    {project.daysLeft} days left
                  </span>
                ) : (
                  <span className="inline-block bg-[#2ECC71] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Floating Banner */}
      <div className="w-full px-5 z-30 shrink-0 mt-auto pb-4">
        <div className="w-full max-w-[335px] mx-auto bg-[#EF4423] rounded-[18px] p-4 flex items-center justify-between shadow-xl relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col pointer-events-none">
            <span className="text-white/90 text-[11px] font-medium leading-none mb-1">Find More</span>
            <span className="text-white text-xl font-bold leading-none tracking-tight">campaigns</span>
          </div>
          <button onClick={() => router.push('/campaigns')} className="relative z-10 bg-[#D4E865] hover:bg-[#c2d655] text-gray-800 px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95">
            View
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
