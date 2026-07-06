import React from "react"
import { Logo } from "@/components/ui/Logo"

export default function DashboardPage() {
 return (
 <div className="w-full max-w-md mx-auto min-h-screen bg-[#F9FAFB] flex flex-col items-center p-8">
 <div className="w-full max-w-4xl bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
 <div className="p-4 mb-6">
 <Logo large={false} showText={true} />
 </div>
 
 <h1 className="text-3xl font-bold text-text-dark mb-4">Welcome to Dashboard</h1>
 <p className="text-text-light text-center ">
 You have successfully completed the authentication flow. This is the protected dashboard area.
 </p>
 </div>
 </div>
 )
}
