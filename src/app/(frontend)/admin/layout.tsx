"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ShieldCheck, AlertTriangle, FileText, Megaphone, DollarSign, Search, Bell, Settings, Menu, X } from 'lucide-react'
import BottomNav from '@/components/admin/BottomNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Verification', href: '/admin/verification', icon: ShieldCheck },
    { name: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
    { name: 'Content', href: '/admin/content', icon: FileText },
    { name: 'Campaigns', href: '/admin/campaigns', icon: Megaphone },
    { name: 'Finance', href: '/admin/finance', icon: DollarSign },
  ]

  const SidebarContent = () => (
    <>
      <div className="p-6 lg:p-8 pb-8 lg:pb-10 flex items-center justify-between">
        <img src="/logo.png" alt="Kalinq" className="h-7 object-contain" />
        <button 
          className="lg:hidden text-gray-500 hover:text-gray-900"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin')
          const Icon = item.icon
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
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
    </>
  )

  return (
    <div className="flex h-[100dvh] bg-[#F8F9FA] font-sans overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-[260px] bg-white border-r border-gray-100 flex-col flex-shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-[260px] bg-white border-r border-gray-100 flex flex-col z-50 transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative w-full">
        {/* Topbar */}
        <header className="h-16 lg:h-24 bg-white/80 backdrop-blur-md border-b border-gray-100/50 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-20">
          
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* Search bar - Hidden on mobile, shown on lg */}
            <div className="hidden lg:block relative w-[400px]">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-100 rounded-2xl text-[14px] focus:outline-none focus:border-[#EF4423] focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>
          
          {/* Right actions */}
          <div className="flex items-center gap-3 lg:gap-6">
            <button className="hidden lg:flex text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 w-11 h-11 rounded-full items-center justify-center border border-gray-100">
              <Settings className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-700 transition-colors relative bg-gray-50 w-9 h-9 lg:w-11 lg:h-11 rounded-full flex items-center justify-center border border-gray-100">
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              <div className="absolute top-2 right-2 lg:top-3 lg:right-3 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            </button>
            <div className="flex items-center gap-2 lg:gap-3 pl-3 lg:pl-6 border-l border-gray-100 ml-1 lg:ml-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[13px] lg:text-[14px] font-bold text-gray-800">Admin Kalinq</span>
                <span className="text-[11px] lg:text-[12px] text-gray-500">admin@kalinq.com</span>
              </div>
              <img src="/placeholder.png" alt="Admin" className="w-8 h-8 lg:w-11 lg:h-11 rounded-full border-2 border-gray-100 object-cover ml-1 shadow-sm" />
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-10 bg-[#f8f9fc] pb-24 lg:pb-10">
          {children}
        </main>
      </div>
      
      <BottomNav />
    </div>
  )
}
