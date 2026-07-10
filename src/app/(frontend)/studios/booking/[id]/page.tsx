"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle, XCircle, Navigation, Video, Check, Receipt } from "lucide-react";

export default function BookingStatusPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("02:00:00");
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/kalakaars/booking/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setBooking(data.booking);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // In a real app, you would set up a websocket or polling here
    const interval = setInterval(fetchBooking, 10000); // Poll every 10s for demo
    return () => clearInterval(interval);
  }, [params.id]);

  useEffect(() => {
    if (!booking?.expiresAt || booking.status !== "PENDING") return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(booking.expiresAt).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("EXPIRED");
        updateStatus("EXPIRED");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`0${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  const updateStatus = async (newStatus: string, reason?: string) => {
    try {
      const res = await fetch('/api/kalakaars/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: params.id,
          status: newStatus,
          declineReason: reason
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchBooking();
        setShowDeclineModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!booking) {
    return <div className="min-h-screen flex items-center justify-center">Booking not found.</div>;
  }

  // Helper to render the progressive status timeline
  const renderTimeline = () => {
    const states = [
      { id: "PENDING", label: "Requested" },
      { id: "ON_MY_WAY", label: "On the way" },
      { id: "LIVE_RECORDING", label: "Live Recording" },
      { id: "COMPLETED", label: "Completed" }
    ];

    const currentIndex = states.findIndex(s => s.id === booking.status);
    
    if (booking.status === "DECLINED" || booking.status === "EXPIRED" || booking.status === "CANCELLED") {
      return (
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col items-center justify-center py-8">
          <XCircle className="w-12 h-12 text-red-500 mb-2" />
          <p className="font-bold text-red-700 text-lg">Booking {booking.status}</p>
          {booking.declineReason && <p className="text-sm text-red-600 mt-1">Reason: {booking.declineReason}</p>}
        </div>
      );
    }

    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mt-6 relative">
        <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gray-100"></div>
        {states.map((state, index) => {
          const isCompleted = currentIndex >= index;
          const isCurrent = currentIndex === index;
          
          return (
            <div key={state.id} className="flex items-center mb-8 relative z-10 last:mb-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isCompleted ? 'bg-[#FF4D2D]' : 'bg-gray-200'}`}>
                {isCompleted && <Check className="w-4 h-4 text-white" />}
              </div>
              <div className="ml-4">
                <p className={`font-bold ${isCurrent ? 'text-black' : (isCompleted ? 'text-gray-600' : 'text-gray-400')}`}>
                  {state.label}
                </p>
                {state.id === "PENDING" && isCurrent && (
                  <p className="text-sm text-[#FF4D2D] font-medium flex items-center gap-1 mt-1">
                    <Clock className="w-3.5 h-3.5" /> Auto-expires in {timeLeft}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-24">
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center sticky top-0 z-20 shadow-sm">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold">Booking Status</h1>
      </div>

      <div className="p-5 max-w-md mx-auto">
        {/* Profile Info */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <img src={booking.kalakaar.image} alt="Kalakaar" className="w-16 h-16 rounded-[14px] object-cover bg-gray-100" />
          <div>
            <h2 className="font-bold text-lg">{booking.kalakaar.name}</h2>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <span className="bg-[#FFF4F2] text-[#FF4D2D] px-2 py-0.5 rounded-md font-medium text-xs">
                Instant Reel Booking
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {renderTimeline()}

        {/* Interactive Action Panel (For demo purposes, this shows actions for both Brand and Kalakaar to demonstrate the flow) */}
        {booking.status !== "COMPLETED" && booking.status !== "DECLINED" && booking.status !== "EXPIRED" && (
          <div className="mt-8">
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-3">Action Panel (Demo)</h3>
            <div className="flex flex-col gap-3">
              
              {booking.status === "PENDING" && (
                <>
                  <button onClick={() => updateStatus("ON_MY_WAY")} className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white rounded-[12px] h-[50px] font-bold flex items-center justify-center gap-2 transition-all">
                    <CheckCircle className="w-5 h-5" /> Accept & Start Journey
                  </button>
                  <button onClick={() => setShowDeclineModal(true)} className="w-full bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-[12px] h-[50px] font-bold flex items-center justify-center gap-2 transition-all">
                    <XCircle className="w-5 h-5" /> Decline Request
                  </button>
                </>
              )}

              {booking.status === "ON_MY_WAY" && (
                <button onClick={() => updateStatus("LIVE_RECORDING")} className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-[12px] h-[50px] font-bold flex items-center justify-center gap-2 transition-all">
                  <Video className="w-5 h-5" /> Arrived - Start Live Recording
                </button>
              )}

              {booking.status === "LIVE_RECORDING" && (
                <button onClick={() => updateStatus("COMPLETED", undefined)} className="w-full bg-[#FF4D2D] hover:bg-[#FF4D2D]/90 text-white rounded-[12px] h-[50px] font-bold flex items-center justify-center gap-2 transition-all">
                  <CheckCircle className="w-5 h-5" /> Mark Complete
                </button>
              )}

            </div>
          </div>
        )}

        {/* Completed Invoice State */}
        {booking.status === "COMPLETED" && (
          <div className="mt-6 bg-[#FEF5ED] border border-[#FBE3CC] rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <Receipt className="w-12 h-12 text-[#FF4D2D] mb-3" />
            <h3 className="font-bold text-lg text-gray-900">Invoice Generated</h3>
            <p className="text-sm text-gray-600 mt-1">The reel recording is complete. Payment has been securely processed.</p>
            <button className="mt-4 bg-white border border-[#FF4D2D] text-[#FF4D2D] font-bold py-2 px-6 rounded-full text-sm">
              View Invoice
            </button>
          </div>
        )}

      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl">
            <h3 className="font-bold text-lg mb-2">Decline Request</h3>
            <p className="text-gray-500 text-sm mb-4">Please provide a reason for declining this Instant Reel booking.</p>
            <textarea 
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#FF4D2D]"
              rows={3}
              placeholder="E.g., I am currently unavailable..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            ></textarea>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowDeclineModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-500 bg-gray-100">Cancel</button>
              <button onClick={() => updateStatus("DECLINED", declineReason)} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-500">Confirm Decline</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
