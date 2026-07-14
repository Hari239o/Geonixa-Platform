"use client"
import React from "react"
import { Users, ShieldCheck, AlertTriangle, FileText, Megaphone, DollarSign } from "lucide-react"

export default function AdminDashboard() {
  const topMetrics = [
    { title: "Total Users", value: "12,345", subtitle: "+5.2% from last month", icon: Users, color: "bg-white", iconColor: "text-gray-400" },
    { title: "Pending Verifications", value: "42", subtitle: "+15 since last hour", icon: ShieldCheck, color: "bg-white", iconColor: "text-gray-400" },
    { title: "Open Disputes", value: "3", subtitle: "1 resolved today", icon: AlertTriangle, color: "bg-white", iconColor: "text-gray-400", titleColor: "text-red-500", valColor: "text-red-500" },
    { title: "Content in Review", value: "128", subtitle: "87 approved today", icon: FileText, color: "bg-white", iconColor: "text-gray-400" },
  ]

  const recentActivity = [
    { id: 1, title: 'New campaign "Summer Sale" launched.', time: "2 minutes ago", icon: Megaphone, bg: "bg-orange-50", color: "text-orange-500" },
    { id: 2, title: "Payout of $2,500 processed for user #4521.", time: "15 minutes ago", icon: DollarSign, bg: "bg-orange-50", color: "text-orange-500" },
    { id: 3, title: "User Jane Doe just signed up.", time: "30 minutes ago", icon: Users, bg: "bg-gray-100", color: "text-gray-500" },
    { id: 4, title: "Dispute #892 was resolved.", time: "1 hour ago", icon: AlertTriangle, bg: "bg-orange-50", color: "text-orange-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topMetrics.map((m, i) => {
          const Icon = m.icon
          return (
            <div key={i} className={`${m.color} p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100/50`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className={`text-[13px] font-bold ${m.titleColor || 'text-gray-500'}`}>{m.title}</h3>
                <Icon className={`w-5 h-5 ${m.iconColor}`} />
              </div>
              <p className={`text-3xl font-extrabold mb-1 tracking-tight ${m.valColor || 'text-gray-900'}`}>{m.value}</p>
              <p className="text-[11px] text-gray-400">{m.subtitle}</p>
            </div>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100/50 p-6 lg:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">New Users Overview</h2>
          <p className="text-[13px] text-gray-400 mb-8">Showing new user sign-ups for the last 6 months.</p>
          
          {/* Mock Chart */}
          <div className="flex items-end h-[200px] lg:h-[280px] gap-2 sm:gap-4 lg:gap-8 mt-10">
            {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].map((month, i) => {
              const height = [40, 60, 30, 80, 100, 50][i]
              const isHigh = i === 4
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2 lg:gap-4 group">
                  <div className={`w-full rounded-t-lg lg:rounded-t-xl transition-all duration-300 ${isHigh ? 'bg-[#EF4423]' : 'bg-[#F1F3F5] group-hover:bg-[#E5E7EB]'}`} style={{ height: `${height}%` }}></div>
                  <span className="text-[10px] lg:text-[12px] font-medium text-gray-400">{month}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100/50 p-6 lg:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-8">Recent Activity</h2>
          
          <div className="space-y-8">
            {recentActivity.map((activity, i) => {
              const Icon = activity.icon
              return (
                <div key={i} className="flex gap-4 items-start">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${activity.bg}`}>
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="mt-1">
                    <p className="text-[14px] font-medium text-gray-800 leading-snug">{activity.title}</p>
                    <p className="text-[12px] text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
