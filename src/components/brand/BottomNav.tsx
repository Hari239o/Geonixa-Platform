"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, LayoutGrid, Wand2, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/brand", icon: Home },
    { name: "Wallet", href: "/brand/wallet", icon: Wallet },
    { name: "Dashboard", href: "/brand/dashboard", icon: LayoutGrid },
    { name: "Magic", href: "/brand/magic", icon: Wand2 },
    { name: "Profile", href: "/brand", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Profile active state can be tricky if both home and profile go to /brand
          const isActive = pathname === item.href && (item.name === "Profile" ? true : false); // Adjust based on actual routes later
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group ${
                isActive ? "text-[#EF4823]" : "text-gray-400"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "text-[#EF4823]" : "text-gray-400 group-hover:text-[#EF4823] transition-colors"}`} strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
