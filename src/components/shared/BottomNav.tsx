'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, Wallet, Wand2 } from 'lucide-react';

const CampaignIcon = (props: React.SVGProps<SVGSVGElement>) => (
 <svg
 xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth={props.strokeWidth || 2}
 strokeLinecap="round"
 strokeLinejoin="round"
 width={props.size || 24}
 height={props.size || 24}
 className={props.className}
 {...props}
 >
 {/* Top Left: Circle */}
 <circle cx="7.5" cy="7.5" r="3.5" />
 
 {/* Top Right: Triangle */}
 <path d="M16.5 3.5 L20.5 10.5 H12.5 Z" />
 
 {/* Bottom Left: Sparkle / 4-point star */}
 <path d="M7.5 12.5 Q7.5 16.5 11.5 16.5 Q7.5 16.5 7.5 20.5 Q7.5 16.5 3.5 16.5 Q7.5 16.5 7.5 12.5 Z" />
 
 {/* Bottom Right: Square */}
 <rect x="13.5" y="13.5" width="6" height="6" rx="1" />
 </svg>
);

interface BottomNavProps {
 profilePic?: string;
}

export default function BottomNav({ profilePic = '/profile_pic.png' }: BottomNavProps) {
 const router = useRouter();
 const pathname = usePathname();

 const navItems = [
 { name: 'Home', path: '/creator', icon: Home },
 { name: 'Wallet', path: '/wallet', icon: Wallet },
 { name: 'Campaign', path: '/categories', icon: CampaignIcon },
 { name: 'AI', path: '/studio', icon: Wand2 },
 ];

 return (
 <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-between items-center px-6 py-4 z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
 {navItems.map((item) => {
 const Icon = item.icon;
 const isActive = pathname === item.path;
 return (
 <div 
 key={item.name}
 className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isActive ? 'text-[#EF4823]' : 'text-gray-400 hover:text-gray-600'}`}
 onClick={() => router.push(item.path)}
 >
 {isActive ? (
 <div className="bg-[#EF4823]/10 p-3 rounded-2xl">
 <Icon size={24} strokeWidth={2.5} className="text-[#EF4823]" />
 </div>
 ) : (
 <Icon size={24} strokeWidth={2} />
 )}
 </div>
 );
 })}
 
 <div 
        className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${pathname.startsWith('/profile') ? 'ring-2 ring-offset-2 ring-[#EF4823] rounded-full' : ''}`}
        onClick={() => router.push('/profile')}
      >
 <Image 
 src={profilePic || '/profile_pic.png'} 
 alt="Profile" 
 width={40}
 height={40}
 className="w-10 h-10 rounded-full object-cover border border-gray-200" 
 />
 </div>
 </nav>
 );
}
