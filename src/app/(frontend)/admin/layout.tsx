"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ShieldCheck, AlertTriangle, FileText, Megaphone, DollarSign, Search, Bell, Settings } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Verification', href: '/admin/verification', icon: ShieldCheck },
    { name: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
    { name: 'Content', href: '/admin/content', icon: FileText },
    { name: 'Campaigns', href: '/admin/campaigns', icon: Megaphone },
    { name: 'Finance', href: '/admin/finance', icon: DollarSign },
  ]

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      {/* Sidebar */}
      <div className="w-[260px] bg-white border-r border-gray-100 flex flex-col flex-shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 pb-10">
          <img src="/logo.png" alt="Kalinq" className="h-7 object-contain" />
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin')
            const Icon = item.icon
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[14px] font-medium transition-all relative ${isActive ? 'text-[#EF4423] bg-red-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {isActive && (
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#EF4423] rounded-r-md"></div>
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#EF4423]' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100/50 flex items-center justify-between px-10 sticky top-0 z-20">
          {/* Search bar */}
          <div className="relative w-[400px]">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-100 rounded-2xl text-[14px] focus:outline-none focus:border-[#EF4423] focus:bg-white transition-all shadow-sm"
            />
          </div>
          
          {/* Right actions */}
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 w-11 h-11 rounded-full flex items-center justify-center border border-gray-100">
              <Settings className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-700 transition-colors relative bg-gray-50 w-11 h-11 rounded-full flex items-center justify-center border border-gray-100">
              <Bell className="w-5 h-5" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100 ml-2">
              <div className="flex flex-col items-end">
                <span className="text-[14px] font-bold text-gray-800">Admin Kalinq</span>
                <span className="text-[12px] text-gray-500">admin@kalinq.com</span>
              </div>
              <img src="/placeholder.png" alt="Admin" className="w-11 h-11 rounded-full border-2 border-gray-100 object-cover ml-1 shadow-sm" />
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-auto p-10 bg-[#f8f9fc]">
          {children}
        </main>
      </div>
    </div>
  )
}
