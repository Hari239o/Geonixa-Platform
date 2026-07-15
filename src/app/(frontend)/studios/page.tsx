"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/brand/BottomNav";
import { Logo } from "@/components/ui/Logo";
import { ChevronLeft, X } from "lucide-react";

export default function StudiosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // High-level Tabs
  const [mainTab, setMainTab] = useState("Partners"); // "Our Experts" | "Partners"
  
  // Partner Settings
  const [partnerType, setPartnerType] = useState("Cameraman"); // "Cameraman" | "Editors"
  const [bookingMode, setBookingMode] = useState("Instant"); // "Instant" | "Schedule"
  
  // Step Management
  // step 1: Select Partner List (or "Our Experts" screen)
  // step 2: Schedule Form (Cameraman->Schedule) or Editor Form (Editors)
  // step 3: Enter Amount (Quote)
  const [step, setStep] = useState(1);
  
  // Data
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [showPartnerSheet, setShowPartnerSheet] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if partner or creator
    if (status === "authenticated" && session?.user) {
      const userRole = (session.user as any).role;
      if (userRole === "partner") {
        router.replace("/partner");
        return;
      } else if (userRole === "creator") {
        router.replace("/creator");
        return;
      }
    }
  }, [status, session, router]);

  // Form States
  const [quoteAmount, setQuoteAmount] = useState("");
  
  // Schedule Form
  const [scheduleHours, setScheduleHours] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Editor Form
  const [editorInstructions, setEditorInstructions] = useState("");
  const [editorReference, setEditorReference] = useState("");

  // Data
  const [jobs, setJobs] = useState<any[]>([]);

  // Mock data
  const mockPartners = [
    { id: "1", name: "Vikram Studio", isVerified: true, rating: 4, reviews: 10, type: "Cameraman", image: "/placeholder-user.jpg" },
    { id: "2", name: "Kiran Edits", isVerified: true, rating: 5, reviews: 20, type: "Cameraman", image: "/placeholder-user.jpg" },
  ];

  useEffect(() => {
    async function fetchPartners() {
      setIsLoading(true);
      if (bookingMode === "Work Schedule") {
        try {
          const res = await fetch("/api/studios/jobs?role=brand");
          const data = await res.json();
          if (data.success && data.jobs) {
            setJobs(data.jobs);
          } else {
            setJobs([]);
          }
        } catch (e) {
          setJobs([]);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        const isInstantParam = bookingMode === "Instant" ? "&isInstantAvailable=true" : "";
        const res = await fetch(`/api/studios/partners?type=${partnerType}${isInstantParam}`);
        const data = await res.json();
        if (data.success) {
          setPartners(data.partners);
        } else {
          setPartners([]);
        }
      } catch (e) {
        setPartners([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPartners();
  }, [partnerType, bookingMode]);

  // Reset steps when changing main tabs
  useEffect(() => {
    setStep(1);
    setSelectedPartnerId(null);
  }, [mainTab, partnerType, bookingMode]);

  const handleNextOrBook = async () => {
    if (mainTab === "Our Experts") {
      // Just a CTA button for "Our Experts"
      window.location.href = "tel:+910000000000";
      return;
    }

    if (step === 1) {
      if (partnerType === "Cameraman" && bookingMode === "Schedule") {
        if (!scheduleHours || !scheduleDate || !scheduleTime) {
          alert("Please fill in all schedule details.");
          return;
        }
        
        setIsLoading(true);
        try {
          const res = await fetch("/api/studios/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              partnerType,
              date: scheduleDate,
              timeSlot: scheduleTime,
              duration: scheduleHours,
            })
          });
          const data = await res.json();
          if (data.success) {
            alert("Job posted successfully! Cameramen will apply to your job soon. Check 'My Posted Jobs' in your dashboard.");
            // Reset form
            setScheduleHours("");
            setScheduleDate("");
            setScheduleTime("");
            router.push("/brand/profile?tab=jobs");
          } else {
            alert("Failed to post job.");
          }
        } catch (e) {
          alert("Error posting job.");
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (!selectedPartnerId) {
        alert("Please select a partner first!");
        return;
      }
      
      if (partnerType === "Cameraman" && bookingMode === "Instant") {
        // Skip step 2, go straight to budget
        setStep(3);
      } else {
        // Go to schedule form or editor form
        setStep(2);
      }
    } else if (step === 2) {
      // Validate form
      if (partnerType === "Editors") {
        if (!editorInstructions || !editorReference) {
          alert("Please fill in editor details.");
          return;
        }
      }
      // Proceed to budget
      setStep(3);
    } else if (step === 3) {
      // Final Submit
      if (!quoteAmount) {
        alert("Please enter an amount.");
        return;
      }

      try {
        const res = await fetch('/api/studios/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerId: selectedPartnerId || "unassigned-schedule-booking",
            bookingMode,
            quoteAmount,
            // Pass extra details if they exist
            ...(partnerType === "Cameraman" && bookingMode === "Schedule" && {
              scheduleHours, scheduleDate, scheduleTime
            }),
            ...(partnerType === "Editors" && {
              editorInstructions, editorReference
            })
          })
        });
        const data = await res.json();
        if (data.success) {
          alert("Booking requested successfully!");
          // Reset
          setStep(1);
          setQuoteAmount("");
          setSelectedPartnerId(null);
          // router.push to tracking page in real app
        } else {
          alert("Failed to create booking: " + data.error);
        }
      } catch (e) {
        alert("Error initiating booking.");
      }
    }
  };

  const handleDeleteJob = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this work schedule?")) {
      try {
        const res = await fetch(`/api/studios/jobs/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          alert("Work schedule deleted successfully");
          fetchJobs();
        } else {
          alert(data.error || "Failed to delete work schedule");
        }
      } catch (err) {
        alert("Error deleting work schedule");
      }
    }
  };

  const renderOurExperts = () => (
    <div className="flex flex-col items-center justify-center pt-20 pb-10 text-center">
      <h2 className="text-xl font-bold mb-2">Speak to our experts</h2>
      <p className="text-sm text-gray-500 mb-6">Call us now or WhatsApp on</p>
      <p className="text-2xl font-bold text-gray-800 mb-10 tracking-wider">+91 000 000 0000</p>
      <button 
        onClick={() => window.location.href = "tel:+910000000000"}
        className="w-full bg-[#EF4423] text-white font-bold h-12 rounded-[14px]"
      >
        CALL NOW
      </button>
    </div>
  );

  const renderList = () => {
    if (bookingMode === "Work Schedule") {
      return (
        <div className="flex flex-col gap-4 mt-4 pb-20">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-[24px] p-8 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <h3 className="text-[15px] font-bold text-gray-800 mb-1">No Jobs Posted</h3>
              <p className="text-[13px] text-gray-500 font-medium">When you schedule a partner, it will appear here.</p>
            </div>
          ) : (
            jobs.map(job => (
              <div 
                key={job.id} 
                onClick={() => router.push(`/brand/jobs/${job.id}`)}
                className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-50 cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900">{job.partnerType}</h3>
                    <p className="text-[12px] text-gray-500 font-medium mt-0.5">{job.date} • {job.timeSlot}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleDeleteJob(e, job.id)}
                      className="p-1.5 text-red-500 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      title="Delete Work Schedule"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                      job.status === 'open' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-gray-50 w-full"></div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-gray-700">Applicants</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-extrabold text-[#EF4423]">
                      {job.applications?.length || 0}
                    </span>
                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    const filteredPartners = partners;

    if (filteredPartners.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center pt-10 pb-10 text-center">
          <p className="text-sm text-gray-500">No partners available for this mode.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 mt-4">
        {filteredPartners.map((partner) => {
          const isSelected = selectedPartnerId === partner.id;
          return (
            <div 
              key={partner.id}
              onClick={() => {
                setSelectedPartnerId(partner.id);
                setSelectedPartner(partner);
                setSelectedSlot(null);
                setSelectedScheduleDate("");
                setShowPartnerSheet(true);
              }}
              className={`flex items-center justify-between p-3 rounded-[16px] transition-all cursor-pointer border border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#EF4423]`}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-[60px] h-[60px] bg-gradient-to-br from-[#E2E8F0] to-[#94A3B8] rounded-[12px] flex-shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${partner.image})` }}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] font-bold text-[#111111]">{partner.name}</span>
                    {partner.isVerified && (
                      <div className="w-3.5 h-3.5 bg-[#EF4423] text-white flex items-center justify-center rounded-sm mask mask-hexagon" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2 h-2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg 
                        key={star} 
                        className={`w-3.5 h-3.5 ${star <= Math.floor(partner.rating) ? 'text-[#FFD700]' : 'text-gray-200'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition-colors ${
                isSelected ? "border-[#EF4423]" : "border-gray-300"
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#EF4423]" />}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderScheduleForm = () => (
    <div className="mt-8 space-y-5">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Hours</label>
        <div className="relative">
          <input 
            type="text" 
            placeholder="0 Hours"
            value={scheduleHours}
            onChange={(e) => setScheduleHours(e.target.value)}
            className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#EF4423] text-sm"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Date</label>
        <div className="relative">
          <input 
            type="date" 
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#EF4423] text-sm bg-transparent"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Time</label>
        <div className="relative">
          <input 
            type="time" 
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#EF4423] text-sm bg-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderEditorForm = () => (
    <div className="mt-6 flex flex-col items-center">
      <h3 className="font-bold text-lg mb-1">Editors form</h3>
      <p className="text-xs text-gray-400 mb-6">Please provide the details</p>

      <div className="w-full space-y-6">
        <div>
          <label className="text-xs font-semibold text-gray-800 mb-2 block">Instructions</label>
          <textarea
            placeholder="enter details here..."
            value={editorInstructions}
            onChange={(e) => setEditorInstructions(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-[#EF4423]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-800 mb-2 block">Reference link</label>
          <input
            type="text"
            placeholder="https://"
            value={editorReference}
            onChange={(e) => setEditorReference(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#EF4423]"
          />
        </div>

        <button className="w-full border border-dashed border-[#EF4423] text-[#EF4423] rounded-xl p-4 text-sm font-bold flex items-center justify-center gap-2 bg-[#FFF6F5]">
          + upload files
        </button>
      </div>
    </div>
  );

  const renderBudgetForm = () => (
    <div className="mt-12 flex flex-col items-center">
      <h3 className="font-bold text-lg mb-1">{partnerType === "Editors" ? "Editor" : "Partners"}</h3>
      <p className="text-xs text-gray-400 mb-8">Enter your amount</p>
      
      <div className="w-full">
        <label className="text-xs text-gray-500 mb-2 block">₹500</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Your quote (₹1000)"
            value={quoteAmount}
            onChange={(e) => setQuoteAmount(e.target.value)}
            className="w-full border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-[#EF4423]"
          />
        </div>
      </div>
    </div>
  );



  return (
    <div className="min-h-screen bg-white font-sans flex flex-col pb-24">
      {/* Header */}
      <div className="pt-4 px-5 pb-2 bg-white flex justify-center sticky top-0 z-20 relative">
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)} 
            className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#FFF6F5] text-[#EF4423] rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <Logo showText={true} />
      </div>

      <div className="px-5 mt-4 space-y-6">
        
        {/* Only show tabs if we are on step 1 */}
        {step === 1 && (
          <>
            {/* Main Tabs (Our Experts | Partners) */}
            <div className="flex bg-white rounded-[16px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-1 border border-gray-100">
              {["Our Experts", "Partners"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMainTab(tab)}
                  className={`flex-1 py-3 rounded-[12px] text-[14px] font-bold transition-colors ${
                    mainTab === tab 
                    ? "bg-[#EF4423] text-white shadow-sm" 
                    : "text-gray-400 hover:text-gray-600 bg-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sub Tabs (Cameraman | Editors) */}
            {mainTab === "Partners" && (
              <div className="flex bg-white rounded-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-1 border border-gray-50">
                {["Cameraman", "Editors"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPartnerType(tab)}
                    className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-colors ${
                      partnerType === tab 
                      ? "bg-[#EF4423] text-white shadow-sm" 
                      : "text-gray-400 hover:text-gray-600 bg-transparent"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {/* Mode Tabs (Instant | Schedule | Work Schedule) */}
            {mainTab === "Partners" && partnerType === "Cameraman" && (
              <div className="flex bg-white rounded-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-1 border border-gray-50">
                {["Instant", "Schedule", "Work Schedule"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setBookingMode(tab)}
                    className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-colors ${
                      bookingMode === tab 
                      ? "bg-[#EF4423] text-white shadow-sm" 
                      : "text-gray-400 hover:text-gray-600 bg-transparent"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Content based on Step & Tab */}
        {mainTab === "Our Experts" && renderOurExperts()}
        {mainTab === "Partners" && (
          <>
            {step === 1 && (partnerType === "Cameraman" && bookingMode === "Schedule" ? renderScheduleForm() : renderList())}
                
            {step === 2 && partnerType === "Editors" && renderEditorForm()}
                
            {step === 3 && renderBudgetForm()}
          </>
        )}
      </div>

      {/* Action Button (Sticky to bottom above nav) */}
      {(!(mainTab === "Our Experts") && bookingMode !== "Work Schedule") && (
        <div className="fixed bottom-[80px] left-0 w-full px-5 z-40">
          <div className="max-w-md mx-auto">
            <button 
              onClick={handleNextOrBook}
              className="w-full bg-[#EF4423] hover:bg-[#EF4423]/90 text-white rounded-[14px] h-[52px] text-[15px] font-bold shadow-[0_4px_15px_rgba(255,77,45,0.4)] transition-all active:scale-[0.98]"
            >
              {step === 1 && partnerType === "Editors" ? "NEXT" : (step === 2 && partnerType === "Editors" ? "NEXT" : "BOOK NOW")}
            </button>
          </div>
        </div>
      )}

      {/* Partner Popup / Bottom Sheet */}
      {showPartnerSheet && selectedPartner && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 z-[100] transition-opacity" 
            onClick={() => setShowPartnerSheet(false)}
          />
          <div className="fixed bottom-0 left-0 w-full bg-white rounded-t-[24px] z-[110] p-6 pb-10 shadow-xl transform transition-transform overflow-y-auto max-h-[85vh]">
            <button 
              onClick={() => setShowPartnerSheet(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center mt-2">
              <div 
                className="w-20 h-20 rounded-[18px] bg-cover bg-center mb-4 border border-gray-100 shadow-sm"
                style={{ backgroundImage: `url(${selectedPartner.image})` }}
              />
              <h3 className="text-[18px] font-bold text-gray-900 flex items-center gap-1.5">
                {selectedPartner.name}
                {selectedPartner.isVerified && (
                  <div className="w-4 h-4 bg-[#EF4423] text-white flex items-center justify-center rounded-sm mask mask-hexagon" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                )}
              </h3>
              <p className="text-[13px] text-gray-500 font-medium capitalize mt-1">{selectedPartner.type}</p>
              
              <div className="flex items-center gap-1 mt-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={`w-4 h-4 ${star <= Math.floor(selectedPartner.rating) ? 'text-[#FFD700]' : 'text-gray-200'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-[12px] text-gray-400 ml-1">({selectedPartner.reviews} reviews)</span>
              </div>
              
              {selectedPartner.bio && (
                <p className="text-sm text-gray-600 text-center mb-6 line-clamp-3 px-2">
                  {selectedPartner.bio}
                </p>
              )}
            </div>

            <div className="mb-6">
              {bookingMode === "Instant" ? (
                <div className="flex items-center gap-2 p-3 bg-[#E8F8EE] rounded-xl text-[#2ECC71] justify-center border border-[#2ECC71]/20">
                  <div className="w-2.5 h-2.5 bg-[#2ECC71] rounded-full animate-pulse" />
                  <span className="font-bold text-sm">Instantly Available</span>
                </div>
              ) : (
                <>
                  <h4 className="text-[14px] font-bold text-gray-900 mb-3">Select Date & Time</h4>
                  <div className="mb-4">
                    <input 
                      type="date"
                      value={selectedScheduleDate}
                      onChange={(e) => {
                        setSelectedScheduleDate(e.target.value);
                        setSelectedSlot(null);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4423]/20 focus:border-[#EF4423]"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  {(() => {
                    if (!selectedScheduleDate) return <p className="text-sm text-gray-500 text-center py-2">Please select a date to view slots.</p>;
                    
                    const dayOfWeek = new Date(selectedScheduleDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                    const datesSlots = selectedPartner.availableDates?.[selectedScheduleDate];
                    const daysSlots = selectedPartner.availableDays?.[dayOfWeek];
                    const slots = datesSlots || daysSlots || [];

                    if (slots.length === 0) return <p className="text-sm text-gray-500 text-center py-2">No slots available on this date.</p>;

                    return (
                      <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                        {slots.map((slot: string) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-2 text-[12px] font-bold rounded-xl border transition-all ${
                              selectedSlot === slot
                              ? "bg-[#FFF6F5] border-[#EF4423] text-[#EF4423]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
            
            <button 
              onClick={() => {
                if (bookingMode === "Schedule" && !selectedSlot) {
                  alert("Please select a time slot");
                  return;
                }
                setShowPartnerSheet(false);
                // The main flow uses `selectedPartnerId` which is already set. 
                // We proceed to booking automatically.
                if (partnerType === "Cameraman" && bookingMode === "Instant") {
                  setStep(3);
                } else {
                  setStep(2);
                }
              }}
              className="w-full bg-[#EF4423] text-white rounded-[14px] h-[52px] text-[15px] font-bold shadow-[0_4px_15px_rgba(255,77,45,0.4)]"
            >
              PROCEED TO BOOK
            </button>
          </div>
        </>
      )}

      {step === 1 && <BottomNav />}
    </div>
  );
}
