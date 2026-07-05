"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Wand2, Bell, CheckCircle } from "lucide-react"
import BottomNav from "@/components/brand/BottomNav"
import { useKnockFeed } from "@knocklabs/react"

export default function BrandNotificationsPage() {
  const router = useRouter()
  
  // Use Knock's headless UI hooks
  const { feedClient, useFeedStore } = useKnockFeed()
  const { items, metadata } = useFeedStore()
  
  // Fetch the feed when the component mounts
  useEffect(() => {
    feedClient.fetch()
  }, [feedClient])

  // Helper to format time (in a real app you'd use date-fns or similar)
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHrs < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return `${diffMins} min ago`
    }
    if (diffHrs < 24) return `${diffHrs} hours ago`
    return `${Math.floor(diffHrs / 24)} days ago`
  }

  return (
    <div className="h-full bg-[#F8F9FA] font-sans flex justify-center overflow-hidden">
      <div className="w-full w-full bg-white h-full relative shadow-sm flex flex-col overflow-hidden">
        
        {/* Header with Back Button */}
        <div className="pt-5 px-5 pb-6 shrink-0 z-20 bg-white flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-[#FEF5ED] rounded-[12px] flex items-center justify-center text-[#EF4823] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          
          <h1 className="text-[#1E1B4B] font-extrabold text-[18px]">Notifications {metadata.unread_count > 0 && <span className="bg-[#EF4823] text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{metadata.unread_count}</span>}</h1>
          
          <button 
            onClick={() => feedClient.markAllAsRead()}
            className="text-[#EF4823] text-[11px] font-bold tracking-wide hover:underline disabled:opacity-50"
            disabled={metadata.unread_count === 0}
          >
            Read all
          </button>
        </div>

        {/* Content Area - Scrollable List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32 touch-pan-y flex flex-col gap-4 relative">
          
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-20">
              <Bell className="w-12 h-12 mb-4 text-gray-200" />
              <p className="text-sm font-medium">No notifications yet.</p>
            </div>
          ) : (
            items.map((notif: any) => (
              <div 
                key={notif.id} 
                onClick={() => {
                  if (!notif.read_at) feedClient.markAsRead(notif);
                  // In a real app, you might also router.push(notif.data.actionUrl)
                }}
                className={`bg-white rounded-[20px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border transition-all cursor-pointer ${
                  !notif.read_at ? "border-orange-200 bg-orange-50/30" : "border-gray-50"
                } flex flex-col gap-3`}
              >
                
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                  notif.blocks[0]?.name === "success" ? "bg-emerald-500" : "bg-[#0095FF]"
                }`}>
                  {notif.blocks[0]?.name === "success" ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Wand2 className="w-5 h-5 text-white" />
                  )}
                </div>
                
                <div 
                  className="text-[12px] text-gray-600 leading-snug pr-2 knock-content"
                  dangerouslySetInnerHTML={{ __html: notif.blocks[0]?.rendered || notif.data?.message || "You have a new notification!" }}
                />
                
                <div className="flex justify-between items-end mt-1">
                  <button className="bg-[#EF4823] text-white font-bold text-[13px] px-6 py-2 rounded-lg shadow-sm hover:bg-[#e03d1b] transition-colors">
                    {notif.data?.actionLabel || "View Details"}
                  </button>
                  <span className="text-gray-400 text-[10px] font-medium mb-1">
                    {formatTime(notif.inserted_at)}
                  </span>
                </div>

              </div>
            ))
          )}

        </div>
        
        <BottomNav />
      </div>
    </div>
  )
}
