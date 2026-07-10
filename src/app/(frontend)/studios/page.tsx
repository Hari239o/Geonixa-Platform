"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/brand/BottomNav";
import { Logo } from "@/components/ui/Logo";

export default function StudiosPage() {
  const router = useRouter();
  
  // Tabs state
  const [mainTab, setMainTab] = useState("Partners"); // "Our Experts" | "Partners"
  const [partnerType, setPartnerType] = useState("Cameraman"); // "Cameraman" | "Editors"
  const [bookingMode, setBookingMode] = useState("Instant"); // "Instant" | "Schedule"
  
  const [partners, setPartners] = useState<any[]>([]);
  const [kalakaars, setKalakaars] = useState<any[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for initial development (can be replaced by real API)
  const mockPartners = [
    { id: "1", name: "Studio XYZ", isVerified: true, rating: 4, reviews: 10, type: "Cameraman", image: "/placeholder-user.jpg" },
    { id: "2", name: "Cine Lenses", isVerified: true, rating: 4.5, reviews: 20, type: "Cameraman", image: "/placeholder-user.jpg" },
  ];

  const mockKalakaars = [
    { id: "mock-k-1", name: "Aarav Sharma", isVerified: true, rating: 4.9, reviews: 150, type: "Kalakaar", image: "/placeholder-user.jpg" },
    { id: "mock-k-2", name: "Priya Singh", isVerified: true, rating: 4.8, reviews: 120, type: "Kalakaar", image: "/placeholder-user.jpg" },
  ];

  useEffect(() => {
    async function fetchPartners() {
      setIsLoading(true);
      if (mainTab === "Our Experts") {
        setKalakaars(mockKalakaars); // Future: Fetch from /api/kalakaars/list
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`/api/studios/partners?type=${partnerType}`);
        const data = await res.json();
        if (data.success) {
          setPartners(data.partners);
        } else {
          setPartners(mockPartners);
        }
      } catch (e) {
        setPartners(mockPartners);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPartners();
  }, [partnerType, mainTab]);

  const handleBookNow = async () => {
    if (!selectedPartnerId) {
      alert("Please select someone first!");
      return;
    }
    
    if (mainTab === "Our Experts") {
      // Kalakaar Booking Flow
      try {
        const res = await fetch('/api/kalakaars/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kalakaarId: selectedPartnerId,
            bookingMode: bookingMode,
            brandId: "mock-brand-id", // To be replaced with actual session user id
          })
        });
        const data = await res.json();
        if (data.success) {
          router.push(`/studios/booking/${data.booking.id || data.bookingId}`);
        } else {
          alert("Failed to create Kalakaar booking: " + data.error);
        }
      } catch (e) {
        alert("Error initiating Kalakaar booking.");
      }
      return;
    }

    // Studio Booking Flow
    try {
      const res = await fetch('/api/studios/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: selectedPartnerId,
          bookingMode: bookingMode,
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Booking requested successfully!");
        // In the future, this will open the detailed booking form popup
      } else {
        alert("Failed to create booking: " + data.error);
      }
    } catch (e) {
      alert("Error initiating booking.");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col pb-24">
      {/* Header */}
      <div className="pt-4 px-5 pb-2 bg-white flex justify-center sticky top-0 z-20">
        <Logo showText={true} />
      </div>

      <div className="px-5 mt-4 space-y-6">
        
        {/* Main Tabs (Our Experts | Partners) */}
        <div className="flex bg-white rounded-[16px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-1 border border-gray-100">
          {["Our Experts", "Partners"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              className={`flex-1 py-3 rounded-[12px] text-[14px] font-bold transition-colors ${
                mainTab === tab 
                ? "bg-[#FF4D2D] text-white shadow-sm" 
                : "text-gray-400 hover:text-gray-600 bg-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sub Tabs (Cameraman | Editors) - Only if Partners is selected */}
        {mainTab === "Partners" && (
          <div className="flex bg-white rounded-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-1 border border-gray-50">
            {["Cameraman", "Editors"].map((tab) => (
              <button
                key={tab}
                onClick={() => setPartnerType(tab)}
                className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-colors ${
                  partnerType === tab 
                  ? "bg-[#FF4D2D] text-white shadow-sm" 
                  : "text-gray-400 hover:text-gray-600 bg-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Mode Tabs (Instant | Schedule) - Shows for both Experts and Partners (if Cameraman/Editor) */}
        {(mainTab === "Our Experts" || mainTab === "Partners") && (
          <div className="flex bg-white rounded-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-1 border border-gray-50">
            {["Instant", "Schedule"].map((tab) => (
              <button
                key={tab}
                onClick={() => setBookingMode(tab)}
                className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-colors ${
                  bookingMode === tab 
                  ? "bg-[#FF4D2D] text-white shadow-sm" 
                  : "text-gray-400 hover:text-gray-600 bg-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* List of Profiles */}
        <div className="flex flex-col gap-3 mt-4">
          {(mainTab === "Our Experts" ? kalakaars : partners).map((partner) => {
            const isSelected = selectedPartnerId === partner.id;
            
            return (
              <div 
                key={partner.id}
                onClick={() => setSelectedPartnerId(partner.id)}
                className={`flex items-center justify-between p-3 rounded-[16px] transition-all cursor-pointer border ${
                  isSelected 
                  ? "border-[#FF4D2D] shadow-[0_4px_15px_rgba(255,77,45,0.1)] bg-white" 
                  : "border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                }`}
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
                        <div className="w-3.5 h-3.5 bg-[#FF4D2D] text-white flex items-center justify-center rounded-sm mask mask-hexagon" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
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
                
                {/* Radio Button */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition-colors ${
                  isSelected ? "border-[#FF4D2D]" : "border-gray-300"
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D2D]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Book Now Button (Sticky to bottom above nav) */}
      <div className="fixed bottom-[80px] left-0 w-full px-5 z-40">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleBookNow}
            className="w-full bg-[#FF4D2D] hover:bg-[#FF4D2D]/90 text-white rounded-[14px] h-[52px] text-[15px] font-bold shadow-[0_4px_15px_rgba(255,77,45,0.4)] transition-all active:scale-[0.98]"
          >
            BOOK NOW
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
