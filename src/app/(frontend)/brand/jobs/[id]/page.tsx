"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle } from "lucide-react";

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/studios/jobs?role=brand`);
        const data = await res.json();
        if (data.success && data.jobs) {
          const found = data.jobs.find((j: any) => j.id === id);
          if (found) setJob(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  const handleAccept = async (applicationId: string) => {
    try {
      const res = await fetch(`/api/studios/jobs/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId })
      });
      const data = await res.json();
      if (data.success) {
        alert("Application accepted! Booking created. Redirecting to tracker...");
        router.push(`/brand/jobs/tracker/${id}`);
      } else {
        alert(data.error || "Failed to accept");
      }
    } catch (err) {
      alert("Error accepting application");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this work schedule?")) return;
    try {
      const res = await fetch(`/api/studios/jobs/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        alert("Job deleted successfully");
        router.back();
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      alert("Error deleting job");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading job...</div>;
  }

  if (!job) {
    return <div className="p-8 text-center text-gray-500">Job not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <div className="bg-white px-5 pt-6 pb-4 flex items-center justify-between shadow-sm relative z-10 shrink-0">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="mr-3 text-gray-800">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#1a1a2e] leading-tight">Job Applicants</h1>
            <p className="text-[11px] text-gray-400 font-medium">{job.partnerType} • {job.date}</p>
          </div>
        </div>
        {job.status === "open" && (
          <button 
            onClick={handleDelete}
            className="text-red-500 text-[12px] font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
          >
            DELETE
          </button>
        )}
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-50">
          <h2 className="text-[15px] font-bold text-gray-800 mb-2">Job Details</h2>
          <div className="text-[13px] text-gray-600 space-y-1">
            <p><strong>Time:</strong> {job.timeSlot}</p>
            <p><strong>Duration:</strong> {job.duration}</p>
            <p><strong>Location:</strong> {job.location || "Any"}</p>
            <p><strong>Brief:</strong> {job.contentBrief || "None"}</p>
            <p><strong>Status:</strong> {job.status}</p>
          </div>
        </div>

        <h3 className="font-extrabold text-gray-900 mb-4 text-[16px]">Applicants ({job.applications?.length || 0})</h3>

        {job.applications?.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-50">
            <p className="text-gray-500 text-[13px]">No applicants yet. Partners will see your job in their Job Board.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {job.applications?.map((app: any) => (
              <div key={app.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {app.partner?.profilePic ? (
                      <img src={app.partner.profilePic} alt={app.partner.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 font-bold text-lg">{app.partner?.fullName?.charAt(0) || "P"}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[15px] font-bold text-gray-900">{app.partner?.fullName}</h4>
                    <p className="text-[12px] text-gray-500">⭐ {app.partner?.rating || "New"} • {app.partner?.reviews || 0} reviews</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-3 text-[13px] text-gray-700">
                  <p><strong>Quote:</strong> {app.quoteAmount ? `₹${app.quoteAmount}` : 'Not provided'}</p>
                  {app.coverLetter && <p className="mt-1"><strong>Note:</strong> {app.coverLetter}</p>}
                </div>

                {app.status === "pending" && job.status === "open" ? (
                  <button 
                    onClick={() => handleAccept(app.id)}
                    className="w-full mt-2 bg-[#EF4423] text-white font-bold py-2.5 rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)] hover:bg-[#d63f1c] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    ACCEPT & BOOK
                  </button>
                ) : app.status === "accepted" ? (
                  <button 
                    onClick={() => router.push(`/brand/jobs/tracker/${job.id}`)}
                    className="w-full mt-2 bg-[#1a1a2e] text-white font-bold py-2.5 rounded-xl shadow-[0_4px_12px_rgba(26,26,46,0.2)] hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    VIEW TRACKER
                  </button>
                ) : (
                  <div className="w-full mt-2 py-2.5 bg-gray-50 text-gray-400 text-[12px] font-bold rounded-xl text-center border border-gray-100 uppercase tracking-wide">
                    {app.status === "rejected" ? "REJECTED" : "APPLIED"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
