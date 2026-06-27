"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, LayoutGrid, Wand2, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const [profileUrl, setProfileUrl] = React.useState("/brand/profile");

  React.useEffect(() => {
    const type = localStorage.getItem("brandType");
    if (type === "company") {
      setProfileUrl("/brand/company");
    }
  }, []);

  const navItems = [
    { name: "Home", href: "/brand", icon: Home },
    { name: "Wallet", href: "/brand/wallet", icon: Wallet },
    { name: "Campaigns", href: "/brand/campaigns", icon: LayoutGrid },
    { name: "Magic", href: "/brand/magic", icon: Wand2 },
    { name: "Profile", href: profileUrl, icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Home should only be active if EXACT match, profile active if starts with /brand/profile or /brand/company
          let isActive = pathname === item.href;
          if (item.name === "Profile") {
            isActive = pathname.includes("/brand/profile") || pathname.includes("/brand/company");
          }
          if (item.name === "Home") {
            isActive = pathname === "/brand";
          }
          
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
