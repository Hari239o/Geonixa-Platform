"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Video, Briefcase, Calendar, User, Wallet } from "lucide-react";

export default function BottomNav() {
 const pathname = usePathname();

 const navItems = [
 { name: "Home", href: "/creator", icon: Home },
 { name: "Studio", href: "/ai", icon: Video },
 { name: "Portfolio", href: "/portfolio", icon: Briefcase },
 { name: "Booking", href: "/booking", icon: Calendar },
 { name: "Profile", href: "/profile", icon: User },
 ];

 return (
 <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-lg">
 <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
 {navItems.map((item) => {
 const Icon = item.icon;
 const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
 
 return (
 <Link 
 key={item.name} 
 href={item.href}
 className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group ${
 isActive ? "text-primary-red" : "text-gray-500"
 }`}
 >
 <Icon className={`w-6 h-6 mb-1 ${isActive ? "text-primary-red" : "text-gray-500 group-hover:text-primary-red"}`} />
 <span className="text-[10px] sm:text-xs">{item.name}</span>
 </Link>
 );
 })}
 </div>
 </div>
 );
}
