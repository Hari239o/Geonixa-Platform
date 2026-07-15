"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, CheckCircle, Clock } from "lucide-react"

export default function JobTrackingPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [job, setJob] = useState<any>(null)
  const [booking, setBooking] = useState<any>(null)
  const [partner, setPartner] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrackerInfo = async () => {
      try {
        const res = await fetch(`/api/studios/jobs/${id}/tracker`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setJob(data.job);
            if (data.confirmedApp) {
              setPartner(data.confirmedApp.partner);
            }
            if (data.booking) {
              setBooking(data.booking);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrackerInfo();
  }, [id]);

  const handleTrackerAction = async (action: string) => {
    try {
      if (!booking) return;
      const res = await fetch(`/api/studios/jobs/${id}/tracker/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, action })
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error || "Failed to complete action");
      }
    } catch (err) {
      alert("Error performing action");
    }
  };

  let workDetailsStatus = "pending";
  let agreementStatus = "pending";
  let paymentStatus = "pending";
  let workDetailsComplete = false;
  let agreementComplete = false;

  if (booking) {
    workDetailsComplete = booking.workDetailsAdminAccepted && booking.workDetailsBrandAccepted && booking.workDetailsPartnerAccepted;
    agreementComplete = booking.agreementUploadedByBrand && booking.agreementAcceptedByPartner;

    if (workDetailsComplete) {
      workDetailsStatus = "completed";
      if (agreementComplete) {
        agreementStatus = "completed";
        if (booking.status === "paid" || booking.status === "completed") {
          paymentStatus = "completed";
        } else {
          paymentStatus = "active";
        }
      } else {
        agreementStatus = "active";
      }
    } else {
      workDetailsStatus = "active";
    }
  }

  const steps = [
    { id: 1, name: "Work Created", status: "completed" },
    { id: 2, name: "Partner Confirmed", status: partner ? "completed" : "active" },
    { id: 3, name: "Work Details", status: partner ? workDetailsStatus : "pending" },
    { id: 4, name: "Agreement", status: partner ? agreementStatus : "pending" },
    { id: 5, name: "Payment", status: partner ? paymentStatus : "pending" }
  ];

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading tracker...</div>
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <div className="bg-white px-5 pt-6 pb-4 flex items-center shadow-sm relative z-10 shrink-0">
        <button onClick={() => router.back()} className="mr-3 text-gray-800">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-[17px] font-extrabold text-[#1a1a2e] leading-tight">{job?.partnerType ? `${job.partnerType} Schedule Tracker` : "Schedule Tracker"}</h1>
          <p className="text-[11px] text-gray-400 font-medium">Work Schedule</p>
        </div>
      </div>

      <div className="px-5 py-6 flex-1 overflow-y-auto pb-24">
        {/* Progress Tracker */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-[#1a1a2e] font-extrabold text-[15px] mb-6">Tracking Timeline</h2>
          <div className="relative">
            {/* Vertical Connecting Line */}
            <div className="absolute left-[11px] top-2 bottom-6 w-[2px] bg-gray-100 rounded-full" />
            
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex gap-4 mb-6 last:mb-0">
                <div className="relative z-10 bg-white py-1">
                  {step.status === "completed" ? (
                    <div className="w-6 h-6 rounded-full bg-[#2ECC71] flex items-center justify-center shadow-md">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : step.status === "active" ? (
                    <div className="w-6 h-6 rounded-full bg-[#EF4423] flex items-center justify-center shadow-md ring-4 ring-orange-50">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className={`text-[14px] font-bold ${
                    step.status === "completed" ? "text-gray-900" :
                    step.status === "active" ? "text-[#EF4423]" : "text-gray-400"
                  }`}>
                    {step.name}
                  </h3>
                  {step.status === "active" && step.id === 3 && !booking?.workDetailsBrandAccepted && (
                    <button 
                      onClick={() => handleTrackerAction("ACCEPT_WORK_DETAILS")}
                      className="mt-2 text-[11px] font-bold bg-[#EF4423] text-white px-3 py-1.5 rounded-lg"
                    >
                      ACCEPT WORK DETAILS
                    </button>
                  )}
                  {step.status === "active" && step.id === 3 && booking?.workDetailsBrandAccepted && (
                    <p className="mt-2 text-[11px] font-medium text-gray-500">Waiting for Partner and Admin to accept...</p>
                  )}

                  {step.status === "active" && step.id === 4 && !booking?.agreementUploadedByBrand && (
                    <button 
                      onClick={() => handleTrackerAction("UPLOAD_AGREEMENT")}
                      className="mt-2 text-[11px] font-bold bg-[#EF4423] text-white px-3 py-1.5 rounded-lg"
                    >
                      UPLOAD AGREEMENT
                    </button>
                  )}
                  {step.status === "active" && step.id === 4 && booking?.agreementUploadedByBrand && (
                    <p className="mt-2 text-[11px] font-medium text-gray-500">Waiting for Partner to accept agreement...</p>
                  )}

                  {step.status === "active" && step.id === 5 && (
                    <button 
                      onClick={() => router.push('/brand/wallet')}
                      className="mt-2 text-[11px] font-bold bg-[#EF4423] text-white px-3 py-1.5 rounded-lg"
                    >
                      PROCEED TO PAYMENT
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Info */}
        {partner && (
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
            <h3 className="text-gray-900 font-extrabold text-[15px] mb-4">Confirmed Partner</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[14px] bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {partner.profilePic ? (
                  <img src={partner.profilePic} alt={partner.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 font-bold">{partner.fullName?.charAt(0) || "P"}</span>
                )}
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900">{partner.fullName || "Partner"}</h4>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
