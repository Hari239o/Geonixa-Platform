"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronDown, Wand2 } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

export default function ManualCampaignCreatePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("Private")
  
  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [deadline, setDeadline] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId') || 'temp-brand-id',
          title,
          subtitle: '- Brand Campaign',
          budget: '₹13k - ₹25k',
          dateRange: deadline,
          description: description || 'New campaign',
          daysLeft: 'Active'
        })
      });
      
      const data = await res.json();
      if (data.success) {
        router.push('/brand');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="h-full bg-white font-sans flex justify-center overflow-hidden">
      <div className="w-full w-full bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="pt-5 px-5 pb-4 shrink-0 bg-white z-20 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4823] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          
          <h1 className="text-[#1E1B4B] font-extrabold text-[18px]">Add Campaign</h1>
          
          <button onClick={() => router.push("/brand/campaigns/create/ai")} className="w-10 h-10 flex items-center justify-center text-[#EF4823] hover:bg-orange-50 rounded-full transition-colors">
             <Wand2 className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32 touch-pan-y flex flex-col relative">
          
          {/* Tabs */}
          <div className="flex bg-gray-50 rounded-[12px] p-1 mb-6 mt-2">
            {["Private", "Public"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-colors ${
                  activeTab === tab 
                  ? "bg-[#EF4823] text-white shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="flex flex-col gap-5">
            
            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-[12px] font-medium pl-1">Type</label>
              <div className="relative">
                <select className="w-full bg-[#FAFAFA] border-none outline-none rounded-[14px] py-4 px-5 text-gray-800 font-bold text-[14px] appearance-none cursor-pointer">
                  <option>Creators</option>
                  <option>Influencers</option>
                  <option>Agencies</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-[12px] font-medium pl-1">Title</label>
              <input 
                type="text" 
                placeholder="Enter gig title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#FAFAFA] border-none outline-none rounded-[14px] py-4 px-5 text-gray-800 font-medium text-[14px] placeholder:text-gray-300 placeholder:font-normal"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-[12px] font-medium pl-1">Description</label>
              <textarea 
                placeholder="Enter gig description"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-[#FAFAFA] border-none outline-none rounded-[14px] py-4 px-5 text-gray-800 font-medium text-[14px] placeholder:text-gray-300 placeholder:font-normal resize-none"
              />
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-[12px] font-medium pl-1">Tags</label>
              <input 
                type="text" 
                placeholder="Social media"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full bg-[#FAFAFA] border-none outline-none rounded-[14px] py-4 px-5 text-gray-800 font-medium text-[14px] placeholder:text-gray-300 placeholder:font-normal"
              />
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-[12px] font-medium pl-1">Deadline</label>
              <input 
                type="text" 
                placeholder="Enter the deadline"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-[#FAFAFA] border-none outline-none rounded-[14px] py-4 px-5 text-gray-800 font-medium text-[14px] placeholder:text-gray-300 placeholder:font-normal"
              />
            </div>

            {/* Budget */}
            <div className="flex flex-col gap-1.5 mb-6">
              <label className="text-gray-400 text-[12px] font-medium pl-1 mb-2">Budget</label>
              
              <div className="flex justify-between items-center px-1 mb-4">
                <span className="text-gray-400 text-[10px] font-medium">Minimum</span>
                <span className="text-gray-400 text-[10px] font-medium">Maximum</span>
              </div>
              
              {/* Custom Slider UI to match mockup */}
              <div className="relative w-full h-1 bg-gray-200 rounded-full mx-1">
                {/* Active track */}
                <div className="absolute left-[30%] right-[20%] h-full bg-[#EF4823] rounded-full"></div>
                
                {/* Min Handle */}
                <div className="absolute left-[30%] -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-4 h-4 bg-white border-2 border-[#EF4823] rounded-full shadow-sm"></div>
                  <span className="text-[#1E1B4B] font-bold text-[11px] mt-2">₹13k</span>
                </div>
                
                {/* Max Handle */}
                <div className="absolute right-[20%] translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-4 h-4 bg-white border-2 border-[#EF4823] rounded-full shadow-sm"></div>
                  <span className="text-[#1E1B4B] font-bold text-[11px] mt-2">₹25k</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full bg-[#EF4823] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors mt-2 disabled:opacity-50"
            >
              {isSubmitting ? "CREATING..." : "CREATE CAMPAIGN"}
            </button>

          </div>
        </div>
        
        <BottomNav />
      </div>
    </div>
  )
}
