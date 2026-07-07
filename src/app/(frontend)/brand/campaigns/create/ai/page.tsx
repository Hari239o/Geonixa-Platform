"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, SendHorizontal, Loader2 } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"
import WalletCheckModal from "@/components/brand/WalletCheckModal"

export default function AICampaignCreatePage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: AI Prompt, 2: Preview, 3: Visibility
  const [visibility, setVisibility] = useState("Public")
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Simulated Form State
  const [prompt, setPrompt] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [deadline, setDeadline] = useState("")
  const [category, setCategory] = useState("Creators")

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setTitle("Glow Up Skincare Routine")
      setDescription("We are looking for authentic creators to showcase their morning routine using our new Vitamin C serum.")
      setTags("Skincare, Beauty, MorningRoutine")
      setDeadline("20 Oct - 30 Oct 2025")
      setCategory("Creators")
      setIsGenerating(false)
      setStep(2)
    }, 2000)
  }

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
        router.push('/brand/campaigns');
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
            {step === 1 ? "Create with AI" : step === 2 ? "Preview Form" : "Select Visibility"}
          </h1>
          
          <div className="w-10 h-10"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-5 py-6 pb-32 flex flex-col relative overflow-y-auto no-scrollbar">
          
          {step === 1 && (
            <>
              {/* Centered Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
                <div 
                  className="w-[180px] h-[60px] bg-[#EF4823]"
                  style={{
                    WebkitMaskImage: 'url(/kalinq-company-name-profile.png)',
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskImage: 'url(/kalinq-company-name-profile.png)',
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center'
                  }}
                />
              </div>

              {/* Bottom Chat Section */}
              <div className="mt-auto flex flex-col relative z-10 pb-4">
                
                <h2 className="text-gray-800 font-extrabold text-[18px] text-center mb-6">What can I help with?</h2>
                
                {/* Pills */}
                <div className="flex justify-center gap-3 mb-6">
                  {["Brief", "Budget", "Creators"].map(pill => (
                    <button key={pill} onClick={() => setPrompt(`Create a campaign focused on ${pill}`)} className="px-5 py-2 rounded-full border border-gray-200 text-gray-500 text-[11px] font-bold hover:bg-gray-50 transition-colors bg-white">
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <div className="w-full bg-white border border-gray-200 rounded-[18px] flex items-center p-2 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                  <input 
                    type="text" 
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                    disabled={isGenerating}
                    placeholder="Send a message."
                    className="flex-1 bg-transparent border-none outline-none text-[13px] text-gray-700 font-medium px-3 placeholder:text-gray-400 disabled:opacity-50"
                  />
                  <button onClick={handleGenerate} disabled={isGenerating || !prompt} className="w-10 h-10 flex items-center justify-center text-[#EF4823] hover:bg-orange-50 rounded-xl transition-colors shrink-0 disabled:opacity-50">
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal className="w-5 h-5" strokeWidth={2.5} />}
                  </button>
                </div>

              </div>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300 h-full">
              <div className="bg-[#FAFAFA] rounded-[24px] p-6 border border-gray-100 flex flex-col gap-6">
                <div>
                  <h3 className="font-extrabold text-[20px] text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-[13px] leading-relaxed">{description}</p>
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
                     <span className="text-gray-800 font-bold text-[14px]">{deadline}</span>
                   </div>
                   <div className="flex flex-col gap-1 col-span-2">
                     <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wide">Tags</span>
                     <div className="flex flex-wrap gap-2 mt-1">
                       {tags.split(',').map((t, i) => (
                         <span key={i} className="bg-white border border-gray-200 text-gray-600 text-[11px] px-3 py-1 rounded-full">{t.trim()}</span>
                       ))}
                     </div>
                   </div>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <button 
                  onClick={() => setStep(3)} 
                  className="w-full bg-[#1E1B4B] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:opacity-90 transition-colors"
                >
                  LOOKS GOOD, CONTINUE
                </button>
              </div>
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
