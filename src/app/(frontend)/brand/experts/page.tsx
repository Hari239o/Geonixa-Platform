"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"
import { Logo } from "@/components/ui/Logo"

// SVG for Verified Badge
const VerifiedBadge = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4823" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export default function ExpertsPartnersPage() {
  const router = useRouter()

  // State Machine
  const [mainTab, setMainTab] = useState<"experts" | "partners">("experts")
  const [roleTab, setRoleTab] = useState<"cameraman" | "editors">("cameraman")
  const [typeTab, setTypeTab] = useState<"instant" | "schedule">("instant")
  
  // view: "main" (shows tabs), "editorsForm", "amount"
  const [view, setView] = useState<"main" | "editorsForm" | "amount">("main")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const handleBookNow = () => {
    if (mainTab === "partners" && roleTab === "editors") {
      setView("editorsForm")
    } else {
      setView("amount")
    }
  }

  const renderContent = () => {
    // 1. AMOUNT SCREEN
    if (view === "amount") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center px-8 relative h-full">
          <div className="absolute top-0 left-5">
            <button 
              onClick={() => setView("main")}
              className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4823] hover:opacity-80 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>
          <h2 className="text-[#1E1B4B] text-[22px] font-extrabold mb-1">
            {roleTab === "editors" ? "Editor" : "Partners"}
          </h2>
          <p className="text-gray-400 text-[13px] font-medium mb-12">Enter your amount</p>
          
          <div className="w-full relative mb-12">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
            <input 
              type="text" 
              defaultValue="8000"
              className="w-full bg-[#FAFAFA] border-none outline-none rounded-[16px] py-4 pl-8 pr-5 text-gray-800 font-extrabold text-[15px]"
            />
          </div>
          
          <p className="text-gray-400 text-[11px] font-medium mb-8">Your balance : ₹10950</p>
          
          <button className="w-full bg-[#EF4823] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors">
            BOOK NOW
          </button>
        </div>
      )
    }

    // 2. EDITORS FORM SCREEN
    if (view === "editorsForm") {
      return (
        <div className="flex-1 px-5 pt-4 flex flex-col gap-6 relative h-full">
          <div className="absolute top-2 left-5 z-20">
            <button 
              onClick={() => setView("main")}
              className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4823] hover:opacity-80 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>
          <div className="text-center mb-4 mt-12">
            <h2 className="text-[#1E1B4B] text-[20px] font-extrabold">Editors form</h2>
            <p className="text-gray-400 text-[12px] font-medium mt-1">Please provide the details</p>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-[11px] font-medium pl-1">Instructions</label>
            <textarea 
              placeholder="sdbrfdhbdr\nfgv"
              rows={4}
              className="w-full bg-[#FAFAFA] border-none outline-none rounded-[16px] py-4 px-5 text-gray-800 font-medium text-[13px] resize-none"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-[11px] font-medium pl-1">Reference links</label>
            <input 
              type="text" 
              placeholder="https://"
              className="w-full bg-[#FAFAFA] border-none outline-none rounded-[16px] py-4 px-5 text-gray-800 font-medium text-[13px]"
            />
          </div>

          <div className="w-full relative">
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="Upload Files"
            />
            <div className="w-full border-2 border-dashed border-orange-200 bg-orange-50/50 rounded-[16px] py-8 flex flex-col items-center justify-center transition-colors">
              <span className="text-[#EF4823] text-[13px] font-bold flex items-center gap-2">
                <span className="text-xl leading-none">+</span> Upload Files
              </span>
              {uploadedFiles.length > 0 && (
                <div className="mt-4 flex flex-col gap-1 items-center">
                  {uploadedFiles.map((file, i) => (
                    <span key={i} className="text-[11px] text-gray-500 font-medium truncate max-w-[200px]">
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => setView("amount")}
            className="w-full bg-[#EF4823] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors mt-auto mb-32"
          >
            NEXT
          </button>
        </div>
      )
    }

    // 3. OUR EXPERTS CONTENT (Simple view)
    if (mainTab === "experts") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center pb-32 w-full max-w-sm mx-auto">
          <h2 className="text-[#1E1B4B] text-[22px] font-extrabold mb-1 tracking-tight">
            Speak to our experts
          </h2>
          <p className="text-gray-400 text-[13px] font-medium mb-8">Call us now or whatsapp us</p>
          
          <h1 className="text-[#8e959f] font-extrabold text-[28px] tracking-wide mb-10">
            +91 000 000 0000
          </h1>
          
          <button className="w-full max-w-sm bg-[#EF4823] text-white font-bold text-[14px] tracking-widest uppercase py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors">
            Call Now
          </button>
        </div>
      )
    }

    // 4. PARTNERS CONTENT (Complex view)
    if (mainTab === "partners") {
      return (
        <div className="flex-1 flex flex-col overflow-hidden w-full max-w-sm mx-auto">
          <div className="px-5 flex flex-col gap-4 mt-4 shrink-0">
            {/* Secondary Tabs */}
            <div className="flex bg-white rounded-[14px] p-1 border border-gray-50 shadow-sm">
              <button 
                onClick={() => setRoleTab("cameraman")}
                className={`flex-1 py-3 rounded-[12px] text-[13px] font-extrabold transition-colors ${roleTab === "cameraman" ? "bg-[#EF4823] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                Cameraman
              </button>
              <button 
                onClick={() => setRoleTab("editors")}
                className={`flex-1 py-3 rounded-[12px] text-[13px] font-extrabold transition-colors ${roleTab === "editors" ? "bg-[#EF4823] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                Editors
              </button>
            </div>

            {/* Tertiary Tabs */}
            {roleTab === "cameraman" && (
              <div className="flex bg-white rounded-[14px] p-1 border border-gray-50 shadow-sm">
                <button 
                  onClick={() => setTypeTab("instant")}
                  className={`flex-1 py-3 rounded-[12px] text-[13px] font-extrabold transition-colors ${typeTab === "instant" ? "bg-[#EF4823] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  Instant
                </button>
                <button 
                  onClick={() => setTypeTab("schedule")}
                  className={`flex-1 py-3 rounded-[12px] text-[13px] font-extrabold transition-colors ${typeTab === "schedule" ? "bg-[#EF4823] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  Schedule
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-32">
            {roleTab === "editors" || typeTab === "instant" ? (
              <div className="flex flex-col gap-4">
                {[1, 2].map(i => (
                  <div key={i} className={`bg-white rounded-[16px] p-4 flex gap-4 items-center shadow-sm border ${i === 1 ? 'border-[#EF4823]' : 'border-gray-50'}`}>
                    <div className="w-16 h-16 rounded-[12px] bg-gray-200 overflow-hidden shrink-0">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" alt="Dummy" className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="text-[16px] font-extrabold text-gray-700">Lorem Ipsum</h3>
                        <VerifiedBadge />
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(s => <span key={s} className="text-yellow-400 text-[14px]">★</span>)}
                        <span className="text-gray-300 text-[14px]">★</span>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-gray-300">
                      {i === 1 && <div className="w-2.5 h-2.5 bg-[#EF4823] rounded-full" />}
                    </div>
                  </div>
                ))}
                <button 
                  onClick={handleBookNow}
                  className="w-full bg-[#EF4823] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors mt-4"
                >
                  {roleTab === "editors" ? "NEXT" : "BOOK NOW"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-[11px] font-medium pl-1">Hours</label>
                  <input 
                    type="text" 
                    defaultValue="2 hours"
                    className="w-full bg-[#FAFAFA] border-none outline-none rounded-[16px] py-4 px-5 text-gray-800 font-medium text-[13px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-[11px] font-medium pl-1">Date</label>
                  <input 
                    type="text" 
                    defaultValue="04/09/2025"
                    className="w-full bg-[#FAFAFA] border-none outline-none rounded-[16px] py-4 px-5 text-gray-800 font-medium text-[13px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 text-[11px] font-medium pl-1">Time</label>
                  <input 
                    type="text" 
                    defaultValue="2:00pm"
                    className="w-full bg-[#FAFAFA] border-none outline-none rounded-[16px] py-4 px-5 text-gray-800 font-medium text-[13px]"
                  />
                </div>
                <button 
                  onClick={handleBookNow}
                  className="w-full bg-[#EF4823] text-white font-bold text-[14px] tracking-wide py-4 rounded-[14px] shadow-sm hover:bg-[#e03d1b] transition-colors mt-6"
                >
                  BOOK NOW
                </button>
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="h-[100dvh] bg-white font-sans flex justify-center overflow-hidden w-full">
      <div className="w-full bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Only show header if in 'main' view */}
        {view === "main" && (
          <div className="pt-6 px-5 pb-8 shrink-0 bg-white z-20 flex items-center justify-center">
            <Logo showText={true} />
          </div>
        )}

        {/* Dynamic Content */}
        <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
          
          {/* Primary Tabs - Only visible in main view */}
          {view === "main" && (
            <div className="flex bg-white rounded-[14px] p-1 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-50 mb-2 shrink-0 mx-auto w-full max-w-sm">
              <button 
                onClick={() => setMainTab("experts")}
                className={`flex-1 py-3.5 rounded-[12px] text-[13px] font-extrabold transition-colors ${mainTab === "experts" ? "bg-[#EF4823] text-white shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
              >
                Our Experts
              </button>
              <button 
                onClick={() => setMainTab("partners")}
                className={`flex-1 py-3.5 rounded-[12px] text-[13px] font-extrabold transition-colors ${mainTab === "partners" ? "bg-[#EF4823] text-white shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
              >
                Partners
              </button>
            </div>
          )}

          {renderContent()}

        </div>
        
        {/* Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  )
}
