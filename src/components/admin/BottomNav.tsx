"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ShieldCheck, Megaphone, DollarSign } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Verify", href: "/admin/verification", icon: ShieldCheck },
    { name: "Campaigns", href: "/admin/campaigns", icon: Megaphone },
    { name: "Finance", href: "/admin/finance", icon: DollarSign },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-[100] w-full h-[68px] bg-white shadow-[0_-4px_25px_rgba(0,0,0,0.04)] border-t border-gray-100/50 pb-safe lg:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium px-2 pb-1">
        {navItems.map((item) => {
          let isActive = pathname === item.href;
          if (item.name !== "Dashboard" && pathname.startsWith(item.href)) {
             isActive = true;
          }

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="inline-flex flex-col items-center justify-center group"
            >
              <div className={`w-[56px] h-[56px] flex items-center justify-center rounded-[18px] transition-colors ${
                isActive ? "bg-[#FEF5ED]" : "hover:bg-gray-50/50"
              }`}>
                <item.icon 
                  className={`w-[26px] h-[26px] transition-colors ${isActive ? "text-[#EF4423]" : "text-gray-400 group-hover:text-[#EF4423]"}`} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
