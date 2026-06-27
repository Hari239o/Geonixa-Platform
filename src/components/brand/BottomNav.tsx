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
    <div className="fixed bottom-4 left-4 right-4 z-[100] h-16 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-[32px] border border-gray-100/50">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium px-2">
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
              className={`inline-flex flex-col items-center justify-center hover:bg-gray-50/50 group rounded-2xl mx-1 my-1 ${
                isActive ? "text-[#EF4823]" : "text-gray-400"
              }`}
            >
              {isCustomImage ? (
                <div 
                  className={`w-[22px] h-[22px] transition-colors ${isActive ? "bg-[#EF4823]" : "bg-gray-400 group-hover:bg-[#EF4823]"}`}
                  style={{
                    WebkitMaskImage: `url(${item.icon})`,
                    WebkitMaskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskImage: `url(${item.icon})`,
                    maskSize: "contain",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                  }}
                />
              ) : (
                <item.icon 
                  className={`w-[22px] h-[22px] transition-colors ${isActive ? "text-[#EF4823]" : "text-gray-400 group-hover:text-[#EF4823]"}`} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
