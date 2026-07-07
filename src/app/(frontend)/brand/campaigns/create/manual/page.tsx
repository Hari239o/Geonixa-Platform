"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronDown, Wand2 } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"
import WalletCheckModal from "@/components/brand/WalletCheckModal"

export default function ManualCampaignCreatePage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Form, 2: Preview, 3: Visibility
  const [visibility, setVisibility] = useState("Public")
  const [showWalletModal, setShowWalletModal] = useState(false)
  
  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [deadline, setDeadline] = useState("")
  const [category, setCategory] = useState("Creators")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle: '- Brand Campaign',
          budget: '₹13k - ₹25k',
          dateRange: deadline,
          description: description || 'New campaign',
          daysLeft: 'Active',
          category,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
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
        <div className="pt-5 px-5 pb-4 shrink-0 bg-white z-20 flex items-center justify-between border-b border-gray-50">
          <button 
            onClick={() => {
              if (step > 1) setStep(step - 1)
              else router.back()
            }}
            className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4823] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          
          <h1 className="text-[#1E1B4B] font-extrabold text-[18px]">
            {step === 1 ? "Fill Details" : step === 2 ? "Preview Form" : "Select Visibility"}
          </h1>
          
          <button onClick={() => router.push("/brand/campaigns/create/ai")} className="w-10 h-10 flex items-center justify-center text-[#EF4823] hover:bg-orange-50 rounded-full transition-colors">
             <Wand2 className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 pb-32 touch-pan-y flex flex-col relative">
          
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-[12px] font-medium pl-1">Type</label>
                <div className="relative">
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FAFAFA] border-none outline-none rounded-[14px] py-4 px-5 text-gray-800 font-bold text-[14px] appearance-none cursor-pointer"
                  >
                    <option value="Creators">Creators</option>
                    <option value="Influencers">Influencers</option>
                    <option value="Agencies">Agencies</option>
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
                  placeholder="Social media, Beauty, etc"
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
                  placeholder="e.g. 04 September - 10 September"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-[#FAFAFA] border-none outline-none rounded-[14px] py-4 px-5 text-gray-800 font-medium text-[14px] placeholder:text-gray-300 placeholder:font-normal"
                />
              </div>

              {/* Budget Slider */}
              <div className="flex flex-col gap-1.5 mb-6 mt-4">
                <label className="text-gray-400 text-[12px] font-medium pl-1 mb-2">Budget</label>
                <div className="flex justify-between items-center px-1 mb-4">
                  <span className="text-gray-400 text-[10px] font-medium">Minimum</span>
                  <span className="text-gray-400 text-[10px] font-medium">Maximum</span>
                </div>
                <div className="relative w-full h-1 bg-gray-200 rounded-full mx-1">
                  <div className="absolute left-[30%] right-[20%] h-full bg-[#EF4823] rounded-full"></div>
                  <div className="absolute left-[30%] -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-4 h-4 bg-white border-2 border-[#EF4823] rounded-full shadow-sm"></div>
                    <span className="text-[#1E1B4B] font-bold text-[11px] mt-2">₹13k</span>
                  </div>
                  <div className="absolute right-[20%] translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-4 h-4 bg-white border-2 border-[#EF4823] rounded-full shadow-sm"></div>
                    <span className="text-[#1E1B4B] font-bold text-[11px] mt-2">₹25k</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)} 
                disabled={!title}
                className="w-full bg-[#EF4823] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors mt-2 disabled:opacity-50"
              >
                NEXT: PREVIEW FORM
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-[#FAFAFA] rounded-[24px] p-6 border border-gray-100 flex flex-col gap-6">
                <div>
                  <h3 className="font-extrabold text-[20px] text-gray-900 mb-2">{title || "Untitled Campaign"}</h3>
                  <p className="text-gray-500 text-[13px] leading-relaxed">{description || "No description provided."}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1">
                     <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wide">Category</span>
                     <span className="text-gray-800 font-bold text-[14px]">{category}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wide">Budget</span>
                     <span className="text-[#EF4823] font-bold text-[14px]">₹13k - ₹25k</span>
                   </div>
                   <div className="flex flex-col gap-1 col-span-2">
                     <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wide">Timeline</span>
                     <span className="text-gray-800 font-bold text-[14px]">{deadline || "Not specified"}</span>
                   </div>
                   {tags && (
                     <div className="flex flex-col gap-1 col-span-2">
                       <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wide">Tags</span>
                       <div className="flex flex-wrap gap-2 mt-1">
                         {tags.split(',').map((t, i) => (
                           <span key={i} className="bg-white border border-gray-200 text-gray-600 text-[11px] px-3 py-1 rounded-full">{t.trim()}</span>
                         ))}
                       </div>
                     </div>
                   )}
                </div>
              </div>

              <button 
                onClick={() => setStep(3)} 
                className="w-full bg-[#1E1B4B] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:opacity-90 transition-colors mt-2"
              >
                LOOKS GOOD, CONTINUE
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-gray-500 text-[14px] mb-2 text-center">Who should be able to see and apply for this campaign?</p>
              
              <div 
                onClick={() => setVisibility("Public")}
                className={`p-5 rounded-[20px] border-2 cursor-pointer transition-all ${visibility === 'Public' ? 'border-[#EF4823] bg-[#EF4823]/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}
              >
                <h4 className={`font-bold text-[16px] mb-1 ${visibility === 'Public' ? 'text-[#EF4823]' : 'text-gray-800'}`}>Public Campaign</h4>
                <p className="text-gray-500 text-[12px] leading-relaxed">Your campaign will be listed on the discovery page. Any eligible creator can view details and submit an application.</p>
              </div>

              <div 
                onClick={() => setVisibility("Private")}
                className={`p-5 rounded-[20px] border-2 cursor-pointer transition-all ${visibility === 'Private' ? 'border-[#1E1B4B] bg-[#1E1B4B]/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}
              >
                <h4 className={`font-bold text-[16px] mb-1 ${visibility === 'Private' ? 'text-[#1E1B4B]' : 'text-gray-800'}`}>Private Campaign</h4>
                <p className="text-gray-500 text-[12px] leading-relaxed">Your campaign will be hidden. You will manually invite specific creators to view and apply for this campaign.</p>
              </div>

              <button 
                onClick={() => setShowWalletModal(true)} 
                disabled={isSubmitting}
                className="w-full bg-[#EF4823] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors mt-6 disabled:opacity-50 relative overflow-hidden"
              >
                CONTINUE TO PUBLISH
              </button>
            </div>
          )}

        </div>
        
        <WalletCheckModal 
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onProceed={() => {
             setShowWalletModal(false);
             handleSubmit();
          }}
          budget="₹13k - ₹25k"
        />

        <BottomNav />
      </div>
    </div>
  )
}
