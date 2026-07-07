"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronDown, SendHorizontal, Loader2, Wand2 } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"

export default function AICampaignCreatePage() {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0: AI Chat, 1: Form, 2: Select Creators, 3: Wallet
  const [visibility, setVisibility] = useState("Private")
  
  // Wallet State
  const [walletAmount, setWalletAmount] = useState("")
  const [balance, setBalance] = useState(5000)
  const requiredAmount = 13000
  
  // AI State
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [deadline, setDeadline] = useState("")
  const [category, setCategory] = useState("Creators")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [minBudget, setMinBudget] = useState(13)
  const [maxBudget, setMaxBudget] = useState(25)
  const [creators, setCreators] = useState<any[]>([])
  const [selectedCreators, setSelectedCreators] = useState<string[]>([])
  
  // Fetch creators when step becomes 2
  React.useEffect(() => {
    if (step === 2 && creators.length === 0) {
      fetch('/api/creators')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.creators) {
             setCreators(data.creators)
          }
        })
        .catch(console.error)
    }
  }, [step])

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
      setStep(1)
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
          budget: `₹${minBudget}k - ₹${maxBudget}k`,
          dateRange: deadline,
          description: description || 'New campaign',
          daysLeft: 'Active',
          category,
          visibility,
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
        <div className="pt-5 px-5 pb-4 shrink-0 bg-white z-20 flex items-center justify-between">
          <button 
            onClick={() => {
              if (step > 0) setStep(step - 1)
              else router.back()
            }}
            className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4823] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          
          <h1 className="text-[#1E1B4B] font-extrabold text-[18px]">
            {step === 0 ? "Create Campaign" : step === 1 ? "Add Campaign" : step === 2 ? "Select Creators" : "Wallet"}
          </h1>
          
          <div className="w-10 h-10"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-2 pb-32 touch-pan-y flex flex-col relative">
          
          {step === 0 && (
            <div className="flex flex-col h-full animate-in fade-in duration-300 relative">
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
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Visibility Tabs */}
              <div className="flex bg-gray-50 rounded-[12px] p-1 mb-2">
                {["Private", "Public"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setVisibility(tab)}
                    className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-colors ${
                      visibility === tab 
                      ? "bg-[#EF4823] text-white shadow-sm" 
                      : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

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

              {/* Budget Slider */}
              <div className="flex flex-col gap-1.5 mb-6 mt-4">
                <label className="text-gray-400 text-[12px] font-medium pl-1 mb-2">Budget (in ₹k)</label>
                <div className="flex justify-between items-center px-1 mb-2">
                  <span className="text-gray-400 text-[10px] font-medium">Minimum</span>
                  <span className="text-gray-400 text-[10px] font-medium">Maximum</span>
                </div>
                <div className="flex gap-4">
                  <input 
                    type="number" 
                    value={minBudget}
                    onChange={(e) => setMinBudget(Number(e.target.value))}
                    className="w-full bg-[#FAFAFA] border-none outline-none rounded-[14px] py-3 px-5 text-[#EF4823] font-bold text-[14px]"
                  />
                  <input 
                    type="number" 
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full bg-[#FAFAFA] border-none outline-none rounded-[14px] py-3 px-5 text-[#EF4823] font-bold text-[14px]"
                  />
                </div>
                <div className="relative w-full h-1 bg-gray-200 rounded-full mx-1 mt-4">
                  <div className="absolute left-0 right-0 h-full bg-[#EF4823] rounded-full"></div>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)} 
                disabled={!title}
                className="w-full bg-[#EF4823] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors mt-2 disabled:opacity-50"
              >
                FIND CREATORS
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {creators.length === 0 ? (
                <div className="text-center text-gray-400 py-10">Loading creators...</div>
              ) : creators.map((creator) => (
                <div 
                  key={creator.id} 
                  onClick={() => {
                    if (selectedCreators.includes(creator.id)) {
                       setSelectedCreators(selectedCreators.filter(id => id !== creator.id))
                    } else {
                       setSelectedCreators([...selectedCreators, creator.id])
                    }
                  }}
                  className={`bg-white rounded-[20px] p-4 border shadow-sm relative cursor-pointer transition-colors ${selectedCreators.includes(creator.id) ? 'border-[#EF4823] bg-orange-50/10' : 'border-gray-100'}`}
                >
                  {selectedCreators.includes(creator.id) && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 border-[#EF4823] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#EF4823]"></div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0">
                      <img src={creator.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.fullName || creator.user?.name || 'Creator')}`} alt="Creator" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col flex-1 truncate">
                      <span className="font-bold text-gray-900 text-[15px] truncate">{creator.fullName || creator.user?.name || 'Creator'}</span>
                      <div className="flex gap-2 mt-1 overflow-x-auto no-scrollbar">
                        {(creator.tags && creator.tags.length > 0 ? creator.tags : ['Fashion', 'Lifestyle']).slice(0, 2).map((t: string) => (
                          <span key={t} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-2 py-3 bg-[#FAFAFA] rounded-[12px] border border-gray-100">
                    <div className="flex flex-col items-center">
                      <span className="text-[#EF4823] font-bold text-[14px]">{creator.followers || '0'}</span>
                      <span className="text-gray-400 text-[10px] font-medium">Followers</span>
                    </div>
                    <div className="w-[1px] h-6 bg-gray-200"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-[#EF4823] font-bold text-[14px]">{creator.viewership || '0'}</span>
                      <span className="text-gray-400 text-[10px] font-medium">Avg View</span>
                    </div>
                    <div className="w-[1px] h-6 bg-gray-200"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-[#EF4823] font-bold text-[14px]">{creator.engagement || '0'}</span>
                      <span className="text-gray-400 text-[10px] font-medium">Avg Eng</span>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => setStep(3)} 
                className="w-full bg-[#EF4823] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors mt-4"
              >
                NEXT
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center pt-8 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center w-full">
                <p className="text-gray-500 text-[14px] font-medium mb-1">Enter your amount</p>
                <p className="text-red-500 text-[11px] font-bold mb-4 uppercase">INSUFFICIENT FUNDS</p>
                
                <div className="bg-[#FAFAFA] border border-[#EF4823] rounded-[16px] py-4 px-6 w-full text-left relative shadow-sm">
                  <span className="text-gray-900 font-bold text-[24px]">₹</span>
                  <input 
                    type="number" 
                    value={walletAmount}
                    onChange={e => setWalletAmount(e.target.value)}
                    placeholder="5000"
                    className="bg-transparent border-none outline-none font-bold text-[24px] text-gray-900 ml-1 placeholder:text-gray-300 w-[150px]"
                  />
                </div>
                
                <p className="text-gray-400 text-[13px] font-medium mt-4 text-left px-2">Net Balance : ₹{balance}</p>
              </div>

              {balance >= requiredAmount ? (
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="w-full bg-[#EF4823] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors mt-6 disabled:opacity-50"
                >
                  {isSubmitting ? "PUBLISHING..." : "PUBLISH"}
                </button>
              ) : (
                <button 
                  onClick={() => setBalance(balance + 10000)} 
                  className="w-full bg-[#EF4823] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors mt-6"
                >
                  ADD MONEY
                </button>
              )}
            </div>
          )}

        </div>
        
        <BottomNav />
      </div>
    </div>
  )
}
