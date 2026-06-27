"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

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
    { name: "Home", href: "/brand", icon: "/HOME.png" },
    { name: "Wallet", href: "/brand/wallet", icon: "/WALLET.png" },
    { name: "Campaigns", href: "/brand/campaigns", icon: "/CAMPAIGNS.png" },
    { name: "Experts", href: "/brand/experts", icon: "/PARTNERS.png" },
    { name: "Profile", href: profileUrl, icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-[100] w-full h-[68px] bg-white shadow-[0_-4px_25px_rgba(0,0,0,0.04)] border-t border-gray-100/50 pb-safe">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium px-2 pb-1">
        {navItems.map((item) => {
          const isCustomImage = typeof item.icon === "string";
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
              className={`inline-flex flex-col items-center justify-center group`}
            >
              <div className={`w-[48px] h-[48px] flex items-center justify-center rounded-[16px] transition-colors ${
                isActive ? "bg-[#FEF5ED]" : "hover:bg-gray-50/50"
              }`}>
                {isCustomImage ? (
                  <img 
                    src={item.icon as string}
                    alt={item.name}
                    className={`w-[32px] h-[32px] object-contain transition-all ${
                      isActive ? "" : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
                    }`}
                  />
                ) : (
                  <item.icon 
                    className={`w-[26px] h-[26px] transition-colors ${isActive ? "text-[#EF4823]" : "text-gray-400 group-hover:text-[#EF4823]"}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
